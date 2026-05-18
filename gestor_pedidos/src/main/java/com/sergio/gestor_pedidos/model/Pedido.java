package com.sergio.gestor_pedidos.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "pedido",
    indexes = {
        @Index(name = "idx_pedido_estado",     columnList = "estado"),
        @Index(name = "idx_pedido_cliente_id", columnList = "cliente_id"),
        @Index(name = "idx_pedido_fecha",      columnList = "fecha")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false, length = 255)
    private String descripcion;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EstadoPedido estado = EstadoPedido.CREADO;

    @Size(max = 100)
    @Column(name = "ciudad_destino", length = 100)
    private String ciudadDestino;

    @Size(max = 255)
    @Column(name = "direccion_entrega", length = 255)
    private String direccionEntrega;

    @Column(name = "observacion_cancelacion", length = 500)
    private String observacionCancelacion;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime fecha;

    @UpdateTimestamp
    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_pedido_cliente"))
    private Cliente cliente;
}
