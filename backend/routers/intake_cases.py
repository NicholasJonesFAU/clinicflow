from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import Optional, List
from datetime import datetime
import json

from database import get_db
from models import IntakeCase, Client
from schemas import IntakeCaseCreate, IntakeCaseUpdate, IntakeCaseResponse

router = APIRouter()


def _load_case(db: Session, case_id: int) -> IntakeCase:
    """Fetch a case with client and assignee eagerly loaded."""
    return (
        db.query(IntakeCase)
        .options(joinedload(IntakeCase.client), joinedload(IntakeCase.assignee))
        .filter(IntakeCase.id == case_id)
        .first()
    )


@router.get("/intake-cases", response_model=List[IntakeCaseResponse])
def list_intake_cases(
    search: Optional[str] = Query(None, description="Search by client name"),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    assigned_to: Optional[int] = Query(None),
    insurance_status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = (
        db.query(IntakeCase)
        .options(joinedload(IntakeCase.client), joinedload(IntakeCase.assignee))
        .join(Client)
    )

    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(Client.first_name.ilike(term), Client.last_name.ilike(term))
        )
    if status:
        query = query.filter(IntakeCase.status == status)
    if priority:
        query = query.filter(Client.priority_level == priority)
    if assigned_to:
        query = query.filter(IntakeCase.assigned_to == assigned_to)
    if insurance_status:
        query = query.filter(IntakeCase.insurance_status == insurance_status)

    return query.order_by(IntakeCase.updated_at.desc()).all()


@router.get("/intake-cases/{case_id}", response_model=IntakeCaseResponse)
def get_intake_case(case_id: int, db: Session = Depends(get_db)):
    case = _load_case(db, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Intake case not found")
    return case


@router.post("/intake-cases", response_model=IntakeCaseResponse, status_code=201)
def create_intake_case(data: IntakeCaseCreate, db: Session = Depends(get_db)):
    case = IntakeCase(
        client_id=data.client_id,
        status=data.status,
        assigned_to=data.assigned_to,
        insurance_status=data.insurance_status,
        missing_documents=json.dumps(data.missing_documents),
        last_contact_date=data.last_contact_date,
        next_follow_up_date=data.next_follow_up_date,
        notes=data.notes,
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return _load_case(db, case.id)


@router.put("/intake-cases/{case_id}", response_model=IntakeCaseResponse)
def update_intake_case(
    case_id: int, data: IntakeCaseUpdate, db: Session = Depends(get_db)
):
    case = db.query(IntakeCase).filter(IntakeCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Intake case not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        if field == "missing_documents":
            setattr(case, field, json.dumps(value))
        elif field in ("next_follow_up_date", "last_contact_date") and value == "":
            setattr(case, field, None)
        else:
            setattr(case, field, value)

    case.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(case)
    return _load_case(db, case_id)


@router.delete("/intake-cases/{case_id}")
def delete_intake_case(case_id: int, db: Session = Depends(get_db)):
    case = db.query(IntakeCase).filter(IntakeCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Intake case not found")
    db.delete(case)
    db.commit()
    return {"message": "Intake case deleted"}
