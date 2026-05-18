package com.sergio.gestor_pedidos.controller;

import com.sergio.gestor_pedidos.dto.LoginRequestDTO;
import com.sergio.gestor_pedidos.dto.LoginResponseDTO;
import com.sergio.gestor_pedidos.dto.RegistroUsuarioDTO;
import com.sergio.gestor_pedidos.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public LoginResponseDTO login(@Valid @RequestBody LoginRequestDTO dto) {
        return authService.login(dto);
    }

    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    public LoginResponseDTO registro(@Valid @RequestBody RegistroUsuarioDTO dto) {
        return authService.registrarUsuario(dto);
    }
}
