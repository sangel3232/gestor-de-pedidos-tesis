package com.sergio.gestor_pedidos.controller;

import com.sergio.gestor_pedidos.dto.ProductoRequestDTO;
import com.sergio.gestor_pedidos.dto.ProductoResponseDTO;
import com.sergio.gestor_pedidos.service.ProductoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductoResponseDTO crear(@Valid @RequestBody ProductoRequestDTO dto) {
        return productoService.crear(dto);
    }

    @GetMapping
    public List<ProductoResponseDTO> listar() {
        return productoService.listar();
    }

    @GetMapping("/{id}")
    public ProductoResponseDTO obtener(@PathVariable Long id) {
        return productoService.obtenerPorId(id);
    }

    @GetMapping("/buscar")
    public List<ProductoResponseDTO> buscar(@RequestParam String nombre) {
        return productoService.buscarPorNombre(nombre);
    }

    @GetMapping("/filtrar")
    public List<ProductoResponseDTO> filtrar(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) java.math.BigDecimal precioMin,
            @RequestParam(required = false) java.math.BigDecimal precioMax,
            @RequestParam(defaultValue = "false") boolean soloConStock) {
        return productoService.filtrar(nombre, precioMin, precioMax, soloConStock);
    }

    @GetMapping("/categoria/{categoriaId}")
    public List<ProductoResponseDTO> porCategoria(@PathVariable Long categoriaId) {
        return productoService.filtrarPorCategoria(categoriaId);
    }

    @PutMapping("/{id}")
    public ProductoResponseDTO actualizar(@PathVariable Long id, @Valid @RequestBody ProductoRequestDTO dto) {
        return productoService.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desactivar(@PathVariable Long id) {
        productoService.desactivar(id);
    }
}
