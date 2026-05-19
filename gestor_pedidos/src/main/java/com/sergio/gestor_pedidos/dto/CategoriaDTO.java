package com.sergio.gestor_pedidos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoriaDTO {

    @NotBlank
    @Size(max = 80)
    private String nombre;

    @Size(max = 255)
    private String descripcion;

    @Size(max = 10)
    private String icono;
}
