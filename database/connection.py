"""Database Connection Management"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv
from typing import Generator
import os

# Load environment variables from .env file
load_dotenv()

# Database configuration — reads from DATABASE_URL env var
# Fallback matches the default credentials in .env.example
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://crm_user:crm_password@localhost:5432/ai_crm"
)

# Create engine
engine = create_engine(
    DATABASE_URL, poolclass=NullPool, echo=False  # Set to True for SQL logging
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency to get database session
    Usage: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
