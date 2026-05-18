package com.sergio.gestor_pedidos.dto;

import com.sergio.gestor_pedidos.model.EstadoPago;
import com.sergio.gestor_pedidos.model.EstadoPedido;
import com.sergio.gestor_pedidos.model.MetodoPago;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PagoResponseDTO {
    private Long id;
    private Long pedidoId;
    private String pedidoDescripcion;
    private Long clienteId;
    private String clienteNombre;
    private BigDecimal monto;
    private EstadoPago estado;
    private MetodoPago metodoPago;
    private String referenciaExterna;
    private String mensajeRespuesta;
    private LocalDateTime creadoEn;
    private LocalDateTime procesadoEn;
    private EstadoPedido pedidoEstado;
}
