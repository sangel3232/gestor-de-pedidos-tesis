package com.sergio.gestor_pedidos.controller;

import com.sergio.gestor_pedidos.dto.CategoriaDTO;
import com.sergio.gestor_pedidos.model.CategoriaProducto;
import com.sergio.gestor_pedidos.service.CategoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    @GetMapping
    public List<CategoriaProducto> listar() {
        return categoriaService.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoriaProducto crear(@Valid @RequestBody CategoriaDTO dto) {
        return categoriaService.crear(dto);
    }

    @PutMapping("/{id}")
    public CategoriaProducto actualizar(@PathVariable Long id, @Valid @RequestBody CategoriaDTO dto) {
        return categoriaService.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desactivar(@PathVariable Long id) {
        categoriaService.desactivar(id);
    }
}
