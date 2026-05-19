package com.sergio.gestor_pedidos.controller;

import com.sergio.gestor_pedidos.dto.FacturaResponseDTO;
import com.sergio.gestor_pedidos.service.FacturaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/facturas")
@RequiredArgsConstructor
public class FacturaController {

    private final FacturaService facturaService;

    /** Admin genera la factura de un pago completado */
    @PostMapping("/generar/{pagoId}")
    @ResponseStatus(HttpStatus.CREATED)
    public FacturaResponseDTO generar(@PathVariable Long pagoId) {
        return facturaService.generarFactura(pagoId);
    }

    /** Obtener factura por pago */
    @GetMapping("/pago/{pagoId}")
    public FacturaResponseDTO porPago(@PathVariable Long pagoId) {
        return facturaService.obtenerPorPago(pagoId);
    }

    /** Obtener factura por ID */
    @GetMapping("/{id}")
    public FacturaResponseDTO obtener(@PathVariable Long id) {
        return facturaService.obtenerPorId(id);
    }

    /** Listar facturas de un cliente */
    @GetMapping("/cliente/{clienteId}")
    public List<FacturaResponseDTO> porCliente(@PathVariable Long clienteId) {
        return facturaService.listarPorCliente(clienteId);
    }

    /** Listar todas las facturas (admin) */
    @GetMapping
    public List<FacturaResponseDTO> listar() {
        return facturaService.listarTodas();
    }

    /** Anular factura (admin) */
    @PatchMapping("/{id}/anular")
    public FacturaResponseDTO anular(@PathVariable Long id) {
        return facturaService.anular(id);
    }

    /** Descargar PDF de la factura */
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> pdf(@PathVariable Long id) {
        byte[] pdfBytes = facturaService.generarPDF(id);
        FacturaResponseDTO factura = facturaService.obtenerPorId(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + factura.getNumeroFactura() + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
