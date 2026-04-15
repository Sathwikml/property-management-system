// LeaseService.java
package com.property.management.service;

import com.property.management.dto.LeaseDTO;
import com.property.management.entity.Lease;
import com.property.management.entity.Property;
import com.property.management.entity.User;
import com.property.management.repository.LeaseRepository;
import com.property.management.repository.PropertyRepository;
import com.property.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LeaseService {
    private final LeaseRepository leaseRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    public List<Lease> getAllLeases(Authentication authentication) {
        User user = getUserFromAuth(authentication);
        if (user.getRole() == User.UserRole.TENANT) {
            return leaseRepository.findByTenant(user);
        }
        return leaseRepository.findAll();
    }

    public Lease getLeaseById(Long id) {
        return leaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lease not found"));
    }

    // OLD METHOD - Keep this for backward compatibility if needed
    public Lease createLease(Lease lease) {
        Property property = propertyRepository.findById(lease.getProperty().getId())
                .orElseThrow(() -> new RuntimeException("Property not found"));
        
        property.setOccupied(true);
        propertyRepository.save(property);
        
        return leaseRepository.save(lease);
    }

    // ✅✅✅ NEW METHOD - Creates lease with ACTIVE status
    @Transactional
    public Lease createLeaseFromDTO(LeaseDTO leaseDTO) {
        // Step 1: Find the tenant by email
        User tenant = userRepository.findByEmail(leaseDTO.getTenantEmail())
                .orElseThrow(() -> new RuntimeException("Tenant not found with email: " + leaseDTO.getTenantEmail()));

        // Step 2: Find the property by ID
        Property property = propertyRepository.findById(leaseDTO.getPropertyId())
                .orElseThrow(() -> new RuntimeException("Property not found with ID: " + leaseDTO.getPropertyId()));

        // Step 3: Create the lease with existing entities
        Lease lease = new Lease();
        lease.setTenant(tenant);
        lease.setProperty(property);
        lease.setStartDate(leaseDTO.getStartDate());
        lease.setEndDate(leaseDTO.getEndDate());
        lease.setRentAmount(leaseDTO.getRentAmount());
        lease.setSecurityDeposit(leaseDTO.getSecurityDeposit());
        lease.setTerms(leaseDTO.getTerms());
        
        // ✅ CHANGED: Set status to ACTIVE (not PENDING)
        lease.setStatus(Lease.LeaseStatus.ACTIVE);

        // Step 4: Mark property as occupied
        property.setOccupied(true);
        propertyRepository.save(property);

        // Step 5: Save and return
        return leaseRepository.save(lease);
    }

    public Lease updateLease(Long id, Lease leaseDetails) {
        Lease lease = getLeaseById(id);
        lease.setStartDate(leaseDetails.getStartDate());
        lease.setEndDate(leaseDetails.getEndDate());
        lease.setRentAmount(leaseDetails.getRentAmount());
        lease.setSecurityDeposit(leaseDetails.getSecurityDeposit());
        lease.setStatus(leaseDetails.getStatus());
        lease.setTerms(leaseDetails.getTerms());
        return leaseRepository.save(lease);
    }

    // UPDATE METHOD - Update from DTO
    @Transactional
    public Lease updateLeaseFromDTO(Long id, LeaseDTO leaseDTO) {
        Lease lease = getLeaseById(id);
        
        // Update fields (tenant and property cannot be changed)
        lease.setStartDate(leaseDTO.getStartDate());
        lease.setEndDate(leaseDTO.getEndDate());
        lease.setRentAmount(leaseDTO.getRentAmount());
        lease.setSecurityDeposit(leaseDTO.getSecurityDeposit());
        lease.setTerms(leaseDTO.getTerms());
        
        if (leaseDTO.getStatus() != null) {
            lease.setStatus(Lease.LeaseStatus.valueOf(leaseDTO.getStatus()));
        }
        
        return leaseRepository.save(lease);
    }

    public Lease terminateLease(Long id, String reason) {
        Lease lease = getLeaseById(id);
        lease.setStatus(Lease.LeaseStatus.TERMINATED);
        lease.setTerminationReason(reason);
        
        Property property = lease.getProperty();
        property.setOccupied(false);
        propertyRepository.save(property);
        
        return leaseRepository.save(lease);
    }

    // ✅ UPDATED: Now returns ACTIVE or PENDING leases
    public Lease getTenantActiveLease(Authentication authentication) {
        User tenant = getUserFromAuth(authentication);
        
        // First try to find ACTIVE lease
        Optional<Lease> activeLease = leaseRepository.findByTenantAndStatus(tenant, Lease.LeaseStatus.ACTIVE);
        if (activeLease.isPresent()) {
            return activeLease.get();
        }
        
        // If no ACTIVE lease, try PENDING
        Optional<Lease> pendingLease = leaseRepository.findByTenantAndStatus(tenant, Lease.LeaseStatus.PENDING);
        return pendingLease.orElse(null);
    }

    private User getUserFromAuth(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
