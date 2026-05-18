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
import com.sergio.gestor_pedidos.model.EstadoPedido;
import com.sergio.gestor_pedidos.model.Pago;
import com.sergio.gestor_pedidos.model.Pedido;
import com.sergio.gestor_pedidos.model.Producto;
import com.sergio.gestor_pedidos.repository.PagoRepository;
import com.sergio.gestor_pedidos.repository.PedidoRepository;
import com.sergio.gestor_pedidos.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReporteService {

    private final PedidoRepository pedidoRepository;
    private final PagoRepository pagoRepository;
    private final ProductoRepository productoRepository;

    private static final DeviceRgb COLOR_HEADER  = new DeviceRgb(30, 41, 59);   // #1e293b
    private static final DeviceRgb COLOR_ACCENT  = new DeviceRgb(56, 189, 248);  // #38bdf8
    private static final DeviceRgb COLOR_ROW_ALT = new DeviceRgb(241, 245, 249); // #f1f5f9
    private static final DateTimeFormatter FMT    = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter FMT_D  = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    /** Reporte general de ventas */
    public byte[] generarReporteVentas(LocalDate desde, LocalDate hasta) {
        List<Pedido> pedidos = pedidoRepository.findAll().stream()
                .filter(p -> {
                    LocalDate fecha = p.getFecha().toLocalDate();
                    return !fecha.isBefore(desde) && !fecha.isAfter(hasta);
                })
                .collect(Collectors.toList());

        List<Pago> pagos = pagoRepository.findAll().stream()
                .filter(p -> p.getProcesadoEn() != null)
                .filter(p -> {
                    LocalDate fecha = p.getProcesadoEn().toLocalDate();
                    return !fecha.isBefore(desde) && !fecha.isAfter(hasta);
                })
                .collect(Collectors.toList());

        BigDecimal totalFacturado = pagos.stream()
                .filter(p -> p.getEstado().name().equals("COMPLETADO"))
                .map(Pago::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf  = new PdfDocument(writer);
            Document doc     = new Document(pdf);
            PdfFont bold     = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont regular  = PdfFontFactory.createFont(StandardFonts.HELVETICA);

            // ── Encabezado ──────────────────────────────────────────────
            doc.add(new Paragraph("GESTOR DE PEDIDOS")
                    .setFont(bold).setFontSize(20).setFontColor(COLOR_ACCENT)
                    .setTextAlignment(TextAlignment.CENTER));
            doc.add(new Paragraph("Reporte de Ventas")
                    .setFont(bold).setFontSize(14).setFontColor(ColorConstants.DARK_GRAY)
                    .setTextAlignment(TextAlignment.CENTER));
            doc.add(new Paragraph("Período: " + desde.format(FMT_D) + " — " + hasta.format(FMT_D))
                    .setFont(regular).setFontSize(10).setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(10));
            doc.add(new Paragraph("Generado: " + LocalDateTime.now().format(FMT))
                    .setFont(regular).setFontSize(9).setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(20));

            // ── Resumen ──────────────────────────────────────────────────
            doc.add(new Paragraph("Resumen").setFont(bold).setFontSize(13).setMarginBottom(6));
            Table resumen = new Table(UnitValue.createPercentArray(new float[]{3, 2})).useAllAvailableWidth();
            agregarFilaResumen(resumen, "Total pedidos en el período", String.valueOf(pedidos.size()), bold, regular, false);
            agregarFilaResumen(resumen, "Pedidos pagados", String.valueOf(pedidos.stream().filter(p -> p.getEstado() == EstadoPedido.PAGADO || p.getEstado() == EstadoPedido.ENTREGADO).count()), bold, regular, true);
            agregarFilaResumen(resumen, "Pedidos cancelados", String.valueOf(pedidos.stream().filter(p -> p.getEstado() == EstadoPedido.CANCELADO).count()), bold, regular, false);
            agregarFilaResumen(resumen, "Reembolsos", String.valueOf(pedidos.stream().filter(p -> p.getEstado() == EstadoPedido.REEMBOLSADO).count()), bold, regular, true);
            agregarFilaResumen(resumen, "Total facturado", "$" + totalFacturado.setScale(2, java.math.RoundingMode.HALF_UP), bold, regular, false);
            doc.add(resumen);
            doc.add(new Paragraph(" "));

            // ── Tabla de pedidos ─────────────────────────────────────────
            doc.add(new Paragraph("Detalle de Pedidos").setFont(bold).setFontSize(13).setMarginBottom(6));
            Table tabla = new Table(UnitValue.createPercentArray(new float[]{1, 3, 2, 1.5f, 1.5f, 1.5f})).useAllAvailableWidth();
            String[] headers = {"ID", "Descripción", "Cliente", "Total", "Estado", "Fecha"};
            for (String h : headers) {
                tabla.addHeaderCell(new Cell().add(new Paragraph(h).setFont(bold).setFontSize(9).setFontColor(ColorConstants.WHITE))
                        .setBackgroundColor(COLOR_HEADER).setPadding(5));
            }
            boolean alt = false;
            for (Pedido p : pedidos) {
                DeviceRgb bg = alt ? COLOR_ROW_ALT : new DeviceRgb(255, 255, 255);
                tabla.addCell(celda("#" + p.getId(), regular, bg));
                tabla.addCell(celda(truncar(p.getDescripcion(), 40), regular, bg));
                tabla.addCell(celda(p.getCliente() != null ? p.getCliente().getNombre() : "-", regular, bg));
                tabla.addCell(celda("$" + p.getTotal().setScale(2, java.math.RoundingMode.HALF_UP), regular, bg));
                tabla.addCell(celda(p.getEstado().name(), regular, bg));
                tabla.addCell(celda(p.getFecha() != null ? p.getFecha().format(FMT_D) : "-", regular, bg));
                alt = !alt;
            }
            doc.add(tabla);

            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Error generando reporte de ventas", e);
            throw new RuntimeException("No se pudo generar el reporte PDF: " + e.getMessage());
        }
    }

    /** Reporte de productos más vendidos */
    public byte[] generarReporteProductos() {
        List<Producto> productos = productoRepository.findAll();

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf  = new PdfDocument(writer);
            Document doc     = new Document(pdf);
            PdfFont bold     = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont regular  = PdfFontFactory.createFont(StandardFonts.HELVETICA);

            doc.add(new Paragraph("GESTOR DE PEDIDOS")
                    .setFont(bold).setFontSize(20).setFontColor(COLOR_ACCENT)
                    .setTextAlignment(TextAlignment.CENTER));
            doc.add(new Paragraph("Reporte de Inventario de Productos")
                    .setFont(bold).setFontSize(14).setFontColor(ColorConstants.DARK_GRAY)
                    .setTextAlignment(TextAlignment.CENTER));
            doc.add(new Paragraph("Generado: " + LocalDateTime.now().format(FMT))
                    .setFont(regular).setFontSize(9).setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER).setMarginBottom(20));

            // Resumen
            long sinStock = productos.stream().filter(p -> p.getStock() == 0).count();
            long stockBajo = productos.stream().filter(p -> p.getStock() > 0 && p.getStock() <= 5).count();
            doc.add(new Paragraph("Resumen").setFont(bold).setFontSize(13).setMarginBottom(6));
            Table resumen = new Table(UnitValue.createPercentArray(new float[]{3, 2})).useAllAvailableWidth();
            agregarFilaResumen(resumen, "Total productos activos", String.valueOf(productos.stream().filter(Producto::getActivo).count()), bold, regular, false);
            agregarFilaResumen(resumen, "Sin stock", String.valueOf(sinStock), bold, regular, true);
            agregarFilaResumen(resumen, "Stock bajo (≤5 unidades)", String.valueOf(stockBajo), bold, regular, false);
            doc.add(resumen);
            doc.add(new Paragraph(" "));

            // Tabla
            doc.add(new Paragraph("Inventario").setFont(bold).setFontSize(13).setMarginBottom(6));
            Table tabla = new Table(UnitValue.createPercentArray(new float[]{1, 3, 3, 1.5f, 1.5f, 1.5f})).useAllAvailableWidth();
            for (String h : new String[]{"ID", "Nombre", "Descripción", "Precio", "Stock", "Estado"}) {
                tabla.addHeaderCell(new Cell().add(new Paragraph(h).setFont(bold).setFontSize(9).setFontColor(ColorConstants.WHITE))
                        .setBackgroundColor(COLOR_HEADER).setPadding(5));
            }
            boolean alt = false;
            for (Producto p : productos) {
                DeviceRgb bg = p.getStock() == 0
                        ? new DeviceRgb(254, 226, 226)
                        : (alt ? COLOR_ROW_ALT : new DeviceRgb(255, 255, 255));
                tabla.addCell(celda("#" + p.getId(), regular, bg));
                tabla.addCell(celda(p.getNombre(), regular, bg));
                tabla.addCell(celda(truncar(p.getDescripcion() != null ? p.getDescripcion() : "-", 35), regular, bg));
                tabla.addCell(celda("$" + p.getPrecio().setScale(2, java.math.RoundingMode.HALF_UP), regular, bg));
                tabla.addCell(celda(String.valueOf(p.getStock()), regular, bg));
                tabla.addCell(celda(p.getActivo() ? "Activo" : "Inactivo", regular, bg));
                alt = !alt;
            }
            doc.add(tabla);
            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Error generando reporte de productos", e);
            throw new RuntimeException("No se pudo generar el reporte PDF: " + e.getMessage());
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void agregarFilaResumen(Table t, String label, String valor, PdfFont bold, PdfFont regular, boolean alt) {
        DeviceRgb bg = alt ? COLOR_ROW_ALT : new DeviceRgb(255, 255, 255);
        t.addCell(new Cell().add(new Paragraph(label).setFont(regular).setFontSize(10)).setBackgroundColor(bg).setPadding(5));
        t.addCell(new Cell().add(new Paragraph(valor).setFont(bold).setFontSize(10)).setBackgroundColor(bg).setPadding(5).setTextAlignment(TextAlignment.RIGHT));
    }

    private Cell celda(String texto, PdfFont font, DeviceRgb bg) {
        return new Cell().add(new Paragraph(texto).setFont(font).setFontSize(9))
                .setBackgroundColor(bg).setPadding(4);
    }

    private String truncar(String s, int max) {
        if (s == null) return "-";
        return s.length() > max ? s.substring(0, max) + "..." : s;
    }
}
