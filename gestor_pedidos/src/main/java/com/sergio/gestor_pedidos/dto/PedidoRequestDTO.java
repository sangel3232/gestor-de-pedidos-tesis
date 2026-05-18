package com.sergio.gestor_pedidos.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PedidoRequestDTO {

    @NotBlank(message = "La descripción es obligatoria")
    @Size(max = 255)
    private String descripcion;

    @NotNull(message = "El total es obligatorio")
    @DecimalMin(value = "0.0", inclusive = true, message = "El total no puede ser negativo")
    private BigDecimal total;

    @NotNull(message = "El id del cliente es obligatorio")
    private Long clienteId;

    @NotBlank(message = "La ciudad destino es obligatoria")
    @Size(max = 100, message = "La ciudad destino no puede tener más de 100 caracteres")
    private String ciudadDestino;

    @Size(max = 255, message = "La dirección de entrega no puede tener más de 255 caracteres")
    private String direccionEntrega;
}
