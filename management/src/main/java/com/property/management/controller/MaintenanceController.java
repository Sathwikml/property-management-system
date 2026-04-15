// MaintenanceController.java
package com.property.management.controller;

import com.property.management.dto.MaintenanceRequestDTO;
import com.property.management.entity.MaintenanceRequest;
import com.property.management.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MaintenanceController {
    private final MaintenanceService maintenanceService;

    @GetMapping("/maintenance")
    public ResponseEntity<List<MaintenanceRequest>> getAllRequests(Authentication authentication) {
        return ResponseEntity.ok(maintenanceService.getAllRequests(authentication));
    }

    @GetMapping("/tenant/maintenance")
    public ResponseEntity<List<MaintenanceRequest>> getTenantRequests(Authentication authentication) {
        return ResponseEntity.ok(maintenanceService.getTenantRequests(authentication));
    }

    @GetMapping("/maintenance/{id}")
    public ResponseEntity<MaintenanceRequest> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.getRequestById(id));
    }

    // ✅ FIXED - Uses DTO and auto-gets property from lease
    @PostMapping("/maintenance")
    public ResponseEntity<?> createRequest(
            @RequestBody MaintenanceRequestDTO requestDTO,
            Authentication authentication) {
        try {
            // Create MaintenanceRequest from DTO
            MaintenanceRequest request = new MaintenanceRequest();
            request.setTitle(requestDTO.getTitle());
            request.setDescription(requestDTO.getDescription());
            request.setPriority(requestDTO.getPriority() != null 
                ? requestDTO.getPriority() 
                : MaintenanceRequest.Priority.MEDIUM);
            request.setCategory(requestDTO.getCategory());
            
            // Service will get property from active lease
            MaintenanceRequest saved = maintenanceService.createRequest(request, authentication);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/maintenance/{id}")
    public ResponseEntity<MaintenanceRequest> updateRequest(
            @PathVariable Long id,
            @RequestBody MaintenanceRequest request) {
        return ResponseEntity.ok(maintenanceService.updateRequest(id, request));
    }

    @PatchMapping("/maintenance/{id}/status")
    public ResponseEntity<MaintenanceRequest> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, MaintenanceRequest.Status> statusMap) {
        MaintenanceRequest.Status status = statusMap.get("status");
        return ResponseEntity.ok(maintenanceService.updateStatus(id, status));
    }
}
