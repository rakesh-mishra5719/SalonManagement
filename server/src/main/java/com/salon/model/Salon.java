package com.salon.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "salons", indexes = {
    @Index(name = "idx_salon_geo", columnList = "latitude, longitude"),
    @Index(name = "idx_salon_status", columnList = "isOpen")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Salon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String tagline;

    private String address;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Builder.Default
    private Boolean isOpen = true;

    private Double rating; // e.g. 4.9

    private String phone;

    private String imageUrl;

    private String category; // e.g., "Luxe Hair & Spa", "Barbershop", "Beauty Lounge"

    @Builder.Default
    private Integer averageServiceTimeMinutes = 20;

    @Transient
    private Double distanceKm;

    @Transient
    private Integer waitingCount;

    @Transient
    private Integer servingCount;

    @Transient
    private Integer totalWaitTimeMinutes;

    @Transient
    private String waitLevel; // "Immediate", "Short Wait", "Moderate", "High"
}
