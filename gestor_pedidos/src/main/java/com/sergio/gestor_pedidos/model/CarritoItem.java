package com.sergio.gestor_pedidos.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "carrito_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"carrito", "producto"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class CarritoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "carrito_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_item_carrito"))
    private Carrito carrito;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "producto_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_item_producto"))
    private Producto producto;

    @NotNull
    @Min(1)
    @Column(nullable = false)
    private Integer cantidad;

    @NotNull
    @Column(name = "precio_unitario", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioUnitario;
}
