package com.fintrack.backend.repository;

import com.fintrack.backend.model.InfoUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InfoUserRepository extends JpaRepository<InfoUser, Long> {

    Optional<InfoUser> findByEmail(String email);

    Optional<InfoUser> findByUsername(String username);

}