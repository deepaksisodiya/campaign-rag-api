import os
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from anthropic import Anthropic
from app.models import Question
from app.routers.documents import documents_db

load_dotenv()

router = APIRouter(prefix="/chat", tags=["chat"])

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


def find_relevant_chunks(question: str, chunks: list[str], max_chunks: int = 3) -> list[str]:
    question_words = set(question.lower().split())
    scored = []

    for chunk in chunks:
        chunk_words = set(chunk.lower().split())
        score = len(question_words & chunk_words)
        scored.append((score, chunk))

    scored.sort(reverse=True)
    return [chunk for score, chunk in scored[:max_chunks] if score > 0]


@router.post("/{document_id}")
def chat_with_document(document_id: int, question: Question):
    if document_id not in documents_db:
        raise HTTPException(status_code=404, detail="Document not found")
    
    document = documents_db[document_id]
    relevant_chunks = find_relevant_chunks(question.text, document.chunks)

    if not relevant_chunks:
        raise HTTPException(status_code=404, detail="No relevant content found for your question")
    
    context = "\n\n".join(relevant_chunks)

    prompt = f"""You are a helpful assistant. Answer the question using ONLY the context provided below.
    If the answer is not in the context, say "I don't have enough information to answer that."

    Context:
    {context}

    Question: {question.text}"""

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )

    return {
        "question": question.text,
        "answer": message.content[0].text,
        "chunks_used": len(relevant_chunks)
    }

