// AuthResponse.java
package com.property.management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import com.property.management.entity.User;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private UserDTO user;
    
    @Data
    @AllArgsConstructor
    public static class UserDTO {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String role;
    }
}