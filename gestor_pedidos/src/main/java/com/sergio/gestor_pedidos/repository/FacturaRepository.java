package com.sergio.gestor_pedidos.repository;

import com.sergio.gestor_pedidos.model.Factura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FacturaRepository extends JpaRepository<Factura, Long> {

    Optional<Factura> findByPagoId(Long pagoId);

    Optional<Factura> findByNumeroFactura(String numeroFactura);

    @Query("SELECT f FROM Factura f JOIN FETCH f.pago p JOIN FETCH p.pedido pd JOIN FETCH pd.cliente " +
           "WHERE pd.cliente.id = :clienteId ORDER BY f.emitidaEn DESC")
    List<Factura> findByClienteId(@Param("clienteId") Long clienteId);

    @Query("SELECT COUNT(f) FROM Factura f WHERE YEAR(f.emitidaEn) = :anio")
    long contarPorAnio(@Param("anio") int anio);
}
