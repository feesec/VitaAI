from datetime import date, datetime
from sqlmodel import Field, SQLModel


class HealthRecord(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    source: str = "manual"                    # "manual" | "upload"
    record_date: date
    file_path: str | None = None
    interpretation_json: str | None = None    # cached AI result as JSON string
    created_at: datetime = Field(default_factory=datetime.utcnow)


class IndicatorValue(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    record_id: int = Field(foreign_key="healthrecord.id")
    name: str                        # e.g. "ALT", "血压收缩压"
    value: float
    unit: str | None = None
    ref_range_low: float | None = None
    ref_range_high: float | None = None
    status: str = "normal"           # "normal" | "high" | "low" | "abnormal"
    organ_system: str | None = None  # "liver" | "cardiovascular" | "digestive" | "lung" | "other"


class OrganProfile(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    organ: str                       # "liver" | "cardiovascular" | "digestive" | "lung"
    risk_level: str = "unknown"      # "low" | "medium" | "high" | "unknown"
    watch_items: str | None = None   # JSON string list
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class RiskAlert(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    organ: str
    urgency: str = "medium"          # "low" | "medium" | "high"
    message: str
    action: str | None = None
    dismissed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
