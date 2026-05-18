package com.sergio.gestor_pedidos.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegistroUsuarioDTO {

    @NotBlank
    @Size(max = 80)
    private String username;

    @NotBlank
    @Size(min = 4, max = 100)
    private String password;

    @NotBlank
    @Size(max = 120)
    private String nombre;

    // Datos del cliente asociado (solo para rol USUARIO)
    private String email;
    private String ciudad;
}
