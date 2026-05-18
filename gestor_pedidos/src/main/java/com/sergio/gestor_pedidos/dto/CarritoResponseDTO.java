package com.sergio.gestor_pedidos.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CarritoResponseDTO {
    private Long id;
    private Long clienteId;
    private String clienteNombre;
    private String estado;
    private List<CarritoItemResponseDTO> items;
    private BigDecimal total;
    private LocalDateTime creadoEn;
}
