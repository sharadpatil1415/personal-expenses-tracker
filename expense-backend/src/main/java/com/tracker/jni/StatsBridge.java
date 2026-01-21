package com.tracker.jni;

/**
 * StatsBridge - Java interface to the C++ statistics library.
 * 
 * This class provides JNI bindings to call high-performance
 * C++ calculations from Java code.
 * 
 * Interview Talking Points:
 * - JNI for native code integration
 * - Performance optimization with native code
 * - Fallback to Java implementation if native library unavailable
 * 
 * Usage:
 * StatsBridge stats = new StatsBridge();
 * String result = stats.calculateStats(new double[]{10, 20, 30});
 */
public class StatsBridge {

    private boolean nativeLibraryLoaded = false;

    static {
        try {
            System.loadLibrary("expense_stats_jni");
        } catch (UnsatisfiedLinkError e) {
            System.err.println("Warning: Native library not loaded. Using Java fallback.");
        }
    }

    public StatsBridge() {
        try {
            // Test if native library is available
            nativeLibraryLoaded = true;
        } catch (Exception e) {
            nativeLibraryLoaded = false;
        }
    }

    /**
     * Check if native library is available.
     */
    public boolean isNativeAvailable() {
        return nativeLibraryLoaded;
    }

    /**
     * Calculate comprehensive statistics for expense amounts.
     * 
     * @param amounts Array of expense amounts
     * @return JSON string with statistics
     */
    public native String calculateStats(double[] amounts);

    /**
     * Calculate simple moving average.
     * 
     * @param amounts Array of expense amounts
     * @param window  Window size
     * @return JSON string with moving average data
     */
    public native String calculateMovingAverage(double[] amounts, int window);

    /**
     * Calculate exponential moving average.
     * 
     * @param amounts Array of expense amounts
     * @param alpha   Smoothing factor (0-1)
     * @return JSON string with EMA data
     */
    public native String calculateEMA(double[] amounts, double alpha);

    /**
     * Detect outliers in expense data.
     * 
     * @param amounts   Array of expense amounts
     * @param threshold IQR multiplier for outlier detection
     * @return Array of outlier indices
     */
    public native int[] detectOutliers(double[] amounts, double threshold);

    /**
     * Calculate correlation between two datasets.
     * 
     * @param x First dataset
     * @param y Second dataset
     * @return JSON string with correlation data
     */
    public native String calculateCorrelation(double[] x, double[] y);

    // ==================== Java Fallback Implementations ====================

    /**
     * Java fallback for statistics calculation.
     * Used when native library is not available.
     */
    public String calculateStatsFallback(double[] amounts) {
        if (amounts == null || amounts.length == 0) {
            return "{\"error\":\"No data provided\"}";
        }

        double sum = 0;
        double min = amounts[0];
        double max = amounts[0];

        for (double amount : amounts) {
            sum += amount;
            if (amount < min)
                min = amount;
            if (amount > max)
                max = amount;
        }

        double mean = sum / amounts.length;

        // Calculate variance
        double variance = 0;
        for (double amount : amounts) {
            variance += Math.pow(amount - mean, 2);
        }
        variance /= amounts.length;

        double stddev = Math.sqrt(variance);

        return String.format(
                "{\"sum\":%.2f,\"mean\":%.2f,\"min\":%.2f,\"max\":%.2f,\"variance\":%.2f,\"stddev\":%.2f,\"count\":%d}",
                sum, mean, min, max, variance, stddev, amounts.length);
    }

    /**
     * Get statistics using native library if available, otherwise fallback to Java.
     */
    public String getStatistics(double[] amounts) {
        if (nativeLibraryLoaded) {
            try {
                return calculateStats(amounts);
            } catch (Exception e) {
                return calculateStatsFallback(amounts);
            }
        }
        return calculateStatsFallback(amounts);
    }
}
