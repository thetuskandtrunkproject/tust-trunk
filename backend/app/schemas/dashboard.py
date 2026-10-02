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
    periodRevenue: int
    previousPeriodRevenue: int
    avgDailyRevenue: int
    totalOrders: int
    avgOrderValue: int
    todayRevenue: Optional[int] = 0
    weekRevenue: Optional[int] = 0
    monthRevenue: Optional[int] = 0
    yearRevenue: Optional[int] = 0
    pendingOrders: int
    lowStockCount: int
    revenueData: List[RevenueDataPoint]
    topProducts: List[TopProductItem]
    recentActivity: List[ActivityItem]

class UpdateStockRequest(BaseModel):
    stock: int = Field(..., ge=0, description="New stock value. Must be >= 0.")
