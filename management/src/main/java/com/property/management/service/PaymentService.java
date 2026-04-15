// PaymentService.java
package com.property.management.service;

import com.property.management.entity.Payment;
import com.property.management.entity.Payment.PaymentStatus;
import com.property.management.entity.Lease;
import com.property.management.entity.User;
import com.property.management.repository.PaymentRepository;
import com.property.management.repository.LeaseRepository;
import com.property.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // ✅ ADD THIS IMPORT

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional // ✅ ADD THIS ANNOTATION - Makes all methods transactional
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final LeaseRepository leaseRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true) // ✅ Optimize read-only operations
    public List<Payment> getAllPayments(Authentication authentication) {
        User user = getUserFromAuth(authentication);
        if (user.getRole() == User.UserRole.TENANT) {
            return getTenantPayments(authentication);
        }
        return paymentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Payment> getTenantPayments(Authentication authentication) {
        User tenant = getUserFromAuth(authentication);
        List<Lease> tenantLeases = leaseRepository.findByTenant(tenant);
        return tenantLeases.stream()
                .flatMap(lease -> paymentRepository.findByLease(lease).stream())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    public Payment createPayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    public Payment updatePaymentStatus(Long id, Payment.PaymentStatus status) {
        Payment payment = getPaymentById(id);
        payment.setStatus(status);
        if (status == Payment.PaymentStatus.PAID && payment.getPaymentDate() == null) {
            payment.setPaymentDate(LocalDate.now());
        }
        return paymentRepository.save(payment);
    }

    // ✅ CRITICAL FIX - Explicit @Transactional to ensure database commit
    @Transactional
    public Payment submitTenantPayment(
            Long paymentId, 
            String paymentMethod, 
            String transactionId, 
            String notes,
            Authentication authentication) {
        
        // ✅ Add detailed logging for debugging
        System.out.println("==========================================");
        System.out.println("🔵 SUBMITTING PAYMENT - START");
        System.out.println("Payment ID: " + paymentId);
        System.out.println("Payment Method: " + paymentMethod);
        System.out.println("Transaction ID: " + transactionId);
        System.out.println("==========================================");
        
        // Get the payment
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + paymentId));
        
        System.out.println("📄 BEFORE UPDATE:");
        System.out.println("  Status: " + payment.getStatus());
        System.out.println("  Payment Date: " + payment.getPaymentDate());
        System.out.println("  Payment Method: " + payment.getPaymentMethod());
        System.out.println("  Transaction ID: " + payment.getTransactionId());
        
        // Verify this payment belongs to the authenticated tenant
        User tenant = getUserFromAuth(authentication);
        if (!payment.getLease().getTenant().getId().equals(tenant.getId())) {
            throw new RuntimeException("Unauthorized access to payment");
        }
        
        // Update payment details
        payment.setPaymentMethod(paymentMethod);
        payment.setTransactionId(transactionId);
        payment.setPaymentDate(LocalDate.now());
        payment.setStatus(PaymentStatus.PAID);
        
        if (notes != null && !notes.isEmpty()) {
            String currentDescription = payment.getDescription() != null ? payment.getDescription() : "";
            payment.setDescription(currentDescription + " - " + notes);
        }
        
        // ✅ Save with immediate flush to database
        Payment savedPayment = paymentRepository.saveAndFlush(payment);
        
        System.out.println("📝 AFTER SAVE:");
        System.out.println("  Status: " + savedPayment.getStatus());
        System.out.println("  Payment Date: " + savedPayment.getPaymentDate());
        System.out.println("  Payment Method: " + savedPayment.getPaymentMethod());
        System.out.println("  Transaction ID: " + savedPayment.getTransactionId());
        System.out.println("✅ PAYMENT SUBMITTED SUCCESSFULLY");
        System.out.println("==========================================");
        
        return savedPayment;
    }

    @Transactional(readOnly = true)
    private User getUserFromAuth(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
