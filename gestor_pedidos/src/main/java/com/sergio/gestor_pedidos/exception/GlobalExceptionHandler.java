package com.sergio.gestor_pedidos.exception;

import com.sergio.gestor_pedidos.dto.ApiErrorDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ApiErrorDTO> handleNotFound(RecursoNoEncontradoException ex) {
        return build(HttpStatus.NOT_FOUND, "No encontrado", ex.getMessage(), null);
    }

    @ExceptionHandler(ReglaDeNegocioException.class)
    public ResponseEntity<ApiErrorDTO> handleBusiness(ReglaDeNegocioException ex) {
        return build(HttpStatus.CONFLICT, "Regla de negocio", ex.getMessage(), null);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorDTO> handleIllegal(IllegalArgumentException ex) {
        return build(HttpStatus.BAD_REQUEST, "Solicitud inválida", ex.getMessage(), null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorDTO> handleValidation(MethodArgumentNotValidException ex) {
        List<String> detalles = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .toList();
        return build(HttpStatus.BAD_REQUEST, "Error de validación", "Revisa los campos enviados", detalles);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorDTO> handleGeneric(Exception ex) {
        ex.printStackTrace(); // visible en los logs del servidor
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno", ex.getMessage(), null);
    }

    private ResponseEntity<ApiErrorDTO> build(HttpStatus status, String error, String mensaje, List<String> detalles) {
        ApiErrorDTO body = ApiErrorDTO.builder()
                .status(status.value())
                .error(error)
                .mensaje(mensaje)
                .detalles(detalles)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(status).body(body);
    }
}
