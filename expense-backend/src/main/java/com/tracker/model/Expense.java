package com.tracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Expense Entity - Core domain model representing a single expense entry.
 * 
 * Design Decisions:
 * - Uses BigDecimal for amount to avoid floating-point precision issues
 * - Indexed on user_id and date for efficient queries
 * - Includes audit fields (createdAt, updatedAt) for tracking
 */
@Entity
@Table(name = "expenses", indexes = {
        @Index(name = "idx_expense_user", columnList = "user_id"),
        @Index(name = "idx_expense_date", columnList = "expense_date"),
        @Index(name = "idx_expense_category", columnList = "category"),
        @Index(name = "idx_expense_user_date", columnList = "user_id, expense_date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Amount must have at most 2 decimal places")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @NotNull(message = "Category is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Category category;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    @Column(length = 255)
    private String description;

    @NotNull(message = "Expense date is required")
    @PastOrPresent(message = "Expense date cannot be in the future")
    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Size(max = 100, message = "Merchant name cannot exceed 100 characters")
    @Column(name = "merchant_name", length = 100)
    private String merchantName;

    @Size(max = 50, message = "Payment method cannot exceed 50 characters")
    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "is_recurring")
    private Boolean isRecurring = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
