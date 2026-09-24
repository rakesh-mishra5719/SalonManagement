package com.salon.dto;

import lombok.Data;

@Data
public class OwnerRegisterRequest {
    // Owner User Details
    private String name;
    private String email;
    private String phone;
    private String password;

    // Shop / Salon Details
    private String shopName;
    private String tagline;
    private String category;
    private String address;
    private Double latitude;
    private Double longitude;
    private String openingTime;
    private String closingTime;
    private Integer chairsCount;
}
