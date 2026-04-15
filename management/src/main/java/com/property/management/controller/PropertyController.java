package com.property.management.controller;

import com.property.management.entity.Property;
import com.property.management.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class PropertyController {

    private final PropertyService propertyService;

    @GetMapping("/properties")
    public ResponseEntity<List<Property>> getAllProperties(Authentication authentication) {
        return ResponseEntity.ok(propertyService.getAllProperties(authentication));
    }

    @GetMapping("/properties/{id}")
    public ResponseEntity<Property> getPropertyById(@PathVariable Long id) {
        return ResponseEntity.ok(propertyService.getPropertyById(id));
    }

    // ✅ ADD THIS METHOD - This is what's missing!
    @PostMapping("/landlord/properties")
    public ResponseEntity<Property> createProperty(@RequestBody Property property,
                                                     Authentication authentication) {
        return ResponseEntity.ok(propertyService.createProperty(property, authentication));
    }

    @PutMapping("/landlord/properties/{id}")
    public ResponseEntity<Property> updateProperty(@PathVariable Long id,
                                                     @RequestBody Property property) {
        return ResponseEntity.ok(propertyService.updateProperty(id, property));
    }

    @DeleteMapping("/landlord/properties/{id}")
    public ResponseEntity<Void> deleteProperty(@PathVariable Long id) {
        propertyService.deleteProperty(id);
        return ResponseEntity.noContent().build();
    }
}