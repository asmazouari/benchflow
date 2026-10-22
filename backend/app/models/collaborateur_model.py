from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from app.core.database import Base


class CollaborateurModel(Base):
    """
    Modèle SQLAlchemy pour la table 'collaborateurs'.
    Représente chaque consultant ou manager au sein de l'ESN.
    """
    __tablename__ = "collaborateurs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nom = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    metier = Column(String(50), nullable=False)
    date_fin_staffing = Column(String(20), nullable=False)
    role = Column(String(50), default="collaborateur", nullable=False)
    client_actuel = Column(String(200), nullable=True)
    initiative_active_id = Column(Integer, ForeignKey("initiatives.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<Collaborateur(id={self.id}, nom='{self.nom}', role='{self.role}')>"
