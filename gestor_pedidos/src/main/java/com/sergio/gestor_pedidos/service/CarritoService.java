package com.sergio.gestor_pedidos.service;

import com.sergio.gestor_pedidos.dto.AgregarItemDTO;
import com.sergio.gestor_pedidos.dto.CarritoResponseDTO;
import com.sergio.gestor_pedidos.exception.RecursoNoEncontradoException;
import com.sergio.gestor_pedidos.exception.ReglaDeNegocioException;
import com.sergio.gestor_pedidos.mapper.CarritoMapper;
import com.sergio.gestor_pedidos.model.*;
import com.sergio.gestor_pedidos.repository.CarritoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final ClienteService clienteService;
    private final ProductoService productoService;
    private final CarritoMapper carritoMapper;

    public CarritoResponseDTO obtenerCarritoActivo(Long clienteId) {
        Carrito carrito = obtenerOCrearCarrito(clienteId);
        return carritoMapper.toResponse(carrito);
    }

    @Transactional
    public CarritoResponseDTO agregarItem(Long clienteId, AgregarItemDTO dto) {
        Carrito carrito = obtenerOCrearCarrito(clienteId);
        Producto producto = productoService.buscarOFallar(dto.getProductoId());

        if (!producto.getActivo()) {
            throw new ReglaDeNegocioException("El producto no está disponible: " + producto.getNombre());
        }
        if (producto.getStock() < dto.getCantidad()) {
            throw new ReglaDeNegocioException(
                "Stock insuficiente. Disponible: " + producto.getStock() + ", solicitado: " + dto.getCantidad());
        }

        // Si el producto ya está en el carrito, actualizar cantidad
        Optional<CarritoItem> itemExistente = carrito.getItems().stream()
                .filter(i -> i.getProducto().getId().equals(dto.getProductoId()))
                .findFirst();

        if (itemExistente.isPresent()) {
            CarritoItem item = itemExistente.get();
            int nuevaCantidad = item.getCantidad() + dto.getCantidad();
            if (producto.getStock() < nuevaCantidad) {
                throw new ReglaDeNegocioException(
                    "Stock insuficiente. Disponible: " + producto.getStock() + ", total solicitado: " + nuevaCantidad);
            }
            item.setCantidad(nuevaCantidad);
        } else {
            CarritoItem nuevoItem = CarritoItem.builder()
                    .carrito(carrito)
                    .producto(producto)
                    .cantidad(dto.getCantidad())
                    .precioUnitario(producto.getPrecio())
                    .build();
            carrito.getItems().add(nuevoItem);
        }

        return carritoMapper.toResponse(carritoRepository.save(carrito));
    }

    @Transactional
    public CarritoResponseDTO actualizarCantidad(Long clienteId, Long itemId, Integer cantidad) {
        Carrito carrito = obtenerOCrearCarrito(clienteId);

        CarritoItem item = carrito.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RecursoNoEncontradoException("Item no encontrado en el carrito"));

        if (cantidad <= 0) {
            carrito.getItems().remove(item);
        } else {
            if (item.getProducto().getStock() < cantidad) {
                throw new ReglaDeNegocioException("Stock insuficiente. Disponible: " + item.getProducto().getStock());
            }
            item.setCantidad(cantidad);
        }

        return carritoMapper.toResponse(carritoRepository.save(carrito));
    }

    @Transactional
    public CarritoResponseDTO eliminarItem(Long clienteId, Long itemId) {
        Carrito carrito = obtenerOCrearCarrito(clienteId);
        carrito.getItems().removeIf(i -> i.getId().equals(itemId));
        return carritoMapper.toResponse(carritoRepository.save(carrito));
    }

    @Transactional
    public void vaciarCarrito(Long clienteId) {
        Carrito carrito = obtenerOCrearCarrito(clienteId);
        carrito.getItems().clear();
        carritoRepository.save(carrito);
    }

    public List<CarritoResponseDTO> historialPorCliente(Long clienteId) {
        return carritoRepository.findByClienteId(clienteId).stream()
                .map(carritoMapper::toResponse).toList();
    }

    @Transactional
    public Carrito marcarComoProcesando(Long carritoId) {
        Carrito carrito = carritoRepository.findById(carritoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Carrito no encontrado con id: " + carritoId));
        carrito.setEstado(EstadoCarrito.PROCESANDO);
        return carritoRepository.save(carrito);
    }

    @Transactional
    public void marcarComoCompletado(Long carritoId) {
        Carrito carrito = carritoRepository.findById(carritoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Carrito no encontrado con id: " + carritoId));
        carrito.setEstado(EstadoCarrito.COMPLETADO);
        carritoRepository.save(carrito);
    }

    private Carrito obtenerOCrearCarrito(Long clienteId) {
        return carritoRepository.findByClienteIdAndEstado(clienteId, EstadoCarrito.ACTIVO)
                .orElseGet(() -> {
                    Cliente cliente = clienteService.buscarOFallar(clienteId);
                    Carrito nuevo = Carrito.builder().cliente(cliente).build();
                    return carritoRepository.save(nuevo);
                });
    }

    /** Marca el carrito activo como PROCESANDO justo antes del pago */
    @Transactional
    public void iniciarCheckout(Long clienteId) {
        carritoRepository.findByClienteIdAndEstado(clienteId, EstadoCarrito.ACTIVO)
                .ifPresent(c -> {
                    c.setEstado(EstadoCarrito.PROCESANDO);
                    carritoRepository.save(c);
                });
    }
}
