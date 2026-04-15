package com.property.management.controller;

import com.property.management.entity.Payment;
import com.property.management.entity.Lease;
import com.property.management.service.PaymentService;
import com.property.management.repository.LeaseRepository;
import com.property.management.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class PaymentController {
    private final PaymentService paymentService;
    private final LeaseRepository leaseRepository;
    private final PaymentRepository paymentRepository;

    /**
     * Get all payments (for landlords/admins)
     */
    @GetMapping("/payments")
    public ResponseEntity<List<Payment>> getAllPayments(Authentication authentication) {
        return ResponseEntity.ok(paymentService.getAllPayments(authentication));
    }

    /**
     * Get a specific payment by ID
     */
    @GetMapping("/payments/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    /**
     * Get all payments for the authenticated tenant
     */
    @GetMapping("/tenant/payments")
    public ResponseEntity<List<Payment>> getTenantPayments(Authentication authentication) {
        return ResponseEntity.ok(paymentService.getTenantPayments(authentication));
    }

    /**
     * Create a new payment
     */
    @PostMapping("/payments")
    public ResponseEntity<Payment> createPayment(@RequestBody Payment payment) {
        Payment createdPayment = paymentService.createPayment(payment);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPayment);
    }

    /**
     * Submit a tenant payment with payment details
     */
    @PostMapping("/payments/submit")
    public ResponseEntity<Payment> submitTenantPayment(
            @RequestBody Map<String, Object> paymentData,
            Authentication authentication) {
        
        try {
            Long paymentId = Long.valueOf(paymentData.get("paymentId").toString());
            String paymentMethod = paymentData.get("paymentMethod").toString();
            String transactionId = paymentData.get("transactionId").toString();
            String notes = paymentData.getOrDefault("notes", "").toString();
            
            Payment payment = paymentService.submitTenantPayment(
                paymentId, 
                paymentMethod, 
                transactionId, 
                notes,
                authentication
            );
            
            return ResponseEntity.ok(payment);
            
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid payment ID format");
        } catch (NullPointerException e) {
            throw new IllegalArgumentException("Missing required payment data");
        }
    }

    /**
     * Update payment status
     */
    @PatchMapping("/payments/{id}/status")
    public ResponseEntity<Payment> updatePaymentStatus(
            @PathVariable Long id, 
            @RequestBody Map<String, String> body) {
        
        try {
            Payment.PaymentStatus status = Payment.PaymentStatus.valueOf(body.get("status"));
            Payment updatedPayment = paymentService.updatePaymentStatus(id, status);
            return ResponseEntity.ok(updatedPayment);
            
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid payment status: " + body.get("status"));
        }
    }

    /**
     * Generate a payment for a lease (Landlord feature)
     */
    @PostMapping("/landlord/payments/generate")
    public ResponseEntity<?> generatePaymentForLease(
            @RequestParam Long leaseId,
            @RequestParam BigDecimal amount,
            @RequestParam String dueDate,
            @RequestParam(required = false) String description) {
        
        try {
            // Validate lease exists
            Lease lease = leaseRepository.findById(leaseId)
                .orElseThrow(() -> new RuntimeException("Lease not found with id: " + leaseId));
            
            // Validate amount
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("Amount must be greater than zero"));
            }
            
            // Parse and validate due date
            LocalDate parsedDueDate;
            try {
                parsedDueDate = LocalDate.parse(dueDate);
            } catch (Exception e) {
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("Invalid date format. Use YYYY-MM-DD"));
            }
            
            // Create payment
            Payment payment = new Payment();
            payment.setLease(lease);
            payment.setAmount(amount);
            payment.setDueDate(parsedDueDate);
            payment.setStatus(Payment.PaymentStatus.PENDING);
            
            // Set description
            if (description != null && !description.trim().isEmpty()) {
                payment.setDescription(description);
            } else {
                payment.setDescription("Monthly Rent - " + dueDate);
            }
            
            // Save payment
            Payment savedPayment = paymentRepository.save(payment);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPayment);
            
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(createErrorResponse(e.getMessage()));
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to generate payment: " + e.getMessage()));
        }
    }

    // Helper method to create error responses
    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        response.put("timestamp", LocalDate.now().toString());
        return response;
    }
}
