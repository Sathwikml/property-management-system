// PaymentRepository.java
package com.property.management.repository;

import com.property.management.entity.Payment;
import com.property.management.entity.Lease;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByLease(Lease lease);
    List<Payment> findByStatus(Payment.PaymentStatus status);
}