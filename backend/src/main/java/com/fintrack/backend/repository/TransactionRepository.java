package com.fintrack.backend.repository;

import com.fintrack.backend.enums.TransactionType;
import com.fintrack.backend.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
    @Query("""
    SELECT SUM(t.amount) FROM Transaction t
    WHERE t.type = 'EXPENSE'
    AND t.wallet.account.id = :accountId
""")
    BigDecimal sumExpense(@Param("accountId") String accountId);

    @Query("""
    SELECT AVG(t.amount) FROM Transaction t
    WHERE t.type = 'EXPENSE'
    AND t.wallet.account.id = :accountId
""")
    BigDecimal avgLast3MonthsExpense(@Param("accountId") String accountId);

    @Query("""
    SELECT t.description, COUNT(t), SUM(t.amount)
    FROM Transaction t
    WHERE t.wallet.account.id = :accountId
    AND t.amount < 100000
    GROUP BY t.description
    HAVING COUNT(t) > 5
""")
    List<Object[]> findSmallFrequent(@Param("accountId") String accountId);
    // Lấy theo walletId (đã có)
    List<Transaction> findByWallet_Id(String walletId);

    // 🔥 Thêm cái bạn cần: lấy theo accountId thông qua Wallet
    List<Transaction> findByWallet_Account_Id(String accountId);

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.wallet.id = :walletId
        AND t.type = :type
        AND t.createdAt BETWEEN :start AND :end
    """)
    BigDecimal sumByWalletAndTypeAndDate(
            @Param("walletId") String walletId,
            @Param("type") TransactionType type,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.wallet.id = :walletId
        AND t.type = :type
        AND t.category.id IN :categoryIds
        AND t.createdAt BETWEEN :start AND :end
    """)
    BigDecimal sumByWalletTypeCategoryAndDate(
            @Param("walletId") String walletId,
            @Param("type") TransactionType type,
            @Param("categoryIds") List<String> categoryIds,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
    List<Transaction> findByWalletIdOrderByCreatedAtDesc(String walletId);
    List<Transaction> findByCategoryId(String categoryId);
}
