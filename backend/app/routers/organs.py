"""Organ profile endpoints."""

from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, select

from ..core.deps import get_current_user
from ..db import get_session
from ..models.health import IndicatorValue, OrganProfile, HealthRecord
from ..models.user import User

router = APIRouter(prefix="/organs", tags=["organs"])

ORGAN_SYSTEMS = ["liver", "cardiovascular", "digestive", "lung"]


# ---------- Schemas ----------

class OrganProfileResponse(BaseModel):
    id: int
    organ: str
    risk_level: str
    watch_items: list[str]
    updated_at: datetime


class OrganDetailResponse(BaseModel):
    profile: OrganProfileResponse
    recent_abnormal: list[dict]


# ---------- Helpers ----------

def _ensure_organ_profiles(user_id: int, session: Session) -> list[OrganProfile]:
    """Return all 4 organ profiles, creating missing ones with risk_level='unknown'."""
    profiles: list[OrganProfile] = []
    for organ in ORGAN_SYSTEMS:
        profile = session.exec(
            select(OrganProfile)
            .where(OrganProfile.user_id == user_id)
            .where(OrganProfile.organ == organ)
        ).first()
        if not profile:
            profile = OrganProfile(user_id=user_id, organ=organ, risk_level="unknown")
            session.add(profile)
        profiles.append(profile)
    session.commit()
    for p in profiles:
        session.refresh(p)
    return profiles


def _profile_response(p: OrganProfile) -> OrganProfileResponse:
    import json as _json
    watch = []
    if p.watch_items:
        try:
            watch = _json.loads(p.watch_items)
        except Exception:
            watch = []
    return OrganProfileResponse(
        id=p.id,  # type: ignore[arg-type]
        organ=p.organ,
        risk_level=p.risk_level,
        watch_items=watch,
        updated_at=p.updated_at,
    )


# ---------- Endpoints ----------

@router.get("", response_model=list[OrganProfileResponse])
def list_organs(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    profiles = _ensure_organ_profiles(current_user.id, session)  # type: ignore[arg-type]
    return [_profile_response(p) for p in profiles]


@router.get("/{organ}", response_model=OrganDetailResponse)
def get_organ(
    organ: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if organ not in ORGAN_SYSTEMS:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown organ '{organ}'. Valid: {ORGAN_SYSTEMS}",
        )

    # Ensure profile exists
    _ensure_organ_profiles(current_user.id, session)  # type: ignore[arg-type]

    profile = session.exec(
        select(OrganProfile)
        .where(OrganProfile.user_id == current_user.id)
        .where(OrganProfile.organ == organ)
    ).first()

    # Fetch recent abnormal indicators for this organ system
    # Join through HealthRecord to filter by user
    user_record_ids = [
        r.id for r in session.exec(
            select(HealthRecord).where(HealthRecord.user_id == current_user.id)
        ).all()
    ]

    recent_abnormal: list[dict] = []
    if user_record_ids:
        indicators = session.exec(
            select(IndicatorValue)
            .where(IndicatorValue.record_id.in_(user_record_ids))  # type: ignore[attr-defined]
            .where(IndicatorValue.organ_system == organ)
            .where(IndicatorValue.status != "normal")
            .order_by(IndicatorValue.id.desc())  # type: ignore[attr-defined]
            .limit(10)
        ).all()
        for iv in indicators:
            recent_abnormal.append({
                "id": iv.id,
                "name": iv.name,
                "value": iv.value,
                "unit": iv.unit,
                "status": iv.status,
                "record_id": iv.record_id,
            })

    return OrganDetailResponse(
        profile=_profile_response(profile),  # type: ignore[arg-type]
        recent_abnormal=recent_abnormal,
    )
