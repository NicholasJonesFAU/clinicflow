from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Staff
from schemas import StaffCreate, StaffUpdate, StaffResponse

router = APIRouter()


@router.get("/staff", response_model=List[StaffResponse])
def list_staff(db: Session = Depends(get_db)):
    return db.query(Staff).order_by(Staff.name).all()


@router.get("/staff/{staff_id}", response_model=StaffResponse)
def get_staff_member(staff_id: int, db: Session = Depends(get_db)):
    member = db.query(Staff).filter(Staff.id == staff_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return member


@router.post("/staff", response_model=StaffResponse, status_code=201)
def create_staff_member(data: StaffCreate, db: Session = Depends(get_db)):
    existing = db.query(Staff).filter(Staff.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use")
    member = Staff(**data.model_dump())
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@router.put("/staff/{staff_id}", response_model=StaffResponse)
def update_staff_member(
    staff_id: int, data: StaffUpdate, db: Session = Depends(get_db)
):
    member = db.query(Staff).filter(Staff.id == staff_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Staff member not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(member, field, value)
    db.commit()
    db.refresh(member)
    return member


@router.delete("/staff/{staff_id}")
def delete_staff_member(staff_id: int, db: Session = Depends(get_db)):
    member = db.query(Staff).filter(Staff.id == staff_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Staff member not found")
    db.delete(member)
    db.commit()
    return {"message": "Staff member deleted"}
