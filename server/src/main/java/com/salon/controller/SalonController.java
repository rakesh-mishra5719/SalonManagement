package com.salon.controller;

import com.salon.dto.JoinQueueRequest;
import com.salon.dto.SalonQueueDetailsDto;
import com.salon.dto.SalonStatusRequest;
import com.salon.dto.VerifyCodeRequest;
import com.salon.model.QueueEntry;
import com.salon.model.Salon;
import com.salon.service.SalonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SalonController {

    private final SalonService salonService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Salon Management High-Concurrency Engine",
                "version", "1.0.0"
        ));
    }

    /**
     * Get nearby salons sorted by proximity with real-time queue length & wait time
     */
    @GetMapping("/salons/nearby")
    public ResponseEntity<List<Salon>> getNearbySalons(
            @RequestParam(defaultValue = "12.9716") Double lat,
            @RequestParam(defaultValue = "77.5946") Double lng,
            @RequestParam(required = false) Double radius) {
        return ResponseEntity.ok(salonService.findNearbySalons(lat, lng, radius));
    }

    /**
     * Get single salon by id
     */
    @GetMapping("/salons/{id}")
    public ResponseEntity<Salon> getSalon(@PathVariable Long id) {
        return ResponseEntity.ok(salonService.getSalonById(id));
    }

    /**
     * Get real-time queue details, waiting list, serving list for a salon
     */
    @GetMapping("/salons/{id}/queue")
    public ResponseEntity<SalonQueueDetailsDto> getSalonQueue(@PathVariable Long id) {
        return ResponseEntity.ok(salonService.getSalonQueueDetails(id));
    }

    /**
     * Customer books a slot / joins the waiting list (generates verification code)
     */
    @PostMapping("/salons/{id}/queue/join")
    public ResponseEntity<QueueEntry> joinQueue(
            @PathVariable Long id,
            @RequestBody JoinQueueRequest request) {
        QueueEntry entry = salonService.joinQueue(id, request);
        return ResponseEntity.ok(entry);
    }

    /**
     * Salon Owner verifies customer's arrival code and confirms slot -> status changes to SERVING
     */
    @PostMapping("/salons/{id}/queue/verify")
    public ResponseEntity<Map<String, Object>> verifyArrival(
            @PathVariable Long id,
            @RequestBody VerifyCodeRequest request) {
        QueueEntry entry = salonService.verifyCustomerArrival(id, request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Customer successfully verified and admitted to service!",
                "entry", entry
        ));
    }

    /**
     * Salon Owner marks customer service as completed
     */
    @PostMapping("/salons/{id}/queue/{queueId}/complete")
    public ResponseEntity<Map<String, Object>> completeService(
            @PathVariable Long id,
            @PathVariable Long queueId) {
        QueueEntry entry = salonService.completeCustomerSlot(id, queueId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Service completed successfully.",
                "entry", entry
        ));
    }

    /**
     * Salon Owner toggles salon open/closed status
     */
    @PutMapping("/salons/{id}/status")
    public ResponseEntity<Salon> updateStatus(
            @PathVariable Long id,
            @RequestBody SalonStatusRequest request) {
        Salon salon = salonService.updateSalonStatus(id, request);
        return ResponseEntity.ok(salon);
    }

    /**
     * Real-time Server-Sent Events stream for instant queue updates
     */
    @GetMapping("/salons/{id}/events")
    public SseEmitter streamQueueEvents(@PathVariable Long id) {
        return salonService.subscribeToQueueEvents(id);
    }
}
