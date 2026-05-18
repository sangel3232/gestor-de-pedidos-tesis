package com.sergio.gestor_pedidos.mapper;

import com.sergio.gestor_pedidos.dto.ProductoRequestDTO;
import com.sergio.gestor_pedidos.dto.ProductoResponseDTO;
import com.sergio.gestor_pedidos.model.Producto;
import org.springframework.stereotype.Component;

@Component
public class ProductoMapper {

    public Producto toEntity(ProductoRequestDTO dto) {
        return Producto.builder()
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .precio(dto.getPrecio())
                .stock(dto.getStock())
                .build();
    }

    public ProductoResponseDTO toResponse(Producto p) {
        return ProductoResponseDTO.builder()
                .id(p.getId())
                .nombre(p.getNombre())
                .descripcion(p.getDescripcion())
                .precio(p.getPrecio())
                .stock(p.getStock())
                .activo(p.getActivo())
                .creadoEn(p.getCreadoEn())
                .build();
    }
}
