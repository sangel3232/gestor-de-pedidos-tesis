package com.sergio.gestor_pedidos.dto;

import com.sergio.gestor_pedidos.model.EstadoPedido;

public class CambioEstadoDTO {

    private EstadoPedido estado;
    private String observacion;

    public EstadoPedido getEstado() {
        return estado;
    }

    public void setEstado(EstadoPedido estado) {
        this.estado = estado;
    }

    public String getObservacion() {
        return observacion;
    }

    public void setObservacion(String observacion) {
        this.observacion = observacion;
    }
}