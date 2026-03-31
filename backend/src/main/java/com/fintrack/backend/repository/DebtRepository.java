package com.fintrack.backend.repository;

import com.fintrack.backend.model.Debt;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DebtRepository extends JpaRepository<Debt, Long> {
}
