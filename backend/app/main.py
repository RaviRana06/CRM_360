import sys
import os

# Ensure backend directory is in Python module search path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import (
    health, auth, roles, leads, opportunities,
    accounts, contacts, companies, employees,
    activities, tasks, meetings, geo, reports, audit,
    products, quotes, invoices, documents, notifications, websocket
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="CRM 360 Enterprise Customer Relationship Management System Backend API"
)

# CORS setup for frontend communication
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import threading

# Automatic Database Seeding on Server Startup (Background Non-Blocking Thread)
@app.on_event("startup")
def startup_db_event():
    def _run_seed():
        try:
            from app.seed import seed_database
            print("[Startup Background] Verifying SQL Server & tables...")
            seed_database()
            print("[Startup Background] Database ready!")
        except Exception as e:
            print(f"[Startup Background] Notice: {e}")

    threading.Thread(target=_run_seed, daemon=True).start()


# Attach routes
app.include_router(health.router, prefix=settings.API_V1_STR, tags=["Health"])
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(roles.router, prefix=f"{settings.API_V1_STR}/roles", tags=["Roles & Permissions (RBAC)"])
app.include_router(leads.router, prefix=f"{settings.API_V1_STR}/leads", tags=["Leads & Qualification"])
app.include_router(opportunities.router, prefix=f"{settings.API_V1_STR}/opportunities", tags=["Opportunity Pipeline"])
app.include_router(accounts.router, prefix=f"{settings.API_V1_STR}/accounts", tags=["Accounts & Customers"])
app.include_router(contacts.router, prefix=f"{settings.API_V1_STR}/contacts", tags=["Contacts Directory"])
app.include_router(companies.router, prefix=f"{settings.API_V1_STR}/companies", tags=["Company Master"])
app.include_router(employees.router, prefix=f"{settings.API_V1_STR}/employees", tags=["Employee Master"])
app.include_router(activities.router, prefix=f"{settings.API_V1_STR}/activities", tags=["Activities Log"])
app.include_router(tasks.router, prefix=f"{settings.API_V1_STR}/tasks", tags=["Tasks Management"])
app.include_router(meetings.router, prefix=f"{settings.API_V1_STR}/meetings", tags=["Meetings Management"])
app.include_router(geo.router, prefix=f"{settings.API_V1_STR}/geo", tags=["Geo Tracking & Check-In"])
app.include_router(products.router, prefix=f"{settings.API_V1_STR}/products", tags=["Product Catalog"])
app.include_router(quotes.router, prefix=f"{settings.API_V1_STR}/quotes", tags=["Quotations & Estimates"])
app.include_router(invoices.router, prefix=f"{settings.API_V1_STR}/invoices", tags=["Invoicing & Payments"])
app.include_router(documents.router, prefix=f"{settings.API_V1_STR}/documents", tags=["Document Management"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["Reports & Analytics"])
app.include_router(audit.router, prefix=f"{settings.API_V1_STR}/audit", tags=["Audit Trail"])
app.include_router(notifications.router, prefix=f"{settings.API_V1_STR}/notifications", tags=["Notifications & Email"])
app.include_router(websocket.router, tags=["WebSockets Real-Time"])

@app.get("/")
def root():
    return {
        "message": "Welcome to CRM 360 API",
        "version": "1.0.0",
        "docs": "/docs",
        "health_check": f"{settings.API_V1_STR}/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
