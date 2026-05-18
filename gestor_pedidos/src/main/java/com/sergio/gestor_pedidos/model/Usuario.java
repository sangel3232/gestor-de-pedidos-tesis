package com.sergio.gestor_pedidos.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuario")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 80)
    @Column(nullable = false, unique = true, length = 80)
    private String username;

    @NotBlank
    @Column(nullable = false)
    private String password;

    @NotBlank
    @Size(max = 120)
    @Column(nullable = false, length = 120)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private RolUsuario rol = RolUsuario.USUARIO;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    // Un usuario USUARIO puede estar vinculado a un cliente
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id",
                foreignKey = @ForeignKey(name = "fk_usuario_cliente"))
    private Cliente cliente;

    @CreationTimestamp
    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;
}
