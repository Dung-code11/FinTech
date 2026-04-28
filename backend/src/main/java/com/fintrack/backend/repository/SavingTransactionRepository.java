package com.fintrack.backend.repository;

import com.fintrack.backend.model.SavingTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SavingTransactionRepository extends JpaRepository<SavingTransaction, Long> {
}
