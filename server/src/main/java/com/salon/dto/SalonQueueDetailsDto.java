package com.salon.dto;

import com.salon.model.QueueEntry;
import com.salon.model.Salon;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalonQueueDetailsDto {
    private Salon salon;
    private List<QueueEntry> waitingList;
    private List<QueueEntry> servingList;
    private List<QueueEntry> completedList;
    private int waitingCount;
    private int servingCount;
    private int completedTodayCount;
    private int estimatedWaitMinutes;
    private String waitLevel;
}
