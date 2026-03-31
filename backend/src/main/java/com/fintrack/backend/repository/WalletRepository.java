package com.fintrack.backend.repository;

import com.fintrack.backend.model.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
@Repository
public interface WalletRepository extends JpaRepository<Wallet, String> {
    @Query("""
SELECT SUM(w.initialBalance) FROM Wallet w
WHERE w.account.id = :accountId
""")
    BigDecimal getTotalBalance(@Param("accountId") String accountId);
    @Query("""
SELECT 
    COALESCE(SUM(
        CASE 
            WHEN t.type = 'INCOME' THEN t.amount
            ELSE -t.amount
        END
    ), 0)
FROM Transaction t
WHERE t.wallet.account.id = :accountId
""")
    BigDecimal getActualBalance(@Param("accountId") String accountId);
    List<Wallet> findByAccount_Id(String accountId);

}