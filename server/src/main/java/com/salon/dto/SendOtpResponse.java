package com.salon.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendOtpResponse {
    private boolean success;
    private String message;
    private String phone;
    private String demoOtp; // Provided for testing without paid SMS gateway
}
