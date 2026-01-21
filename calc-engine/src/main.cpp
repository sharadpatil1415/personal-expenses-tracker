/**
 * Expense Calculator - Main Entry Point
 * 
 * Command-line interface for the statistics calculator.
 * Reads expense amounts from stdin and outputs JSON results.
 * 
 * Usage:
 *   calc_engine < input.txt
 *   echo "5\n10.5\n20.0\n15.0\n30.0\n25.0" | calc_engine
 * 
 * Input Format:
 *   First line: number of values
 *   Following lines: one value per line
 * 
 * Output Format:
 *   JSON object with statistical calculations
 * 
 * @author Personal Project
 * @version 1.0.0
 */

#include "statistics.hpp"
#include <iostream>
#include <vector>
#include <string>
#include <sstream>

using namespace expense;

void print_usage() {
    std::cerr << "Expense Calculator v1.0.0\n";
    std::cerr << "Usage: calc_engine [options]\n";
    std::cerr << "\nOptions:\n";
    std::cerr << "  --help        Show this help message\n";
    std::cerr << "  --version     Show version information\n";
    std::cerr << "\nInput Format:\n";
    std::cerr << "  First line: number of values (N)\n";
    std::cerr << "  Next N lines: expense amounts (one per line)\n";
    std::cerr << "\nOutput: JSON object with statistics\n";
}

void print_version() {
    std::cout << "{\"name\":\"ExpenseCalculator\",\"version\":\"1.0.0\"}\n";
}

std::string create_json_output(
    const StatisticsResult& stats,
    const MovingAverageResult& sma,
    const MovingAverageResult& ema,
    const std::vector<size_t>& outliers) {
    
    std::ostringstream oss;
    oss << std::fixed << std::setprecision(2);
    
    oss << "{\n";
    oss << "  \"success\": true,\n";
    oss << "  \"statistics\": " << stats.to_json() << ",\n";
    oss << "  \"simple_moving_average\": " << sma.to_json() << ",\n";
    oss << "  \"exponential_moving_average\": " << ema.to_json() << ",\n";
    oss << "  \"outliers\": [";
    for (size_t i = 0; i < outliers.size(); ++i) {
        if (i > 0) oss << ",";
        oss << outliers[i];
    }
    oss << "],\n";
    oss << "  \"outlier_count\": " << outliers.size() << "\n";
    oss << "}\n";
    
    return oss.str();
}

std::string create_error_json(const std::string& message) {
    std::ostringstream oss;
    oss << "{\"success\":false,\"error\":\"" << message << "\"}\n";
    return oss.str();
}

int main(int argc, char* argv[]) {
    // Check for command line arguments
    if (argc > 1) {
        std::string arg = argv[1];
        if (arg == "--help" || arg == "-h") {
            print_usage();
            return 0;
        }
        if (arg == "--version" || arg == "-v") {
            print_version();
            return 0;
        }
    }
    
    try {
        // Read number of values
        int n;
        if (!(std::cin >> n)) {
            std::cout << create_error_json("Failed to read number of values");
            return 1;
        }
        
        if (n <= 0) {
            std::cout << create_error_json("Number of values must be positive");
            return 1;
        }
        
        // Read values
        std::vector<double> amounts;
        amounts.reserve(n);
        
        for (int i = 0; i < n; ++i) {
            double value;
            if (!(std::cin >> value)) {
                std::cout << create_error_json("Failed to read value at index " + std::to_string(i));
                return 1;
            }
            amounts.push_back(value);
        }
        
        // Calculate statistics
        StatisticsResult stats = StatisticsCalculator::calculate_all(amounts);
        
        // Calculate moving averages (window size = min(7, n))
        int window = std::min(7, n);
        MovingAverageResult sma = StatisticsCalculator::moving_average(amounts, window);
        MovingAverageResult ema = StatisticsCalculator::exponential_moving_average(amounts, 0.3);
        
        // Detect outliers
        std::vector<size_t> outliers = StatisticsCalculator::detect_outliers(amounts);
        
        // Output JSON result
        std::cout << create_json_output(stats, sma, ema, outliers);
        
        return 0;
        
    } catch (const std::exception& e) {
        std::cout << create_error_json(e.what());
        return 1;
    }
}
