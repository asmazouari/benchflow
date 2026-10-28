import os
import sys
from logging.config import fileConfig
from pathlib import Path
from dotenv import load_dotenv

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# 1. Ajout de 'backend' au PYTHONPATH pour importer app.*
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

# 2. Chargement des variables d'environnement .env
load_dotenv(dotenv_path=backend_dir / ".env")

# 3. Import des modèles SQLAlchemy et Base
from app.core.database import Base, DATABASE_URL
from app.models.collaborateur_model import CollaborateurModel
from app.models.initiative_model import InitiativeModel

# Configuration Alembic
config = context.config

# Configuration du logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Injection dynamique de la DATABASE_URL
if DATABASE_URL:
    config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Métadonnées cibles pour la commande --autogenerate
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Exécute les migrations en mode 'offline' (génération de script SQL sans connexion)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Exécute les migrations en mode 'online' (connexion directe à la base SQL)."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
