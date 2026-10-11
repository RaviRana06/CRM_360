from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Engine arguments tailored for Microsoft SQL Server pyodbc driver
engine_kwargs = {
    "pool_pre_ping": True,
    "pool_size": 10,
    "max_overflow": 20,
    "pool_recycle": 1800,
}


if "pyodbc" in settings.DATABASE_URL:
    engine_kwargs["fast_executemany"] = True

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    FastAPI dependency that provides a transactional database session per request.
    Closes session automatically after request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
