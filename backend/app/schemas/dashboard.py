from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

class RevenueDataPoint(BaseModel):
    date: str
    revenue: int

class TopProductItem(BaseModel):
    id: str
    name: str
    unitsSold: int
    revenue: int
    image: str

class ActivityItem(BaseModel):
    id: int
    type: str
    message: str
    time: str

class DashboardResponse(BaseModel):
    todayRevenue: int
    yesterdayRevenue: int
    thisWeekRevenue: int
    thisMonthRevenue: int
    thisYearRevenue: int
    totalOrdersMonth: int
    pendingOrders: int
    lowStockCount: int
    revenueData: List[RevenueDataPoint]
    topProducts: List[TopProductItem]
    recentActivity: List[ActivityItem]

class UpdateStockRequest(BaseModel):
    stock: int = Field(..., ge=0, description="New stock value. Must be >= 0.")
