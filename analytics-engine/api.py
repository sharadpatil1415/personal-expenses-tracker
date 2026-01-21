"""
Flask API Server for Analytics Engine

This module exposes the analytics capabilities as REST endpoints
that can be called by the Java backend.

Interview Talking Points:
- RESTful API design with Flask
- JSON-based inter-service communication
- Error handling and input validation
- Command-line interface for direct invocation
"""

import os
import sys
import json
import argparse
from flask import Flask, request, jsonify
import pandas as pd

# Add analytics module to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from analytics.trends import analyze_expenses, load_expenses
from analytics.insights import generate_complete_insights
from analytics.forecast import forecast_expenses

app = Flask(__name__)


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'expense-analytics-engine',
        'version': '1.0.0'
    })


@app.route('/api/analyze', methods=['POST'])
def analyze():
    """
    Analyze expense data from CSV file.
    
    Request body:
    {
        "file_path": "/path/to/expenses.csv"
    }
    
    Returns complete analysis including trends, insights, and forecasts.
    """
    try:
        data = request.get_json()
        
        if not data or 'file_path' not in data:
            return jsonify({
                'success': False,
                'error': 'file_path is required'
            }), 400
        
        file_path = data['file_path']
        
        if not os.path.exists(file_path):
            return jsonify({
                'success': False,
                'error': f'File not found: {file_path}'
            }), 404
        
        # Run analysis
        analysis = analyze_expenses(file_path)
        
        if not analysis.get('success'):
            return jsonify(analysis), 400
        
        # Generate insights
        insights = generate_complete_insights(analysis)
        
        # Generate forecast
        df = load_expenses(file_path)
        forecast = forecast_expenses(df)
        
        return jsonify({
            'success': True,
            'analysis': analysis,
            'insights': insights,
            'forecast': forecast
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/trends', methods=['POST'])
def get_trends():
    """
    Get spending trends analysis.
    
    Request body:
    {
        "file_path": "/path/to/expenses.csv"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'file_path' not in data:
            return jsonify({
                'success': False,
                'error': 'file_path is required'
            }), 400
        
        file_path = data['file_path']
        analysis = analyze_expenses(file_path)
        
        return jsonify(analysis)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/insights', methods=['POST'])
def get_insights():
    """
    Get budget insights and recommendations.
    
    Request body:
    {
        "file_path": "/path/to/expenses.csv"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'file_path' not in data:
            return jsonify({
                'success': False,
                'error': 'file_path is required'
            }), 400
        
        file_path = data['file_path']
        analysis = analyze_expenses(file_path)
        insights = generate_complete_insights(analysis)
        
        return jsonify(insights)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/forecast', methods=['POST'])
def get_forecast():
    """
    Get expense forecast.
    
    Request body:
    {
        "file_path": "/path/to/expenses.csv",
        "forecast_days": 30  // optional, default 30
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'file_path' not in data:
            return jsonify({
                'success': False,
                'error': 'file_path is required'
            }), 400
        
        file_path = data['file_path']
        forecast_days = data.get('forecast_days', 30)
        
        df = load_expenses(file_path)
        forecast = forecast_expenses(df, forecast_days)
        
        return jsonify(forecast)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


def run_cli_analysis(file_path: str) -> dict:
    """
    Run analysis from command line.
    
    This is called when the Java backend invokes the script via ProcessBuilder.
    
    Args:
        file_path: Path to the CSV file
        
    Returns:
        Analysis results as dictionary
    """
    try:
        if not os.path.exists(file_path):
            return {
                'success': False,
                'error': f'File not found: {file_path}'
            }
        
        analysis = analyze_expenses(file_path)
        insights = generate_complete_insights(analysis)
        df = load_expenses(file_path)
        forecast = forecast_expenses(df)
        
        return {
            'success': True,
            'analysis': analysis,
            'insights': insights,
            'forecast': forecast
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def main():
    """Main entry point for CLI and server modes."""
    parser = argparse.ArgumentParser(description='Expense Analytics Engine')
    parser.add_argument('--analyze', type=str, help='Path to CSV file to analyze')
    parser.add_argument('--server', action='store_true', help='Run as Flask server')
    parser.add_argument('--port', type=int, default=5000, help='Server port')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    
    args = parser.parse_args()
    
    if args.analyze:
        # CLI mode - analyze file and print JSON
        result = run_cli_analysis(args.analyze)
        print(json.dumps(result))
    elif args.server:
        # Server mode - run Flask app
        print(f"Starting Analytics Engine on port {args.port}...")
        app.run(host='0.0.0.0', port=args.port, debug=args.debug)
    else:
        # Default: run server
        print("Starting Analytics Engine on port 5000...")
        print("Use --analyze <file.csv> for CLI mode")
        print("Use --server for explicit server mode")
        app.run(host='0.0.0.0', port=5000, debug=False)


if __name__ == '__main__':
    main()
