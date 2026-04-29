from datetime import datetime
from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class HealthProfile(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True)
    age: int | None = None
    gender: str | None = None          # "male" | "female" | "other"
    height_cm: float | None = None
    weight_kg: float | None = None
    smoking: bool = False
    drinking: str = "none"             # "none" | "occasional" | "frequent"
    exercise: str = "low"              # "low" | "moderate" | "high"
    sleep_hours: float | None = None
    family_history: str | None = None  # free text
    chronic_conditions: str | None = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)
