// PropertyService.java
package com.property.management.service;

import com.property.management.entity.Property;
import com.property.management.entity.User;
import com.property.management.repository.PropertyRepository;
import com.property.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PropertyService {
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    public List<Property> getAllProperties(Authentication authentication) {
        User user = getUserFromAuth(authentication);
        if (user.getRole() == User.UserRole.LANDLORD) {
            return propertyRepository.findByLandlord(user);
        }
        return propertyRepository.findAll();
    }

    public Property getPropertyById(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
    }

    public Property createProperty(Property property, Authentication authentication) {
        User landlord = getUserFromAuth(authentication);
        property.setLandlord(landlord);
        return propertyRepository.save(property);
    }

    public Property updateProperty(Long id, Property propertyDetails) {
        Property property = getPropertyById(id);
        property.setName(propertyDetails.getName());
        property.setAddress(propertyDetails.getAddress());
        property.setCity(propertyDetails.getCity());
        property.setState(propertyDetails.getState());
        property.setZipCode(propertyDetails.getZipCode());
        property.setType(propertyDetails.getType());
        property.setBedrooms(propertyDetails.getBedrooms());
        property.setBathrooms(propertyDetails.getBathrooms());
        property.setSquareFeet(propertyDetails.getSquareFeet());
        property.setRentAmount(propertyDetails.getRentAmount());
        property.setSecurityDeposit(propertyDetails.getSecurityDeposit());
        property.setDescription(propertyDetails.getDescription());
        return propertyRepository.save(property);
    }

    public void deleteProperty(Long id) {
        propertyRepository.deleteById(id);
    }

    private User getUserFromAuth(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}