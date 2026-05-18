package com.sergio.gestor_pedidos.dto;

import com.sergio.gestor_pedidos.model.EstadoPedido;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PedidoResponseDTO {
    private Long id;
    private String descripcion;
    private BigDecimal total;
    private EstadoPedido estado;
    private String ciudadDestino;
    private String direccionEntrega;
    private String observacionCancelacion;
    private LocalDateTime fecha;
    private LocalDateTime actualizadoEn;
    private ClienteResponseDTO cliente;
}
   