package com.sergio.gestor_pedidos.repository;

import com.sergio.gestor_pedidos.model.Carrito;
import com.sergio.gestor_pedidos.model.EstadoCarrito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CarritoRepository extends JpaRepository<Carrito, Long> {

    @Query("SELECT DISTINCT c FROM Carrito c " +
           "JOIN FETCH c.cliente " +
           "LEFT JOIN FETCH c.items i " +
           "LEFT JOIN FETCH i.producto " +
           "WHERE c.cliente.id = :clienteId AND c.estado = :estado")
    Optional<Carrito> findByClienteIdAndEstado(@Param("clienteId") Long clienteId,
                                               @Param("estado") EstadoCarrito estado);

    @Query("SELECT DISTINCT c FROM Carrito c " +
           "JOIN FETCH c.cliente " +
           "LEFT JOIN FETCH c.items i " +
           "LEFT JOIN FETCH i.producto " +
           "WHERE c.cliente.id = :clienteId ORDER BY c.creadoEn DESC")
    List<Carrito> findByClienteId(@Param("clienteId") Long clienteId);
}
