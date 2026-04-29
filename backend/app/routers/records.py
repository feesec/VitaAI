"""Health records router — manual entry, file upload, AI parse & interpret."""

import json
import os
import uuid
from datetime import date, datetime

import aiofiles
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlmodel import Session, select

from ..core.deps import get_current_user
from ..db import get_session
from ..models.health import HealthRecord, IndicatorValue, OrganProfile
from ..models.user import HealthProfile, User
from ..services.alert_engine import run_alert_check
from ..services.indicator_mapper import map_organ_system

router = APIRouter(prefix="/records", tags=["records"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")


# ---------- Schemas ----------

class IndicatorIn(BaseModel):
    name: str
    value: float
    unit: str | None = None
    ref_range_low: float | None = None
    ref_range_high: float | None = None
    status: str = "normal"


class RecordCreate(BaseModel):
    record_date: date
    indicators: list[IndicatorIn] = []


class IndicatorOut(BaseModel):
    id: int
    name: str
    value: float
    unit: str | None
    ref_range_low: float | None
    ref_range_high: float | None
    status: str
    organ_system: str | None


class RecordListItem(BaseModel):
    id: int
    record_date: date
    source: str
    indicator_count: int
    created_at: datetime


class RecordDetail(BaseModel):
    id: int
    record_date: date
    source: str
    file_path: str | None
    interpretation: dict | None
    indicators: list[IndicatorOut]
    created_at: datetime


# ---------- Helpers ----------

def _get_record_for_user(record_id: int, user_id: int, session: Session) -> HealthRecord:
    record = session.get(HealthRecord, record_id)
    if not record or record.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
    return record


def _indicators_for_record(record_id: int, session: Session) -> list[IndicatorValue]:
    return session.exec(
        select(IndicatorValue).where(IndicatorValue.record_id == record_id)
    ).all()


def _indicator_out(iv: IndicatorValue) -> IndicatorOut:
    return IndicatorOut(
        id=iv.id,  # type: ignore[arg-type]
        name=iv.name,
        value=iv.value,
        unit=iv.unit,
        ref_range_low=iv.ref_range_low,
        ref_range_high=iv.ref_range_high,
        status=iv.status,
        organ_system=iv.organ_system,
    )


def _update_organ_profiles(user_id: int, interpretation: dict, session: Session) -> None:
    """Sync OrganProfile rows from the AI interpretation."""
    organ_risks = interpretation.get("organ_risks", {})
    for organ, info in organ_risks.items():
        level = info.get("level", "unknown")
        # Normalise "normal" → "low" for storage (unknown/low/medium/high)
        if level == "normal":
            level = "low"
        profile = session.exec(
            select(OrganProfile)
            .where(OrganProfile.user_id == user_id)
            .where(OrganProfile.organ == organ)
        ).first()
        if profile:
            profile.risk_level = level
            profile.updated_at = datetime.utcnow()
        else:
            profile = OrganProfile(user_id=user_id, organ=organ, risk_level=level)
        session.add(profile)
    session.commit()


# ---------- Endpoints ----------

@router.get("", response_model=list[RecordListItem])
def list_records(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    records = session.exec(
        select(HealthRecord)
        .where(HealthRecord.user_id == current_user.id)
        .order_by(HealthRecord.record_date.desc())  # type: ignore[attr-defined]
    ).all()
    result = []
    for r in records:
        count = len(_indicators_for_record(r.id, session))  # type: ignore[arg-type]
        result.append(
            RecordListItem(
                id=r.id,  # type: ignore[arg-type]
                record_date=r.record_date,
                source=r.source,
                indicator_count=count,
                created_at=r.created_at,
            )
        )
    return result


@router.post("", response_model=RecordDetail, status_code=status.HTTP_201_CREATED)
def create_record(
    body: RecordCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    record = HealthRecord(
        user_id=current_user.id,
        source="manual",
        record_date=body.record_date,
    )
    session.add(record)
    session.commit()
    session.refresh(record)

    indicators: list[IndicatorValue] = []
    for ind in body.indicators:
        iv = IndicatorValue(
            record_id=record.id,
            name=ind.name,
            value=ind.value,
            unit=ind.unit,
            ref_range_low=ind.ref_range_low,
            ref_range_high=ind.ref_range_high,
            status=ind.status,
            organ_system=map_organ_system(ind.name),
        )
        session.add(iv)
        indicators.append(iv)
    session.commit()
    for iv in indicators:
        session.refresh(iv)

    # Run alert check after new record
    run_alert_check(current_user.id, session)  # type: ignore[arg-type]

    return RecordDetail(
        id=record.id,  # type: ignore[arg-type]
        record_date=record.record_date,
        source=record.source,
        file_path=record.file_path,
        interpretation=None,
        indicators=[_indicator_out(iv) for iv in indicators],
        created_at=record.created_at,
    )


@router.get("/{record_id}", response_model=RecordDetail)
def get_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    record = _get_record_for_user(record_id, current_user.id, session)  # type: ignore[arg-type]
    indicators = _indicators_for_record(record.id, session)  # type: ignore[arg-type]
    interp = json.loads(record.interpretation_json) if record.interpretation_json else None
    return RecordDetail(
        id=record.id,  # type: ignore[arg-type]
        record_date=record.record_date,
        source=record.source,
        file_path=record.file_path,
        interpretation=interp,
        indicators=[_indicator_out(iv) for iv in indicators],
        created_at=record.created_at,
    )


@router.post("/upload", response_model=RecordDetail, status_code=status.HTTP_201_CREATED)
async def upload_record(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    # Create DB row first to get the id
    record = HealthRecord(
        user_id=current_user.id,
        source="upload",
        record_date=date.today(),
    )
    session.add(record)
    session.commit()
    session.refresh(record)

    # Save file under uploads/{user_id}/{record_id}_{original_name}
    user_upload_dir = os.path.join(UPLOAD_DIR, str(current_user.id))
    os.makedirs(user_upload_dir, exist_ok=True)

    safe_name = f"{record.id}_{file.filename or uuid.uuid4().hex}"
    file_path = os.path.join(user_upload_dir, safe_name)

    async with aiofiles.open(file_path, "wb") as out:
        content = await file.read()
        await out.write(content)

    record.file_path = file_path
    session.add(record)
    session.commit()
    session.refresh(record)

    return RecordDetail(
        id=record.id,  # type: ignore[arg-type]
        record_date=record.record_date,
        source=record.source,
        file_path=record.file_path,
        interpretation=None,
        indicators=[],
        created_at=record.created_at,
    )


@router.post("/{record_id}/parse", response_model=list[IndicatorOut])
async def parse_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Extract indicators from an uploaded file using Claude (or mock)."""
    from ..services.parse_report import parse_report_image

    record = _get_record_for_user(record_id, current_user.id, session)  # type: ignore[arg-type]
    if not record.file_path:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file attached to this record")

    raw_indicators = await parse_report_image(record.file_path)

    # Delete existing indicators for this record before re-parsing
    existing = _indicators_for_record(record.id, session)  # type: ignore[arg-type]
    for iv in existing:
        session.delete(iv)
    session.commit()

    saved: list[IndicatorValue] = []
    for ind in raw_indicators:
        iv = IndicatorValue(
            record_id=record.id,
            name=ind["name"],
            value=float(ind["value"]),
            unit=ind.get("unit"),
            ref_range_low=ind.get("ref_range_low"),
            ref_range_high=ind.get("ref_range_high"),
            status=ind.get("status", "normal"),
            organ_system=map_organ_system(ind["name"]),
        )
        session.add(iv)
        saved.append(iv)
    session.commit()
    for iv in saved:
        session.refresh(iv)

    run_alert_check(current_user.id, session)  # type: ignore[arg-type]

    return [_indicator_out(iv) for iv in saved]


@router.post("/{record_id}/interpret")
async def interpret_record_endpoint(
    record_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Generate AI interpretation for a record and update OrganProfiles."""
    from ..services.interpret_record import interpret_record

    record = _get_record_for_user(record_id, current_user.id, session)  # type: ignore[arg-type]
    indicators = _indicators_for_record(record.id, session)  # type: ignore[arg-type]

    ind_dicts = [
        {
            "name": iv.name,
            "value": iv.value,
            "unit": iv.unit,
            "status": iv.status,
            "organ_system": iv.organ_system,
        }
        for iv in indicators
    ]

    # Load user health profile for context
    hp = session.exec(
        select(HealthProfile).where(HealthProfile.user_id == current_user.id)
    ).first()
    profile_dict: dict | None = None
    if hp:
        profile_dict = {
            "age": hp.age,
            "gender": hp.gender,
            "smoking": hp.smoking,
            "drinking": hp.drinking,
            "exercise": hp.exercise,
            "chronic_conditions": hp.chronic_conditions,
        }

    result = await interpret_record(ind_dicts, profile_dict)

    record.interpretation_json = json.dumps(result, ensure_ascii=False)
    session.add(record)
    session.commit()

    # Update organ profiles from interpretation
    _update_organ_profiles(current_user.id, result, session)  # type: ignore[arg-type]

    return result
