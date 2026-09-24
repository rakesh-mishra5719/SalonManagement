package com.salon.service;

import com.salon.dto.JoinQueueRequest;
import com.salon.dto.SalonQueueDetailsDto;
import com.salon.dto.SalonStatusRequest;
import com.salon.dto.VerifyCodeRequest;
import com.salon.model.QueueEntry;
import com.salon.model.QueueStatus;
import com.salon.model.Salon;
import com.salon.repository.QueueEntryRepository;
import com.salon.repository.SalonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class SalonService {

    private final SalonRepository salonRepository;
    private final QueueEntryRepository queueEntryRepository;

    // Concurrency: Thread-safe SSE emitter storage per salon
    private final Map<Long, List<SseEmitter>> salonEmitters = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    public List<Salon> findNearbySalons(Double userLat, Double userLng, Double radiusKm) {
        List<Salon> allSalons = salonRepository.findAll();
        List<Salon> nearby = new ArrayList<>();

        for (Salon s : allSalons) {
            double dist = calculateHaversineDistance(userLat, userLng, s.getLatitude(), s.getLongitude());
            if (radiusKm == null || dist <= radiusKm) {
                s.setDistanceKm(Math.round(dist * 10.0) / 10.0);
                enrichSalonQueueMetrics(s);
                nearby.add(s);
            }
        }

        nearby.sort(Comparator.comparingDouble(Salon::getDistanceKm));
        return nearby;
    }

    public Salon getSalonById(Long id) {
        Salon s = salonRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Salon not found with id: " + id));
        enrichSalonQueueMetrics(s);
        return s;
    }

    public SalonQueueDetailsDto getSalonQueueDetails(Long salonId) {
        Salon salon = getSalonById(salonId);
        List<QueueEntry> waiting = queueEntryRepository.findBySalonIdAndStatusOrderByCreatedAtAsc(salonId, QueueStatus.WAITING);
        List<QueueEntry> serving = queueEntryRepository.findBySalonIdAndStatusOrderByCreatedAtAsc(salonId, QueueStatus.SERVING);
        List<QueueEntry> completed = queueEntryRepository.findBySalonIdAndStatusOrderByCreatedAtAsc(salonId, QueueStatus.COMPLETED);

        // Assign queue positions
        for (int i = 0; i < waiting.size(); i++) {
            waiting.get(i).setQueuePosition(i + 1);
        }

        int waitMinutes = waiting.size() * (salon.getAverageServiceTimeMinutes() != null ? salon.getAverageServiceTimeMinutes() : 20);

        return SalonQueueDetailsDto.builder()
                .salon(salon)
                .waitingList(waiting)
                .servingList(serving)
                .completedList(completed)
                .waitingCount(waiting.size())
                .servingCount(serving.size())
                .completedTodayCount(completed.size())
                .estimatedWaitMinutes(waitMinutes)
                .waitLevel(calculateWaitLevel(waiting.size()))
                .build();
    }

    @Transactional
    public QueueEntry joinQueue(Long salonId, JoinQueueRequest request) {
        Salon salon = getSalonById(salonId);
        if (!Boolean.TRUE.equals(salon.getIsOpen())) {
            throw new IllegalStateException("This salon is currently closed and not accepting bookings.");
        }

        long currentWaiting = queueEntryRepository.countBySalonIdAndStatus(salonId, QueueStatus.WAITING);
        String code = generateUniqueVerificationCode();

        QueueEntry entry = QueueEntry.builder()
                .salonId(salonId)
                .customerName(request.getCustomerName() != null && !request.getCustomerName().isBlank() ? request.getCustomerName().trim() : "Valued Guest")
                .customerPhone(request.getCustomerPhone())
                .serviceName(request.getServiceName() != null ? request.getServiceName() : "Standard Styling")
                .slotTime(request.getSlotTime() != null ? request.getSlotTime() : "Immediate Slot")
                .status(QueueStatus.WAITING)
                .queuePosition((int) currentWaiting + 1)
                .verificationCode(code)
                .createdAt(LocalDateTime.now())
                .build();

        QueueEntry saved = queueEntryRepository.save(entry);
        broadcastQueueUpdate(salonId);
        return saved;
    }

    @Transactional
    public QueueEntry verifyCustomerArrival(Long salonId, VerifyCodeRequest request) {
        if (request.getVerificationCode() == null || request.getVerificationCode().isBlank()) {
            throw new IllegalArgumentException("Verification code cannot be empty");
        }

        String normalizedCode = request.getVerificationCode().trim().toUpperCase();
        QueueEntry entry = queueEntryRepository.findByVerificationCodeIgnoreCase(normalizedCode)
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification code: " + normalizedCode));

        if (!entry.getSalonId().equals(salonId)) {
            throw new IllegalArgumentException("This code belongs to a different salon.");
        }

        if (entry.getStatus() == QueueStatus.SERVING) {
            return entry; // already serving
        }

        if (entry.getStatus() == QueueStatus.COMPLETED) {
            throw new IllegalStateException("This customer slot has already been completed.");
        }

        if (entry.getStatus() == QueueStatus.CANCELLED) {
            throw new IllegalStateException("This booking was cancelled.");
        }

        entry.setStatus(QueueStatus.SERVING);
        entry.setVerifiedAt(LocalDateTime.now());
        QueueEntry updated = queueEntryRepository.save(entry);

        broadcastQueueUpdate(salonId);
        return updated;
    }

    @Transactional
    public QueueEntry completeCustomerSlot(Long salonId, Long queueId) {
        QueueEntry entry = queueEntryRepository.findById(queueId)
                .orElseThrow(() -> new IllegalArgumentException("Queue entry not found: " + queueId));

        if (!entry.getSalonId().equals(salonId)) {
            throw new IllegalArgumentException("Queue entry does not belong to this salon.");
        }

        entry.setStatus(QueueStatus.COMPLETED);
        entry.setCompletedAt(LocalDateTime.now());
        QueueEntry saved = queueEntryRepository.save(entry);

        broadcastQueueUpdate(salonId);
        return saved;
    }

    @Transactional
    public Salon updateSalonStatus(Long salonId, SalonStatusRequest request) {
        Salon salon = salonRepository.findById(salonId)
                .orElseThrow(() -> new IllegalArgumentException("Salon not found with id: " + salonId));

        salon.setIsOpen(request.getIsOpen());
        Salon saved = salonRepository.save(salon);
        broadcastQueueUpdate(salonId);
        return saved;
    }

    public SseEmitter subscribeToQueueEvents(Long salonId) {
        SseEmitter emitter = new SseEmitter(180_000L); // 3 minutes timeout
        salonEmitters.computeIfAbsent(salonId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(salonId, emitter));
        emitter.onTimeout(() -> removeEmitter(salonId, emitter));
        emitter.onError(e -> removeEmitter(salonId, emitter));

        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECTED")
                    .data("Connected to salon " + salonId + " real-time queue stream"));
        } catch (IOException e) {
            removeEmitter(salonId, emitter);
        }

        return emitter;
    }

    private void removeEmitter(Long salonId, SseEmitter emitter) {
        List<SseEmitter> emitters = salonEmitters.get(salonId);
        if (emitters != null) {
            emitters.remove(emitter);
        }
    }

    private void broadcastQueueUpdate(Long salonId) {
        List<SseEmitter> emitters = salonEmitters.get(salonId);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }

        SalonQueueDetailsDto details = getSalonQueueDetails(salonId);
        List<SseEmitter> deadEmitters = new ArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("QUEUE_UPDATE")
                        .data(details));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }

        emitters.removeAll(deadEmitters);
    }

    private void enrichSalonQueueMetrics(Salon s) {
        int waiting = (int) queueEntryRepository.countBySalonIdAndStatus(s.getId(), QueueStatus.WAITING);
        int serving = (int) queueEntryRepository.countBySalonIdAndStatus(s.getId(), QueueStatus.SERVING);
        int avgTime = s.getAverageServiceTimeMinutes() != null ? s.getAverageServiceTimeMinutes() : 20;

        s.setWaitingCount(waiting);
        s.setServingCount(serving);
        s.setTotalWaitTimeMinutes(waiting * avgTime);
        s.setWaitLevel(calculateWaitLevel(waiting));
    }

    private String calculateWaitLevel(int waitingCount) {
        if (waitingCount == 0) return "Available Now";
        if (waitingCount <= 2) return "Short Wait";
        if (waitingCount <= 5) return "Moderate Line";
        return "Peak Wait";
    }

    private String generateUniqueVerificationCode() {
        // Generates an elegant alphanumeric verification code e.g. "SLN-8429"
        int num = 1000 + random.nextInt(9000);
        return "SLN-" + num;
    }

    private double calculateHaversineDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return 0.0;
        }
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
