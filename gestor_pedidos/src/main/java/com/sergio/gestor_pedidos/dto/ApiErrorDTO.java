package com.sergio.gestor_pedidos.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ApiErrorDTO {
    private int status;
    private String error;
    private String mensaje;
    private List<String> detalles;
    private LocalDateTime timestamp;
}
