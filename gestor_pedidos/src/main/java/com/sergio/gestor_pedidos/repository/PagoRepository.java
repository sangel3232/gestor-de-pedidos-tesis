package com.sergio.gestor_pedidos.repository;

import com.sergio.gestor_pedidos.model.EstadoPago;
import com.sergio.gestor_pedidos.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PagoRepository extends JpaRepository<Pago, Long> {

    Optional<Pago> findByPedidoId(Long pedidoId);

    boolean existsByPedidoId(Long pedidoId);

    List<Pago> findByEstado(EstadoPago estado);

    @Query("SELECT p FROM Pago p JOIN FETCH p.pedido pd JOIN FETCH pd.cliente WHERE pd.cliente.id = :clienteId ORDER BY p.creadoEn DESC")
    List<Pago> findByClienteId(@Param("clienteId") Long clienteId);
}
