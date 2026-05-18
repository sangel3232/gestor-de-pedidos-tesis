package com.sergio.gestor_pedidos.dto;

import com.sergio.gestor_pedidos.model.RolUsuario;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponseDTO {
    private Long id;
    private String username;
    private String nombre;
    private RolUsuario rol;
    private Long clienteId;      // solo para rol USUARIO
    private String clienteNombre;
}
