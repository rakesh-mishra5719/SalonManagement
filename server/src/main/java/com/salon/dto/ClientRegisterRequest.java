package com.salon.dto;

import lombok.Data;

@Data
public class ClientRegisterRequest {
    private String name;
    private String phone;
    private String password;
    private String otpCode;
}
