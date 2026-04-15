// MaintenanceService.java
package com.property.management.service;

import com.property.management.entity.MaintenanceRequest;
import com.property.management.entity.Property;
import com.property.management.entity.User;
import com.property.management.entity.Lease;
import com.property.management.repository.MaintenanceRepository;
import com.property.management.repository.PropertyRepository;
import com.property.management.repository.UserRepository;
import com.property.management.repository.LeaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceService {
    private final MaintenanceRepository maintenanceRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;  // ✅ Added
    private final LeaseRepository leaseRepository;        // ✅ Added

    public List<MaintenanceRequest> getAllRequests(Authentication authentication) {
        User user = getUserFromAuth(authentication);
        if (user.getRole() == User.UserRole.TENANT) {
            return maintenanceRepository.findByTenant(user);
        }
        return maintenanceRepository.findAll();
    }

    public List<MaintenanceRequest> getTenantRequests(Authentication authentication) {
        User tenant = getUserFromAuth(authentication);
        return maintenanceRepository.findByTenant(tenant);
    }

    public MaintenanceRequest getRequestById(Long id) {
        return maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance request not found"));
    }

    // ✅ FIXED - Automatically gets property from active lease
    public MaintenanceRequest createRequest(MaintenanceRequest request, Authentication authentication) {
        User tenant = getUserFromAuth(authentication);
        
        // Get property from tenant's active lease
        Property property = leaseRepository.findByTenantAndStatus(tenant, Lease.LeaseStatus.ACTIVE)
                .map(Lease::getProperty)
                .orElseThrow(() -> new RuntimeException("No active lease found. Cannot submit maintenance request."));
        
        request.setProperty(property);
        request.setTenant(tenant);
        request.setStatus(MaintenanceRequest.Status.OPEN);
        
        return maintenanceRepository.save(request);
    }

    public MaintenanceRequest updateRequest(Long id, MaintenanceRequest requestDetails) {
        MaintenanceRequest request = getRequestById(id);
        request.setTitle(requestDetails.getTitle());
        request.setDescription(requestDetails.getDescription());
        request.setPriority(requestDetails.getPriority());
        request.setStatus(requestDetails.getStatus());
        request.setCategory(requestDetails.getCategory());
        return maintenanceRepository.save(request);
    }

    public MaintenanceRequest updateStatus(Long id, MaintenanceRequest.Status status) {
        MaintenanceRequest request = getRequestById(id);
        request.setStatus(status);
        if (status == MaintenanceRequest.Status.COMPLETED) {
            request.setCompletedAt(java.time.LocalDateTime.now());
        }
        return maintenanceRepository.save(request);
    }

    private User getUserFromAuth(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
