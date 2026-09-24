package com.salon.config;

import com.salon.model.*;
import com.salon.repository.QueueEntryRepository;
import com.salon.repository.SalonRepository;
import com.salon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final SalonRepository salonRepository;
    private final QueueEntryRepository queueEntryRepository;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        // Ensure default users exist
        if (userRepository.count() == 0) {
            log.info("Creating default demo accounts for testing...");

            // 1. Default Client User (test phone: 9876543210, pass: password123)
            User clientUser = User.builder()
                    .name("Priya Nair")
                    .phone("9876543210")
                    .email("client@aura.com")
                    .password("password123")
                    .role(UserRole.CLIENT)
                    .createdAt(LocalDateTime.now())
                    .build();

            // 2. Default Salon Owner User (email: owner@aura.com, pass: password123)
            User ownerUser = User.builder()
                    .name("Alexandre Durand")
                    .phone("9845011223")
                    .email("owner@aura.com")
                    .password("password123")
                    .role(UserRole.OWNER)
                    .createdAt(LocalDateTime.now())
                    .build();

            userRepository.saveAll(List.of(clientUser, ownerUser));
        }

        if (salonRepository.count() > 0) {
            return;
        }

        log.info("Initializing pre-seeded salon network and live queues...");

        User demoOwner = userRepository.findByEmail("owner@aura.com").orElse(null);
        Long demoOwnerId = demoOwner != null ? demoOwner.getId() : 1L;

        // Pre-seeded salons with realistic metropolitan coordinates
        Salon s1 = Salon.builder()
                .name("Aura Minimalist Studio")
                .tagline("High-end artisanal hair design & organic treatments")
                .address("104 Indiranagar 100ft Rd, Bengaluru")
                .latitude(12.9719)
                .longitude(77.6412)
                .isOpen(true)
                .rating(4.9)
                .phone("+91 98450 11223")
                .ownerId(demoOwnerId)
                .category("Artisanal Hair & Spa")
                .averageServiceTimeMinutes(25)
                .openingTime("09:00 AM")
                .closingTime("09:00 PM")
                .chairsCount(4)
                .imageUrl("https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80")
                .build();

        Salon s2 = Salon.builder()
                .name("Velvet & Blade Barbers")
                .tagline("Master fades, beard sculpting & hot towel treatments")
                .address("58 Koramangala 4th Block, Bengaluru")
                .latitude(12.9352)
                .longitude(77.6245)
                .isOpen(true)
                .rating(4.8)
                .phone("+91 98765 43210")
                .category("Craft Barber Studio")
                .averageServiceTimeMinutes(20)
                .openingTime("10:00 AM")
                .closingTime("08:30 PM")
                .chairsCount(3)
                .imageUrl("https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80")
                .build();

        Salon s3 = Salon.builder()
                .name("Lumière Aesthetic Lounge")
                .tagline("French couture coloring, botanical keratin & aesthetics")
                .address("12 Lavelle Road, Central Bengaluru")
                .latitude(12.9698)
                .longitude(77.5990)
                .isOpen(true)
                .rating(4.95)
                .phone("+91 91234 56789")
                .category("Couture Beauty Lounge")
                .averageServiceTimeMinutes(30)
                .openingTime("09:30 AM")
                .closingTime("09:00 PM")
                .chairsCount(5)
                .imageUrl("https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80")
                .build();

        Salon s4 = Salon.builder()
                .name("Zenith Hair Atelier")
                .tagline("Precision scissor cuts & Japanese scalp detox")
                .address("80 Richmond Town, Bengaluru")
                .latitude(12.9620)
                .longitude(77.6080)
                .isOpen(true)
                .rating(4.7)
                .phone("+91 99887 76655")
                .category("Holistic Atelier")
                .averageServiceTimeMinutes(20)
                .openingTime("10:00 AM")
                .closingTime("08:00 PM")
                .chairsCount(3)
                .imageUrl("https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80")
                .build();

        Salon s5 = Salon.builder()
                .name("Monochrome Grooming Co.")
                .tagline("Minimal modern grooming for contemporary individuals")
                .address("42 Whitefield Main Rd, Bengaluru")
                .latitude(12.9750)
                .longitude(77.7250)
                .isOpen(false)
                .rating(4.6)
                .phone("+91 97711 22334")
                .category("Modern Grooming")
                .averageServiceTimeMinutes(15)
                .openingTime("09:00 AM")
                .closingTime("09:00 PM")
                .chairsCount(4)
                .imageUrl("https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80")
                .build();

        salonRepository.saveAll(List.of(s1, s2, s3, s4, s5));

        // Link owner to salon 1
        if (demoOwner != null) {
            demoOwner.setSalonId(s1.getId());
            userRepository.save(demoOwner);
        }

        // Pre-seed some active queue entries with 6-digit confirmation codes
        QueueEntry q1 = QueueEntry.builder()
                .salonId(s1.getId())
                .customerName("Rohan Verma")
                .customerPhone("+91 98888 12345")
                .serviceName("Artisan Scissor Cut")
                .slotTime("10:00 AM")
                .status(QueueStatus.SERVING)
                .verificationCode("102482") // 6-digit code
                .createdAt(LocalDateTime.now().minusMinutes(15))
                .verifiedAt(LocalDateTime.now().minusMinutes(10))
                .build();

        QueueEntry q2 = QueueEntry.builder()
                .salonId(s1.getId())
                .customerName("Priya Nair")
                .customerPhone("+91 98765 43210")
                .serviceName("Botanical Scalp Treatment")
                .slotTime("10:30 AM")
                .status(QueueStatus.WAITING)
                .queuePosition(1)
                .verificationCode("481923") // 6-digit code
                .createdAt(LocalDateTime.now().minusMinutes(8))
                .build();

        QueueEntry q3 = QueueEntry.builder()
                .salonId(s1.getId())
                .customerName("Aarav Mehta")
                .customerPhone("+91 96666 98765")
                .serviceName("Beard Sculpt & Styling")
                .slotTime("11:15 AM")
                .status(QueueStatus.WAITING)
                .queuePosition(2)
                .verificationCode("723049") // 6-digit code
                .createdAt(LocalDateTime.now().minusMinutes(2))
                .build();

        QueueEntry q4 = QueueEntry.builder()
                .salonId(s2.getId())
                .customerName("Kavya Sharma")
                .customerPhone("+91 95555 11111")
                .serviceName("Deluxe Blowout")
                .slotTime("10:45 AM")
                .status(QueueStatus.WAITING)
                .queuePosition(1)
                .verificationCode("339182") // 6-digit code
                .createdAt(LocalDateTime.now().minusMinutes(5))
                .build();

        queueEntryRepository.saveAll(List.of(q1, q2, q3, q4));

        log.info("Initialized {} salons and {} active queue bookings successfully.", 
                salonRepository.count(), queueEntryRepository.count());
    }
}
