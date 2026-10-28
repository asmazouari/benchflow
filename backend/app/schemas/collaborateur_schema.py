from typing import Literal
from pydantic import BaseModel, Field, ConfigDict
from pydantic.alias_generators import to_camel

# Types stricts (identiques à TypeScript côté Frontend)
Metier = Literal['Dev', 'QA', 'PO', 'DevOps', 'Tous']
StatutAlerte = Literal['stable', 'urgent', 'intermission']
Role = Literal['collaborateur', 'manager']


class CollaborateurBase(BaseModel):
    """
    Champs communs d'un collaborateur.
    """
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    nom: str = Field(..., description="Nom complet du collaborateur")
    email: str = Field(..., description="Email professionnel unique")
    metier: Metier = Field(..., description="Rôle métier (Dev, QA, PO, DevOps)")
    date_fin_staffing: str = Field(..., description="Date de fin de mission au format YYYY-MM-DD")
    client_actuel: str | None = Field(default=None, description="Nom du client ou de la mission actuelle")
    role: Role = Field(default='collaborateur', description="Rôle d'accès : collaborateur ou manager")


class CollaborateurCreate(CollaborateurBase):
    """
    Schéma utilisé lorsque le Manager ajoute un nouveau collaborateur.
    """
    pass


class CollaborateurUpdate(BaseModel):
    """
    Schéma utilisé pour la mise à jour d'un collaborateur par le Manager.
    Tous les champs sont optionnels pour permettre des mises à jour partielles.
    """
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    nom: str | None = Field(default=None, description="Nom complet du collaborateur")
    email: str | None = Field(default=None, description="Email professionnel unique")
    metier: Metier | None = Field(default=None, description="Rôle métier (Dev, QA, PO, DevOps)")
    date_fin_staffing: str | None = Field(default=None, description="Date de fin de mission au format YYYY-MM-DD")
    client_actuel: str | None = Field(default=None, description="Nom du client ou de la mission actuelle")
    role: Role | None = Field(default=None, description="Rôle d'accès : collaborateur ou manager")


class CollaborateurResponse(CollaborateurBase):
    """
    Schéma renvoyé au Frontend, incluant les champs calculés par le serveur.
    """
    id: int = Field(..., description="Identifiant unique")
    jours_restants: int = Field(..., description="Calculé automatiquement : date_fin - aujourd'hui")
    statut_alerte: StatutAlerte = Field(..., description="Calculé automatiquement : stable, urgent, intermission")
    initiative_active_id: int | None = Field(default=None, description="ID de l'initiative en cours si staffé")


class RadarSummary(BaseModel):
    """
    Résumé synthétique affiché en haut du Radar des Staffings.
    """
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    stables: int = Field(..., description="Nombre de missions stables (> 30 jours)")
    urgents: int = Field(..., description="Nombre de fins imminentes (< 15 jours)")
    intermissions: int = Field(..., description="Nombre de collaborateurs en inter-projet")
    total: int = Field(..., description="Nombre total de collaborateurs suivis")
    collaborateurs: list[CollaborateurResponse] = Field(default_factory=list, description="Liste détaillée pour le tableau")
