"""Unit tests for FastAPI endpoints in main.py"""

from main import app
from tests.conftest import get_authenticated_client
from fastapi.testclient import TestClient

client = get_authenticated_client()


def test_root():
    """Test the health check root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "AI-Powered CRM"
    assert data["status"] == "healthy"
    assert "agents" in data


def test_health():
    """Test the detailed health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["api"] == "healthy"
    assert data["database"] == "connected"
    assert "agents" in data
