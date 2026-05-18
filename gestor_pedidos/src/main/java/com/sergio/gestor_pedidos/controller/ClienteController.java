package com.sergio.gestor_pedidos.controller;

import com.sergio.gestor_pedidos.dto.ClienteRequestDTO;
import com.sergio.gestor_pedidos.dto.ClienteResponseDTO;
import com.sergio.gestor_pedidos.service.ClienteService;
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
@RequestMapping("/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClienteResponseDTO crear(@Valid @RequestBody ClienteRequestDTO dto) {
        return clienteService.crearCliente(dto);
    }

    @GetMapping
    public Page<ClienteResponseDTO> listar(
            @PageableDefault(size = 10, sort = "nombre", direction = Sort.Direction.ASC) Pageable pageable) {
        return clienteService.listarClientes(pageable);
    }

    @GetMapping("/{id}")
    public ClienteResponseDTO obtener(@PathVariable Long id) {
        return clienteService.obtenerPorId(id);
    }

    @PutMapping("/{id}")
    public ClienteResponseDTO actualizar(@PathVariable Long id, @Valid @RequestBody ClienteRequestDTO dto) {
        return clienteService.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desactivar(@PathVariable Long id) {
        clienteService.desactivar(id);
    }

    @GetMapping("/buscar")
    public List<ClienteResponseDTO> buscar(@RequestParam String nombre) {
        return clienteService.buscarPorNombre(nombre);
    }

    @GetMapping("/ciudad/{ciudad}")
    public List<ClienteResponseDTO> porCiudad(@PathVariable String ciudad) {
        return clienteService.listarPorCiudad(ciudad);
    }
}
