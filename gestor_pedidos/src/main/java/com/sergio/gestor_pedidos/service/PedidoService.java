package com.sergio.gestor_pedidos.service;

import com.sergio.gestor_pedidos.dto.CambioEstadoDTO;
import com.sergio.gestor_pedidos.dto.PedidoRequestDTO;
import com.sergio.gestor_pedidos.dto.PedidoResponseDTO;
import com.sergio.gestor_pedidos.dto.ResumenDTO;
import com.sergio.gestor_pedidos.exception.RecursoNoEncontradoException;
import com.sergio.gestor_pedidos.exception.ReglaDeNegocioException;
import com.sergio.gestor_pedidos.mapper.PedidoMapper;
import com.sergio.gestor_pedidos.model.Cliente;
import com.sergio.gestor_pedidos.model.EstadoPedido;
import com.sergio.gestor_pedidos.model.Pedido;
import com.sergio.gestor_pedidos.repository.ClienteRepository;
import com.sergio.gestor_pedidos.repository.PagoRepository;
import com.sergio.gestor_pedidos.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ClienteRepository clienteRepository;
    private final PagoRepository pagoRepository;
    private final PedidoMapper pedidoMapper;

    // Transiciones válidas de estado
    private static final Map<EstadoPedido, List<EstadoPedido>> TRANSICIONES = Map.of(
        EstadoPedido.CREADO,      List.of(EstadoPedido.CONFIRMADO, EstadoPedido.CANCELADO),
        EstadoPedido.CONFIRMADO,  List.of(EstadoPedido.PAGADO, EstadoPedido.CANCELADO),
        EstadoPedido.PAGADO,      List.of(EstadoPedido.EN_CAMINO, EstadoPedido.REEMBOLSADO),
        EstadoPedido.EN_CAMINO,   List.of(EstadoPedido.ENTREGADO),
        EstadoPedido.ENTREGADO,   List.of(),
        EstadoPedido.CANCELADO,   List.of(),
        EstadoPedido.REEMBOLSADO, List.of()
    );

    @Transactional
    public PedidoResponseDTO crearPedido(PedidoRequestDTO dto) {
        Cliente cliente = clienteRepository.findById(dto.getClienteId())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Cliente no encontrado con id: " + dto.getClienteId()));

        if (!cliente.getActivo()) {
            throw new ReglaDeNegocioException("El cliente está inactivo y no puede generar pedidos");
        }

        if (dto.getCiudadDestino() == null || dto.getCiudadDestino().isBlank()) {
            throw new ReglaDeNegocioException("La ciudad destino es obligatoria");
        }
        Pedido pedido = Pedido.builder()
                .descripcion(dto.getDescripcion())
                .total(dto.getTotal())
                .estado(EstadoPedido.CREADO)
                .cliente(cliente)
                .ciudadDestino(dto.getCiudadDestino().trim())
                .direccionEntrega(dto.getDireccionEntrega())
                .build();

        return pedidoMapper.toResponse(pedidoRepository.save(pedido));
    }

    public Page<PedidoResponseDTO> listarPedidos(Pageable pageable) {
        return pedidoRepository.findAllConClientePaginado(pageable)
                .map(pedidoMapper::toResponse);
    }

    public PedidoResponseDTO obtenerPorId(Long id) {
        return pedidoMapper.toResponse(buscarOFallar(id));
    }

    public List<PedidoResponseDTO> buscarPorEstado(String estado) {
        EstadoPedido estadoEnum;
        try {
            estadoEnum = EstadoPedido.valueOf(estado.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Estado inválido. Valores permitidos: " + Arrays.toString(EstadoPedido.values()));
        }
        return pedidoRepository.findByEstadoConCliente(estadoEnum).stream()
                .map(pedidoMapper::toResponse).toList();
    }

    public List<PedidoResponseDTO> listarPorCliente(Long clienteId) {
        if (!clienteRepository.existsById(clienteId)) {
            throw new RecursoNoEncontradoException("Cliente no encontrado con id: " + clienteId);
        }
        return pedidoRepository.findByClienteId(clienteId).stream()
                .map(pedidoMapper::toResponse).toList();
    }

    @Transactional
    public PedidoResponseDTO cambiarEstado(Long id, CambioEstadoDTO dto) {
        Pedido pedido = buscarOFallar(id);
        EstadoPedido actual = pedido.getEstado();
        EstadoPedido nuevo = dto.getEstado();

        List<EstadoPedido> permitidos = TRANSICIONES.getOrDefault(actual, List.of());
        if (!permitidos.contains(nuevo)) {
            throw new ReglaDeNegocioException(
                String.format("No se puede pasar de %s a %s. Transiciones válidas: %s", actual, nuevo, permitidos));
        }

        pedido.setEstado(nuevo);
        if (nuevo == EstadoPedido.CANCELADO) {
            pedido.setObservacionCancelacion(
                    dto.getObservacion() != null && !dto.getObservacion().isBlank()
                            ? dto.getObservacion().trim()
                            : "Cancelado sin observación"
            );
        }
        return pedidoMapper.toResponse(pedidoRepository.save(pedido));
    }

    @Transactional
    public void eliminarPedido(Long id) {
        Pedido pedido = buscarOFallar(id);
        if (pedido.getEstado() == EstadoPedido.PAGADO || pedido.getEstado() == EstadoPedido.REEMBOLSADO) {
            throw new ReglaDeNegocioException("No se puede eliminar un pedido pagado o reembolsado");
        }
        // Si tiene un pago asociado (aunque sea fallido/pendiente), eliminarlo primero
        pagoRepository.findByPedidoId(id).ifPresent(pago -> pagoRepository.delete(pago));
        pedidoRepository.deleteById(id);
    }

    public ResumenDTO obtenerResumen() {
        List<Pedido> todos = pedidoRepository.findAll();
        Map<String, Long> porEstado = Arrays.stream(EstadoPedido.values())
                .collect(Collectors.toMap(Enum::name,
                        e -> todos.stream().filter(p -> p.getEstado() == e).count()));

        BigDecimal totalFacturado = pedidoRepository
                .sumTotalByEstado(EstadoPedido.PAGADO);

        return ResumenDTO.builder()
                .totalPedidos(todos.size())
                .totalClientes(clienteRepository.count())
                .totalFacturado(totalFacturado != null ? totalFacturado : BigDecimal.ZERO)
                .pedidosPorEstado(porEstado)
                .build();
    }

    private Pedido buscarOFallar(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado con id: " + id));
    }
}
