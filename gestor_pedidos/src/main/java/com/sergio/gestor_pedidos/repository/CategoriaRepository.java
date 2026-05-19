package com.sergio.gestor_pedidos.repository;

import com.sergio.gestor_pedidos.model.CategoriaProducto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoriaRepository extends JpaRepository<CategoriaProducto, Long> {
    List<CategoriaProducto> findByActivoTrue();
    boolean existsByNombre(String nombre);
}
