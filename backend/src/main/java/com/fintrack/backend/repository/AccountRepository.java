package com.fintrack.backend.repository;

import com.fintrack.backend.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {

    @Query("""
    SELECT a FROM Account a
    LEFT JOIN a.infoUser i
    WHERE a.username = :login OR i.email = :login
""")
    Optional<Account> findByLogin(@Param("login") String login);
    Optional<Account> findByUsername(String username);
}