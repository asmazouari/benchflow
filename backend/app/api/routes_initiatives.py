from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.keycloak_auth import UserSession, get_current_user, require_manager
from app.schemas.initiative_schema import (
    InitiativeComplete,
    InitiativeCreate,
    InitiativeResponse,
    TakeInitiativeRequest,
)
from app.services.storage_service import storage_service

router = APIRouter(prefix="/initiatives", tags=["Initiatives"])


@router.get(
    "",
    response_model=list[InitiativeResponse],
    summary="Liste les initiatives avec filtres optionnels",
)
def list_initiatives(
    metier: str | None = Query(default=None, description="Filtrer par métier (Dev, QA, PO, DevOps, Tous)"),
    duree: str | None = Query(default=None, description="Filtrer par durée (Flash, Sprint, Fond)"),
    statut: str | None = Query(default=None, description="Filtrer par statut (DISPONIBLE, A_VALIDER, EN_COURS, TERMINE)"),
    user: UserSession = Depends(get_current_user),
) -> list[InitiativeResponse]:
    """
    Récupère le catalogue d'initiatives selon les filtres choisis.
    Accessible à tout employé authentifié.
    """
    return storage_service.get_initiatives(metier=metier, duree=duree, statut=statut)


@router.post(
    "",
    response_model=InitiativeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Proposer ou publier une nouvelle initiative",
)
def create_initiative(
    initiative: InitiativeCreate,
    is_manager: bool = Query(default=False, description="True si créé par un manager (accès direct au catalogue)"),
    user: UserSession = Depends(get_current_user),
) -> InitiativeResponse:
    """
    Crée une initiative :
    - Si l'utilisateur est authentifié en tant que Manager -> Statut 'DISPONIBLE' immédiat dans le catalogue.
    - Si l'utilisateur est Collaborateur -> Statut 'A_VALIDER' forcé (impossibilité d'usurper le statut pré-validé).
    """
    effective_is_manager = (user.role == "manager") and is_manager
    return storage_service.create_initiative(initiative, is_manager=effective_is_manager)


@router.post(
    "/{initiative_id}/take",
    response_model=InitiativeResponse,
    summary="Action 1-clic : s'auto-staffer sur une initiative",
)
def take_initiative(
    initiative_id: int,
    payload: TakeInitiativeRequest,
    user: UserSession = Depends(get_current_user),
) -> InitiativeResponse:
    """
    Un consultant en inter-projet s'assigne directement un sujet sans intermédiaire.
    Passe le statut en 'EN_COURS' et lie l'initiative au collaborateur.
    """
    try:
        user_nom = payload.user_nom or user.nom
        return storage_service.take_initiative(initiative_id, user_nom)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "/{initiative_id}/validate",
    response_model=InitiativeResponse,
    summary="Action Manager : Valider une initiative bottom-up",
)
def validate_initiative(
    initiative_id: int,
    manager: UserSession = Depends(require_manager),
) -> InitiativeResponse:
    """
    Le manager approuve une idée proposée par un consultant.
    Verrouillage RBAC : Strictement réservé au rôle 'manager' (HTTP 403 Forbidden sinon).
    """
    try:
        return storage_service.validate_initiative(initiative_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "/{initiative_id}/reject",
    response_model=InitiativeResponse,
    summary="Action Manager : Refuser une initiative",
)
def reject_initiative(
    initiative_id: int,
    manager: UserSession = Depends(require_manager),
) -> InitiativeResponse:
    """
    Le manager refuse une initiative proposée.
    Verrouillage RBAC : Strictement réservé au rôle 'manager' (HTTP 403 Forbidden sinon).
    """
    try:
        return storage_service.reject_initiative(initiative_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "/{initiative_id}/complete",
    response_model=InitiativeResponse,
    summary="Clôturer une initiative avec lien du livrable",
)
def complete_initiative(
    initiative_id: int,
    payload: InitiativeComplete,
    user: UserSession = Depends(get_current_user),
) -> InitiativeResponse:
    """
    Le consultant termine le projet et fournit l'URL du livrable
    (dépôt GitHub, documentation Notion, lien de certification).
    """
    try:
        return storage_service.complete_initiative(initiative_id, payload.livrable_url)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
