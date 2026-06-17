import os
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from app.models import Document

load_dotenv()

router = APIRouter(prefix="/documents", tags=["documents"])

documents_db: dict[int, Document] = {}

next_id: int = 1


def chunk_text(text: str, chunk_size: int = 500) -> list[str]:
    words = text.split()
    chunks = []
    current_chunk = []
    current_size = 0

    for word in words:
        current_chunk.append(word)
        current_size += len(word) + 1
        if current_size >= chunk_size:
            chunks.append(" ".join(current_chunk))
            current_chunk = []
            current_size = 0

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks


@router.post("/", response_model=Document, status_code=201)
def upload_document(filename: str, content:str):
    global next_id
    chunks = chunk_text(content)
    doc = Document(id=next_id, filename=filename, content=content, chunks=chunks)
    documents_db[next_id] = doc
    next_id += 1
    return doc


@router.get('/', response_model=list[Document])
def get_all_documents():
    return list(documents_db.values())