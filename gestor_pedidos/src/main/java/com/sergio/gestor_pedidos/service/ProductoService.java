package com.sergio.gestor_pedidos.service;

import com.sergio.gestor_pedidos.dto.ProductoRequestDTO;
import com.sergio.gestor_pedidos.dto.ProductoResponseDTO;
import com.sergio.gestor_pedidos.exception.RecursoNoEncontradoException;
import com.sergio.gestor_pedidos.mapper.ProductoMapper;
import com.sergio.gestor_pedidos.model.Producto;
import com.sergio.gestor_pedidos.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final ProductoMapper productoMapper;

    @Transactional
    public ProductoResponseDTO crear(ProductoRequestDTO dto) {
        Producto producto = productoMapper.toEntity(dto);
        return productoMapper.toResponse(productoRepository.save(producto));
    }

    public List<ProductoResponseDTO> listar() {
        return productoRepository.findByActivoTrue().stream()
                .map(productoMapper::toResponse).toList();
    }

    public ProductoResponseDTO obtenerPorId(Long id) {
        return productoMapper.toResponse(buscarOFallar(id));
    }

    public List<ProductoResponseDTO> buscarPorNombre(String nombre) {
        return productoRepository.buscarPorNombre(nombre).stream()
                .map(productoMapper::toResponse).toList();
    }

    @Transactional
    public ProductoResponseDTO actualizar(Long id, ProductoRequestDTO dto) {
        Producto producto = buscarOFallar(id);
        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setPrecio(dto.getPrecio());
        producto.setStock(dto.getStock());
        return productoMapper.toResponse(productoRepository.save(producto));
    }

    @Transactional
    public void desactivar(Long id) {
        Producto producto = buscarOFallar(id);
        producto.setActivo(false);
        productoRepository.save(producto);
    }

    public Producto buscarOFallar(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado con id: " + id));
    }
}
