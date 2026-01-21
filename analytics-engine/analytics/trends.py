"""
Spending Trends Analysis Module

This module analyzes expense data to identify spending patterns,
trends, and anomalies over time.

Interview Talking Points:
- Pandas for efficient data manipulation
- Time series analysis with rolling windows
- Statistical methods for trend detection
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional


def load_expenses(file_path: str) -> pd.DataFrame:
    """
    Load expense data from CSV file.
    
    Args:
        file_path: Path to the CSV file
        
    Returns:
        DataFrame with expense data
    """
    df = pd.read_csv(file_path)
    df['Date'] = pd.to_datetime(df['Date'])
    df['Amount'] = pd.to_numeric(df['Amount'], errors='coerce')
    return df


def calculate_monthly_spending(df: pd.DataFrame) -> Dict[str, float]:
    """
    Calculate total spending for each month.
    
    Args:
        df: DataFrame with expense data
        
    Returns:
        Dictionary with month as key and total spending as value
    """
    df['YearMonth'] = df['Date'].dt.to_period('M')
    monthly = df.groupby('YearMonth')['Amount'].sum()
    
    return {str(period): float(amount) for period, amount in monthly.items()}


def calculate_category_breakdown(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Calculate spending breakdown by category.
    
    Args:
        df: DataFrame with expense data
        
    Returns:
        Dictionary with category statistics
    """
    category_spending = df.groupby('Category')['Amount'].agg(['sum', 'count', 'mean'])
    total_spending = df['Amount'].sum()
    
    breakdown = {}
    for category, stats in category_spending.iterrows():
        breakdown[category] = {
            'total': float(stats['sum']),
            'count': int(stats['count']),
            'average': float(stats['mean']),
            'percentage': float((stats['sum'] / total_spending) * 100) if total_spending > 0 else 0
        }
    
    return breakdown


def calculate_spending_trend(df: pd.DataFrame, window: int = 7) -> Dict[str, Any]:
    """
    Calculate spending trends using moving averages.
    
    Args:
        df: DataFrame with expense data
        window: Rolling window size in days
        
    Returns:
        Dictionary with trend analysis
    """
    # Daily spending
    daily = df.groupby(df['Date'].dt.date)['Amount'].sum()
    daily = daily.sort_index()
    
    if len(daily) < window:
        return {
            'trend': 'insufficient_data',
            'message': f'Need at least {window} days of data for trend analysis'
        }
    
    # Calculate moving average
    moving_avg = daily.rolling(window=window).mean()
    
    # Calculate trend direction
    recent_avg = moving_avg.iloc[-1] if not pd.isna(moving_avg.iloc[-1]) else 0
    older_avg = moving_avg.iloc[-window] if len(moving_avg) > window and not pd.isna(moving_avg.iloc[-window]) else recent_avg
    
    if older_avg > 0:
        trend_change = ((recent_avg - older_avg) / older_avg) * 100
    else:
        trend_change = 0
    
    trend_direction = 'increasing' if trend_change > 5 else 'decreasing' if trend_change < -5 else 'stable'
    
    return {
        'trend': trend_direction,
        'change_percentage': round(trend_change, 2),
        'current_daily_average': round(recent_avg, 2),
        'previous_daily_average': round(older_avg, 2),
        'daily_spending': {str(date): float(amount) for date, amount in daily.tail(30).items()}
    }


def detect_spending_anomalies(df: pd.DataFrame, threshold: float = 2.0) -> List[Dict[str, Any]]:
    """
    Detect unusual spending patterns using statistical methods.
    
    Args:
        df: DataFrame with expense data
        threshold: Number of standard deviations for anomaly detection
        
    Returns:
        List of anomalous transactions
    """
    if len(df) < 10:
        return []
    
    # Calculate statistics
    mean_amount = df['Amount'].mean()
    std_amount = df['Amount'].std()
    
    if std_amount == 0:
        return []
    
    # Find anomalies
    df['z_score'] = (df['Amount'] - mean_amount) / std_amount
    anomalies = df[abs(df['z_score']) > threshold]
    
    result = []
    for _, row in anomalies.iterrows():
        result.append({
            'id': int(row['ID']) if 'ID' in row else None,
            'amount': float(row['Amount']),
            'category': row['Category'],
            'date': str(row['Date'].date()) if pd.notna(row['Date']) else None,
            'description': row.get('Description', ''),
            'z_score': round(float(row['z_score']), 2),
            'anomaly_type': 'high' if row['z_score'] > 0 else 'low'
        })
    
    return result


def get_spending_summary(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Get comprehensive spending summary.
    
    Args:
        df: DataFrame with expense data
        
    Returns:
        Complete spending summary
    """
    total = float(df['Amount'].sum())
    count = int(len(df))
    
    return {
        'total_spending': round(total, 2),
        'total_transactions': count,
        'average_transaction': round(total / count, 2) if count > 0 else 0,
        'max_transaction': float(df['Amount'].max()) if count > 0 else 0,
        'min_transaction': float(df['Amount'].min()) if count > 0 else 0,
        'date_range': {
            'start': str(df['Date'].min().date()) if count > 0 else None,
            'end': str(df['Date'].max().date()) if count > 0 else None
        }
    }


def analyze_expenses(file_path: str) -> Dict[str, Any]:
    """
    Perform complete expense analysis.
    
    This is the main entry point for expense analysis.
    
    Args:
        file_path: Path to the CSV file
        
    Returns:
        Complete analysis results
    """
    try:
        df = load_expenses(file_path)
        
        return {
            'success': True,
            'summary': get_spending_summary(df),
            'monthly_spending': calculate_monthly_spending(df),
            'category_breakdown': calculate_category_breakdown(df),
            'spending_trend': calculate_spending_trend(df),
            'anomalies': detect_spending_anomalies(df)
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


if __name__ == '__main__':
    import sys
    import json
    
    if len(sys.argv) > 1:
        result = analyze_expenses(sys.argv[1])
        print(json.dumps(result, indent=2))
