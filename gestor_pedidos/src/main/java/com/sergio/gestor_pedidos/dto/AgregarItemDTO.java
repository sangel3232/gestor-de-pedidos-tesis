package com.sergio.gestor_pedidos.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AgregarItemDTO {

    @NotNull(message = "El id del producto es obligatorio")
    private Long productoId;

    @NotNull
    @Min(value = 1, message = "La cantidad mínima es 1")
    private Integer cantidad;
}
