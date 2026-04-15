// LeaseController.java
package com.property.management.controller;

import com.property.management.dto.LeaseDTO;  // ✅ Add this
import com.property.management.entity.Lease;
import com.property.management.service.LeaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leases")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LeaseController {
    private final LeaseService leaseService;

    @GetMapping
    public ResponseEntity<List<Lease>> getAllLeases(Authentication authentication) {
        return ResponseEntity.ok(leaseService.getAllLeases(authentication));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getLeaseById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(leaseService.getLeaseById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // ✅✅✅ UPDATED - Use LeaseDTO instead of Lease entity
    @PostMapping
    public ResponseEntity<?> createLease(@RequestBody LeaseDTO leaseDTO) {
        try {
            Lease lease = leaseService.createLeaseFromDTO(leaseDTO);  // ✅ Use new method
            return ResponseEntity.status(HttpStatus.CREATED).body(lease);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // ✅✅✅ UPDATED - Use LeaseDTO for updates too
    @PutMapping("/{id}")
    public ResponseEntity<?> updateLease(@PathVariable Long id, @RequestBody LeaseDTO leaseDTO) {
        try {
            Lease lease = leaseService.updateLeaseFromDTO(id, leaseDTO);  // ✅ Use new method
            return ResponseEntity.ok(lease);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/terminate")
    public ResponseEntity<?> terminateLease(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String reason = request.get("reason");
            Lease lease = leaseService.terminateLease(id, reason);
            return ResponseEntity.ok(lease);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/my-active-lease")
    public ResponseEntity<Lease> getMyActiveLease(Authentication authentication) {
        Lease lease = leaseService.getTenantActiveLease(authentication);
        return ResponseEntity.ok(lease);
    }
}
