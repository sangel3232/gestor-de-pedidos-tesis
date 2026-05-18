package com.sergio.gestor_pedidos.controller;

import com.sergio.gestor_pedidos.dto.CambioEstadoDTO;
import com.sergio.gestor_pedidos.dto.PedidoRequestDTO;
import com.sergio.gestor_pedidos.dto.PedidoResponseDTO;
import com.sergio.gestor_pedidos.dto.ResumenDTO;
import com.sergio.gestor_pedidos.service.PedidoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pedidos")
@RequiredArgsConstructor
public class Pedidocontroller {

    private final PedidoService pedidoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PedidoResponseDTO crear(@Valid @RequestBody PedidoRequestDTO dto) {
        return pedidoService.crearPedido(dto);
    }

    @GetMapping
    public Page<PedidoResponseDTO> listar(
            @PageableDefault(size = 10, sort = "fecha", direction = Sort.Direction.DESC) Pageable pageable) {
        return pedidoService.listarPedidos(pageable);
    }

    @GetMapping("/{id}")
    public PedidoResponseDTO obtener(@PathVariable Long id) {
        return pedidoService.obtenerPorId(id);
    }

    @PatchMapping("/{id}/estado")
    public PedidoResponseDTO cambiarEstado(@PathVariable Long id, @Valid @RequestBody CambioEstadoDTO dto) {
        return pedidoService.cambiarEstado(id, dto);
    }

    @GetMapping("/estado/{estado}")
    public List<PedidoResponseDTO> porEstado(@PathVariable String estado) {
        return pedidoService.buscarPorEstado(estado);
    }

    @GetMapping("/cliente/{clienteId}")
    public List<PedidoResponseDTO> porCliente(@PathVariable Long clienteId) {
        return pedidoService.listarPorCliente(clienteId);
    }

    @GetMapping("/resumen")
    public ResumenDTO resumen() {
        return pedidoService.obtenerResumen();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        pedidoService.eliminarPedido(id);
    }
}
