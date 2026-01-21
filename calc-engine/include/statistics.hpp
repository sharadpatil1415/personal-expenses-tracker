/**
 * Statistics Library Header
 * 
 * High-performance statistical calculations for expense analysis.
 * 
 * Interview Talking Points:
 * - Template metaprogramming for type flexibility
 * - Move semantics for efficient data handling
 * - Algorithm optimization with O(n) complexity where possible
 * 
 * @author Personal Project
 * @version 1.0.0
 */

#ifndef EXPENSE_STATISTICS_HPP
#define EXPENSE_STATISTICS_HPP

#include <vector>
#include <string>
#include <cmath>
#include <algorithm>
#include <numeric>
#include <stdexcept>
#include <map>

namespace expense {

/**
 * Statistical calculation results structure.
 */
struct StatisticsResult {
    double sum = 0.0;
    double mean = 0.0;
    double median = 0.0;
    double mode = 0.0;
    double variance = 0.0;
    double stddev = 0.0;
    double min = 0.0;
    double max = 0.0;
    double range = 0.0;
    double q1 = 0.0;         // First quartile (25th percentile)
    double q3 = 0.0;         // Third quartile (75th percentile)
    double iqr = 0.0;        // Interquartile range
    size_t count = 0;
    
    std::string to_json() const;
};

/**
 * Moving average result structure.
 */
struct MovingAverageResult {
    std::vector<double> values;
    double current_average = 0.0;
    int window_size = 0;
    
    std::string to_json() const;
};

/**
 * Correlation result structure.
 */
struct CorrelationResult {
    double pearson_coefficient = 0.0;
    double r_squared = 0.0;
    std::string strength;
    std::string direction;
    
    std::string to_json() const;
};

/**
 * Statistics Calculator Class
 * 
 * Provides high-performance statistical calculations for expense data.
 */
class StatisticsCalculator {
public:
    /**
     * Calculate comprehensive statistics for a dataset.
     * 
     * @param data Vector of expense amounts
     * @return StatisticsResult with all calculated values
     */
    static StatisticsResult calculate_all(const std::vector<double>& data);
    
    /**
     * Calculate the sum of values.
     * Time Complexity: O(n)
     */
    static double sum(const std::vector<double>& data);
    
    /**
     * Calculate the arithmetic mean.
     * Time Complexity: O(n)
     */
    static double mean(const std::vector<double>& data);
    
    /**
     * Calculate the median (middle value).
     * Time Complexity: O(n log n) due to sorting
     */
    static double median(std::vector<double> data);
    
    /**
     * Calculate the mode (most frequent value).
     * Time Complexity: O(n)
     */
    static double mode(const std::vector<double>& data);
    
    /**
     * Calculate variance (population variance).
     * Time Complexity: O(n)
     */
    static double variance(const std::vector<double>& data);
    
    /**
     * Calculate sample variance.
     * Time Complexity: O(n)
     */
    static double sample_variance(const std::vector<double>& data);
    
    /**
     * Calculate standard deviation.
     * Time Complexity: O(n)
     */
    static double stddev(const std::vector<double>& data);
    
    /**
     * Calculate sample standard deviation.
     * Time Complexity: O(n)
     */
    static double sample_stddev(const std::vector<double>& data);
    
    /**
     * Calculate percentile value.
     * Time Complexity: O(n log n)
     * 
     * @param data Input data
     * @param percentile Percentile (0-100)
     */
    static double percentile(std::vector<double> data, double percentile);
    
    /**
     * Calculate simple moving average.
     * Time Complexity: O(n)
     * 
     * @param data Input data
     * @param window Window size
     */
    static MovingAverageResult moving_average(const std::vector<double>& data, int window);
    
    /**
     * Calculate exponential moving average.
     * Time Complexity: O(n)
     * 
     * @param data Input data
     * @param alpha Smoothing factor (0-1)
     */
    static MovingAverageResult exponential_moving_average(const std::vector<double>& data, double alpha);
    
    /**
     * Calculate Pearson correlation coefficient.
     * Time Complexity: O(n)
     */
    static CorrelationResult correlation(const std::vector<double>& x, const std::vector<double>& y);
    
    /**
     * Detect outliers using IQR method.
     * Time Complexity: O(n log n)
     * 
     * @param data Input data
     * @param threshold IQR multiplier (default 1.5)
     * @return Indices of outliers
     */
    static std::vector<size_t> detect_outliers(const std::vector<double>& data, double threshold = 1.5);
    
    /**
     * Calculate monthly totals from daily data.
     * Time Complexity: O(n)
     * 
     * @param amounts Daily amounts
     * @param days_in_months Vector of days in each month
     */
    static std::vector<double> monthly_totals(const std::vector<double>& amounts, 
                                               const std::vector<int>& days_in_months);
};

} // namespace expense

#endif // EXPENSE_STATISTICS_HPP
