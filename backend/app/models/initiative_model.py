from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Text
from app.core.database import Base


class InitiativeModel(Base):
    """
    Modèle SQLAlchemy pour la table 'initiatives'.
    Représente les projets internes, certifications et PoC de la réserve.
    """
    __tablename__ = "initiatives"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    titre = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    metier = Column(String(50), nullable=False)
    duree = Column(String(50), nullable=False)
    statut = Column(String(50), default="DISPONIBLE", nullable=False)
    origine = Column(String(50), default="manager", nullable=False)
    auteur_nom = Column(String(100), nullable=False)
    assigne_nom = Column(String(100), nullable=True)
    date_creation = Column(String(20), nullable=False)
    livrable_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<Initiative(id={self.id}, titre='{self.titre}', statut='{self.statut}')>"
