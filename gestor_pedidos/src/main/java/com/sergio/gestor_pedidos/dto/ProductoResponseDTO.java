package com.sergio.gestor_pedidos.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductoResponseDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private String imagenUrl;
    private Long categoriaId;
    private String categoriaNombre;
    private String categoriaIcono;
    private BigDecimal precio;
    private Integer stock;
    private Boolean activo;
    private LocalDateTime creadoEn;
}
