package com.sergio.gestor_pedidos.mapper;

import com.sergio.gestor_pedidos.dto.PedidoResponseDTO;
import com.sergio.gestor_pedidos.model.Pedido;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PedidoMapper {

    private final ClienteMapper clienteMapper;

    public PedidoResponseDTO toResponse(Pedido p) {
        return PedidoResponseDTO.builder()
                .id(p.getId())
                .descripcion(p.getDescripcion())
                .total(p.getTotal())
                .estado(p.getEstado())
                .ciudadDestino(p.getCiudadDestino())
                .direccionEntrega(p.getDireccionEntrega())
                .observacionCancelacion(p.getObservacionCancelacion())
                .fecha(p.getFecha())
                .actualizadoEn(p.getActualizadoEn())
                .cliente(clienteMapper.toResponse(p.getCliente()))
                .build();
    }
}
