from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.agent.rag_sentiment_scoring import score_event

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

class EventRequest(BaseModel):
    description: str

@app.post("/predict")
def predict(req: EventRequest):
    return score_event(req.description)

