// LeaseRepository.java
package com.property.management.repository;

import com.property.management.entity.Lease;
import com.property.management.entity.Property;
import com.property.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeaseRepository extends JpaRepository<Lease, Long> {
    List<Lease> findByProperty(Property property);
    List<Lease> findByTenant(User tenant);
    Optional<Lease> findByTenantAndStatus(User tenant, Lease.LeaseStatus status);
}