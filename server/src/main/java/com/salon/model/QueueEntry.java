package com.salon.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "queue_entries", indexes = {
    @Index(name = "idx_queue_salon_status", columnList = "salonId, status"),
    @Index(name = "idx_queue_code", columnList = "verificationCode")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QueueEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long salonId;

    @Column(nullable = false)
    private String customerName;

    private String customerPhone;

    @Column(nullable = false, unique = true)
    private String verificationCode; // e.g. SLN-7412

    private String serviceName; // e.g. "Hair Styling", "Beard Trim & Facial", "Deluxe Package"

    private String slotTime; // e.g. "10:30 AM", "11:15 AM", "Immediate"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private QueueStatus status = QueueStatus.WAITING;

    private Integer queuePosition;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime verifiedAt;

    private LocalDateTime completedAt;

    @Version
    private Long version;
}
