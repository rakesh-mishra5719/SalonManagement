package com.salon.repository;

import com.salon.model.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    List<OtpVerification> findByPhoneOrderByCreatedAtDesc(String phone);
}
