package com.salon.dto;

import com.salon.model.Salon;
import com.salon.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private boolean success;
    private String message;
    private Long id;
    private String name;
    private String email;
    private String phone;
    private UserRole role; // CLIENT or OWNER
    private Long salonId; // ID of the salon if owner
    private Salon salon; // Salon details if owner
    private String token;
}
