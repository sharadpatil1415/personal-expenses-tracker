"""
Analytics Engine Package

This package provides expense analytics capabilities including:
- Spending trend analysis
- Budget insights and recommendations
- Expense forecasting
"""

from .trends import (
    analyze_expenses,
    load_expenses,
    calculate_monthly_spending,
    calculate_category_breakdown,
    calculate_spending_trend,
    detect_spending_anomalies,
    get_spending_summary
)

from .insights import (
    generate_spending_insights,
    calculate_budget_recommendations,
    get_savings_opportunities,
    generate_complete_insights
)

from .forecast import (
    forecast_expenses,
    simple_moving_average_forecast,
    exponential_smoothing_forecast,
    weekly_pattern_forecast,
    category_forecast
)

__all__ = [
    # Trends
    'analyze_expenses',
    'load_expenses',
    'calculate_monthly_spending',
    'calculate_category_breakdown',
    'calculate_spending_trend',
    'detect_spending_anomalies',
    'get_spending_summary',
    # Insights
    'generate_spending_insights',
    'calculate_budget_recommendations',
    'get_savings_opportunities',
    'generate_complete_insights',
    # Forecast
    'forecast_expenses',
    'simple_moving_average_forecast',
    'exponential_smoothing_forecast',
    'weekly_pattern_forecast',
    'category_forecast'
]
