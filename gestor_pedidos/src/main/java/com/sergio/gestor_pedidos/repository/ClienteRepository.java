package com.sergio.gestor_pedidos.repository;

import com.sergio.gestor_pedidos.model.Cliente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Cliente> findByCiudad(String ciudad);

    Page<Cliente> findByActivoTrue(Pageable pageable);

    List<Cliente> findByActivoTrue();

    @Query("SELECT c FROM Cliente c WHERE LOWER(c.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')) AND c.activo = true")
    List<Cliente> buscarPorNombre(@Param("nombre") String nombre);
}
