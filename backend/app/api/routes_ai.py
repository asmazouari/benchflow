from fastapi import APIRouter, Depends

from app.core.keycloak_auth import UserSession, get_current_user
from app.schemas.ai_schema import AiSuggestionRequest, AiSuggestionResponse
from app.services.ollama_service import ollama_service

router = APIRouter(prefix="/ai", tags=["Assistant IA (Ollama)"])


@router.post(
    "/suggest",
    response_model=AiSuggestionResponse,
    summary="Génère des suggestions d'initiatives intelligentes avec l'IA",
)
def suggest_initiatives(
    payload: AiSuggestionRequest,
    user: UserSession = Depends(get_current_user),
) -> AiSuggestionResponse:
    """
    Génère 2 propositions concrètes d'initiatives adaptées au métier cible
    (Dev, QA, PO, DevOps, Tous) avec titre, description, durée et livrable.
    Accessible à tout collaborateur ou manager authentifié.
    """
    return ollama_service.generate_initiatives(
        metier=payload.metier,
        contexte=payload.contexte,
    )
