package org.example.sentinelstream.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;
    private Double amount;
    private String currency;
    private String merchant;
    private String location;

    private String status;   // PENDING, APPROVED, REJECTED

    @Column(length = 1000)
    private String aiAnalysis;
}
