package com.tracker.controller;

import com.tracker.dto.*;
import com.tracker.model.Category;
import com.tracker.model.User;
import com.tracker.service.ExpenseService;
import com.tracker.service.IntegrationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Expense Controller - REST API for expense CRUD and analytics operations.
 * 
 * Interview Talking Point: Demonstrates RESTful API design with proper
 * HTTP methods, pagination, filtering, and content negotiation.
 */
@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private IntegrationService integrationService;

    // ==================== CRUD Endpoints ====================

    /**
     * Create a new expense.
     * 
     * POST /api/expenses
     * Authorization: Bearer <token>
     * {
     * "amount": 45.99,
     * "category": "FOOD",
     * "description": "Dinner at restaurant",
     * "expenseDate": "2024-01-15",
     * "merchantName": "Pizza Palace",
     * "paymentMethod": "Credit Card"
     * }
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseResponse>> createExpense(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ExpenseRequest request) {
        ExpenseResponse response = expenseService.createExpense(user, request);
        return ResponseEntity.ok(ApiResponse.success("Expense created", response));
    }

    /**
     * Get all expenses for the authenticated user.
     * 
     * GET /api/expenses
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getAllExpenses(
            @AuthenticationPrincipal User user) {
        List<ExpenseResponse> expenses = expenseService.getAllExpenses(user);
        return ResponseEntity.ok(ApiResponse.success(expenses));
    }

    /**
     * Get expenses with pagination.
     * 
     * GET /api/expenses/paginated?page=0&size=10&sort=expenseDate,desc
     */
    @GetMapping("/paginated")
    public ResponseEntity<ApiResponse<Page<ExpenseResponse>>> getExpensesPaginated(
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 10, sort = "expenseDate", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ExpenseResponse> expenses = expenseService.getExpensesPaginated(user, pageable);
        return ResponseEntity.ok(ApiResponse.success(expenses));
    }

    /**
     * Get a single expense by ID.
     * 
     * GET /api/expenses/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponse>> getExpense(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        ExpenseResponse expense = expenseService.getExpense(user, id);
        return ResponseEntity.ok(ApiResponse.success(expense));
    }

    /**
     * Update an expense.
     * 
     * PUT /api/expenses/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponse>> updateExpense(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request) {
        ExpenseResponse response = expenseService.updateExpense(user, id, request);
        return ResponseEntity.ok(ApiResponse.success("Expense updated", response));
    }

    /**
     * Delete an expense.
     * 
     * DELETE /api/expenses/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        expenseService.deleteExpense(user, id);
        return ResponseEntity.ok(ApiResponse.success("Expense deleted", null));
    }

    // ==================== Query Endpoints ====================

    /**
     * Get expenses by month.
     * 
     * GET /api/expenses/month?year=2024&month=1
     */
    @GetMapping("/month")
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getExpensesByMonth(
            @AuthenticationPrincipal User user,
            @RequestParam int year,
            @RequestParam int month) {
        List<ExpenseResponse> expenses = expenseService.getExpensesByMonth(user, year, month);
        return ResponseEntity.ok(ApiResponse.success(expenses));
    }

    /**
     * Get expenses by category.
     * 
     * GET /api/expenses/category/FOOD
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getExpensesByCategory(
            @AuthenticationPrincipal User user,
            @PathVariable Category category) {
        List<ExpenseResponse> expenses = expenseService.getExpensesByCategory(user, category);
        return ResponseEntity.ok(ApiResponse.success(expenses));
    }

    /**
     * Get expenses by date range.
     * 
     * GET /api/expenses/range?startDate=2024-01-01&endDate=2024-01-31
     */
    @GetMapping("/range")
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getExpensesByDateRange(
            @AuthenticationPrincipal User user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<ExpenseResponse> expenses = expenseService.getExpensesByDateRange(user, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(expenses));
    }

    // ==================== Analytics Endpoints ====================

    /**
     * Get spending summary and analytics.
     * 
     * GET /api/expenses/summary
     */
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSpendingSummary(
            @AuthenticationPrincipal User user) {
        Map<String, Object> summary = expenseService.getSpendingSummary(user);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    /**
     * Get list of all categories.
     * 
     * GET /api/expenses/categories
     */
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<Category[]>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success(Category.values()));
    }

    // ==================== Export Endpoints ====================

    /**
     * Export expenses as CSV.
     * 
     * GET /api/expenses/export/csv
     */
    @GetMapping("/export/csv")
    public ResponseEntity<String> exportToCsv(@AuthenticationPrincipal User user) throws IOException {
        String csvContent = expenseService.exportToCsv(user);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment",
                String.format("expenses_%s.csv", LocalDate.now()));

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvContent);
    }

    // ==================== Integration Endpoints ====================

    /**
     * Get analytics from Python engine.
     * 
     * POST /api/expenses/analytics/python
     */
    @PostMapping("/analytics/python")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPythonAnalytics(
            @AuthenticationPrincipal User user) throws IOException {
        String csvPath = expenseService.exportToCsvFile(user);
        Map<String, Object> analytics = integrationService.callPythonAnalytics(csvPath);
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    /**
     * Get calculations from C++ engine.
     * 
     * POST /api/expenses/analytics/cpp
     */
    @PostMapping("/analytics/cpp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCppCalculations(
            @AuthenticationPrincipal User user) {
        List<ExpenseResponse> expenses = expenseService.getAllExpenses(user);
        double[] amounts = expenses.stream()
                .mapToDouble(e -> e.getAmount().doubleValue())
                .toArray();

        Map<String, Object> calculations = integrationService.callCppCalculator(amounts);
        return ResponseEntity.ok(ApiResponse.success(calculations));
    }
}
