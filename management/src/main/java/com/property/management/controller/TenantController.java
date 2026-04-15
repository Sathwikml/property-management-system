package com.property.management.controller;

import com.property.management.entity.User;
import com.property.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/landlord")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class TenantController {

    private final UserRepository userRepository;

    @GetMapping("/tenants")
    public ResponseEntity<List<User>> getAllTenants() {
        List<User> tenants = userRepository.findAll().stream()
            .filter(u -> u.getRole() == User.UserRole.TENANT)
            .toList();
        return ResponseEntity.ok(tenants);
    }

    @GetMapping("/tenants/{id}")
    public ResponseEntity<User> getTenant(@PathVariable Long id) {
        User tenant = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Tenant not found"));
        return ResponseEntity.ok(tenant);
    }

    @DeleteMapping("/tenants/{id}")
    public ResponseEntity<Void> deleteTenant(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}