/**
 * Statistics Library Implementation
 * 
 * High-performance statistical calculations for expense analysis.
 * All algorithms are optimized for efficiency with documented complexity.
 * 
 * @author Personal Project
 * @version 1.0.0
 */

#include "statistics.hpp"
#include <sstream>
#include <iomanip>
#include <unordered_map>

namespace expense {

// ==================== Result to JSON ====================

std::string StatisticsResult::to_json() const {
    std::ostringstream oss;
    oss << std::fixed << std::setprecision(2);
    oss << "{";
    oss << "\"sum\":" << sum << ",";
    oss << "\"mean\":" << mean << ",";
    oss << "\"median\":" << median << ",";
    oss << "\"mode\":" << mode << ",";
    oss << "\"variance\":" << variance << ",";
    oss << "\"stddev\":" << stddev << ",";
    oss << "\"min\":" << min << ",";
    oss << "\"max\":" << max << ",";
    oss << "\"range\":" << range << ",";
    oss << "\"q1\":" << q1 << ",";
    oss << "\"q3\":" << q3 << ",";
    oss << "\"iqr\":" << iqr << ",";
    oss << "\"count\":" << count;
    oss << "}";
    return oss.str();
}

std::string MovingAverageResult::to_json() const {
    std::ostringstream oss;
    oss << std::fixed << std::setprecision(2);
    oss << "{";
    oss << "\"window_size\":" << window_size << ",";
    oss << "\"current_average\":" << current_average << ",";
    oss << "\"values\":[";
    for (size_t i = 0; i < values.size(); ++i) {
        if (i > 0) oss << ",";
        oss << values[i];
    }
    oss << "]}";
    return oss.str();
}

std::string CorrelationResult::to_json() const {
    std::ostringstream oss;
    oss << std::fixed << std::setprecision(4);
    oss << "{";
    oss << "\"pearson_coefficient\":" << pearson_coefficient << ",";
    oss << "\"r_squared\":" << r_squared << ",";
    oss << "\"strength\":\"" << strength << "\",";
    oss << "\"direction\":\"" << direction << "\"";
    oss << "}";
    return oss.str();
}

// ==================== Basic Statistics ====================

double StatisticsCalculator::sum(const std::vector<double>& data) {
    if (data.empty()) return 0.0;
    return std::accumulate(data.begin(), data.end(), 0.0);
}

double StatisticsCalculator::mean(const std::vector<double>& data) {
    if (data.empty()) return 0.0;
    return sum(data) / static_cast<double>(data.size());
}

double StatisticsCalculator::median(std::vector<double> data) {
    if (data.empty()) return 0.0;
    
    std::sort(data.begin(), data.end());
    size_t n = data.size();
    
    if (n % 2 == 0) {
        return (data[n/2 - 1] + data[n/2]) / 2.0;
    } else {
        return data[n/2];
    }
}

double StatisticsCalculator::mode(const std::vector<double>& data) {
    if (data.empty()) return 0.0;
    
    std::unordered_map<double, int> frequency;
    for (double val : data) {
        frequency[val]++;
    }
    
    double mode_val = data[0];
    int max_count = 0;
    
    for (const auto& pair : frequency) {
        if (pair.second > max_count) {
            max_count = pair.second;
            mode_val = pair.first;
        }
    }
    
    return mode_val;
}

double StatisticsCalculator::variance(const std::vector<double>& data) {
    if (data.size() < 2) return 0.0;
    
    double m = mean(data);
    double sum_sq = 0.0;
    
    for (double val : data) {
        double diff = val - m;
        sum_sq += diff * diff;
    }
    
    return sum_sq / static_cast<double>(data.size());
}

double StatisticsCalculator::sample_variance(const std::vector<double>& data) {
    if (data.size() < 2) return 0.0;
    
    double m = mean(data);
    double sum_sq = 0.0;
    
    for (double val : data) {
        double diff = val - m;
        sum_sq += diff * diff;
    }
    
    return sum_sq / static_cast<double>(data.size() - 1);
}

double StatisticsCalculator::stddev(const std::vector<double>& data) {
    return std::sqrt(variance(data));
}

double StatisticsCalculator::sample_stddev(const std::vector<double>& data) {
    return std::sqrt(sample_variance(data));
}

double StatisticsCalculator::percentile(std::vector<double> data, double p) {
    if (data.empty()) return 0.0;
    if (p < 0 || p > 100) {
        throw std::invalid_argument("Percentile must be between 0 and 100");
    }
    
    std::sort(data.begin(), data.end());
    
    if (p == 0) return data.front();
    if (p == 100) return data.back();
    
    double index = (p / 100.0) * (data.size() - 1);
    size_t lower = static_cast<size_t>(std::floor(index));
    size_t upper = static_cast<size_t>(std::ceil(index));
    
    if (lower == upper) return data[lower];
    
    double weight = index - lower;
    return data[lower] * (1 - weight) + data[upper] * weight;
}

// ==================== Comprehensive Statistics ====================

StatisticsResult StatisticsCalculator::calculate_all(const std::vector<double>& data) {
    StatisticsResult result;
    
    if (data.empty()) {
        return result;
    }
    
    result.count = data.size();
    result.sum = sum(data);
    result.mean = result.sum / static_cast<double>(result.count);
    result.median = median(data);
    result.mode = mode(data);
    result.variance = variance(data);
    result.stddev = std::sqrt(result.variance);
    
    auto minmax = std::minmax_element(data.begin(), data.end());
    result.min = *minmax.first;
    result.max = *minmax.second;
    result.range = result.max - result.min;
    
    result.q1 = percentile(data, 25);
    result.q3 = percentile(data, 75);
    result.iqr = result.q3 - result.q1;
    
    return result;
}

// ==================== Moving Averages ====================

MovingAverageResult StatisticsCalculator::moving_average(
    const std::vector<double>& data, int window) {
    
    MovingAverageResult result;
    result.window_size = window;
    
    if (data.empty() || window <= 0) {
        return result;
    }
    
    if (static_cast<size_t>(window) > data.size()) {
        window = static_cast<int>(data.size());
        result.window_size = window;
    }
    
    // Calculate initial window sum
    double window_sum = 0.0;
    for (int i = 0; i < window; ++i) {
        window_sum += data[i];
    }
    result.values.push_back(window_sum / window);
    
    // Sliding window - O(n) complexity
    for (size_t i = window; i < data.size(); ++i) {
        window_sum = window_sum - data[i - window] + data[i];
        result.values.push_back(window_sum / window);
    }
    
    result.current_average = result.values.empty() ? 0.0 : result.values.back();
    
    return result;
}

MovingAverageResult StatisticsCalculator::exponential_moving_average(
    const std::vector<double>& data, double alpha) {
    
    MovingAverageResult result;
    result.window_size = -1; // Indicates EMA
    
    if (data.empty() || alpha <= 0 || alpha > 1) {
        return result;
    }
    
    result.values.push_back(data[0]);
    
    for (size_t i = 1; i < data.size(); ++i) {
        double ema = alpha * data[i] + (1 - alpha) * result.values.back();
        result.values.push_back(ema);
    }
    
    result.current_average = result.values.back();
    
    return result;
}

// ==================== Correlation ====================

CorrelationResult StatisticsCalculator::correlation(
    const std::vector<double>& x, const std::vector<double>& y) {
    
    CorrelationResult result;
    
    if (x.size() != y.size() || x.size() < 2) {
        result.strength = "invalid";
        result.direction = "none";
        return result;
    }
    
    double mean_x = mean(x);
    double mean_y = mean(y);
    
    double numerator = 0.0;
    double sum_sq_x = 0.0;
    double sum_sq_y = 0.0;
    
    for (size_t i = 0; i < x.size(); ++i) {
        double dx = x[i] - mean_x;
        double dy = y[i] - mean_y;
        numerator += dx * dy;
        sum_sq_x += dx * dx;
        sum_sq_y += dy * dy;
    }
    
    double denominator = std::sqrt(sum_sq_x * sum_sq_y);
    
    if (denominator == 0) {
        result.pearson_coefficient = 0;
    } else {
        result.pearson_coefficient = numerator / denominator;
    }
    
    result.r_squared = result.pearson_coefficient * result.pearson_coefficient;
    
    // Classify correlation strength
    double abs_r = std::abs(result.pearson_coefficient);
    if (abs_r >= 0.8) {
        result.strength = "very_strong";
    } else if (abs_r >= 0.6) {
        result.strength = "strong";
    } else if (abs_r >= 0.4) {
        result.strength = "moderate";
    } else if (abs_r >= 0.2) {
        result.strength = "weak";
    } else {
        result.strength = "very_weak";
    }
    
    // Direction
    if (result.pearson_coefficient > 0.1) {
        result.direction = "positive";
    } else if (result.pearson_coefficient < -0.1) {
        result.direction = "negative";
    } else {
        result.direction = "none";
    }
    
    return result;
}

// ==================== Outlier Detection ====================

std::vector<size_t> StatisticsCalculator::detect_outliers(
    const std::vector<double>& data, double threshold) {
    
    std::vector<size_t> outliers;
    
    if (data.size() < 4) {
        return outliers;
    }
    
    double q1 = percentile(data, 25);
    double q3 = percentile(data, 75);
    double iqr = q3 - q1;
    
    double lower_bound = q1 - threshold * iqr;
    double upper_bound = q3 + threshold * iqr;
    
    for (size_t i = 0; i < data.size(); ++i) {
        if (data[i] < lower_bound || data[i] > upper_bound) {
            outliers.push_back(i);
        }
    }
    
    return outliers;
}

// ==================== Monthly Totals ====================

std::vector<double> StatisticsCalculator::monthly_totals(
    const std::vector<double>& amounts,
    const std::vector<int>& days_in_months) {
    
    std::vector<double> totals;
    
    if (amounts.empty() || days_in_months.empty()) {
        return totals;
    }
    
    size_t idx = 0;
    for (int days : days_in_months) {
        double month_total = 0.0;
        for (int d = 0; d < days && idx < amounts.size(); ++d, ++idx) {
            month_total += amounts[idx];
        }
        totals.push_back(month_total);
    }
    
    return totals;
}

} // namespace expense
