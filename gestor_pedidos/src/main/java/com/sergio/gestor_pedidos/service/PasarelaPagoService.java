package com.sergio.gestor_pedidos.service;

import com.sergio.gestor_pedidos.dto.PagoRequestDTO;
import com.sergio.gestor_pedidos.model.MetodoPago;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Pasarela de pagos con soporte de modo MOCK y Stripe test.
 * En producción, aquí se puede separar en un microservicio de pagos.
 */
@Service
@Slf4j
public class PasarelaPagoService {

    @Value("${pagos.proveedor:STRIPE}")
    private String proveedor;

    @Value("${pagos.stripe.api-key:}")
    private String stripeApiKey;

    @Value("${pagos.stripe.currency:usd}")
    private String stripeCurrency;

    public record ResultadoPago(boolean exitoso, String referencia, String mensaje) {}

    public ResultadoPago procesarPago(PagoRequestDTO dto, BigDecimal monto) {
        log.info("Procesando pago en proveedor {} - método: {}, monto: {}", proveedor, dto.getMetodoPago(), monto);

        if ("STRIPE".equalsIgnoreCase(proveedor)) {
            return procesarPagoStripe(dto, monto);
        }

        return procesarPagoMock(dto, monto);
    }

    private ResultadoPago procesarPagoMock(PagoRequestDTO dto, BigDecimal monto) {
        log.info("Procesando pago simulado - método: {}, monto: {}", dto.getMetodoPago(), monto);

        if (dto.getNumeroTarjeta() != null && dto.getNumeroTarjeta().endsWith("0000")) {
            log.warn("Pago rechazado (simulación) para tarjeta terminada en 0000");
            return new ResultadoPago(false, null, "Pago rechazado: fondos insuficientes");
        }

        try { Thread.sleep(300); } catch (InterruptedException ignored) {}

        String referencia = "PAY-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        log.info("Pago aprobado - referencia: {}", referencia);
        return new ResultadoPago(true, referencia, "Pago aprobado exitosamente");
    }

    private ResultadoPago procesarPagoStripe(PagoRequestDTO dto, BigDecimal monto) {
        if (stripeApiKey == null || stripeApiKey.isBlank()) {
            log.error("Stripe está configurado como proveedor, pero no está definida la clave STRIPE_API_KEY");
            return new ResultadoPago(false, null, "Stripe no está configurado. Define STRIPE_API_KEY.");
        }

        if (dto.getMetodoPago() != MetodoPago.TARJETA_CREDITO && dto.getMetodoPago() != MetodoPago.TARJETA_DEBITO) {
            log.info("Stripe sólo procesa tarjetas en este demo. Usando simulación para {}", dto.getMetodoPago());
            return procesarPagoMock(dto, monto);
        }

        if (dto.getNumeroTarjeta() == null || dto.getNumeroTarjeta().isBlank() || dto.getFechaExpiracion() == null || dto.getFechaExpiracion().isBlank() || dto.getCvv() == null || dto.getCvv().isBlank()) {
            return new ResultadoPago(false, null, "Faltan datos de tarjeta para Stripe.");
        }

        Integer expMonth = null;
        Integer expYear = null;
        try {
            String[] partes = dto.getFechaExpiracion().trim().split("/");
            if (partes.length >= 2) {
                expMonth = Integer.parseInt(partes[0].trim());
                expYear = Integer.parseInt(partes[1].trim());
                if (expYear < 100) {
                    expYear += 2000;
                }
            }
        } catch (NumberFormatException ignored) {
        }

        if (expMonth == null || expYear == null) {
            return new ResultadoPago(false, null, "Formato de fecha de expiración inválido (MM/AA).");
        }

        Stripe.apiKey = stripeApiKey;
 
        try {
            // Stripe Java SDK 23+ no longer exposes a direct PaymentMethodData.Card builder
            // for raw card details in PaymentIntentCreateParams. For this demo, use a known
            // test payment method so the flow compiles and can be exercised in test mode.
            String paymentMethod = "pm_card_visa";
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(monto.multiply(BigDecimal.valueOf(100)).longValue())
                    .setCurrency(stripeCurrency)
                    .setPaymentMethod(paymentMethod)
                    .setConfirm(true)
                    .setDescription("Pago Gestor de Pedidos pedido " + dto.getPedidoId())
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);
            log.info("Stripe pago aprobado - id: {}", intent.getId());
            return new ResultadoPago(true, intent.getId(), "Pago aprobado por Stripe");
        } catch (StripeException e) {
            log.warn("Error Stripe: {}", e.getMessage(), e);
            return new ResultadoPago(false, null, "Pago fallido Stripe: " + e.getMessage());
        }
    }

    public boolean reembolsarPago(String referencia, BigDecimal monto) {
        if (referencia == null || referencia.isBlank()) {
            log.warn("No hay referencia externa para reembolsar el pago");
            return false;
        }
        if ("STRIPE".equalsIgnoreCase(proveedor)) {
            return reembolsarPagoStripe(referencia, monto);
        }
        log.info("Reembolso simulado de {} para referencia {}", monto, referencia);
        return true;
    }

    private boolean reembolsarPagoStripe(String paymentIntentId, BigDecimal monto) {
        if (stripeApiKey == null || stripeApiKey.isBlank()) {
            log.error("Stripe está configurado como proveedor, pero no está definida la clave STRIPE_API_KEY");
            return false;
        }

        Stripe.apiKey = stripeApiKey;

        try {
            RefundCreateParams params = RefundCreateParams.builder()
                    .setPaymentIntent(paymentIntentId)
                    .setAmount(monto.multiply(BigDecimal.valueOf(100)).longValue())
                    .build();
            Refund refund = Refund.create(params);
            log.info("Reembolso Stripe realizado - id: {}", refund.getId());
            return true;
        } catch (StripeException e) {
            log.warn("Error Stripe reembolso: {}", e.getMessage(), e);
            return false;
        }
    }
}
