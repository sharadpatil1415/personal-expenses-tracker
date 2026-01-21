package com.tracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Personal Expense Tracker Application
 * 
 * A production-grade REST API for tracking personal expenses with:
 * - User registration and JWT authentication
 * - CRUD operations for expenses
 * - CSV export for analytics integration
 * - Integration with Python analytics and C++ calculation engines
 * 
 * @author Personal Project
 * @version 1.0.0
 */
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
        System.out.println("\n========================================");
        System.out.println("  Expense Tracker API Started!");
        System.out.println("  http://localhost:8080");
        System.out.println("  H2 Console: http://localhost:8080/h2-console");
        System.out.println("========================================\n");
    }
}
