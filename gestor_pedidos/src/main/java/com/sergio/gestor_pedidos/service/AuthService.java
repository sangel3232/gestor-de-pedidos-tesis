package com.sergio.gestor_pedidos.service;

import com.sergio.gestor_pedidos.dto.LoginRequestDTO;
import com.sergio.gestor_pedidos.dto.LoginResponseDTO;
import com.sergio.gestor_pedidos.dto.RegistroUsuarioDTO;
import com.sergio.gestor_pedidos.exception.RecursoNoEncontradoException;
import com.sergio.gestor_pedidos.exception.ReglaDeNegocioException;
import com.sergio.gestor_pedidos.model.Cliente;
import com.sergio.gestor_pedidos.model.RolUsuario;
import com.sergio.gestor_pedidos.model.Usuario;
import com.sergio.gestor_pedidos.repository.ClienteRepository;
import com.sergio.gestor_pedidos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;

    public LoginResponseDTO login(LoginRequestDTO dto) {
        Usuario usuario = usuarioRepository.findByUsernameActivo(dto.getUsername())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario o contraseña incorrectos"));

        // Comparación simple de contraseña en texto plano (demo)
        // En producción usar BCryptPasswordEncoder
        if (!usuario.getPassword().equals(dto.getPassword())) {
            throw new ReglaDeNegocioException("Usuario o contraseña incorrectos");
        }

        return buildResponse(usuario);
    }

    @Transactional
    public LoginResponseDTO registrarUsuario(RegistroUsuarioDTO dto) {
        if (usuarioRepository.existsByUsername(dto.getUsername())) {
            throw new ReglaDeNegocioException("El nombre de usuario ya está en uso: " + dto.getUsername());
        }

        // Crear cliente asociado
        if (dto.getEmail() == null || dto.getCiudad() == null) {
            throw new ReglaDeNegocioException("Email y ciudad son obligatorios para registrar un usuario");
        }
        if (clienteRepository.existsByEmail(dto.getEmail())) {
            throw new ReglaDeNegocioException("Ya existe una cuenta con ese email");
        }

        Cliente cliente = clienteRepository.save(Cliente.builder()
                .nombre(dto.getNombre())
                .email(dto.getEmail())
                .ciudad(dto.getCiudad())
                .build());

        Usuario usuario = usuarioRepository.save(Usuario.builder()
                .username(dto.getUsername())
                .password(dto.getPassword())
                .nombre(dto.getNombre())
                .rol(RolUsuario.USUARIO)
                .cliente(cliente)
                .build());

        return buildResponse(usuario);
    }

    private LoginResponseDTO buildResponse(Usuario u) {
        return LoginResponseDTO.builder()
                .id(u.getId())
                .username(u.getUsername())
                .nombre(u.getNombre())
                .rol(u.getRol())
                .clienteId(u.getCliente() != null ? u.getCliente().getId() : null)
                .clienteNombre(u.getCliente() != null ? u.getCliente().getNombre() : null)
                .build();
    }
}
