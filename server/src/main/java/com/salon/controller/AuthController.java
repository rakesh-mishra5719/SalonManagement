package com.salon.controller;

import com.salon.dto.*;
import com.salon.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/otp/send")
    public ResponseEntity<SendOtpResponse> sendOtp(@RequestBody SendOtpRequest request) {
        return ResponseEntity.ok(authService.sendPhoneOtp(request.getPhone()));
    }

    @PostMapping("/client/register")
    public ResponseEntity<AuthResponse> registerClient(@RequestBody ClientRegisterRequest request) {
        return ResponseEntity.ok(authService.registerClient(request));
    }

    @PostMapping("/owner/register")
    public ResponseEntity<AuthResponse> registerOwner(@RequestBody OwnerRegisterRequest request) {
        return ResponseEntity.ok(authService.registerOwner(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
