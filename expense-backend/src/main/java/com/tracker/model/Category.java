package com.tracker.model;

/**
 * Category Enum - Predefined expense categories for consistent categorization.
 * 
 * Interview Talking Point: Using enums ensures type safety and prevents
 * invalid category values. This is a common pattern in financial applications.
 */
public enum Category {
    FOOD("Food & Dining"),
    TRANSPORT("Transportation"),
    UTILITIES("Utilities & Bills"),
    ENTERTAINMENT("Entertainment"),
    SHOPPING("Shopping"),
    HEALTHCARE("Healthcare"),
    EDUCATION("Education"),
    TRAVEL("Travel"),
    GROCERIES("Groceries"),
    SUBSCRIPTIONS("Subscriptions"),
    RENT("Rent & Housing"),
    INSURANCE("Insurance"),
    SAVINGS("Savings & Investments"),
    OTHER("Other");

    private final String displayName;

    Category(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
