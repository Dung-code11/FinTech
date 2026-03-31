package com.fintrack.backend.repository;

import com.fintrack.backend.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BudgetRepository extends JpaRepository<Budget, String> {

    List<Budget> findByWallet_Id(String walletId);
}