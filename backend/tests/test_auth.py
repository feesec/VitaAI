"""Tests for authentication endpoints."""

from fastapi.testclient import TestClient


def test_register_success(client: TestClient):
    resp = client.post(
        "/auth/register",
        json={"email": "alice@example.com", "password": "pass1234", "name": "Alice"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "alice@example.com"
    assert data["name"] == "Alice"
    assert "access_token" in data
    assert data["id"] > 0


def test_register_duplicate_email(client: TestClient):
    payload = {"email": "dup@example.com", "password": "pass1234", "name": "Dup"}
    client.post("/auth/register", json=payload)
    resp = client.post("/auth/register", json=payload)
    assert resp.status_code == 409


def test_login_success(client: TestClient):
    client.post(
        "/auth/register",
        json={"email": "bob@example.com", "password": "mypassword", "name": "Bob"},
    )
    resp = client.post(
        "/auth/token",
        data={"username": "bob@example.com", "password": "mypassword"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client: TestClient):
    client.post(
        "/auth/register",
        json={"email": "carl@example.com", "password": "correct", "name": "Carl"},
    )
    resp = client.post(
        "/auth/token",
        data={"username": "carl@example.com", "password": "wrong"},
    )
    assert resp.status_code == 401


def test_me_without_token(client: TestClient):
    resp = client.get("/users/me")
    assert resp.status_code == 401


def test_me_with_token(client: TestClient, auth_headers: dict):
    resp = client.get("/users/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"
