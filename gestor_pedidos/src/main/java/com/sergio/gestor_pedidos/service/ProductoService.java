package com.sergio.gestor_pedidos.service;

import com.sergio.gestor_pedidos.dto.ProductoRequestDTO;
import com.sergio.gestor_pedidos.dto.ProductoResponseDTO;
import com.sergio.gestor_pedidos.exception.RecursoNoEncontradoException;
import com.sergio.gestor_pedidos.mapper.ProductoMapper;
import com.sergio.gestor_pedidos.model.CategoriaProducto;
import com.sergio.gestor_pedidos.model.Producto;
import com.sergio.gestor_pedidos.repository.CategoriaRepository;
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
    private final CategoriaRepository categoriaRepository;
    private final ProductoMapper productoMapper;

    @Transactional
    public ProductoResponseDTO crear(ProductoRequestDTO dto) {
        Producto producto = productoMapper.toEntity(dto);
        asignarCategoria(producto, dto.getCategoriaId());
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

    public List<ProductoResponseDTO> filtrar(String nombre, java.math.BigDecimal precioMin,
                                              java.math.BigDecimal precioMax, boolean soloConStock) {
        return productoRepository.filtrar(nombre, precioMin, precioMax, soloConStock).stream()
                .map(productoMapper::toResponse).toList();
    }

    public List<ProductoResponseDTO> filtrarPorCategoria(Long categoriaId) {
        return productoRepository.findByActivoTrue().stream()
                .filter(p -> p.getCategoria() != null && p.getCategoria().getId().equals(categoriaId))
                .map(productoMapper::toResponse).toList();
    }

    @Transactional
    public ProductoResponseDTO actualizar(Long id, ProductoRequestDTO dto) {
        Producto producto = buscarOFallar(id);
        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setImagenUrl(dto.getImagenUrl());
        producto.setPrecio(dto.getPrecio());
        producto.setStock(dto.getStock());
        asignarCategoria(producto, dto.getCategoriaId());
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

    private void asignarCategoria(Producto producto, Long categoriaId) {
        if (categoriaId != null) {
            CategoriaProducto cat = categoriaRepository.findById(categoriaId)
                    .orElseThrow(() -> new RecursoNoEncontradoException("Categoría no encontrada: " + categoriaId));
            producto.setCategoria(cat);
        }
    }
}
