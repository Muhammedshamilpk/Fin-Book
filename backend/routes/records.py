from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import date

from core.database import get_db
from core.security import get_current_user, require_role
from models.user import User, UserRole
from models.record import Record, RecordType
from schemas.record import RecordCreate, RecordResponse, RecordUpdate

router = APIRouter()

@router.post("/", response_model=RecordResponse, status_code=status.HTTP_201_CREATED)
def create_record(
    record_in: RecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.admin, UserRole.analyst, UserRole.viewer]))
):
    # Depending on requirements, maybe viewer cannot create. But for demo, let's say they can or we restrict:
    if current_user.role == UserRole.viewer:
        raise HTTPException(status_code=403, detail="Viewers cannot create records")
        
    db_record = Record(
        **record_in.model_dump(),
        user_id=current_user.id
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.get("/", response_model=List[RecordResponse])
def get_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    type: Optional[RecordType] = None,
    category: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    query = db.query(Record)
    
    # If not admin, maybe restrict to their own records? Assuming global dashboard for company
    # The requirement says "admin -> full access (users + records)". Let's restrict non-admins to their own, 
    # OR analysts can see all? "Analyst -> read + analytics". Let's allow analysts to see everything.
    if current_user.role == UserRole.viewer:
        # Maybe viewer sees everything read-only, or just their own. Let's make it their own for safety.
        # Actually, standard "financial dashboard" viewer might see global read-only.
        pass # Let's assume global visibility for this dashboard logic unless specified

    if type:
        query = query.filter(Record.type == type)
    if category:
        query = query.filter(Record.category == category)
    if start_date:
        query = query.filter(Record.date >= start_date)
    if end_date:
        query = query.filter(Record.date <= end_date)
        
    records = query.order_by(desc(Record.date)).offset(skip).limit(limit).all()
    return records

@router.put("/{record_id}", response_model=RecordResponse)
def update_record(
    record_id: str,
    record_in: RecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.admin, UserRole.analyst]))
):
    record = db.query(Record).filter(Record.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
        
    # Only admin can edit others' records
    if current_user.role != UserRole.admin and record.user_id != current_user.id:
         raise HTTPException(status_code=403, detail="Cannot edit others' records")

    update_data = record_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(record, key, value)
        
    db.commit()
    db.refresh(record)
    return record

@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(
    record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.admin]))
):
    record = db.query(Record).filter(Record.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
        
    db.delete(record)
    db.commit()
    return None
