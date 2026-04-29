from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from ..core.deps import get_current_user
from ..db import get_session
from ..models.user import HealthProfile, User

router = APIRouter(prefix="/profile", tags=["profile"])


# ---------- Schemas ----------

class ProfileUpsert(BaseModel):
    age: int | None = None
    gender: str | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    smoking: bool = False
    drinking: str = "none"
    exercise: str = "low"
    sleep_hours: float | None = None
    family_history: str | None = None
    chronic_conditions: str | None = None


class ProfileResponse(BaseModel):
    id: int
    user_id: int
    age: int | None
    gender: str | None
    height_cm: float | None
    weight_kg: float | None
    smoking: bool
    drinking: str
    exercise: str
    sleep_hours: float | None
    family_history: str | None
    chronic_conditions: str | None
    updated_at: datetime


# ---------- Helpers ----------

def _get_profile_or_404(user_id: int, session: Session) -> HealthProfile:
    profile = session.exec(
        select(HealthProfile).where(HealthProfile.user_id == user_id)
    ).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return profile


def _profile_to_response(p: HealthProfile) -> ProfileResponse:
    return ProfileResponse(
        id=p.id,  # type: ignore[arg-type]
        user_id=p.user_id,
        age=p.age,
        gender=p.gender,
        height_cm=p.height_cm,
        weight_kg=p.weight_kg,
        smoking=p.smoking,
        drinking=p.drinking,
        exercise=p.exercise,
        sleep_hours=p.sleep_hours,
        family_history=p.family_history,
        chronic_conditions=p.chronic_conditions,
        updated_at=p.updated_at,
    )


# ---------- Endpoints ----------

@router.get("", response_model=ProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return _profile_to_response(_get_profile_or_404(current_user.id, session))  # type: ignore[arg-type]


@router.post("", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
def create_profile(
    body: ProfileUpsert,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    existing = session.exec(
        select(HealthProfile).where(HealthProfile.user_id == current_user.id)
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Profile already exists — use PUT to update")

    profile = HealthProfile(user_id=current_user.id, **body.model_dump())
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return _profile_to_response(profile)


@router.put("", response_model=ProfileResponse)
def update_profile(
    body: ProfileUpsert,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    profile = _get_profile_or_404(current_user.id, session)  # type: ignore[arg-type]
    update_data = body.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    for field, value in update_data.items():
        setattr(profile, field, value)
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return _profile_to_response(profile)
