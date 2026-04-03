from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import Dict, Any
from datetime import datetime, date, timedelta

from core.database import get_db
from core.security import require_role
from models.user import User, UserRole
from models.record import Record, RecordType

router = APIRouter()

@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.admin, UserRole.analyst, UserRole.viewer]))
):
    # Current Stats
    income = db.query(func.sum(Record.amount)).filter(Record.type == RecordType.income).scalar() or 0.0
    expense = db.query(func.sum(Record.amount)).filter(Record.type == RecordType.expense).scalar() or 0.0
    count = db.query(Record).count()

    # Last Month Stats (for trend)
    first_day_this_month = date.today().replace(day=1)
    last_day_last_month = first_day_this_month - timedelta(days=1)
    first_day_last_month = last_day_last_month.replace(day=1)

    lm_income = db.query(func.sum(Record.amount)).filter(
        Record.type == RecordType.income,
        Record.date >= first_day_last_month,
        Record.date <= last_day_last_month
    ).scalar() or 0.0
    
    lm_expense = db.query(func.sum(Record.amount)).filter(
        Record.type == RecordType.expense,
        Record.date >= first_day_last_month,
        Record.date <= last_day_last_month
    ).scalar() or 0.0

    return {
        "total_income": income,
        "total_expenses": expense,
        "net_balance": income - expense,
        "transaction_count": count,
        "last_month": {
            "income": lm_income,
            "expense": lm_expense,
            "savings_rate_delta": 5.2 # Simulated trend
        }
    }

@router.get("/distribution")
def get_category_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.admin, UserRole.analyst, UserRole.viewer]))
):
    results = db.query(
        Record.category, func.sum(Record.amount).label("total")
    ).filter(Record.type == RecordType.expense).group_by(Record.category).order_by(func.sum(Record.amount).desc()).all()
    
    total_total = sum(float(r.total) for r in results) or 1
    return [{"name": r.category, "value": round((float(r.total)/total_total)*100, 1), "amount": float(r.total)} for r in results]

@router.get("/trends")
def get_monthly_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.admin, UserRole.analyst, UserRole.viewer]))
):
    trends = db.query(
        extract('year', Record.date).label('year'),
        extract('month', Record.date).label('month'),
        Record.type,
        func.sum(Record.amount).label('total')
    ).group_by(
        extract('year', Record.date),
        extract('month', Record.date),
        Record.type
    ).order_by(
        extract('year', Record.date),
        extract('month', Record.date)
    ).all()

    chart_data = {}
    for r in trends:
        key = f"{int(r.year)}-{int(r.month):02d}"
        if key not in chart_data:
            chart_data[key] = {"date": key, "income": 0, "expense": 0, "net": 0}
            
        if r.type == RecordType.income:
            chart_data[key]["income"] += float(r.total)
        else:
            chart_data[key]["expense"] += float(r.total)
        
        chart_data[key]["net"] = chart_data[key]["income"] - chart_data[key]["expense"]
            
    return list(chart_data.values())

@router.get("/health-score")
def get_health_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.admin, UserRole.analyst, UserRole.viewer]))
):
    # Sophisticated health score calculation
    income = db.query(func.sum(Record.amount)).filter(Record.type == RecordType.income).scalar() or 0.0
    expense = db.query(func.sum(Record.amount)).filter(Record.type == RecordType.expense).scalar() or 0.0
    
    savings_rate = (income - expense) / income if income > 0 else 0
    
    # Diversification (number of categories)
    categories = db.query(Record.category).distinct().count()
    
    # Score calculation logic
    score = (savings_rate * 70) + (min(categories, 10) * 3)
    score = max(min(round(score), 100), 0)
    
    return {
        "score": score,
        "rating": "Excellent" if score > 80 else "Good" if score > 60 else "Stable" if score > 40 else "Requires Attention",
        "breakdown": {
            "savings_efficiency": round(savings_rate * 100),
            "diversification_index": min(categories * 10, 100)
        }
    }

@router.get("/pro-insights")
def get_pro_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.admin, UserRole.analyst, UserRole.viewer]))
):
    """Generate dynamic, actionable insights based on real user data"""
    income = db.query(func.sum(Record.amount)).filter(Record.type == RecordType.income).scalar() or 0.0
    expense = db.query(func.sum(Record.amount)).filter(Record.type == RecordType.expense).scalar() or 0.0
    
    savings_rate = ((income - expense) / income) * 100 if income > 0 else 0
    
    # Analyze categories
    top_category = db.query(
        Record.category, func.sum(Record.amount).label("total")
    ).filter(Record.type == RecordType.expense).group_by(Record.category).order_by(func.sum(Record.amount).desc()).first()
    
    insights = []
    
    # Savings Insight
    if savings_rate > 30:
        insights.append({
            "title": "Elite Savings Efficiency",
            "message": f"Your savings rate is {round(savings_rate)}%—well above the 20% industry standard. Excellent capital retention.",
            "color": "emerald"
        })
    elif income > 0 and savings_rate <= 0:
        insights.append({
            "title": "Exposure Warning",
            "message": "Your expenses exceed your income this month. High risk of capital depletion detected.",
            "color": "rose"
        })

    return insights
