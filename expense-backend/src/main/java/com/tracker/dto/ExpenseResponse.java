package com.tracker.dto;

import com.tracker.model.Category;
import com.tracker.model.Expense;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for expense responses.
 * Contains only the data needed by the client.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {
    private Long id;
    private BigDecimal amount;
    private Category category;
    private String categoryDisplayName;
    private String description;
    private LocalDate expenseDate;
    private String merchantName;
    private String paymentMethod;
    private Boolean isRecurring;
    private LocalDateTime createdAt;

    public static ExpenseResponse fromEntity(Expense expense) {
        ExpenseResponse response = new ExpenseResponse();
        response.setId(expense.getId());
        response.setAmount(expense.getAmount());
        response.setCategory(expense.getCategory());
        response.setCategoryDisplayName(expense.getCategory().getDisplayName());
        response.setDescription(expense.getDescription());
        response.setExpenseDate(expense.getExpenseDate());
        response.setMerchantName(expense.getMerchantName());
        response.setPaymentMethod(expense.getPaymentMethod());
        response.setIsRecurring(expense.getIsRecurring());
        response.setCreatedAt(expense.getCreatedAt());
        return response;
    }
}
