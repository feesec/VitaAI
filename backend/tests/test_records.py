"""Tests for health records endpoints."""

from fastapi.testclient import TestClient


def test_list_records_empty(client: TestClient, auth_headers: dict):
    resp = client.get("/records", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() == []


def test_create_manual_record(client: TestClient, auth_headers: dict):
    payload = {
        "record_date": "2024-01-15",
        "indicators": [
            {
                "name": "ALT",
                "value": 35.0,
                "unit": "U/L",
                "ref_range_low": 7.0,
                "ref_range_high": 40.0,
                "status": "normal",
            },
            {
                "name": "总胆固醇",
                "value": 5.9,
                "unit": "mmol/L",
                "ref_range_low": None,
                "ref_range_high": 5.2,
                "status": "high",
            },
        ],
    }
    resp = client.post("/records", json=payload, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["source"] == "manual"
    assert data["record_date"] == "2024-01-15"
    assert len(data["indicators"]) == 2
    # Verify organ_system mapping
    alts = [i for i in data["indicators"] if i["name"] == "ALT"]
    assert alts[0]["organ_system"] == "liver"


def test_list_records_after_create(client: TestClient, auth_headers: dict):
    client.post(
        "/records",
        json={"record_date": "2024-02-01", "indicators": []},
        headers=auth_headers,
    )
    resp = client.get("/records", headers=auth_headers)
    assert resp.status_code == 200
    records = resp.json()
    assert len(records) == 1
    assert records[0]["record_date"] == "2024-02-01"
    assert records[0]["indicator_count"] == 0


def test_get_record_by_id(client: TestClient, auth_headers: dict):
    create_resp = client.post(
        "/records",
        json={
            "record_date": "2024-03-10",
            "indicators": [
                {"name": "AST", "value": 30.0, "unit": "U/L", "status": "normal"}
            ],
        },
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    record_id = create_resp.json()["id"]

    resp = client.get(f"/records/{record_id}", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == record_id
    assert len(data["indicators"]) == 1
    assert data["indicators"][0]["name"] == "AST"


def test_get_record_not_found(client: TestClient, auth_headers: dict):
    resp = client.get("/records/99999", headers=auth_headers)
    assert resp.status_code == 404


def test_get_record_other_user_forbidden(client: TestClient, auth_headers: dict):
    """A record belonging to another user must return 404."""
    # Create a second user and their record
    other_resp = client.post(
        "/auth/register",
        json={"email": "other@example.com", "password": "pass", "name": "Other"},
    )
    other_token = other_resp.json()["access_token"]
    other_headers = {"Authorization": f"Bearer {other_token}"}

    create_resp = client.post(
        "/records",
        json={"record_date": "2024-04-01", "indicators": []},
        headers=other_headers,
    )
    other_record_id = create_resp.json()["id"]

    # Original user tries to access it — should 404
    resp = client.get(f"/records/{other_record_id}", headers=auth_headers)
    assert resp.status_code == 404


def test_interpret_record_mock(client: TestClient, auth_headers: dict):
    """interpret endpoint returns mock data when no ANTHROPIC_API_KEY is set."""
    create_resp = client.post(
        "/records",
        json={
            "record_date": "2024-05-01",
            "indicators": [
                {"name": "总胆固醇", "value": 6.0, "unit": "mmol/L", "status": "high"}
            ],
        },
        headers=auth_headers,
    )
    record_id = create_resp.json()["id"]

    resp = client.post(f"/records/{record_id}/interpret", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "summary" in data
    assert "organ_risks" in data
    assert "recommendations" in data
