// DocumentRepository.java
package com.property.management.repository;

import com.property.management.entity.Document;
import com.property.management.entity.Property;
import com.property.management.entity.Lease;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByProperty(Property property);
    List<Document> findByLease(Lease lease);
}