from pydantic import BaseModel
from uuid import UUID
from datetime import date
from typing import Optional
from models.record import RecordType

class RecordCreate(BaseModel):
    amount: float
    type: RecordType
    category: str
    date: date
    notes: Optional[str] = None

class RecordResponse(BaseModel):
    id: UUID
    amount: float
    type: RecordType
    category: str
    date: date
    notes: Optional[str]
    user_id: UUID

    class Config:
        from_attributes = True

class RecordUpdate(BaseModel):
    amount: Optional[float] = None
    type: Optional[RecordType] = None
    category: Optional[str] = None
    date: Optional[date] = None
    notes: Optional[str] = None
