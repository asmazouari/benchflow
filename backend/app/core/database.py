import os
from pathlib import Path
from dotenv import load_dotenv

# Charge les variables de configuration depuis backend/.env
ENV_FILE = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=ENV_FILE)

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Résolution automatique du chemin si base SQLite locale
DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_DB_FILE = DATA_DIR / "benchflow.db"
DEFAULT_DB_URL = f"sqlite:///{DEFAULT_DB_FILE.as_posix()}"

DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DB_URL)

# Si l'URL dans .env est relative style sqlite:///./data/benchflow.db, on s'assure qu'elle pointe bien vers DATA_DIR
if DATABASE_URL.startswith("sqlite:///./data/"):
    DATABASE_URL = DEFAULT_DB_URL

# Normalisation pour SQLAlchemy 2.0 (Render et Neon fournissent postgres:// au lieu de postgresql://)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Configuration de l'Engine
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Générateur de session de base de données pour injection de dépendance."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
