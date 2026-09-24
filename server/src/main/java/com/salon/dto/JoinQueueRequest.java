package com.salon.dto;

import lombok.Data;

@Data
public class JoinQueueRequest {
    private String customerName;
    private String customerPhone;
    private String serviceName;
    private String slotTime;
}
