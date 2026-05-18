package com.sergio.gestor_pedidos.repository;

import com.sergio.gestor_pedidos.model.EstadoPedido;
import com.sergio.gestor_pedidos.model.Pedido;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findByClienteId(Long clienteId);

    List<Pedido> findByFechaBetween(LocalDateTime desde, LocalDateTime hasta);

    @Query("SELECT p FROM Pedido p JOIN FETCH p.cliente WHERE p.estado = :estado ORDER BY p.fecha DESC")
    List<Pedido> findByEstadoConCliente(@Param("estado") EstadoPedido estado);

    @Query("SELECT SUM(p.total) FROM Pedido p WHERE p.estado = :estado")
    BigDecimal sumTotalByEstado(@Param("estado") EstadoPedido estado);

    @Query("SELECT p FROM Pedido p JOIN FETCH p.cliente ORDER BY p.fecha DESC")
    List<Pedido> findAllConCliente();

    @Query(
        value = "SELECT p FROM Pedido p JOIN FETCH p.cliente ORDER BY p.fecha DESC",
        countQuery = "SELECT COUNT(p) FROM Pedido p"
    )
    Page<Pedido> findAllConClientePaginado(Pageable pageable);
}
