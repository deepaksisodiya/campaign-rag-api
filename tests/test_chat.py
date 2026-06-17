from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from app.main import app
from app.routers.documents import documents_db
import pytest

client = TestClient(app)


@pytest.fixture(autouse=True)
def clear_db():
    documents_db.clear()
    yield


def upload_test_document():
    response = client.post("/documents/", params={
        "filename": "nike.txt",
        "content": "Nike Summer 2026 campaign targets young adults aged 18 to 30. Target regions include Mumbai Delhi and Bangalore."
    })
    return response.json()["id"]


def test_chat_document_not_found():
    response = client.post("/chat/999", json={"text": "What is the target audience?"})
    assert response.status_code == 404


def test_chat_no_relevant_chunks():
    doc_id = upload_test_document()
    response = client.post(f"/chat/{doc_id}", json={"text": "axd, dcs, fdse, sadr"})
    assert response.status_code == 404
    assert response.json()["detail"] == "No relevant content found for your question"


def test_chat_with_document():
    doc_id = upload_test_document()

    mock_message = MagicMock()
    mock_message.content[0].text = "The target regions are Mumbai, Delhi and Bangalore."

    with patch("app.routers.chat.client.messages.create", return_value=mock_message):
        response = client.post(f"/chat/{doc_id}", json={"text": "What are the target regions?"})

    assert response.status_code == 200
    data = response.json()
    assert data["question"] == "What are the target regions?"
    assert data["answer"] == "The target regions are Mumbai, Delhi and Bangalore."
    assert data["chunks_used"] >= 1