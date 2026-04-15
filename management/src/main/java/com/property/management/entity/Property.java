// Property.java
package com.property.management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "properties")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    private String city;
    private String state;
    private String zipCode;

    @Enumerated(EnumType.STRING)
    private PropertyType type;

    private Integer bedrooms;
    private BigDecimal bathrooms;
    private Integer squareFeet;

    @Column(nullable = false)
    private BigDecimal rentAmount;

    private BigDecimal securityDeposit;

    @Column(length = 2000)
    private String description;

    private Boolean occupied = false;

    @ManyToOne
    @JoinColumn(name = "landlord_id", nullable = false)
    private User landlord;

    @ElementCollection
    @CollectionTable(name = "property_images", joinColumns = @JoinColumn(name = "property_id"))
    @Column(name = "image_url")
    private List<String> imageUrls = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum PropertyType {
        APARTMENT, HOUSE, CONDO, TOWNHOUSE, STUDIO, DUPLEX
    }
}