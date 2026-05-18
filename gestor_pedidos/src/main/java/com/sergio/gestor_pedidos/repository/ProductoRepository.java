package com.sergio.gestor_pedidos.repository;

import com.sergio.gestor_pedidos.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    List<Producto> findByActivoTrue();

    @Query("SELECT p FROM Producto p WHERE p.activo = true AND LOWER(p.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))")
    List<Producto> buscarPorNombre(@Param("nombre") String nombre);
}
