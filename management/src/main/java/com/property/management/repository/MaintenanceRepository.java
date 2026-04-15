// MaintenanceRepository.java
package com.property.management.repository;

import com.property.management.entity.MaintenanceRequest;
import com.property.management.entity.Property;
import com.property.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<MaintenanceRequest, Long> {
    List<MaintenanceRequest> findByProperty(Property property);
    List<MaintenanceRequest> findByTenant(User tenant);
    List<MaintenanceRequest> findByStatus(MaintenanceRequest.Status status);
}