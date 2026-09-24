package com.salon.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String identifier; // phone or email
    private String password;
}
