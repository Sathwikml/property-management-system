package com.property.management.repository;

import com.property.management.entity.User;
import com.property.management.entity.Lease;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Existing method (used in your code)
    Optional<User> findByEmail(String email);
    
    // ✅ NEW - Fixes AuthService error
    boolean existsByEmail(String email);
}
