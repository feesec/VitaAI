"""Simple alert engine: flag indicators that were abnormal in 2+ consecutive records."""

from collections import defaultdict

from sqlmodel import Session, select

from ..models.health import HealthRecord, IndicatorValue, RiskAlert


def run_alert_check(user_id: int, session: Session) -> list[RiskAlert]:
    """Check for persistent abnormal indicators and create RiskAlerts.

    Looks at the two most recent records and creates an alert when the same
    indicator is abnormal in both.  Returns newly created alerts.
    """
    # Fetch last 2 records for this user, ordered by record_date desc
    records = session.exec(
        select(HealthRecord)
        .where(HealthRecord.user_id == user_id)
        .order_by(HealthRecord.record_date.desc())  # type: ignore[attr-defined]
        .limit(2)
    ).all()

    if len(records) < 2:
        return []

    # Gather abnormal indicators per record
    def abnormal_names(record: HealthRecord) -> dict[str, IndicatorValue]:
        rows = session.exec(
            select(IndicatorValue)
            .where(IndicatorValue.record_id == record.id)
            .where(IndicatorValue.status != "normal")
        ).all()
        return {row.name: row for row in rows}

    latest_abnormal = abnormal_names(records[0])
    prev_abnormal = abnormal_names(records[1])

    persistent = set(latest_abnormal.keys()) & set(prev_abnormal.keys())
    if not persistent:
        return []

    new_alerts: list[RiskAlert] = []
    for name in persistent:
        iv = latest_abnormal[name]
        organ = iv.organ_system or "other"
        # Avoid duplicate un-dismissed alerts for same user+indicator
        existing = session.exec(
            select(RiskAlert)
            .where(RiskAlert.user_id == user_id)
            .where(RiskAlert.message.contains(name))  # type: ignore[attr-defined]
            .where(RiskAlert.dismissed == False)  # noqa: E712
        ).first()
        if existing:
            continue

        alert = RiskAlert(
            user_id=user_id,
            organ=organ,
            urgency="medium",
            message=f"指标 {name} 在近两次体检中持续异常（当前值 {iv.value} {iv.unit or ''}）",
            action="建议咨询医生进行进一步检查",
        )
        session.add(alert)
        new_alerts.append(alert)

    if new_alerts:
        session.commit()

    return new_alerts
