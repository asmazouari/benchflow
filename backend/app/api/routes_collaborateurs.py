from fastapi import APIRouter, Depends, HTTPException, status
from app.core.keycloak_auth import UserSession, get_current_user, require_manager
from app.schemas.collaborateur_schema import (
    CollaborateurCreate,
    CollaborateurResponse,
    CollaborateurUpdate,
    RadarSummary,
)
from app.services.storage_service import storage_service

router = APIRouter(prefix="/collaborateurs", tags=["Collaborateurs"])


@router.get(
    "/radar",
    response_model=RadarSummary,
    summary="Récupère la vue synthétique Radar et la liste des collaborateurs",
)
def get_radar(user: UserSession = Depends(get_current_user)) -> RadarSummary:
    """
    Retourne le récapitulatif des 3 indicateurs clés (Stables, Urgents, Intermissions)
    ainsi que la liste complète des collaborateurs avec leurs alertes calculées en temps réel.
    Accessible à tout employé authentifié.
    """
    return storage_service.get_radar_summary()


@router.get(
    "",
    response_model=list[CollaborateurResponse],
    summary="Liste tous les collaborateurs",
)
def list_collaborateurs(user: UserSession = Depends(get_current_user)) -> list[CollaborateurResponse]:
    """
    Retourne la liste de tous les collaborateurs avec leurs dates et alertes.
    Accessible à tout employé authentifié.
    """
    return storage_service.get_collaborateurs()


@router.post(
    "",
    response_model=CollaborateurResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ajoute un nouveau collaborateur au Radar (Manager uniquement)",
)
def create_collaborateur(
    collab: CollaborateurCreate,
    manager: UserSession = Depends(require_manager),
) -> CollaborateurResponse:
    """
    Enregistre un nouveau collaborateur et calcule immédiatement son statut d'alerte.
    Verrouillage RBAC : Strictement réservé au rôle 'manager' (HTTP 403 Forbidden sinon).
    """
    return storage_service.create_collaborateur(collab)


@router.put(
    "/{collaborateur_id}",
    response_model=CollaborateurResponse,
    summary="Met à jour un collaborateur existant (Manager uniquement)",
)
def update_collaborateur(
    collaborateur_id: int,
    collab: CollaborateurUpdate,
    manager: UserSession = Depends(require_manager),
) -> CollaborateurResponse:
    """
    Met à jour les informations d'un collaborateur (métier, client, date de fin).
    Recalcule immédiatement le statut d'alerte et les jours restants.
    Verrouillage RBAC : Strictement réservé au rôle 'manager' (HTTP 403 Forbidden sinon).
    """
    try:
        return storage_service.update_collaborateur(collaborateur_id, collab)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
