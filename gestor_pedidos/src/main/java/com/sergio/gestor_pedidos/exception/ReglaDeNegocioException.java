package com.sergio.gestor_pedidos.exception;

public class ReglaDeNegocioException extends RuntimeException {
    public ReglaDeNegocioException(String mensaje) {
        super(mensaje);
    }
}
