package com.sergio.gestor_pedidos.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class NotificacionService {

    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter suscribir(Long clienteId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.put(clienteId, emitter);
        emitter.onCompletion(() -> emitters.remove(clienteId));
        emitter.onTimeout(() -> emitters.remove(clienteId));
        emitter.onError(e -> emitters.remove(clienteId));
        try {
            emitter.send(SseEmitter.event().name("conectado").data("Conectado al servidor de notificaciones"));
        } catch (IOException e) {
            emitters.remove(clienteId);
        }
        log.info("Cliente {} suscrito a notificaciones", clienteId);
        return emitter;
    }

    public void notificarCliente(Long clienteId, String tipo, String mensaje) {
        SseEmitter emitter = emitters.get(clienteId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name(tipo)
                        .data(Map.of("tipo", tipo, "mensaje", mensaje, "timestamp", java.time.LocalDateTime.now().toString())));
                log.info("Notificación enviada a cliente {}: {}", clienteId, mensaje);
            } catch (IOException e) {
                emitters.remove(clienteId);
            }
        }
    }

    public void notificarTodos(String tipo, String mensaje) {
        emitters.forEach((clienteId, emitter) -> notificarCliente(clienteId, tipo, mensaje));
    }
}
