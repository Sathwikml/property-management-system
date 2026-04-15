// LeaseDTO.java
package com.property.management.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class LeaseDTO {
    private Long id;
    private Long propertyId;
    private String tenantEmail;  // ✅ This is the key - accept email, not object
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal rentAmount;
    private BigDecimal securityDeposit;
    private String terms;
    private String status;
}
