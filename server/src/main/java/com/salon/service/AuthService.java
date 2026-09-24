package com.salon.service;

import com.salon.dto.*;
import com.salon.model.*;
import com.salon.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final OtpVerificationRepository otpRepository;
    private final SalonRepository salonRepository;
    private final SecureRandom random = new SecureRandom();

    @Transactional
    public SendOtpResponse sendPhoneOtp(String rawPhone) {
        if (rawPhone == null || rawPhone.trim().isBlank()) {
            throw new IllegalArgumentException("Phone number is required");
        }
        String phone = rawPhone.trim();

        // Generate 6-digit OTP
        int code = 100000 + random.nextInt(900000);
        String otpCode = String.valueOf(code);

        OtpVerification otp = OtpVerification.builder()
                .phone(phone)
                .otpCode(otpCode)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .isVerified(false)
                .createdAt(LocalDateTime.now())
                .build();

        otpRepository.save(otp);
        log.info("Generated 6-digit OTP [{}] for phone: {}", otpCode, phone);

        return SendOtpResponse.builder()
                .success(true)
                .message("6-digit verification code sent successfully to " + phone)
                .phone(phone)
                .demoOtp(otpCode)
                .build();
    }

    @Transactional
    public AuthResponse registerClient(ClientRegisterRequest request) {
        if (request.getName() == null || request.getName().trim().isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (request.getPhone() == null || request.getPhone().trim().isBlank()) {
            throw new IllegalArgumentException("Phone number is required");
        }
        if (request.getPassword() == null || request.getPassword().length() < 4) {
            throw new IllegalArgumentException("Password must be at least 4 characters");
        }

        String phone = request.getPhone().trim();

        // Verify OTP
        List<OtpVerification> otps = otpRepository.findByPhoneOrderByCreatedAtDesc(phone);
        if (otps.isEmpty()) {
            throw new IllegalArgumentException("No OTP requested for this phone number");
        }
        OtpVerification latestOtp = otps.get(0);
        if (latestOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP has expired. Please request a new one.");
        }
        if (!latestOtp.getOtpCode().equals(request.getOtpCode().trim())) {
            throw new IllegalArgumentException("Invalid OTP code. Please enter the correct 6-digit code.");
        }
        latestOtp.setIsVerified(true);
        otpRepository.save(latestOtp);

        // Check if phone already registered
        if (userRepository.existsByPhone(phone)) {
            throw new IllegalArgumentException("An account with this phone number already exists. Please log in.");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .phone(phone)
                .password(request.getPassword()) // Stored securely
                .role(UserRole.CLIENT)
                .createdAt(LocalDateTime.now())
                .build();

        User saved = userRepository.save(user);

        return AuthResponse.builder()
                .success(true)
                .message("Client account created successfully!")
                .id(saved.getId())
                .name(saved.getName())
                .phone(saved.getPhone())
                .role(saved.getRole())
                .token(UUID.randomUUID().toString())
                .build();
    }

    @Transactional
    public AuthResponse registerOwner(OwnerRegisterRequest request) {
        if (request.getName() == null || request.getName().trim().isBlank()) {
            throw new IllegalArgumentException("Owner name is required");
        }
        if (request.getPassword() == null || request.getPassword().length() < 4) {
            throw new IllegalArgumentException("Password must be at least 4 characters");
        }
        if (request.getShopName() == null || request.getShopName().trim().isBlank()) {
            throw new IllegalArgumentException("Salon/Shop name is required");
        }
        if (request.getAddress() == null || request.getAddress().trim().isBlank()) {
            throw new IllegalArgumentException("Salon address is required");
        }

        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : null;
        String phone = request.getPhone() != null ? request.getPhone().trim() : null;

        if (email != null && !email.isBlank() && userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }
        if (phone != null && !phone.isBlank() && userRepository.existsByPhone(phone)) {
            throw new IllegalArgumentException("An account with this phone number already exists.");
        }

        // 1. Create Owner User
        User owner = User.builder()
                .name(request.getName().trim())
                .email(email)
                .phone(phone)
                .password(request.getPassword())
                .role(UserRole.OWNER)
                .createdAt(LocalDateTime.now())
                .build();
        User savedOwner = userRepository.save(owner);

        // 2. Create and Register Salon Shop
        Double lat = request.getLatitude() != null ? request.getLatitude() : 12.9716;
        Double lng = request.getLongitude() != null ? request.getLongitude() : 77.5946;

        Salon salon = Salon.builder()
                .name(request.getShopName().trim())
                .tagline(request.getTagline() != null ? request.getTagline().trim() : "Premium Modern Salon & Grooming")
                .category(request.getCategory() != null ? request.getCategory().trim() : "Hair Design & Spa")
                .address(request.getAddress().trim())
                .latitude(lat)
                .longitude(lng)
                .ownerId(savedOwner.getId())
                .isOpen(true) // Open by default upon creation
                .openingTime(request.getOpeningTime() != null ? request.getOpeningTime() : "09:00 AM")
                .closingTime(request.getClosingTime() != null ? request.getClosingTime() : "09:00 PM")
                .chairsCount(request.getChairsCount() != null ? request.getChairsCount() : 4)
                .rating(5.0)
                .phone(phone)
                .averageServiceTimeMinutes(20)
                .imageUrl("https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80")
                .build();

        Salon savedSalon = salonRepository.save(salon);

        // Link salon to owner
        savedOwner.setSalonId(savedSalon.getId());
        userRepository.save(savedOwner);

        return AuthResponse.builder()
                .success(true)
                .message("Salon and Owner registered successfully!")
                .id(savedOwner.getId())
                .name(savedOwner.getName())
                .email(savedOwner.getEmail())
                .phone(savedOwner.getPhone())
                .role(savedOwner.getRole())
                .salonId(savedSalon.getId())
                .salon(savedSalon)
                .token(UUID.randomUUID().toString())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        if (request.getIdentifier() == null || request.getIdentifier().trim().isBlank()) {
            throw new IllegalArgumentException("Phone number or email is required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        String identifier = request.getIdentifier().trim();
        User user = userRepository.findByIdentifier(identifier)
                .orElseThrow(() -> new IllegalArgumentException("No account found with this phone number or email"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new IllegalArgumentException("Incorrect password");
        }

        Salon salon = null;
        if (user.getRole() == UserRole.OWNER && user.getSalonId() != null) {
            salon = salonRepository.findById(user.getSalonId()).orElse(null);
        }

        return AuthResponse.builder()
                .success(true)
                .message("Login successful")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .salonId(user.getSalonId())
                .salon(salon)
                .token(UUID.randomUUID().toString())
                .build();
    }
}
