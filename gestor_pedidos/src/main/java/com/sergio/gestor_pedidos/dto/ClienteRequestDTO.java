package com.sergio.gestor_pedidos.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ClienteRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
    private String nombre;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Formato de email inválido")
    @Size(max = 150)
    private String email;

    @NotBlank(message = "La ciudad es obligatoria")
    @Size(max = 100)
    private String ciudad;
}
