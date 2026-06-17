from fastapi.testclient import TestClient
from app.main import app
from app.routers.documents import documents_db
import pytest

client = TestClient(app)

@pytest.fixture(autouse = True)
def clear_db():
    documents_db.clear()
    yield


def test_health_check():
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json() == {"status":"ok"}


def test_upload_document():
    response = client.post("/documents/", params={
        "filename": "test.txt",
        "content": "This is a test document about Nike campaign targeting young adults."
    })
    assert response.status_code == 201
    data = response.json()
    assert data["filename"] == "test.txt"
    assert len(data["chunks"]) > 0


def test_get_all_documents_emtpy():
    response = client.get('/documents/')
    assert response.status_code == 200
    assert response.json() == []


def test_get_all_documents():
    client.post("/documents/", params={
        "filename": "test.txt",
        "content": "This is a test document about Nike campaign targeting young adults."
    })
     
    response = client.get('/documents/')
    assert response.status_code == 200
    assert len(response.json()) == 1
