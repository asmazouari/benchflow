from typing import Literal
from pydantic import BaseModel, Field, ConfigDict
from pydantic.alias_generators import to_camel

# Types stricts (identiques à TypeScript côté Frontend)
Duree = Literal['Flash', 'Sprint', 'Fond']
StatutInitiative = Literal['DISPONIBLE', 'A_VALIDER', 'EN_COURS', 'TERMINE', 'REFUSE']
Origine = Literal['manager', 'collaborateur']
Metier = Literal['Dev', 'QA', 'PO', 'DevOps', 'Tous']


class InitiativeBase(BaseModel):
    """
    Champs de base décrivant une initiative interne.
    """
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    titre: str = Field(..., description="Titre clair et concis de l'initiative")
    description: str = Field(..., description="Objectifs et livrables attendus")
    metier: Metier = Field(default='Tous', description="Métier concerné (Dev, QA, PO, DevOps ou Tous)")
    duree: Duree = Field(default='Sprint', description="Format d'effort : Flash (<3j), Sprint (1-2s), Fond (>2s)")


class InitiativeCreate(InitiativeBase):
    """
    Schéma pour proposer ou déposer une initiative.
    """
    auteur_nom: str = Field(..., description="Nom de l'auteur (Manager ou Collaborateur)")
    assigne_nom: str | None = Field(default=None, description="Nom du collaborateur si auto-proposé")


class TakeInitiativeRequest(BaseModel):
    """
    Schéma pour l'action 1-clic : un consultant s'auto-staffe sur une initiative.
    """
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    user_nom: str = Field(..., description="Nom du collaborateur qui prend le sujet")


class InitiativeComplete(BaseModel):
    """
    Schéma pour clôturer un projet avec le lien du livrable.
    """
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    livrable_url: str = Field(..., description="URL du livrable : dépôt GitHub, doc Notion ou certification")


class InitiativeResponse(InitiativeBase):
    """
    Schéma complet d'une initiative renvoyé par l'API.
    """
    id: int = Field(..., description="Identifiant unique")
    statut: StatutInitiative = Field(..., description="Statut du cycle de vie")
    origine: Origine = Field(..., description="Qui a créé : manager (pré-validé) ou collaborateur")
    auteur_nom: str = Field(..., description="Auteur du sujet")
    assigne_nom: str | None = Field(default=None, description="Collaborateur qui travaille actuellement dessus")
    date_creation: str = Field(..., description="Date de création au format YYYY-MM-DD")
    livrable_url: str | None = Field(default=None, description="URL finale une fois le projet terminé")
