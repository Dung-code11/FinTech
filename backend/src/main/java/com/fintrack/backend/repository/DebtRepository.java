package com.fintrack.backend.repository;

import com.fintrack.backend.model.Debt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DebtRepository extends JpaRepository<Debt, Long> {
    List<Debt> findByWallet_Account_Id(String accountId);
}
