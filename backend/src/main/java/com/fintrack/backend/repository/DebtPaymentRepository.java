package com.fintrack.backend.repository;

import com.fintrack.backend.model.DebtPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DebtPaymentRepository extends JpaRepository<DebtPayment, Long> {
    List<DebtPayment> findByDebtId(Long debtId);
}
