import pytest
import os
import sys

# Ensure backend folder is in sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.db.base import Base
from app.core.db.session import get_db
from app.api.deps import get_current_user
from app.models.employee import Employee
from app.models.role import Role

# Use in-memory SQLite database for isolated automated testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def test_employee(db_session):
    role = db_session.query(Role).filter_by(name="Admin").first()
    if not role:
        role = Role(name="Admin", description="Admin role", is_system_role=True)
        db_session.add(role)
        db_session.commit()
        db_session.refresh(role)

    emp = db_session.query(Employee).filter_by(email="tester@crm360.com").first()
    if not emp:
        emp = Employee(
            employee_code="TEST001",
            first_name="Test",
            last_name="User",
            email="tester@crm360.com",
            hashed_password="hashed_pw_test",
            role_id=role.id,
            department="QA",
            designation="Tester",
            is_active=True
        )
        db_session.add(emp)
        db_session.commit()
        db_session.refresh(emp)
    return emp

@pytest.fixture
def client(db_session, test_employee):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    def override_get_current_user():
        return test_employee

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
