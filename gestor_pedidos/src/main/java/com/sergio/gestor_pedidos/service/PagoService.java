package com.sergio.gestor_pedidos.service;

import com.sergio.gestor_pedidos.dto.CambioEstadoDTO;
import com.sergio.gestor_pedidos.dto.PagoRequestDTO;
import com.sergio.gestor_pedidos.dto.PagoResponseDTO;
import com.sergio.gestor_pedidos.exception.RecursoNoEncontradoException;
import com.sergio.gestor_pedidos.exception.ReglaDeNegocioException;
import com.sergio.gestor_pedidos.mapper.PagoMapper;
import com.sergio.gestor_pedidos.model.*;
import com.sergio.gestor_pedidos.repository.CarritoRepository;
import com.sergio.gestor_pedidos.repository.FacturaRepository;
import com.sergio.gestor_pedidos.repository.PagoRepository;
import com.sergio.gestor_pedidos.repository.PedidoRepository;
import com.sergio.gestor_pedidos.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class PagoService {

    private final PagoRepository pagoRepository;
    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final CarritoRepository carritoRepository;
    private final FacturaRepository facturaRepository;
    private final PasarelaPagoService pasarelaPagoService;
    private final PedidoService pedidoService;
    private final PagoMapper pagoMapper;

    @Transactional
    public PagoResponseDTO procesarPago(PagoRequestDTO dto) {
        Pedido pedido = pedidoRepository.findById(dto.getPedidoId())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Pedido no encontrado con id: " + dto.getPedidoId()));

        if (pedido.getEstado() == EstadoPedido.PAGADO) {
            throw new ReglaDeNegocioException("El pedido ya fue pagado");
        }
        if (pedido.getEstado() == EstadoPedido.CANCELADO) {
            throw new ReglaDeNegocioException("No se puede pagar un pedido cancelado");
        }
        if (pedido.getEstado() == EstadoPedido.CREADO) {
            throw new ReglaDeNegocioException("El pedido debe estar CONFIRMADO antes de pagar");
        }

        pagoRepository.findByPedidoId(dto.getPedidoId()).ifPresent(p -> {
            if (p.getEstado() == EstadoPago.COMPLETADO) {
                throw new ReglaDeNegocioException("Ya existe un pago completado para este pedido");
            }
        });

        Pago pago = Pago.builder()
                .pedido(pedido)
                .monto(pedido.getTotal())
                .metodoPago(dto.getMetodoPago())
                .estado(EstadoPago.PENDIENTE)
                .build();
        pago = pagoRepository.save(pago);

        PasarelaPagoService.ResultadoPago resultado =
                pasarelaPagoService.procesarPago(dto, pedido.getTotal());

        pago.setProcesadoEn(LocalDateTime.now());
        pago.setMensajeRespuesta(resultado.mensaje());

        if (resultado.exitoso()) {
            pago.setEstado(EstadoPago.COMPLETADO);
            pago.setReferenciaExterna(resultado.referencia());
            pagoRepository.save(pago);

            // ── DESCUENTO DE STOCK ──────────────────────────────────────
            // Buscar el carrito PROCESANDO del cliente para obtener los items
            carritoRepository
                .findByClienteIdAndEstado(pedido.getCliente().getId(), EstadoCarrito.PROCESANDO)
                .ifPresent(carrito -> {
                    carrito.getItems().forEach(item -> {
                        Producto producto = item.getProducto();
                        int nuevoStock = Math.max(0, producto.getStock() - item.getCantidad());
                        producto.setStock(nuevoStock);
                        productoRepository.save(producto);
                        log.info("Stock descontado - producto: {}, cantidad: {}, stock restante: {}",
                                producto.getNombre(), item.getCantidad(), nuevoStock);
                    });
                    carrito.setEstado(EstadoCarrito.COMPLETADO);
                    carritoRepository.save(carrito);
                });

            // Cambiar estado del pedido a PAGADO
            CambioEstadoDTO cambio = new CambioEstadoDTO();
            cambio.setEstado(EstadoPedido.PAGADO);
            pedidoService.cambiarEstado(pedido.getId(), cambio);

            // ── GENERAR FACTURA AUTOMATICAMENTE ─────────────────────────
            generarFacturaAutomatica(pago);

            log.info("Pago completado - pedido: {}, referencia: {}", pedido.getId(), resultado.referencia());
        } else {
            pago.setEstado(EstadoPago.FALLIDO);
            pagoRepository.save(pago);
            log.warn("Pago fallido - pedido: {}, motivo: {}", pedido.getId(), resultado.mensaje());
        }

        return pagoMapper.toResponse(pago);
    }

    public PagoResponseDTO obtenerPorId(Long id) {
        return pagoMapper.toResponse(pagoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pago no encontrado con id: " + id)));
    }

    @Transactional
    public PagoResponseDTO confirmarPago(Long pagoId) {
        Pago pago = buscarPago(pagoId);
        if (pago.getEstado() != EstadoPago.COMPLETADO) {
            throw new ReglaDeNegocioException("Solo se pueden confirmar pagos completados");
        }
        Pedido pedido = pago.getPedido();
        if (pedido.getEstado() != EstadoPedido.CONFIRMADO) {
            throw new ReglaDeNegocioException("El pedido debe estar CONFIRMADO para marcarlo como PAGADO");
        }
        CambioEstadoDTO cambio = new CambioEstadoDTO();
        cambio.setEstado(EstadoPedido.PAGADO);
        pedidoService.cambiarEstado(pedido.getId(), cambio);
        return pagoMapper.toResponse(pago);
    }

    /** USUARIO: solicita reembolso — solo marca el pago, no toca el pedido */
    @Transactional
    public PagoResponseDTO solicitarReembolso(Long pagoId, String motivo) {
        Pago pago = buscarPago(pagoId);
        if (pago.getEstado() != EstadoPago.COMPLETADO) {
            throw new ReglaDeNegocioException("Solo puedes solicitar reembolso de pagos completados");
        }
        String msg = motivo != null && !motivo.isBlank()
                ? "Solicitud de reembolso: " + motivo.trim()
                : "Solicitud de reembolso";
        pago.setEstado(EstadoPago.SOLICITADO_REEMBOLSO);
        pago.setMensajeRespuesta(msg);
        pagoRepository.save(pago);
        log.info("Solicitud de reembolso - pagoId: {}, motivo: {}", pagoId, msg);
        return pagoMapper.toResponse(pago);
    }

    /** ADMIN: aprueba el reembolso y restaura el stock */
    @Transactional
    public PagoResponseDTO reembolsarPago(Long pagoId, String motivo) {
        Pago pago = buscarPago(pagoId);
        if (pago.getEstado() != EstadoPago.COMPLETADO && pago.getEstado() != EstadoPago.SOLICITADO_REEMBOLSO) {
            throw new ReglaDeNegocioException("Solo se pueden reembolsar pagos completados o con solicitud pendiente");
        }

        boolean exito = pasarelaPagoService.reembolsarPago(pago.getReferenciaExterna(), pago.getMonto());
        if (!exito) {
            throw new ReglaDeNegocioException("No se pudo procesar el reembolso en la pasarela");
        }

        String mensajeReembolso = motivo != null && !motivo.isBlank()
                ? "Reembolsado: " + motivo.trim()
                : "Reembolso aprobado por administrador";

        pago.setEstado(EstadoPago.REEMBOLSADO);
        pago.setMensajeRespuesta(mensajeReembolso);
        pago.setProcesadoEn(LocalDateTime.now());
        pagoRepository.save(pago);

        // ── RESTAURAR STOCK ─────────────────────────────────────────────
        Pedido pedido = pago.getPedido();
        carritoRepository.findByClienteId(pedido.getCliente().getId()).stream()
            .filter(c -> c.getEstado() == EstadoCarrito.COMPLETADO)
            .findFirst()
            .ifPresent(carrito -> {
                carrito.getItems().forEach(item -> {
                    Producto producto = item.getProducto();
                    producto.setStock(producto.getStock() + item.getCantidad());
                    productoRepository.save(producto);
                    log.info("Stock restaurado - producto: {}, cantidad: {}", producto.getNombre(), item.getCantidad());
                });
            });

        if (pedido.getEstado() == EstadoPedido.PAGADO) {
            CambioEstadoDTO cambio = new CambioEstadoDTO();
            cambio.setEstado(EstadoPedido.REEMBOLSADO);
            pedidoService.cambiarEstado(pedido.getId(), cambio);
        }

        log.info("Reembolso aprobado - pagoId: {}", pagoId);
        return pagoMapper.toResponse(pago);
    }

    private Pago buscarPago(Long id) {
        return pagoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pago no encontrado con id: " + id));
    }

    /** Genera la factura automáticamente al completarse el pago */
    private void generarFacturaAutomatica(Pago pago) {
        try {
            if (facturaRepository.findByPagoId(pago.getId()).isPresent()) return;

            Pedido pedido   = pago.getPedido();
            Cliente cliente = pedido.getCliente();

            BigDecimal IVA      = new BigDecimal("0.19");
            BigDecimal total    = pago.getMonto();
            BigDecimal subtotal = total.divide(BigDecimal.ONE.add(IVA), 2, RoundingMode.HALF_UP);
            BigDecimal ivaValor = total.subtract(subtotal);

            long consecutivo = facturaRepository.contarPorAnio(LocalDateTime.now().getYear()) + 1;
            String numero = String.format("FAC-%d-%06d", LocalDateTime.now().getYear(), consecutivo);

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

            facturaRepository.save(factura);
            log.info("Factura generada automáticamente: {} para pago: {}", numero, pago.getId());
        } catch (Exception e) {
            log.error("Error generando factura automática para pago {}: {}", pago.getId(), e.getMessage());
        }
    }

    public PagoResponseDTO obtenerPorPedido(Long pedidoId) {
        return pagoMapper.toResponse(pagoRepository.findByPedidoId(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe pago para el pedido: " + pedidoId)));
    }

    public List<PagoResponseDTO> listarTodos() {
        return pagoRepository.findAll().stream().map(pagoMapper::toResponse).toList();
    }

    public List<PagoResponseDTO> listarPorCliente(Long clienteId) {
        return pagoRepository.findByClienteId(clienteId).stream().map(pagoMapper::toResponse).toList();
    }
}
