"""
Expense Forecasting Module

This module uses time series analysis and machine learning to
predict future expenses based on historical spending patterns.

Interview Talking Points:
- Time series forecasting with exponential smoothing
- Trend decomposition
- Confidence intervals for predictions
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')


def prepare_time_series(df: pd.DataFrame) -> pd.Series:
    """
    Prepare expense data as a time series for forecasting.
    
    Args:
        df: DataFrame with expense data
        
    Returns:
        Daily expense series
    """
    # Aggregate daily spending
    daily = df.groupby(df['Date'].dt.date)['Amount'].sum()
    daily.index = pd.to_datetime(daily.index)
    
    # Fill missing dates with 0
    date_range = pd.date_range(start=daily.index.min(), end=daily.index.max(), freq='D')
    daily = daily.reindex(date_range, fill_value=0)
    
    return daily


def simple_moving_average_forecast(
    series: pd.Series,
    forecast_days: int = 30,
    window: int = 7
) -> Dict[str, Any]:
    """
    Forecast using simple moving average.
    
    Args:
        series: Time series data
        forecast_days: Number of days to forecast
        window: Moving average window
        
    Returns:
        Forecast results
    """
    if len(series) < window:
        return {
            'success': False,
            'error': f'Insufficient data. Need at least {window} days.'
        }
    
    # Calculate moving average
    ma = series.rolling(window=window).mean()
    last_ma = ma.iloc[-1]
    
    # Generate forecast dates
    last_date = series.index[-1]
    forecast_dates = pd.date_range(
        start=last_date + timedelta(days=1),
        periods=forecast_days,
        freq='D'
    )
    
    # Simple forecast: project the last moving average
    forecast_values = [last_ma] * forecast_days
    
    # Calculate confidence interval (simple approach using std)
    std = series.tail(window * 2).std()
    lower_bound = [last_ma - 1.96 * std] * forecast_days
    upper_bound = [last_ma + 1.96 * std] * forecast_days
    
    return {
        'success': True,
        'method': 'simple_moving_average',
        'forecast': {
            str(date.date()): {
                'predicted': round(float(val), 2),
                'lower_bound': max(0, round(float(lb), 2)),
                'upper_bound': round(float(ub), 2)
            }
            for date, val, lb, ub in zip(forecast_dates, forecast_values, lower_bound, upper_bound)
        },
        'total_predicted': round(sum(forecast_values), 2)
    }


def exponential_smoothing_forecast(
    series: pd.Series,
    forecast_days: int = 30,
    alpha: float = 0.3
) -> Dict[str, Any]:
    """
    Forecast using exponential smoothing.
    
    Args:
        series: Time series data
        forecast_days: Number of days to forecast
        alpha: Smoothing parameter (0-1)
        
    Returns:
        Forecast results
    """
    if len(series) < 7:
        return {
            'success': False,
            'error': 'Insufficient data for exponential smoothing.'
        }
    
    # Calculate exponential smoothing
    smoothed = [series.iloc[0]]
    for i in range(1, len(series)):
        smoothed.append(alpha * series.iloc[i] + (1 - alpha) * smoothed[-1])
    
    last_smoothed = smoothed[-1]
    
    # Generate forecast dates
    last_date = series.index[-1]
    forecast_dates = pd.date_range(
        start=last_date + timedelta(days=1),
        periods=forecast_days,
        freq='D'
    )
    
    # Forecast values
    forecast_values = [last_smoothed] * forecast_days
    
    # Calculate prediction intervals
    residuals = series.values - np.array(smoothed)
    rmse = np.sqrt(np.mean(residuals**2))
    
    lower_bound = [last_smoothed - 1.96 * rmse] * forecast_days
    upper_bound = [last_smoothed + 1.96 * rmse] * forecast_days
    
    return {
        'success': True,
        'method': 'exponential_smoothing',
        'alpha': alpha,
        'forecast': {
            str(date.date()): {
                'predicted': round(float(val), 2),
                'lower_bound': max(0, round(float(lb), 2)),
                'upper_bound': round(float(ub), 2)
            }
            for date, val, lb, ub in zip(forecast_dates, forecast_values, lower_bound, upper_bound)
        },
        'total_predicted': round(sum(forecast_values), 2)
    }


def weekly_pattern_forecast(
    series: pd.Series,
    forecast_days: int = 30
) -> Dict[str, Any]:
    """
    Forecast using weekly spending patterns.
    
    Args:
        series: Time series data
        forecast_days: Number of days to forecast
        
    Returns:
        Forecast results with weekly patterns
    """
    if len(series) < 14:
        return {
            'success': False,
            'error': 'Need at least 2 weeks of data for pattern analysis.'
        }
    
    # Calculate average spending by day of week
    series_with_dow = pd.DataFrame({'amount': series})
    series_with_dow['day_of_week'] = series.index.dayofweek
    
    weekly_pattern = series_with_dow.groupby('day_of_week')['amount'].agg(['mean', 'std'])
    
    # Generate forecast
    last_date = series.index[-1]
    forecast_dates = pd.date_range(
        start=last_date + timedelta(days=1),
        periods=forecast_days,
        freq='D'
    )
    
    forecast_data = {}
    for date in forecast_dates:
        dow = date.dayofweek
        mean_val = weekly_pattern.loc[dow, 'mean']
        std_val = weekly_pattern.loc[dow, 'std']
        
        forecast_data[str(date.date())] = {
            'predicted': round(float(mean_val), 2),
            'lower_bound': max(0, round(float(mean_val - 1.96 * std_val), 2)),
            'upper_bound': round(float(mean_val + 1.96 * std_val), 2),
            'day_of_week': date.strftime('%A')
        }
    
    total_predicted = sum(d['predicted'] for d in forecast_data.values())
    
    # Day of week patterns
    dow_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    patterns = {
        dow_names[i]: round(float(weekly_pattern.loc[i, 'mean']), 2)
        for i in range(7)
    }
    
    return {
        'success': True,
        'method': 'weekly_pattern',
        'forecast': forecast_data,
        'total_predicted': round(total_predicted, 2),
        'weekly_patterns': patterns,
        'highest_spending_day': max(patterns, key=patterns.get),
        'lowest_spending_day': min(patterns, key=patterns.get)
    }


def category_forecast(df: pd.DataFrame, forecast_days: int = 30) -> Dict[str, Any]:
    """
    Forecast spending by category.
    
    Args:
        df: DataFrame with expense data
        forecast_days: Number of days to forecast
        
    Returns:
        Category-wise forecasts
    """
    if len(df) < 7:
        return {
            'success': False,
            'error': 'Insufficient data for category forecast.'
        }
    
    # Calculate date range
    date_diff = (df['Date'].max() - df['Date'].min()).days
    if date_diff == 0:
        date_diff = 1
    
    # Calculate daily average by category
    category_daily = df.groupby('Category')['Amount'].sum() / date_diff
    
    forecasts = {}
    for category, daily_avg in category_daily.items():
        monthly_forecast = daily_avg * forecast_days
        forecasts[category] = {
            'daily_average': round(float(daily_avg), 2),
            'monthly_forecast': round(float(monthly_forecast), 2)
        }
    
    total_forecast = sum(f['monthly_forecast'] for f in forecasts.values())
    
    return {
        'success': True,
        'method': 'category_average',
        'forecast_days': forecast_days,
        'category_forecasts': forecasts,
        'total_forecast': round(total_forecast, 2)
    }


def forecast_expenses(df: pd.DataFrame, forecast_days: int = 30) -> Dict[str, Any]:
    """
    Generate comprehensive expense forecasts.
    
    This is the main entry point for forecasting.
    
    Args:
        df: DataFrame with expense data
        forecast_days: Number of days to forecast
        
    Returns:
        Complete forecast results
    """
    try:
        series = prepare_time_series(df)
        
        return {
            'success': True,
            'data_points': len(series),
            'date_range': {
                'start': str(series.index[0].date()),
                'end': str(series.index[-1].date())
            },
            'simple_moving_average': simple_moving_average_forecast(series, forecast_days),
            'exponential_smoothing': exponential_smoothing_forecast(series, forecast_days),
            'weekly_pattern': weekly_pattern_forecast(series, forecast_days),
            'category_forecast': category_forecast(df, forecast_days)
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


if __name__ == '__main__':
    # Example with sample data
    dates = pd.date_range(start='2024-01-01', periods=60, freq='D')
    amounts = np.random.uniform(10, 100, 60)
    
    sample_df = pd.DataFrame({
        'Date': dates,
        'Amount': amounts,
        'Category': np.random.choice(['FOOD', 'TRANSPORT', 'ENTERTAINMENT'], 60)
    })
    
    result = forecast_expenses(sample_df)
    print("Forecast result:", result)
