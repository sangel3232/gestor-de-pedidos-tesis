package com.sergio.gestor_pedidos.mapper;

import com.sergio.gestor_pedidos.dto.PagoResponseDTO;
import com.sergio.gestor_pedidos.model.Pago;
import org.springframework.stereotype.Component;

@Component
public class PagoMapper {

    public PagoResponseDTO toResponse(Pago p) {
        return PagoResponseDTO.builder()
                .id(p.getId())
                .pedidoId(p.getPedido().getId())
                .pedidoDescripcion(p.getPedido().getDescripcion())
                .clienteId(p.getPedido().getCliente().getId())
                .clienteNombre(p.getPedido().getCliente().getNombre())
                .monto(p.getMonto())
                .estado(p.getEstado())
                .metodoPago(p.getMetodoPago())
                .referenciaExterna(p.getReferenciaExterna())
                .mensajeRespuesta(p.getMensajeRespuesta())
                .pedidoEstado(p.getPedido().getEstado())
                .creadoEn(p.getCreadoEn())
                .procesadoEn(p.getProcesadoEn())
                .build();
    }
}
