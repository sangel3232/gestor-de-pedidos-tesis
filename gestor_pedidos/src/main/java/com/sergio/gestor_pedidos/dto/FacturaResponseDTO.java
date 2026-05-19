package com.sergio.gestor_pedidos.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class FacturaResponseDTO {
    private Long id;
    private String numeroFactura;
    private Long pagoId;
    private Long pedidoId;
    private String clienteNombre;
    private String clienteEmail;
    private String clienteCiudad;
    private String pedidoDescripcion;
    private BigDecimal subtotal;
    private BigDecimal impuestoPorcentaje;
    private BigDecimal impuestoValor;
    private BigDecimal total;
    private String metodoPago;
    private String referenciaPago;
    private String ciudadDestino;
    private String direccionEntrega;
    private String estado;
    private LocalDateTime emitidaEn;
}
