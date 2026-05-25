"""
Seed script for ClinicFlow demo data.
Run with: python seed.py

Generates completely fake data only. No real PHI.
"""

import json
from datetime import datetime, timedelta, date

from database import SessionLocal, engine
from models import Base, Staff, Client, IntakeCase


def days_ago(n: int) -> str:
    return (date.today() - timedelta(days=n)).isoformat()


def days_from_now(n: int) -> str:
    return (date.today() + timedelta(days=n)).isoformat()


def dt_ago(n: int) -> datetime:
    return datetime.utcnow() - timedelta(days=n)


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # ── Wipe existing demo data ───────────────────────────────────────────────
    db.query(IntakeCase).delete()
    db.query(Client).delete()
    db.query(Staff).delete()
    db.commit()

    # ── Staff (5 members) ─────────────────────────────────────────────────────
    staff_records = [
        Staff(name="Jordan Lee",   role="Intake Coordinator", email="jordan.lee@clinicflow.demo",   active=True),
        Staff(name="Maria Santos", role="Intake Specialist",  email="maria.santos@clinicflow.demo", active=True),
        Staff(name="Devon Wright", role="Intake Coordinator", email="devon.wright@clinicflow.demo", active=True),
        Staff(name="Alex Kim",     role="Intake Manager",     email="alex.kim@clinicflow.demo",     active=True),
        Staff(name="Casey Morgan", role="Intake Specialist",  email="casey.morgan@clinicflow.demo", active=False),
    ]
    db.add_all(staff_records)
    db.commit()
    # IDs: Jordan=1, Maria=2, Devon=3, Alex=4, Casey=5

    # ── Clients (20 fake clients) ─────────────────────────────────────────────
    client_records = [
        Client(first_name="Emma",      last_name="Dawson",   date_of_birth="2018-03-15", guardian_name="Laura Dawson",      phone="555-2301", email="ldawson@email.demo",    referral_source="Physician Referral", priority_level="Urgent"),
        Client(first_name="Marco",     last_name="Rivera",   date_of_birth="1985-07-22", guardian_name=None,                phone="555-4872", email="mrivera@email.demo",    referral_source="Self-Referral",      priority_level="Normal"),
        Client(first_name="Lily",      last_name="Chen",     date_of_birth="2015-11-08", guardian_name="Susan Chen",        phone="555-6134", email="schen@email.demo",      referral_source="School Referral",    priority_level="Urgent"),
        Client(first_name="James",     last_name="Holloway", date_of_birth="1990-04-30", guardian_name=None,                phone="555-9023", email="jholloway@email.demo",  referral_source="Physician Referral", priority_level="Low"),
        Client(first_name="Aria",      last_name="Patel",    date_of_birth="2019-01-17", guardian_name="Priya Patel",       phone="555-3418", email="ppatel@email.demo",     referral_source="Physician Referral", priority_level="Urgent"),
        Client(first_name="Noah",      last_name="Bennett",  date_of_birth="2012-08-25", guardian_name="Robert Bennett",    phone="555-7205", email="rbennett@email.demo",   referral_source="ABA Referral",       priority_level="High"),
        Client(first_name="Sofia",     last_name="Martinez", date_of_birth="1978-12-01", guardian_name=None,                phone="555-1847", email="smartinez@email.demo",  referral_source="Insurance Referral", priority_level="Normal"),
        Client(first_name="Ethan",     last_name="Wallace",  date_of_birth="2010-05-14", guardian_name="Jennifer Wallace",  phone="555-5629", email="jwallace@email.demo",   referral_source="School Referral",    priority_level="High"),
        Client(first_name="Chloe",     last_name="Thompson", date_of_birth="1995-09-28", guardian_name=None,                phone="555-8341", email="cthompson@email.demo",  referral_source="Self-Referral",      priority_level="Low"),
        Client(first_name="Aiden",     last_name="Murphy",   date_of_birth="2016-02-11", guardian_name="Kevin Murphy",      phone="555-2756", email="kmurphy@email.demo",    referral_source="Physician Referral", priority_level="Normal"),
        Client(first_name="Isabella",  last_name="Garcia",   date_of_birth="1988-06-17", guardian_name=None,                phone="555-9134", email="igarcia@email.demo",    referral_source="Self-Referral",      priority_level="Normal"),
        Client(first_name="Jackson",   last_name="Foster",   date_of_birth="2014-10-03", guardian_name="Tracy Foster",      phone="555-4023", email="tfoster@email.demo",    referral_source="School Referral",    priority_level="High"),
        Client(first_name="Mia",       last_name="Nguyen",   date_of_birth="2020-04-22", guardian_name="Linh Nguyen",       phone="555-6890", email="lnguyen@email.demo",    referral_source="Physician Referral", priority_level="Urgent"),
        Client(first_name="Liam",      last_name="Cooper",   date_of_birth="1993-08-14", guardian_name=None,                phone="555-3512", email="lcooper@email.demo",    referral_source="Self-Referral",      priority_level="Low"),
        Client(first_name="Zoe",       last_name="Harrison", date_of_birth="2011-12-05", guardian_name="Diana Harrison",    phone="555-7841", email="dharrison@email.demo",  referral_source="ABA Referral",       priority_level="Normal"),
        Client(first_name="Benjamin",  last_name="Clark",    date_of_birth="1972-03-30", guardian_name=None,                phone="555-2190", email="bclark@email.demo",     referral_source="Physician Referral", priority_level="High"),
        Client(first_name="Ava",       last_name="Williams", date_of_birth="2017-07-19", guardian_name="Michelle Williams", phone="555-5367", email="mwilliams@email.demo",  referral_source="School Referral",    priority_level="Normal"),
        Client(first_name="Oliver",    last_name="Brown",    date_of_birth="2008-01-28", guardian_name="Steven Brown",      phone="555-8924", email="sbrown@email.demo",     referral_source="Physician Referral", priority_level="High"),
        Client(first_name="Charlotte", last_name="Davis",    date_of_birth="1982-10-10", guardian_name=None,                phone="555-4156", email="cdavis@email.demo",     referral_source="Insurance Referral", priority_level="Normal"),
        Client(first_name="Samuel",    last_name="Young",    date_of_birth="2013-09-07", guardian_name="Patricia Young",    phone="555-6723", email="pyoung@email.demo",     referral_source="ABA Referral",       priority_level="Urgent"),
    ]
    db.add_all(client_records)
    db.commit()

    # ── Intake Cases (20 cases, varied statuses / flags) ──────────────────────
    #
    # Jordan Lee (id=1) carries cases 1,3,5,7,9,11,13,15 = 8 active cases (~47%)
    # → triggers workload-imbalance insight
    #
    # Cases marked STUCK have updated_at older than 7 days.
    # Cases marked OVERDUE have next_follow_up_date in the past.

    cases = [
        # 1 – Emma (Urgent) | Insurance Pending | STUCK + OVERDUE
        IntakeCase(
            client_id=1, status="Insurance Pending", assigned_to=1,
            insurance_status="Pending",
            missing_documents=json.dumps(["Insurance Card"]),
            last_contact_date=days_ago(5),
            next_follow_up_date=days_ago(2),   # OVERDUE
            notes="Left voicemail with guardian. Insurance verification in progress. Policy #4872.",
            created_at=dt_ago(20), updated_at=dt_ago(8),  # STUCK
        ),
        # 2 – Marco (Normal) | New Referral | missing docs, no follow-up
        IntakeCase(
            client_id=2, status="New Referral", assigned_to=2,
            insurance_status="Not Started",
            missing_documents=json.dumps(["Intake Form", "Consent Form"]),
            last_contact_date=None,
            next_follow_up_date=None,
            notes="New referral received from Dr. Martinez's office on referral portal.",
            created_at=dt_ago(3), updated_at=dt_ago(3),
        ),
        # 3 – Lily (Urgent) | Insurance Pending | STUCK
        IntakeCase(
            client_id=3, status="Insurance Pending", assigned_to=1,
            insurance_status="Pending",
            missing_documents=json.dumps([]),
            last_contact_date=days_ago(2),
            next_follow_up_date=days_from_now(3),
            notes="Guardian confirmed insurance. Waiting on verification from Blue Cross. Ref #BCB-88821.",
            created_at=dt_ago(25), updated_at=dt_ago(10),  # STUCK
        ),
        # 4 – James (Low) | Forms Sent | OVERDUE
        IntakeCase(
            client_id=4, status="Forms Sent", assigned_to=2,
            insurance_status="Not Started",
            missing_documents=json.dumps(["Intake Form"]),
            last_contact_date=days_ago(7),
            next_follow_up_date=days_ago(1),   # OVERDUE
            notes="Forms emailed 7 days ago. No response received. Will attempt phone call.",
            created_at=dt_ago(12), updated_at=dt_ago(7),
        ),
        # 5 – Aria (Urgent) | Ready to Schedule
        IntakeCase(
            client_id=5, status="Ready to Schedule", assigned_to=1,
            insurance_status="Verified",
            missing_documents=json.dumps([]),
            last_contact_date=days_ago(1),
            next_follow_up_date=days_from_now(5),
            notes="All documents received and verified. Client ready for initial appointment. Prefers afternoons.",
            created_at=dt_ago(18), updated_at=dt_ago(1),
        ),
        # 6 – Noah (High) | Insurance Pending | missing docs, no follow-up set
        IntakeCase(
            client_id=6, status="Insurance Pending", assigned_to=2,
            insurance_status="Pending",
            missing_documents=json.dumps(["Guardian ID", "Insurance Card"]),
            last_contact_date=days_ago(4),
            next_follow_up_date=None,   # NO FOLLOW-UP
            notes="Guardian ID and insurance card still outstanding. Need to escalate.",
            created_at=dt_ago(15), updated_at=dt_ago(4),
        ),
        # 7 – Sofia (Normal) | Forms Received
        IntakeCase(
            client_id=7, status="Forms Received", assigned_to=1,
            insurance_status="Not Started",
            missing_documents=json.dumps([]),
            last_contact_date=days_ago(3),
            next_follow_up_date=days_from_now(2),
            notes="All intake forms returned complete. Starting insurance verification process.",
            created_at=dt_ago(10), updated_at=dt_ago(3),
        ),
        # 8 – Ethan (High) | Contact Attempted | OVERDUE + many missing docs
        IntakeCase(
            client_id=8, status="Contact Attempted", assigned_to=3,
            insurance_status="Not Started",
            missing_documents=json.dumps(["Intake Form", "Consent Form", "Insurance Card"]),
            last_contact_date=days_ago(6),
            next_follow_up_date=days_ago(3),   # OVERDUE
            notes="Called twice — no answer. Left voicemail both times. Will try alternate contact number.",
            created_at=dt_ago(14), updated_at=dt_ago(6),
        ),
        # 9 – Chloe (Low) | Insurance Verified
        IntakeCase(
            client_id=9, status="Insurance Verified", assigned_to=1,
            insurance_status="Verified",
            missing_documents=json.dumps([]),
            last_contact_date=days_ago(2),
            next_follow_up_date=days_from_now(7),
            notes="Insurance verified — Cigna PPO plan. Benefit check complete. Awaiting scheduling.",
            created_at=dt_ago(9), updated_at=dt_ago(2),
        ),
        # 10 – Aiden (Normal) | New Referral | missing docs, no follow-up
        IntakeCase(
            client_id=10, status="New Referral", assigned_to=3,
            insurance_status="Not Started",
            missing_documents=json.dumps(["Intake Form", "Consent Form"]),
            last_contact_date=None,
            next_follow_up_date=None,   # NO FOLLOW-UP
            notes="Referral packet received from school counselor. Assign intake coordinator.",
            created_at=dt_ago(2), updated_at=dt_ago(1),
        ),
        # 11 – Isabella (Normal) | Insurance Pending | STUCK + Issue Found
        IntakeCase(
            client_id=11, status="Insurance Pending", assigned_to=1,
            insurance_status="Issue Found",
            missing_documents=json.dumps([]),
            last_contact_date=days_ago(5),
            next_follow_up_date=days_from_now(1),
            notes="Insurance issue: Aetna shows policy as inactive. Client needs to contact HR to reinstate.",
            created_at=dt_ago(18), updated_at=dt_ago(9),  # STUCK
        ),
        # 12 – Jackson (High) | Ready to Schedule | UNASSIGNED
        IntakeCase(
            client_id=12, status="Ready to Schedule", assigned_to=None,  # UNASSIGNED
            insurance_status="Verified",
            missing_documents=json.dumps([]),
            last_contact_date=days_ago(3),
            next_follow_up_date=days_from_now(4),
            notes="All clear — insurance verified, documents complete. Needs scheduling coordinator assigned.",
            created_at=dt_ago(11), updated_at=dt_ago(3),
        ),
        # 13 – Mia (Urgent) | Contact Attempted | OVERDUE + missing docs
        IntakeCase(
            client_id=13, status="Contact Attempted", assigned_to=1,
            insurance_status="Not Started",
            missing_documents=json.dumps(["Intake Form", "Guardian ID"]),
            last_contact_date=days_ago(5),
            next_follow_up_date=days_ago(2),   # OVERDUE
            notes="Urgent pediatric case. Attempted contact x3. Guardian not responding. Escalation needed.",
            created_at=dt_ago(8), updated_at=dt_ago(5),
        ),
        # 14 – Liam (Low) | Scheduled
        IntakeCase(
            client_id=14, status="Scheduled", assigned_to=3,
            insurance_status="Verified",
            missing_documents=json.dumps([]),
            last_contact_date=days_ago(1),
            next_follow_up_date=None,
            notes="Initial appointment scheduled for next week. Intake workflow complete.",
            created_at=dt_ago(21), updated_at=dt_ago(1),
        ),
        # 15 – Zoe (Normal) | Forms Sent
        IntakeCase(
            client_id=15, status="Forms Sent", assigned_to=1,
            insurance_status="Not Started",
            missing_documents=json.dumps(["Intake Form"]),
            last_contact_date=days_ago(2),
            next_follow_up_date=days_from_now(5),
            notes="Forms sent via patient portal on Monday. Guardian acknowledged receipt.",
            created_at=dt_ago(7), updated_at=dt_ago(2),
        ),
        # 16 – Benjamin (High) | Insurance Pending
        IntakeCase(
            client_id=16, status="Insurance Pending", assigned_to=3,
            insurance_status="Pending",
            missing_documents=json.dumps([]),
            last_contact_date=days_ago(3),
            next_follow_up_date=days_from_now(2),
            notes="Submitted pre-auth request to United Healthcare. Tracking ref #UHC-20241.",
            created_at=dt_ago(8), updated_at=dt_ago(3),
        ),
        # 17 – Ava (Normal) | Ready to Schedule
        IntakeCase(
            client_id=17, status="Ready to Schedule", assigned_to=4,
            insurance_status="Verified",
            missing_documents=json.dumps([]),
            last_contact_date=days_ago(1),
            next_follow_up_date=days_from_now(3),
            notes="Intake complete. Family prefers AM appointments, Mon–Wed. Mother is primary contact.",
            created_at=dt_ago(13), updated_at=dt_ago(1),
        ),
        # 18 – Oliver (High) | Insurance Verified | one doc still pending
        IntakeCase(
            client_id=18, status="Insurance Verified", assigned_to=4,
            insurance_status="Verified",
            missing_documents=json.dumps(["Referral Packet"]),
            last_contact_date=days_ago(2),
            next_follow_up_date=days_from_now(6),
            notes="Insurance confirmed. Still waiting on referral packet from Dr. Pham's office.",
            created_at=dt_ago(6), updated_at=dt_ago(2),
        ),
        # 19 – Charlotte (Normal) | Closed
        IntakeCase(
            client_id=19, status="Closed", assigned_to=4,
            insurance_status="Verified",
            missing_documents=json.dumps([]),
            last_contact_date=days_ago(30),
            next_follow_up_date=None,
            notes="Intake closed — client declined services after insurance review.",
            created_at=dt_ago(45), updated_at=dt_ago(14),
        ),
        # 20 – Samuel (Urgent) | New Referral | UNASSIGNED, ALL docs missing
        IntakeCase(
            client_id=20, status="New Referral", assigned_to=None,  # UNASSIGNED
            insurance_status="Not Started",
            missing_documents=json.dumps(["Intake Form", "Consent Form", "Insurance Card", "Guardian ID", "Referral Packet"]),
            last_contact_date=None,
            next_follow_up_date=None,   # NO FOLLOW-UP
            notes="New urgent referral from ABA provider. No contact made yet. Assign immediately.",
            created_at=dt_ago(1), updated_at=dt_ago(1),
        ),
    ]

    db.add_all(cases)
    db.commit()
    db.close()

    print("✅ ClinicFlow database seeded successfully.")
    print(f"   {len(staff_records)} staff members")
    print(f"   {len(client_records)} clients")
    print(f"   {len(cases)} intake cases")
    print()
    print("Demo highlights:")
    print("  • Jordan Lee carries ~47% of active cases (workload imbalance insight)")
    print("  • 4 cases with insurance pending")
    print("  • 5 high/urgent priority clients not contacted in 3+ days")
    print("  • 3 cases stuck (no update in 7+ days)")
    print("  • 4 overdue follow-up dates")
    print("  • 2 unassigned active cases")
    print("  • 3 cases ready to schedule")


if __name__ == "__main__":
    seed()
