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

    @Query("SELECT p FROM Producto p WHERE p.activo = true AND p.precio BETWEEN :min AND :max")
    List<Producto> filtrarPorPrecio(@Param("min") java.math.BigDecimal min, @Param("max") java.math.BigDecimal max);

    @Query("SELECT p FROM Producto p WHERE p.activo = true " +
           "AND (COALESCE(:nombre, '') = '' OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))) " +
           "AND (:precioMin IS NULL OR p.precio >= :precioMin) " +
           "AND (:precioMax IS NULL OR p.precio <= :precioMax) " +
           "AND (:soloConStock = false OR p.stock > 0)")
    List<Producto> filtrar(@Param("nombre") String nombre,
                           @Param("precioMin") java.math.BigDecimal precioMin,
                           @Param("precioMax") java.math.BigDecimal precioMax,
                           @Param("soloConStock") boolean soloConStock);
}
