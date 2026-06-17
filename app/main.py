import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import documents, chat


load_dotenv()

app = FastAPI(title="Campaign RAG API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(documents.router)
app.include_router(chat.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}