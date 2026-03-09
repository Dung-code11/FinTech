package com.fintrack.backend.model;

import com.fintrack.backend.enums.Sex;
import jakarta.persistence.*;
import lombok.*;


import java.time.LocalDate;

@Entity
@Getter
@Setter
public class InfoUser {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String fullname;

    private String email;

    private LocalDate birthday;

    private String address;

    private String phone;

    @Enumerated(EnumType.STRING)
    private Sex sex;

    @OneToOne
    @JoinColumn(name = "account_id")
    private Account account;
}
