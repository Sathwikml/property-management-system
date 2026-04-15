// MaintenanceRequestDTO.java
package com.property.management.dto;

import com.property.management.entity.MaintenanceRequest;
import lombok.Data;

@Data
public class MaintenanceRequestDTO {
    private Long propertyId;
    private String title;
    private String description;
    private MaintenanceRequest.Priority priority;
    private MaintenanceRequest.Category category;
}
