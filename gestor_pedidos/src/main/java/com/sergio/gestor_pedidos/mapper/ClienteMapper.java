package com.sergio.gestor_pedidos.mapper;

import com.sergio.gestor_pedidos.dto.ClienteRequestDTO;
import com.sergio.gestor_pedidos.dto.ClienteResponseDTO;
import com.sergio.gestor_pedidos.model.Cliente;
import org.springframework.stereotype.Component;

@Component
public class ClienteMapper {

    public Cliente toEntity(ClienteRequestDTO dto) {
        return Cliente.builder()
                .nombre(dto.getNombre())
                .email(dto.getEmail())
                .ciudad(dto.getCiudad())
                .build();
    }

    public ClienteResponseDTO toResponse(Cliente c) {
        return ClienteResponseDTO.builder()
                .id(c.getId())
                .nombre(c.getNombre())
                .email(c.getEmail())
                .ciudad(c.getCiudad())
                .activo(c.getActivo())
                .creadoEn(c.getCreadoEn())
                .build();
    }
}
