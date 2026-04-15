// PropertyRepository.java
package com.property.management.repository;

import com.property.management.entity.Property;
import com.property.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByLandlord(User landlord);
    List<Property> findByOccupied(Boolean occupied);
}