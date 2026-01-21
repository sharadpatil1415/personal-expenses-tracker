package com.tracker.service;

import com.tracker.dto.ExpenseRequest;
import com.tracker.dto.ExpenseResponse;
import com.tracker.model.Category;
import com.tracker.model.Expense;
import com.tracker.model.User;
import com.tracker.repository.ExpenseRepository;
import com.opencsv.CSVWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.FileWriter;
import java.io.IOException;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Expense Service - Business logic layer for expense operations.
 * 
 * Interview Talking Point: This service demonstrates separation of concerns,
 * transaction management, and complex business logic processing.
 */
@Service
@Transactional
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Value("${export.csv.directory:./exports}")
    private String exportDirectory;

    // ==================== CRUD Operations ====================

    public ExpenseResponse createExpense(User user, ExpenseRequest request) {
        Expense expense = new Expense();
        expense.setUser(user);
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setMerchantName(request.getMerchantName());
        expense.setPaymentMethod(request.getPaymentMethod());
        expense.setIsRecurring(request.getIsRecurring());

        Expense saved = expenseRepository.save(expense);
        return ExpenseResponse.fromEntity(saved);
    }

    public ExpenseResponse getExpense(User user, Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        return ExpenseResponse.fromEntity(expense);
    }

    public List<ExpenseResponse> getAllExpenses(User user) {
        return expenseRepository.findByUserOrderByExpenseDateDesc(user)
                .stream()
                .map(ExpenseResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public Page<ExpenseResponse> getExpensesPaginated(User user, Pageable pageable) {
        return expenseRepository.findByUser(user, pageable)
                .map(ExpenseResponse::fromEntity);
    }

    public ExpenseResponse updateExpense(User user, Long expenseId, ExpenseRequest request) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setMerchantName(request.getMerchantName());
        expense.setPaymentMethod(request.getPaymentMethod());
        expense.setIsRecurring(request.getIsRecurring());

        Expense updated = expenseRepository.save(expense);
        return ExpenseResponse.fromEntity(updated);
    }

    public void deleteExpense(User user, Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        expenseRepository.delete(expense);
    }

    // ==================== Query Operations ====================

    public List<ExpenseResponse> getExpensesByMonth(User user, int year, int month) {
        return expenseRepository.findByUserAndMonth(user, year, month)
                .stream()
                .map(ExpenseResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ExpenseResponse> getExpensesByCategory(User user, Category category) {
        return expenseRepository.findByUserAndCategoryOrderByExpenseDateDesc(user, category)
                .stream()
                .map(ExpenseResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ExpenseResponse> getExpensesByDateRange(User user, LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByUserAndExpenseDateBetweenOrderByExpenseDateDesc(user, startDate, endDate)
                .stream()
                .map(ExpenseResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ==================== Analytics Operations ====================

    public Map<String, Object> getSpendingSummary(User user) {
        Map<String, Object> summary = new HashMap<>();

        // Total spending
        BigDecimal totalSpending = expenseRepository.getTotalSpendingByUser(user);
        summary.put("totalSpending", totalSpending);

        // Total expenses count
        long expenseCount = expenseRepository.countByUser(user);
        summary.put("expenseCount", expenseCount);

        // Spending by category
        List<Object[]> categorySpending = expenseRepository.getSpendingByCategory(user);
        Map<String, BigDecimal> categoryBreakdown = new HashMap<>();
        for (Object[] row : categorySpending) {
            Category category = (Category) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            categoryBreakdown.put(category.getDisplayName(), amount);
        }
        summary.put("categoryBreakdown", categoryBreakdown);

        // Monthly spending trend
        List<Object[]> monthlySpending = expenseRepository.getMonthlySpending(user);
        List<Map<String, Object>> monthlyTrend = monthlySpending.stream()
                .map(row -> {
                    Map<String, Object> month = new HashMap<>();
                    month.put("year", row[0]);
                    month.put("month", row[1]);
                    month.put("amount", row[2]);
                    return month;
                })
                .collect(Collectors.toList());
        summary.put("monthlyTrend", monthlyTrend);

        return summary;
    }

    // ==================== CSV Export ====================

    public String exportToCsv(User user) throws IOException {
        List<Expense> expenses = expenseRepository.findByUserOrderByExpenseDateDesc(user);

        StringWriter stringWriter = new StringWriter();
        try (CSVWriter csvWriter = new CSVWriter(stringWriter)) {
            // Write header
            String[] header = { "ID", "Amount", "Category", "Description", "Date", "Merchant", "Payment Method",
                    "Recurring" };
            csvWriter.writeNext(header);

            // Write data
            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE;
            for (Expense expense : expenses) {
                String[] row = {
                        expense.getId().toString(),
                        expense.getAmount().toString(),
                        expense.getCategory().name(),
                        expense.getDescription() != null ? expense.getDescription() : "",
                        expense.getExpenseDate().format(formatter),
                        expense.getMerchantName() != null ? expense.getMerchantName() : "",
                        expense.getPaymentMethod() != null ? expense.getPaymentMethod() : "",
                        expense.getIsRecurring().toString()
                };
                csvWriter.writeNext(row);
            }
        }

        return stringWriter.toString();
    }

    public String exportToCsvFile(User user) throws IOException {
        String csvContent = exportToCsv(user);

        // Create export directory if not exists
        Path exportPath = Paths.get(exportDirectory);
        if (!Files.exists(exportPath)) {
            Files.createDirectories(exportPath);
        }

        // Generate filename with timestamp
        String filename = String.format("expenses_%s_%s.csv",
                user.getUsername(),
                LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE));
        Path filePath = exportPath.resolve(filename);

        // Write to file
        Files.writeString(filePath, csvContent);

        return filePath.toAbsolutePath().toString();
    }
}
