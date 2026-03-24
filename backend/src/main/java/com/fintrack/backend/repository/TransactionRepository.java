package com.fintrack.backend.repository;

import com.fintrack.backend.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {

    // Lấy theo walletId (đã có)
    List<Transaction> findByWallet_Id(String walletId);

    // 🔥 Thêm cái bạn cần: lấy theo accountId thông qua Wallet
    List<Transaction> findByWallet_Account_Id(String accountId);
}
