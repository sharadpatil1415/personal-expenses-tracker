package com.tracker.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Integration Service - Handles inter-process communication with Python and
 * C++.
 * 
 * Interview Talking Points:
 * - Demonstrates polyglot architecture
 * - ProcessBuilder for subprocess management
 * - Error handling and timeout management
 * - JSON-based inter-process communication
 */
@Service
public class IntegrationService {

    private static final Logger logger = LoggerFactory.getLogger(IntegrationService.class);

    @Value("${analytics.python.executable:python}")
    private String pythonExecutable;

    @Value("${analytics.python.script:../analytics-engine/api.py}")
    private String pythonScript;

    @Value("${calculation.cpp.executable:../calc-engine/build/calc_engine.exe}")
    private String cppExecutable;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Calls Python analytics script with expense data.
     * 
     * @param csvFilePath Path to the CSV file with expense data
     * @return Map containing analytics results
     */
    public Map<String, Object> callPythonAnalytics(String csvFilePath) {
        Map<String, Object> result = new HashMap<>();

        try {
            ProcessBuilder processBuilder = new ProcessBuilder(
                    pythonExecutable,
                    pythonScript,
                    "--analyze",
                    csvFilePath);

            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();

            // Read output
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line);
                }
            }

            // Wait for process with timeout
            boolean completed = process.waitFor(30, TimeUnit.SECONDS);
            if (!completed) {
                process.destroyForcibly();
                throw new RuntimeException("Python analytics timeout");
            }

            int exitCode = process.exitValue();
            if (exitCode != 0) {
                logger.error("Python analytics failed with exit code: {}", exitCode);
                result.put("error", "Analytics processing failed");
                return result;
            }

            // Parse JSON output
            JsonNode jsonResult = objectMapper.readTree(output.toString());
            result.put("insights", jsonResult);
            result.put("success", true);

        } catch (Exception e) {
            logger.error("Error calling Python analytics: {}", e.getMessage());
            result.put("error", e.getMessage());
            result.put("success", false);
        }

        return result;
    }

    /**
     * Calls C++ calculation engine for high-performance statistics.
     * 
     * @param amounts Array of expense amounts
     * @return Map containing calculation results
     */
    public Map<String, Object> callCppCalculator(double[] amounts) {
        Map<String, Object> result = new HashMap<>();

        try {
            ProcessBuilder processBuilder = new ProcessBuilder(cppExecutable);
            processBuilder.redirectErrorStream(true);

            Process process = processBuilder.start();

            // Write input data
            try (BufferedWriter writer = new BufferedWriter(
                    new OutputStreamWriter(process.getOutputStream(), StandardCharsets.UTF_8))) {
                writer.write(String.valueOf(amounts.length));
                writer.newLine();
                for (double amount : amounts) {
                    writer.write(String.valueOf(amount));
                    writer.newLine();
                }
                writer.flush();
            }

            // Read output
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line);
                }
            }

            // Wait for process with timeout
            boolean completed = process.waitFor(10, TimeUnit.SECONDS);
            if (!completed) {
                process.destroyForcibly();
                throw new RuntimeException("C++ calculator timeout");
            }

            int exitCode = process.exitValue();
            if (exitCode != 0) {
                logger.error("C++ calculator failed with exit code: {}", exitCode);
                result.put("error", "Calculation failed");
                return result;
            }

            // Parse JSON output
            JsonNode jsonResult = objectMapper.readTree(output.toString());
            result.put("calculations", jsonResult);
            result.put("success", true);

        } catch (Exception e) {
            logger.error("Error calling C++ calculator: {}", e.getMessage());
            result.put("error", e.getMessage());
            result.put("success", false);
        }

        return result;
    }

    /**
     * Gets advanced analytics by combining Python insights with C++ calculations.
     */
    public Map<String, Object> getAdvancedAnalytics(String csvFilePath, double[] amounts) {
        Map<String, Object> result = new HashMap<>();

        // Call Python for insights
        Map<String, Object> pythonResult = callPythonAnalytics(csvFilePath);
        result.put("pythonAnalytics", pythonResult);

        // Call C++ for high-performance calculations
        Map<String, Object> cppResult = callCppCalculator(amounts);
        result.put("cppCalculations", cppResult);

        result.put("success",
                Boolean.TRUE.equals(pythonResult.get("success")) &&
                        Boolean.TRUE.equals(cppResult.get("success")));

        return result;
    }
}
