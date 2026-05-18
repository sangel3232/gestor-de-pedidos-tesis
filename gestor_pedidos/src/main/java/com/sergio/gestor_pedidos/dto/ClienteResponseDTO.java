package com.sergio.gestor_pedidos.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ClienteResponseDTO {
    private Long id;
    private String nombre;
    private String email;
    private String ciudad;
    private Boolean activo;
    private LocalDateTime creadoEn;
}
