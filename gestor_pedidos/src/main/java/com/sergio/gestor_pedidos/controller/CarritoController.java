package com.sergio.gestor_pedidos.controller;

import com.sergio.gestor_pedidos.dto.AgregarItemDTO;
import com.sergio.gestor_pedidos.dto.CarritoResponseDTO;
import com.sergio.gestor_pedidos.service.CarritoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/carrito")
@RequiredArgsConstructor
public class CarritoController {

    private final CarritoService carritoService;

    @GetMapping("/cliente/{clienteId}")
    public CarritoResponseDTO obtenerCarrito(@PathVariable Long clienteId) {
        return carritoService.obtenerCarritoActivo(clienteId);
    }

    @PostMapping("/cliente/{clienteId}/items")
    public CarritoResponseDTO agregarItem(@PathVariable Long clienteId,
                                          @Valid @RequestBody AgregarItemDTO dto) {
        return carritoService.agregarItem(clienteId, dto);
    }

    @PatchMapping("/cliente/{clienteId}/items/{itemId}")
    public CarritoResponseDTO actualizarCantidad(@PathVariable Long clienteId,
                                                  @PathVariable Long itemId,
                                                  @RequestBody Map<String, Integer> body) {
        Integer cantidad = body.get("cantidad");
        return carritoService.actualizarCantidad(clienteId, itemId, cantidad);
    }

    @DeleteMapping("/cliente/{clienteId}/items/{itemId}")
    public CarritoResponseDTO eliminarItem(@PathVariable Long clienteId,
                                            @PathVariable Long itemId) {
        return carritoService.eliminarItem(clienteId, itemId);
    }

    @DeleteMapping("/cliente/{clienteId}/vaciar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void vaciarCarrito(@PathVariable Long clienteId) {
        carritoService.vaciarCarrito(clienteId);
    }

    @GetMapping("/cliente/{clienteId}/historial")
    public List<CarritoResponseDTO> historial(@PathVariable Long clienteId) {
        return carritoService.historialPorCliente(clienteId);
    }

    @PostMapping("/cliente/{clienteId}/checkout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void iniciarCheckout(@PathVariable Long clienteId) {
        carritoService.iniciarCheckout(clienteId);
    }
}
