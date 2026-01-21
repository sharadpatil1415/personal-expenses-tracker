cmake_minimum_required(VERSION 3.16)
project(ExpenseCalculator VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find JNI for Java integration (optional)
find_package(JNI QUIET)

# Main statistics library
add_library(expense_stats STATIC
    src/statistics.cpp
)

target_include_directories(expense_stats PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

# Main executable for CLI usage
add_executable(calc_engine
    src/main.cpp
)

target_link_libraries(calc_engine PRIVATE expense_stats)

# JNI bridge library (only if JNI is found)
if(JNI_FOUND)
    message(STATUS "JNI found - building Java bridge")
    add_library(expense_stats_jni SHARED
        jni/StatsBridge.cpp
    )
    target_include_directories(expense_stats_jni PRIVATE
        ${JNI_INCLUDE_DIRS}
        ${CMAKE_CURRENT_SOURCE_DIR}/include
    )
    target_link_libraries(expense_stats_jni PRIVATE expense_stats)
else()
    message(STATUS "JNI not found - skipping Java bridge")
endif()

# Enable testing
enable_testing()
add_executable(test_stats tests/test_statistics.cpp)
target_link_libraries(test_stats PRIVATE expense_stats)
add_test(NAME StatisticsTests COMMAND test_stats)

# Installation
install(TARGETS calc_engine RUNTIME DESTINATION bin)
install(TARGETS expense_stats ARCHIVE DESTINATION lib)
install(DIRECTORY include/ DESTINATION include)
