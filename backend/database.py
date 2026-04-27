"""
CarbonLens — Database Module (SQLite + SQLAlchemy)
Stores all experiment results persistently.
"""

import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DB_PATH = os.path.join(os.path.dirname(__file__), "carbonlens.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    algorithm = Column(String, nullable=False)
    input_size = Column(Integer, nullable=False)
    trial_count = Column(Integer, nullable=False)
    avg_time = Column(Float, nullable=False)         # seconds
    avg_energy = Column(Float, nullable=False)        # joules
    avg_co2 = Column(Float, nullable=False)           # micrograms
    cei_score = Column(Float, nullable=False)
    measurement_method = Column(String, nullable=False)
    trial_details = Column(Text, nullable=True)       # JSON string of individual trials


def init_db():
    """Create all tables if they don't exist."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Yield a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
