package com.sergio.gestor_pedidos.controller;

import com.sergio.gestor_pedidos.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;

    @GetMapping(value = "/suscribir/{clienteId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter suscribir(@PathVariable Long clienteId) {
        return notificacionService.suscribir(clienteId);
    }
}
