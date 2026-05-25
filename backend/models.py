from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    active = Column(Boolean, default=True)

    intake_cases = relationship("IntakeCase", back_populates="assignee")


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    date_of_birth = Column(String, nullable=True)
    guardian_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    referral_source = Column(String, nullable=True)
    priority_level = Column(String, default="Normal")  # Low, Normal, High, Urgent
    created_at = Column(DateTime, default=datetime.utcnow)

    intake_cases = relationship("IntakeCase", back_populates="client")


class IntakeCase(Base):
    __tablename__ = "intake_cases"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    status = Column(String, default="New Referral")
    assigned_to = Column(Integer, ForeignKey("staff.id"), nullable=True)
    insurance_status = Column(String, default="Not Started")
    # Stored as JSON text: e.g. '["Intake Form", "Insurance Card"]'
    missing_documents = Column(Text, default="[]")
    last_contact_date = Column(String, nullable=True)
    next_follow_up_date = Column(String, nullable=True)
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    client = relationship("Client", back_populates="intake_cases")
    assignee = relationship("Staff", back_populates="intake_cases")
