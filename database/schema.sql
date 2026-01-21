-- ============================================
-- Personal Expense Tracker - Database Schema
-- Author: Personal Project
-- Version: 1.0.0
-- ============================================

-- Drop tables if they exist (for clean initialization)
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS users;

-- ============================================
-- USERS TABLE
-- ============================================
-- Stores registered user information
-- Indexed on username and email for fast lookups

CREATE TABLE users (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    username        VARCHAR(50) NOT NULL UNIQUE,
    email           VARCHAR(100) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    first_name      VARCHAR(50),
    last_name       VARCHAR(50),
    role            VARCHAR(20) NOT NULL DEFAULT 'USER',
    is_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for fast lookups
    INDEX idx_user_username (username),
    INDEX idx_user_email (email)
);

-- ============================================
-- EXPENSES TABLE
-- ============================================
-- Stores individual expense records
-- Indexed on user_id, date, and category for efficient queries

CREATE TABLE expenses (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT NOT NULL,
    amount          DECIMAL(12, 2) NOT NULL,
    category        VARCHAR(30) NOT NULL,
    description     VARCHAR(255),
    expense_date    DATE NOT NULL,
    merchant_name   VARCHAR(100),
    payment_method  VARCHAR(50),
    is_recurring    BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_expense_user 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE,
    
    -- Indexes for common queries
    INDEX idx_expense_user (user_id),
    INDEX idx_expense_date (expense_date),
    INDEX idx_expense_category (category),
    INDEX idx_expense_user_date (user_id, expense_date),
    INDEX idx_expense_user_category (user_id, category),
    
    -- Ensure positive amounts
    CONSTRAINT chk_positive_amount CHECK (amount > 0)
);

-- ============================================
-- SAMPLE DATA INSERTION
-- ============================================

-- Insert demo user (password: demo123, BCrypt hashed)
INSERT INTO users (username, email, password, first_name, last_name, role) VALUES
('demo', 'demo@example.com', '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG', 'Demo', 'User', 'USER'),
('admin', 'admin@example.com', '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG', 'Admin', 'User', 'ADMIN');

-- Insert sample expenses for demo user
INSERT INTO expenses (user_id, amount, category, description, expense_date, merchant_name, payment_method, is_recurring) VALUES
(1, 15.50, 'FOOD', 'Lunch at cafe', '2024-01-15', 'Starbucks', 'Credit Card', FALSE),
(1, 85.30, 'GROCERIES', 'Weekly groceries', '2024-01-14', 'Walmart', 'Debit Card', FALSE),
(1, 45.00, 'FOOD', 'Dinner with friends', '2024-01-13', 'Olive Garden', 'Credit Card', FALSE),
(1, 35.00, 'TRANSPORT', 'Uber to airport', '2024-01-12', 'Uber', 'Credit Card', FALSE),
(1, 55.00, 'TRANSPORT', 'Gas refill', '2024-01-11', 'Shell', 'Debit Card', FALSE),
(1, 95.00, 'TRANSPORT', 'Monthly metro pass', '2024-01-10', 'Metro', 'Debit Card', TRUE),
(1, 120.00, 'UTILITIES', 'Electricity bill', '2024-01-09', 'Power Co', 'Bank Transfer', TRUE),
(1, 79.99, 'UTILITIES', 'Internet bill', '2024-01-08', 'Comcast', 'Bank Transfer', TRUE),
(1, 85.00, 'UTILITIES', 'Phone bill', '2024-01-07', 'Verizon', 'Credit Card', TRUE),
(1, 15.99, 'SUBSCRIPTIONS', 'Netflix subscription', '2024-01-06', 'Netflix', 'Credit Card', TRUE),
(1, 28.00, 'ENTERTAINMENT', 'Movie tickets', '2024-01-05', 'AMC', 'Credit Card', FALSE),
(1, 150.00, 'ENTERTAINMENT', 'Concert tickets', '2024-01-04', 'Ticketmaster', 'Credit Card', FALSE),
(1, 129.00, 'SHOPPING', 'New shoes', '2024-01-03', 'Nike Store', 'Credit Card', FALSE),
(1, 45.00, 'SHOPPING', 'Books', '2024-01-02', 'Amazon', 'Credit Card', FALSE),
(1, 75.00, 'HEALTHCARE', 'Doctor visit', '2024-01-01', 'City Clinic', 'Insurance', FALSE),
(1, 32.50, 'HEALTHCARE', 'Pharmacy', '2023-12-31', 'CVS', 'Debit Card', FALSE),
(1, 156.00, 'GROCERIES', 'Costco haul', '2023-12-30', 'Costco', 'Debit Card', FALSE),
(1, 42.00, 'GROCERIES', 'Fresh produce', '2023-12-29', 'Farmers Market', 'Cash', FALSE),
(1, 9.99, 'SUBSCRIPTIONS', 'Spotify', '2023-12-28', 'Spotify', 'Credit Card', TRUE),
(1, 1500.00, 'RENT', 'Monthly rent', '2023-12-26', 'Landlord', 'Bank Transfer', TRUE);

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- Total spending by category for a user
-- SELECT category, SUM(amount) as total 
-- FROM expenses WHERE user_id = 1 
-- GROUP BY category ORDER BY total DESC;

-- Monthly spending trend
-- SELECT YEAR(expense_date) as year, MONTH(expense_date) as month, SUM(amount) as total
-- FROM expenses WHERE user_id = 1
-- GROUP BY YEAR(expense_date), MONTH(expense_date)
-- ORDER BY year DESC, month DESC;

-- Expenses in date range
-- SELECT * FROM expenses 
-- WHERE user_id = 1 AND expense_date BETWEEN '2024-01-01' AND '2024-01-31'
-- ORDER BY expense_date DESC;
