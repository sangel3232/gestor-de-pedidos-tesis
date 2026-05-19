package com.sergio.gestor_pedidos.service;

import com.sergio.gestor_pedidos.dto.CategoriaDTO;
import com.sergio.gestor_pedidos.exception.RecursoNoEncontradoException;
import com.sergio.gestor_pedidos.exception.ReglaDeNegocioException;
import com.sergio.gestor_pedidos.model.CategoriaProducto;
import com.sergio.gestor_pedidos.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public List<CategoriaProducto> listar() {
        return categoriaRepository.findByActivoTrue();
    }

    public List<CategoriaProducto> listarTodas() {
        return categoriaRepository.findAll();
    }

    @Transactional
    public CategoriaProducto crear(CategoriaDTO dto) {
        if (categoriaRepository.existsByNombre(dto.getNombre())) {
            throw new ReglaDeNegocioException("Ya existe una categoría con ese nombre");
        }
        return categoriaRepository.save(CategoriaProducto.builder()
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .icono(dto.getIcono())
                .build());
    }

    @Transactional
    public CategoriaProducto actualizar(Long id, CategoriaDTO dto) {
        CategoriaProducto cat = buscarOFallar(id);
        cat.setNombre(dto.getNombre());
        cat.setDescripcion(dto.getDescripcion());
        cat.setIcono(dto.getIcono());
        return categoriaRepository.save(cat);
    }

    @Transactional
    public void desactivar(Long id) {
        CategoriaProducto cat = buscarOFallar(id);
        cat.setActivo(false);
        categoriaRepository.save(cat);
    }

    public CategoriaProducto buscarOFallar(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría no encontrada: " + id));
    }
}
