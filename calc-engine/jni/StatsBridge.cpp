/**
 * JNI Bridge for Java Integration
 * 
 * Provides Java Native Interface bindings for the statistics library.
 * This allows the Java backend to call C++ functions directly for
 * high-performance calculations.
 * 
 * Interview Talking Points:
 * - JNI for native code integration
 * - Memory management across language boundaries
 * - Performance optimization with native code
 */

#include <jni.h>
#include "statistics.hpp"
#include <string>

using namespace expense;

extern "C" {

/**
 * Calculate comprehensive statistics from a Java double array.
 * 
 * @param env JNI environment
 * @param obj Java object
 * @param amounts Java double array with expense amounts
 * @return JSON string with statistics
 */
JNIEXPORT jstring JNICALL Java_com_tracker_native_StatsBridge_calculateStats(
    JNIEnv *env, jobject obj, jdoubleArray amounts) {
    
    // Get array elements
    jsize len = env->GetArrayLength(amounts);
    jdouble* body = env->GetDoubleArrayElements(amounts, nullptr);
    
    if (body == nullptr) {
        return env->NewStringUTF("{\"success\":false,\"error\":\"Failed to get array elements\"}");
    }
    
    // Convert to vector
    std::vector<double> data(body, body + len);
    
    // Release array elements
    env->ReleaseDoubleArrayElements(amounts, body, 0);
    
    // Calculate statistics
    StatisticsResult stats = StatisticsCalculator::calculate_all(data);
    
    // Return JSON string
    return env->NewStringUTF(stats.to_json().c_str());
}

/**
 * Calculate moving average from a Java double array.
 */
JNIEXPORT jstring JNICALL Java_com_tracker_native_StatsBridge_calculateMovingAverage(
    JNIEnv *env, jobject obj, jdoubleArray amounts, jint window) {
    
    jsize len = env->GetArrayLength(amounts);
    jdouble* body = env->GetDoubleArrayElements(amounts, nullptr);
    
    if (body == nullptr) {
        return env->NewStringUTF("{\"success\":false,\"error\":\"Failed to get array elements\"}");
    }
    
    std::vector<double> data(body, body + len);
    env->ReleaseDoubleArrayElements(amounts, body, 0);
    
    MovingAverageResult result = StatisticsCalculator::moving_average(data, window);
    
    return env->NewStringUTF(result.to_json().c_str());
}

/**
 * Calculate exponential moving average.
 */
JNIEXPORT jstring JNICALL Java_com_tracker_native_StatsBridge_calculateEMA(
    JNIEnv *env, jobject obj, jdoubleArray amounts, jdouble alpha) {
    
    jsize len = env->GetArrayLength(amounts);
    jdouble* body = env->GetDoubleArrayElements(amounts, nullptr);
    
    if (body == nullptr) {
        return env->NewStringUTF("{\"success\":false,\"error\":\"Failed to get array elements\"}");
    }
    
    std::vector<double> data(body, body + len);
    env->ReleaseDoubleArrayElements(amounts, body, 0);
    
    MovingAverageResult result = StatisticsCalculator::exponential_moving_average(data, alpha);
    
    return env->NewStringUTF(result.to_json().c_str());
}

/**
 * Detect outliers in expense data.
 */
JNIEXPORT jintArray JNICALL Java_com_tracker_native_StatsBridge_detectOutliers(
    JNIEnv *env, jobject obj, jdoubleArray amounts, jdouble threshold) {
    
    jsize len = env->GetArrayLength(amounts);
    jdouble* body = env->GetDoubleArrayElements(amounts, nullptr);
    
    if (body == nullptr) {
        return env->NewIntArray(0);
    }
    
    std::vector<double> data(body, body + len);
    env->ReleaseDoubleArrayElements(amounts, body, 0);
    
    std::vector<size_t> outliers = StatisticsCalculator::detect_outliers(data, threshold);
    
    // Convert to jintArray
    jintArray result = env->NewIntArray(static_cast<jsize>(outliers.size()));
    if (result != nullptr && !outliers.empty()) {
        std::vector<jint> indices(outliers.begin(), outliers.end());
        env->SetIntArrayRegion(result, 0, static_cast<jsize>(indices.size()), indices.data());
    }
    
    return result;
}

/**
 * Calculate correlation between two datasets.
 */
JNIEXPORT jstring JNICALL Java_com_tracker_native_StatsBridge_calculateCorrelation(
    JNIEnv *env, jobject obj, jdoubleArray x_arr, jdoubleArray y_arr) {
    
    jsize len_x = env->GetArrayLength(x_arr);
    jsize len_y = env->GetArrayLength(y_arr);
    
    if (len_x != len_y) {
        return env->NewStringUTF("{\"success\":false,\"error\":\"Arrays must have same length\"}");
    }
    
    jdouble* x_body = env->GetDoubleArrayElements(x_arr, nullptr);
    jdouble* y_body = env->GetDoubleArrayElements(y_arr, nullptr);
    
    if (x_body == nullptr || y_body == nullptr) {
        if (x_body) env->ReleaseDoubleArrayElements(x_arr, x_body, 0);
        if (y_body) env->ReleaseDoubleArrayElements(y_arr, y_body, 0);
        return env->NewStringUTF("{\"success\":false,\"error\":\"Failed to get array elements\"}");
    }
    
    std::vector<double> x(x_body, x_body + len_x);
    std::vector<double> y(y_body, y_body + len_y);
    
    env->ReleaseDoubleArrayElements(x_arr, x_body, 0);
    env->ReleaseDoubleArrayElements(y_arr, y_body, 0);
    
    CorrelationResult result = StatisticsCalculator::correlation(x, y);
    
    return env->NewStringUTF(result.to_json().c_str());
}

} // extern "C"
