from pydantic import BaseModel, Field


class Document(BaseModel):
    id: int
    filename: str
    content: str
    chunks: list[str] = []


class Question(BaseModel):
    text: str = Field(min_length=5, max_length=500)