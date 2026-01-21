"""
Budget Insights and Recommendations Module

This module generates actionable insights and budget recommendations
based on spending patterns and historical data.

Interview Talking Points:
- Rule-based recommendation engine
- Statistical analysis for budget optimization
- Natural language insight generation
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta


def generate_spending_insights(
    category_breakdown: Dict[str, Any],
    monthly_spending: Dict[str, float],
    total_spending: float
) -> List[Dict[str, Any]]:
    """
    Generate natural language insights about spending patterns.
    
    Args:
        category_breakdown: Spending by category
        monthly_spending: Spending by month
        total_spending: Total spending amount
        
    Returns:
        List of insight objects with message and type
    """
    insights = []
    
    # Top category insight
    if category_breakdown:
        sorted_categories = sorted(
            category_breakdown.items(),
            key=lambda x: x[1]['total'],
            reverse=True
        )
        
        if sorted_categories:
            top_category, top_stats = sorted_categories[0]
            insights.append({
                'type': 'top_spending',
                'severity': 'info',
                'message': f"You spent {top_stats['percentage']:.1f}% of your budget on {top_category}",
                'category': top_category,
                'amount': top_stats['total'],
                'percentage': top_stats['percentage']
            })
            
            # High spending warning
            if top_stats['percentage'] > 40:
                insights.append({
                    'type': 'high_category_spending',
                    'severity': 'warning',
                    'message': f"Consider reducing {top_category} spending - it's consuming over 40% of your budget",
                    'category': top_category,
                    'recommendation': f"Try to reduce {top_category} spending by 10-15%"
                })
    
    # Monthly trend insight
    if len(monthly_spending) >= 2:
        months = sorted(monthly_spending.keys())
        current_month = monthly_spending[months[-1]]
        previous_month = monthly_spending[months[-2]]
        
        if previous_month > 0:
            change = ((current_month - previous_month) / previous_month) * 100
            
            if change > 10:
                insights.append({
                    'type': 'spending_increase',
                    'severity': 'warning',
                    'message': f"Your spending increased by {change:.1f}% compared to last month",
                    'current_month': current_month,
                    'previous_month': previous_month,
                    'change_percentage': change
                })
            elif change < -10:
                insights.append({
                    'type': 'spending_decrease',
                    'severity': 'positive',
                    'message': f"Great job! Your spending decreased by {abs(change):.1f}% compared to last month",
                    'current_month': current_month,
                    'previous_month': previous_month,
                    'change_percentage': change
                })
    
    # Average transaction insight
    if total_spending > 0 and category_breakdown:
        total_transactions = sum(cat['count'] for cat in category_breakdown.values())
        if total_transactions > 0:
            avg_transaction = total_spending / total_transactions
            insights.append({
                'type': 'average_spending',
                'severity': 'info',
                'message': f"Your average transaction is ${avg_transaction:.2f}",
                'average_amount': avg_transaction,
                'total_transactions': total_transactions
            })
    
    return insights


def calculate_budget_recommendations(
    category_breakdown: Dict[str, Any],
    monthly_spending: Dict[str, float],
    income: Optional[float] = None
) -> Dict[str, Any]:
    """
    Generate budget recommendations based on spending patterns.
    
    Uses the 50/30/20 rule as a baseline:
    - 50% for needs (rent, utilities, groceries)
    - 30% for wants (entertainment, shopping, dining)
    - 20% for savings
    
    Args:
        category_breakdown: Spending by category
        monthly_spending: Spending by month
        income: Optional monthly income for personalized recommendations
        
    Returns:
        Budget recommendations
    """
    # Define category types
    needs_categories = ['RENT', 'UTILITIES', 'GROCERIES', 'HEALTHCARE', 'INSURANCE', 'TRANSPORT']
    wants_categories = ['ENTERTAINMENT', 'SHOPPING', 'FOOD', 'SUBSCRIPTIONS', 'TRAVEL']
    savings_categories = ['SAVINGS']
    
    # Calculate current allocation
    needs_total = sum(
        cat_data['total'] 
        for cat, cat_data in category_breakdown.items() 
        if cat.upper() in needs_categories
    )
    
    wants_total = sum(
        cat_data['total']
        for cat, cat_data in category_breakdown.items()
        if cat.upper() in wants_categories
    )
    
    savings_total = sum(
        cat_data['total']
        for cat, cat_data in category_breakdown.items()
        if cat.upper() in savings_categories
    )
    
    total = needs_total + wants_total + savings_total
    if total == 0:
        total = 1  # Avoid division by zero
    
    current_allocation = {
        'needs': round((needs_total / total) * 100, 1),
        'wants': round((wants_total / total) * 100, 1),
        'savings': round((savings_total / total) * 100, 1)
    }
    
    # Generate recommendations
    recommendations = []
    
    if current_allocation['needs'] > 55:
        recommendations.append({
            'type': 'reduce_needs',
            'message': "Your essential spending is above 50%. Consider ways to reduce fixed costs.",
            'current': current_allocation['needs'],
            'target': 50
        })
    
    if current_allocation['wants'] > 35:
        recommendations.append({
            'type': 'reduce_wants',
            'message': "Your discretionary spending is above 30%. Try cutting back on non-essentials.",
            'current': current_allocation['wants'],
            'target': 30
        })
    
    if current_allocation['savings'] < 15:
        recommendations.append({
            'type': 'increase_savings',
            'message': "Your savings rate is below 20%. Consider automating savings deposits.",
            'current': current_allocation['savings'],
            'target': 20
        })
    
    # Category-specific recommendations
    if category_breakdown:
        for category, data in category_breakdown.items():
            if data['percentage'] > 30:
                recommendations.append({
                    'type': 'category_warning',
                    'category': category,
                    'message': f"{category} is taking over 30% of your budget. Set a spending limit.",
                    'current_percentage': data['percentage'],
                    'suggested_limit': round(data['total'] * 0.8, 2)
                })
    
    return {
        'current_allocation': current_allocation,
        'ideal_allocation': {
            'needs': 50,
            'wants': 30,
            'savings': 20
        },
        'recommendations': recommendations,
        'category_totals': {
            'needs': round(needs_total, 2),
            'wants': round(wants_total, 2),
            'savings': round(savings_total, 2)
        }
    }


def get_savings_opportunities(category_breakdown: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Identify potential areas for saving money.
    
    Args:
        category_breakdown: Spending by category
        
    Returns:
        List of savings opportunities
    """
    opportunities = []
    
    # Check for subscription bloat
    if 'SUBSCRIPTIONS' in category_breakdown:
        sub_data = category_breakdown['SUBSCRIPTIONS']
        if sub_data['count'] > 3:
            opportunities.append({
                'type': 'subscription_audit',
                'message': f"You have {sub_data['count']} subscription charges. Review if you're using all of them.",
                'potential_savings': round(sub_data['total'] * 0.3, 2)
            })
    
    # Check for frequent small purchases
    for category, data in category_breakdown.items():
        if data['count'] > 10 and data['average'] < 20:
            opportunities.append({
                'type': 'small_purchases',
                'category': category,
                'message': f"You made {data['count']} small purchases in {category}. These add up to ${data['total']:.2f}.",
                'potential_savings': round(data['total'] * 0.2, 2)
            })
    
    # Check dining out vs groceries
    food_spend = category_breakdown.get('FOOD', {}).get('total', 0)
    grocery_spend = category_breakdown.get('GROCERIES', {}).get('total', 0)
    
    if food_spend > grocery_spend * 1.5:
        opportunities.append({
            'type': 'dining_vs_cooking',
            'message': "You're spending significantly more on dining out than groceries. Cooking more could save money.",
            'food_spending': food_spend,
            'grocery_spending': grocery_spend,
            'potential_savings': round((food_spend - grocery_spend) * 0.4, 2)
        })
    
    return opportunities


def generate_complete_insights(analysis_results: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate complete insights from analysis results.
    
    Args:
        analysis_results: Results from trends.analyze_expenses()
        
    Returns:
        Complete insights package
    """
    if not analysis_results.get('success'):
        return {'success': False, 'error': analysis_results.get('error', 'Unknown error')}
    
    summary = analysis_results.get('summary', {})
    category_breakdown = analysis_results.get('category_breakdown', {})
    monthly_spending = analysis_results.get('monthly_spending', {})
    
    return {
        'success': True,
        'insights': generate_spending_insights(
            category_breakdown,
            monthly_spending,
            summary.get('total_spending', 0)
        ),
        'budget_analysis': calculate_budget_recommendations(
            category_breakdown,
            monthly_spending
        ),
        'savings_opportunities': get_savings_opportunities(category_breakdown)
    }


if __name__ == '__main__':
    # Example usage
    sample_breakdown = {
        'FOOD': {'total': 450, 'count': 15, 'average': 30, 'percentage': 25},
        'RENT': {'total': 1200, 'count': 1, 'average': 1200, 'percentage': 40},
        'ENTERTAINMENT': {'total': 200, 'count': 8, 'average': 25, 'percentage': 10}
    }
    
    insights = generate_spending_insights(sample_breakdown, {}, 1850)
    print("Insights:", insights)
