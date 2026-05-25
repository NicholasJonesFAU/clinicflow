from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List
from datetime import datetime
import json


# ─── Staff ─────────────────────────────────────────────────────────────────────

class StaffBase(BaseModel):
    name: str
    role: str
    email: str
    active: bool = True


class StaffCreate(StaffBase):
    pass


class StaffUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    email: Optional[str] = None
    active: Optional[bool] = None


class StaffResponse(StaffBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# ─── Client ────────────────────────────────────────────────────────────────────

class ClientBase(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: Optional[str] = None
    guardian_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    referral_source: Optional[str] = None
    priority_level: str = "Normal"


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    guardian_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    referral_source: Optional[str] = None
    priority_level: Optional[str] = None


class ClientResponse(ClientBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ─── IntakeCase ────────────────────────────────────────────────────────────────

class IntakeCaseBase(BaseModel):
    status: str = "New Referral"
    insurance_status: str = "Not Started"
    missing_documents: List[str] = []
    last_contact_date: Optional[str] = None
    next_follow_up_date: Optional[str] = None
    notes: str = ""


class IntakeCaseCreate(IntakeCaseBase):
    client_id: int
    assigned_to: Optional[int] = None


class IntakeCaseUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[int] = None
    insurance_status: Optional[str] = None
    missing_documents: Optional[List[str]] = None
    last_contact_date: Optional[str] = None
    next_follow_up_date: Optional[str] = None
    notes: Optional[str] = None


class IntakeCaseResponse(IntakeCaseBase):
    id: int
    client_id: int
    assigned_to: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    client: Optional[ClientResponse] = None
    assignee: Optional[StaffResponse] = None

    @field_validator("missing_documents", mode="before")
    @classmethod
    def parse_missing_docs(cls, v):
        if v is None:
            return []
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, ValueError):
                return []
        if isinstance(v, list):
            return v
        return []

    model_config = ConfigDict(from_attributes=True)


# ─── Dashboard ─────────────────────────────────────────────────────────────────

class DashboardMetrics(BaseModel):
    total_active: int
    ready_to_schedule: int
    insurance_pending: int
    missing_documents: int
    high_urgent_priority: int
    stuck_over_7_days: int
    pipeline: dict


# ─── Insight ───────────────────────────────────────────────────────────────────

class InsightItem(BaseModel):
    type: str
    severity: str  # "info" | "warning" | "critical"
    title: str
    message: str
    count: int
    link_query: str = ""  # URL query string for filtering intake cases
