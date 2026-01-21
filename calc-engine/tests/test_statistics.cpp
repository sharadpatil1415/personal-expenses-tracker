/**
 * Statistics Unit Tests
 * 
 * Simple test framework for validating statistical calculations.
 */

#include "statistics.hpp"
#include <iostream>
#include <cmath>
#include <cassert>

using namespace expense;

#define TEST(name) std::cout << "Testing: " << #name << "... "; 
#define PASS() std::cout << "PASSED\n"; passed++;
#define FAIL(msg) std::cout << "FAILED: " << msg << "\n"; failed++;

bool nearly_equal(double a, double b, double epsilon = 0.001) {
    return std::abs(a - b) < epsilon;
}

int main() {
    int passed = 0;
    int failed = 0;
    
    // Test data
    std::vector<double> data = {10, 20, 30, 40, 50};
    std::vector<double> data_with_outlier = {10, 20, 30, 40, 50, 200};
    
    // Test sum
    TEST(sum)
    double sum_result = StatisticsCalculator::sum(data);
    if (nearly_equal(sum_result, 150.0)) {
        PASS()
    } else {
        FAIL("Expected 150, got " + std::to_string(sum_result))
    }
    
    // Test mean
    TEST(mean)
    double mean_result = StatisticsCalculator::mean(data);
    if (nearly_equal(mean_result, 30.0)) {
        PASS()
    } else {
        FAIL("Expected 30, got " + std::to_string(mean_result))
    }
    
    // Test median (odd count)
    TEST(median_odd)
    double median_result = StatisticsCalculator::median(data);
    if (nearly_equal(median_result, 30.0)) {
        PASS()
    } else {
        FAIL("Expected 30, got " + std::to_string(median_result))
    }
    
    // Test median (even count)
    TEST(median_even)
    std::vector<double> even_data = {10, 20, 30, 40};
    double median_even = StatisticsCalculator::median(even_data);
    if (nearly_equal(median_even, 25.0)) {
        PASS()
    } else {
        FAIL("Expected 25, got " + std::to_string(median_even))
    }
    
    // Test variance
    TEST(variance)
    double var_result = StatisticsCalculator::variance(data);
    if (nearly_equal(var_result, 200.0)) {
        PASS()
    } else {
        FAIL("Expected 200, got " + std::to_string(var_result))
    }
    
    // Test stddev
    TEST(stddev)
    double stddev_result = StatisticsCalculator::stddev(data);
    if (nearly_equal(stddev_result, 14.142, 0.01)) {
        PASS()
    } else {
        FAIL("Expected ~14.142, got " + std::to_string(stddev_result))
    }
    
    // Test percentile
    TEST(percentile_50)
    double p50 = StatisticsCalculator::percentile(data, 50);
    if (nearly_equal(p50, 30.0)) {
        PASS()
    } else {
        FAIL("Expected 30, got " + std::to_string(p50))
    }
    
    TEST(percentile_25)
    double p25 = StatisticsCalculator::percentile(data, 25);
    if (nearly_equal(p25, 20.0)) {
        PASS()
    } else {
        FAIL("Expected 20, got " + std::to_string(p25))
    }
    
    // Test moving average
    TEST(moving_average)
    MovingAverageResult ma = StatisticsCalculator::moving_average(data, 3);
    if (ma.values.size() == 3 && nearly_equal(ma.values[0], 20.0)) {
        PASS()
    } else {
        FAIL("Moving average calculation incorrect")
    }
    
    // Test exponential moving average
    TEST(exponential_moving_average)
    MovingAverageResult ema = StatisticsCalculator::exponential_moving_average(data, 0.5);
    if (ema.values.size() == 5 && nearly_equal(ema.values[0], 10.0)) {
        PASS()
    } else {
        FAIL("EMA calculation incorrect")
    }
    
    // Test outlier detection
    TEST(outlier_detection)
    std::vector<size_t> outliers = StatisticsCalculator::detect_outliers(data_with_outlier);
    // 200 should be detected as an outlier
    bool found_outlier = false;
    for (size_t idx : outliers) {
        if (idx == 5) found_outlier = true;
    }
    if (found_outlier) {
        PASS()
    } else {
        FAIL("Failed to detect outlier at index 5")
    }
    
    // Test calculate_all
    TEST(calculate_all)
    StatisticsResult stats = StatisticsCalculator::calculate_all(data);
    if (nearly_equal(stats.sum, 150.0) && 
        nearly_equal(stats.mean, 30.0) &&
        stats.count == 5) {
        PASS()
    } else {
        FAIL("Comprehensive stats calculation incorrect")
    }
    
    // Test correlation
    TEST(correlation_positive)
    std::vector<double> x = {1, 2, 3, 4, 5};
    std::vector<double> y = {2, 4, 6, 8, 10};
    CorrelationResult corr = StatisticsCalculator::correlation(x, y);
    if (nearly_equal(corr.pearson_coefficient, 1.0) && corr.direction == "positive") {
        PASS()
    } else {
        FAIL("Perfect positive correlation not detected")
    }
    
    // Test JSON output
    TEST(json_output)
    std::string json = stats.to_json();
    if (json.find("\"sum\":150") != std::string::npos) {
        PASS()
    } else {
        FAIL("JSON output format incorrect")
    }
    
    // Summary
    std::cout << "\n========================================\n";
    std::cout << "Tests passed: " << passed << "\n";
    std::cout << "Tests failed: " << failed << "\n";
    std::cout << "========================================\n";
    
    return failed > 0 ? 1 : 0;
}
