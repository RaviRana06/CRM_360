# CRM 360 — Enterprise Customer Relationship Management System

## Project Overview
CRM 360 is a full-featured Customer Relationship Management web application built with:
- **Backend:** Python FastAPI + SQLAlchemy + Microsoft SQL Server
- **Frontend:** React JS + Vite + Vanilla CSS
- **Authentication:** JWT + Secure Password Hashing (bcrypt)
- **Authorization:** Dynamic Role-Based Access Control (RBAC)
- **Maps & Location:** Leaflet + OpenStreetMap + Real-time WebSockets
- **Email & Alerts:** SMTP Notification Dispatch Service
- **Testing:** Pytest Automated Test Suite
- **Deployment:** Docker & Docker Compose

---

## 🌟 Modules & Features Completed

1. **Leads & Qualification:** Enquiry intake, qualification workflow, auto-conversion to Deals.
2. **Opportunity Pipeline:** Visual Kanban stages, deal value, probability calculation.
3. **Products & Pricebook Catalog:** Catalog items, SKUs, unit prices, UOM, tax configurations.
4. **Quotations & Proposals:** Multi-item proposal builder, 18% tax calculation, printable view, one-click convert to Invoice.
5. **Invoices & Billing:** Balance dues, status tracking (`Issued`, `Paid`, `Partially Paid`), payment recording modal.
6. **Document Vault:** FastAPI `UploadFile` attachment storage, entity linking, file downloading.
7. **Interactive Visual Charts:** Vector SVG BarChart and DonutChart for deal pipelines and lead breakdowns.
8. **Toast Notifications:** Global non-blocking success/error toast alerts.
9. **Field Force Geo-Tracking:** Browser Geolocation + OpenStreetMap Leaflet Map + Real-time WebSocket broadcasting (`/ws/geo`).
10. **Alembic Database Migrations:** Versioned SQL Server schema migrations.
11. **Automated Testing Suite:** Pytest tests for API health, products, and quote math.

---

## Quick Start (Docker Option)

Run the entire stack (SQL Server + FastAPI + React Frontend) with one command:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API Docs: `http://localhost:8000/docs`

---

## Manual Setup Instructions

### Run both servers from the project root (Windows)
After installing backend and frontend dependencies once, run:
```powershell
npm run dev
```

This starts the backend at `http://localhost:8000` and the frontend at
`http://localhost:5173`. Press `Ctrl+C` to stop both. The backend also requires
the configured Microsoft SQL Server database to be running.

### 1. Database Configuration (Microsoft SQL Server)
1. Open SQL Server Management Studio (SSMS) or SQLCMD.
2. Create database `crm360_db`:
   ```sql
   CREATE DATABASE crm360_db;
   ```
3. Update `backend/.env` with your SQL Server connection details:
   - For SQL Server Authentication:
     `DATABASE_URL=mssql+pyodbc://sa:YourPassword123!@localhost:1433/crm360_db?driver=ODBC+Driver+17+for+SQL+Server`
   - For Windows Authentication (SQLEXPRESS):
     `DATABASE_URL=mssql+pyodbc://@localhost\SQLEXPRESS/crm360_db?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes`

---

### 2. Backend Setup & Startup
Navigate to the `backend` folder:
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- Interactive API Docs: `http://localhost:8000/docs`
- Health Check Endpoint: `http://localhost:8000/api/v1/health`

**Run Automated Tests:**
```bash
pytest tests/
```

**Run Database Migrations (Alembic):**
```bash
alembic upgrade head
```

---

### 3. Frontend Setup & Startup
Open a second terminal and navigate to the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```
- Open `http://localhost:5173` in your browser.
