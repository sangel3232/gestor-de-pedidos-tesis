package com.sergio.gestor_pedidos.mapper;

import com.sergio.gestor_pedidos.dto.CarritoItemResponseDTO;
import com.sergio.gestor_pedidos.dto.CarritoResponseDTO;
import com.sergio.gestor_pedidos.model.Carrito;
import com.sergio.gestor_pedidos.model.CarritoItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class CarritoMapper {

    public CarritoResponseDTO toResponse(Carrito c) {
        List<CarritoItemResponseDTO> items = c.getItems().stream()
                .map(this::toItemResponse)
                .toList();

        return CarritoResponseDTO.builder()
                .id(c.getId())
                .clienteId(c.getCliente().getId())
                .clienteNombre(c.getCliente().getNombre())
                .estado(c.getEstado().name())
                .items(items)
                .total(c.calcularTotal())
                .creadoEn(c.getCreadoEn())
                .build();
    }

    private CarritoItemResponseDTO toItemResponse(CarritoItem item) {
        BigDecimal subtotal = item.getPrecioUnitario()
                .multiply(BigDecimal.valueOf(item.getCantidad()));
        return CarritoItemResponseDTO.builder()
                .id(item.getId())
                .productoId(item.getProducto().getId())
                .productoNombre(item.getProducto().getNombre())
                .cantidad(item.getCantidad())
                .precioUnitario(item.getPrecioUnitario())
                .subtotal(subtotal)
                .build();
    }
}
