package com.fintrack.backend.repository;

import com.fintrack.backend.model.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface WalletRepository extends JpaRepository<Wallet, String> {

    List<Wallet> findByAccount_Id(String accountId);

}