import os
from dotenv import load_dotenv
from fastapi import FastAPI
from app.routers import documents, chat

load_dotenv()

app = FastAPI(title="Campaign RAG API", version="1.0.0")

app.include_router(documents.router)
app.include_router(chat.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}