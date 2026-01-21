package com.tracker.repository;

import com.tracker.model.Category;
import com.tracker.model.Expense;
import com.tracker.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Expense Repository - Data access layer for Expense entity.
 * 
 * Interview Talking Point: Custom JPQL queries demonstrate understanding
 * of database optimization and complex query requirements.
 */
@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    // Find all expenses for a user
    List<Expense> findByUserOrderByExpenseDateDesc(User user);

    Page<Expense> findByUser(User user, Pageable pageable);

    // Find expenses by user and date range
    List<Expense> findByUserAndExpenseDateBetweenOrderByExpenseDateDesc(
            User user, LocalDate startDate, LocalDate endDate);

    // Find expenses by user and category
    List<Expense> findByUserAndCategoryOrderByExpenseDateDesc(User user, Category category);

    // Find expenses by month
    @Query("SELECT e FROM Expense e WHERE e.user = :user " +
            "AND YEAR(e.expenseDate) = :year AND MONTH(e.expenseDate) = :month " +
            "ORDER BY e.expenseDate DESC")
    List<Expense> findByUserAndMonth(@Param("user") User user,
            @Param("year") int year,
            @Param("month") int month);

    // Get total spending for a user
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user = :user")
    BigDecimal getTotalSpendingByUser(@Param("user") User user);

    // Get total spending by category
    @Query("SELECT e.category, SUM(e.amount) FROM Expense e " +
            "WHERE e.user = :user GROUP BY e.category ORDER BY SUM(e.amount) DESC")
    List<Object[]> getSpendingByCategory(@Param("user") User user);

    // Get monthly spending summary
    @Query("SELECT YEAR(e.expenseDate), MONTH(e.expenseDate), SUM(e.amount) " +
            "FROM Expense e WHERE e.user = :user " +
            "GROUP BY YEAR(e.expenseDate), MONTH(e.expenseDate) " +
            "ORDER BY YEAR(e.expenseDate) DESC, MONTH(e.expenseDate) DESC")
    List<Object[]> getMonthlySpending(@Param("user") User user);

    // Get spending for date range
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e " +
            "WHERE e.user = :user AND e.expenseDate BETWEEN :startDate AND :endDate")
    BigDecimal getSpendingInRange(@Param("user") User user,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Count expenses by user
    long countByUser(User user);
}
