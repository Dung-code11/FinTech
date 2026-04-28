package com.fintrack.backend.repository;

import com.fintrack.backend.model.Saving;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SavingRepository extends JpaRepository<Saving, String> {
    List<Saving> findByWallet_Id(String walletId);

    List<Saving> findByWallet_Account_Id(String accountId);
}
