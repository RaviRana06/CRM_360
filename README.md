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
10. **Database Setup:** SQLAlchemy creates the application tables during backend startup.
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
1. Make sure SQL Server is running and the configured account can connect to it.
2. The backend attempts to create database `crm360_db` at startup. If that account does not have permission to create databases, create it manually in SSMS or SQLCMD:
   ```sql
   CREATE DATABASE crm360_db;
   ```
3. Update `backend/.env` with your SQL Server connection details:
   - For SQL Server Authentication:
     `DATABASE_URL=mssql+pyodbc://sa:YourPassword123!@localhost:1433/crm360_db?driver=ODBC+Driver+17+for+SQL+Server`
   - For Windows Authentication (SQLEXPRESS):
     `DATABASE_URL=mssql+pyodbc://@localhost\SQLEXPRESS/crm360_db?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes`

The configured SQL Server account needs permission to create the database if you rely on automatic creation. The backend also creates missing application tables during startup.

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

**Database schema note:**
The current Alembic initial migration is empty and does not create tables. On backend startup, `seed_database()` creates any missing tables from the SQLAlchemy models and seeds the default roles and permissions. Do not rely on `alembic upgrade head` to initialize the schema until real migration operations have been added.

---

### 3. Frontend Setup & Startup
Open a second terminal and navigate to the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```
- Open `http://localhost:5173` in your browser.

# CRM_360
CRM 360 is a full-stack Customer Relationship Management system built with React.js, FastAPI, and Microsoft SQL Server. It provides lead and customer management, employee tracking, task management, interactive dashboards, JWT authentication, Role-Based Access Control (RBAC), and location tracking using Leaflet and OpenStreetMap.
