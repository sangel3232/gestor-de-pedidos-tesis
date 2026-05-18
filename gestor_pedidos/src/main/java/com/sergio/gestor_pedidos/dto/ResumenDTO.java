package com.sergio.gestor_pedidos.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
public class ResumenDTO {
    private long totalPedidos;
    private long totalClientes;
    private BigDecimal totalFacturado;
    private Map<String, Long> pedidosPorEstado;
}
