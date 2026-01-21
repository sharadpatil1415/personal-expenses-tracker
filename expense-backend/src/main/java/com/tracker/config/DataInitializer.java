package com.tracker.config;

import com.tracker.model.*;
import com.tracker.repository.ExpenseRepository;
import com.tracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

/**
 * Data Initializer - Seeds the database with sample data for demo purposes.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create demo user if not exists
        if (!userRepository.existsByUsername("demo")) {
            User demoUser = new User();
            demoUser.setUsername("demo");
            demoUser.setEmail("demo@example.com");
            demoUser.setPassword(passwordEncoder.encode("demo123"));
            demoUser.setFirstName("Demo");
            demoUser.setLastName("User");
            demoUser.setRole(Role.USER);
            demoUser.setEnabled(true);

            User savedUser = userRepository.save(demoUser);

            // Add sample expenses
            createSampleExpenses(savedUser);

            System.out.println("\n========================================");
            System.out.println("  Demo User Created!");
            System.out.println("  Username: demo");
            System.out.println("  Password: demo123");
            System.out.println("========================================\n");
        }
    }

    private void createSampleExpenses(User user) {
        Random random = new Random(42);
        LocalDate today = LocalDate.now();

        List<ExpenseData> sampleExpenses = Arrays.asList(
                new ExpenseData(Category.FOOD, "Lunch at cafe", "Starbucks", 15.50),
                new ExpenseData(Category.FOOD, "Grocery shopping", "Walmart", 85.30),
                new ExpenseData(Category.FOOD, "Dinner with friends", "Olive Garden", 45.00),
                new ExpenseData(Category.TRANSPORT, "Uber to airport", "Uber", 35.00),
                new ExpenseData(Category.TRANSPORT, "Gas refill", "Shell", 55.00),
                new ExpenseData(Category.TRANSPORT, "Monthly metro pass", "Metro", 95.00),
                new ExpenseData(Category.UTILITIES, "Electricity bill", "Power Co", 120.00),
                new ExpenseData(Category.UTILITIES, "Internet bill", "Comcast", 79.99),
                new ExpenseData(Category.UTILITIES, "Phone bill", "Verizon", 85.00),
                new ExpenseData(Category.ENTERTAINMENT, "Netflix subscription", "Netflix", 15.99),
                new ExpenseData(Category.ENTERTAINMENT, "Movie tickets", "AMC", 28.00),
                new ExpenseData(Category.ENTERTAINMENT, "Concert tickets", "Ticketmaster", 150.00),
                new ExpenseData(Category.SHOPPING, "New shoes", "Nike Store", 129.00),
                new ExpenseData(Category.SHOPPING, "Books", "Amazon", 45.00),
                new ExpenseData(Category.HEALTHCARE, "Doctor visit", "City Clinic", 75.00),
                new ExpenseData(Category.HEALTHCARE, "Pharmacy", "CVS", 32.50),
                new ExpenseData(Category.GROCERIES, "Weekly groceries", "Costco", 156.00),
                new ExpenseData(Category.GROCERIES, "Fresh produce", "Farmers Market", 42.00),
                new ExpenseData(Category.SUBSCRIPTIONS, "Spotify", "Spotify", 9.99),
                new ExpenseData(Category.SUBSCRIPTIONS, "Cloud storage", "Google", 2.99),
                new ExpenseData(Category.RENT, "Monthly rent", "Landlord", 1500.00),
                new ExpenseData(Category.EDUCATION, "Online course", "Udemy", 49.99),
                new ExpenseData(Category.TRAVEL, "Weekend hotel", "Marriott", 189.00),
                new ExpenseData(Category.OTHER, "Gift for friend", "Target", 50.00));

        for (int i = 0; i < sampleExpenses.size(); i++) {
            ExpenseData data = sampleExpenses.get(i);
            Expense expense = new Expense();
            expense.setUser(user);
            expense.setAmount(BigDecimal.valueOf(data.amount));
            expense.setCategory(data.category);
            expense.setDescription(data.description);
            expense.setExpenseDate(today.minusDays(random.nextInt(60)));
            expense.setMerchantName(data.merchant);
            expense.setPaymentMethod(random.nextBoolean() ? "Credit Card" : "Debit Card");
            expense.setIsRecurring(data.category == Category.SUBSCRIPTIONS ||
                    data.category == Category.RENT);

            expenseRepository.save(expense);
        }
    }

    private record ExpenseData(Category category, String description, String merchant, double amount) {
    }
}
