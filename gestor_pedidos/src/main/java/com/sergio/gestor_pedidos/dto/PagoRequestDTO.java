package com.sergio.gestor_pedidos.dto;

import com.sergio.gestor_pedidos.model.MetodoPago;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PagoRequestDTO {

    @NotNull(message = "El id del pedido es obligatorio")
    private Long pedidoId;

    @NotNull(message = "El método de pago es obligatorio")
    private MetodoPago metodoPago;

    // Datos simulados de tarjeta (en producción se usaría un token del proveedor)
    private String numeroTarjeta;
    private String titularTarjeta;
    private String fechaExpiracion;
    private String cvv;
}
