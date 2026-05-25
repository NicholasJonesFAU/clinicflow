# ClinicFlow

A healthcare intake operations workflow tool for small clinics, therapy practices, ABA practices, and outpatient offices.

---

## 1. Project Summary

ClinicFlow is an internal operations dashboard that helps intake teams track clients through the referral-to-scheduled pipeline. It provides real-time visibility into who is stuck, what documents are missing, whether insurance has been verified, and where follow-up is overdue.

---

## 2. Why the Product Exists

Intake coordinators at small healthcare practices often manage their pipeline in spreadsheets or disconnected tools. ClinicFlow centralizes that operational view into a clean, purpose-built interface — surfacing the most important signals automatically rather than requiring manual tracking.

---

## 3. Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | FastAPI, SQLAlchemy 2.0, SQLite   |
| Frontend  | React 18, Vite, Tailwind CSS      |
| Icons     | lucide-react                      |
| Runtime   | Python 3.10+, Node 18+            |

---

## 4. Features

- **Intake Pipeline Dashboard** — KPI cards, pipeline status visualization, active case table
- **Case Management** — Update status, priority, insurance, missing documents, follow-up dates, notes
- **Operational Insights** — Rule-based alerts (workload imbalance, stuck cases, missing docs, unassigned cases)
- **Staff Workload View** — Per-staff active case counts and workload percentage
- **Search & Filter** — Filter by status, priority, assigned staff, insurance state
- **Visual Indicators** — Overdue follow-up, stuck (7+ days), high/urgent priority badges
- **Client Directory** — Full client list with referral source and priority

---

## 5. Architecture Overview

```
clinicflow/
├── backend/
│   ├── main.py           # FastAPI app, CORS, router registration
│   ├── database.py       # SQLite engine, session factory
│   ├── models.py         # SQLAlchemy ORM models
│   ├── schemas.py        # Pydantic v2 request/response schemas
│   ├── seed.py           # Demo data generation
│   └── routers/
│       ├── clients.py        # CRUD for clients
│       ├── intake_cases.py   # CRUD for intake cases
│       ├── staff.py          # CRUD for staff
│       ├── dashboard.py      # Aggregate KPI metrics
│       └── insights.py       # Rule-based operational insights
└── frontend/
    └── src/
        ├── api/client.js     # Fetch wrapper + all API calls
        ├── components/       # Reusable UI: badges, cards, spinner, empty state
        └── pages/            # Dashboard, IntakeCases, CaseDetail, Clients, Staff, Insights
```

---

## 6. Screenshots

_[Add screenshots here after running locally]_

- Dashboard with KPI cards and pipeline visualization
- Intake Cases table with filters
- Case Detail with editable fields
- Operational Insights cards

---

## 7. Backend Setup

```bash
cd clinicflow/backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Start the API server:
```bash
uvicorn main:app --reload --port 8000
```

API available at: `http://localhost:8000`
Interactive docs: `http://localhost:8000/docs`

---

## 8. Frontend Setup

```bash
cd clinicflow/frontend
npm install
npm run dev
```

App available at: `http://localhost:3000`

---

## 9. Seed Data

After starting the backend, run:
```bash
cd clinicflow/backend
python seed.py
```

This creates:
- 5 staff members
- 20 clients
- 20 intake cases with varied statuses, priorities, and insurance states

Re-run to reset the database (it drops and recreates all tables).

---

## 10. Demo Workflow Walkthrough

1. **Seed the database** (see above)
2. **Open the Dashboard** — Review KPI cards and pipeline status counts
3. **Click a pipeline status** — Filters the cases table to that status
4. **Click a case row** — Opens Case Detail
5. **Update status, insurance, missing documents** — Click Save Changes
6. **Navigate to Insights** — View rule-based operational alerts
7. **Check Staff page** — Review workload distribution

---

## 11. API Overview

| Method | Endpoint                    | Description               |
|--------|-----------------------------|---------------------------|
| GET    | /api/clients                | List all clients          |
| POST   | /api/clients                | Create client             |
| PUT    | /api/clients/{id}           | Update client             |
| DELETE | /api/clients/{id}           | Delete client             |
| GET    | /api/intake-cases           | List cases (filterable)   |
| GET    | /api/intake-cases/{id}      | Get case with client info |
| POST   | /api/intake-cases           | Create intake case        |
| PUT    | /api/intake-cases/{id}      | Update intake case        |
| DELETE | /api/intake-cases/{id}      | Delete case               |
| GET    | /api/staff                  | List all staff            |
| GET    | /api/dashboard/metrics      | KPI + pipeline counts     |
| GET    | /api/insights               | Rule-based insights       |

---

## 12. Portfolio Positioning

ClinicFlow demonstrates full-stack product thinking applied to a real operational domain. The backend showcases clean FastAPI architecture with SQLAlchemy 2.0, Pydantic v2 validation, and modular router design. The frontend shows component-driven React development with a service API layer, real-time filter state, and a polished Tailwind UI. The product itself reflects experience translating domain knowledge (healthcare intake workflows) into software — a skill that applies across any operations-heavy vertical (education, legal, HR, logistics).

---

## 13. Disclaimer

> This project is a portfolio demonstration app using fake data only. It is not intended for production healthcare use or for storing real patient information.
