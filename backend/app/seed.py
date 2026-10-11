import sys
import os

# Ensure backend folder is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.db.session import engine, SessionLocal
from app.core.db.base import Base

from app.core.security import get_password_hash
from app.models.role import Role, Permission, RolePermission
from app.models.employee import Employee
from app.models.lead import Lead
from app.models.opportunity import Opportunity
from app.models.product import Product
from app.models.quote import Quote, QuoteItem
from app.models.invoice import Invoice, InvoiceItem
from app.models.document import Document


# Standard CRM 360 Permissions Matrix
PERMISSIONS = [
    # Leads module
    {"code": "leads:view", "name": "View Leads", "module": "leads", "action": "view", "description": "View lead records"},
    {"code": "leads:create", "name": "Create Leads", "module": "leads", "action": "create", "description": "Create new lead records"},
    {"code": "leads:edit", "name": "Edit Leads", "module": "leads", "action": "edit", "description": "Edit existing lead records"},
    {"code": "leads:delete", "name": "Delete Leads", "module": "leads", "action": "delete", "description": "Delete lead records"},
    {"code": "leads:assign", "name": "Assign Leads", "module": "leads", "action": "assign", "description": "Assign leads to employees"},
    
    # Opportunities module
    {"code": "opportunities:view", "name": "View Opportunities", "module": "opportunities", "action": "view", "description": "View sales opportunities"},
    {"code": "opportunities:create", "name": "Create Opportunities", "module": "opportunities", "action": "create", "description": "Create new opportunities"},
    {"code": "opportunities:edit", "name": "Edit Opportunities", "module": "opportunities", "action": "edit", "description": "Update opportunity stages"},
    {"code": "opportunities:delete", "name": "Delete Opportunities", "module": "opportunities", "action": "delete", "description": "Delete opportunity records"},
    
    # Customers module
    {"code": "customers:view", "name": "View Customers", "module": "customers", "action": "view", "description": "View accounts and customers"},
    {"code": "customers:create", "name": "Create Customers", "module": "customers", "action": "create", "description": "Create customer accounts"},
    {"code": "customers:edit", "name": "Edit Customers", "module": "customers", "action": "edit", "description": "Edit customer account details"},
    
    # Contacts module
    {"code": "contacts:view", "name": "View Contacts", "module": "contacts", "action": "view", "description": "View contacts"},
    {"code": "contacts:create", "name": "Create Contacts", "module": "contacts", "action": "create", "description": "Create contacts"},
    {"code": "contacts:edit", "name": "Edit Contacts", "module": "contacts", "action": "edit", "description": "Edit contacts"},
    
    # Tasks & Meetings
    {"code": "tasks:view", "name": "View Tasks", "module": "tasks", "action": "view", "description": "View tasks"},
    {"code": "tasks:create", "name": "Create Tasks", "module": "tasks", "action": "create", "description": "Create tasks"},
    {"code": "meetings:view", "name": "View Meetings", "module": "meetings", "action": "view", "description": "View meetings"},
    {"code": "meetings:create", "name": "Create Meetings", "module": "meetings", "action": "create", "description": "Schedule meetings"},
    
    # Activities & Geo-tracking
    {"code": "activities:view", "name": "View Activities", "module": "activities", "action": "view", "description": "View activity logs"},
    {"code": "activities:create", "name": "Create Activities", "module": "activities", "action": "create", "description": "Log sales activities"},
    {"code": "geo:checkin", "name": "Geo Check-In", "module": "geo_tracking", "action": "create", "description": "Perform location check-in"},
    {"code": "geo:view_all", "name": "View All Employee Locations", "module": "geo_tracking", "action": "view", "description": "View team locations"},
    
    # Roles & Admin
    {"code": "roles:view", "name": "View Roles", "module": "roles", "action": "view", "description": "View RBAC roles"},
    {"code": "roles:create", "name": "Create Roles", "module": "roles", "action": "create", "description": "Create dynamic RBAC roles"},
]

def create_database_if_not_exists():
    """
    Connects to the SQL Server master database to create 'crm360_db' if it does not exist yet.
    """
    try:
        db_url = settings.DATABASE_URL
        if "/crm360_db" in db_url:
            master_url = db_url.replace("/crm360_db", "/master")
        else:
            master_url = db_url

        print(f"Connecting to SQL Server master database to verify 'crm360_db'...")
        master_engine = create_engine(master_url, isolation_level="AUTOCOMMIT", pool_pre_ping=True)
        with master_engine.connect() as conn:
            from sqlalchemy import text
            res = conn.execute(text("SELECT name FROM sys.databases WHERE name = N'crm360_db'"))
            if not res.fetchone():
                print("Creating database 'crm360_db' on SQL Server...")
                conn.execute(text("CREATE DATABASE crm360_db"))
                print("Database 'crm360_db' created successfully!")
            else:
                print("Database 'crm360_db' already exists on SQL Server.")
        master_engine.dispose()
    except Exception as e:
        print(f"Notice: Automated database creation check result: {e}")

def seed_database():
    print("Step 1: Verifying SQL Server Database...")
    create_database_if_not_exists()

    print("Step 2: Creating SQL Server database tables if not existing...")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        print("Seeding default permissions...")
        perm_map = {}
        for p in PERMISSIONS:
            existing_p = db.query(Permission).filter(Permission.code == p["code"]).first()
            if not existing_p:
                existing_p = Permission(**p)
                db.add(existing_p)
                db.flush()
            perm_map[p["code"]] = existing_p

        db.commit()

        print("Seeding default roles...")
        roles_data = [
            {"name": "Admin", "description": "Full system administrator access", "is_system_role": True},
            {"name": "Manager", "description": "Team lead and manager access", "is_system_role": True},
            {"name": "Sales Executive", "description": "Standard sales representative access", "is_system_role": True}
        ]

        role_map = {}
        for r in roles_data:
            existing_r = db.query(Role).filter(Role.name == r["name"]).first()
            if not existing_r:
                existing_r = Role(**r)
                db.add(existing_r)
                db.flush()
            role_map[r["name"]] = existing_r

        db.commit()

        print("Assigning permissions to roles...")
        sales_exec_perms = ["leads:view", "leads:create", "leads:edit", "opportunities:view", "opportunities:create", "opportunities:edit", "customers:view", "contacts:view", "tasks:view", "tasks:create", "meetings:view", "meetings:create", "activities:view", "activities:create", "geo:checkin"]
        for p_code in sales_exec_perms:
            if p_code in perm_map:
                r_perm = db.query(RolePermission).filter_by(role_id=role_map["Sales Executive"].id, permission_id=perm_map[p_code].id).first()
                if not r_perm:
                    db.add(RolePermission(role_id=role_map["Sales Executive"].id, permission_id=perm_map[p_code].id, scope="own"))

        db.commit()

        print("Seeding initial Administrator employee user...")
        admin_email = "admin@crm360.com"
        admin_emp = db.query(Employee).filter(Employee.email == admin_email).first()
        if not admin_emp:
            admin_emp = Employee(
                employee_code="EMP001",
                first_name="System",
                last_name="Administrator",
                email=admin_email,
                phone="+1-800-555-0199",
                hashed_password=get_password_hash("Admin@123"),
                role_id=role_map["Admin"].id,
                department="Management",
                designation="CRM Administrator",
                is_active=True
            )
            db.add(admin_emp)
            db.commit()
            print(f"Success! Created Admin User:\n  Email: {admin_email}\n  Password: Admin@123\n  Employee Code: EMP001")
        else:
            admin_emp.hashed_password = get_password_hash("Admin@123")
            db.commit()

        # Seed sample products
        if db.query(Product).count() == 0:
            sample_products = [
                Product(product_code="PRD-CRM-ENT", name="CRM 360 Enterprise License", description="Annual Cloud Enterprise CRM License per user", category="Software", unit_price=1200.0, tax_rate=18.0, unit_of_measure="License"),
                Product(product_code="PRD-IMP-SVC", name="Implementation & Setup Service", description="Dedicated onboarding and SQL database migration", category="Services", unit_price=5000.0, tax_rate=18.0, unit_of_measure="Hours"),
                Product(product_code="PRD-GEO-MOD", name="Field Force Geo Tracking Module", description="Add-on real-time GPS visit check-in module", category="Software", unit_price=450.0, tax_rate=18.0, unit_of_measure="User/Year"),
                Product(product_code="PRD-SUP-247", name="24/7 Priority SLA Support", description="Dedicated Account Manager & 1hr SLA response", category="Consulting", unit_price=3000.0, tax_rate=18.0, unit_of_measure="Year")
            ]
            db.add_all(sample_products)
            db.commit()
            print("Seeded sample products successfully!")

        # Seed sample leads & opportunities if empty
        if db.query(Lead).count() == 0:
            sample_leads = [
                Lead(
                    lead_name="Enterprise CRM Migration",
                    company_name="Apex Logistics Ltd",
                    contact_name="Robert Smith",
                    email="robert@apexlogistics.com",
                    phone="+1-555-0188",
                    lead_source="Website",
                    status="New",
                    estimated_budget=75000.0,
                    requirement="Looking for cloud-based sales tracking & SQL Server backend.",
                    assigned_to_id=admin_emp.id,
                    created_by_id=admin_emp.id
                ),
                Lead(
                    lead_name="Field Team Geo Tracking Setup",
                    company_name="Global Energy Solutions",
                    contact_name="Sarah Jenkins",
                    email="s.jenkins@globalenergy.com",
                    phone="+1-555-0192",
                    lead_source="Referral",
                    status="Contacted",
                    estimated_budget=45000.0,
                    requirement="Needs OpenStreetMap live check-in and visit reporting.",
                    assigned_to_id=admin_emp.id,
                    created_by_id=admin_emp.id
                )
            ]
            db.add_all(sample_leads)
            db.commit()

        if db.query(Opportunity).count() == 0:
            sample_opps = [
                Opportunity(
                    opportunity_name="Enterprise Cloud License Deal",
                    customer_name="Apex Logistics Ltd",
                    contact_name="Robert Smith",
                    contact_email="robert@apexlogistics.com",
                    expected_value=120000.0,
                    probability=75,
                    stage="Proposal",
                    assigned_to_id=admin_emp.id,
                    created_by_id=admin_emp.id
                )
            ]
            db.add_all(sample_opps)
            db.commit()

        # Seed sample quotes
        if db.query(Quote).count() == 0:
            sample_quote = Quote(
                quote_number="QT-2026-001",
                status="Sent",
                subtotal=11400.0,
                tax_amount=2052.0,
                total_amount=13452.0,
                notes="Standard commercial terms apply. Valid for 30 days.",
                created_by_id=admin_emp.id
            )
            db.add(sample_quote)
            db.commit()

            db.add_all([
                QuoteItem(quote_id=sample_quote.id, product_name="CRM 360 Enterprise License", quantity=7, unit_price=1200.0, total_price=8400.0),
                QuoteItem(quote_id=sample_quote.id, product_name="Priority SLA Support", quantity=1, unit_price=3000.0, total_price=3000.0)
            ])
            db.commit()
            print("Seeded sample quotes successfully!")

        print("\nDatabase seeding completed successfully!")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
