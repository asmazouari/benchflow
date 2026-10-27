from typing import Literal
from pydantic import BaseModel, Field, ConfigDict
from pydantic.alias_generators import to_camel
from app.schemas.collaborateur_schema import Metier
from app.schemas.initiative_schema import Duree


class AiSuggestionRequest(BaseModel):
    """
    Données envoyées par l'utilisateur pour demander des suggestions d'initiatives à l'IA.
    """
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    metier: Metier = Field(
        default="Dev",
        description="Métier cible pour lequel générer des initiatives (Dev, QA, PO, DevOps, Tous)"
    )
    contexte: str | None = Field(
        default=None,
        description="Contexte optionnel ou technologie souhaitée (ex: Docker, React, Tests E2E)"
    )


class AiInitiativeProposal(BaseModel):
    """
    Une proposition d'initiative générée par l'IA.
    """
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    titre: str = Field(..., description="Titre percutant du projet interne")
    description: str = Field(..., description="Objectifs et contexte en 2 à 3 phrases claires")
    metier: Metier = Field(..., description="Métier concerné")
    duree: Duree = Field(..., description="Durée estimée : Flash (<3j), Sprint (1-2s), Fond (>2s)")
    livrable_attendu: str = Field(
        ...,
        description="Exemple de livrable final (ex: Dépôt GitHub, Guide Notion, Suite de tests)"
    )


class AiSuggestionResponse(BaseModel):
    """
    Réponse complète retournée par l'endpoint d'assistance IA.
    """
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    metier: Metier
    source: Literal["ollama_local", "cloud_resilient"] = Field(
        ...,
        description="Indique si la réponse provient du modèle Ollama local ou du moteur de secours"
    )
    suggestions: list[AiInitiativeProposal]
