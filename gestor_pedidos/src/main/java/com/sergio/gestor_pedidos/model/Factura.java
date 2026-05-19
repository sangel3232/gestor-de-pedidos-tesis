package com.sergio.gestor_pedidos.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "factura")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Factura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Número de factura único: FAC-2026-000001
    @Column(name = "numero_factura", nullable = false, unique = true, length = 30)
    private String numeroFactura;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pago_id", nullable = false, unique = true,
                foreignKey = @ForeignKey(name = "fk_factura_pago"))
    private Pago pago;

    // Datos del cliente en el momento de la factura (snapshot)
    @Column(name = "cliente_nombre",  nullable = false, length = 120)
    private String clienteNombre;

    @Column(name = "cliente_email",   nullable = false, length = 150)
    private String clienteEmail;

    @Column(name = "cliente_ciudad",  length = 100)
    private String clienteCiudad;

    // Datos del pedido
    @Column(name = "pedido_descripcion", nullable = false, length = 500)
    private String pedidoDescripcion;

    @Column(name = "subtotal", nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "impuesto_porcentaje", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal impuestoPorcentaje = new BigDecimal("19.00"); // IVA Colombia 19%

    @Column(name = "impuesto_valor", nullable = false, precision = 12, scale = 2)
    private BigDecimal impuestoValor;

    @Column(name = "total", nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    @Column(name = "metodo_pago", length = 30)
    private String metodoPago;

    @Column(name = "referencia_pago", length = 100)
    private String referenciaPago;

    @Column(name = "ciudad_destino", length = 150)
    private String ciudadDestino;

    @Column(name = "direccion_entrega", length = 255)
    private String direccionEntrega;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EstadoFactura estado = EstadoFactura.EMITIDA;

    @CreationTimestamp
    @Column(name = "emitida_en", nullable = false, updatable = false)
    private LocalDateTime emitidaEn;
}
