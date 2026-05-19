package com.sergio.gestor_pedidos.service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.sergio.gestor_pedidos.dto.FacturaResponseDTO;
import com.sergio.gestor_pedidos.exception.RecursoNoEncontradoException;
import com.sergio.gestor_pedidos.exception.ReglaDeNegocioException;
import com.sergio.gestor_pedidos.model.*;
import com.sergio.gestor_pedidos.repository.FacturaRepository;
import com.sergio.gestor_pedidos.repository.PagoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FacturaService {

    private final FacturaRepository facturaRepository;
    private final PagoRepository pagoRepository;

    private static final BigDecimal IVA = new BigDecimal("0.19");
    private static final DeviceRgb COLOR_HEADER = new DeviceRgb(30, 41, 59);
    private static final DeviceRgb COLOR_ACCENT = new DeviceRgb(56, 189, 248);
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /** Genera y guarda la factura al completarse un pago */
    @Transactional
    public FacturaResponseDTO generarFactura(Long pagoId) {
        Pago pago = pagoRepository.findById(pagoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pago no encontrado: " + pagoId));

        if (pago.getEstado() != EstadoPago.COMPLETADO) {
            throw new ReglaDeNegocioException("Solo se puede facturar pagos completados");
        }

        // Verificar si ya existe factura
        if (facturaRepository.findByPagoId(pagoId).isPresent()) {
            throw new ReglaDeNegocioException("Ya existe una factura para este pago");
        }

        Pedido pedido  = pago.getPedido();
        Cliente cliente = pedido.getCliente();

        // Calcular impuestos (IVA 19%)
        BigDecimal total    = pago.getMonto();
        BigDecimal subtotal = total.divide(BigDecimal.ONE.add(IVA), 2, RoundingMode.HALF_UP);
        BigDecimal ivaValor = total.subtract(subtotal);

        String numero = generarNumero();

        Factura factura = Factura.builder()
                .numeroFactura(numero)
                .pago(pago)
                .clienteNombre(cliente.getNombre())
                .clienteEmail(cliente.getEmail())
                .clienteCiudad(cliente.getCiudad())
                .pedidoDescripcion(pedido.getDescripcion())
                .subtotal(subtotal)
                .impuestoPorcentaje(new BigDecimal("19.00"))
                .impuestoValor(ivaValor)
                .total(total)
                .metodoPago(pago.getMetodoPago() != null ? pago.getMetodoPago().name() : null)
                .referenciaPago(pago.getReferenciaExterna())
                .ciudadDestino(pedido.getCiudadDestino())
                .direccionEntrega(pedido.getDireccionEntrega())
                .build();

        factura = facturaRepository.save(factura);
        log.info("Factura generada: {} para pago: {}", numero, pagoId);
        return toDTO(factura);
    }

    public FacturaResponseDTO obtenerPorPago(Long pagoId) {
        return toDTO(facturaRepository.findByPagoId(pagoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe factura para el pago: " + pagoId)));
    }

    public FacturaResponseDTO obtenerPorId(Long id) {
        return toDTO(facturaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Factura no encontrada: " + id)));
    }

    public List<FacturaResponseDTO> listarPorCliente(Long clienteId) {
        return facturaRepository.findByClienteId(clienteId).stream().map(this::toDTO).toList();
    }

    public List<FacturaResponseDTO> listarTodas() {
        return facturaRepository.findAll().stream().map(this::toDTO).toList();
    }

    @Transactional
    public FacturaResponseDTO anular(Long id) {
        Factura f = facturaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Factura no encontrada: " + id));
        if (f.getEstado() == EstadoFactura.ANULADA) {
            throw new ReglaDeNegocioException("La factura ya está anulada");
        }
        f.setEstado(EstadoFactura.ANULADA);
        return toDTO(facturaRepository.save(f));
    }

    /** Genera el PDF de la factura */
    public byte[] generarPDF(Long id) {
        Factura f = facturaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Factura no encontrada: " + id));

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf  = new PdfDocument(writer);
            Document doc     = new Document(pdf);
            PdfFont bold     = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont regular  = PdfFontFactory.createFont(StandardFonts.HELVETICA);

            // ── Encabezado ──────────────────────────────────────────────
            doc.add(new Paragraph("GESTOR DE PEDIDOS")
                    .setFont(bold).setFontSize(22).setFontColor(COLOR_ACCENT)
                    .setTextAlignment(TextAlignment.CENTER));
            doc.add(new Paragraph("FACTURA ELECTRÓNICA")
                    .setFont(bold).setFontSize(14).setFontColor(ColorConstants.DARK_GRAY)
                    .setTextAlignment(TextAlignment.CENTER));
            doc.add(new Paragraph("N° " + f.getNumeroFactura())
                    .setFont(bold).setFontSize(12).setFontColor(COLOR_ACCENT)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(4));
            doc.add(new Paragraph("Fecha: " + f.getEmitidaEn().format(FMT) + "   |   Estado: " + f.getEstado().name())
                    .setFont(regular).setFontSize(9).setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(20));

            // ── Datos del cliente ────────────────────────────────────────
            doc.add(new Paragraph("Datos del Cliente").setFont(bold).setFontSize(12).setMarginBottom(6));
            Table cliente = new Table(UnitValue.createPercentArray(new float[]{2, 3})).useAllAvailableWidth();
            agregarFila(cliente, "Nombre",    f.getClienteNombre(),  bold, regular);
            agregarFila(cliente, "Email",     f.getClienteEmail(),   bold, regular);
            agregarFila(cliente, "Ciudad",    f.getClienteCiudad() != null ? f.getClienteCiudad() : "-", bold, regular);
            if (f.getCiudadDestino() != null)
                agregarFila(cliente, "Destino", f.getCiudadDestino(), bold, regular);
            if (f.getDireccionEntrega() != null)
                agregarFila(cliente, "Dirección", f.getDireccionEntrega(), bold, regular);
            doc.add(cliente);
            doc.add(new Paragraph(" "));

            // ── Detalle del pedido ───────────────────────────────────────
            doc.add(new Paragraph("Detalle del Pedido").setFont(bold).setFontSize(12).setMarginBottom(6));
            Table detalle = new Table(UnitValue.createPercentArray(new float[]{4, 2})).useAllAvailableWidth();
            detalle.addHeaderCell(celdaHeader("Descripción", bold));
            detalle.addHeaderCell(celdaHeader("Valor", bold));
            detalle.addCell(new Cell().add(new Paragraph(f.getPedidoDescripcion()).setFont(regular).setFontSize(10)).setPadding(6));
            detalle.addCell(new Cell().add(new Paragraph("$" + f.getSubtotal().setScale(2, RoundingMode.HALF_UP)).setFont(regular).setFontSize(10)).setPadding(6).setTextAlignment(TextAlignment.RIGHT));
            doc.add(detalle);
            doc.add(new Paragraph(" "));

            // ── Totales ──────────────────────────────────────────────────
            doc.add(new Paragraph("Resumen de Pago").setFont(bold).setFontSize(12).setMarginBottom(6));
            Table totales = new Table(UnitValue.createPercentArray(new float[]{3, 2})).useAllAvailableWidth();
            agregarFilaTotales(totales, "Subtotal (sin IVA)", "$" + f.getSubtotal().setScale(2, RoundingMode.HALF_UP), bold, regular, false);
            agregarFilaTotales(totales, "IVA (" + f.getImpuestoPorcentaje() + "%)", "$" + f.getImpuestoValor().setScale(2, RoundingMode.HALF_UP), bold, regular, false);
            agregarFilaTotales(totales, "TOTAL", "$" + f.getTotal().setScale(2, RoundingMode.HALF_UP), bold, bold, true);
            doc.add(totales);
            doc.add(new Paragraph(" "));

            // ── Pago ─────────────────────────────────────────────────────
            doc.add(new Paragraph("Información de Pago").setFont(bold).setFontSize(12).setMarginBottom(6));
            Table pago = new Table(UnitValue.createPercentArray(new float[]{2, 3})).useAllAvailableWidth();
            agregarFila(pago, "Método", f.getMetodoPago() != null ? f.getMetodoPago().replace("_", " ") : "-", bold, regular);
            if (f.getReferenciaPago() != null)
                agregarFila(pago, "Referencia", f.getReferenciaPago(), bold, regular);
            doc.add(pago);

            // ── Pie de página ────────────────────────────────────────────
            doc.add(new Paragraph("\nEste documento es una factura electrónica válida generada por el sistema Gestor de Pedidos.")
                    .setFont(regular).setFontSize(8).setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER).setMarginTop(20));

            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Error generando PDF de factura", e);
            throw new RuntimeException("No se pudo generar el PDF: " + e.getMessage());
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private String generarNumero() {
        int anio = LocalDateTime.now().getYear();
        long consecutivo = facturaRepository.contarPorAnio(anio) + 1;
        return String.format("FAC-%d-%06d", anio, consecutivo);
    }

    private void agregarFila(Table t, String label, String valor, PdfFont bold, PdfFont regular) {
        t.addCell(new Cell().add(new Paragraph(label).setFont(bold).setFontSize(10)).setPadding(5).setBackgroundColor(new DeviceRgb(241, 245, 249)));
        t.addCell(new Cell().add(new Paragraph(valor).setFont(regular).setFontSize(10)).setPadding(5));
    }

    private void agregarFilaTotales(Table t, String label, String valor, PdfFont bold, PdfFont valorFont, boolean destacar) {
        DeviceRgb bg = destacar ? COLOR_HEADER : new DeviceRgb(255, 255, 255);
        DeviceRgb fg = destacar ? new DeviceRgb(255, 255, 255) : new DeviceRgb(30, 41, 59);
        t.addCell(new Cell().add(new Paragraph(label).setFont(bold).setFontSize(destacar ? 12 : 10).setFontColor(fg)).setBackgroundColor(bg).setPadding(6));
        t.addCell(new Cell().add(new Paragraph(valor).setFont(valorFont).setFontSize(destacar ? 14 : 10).setFontColor(fg)).setBackgroundColor(bg).setPadding(6).setTextAlignment(TextAlignment.RIGHT));
    }

    private Cell celdaHeader(String texto, PdfFont bold) {
        return new Cell().add(new Paragraph(texto).setFont(bold).setFontSize(10).setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(COLOR_HEADER).setPadding(6);
    }

    private FacturaResponseDTO toDTO(Factura f) {
        return FacturaResponseDTO.builder()
                .id(f.getId())
                .numeroFactura(f.getNumeroFactura())
                .pagoId(f.getPago().getId())
                .pedidoId(f.getPago().getPedido().getId())
                .clienteNombre(f.getClienteNombre())
                .clienteEmail(f.getClienteEmail())
                .clienteCiudad(f.getClienteCiudad())
                .pedidoDescripcion(f.getPedidoDescripcion())
                .subtotal(f.getSubtotal())
                .impuestoPorcentaje(f.getImpuestoPorcentaje())
                .impuestoValor(f.getImpuestoValor())
                .total(f.getTotal())
                .metodoPago(f.getMetodoPago())
                .referenciaPago(f.getReferenciaPago())
                .ciudadDestino(f.getCiudadDestino())
                .direccionEntrega(f.getDireccionEntrega())
                .estado(f.getEstado().name())
                .emitidaEn(f.getEmitidaEn())
                .build();
    }
}
