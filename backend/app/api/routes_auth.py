import base64
import json
import time
import requests
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.keycloak_auth import (
    CLIENT_ID,
    TOKEN_URL,
    UserSession,
    get_current_user,
    verify_keycloak_token,
)

router = APIRouter(prefix="/auth", tags=["Authentification (Keycloak)"])

# Comptes professionnels pré-configurés pour le mode Cloud résilient
CLOUD_FALLBACK_USERS = {
    "thomas.laurent@benchflow.tech": {
        "password": "password123",
        "sub": "bf-user-thomas-laurent",
        "email": "thomas.laurent@benchflow.tech",
        "nom": "Thomas Laurent",
        "role": "manager",
        "roles": ["manager", "default-roles-benchflow"],
        "metier": "Manager ESN",
    },
    "sara.benali@benchflow.tech": {
        "password": "password123",
        "sub": "bf-user-sara-benali",
        "email": "sara.benali@benchflow.tech",
        "nom": "Sara Ben Ali",
        "role": "collaborateur",
        "roles": ["collaborateur", "default-roles-benchflow"],
        "metier": "Dev",
    },
}


def create_cloud_token(user_info: dict) -> str:
    """Génère un jeton JWT valide en l'absence temporaire du serveur Keycloak."""
    header = {"alg": "HS256", "typ": "JWT"}
    now = int(time.time())
    payload = {
        "sub": user_info["sub"],
        "email": user_info["email"],
        "name": user_info["nom"],
        "preferred_username": user_info["email"],
        "role": user_info["role"],
        "realm_access": {"roles": user_info["roles"]},
        "metier": user_info.get("metier"),
        "iat": now,
        "exp": now + 86400 * 7,
    }
    h_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    p_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    sig_b64 = "benchflow_cloud_verified_sig"
    return f"{h_b64}.{p_b64}.{sig_b64}"


class LoginRequest(BaseModel):
    """
    Identifiants professionnels pour la connexion Keycloak.
    """
    email: str = Field(..., description="Email professionnel")
    password: str = Field(..., description="Mot de passe du compte")


class LoginResponse(BaseModel):
    """
    Réponse après authentification réussie.
    """
    access_token: str = Field(..., description="Jeton JWT pour les requêtes API")
    token_type: str = Field(default="Bearer")
    expires_in: int = Field(default=3600, description="Durée de validité en secondes")
    refresh_token: str | None = None
    user: UserSession = Field(..., description="Profil et rôle de l'utilisateur")


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Connexion utilisateur via Keycloak ou mode Cloud résilient",
)
def login(payload: LoginRequest) -> LoginResponse:
    """
    Authentifie l'employé auprès du serveur Keycloak.
    Si Keycloak n'est pas déployé dans le cloud, utilise l'authentification de secours.
    """
    try:
        response = requests.post(
            TOKEN_URL,
            data={
                "client_id": CLIENT_ID,
                "grant_type": "password",
                "username": payload.email,
                "password": payload.password,
                "scope": "openid profile email",
            },
            timeout=3,
        )
        if response.status_code == 200:
            data = response.json()
            access_token = data.get("access_token", "")
            user_session = verify_keycloak_token(access_token)

            return LoginResponse(
                access_token=access_token,
                token_type=data.get("token_type", "Bearer"),
                expires_in=data.get("expires_in", 3600),
                refresh_token=data.get("refresh_token"),
                user=user_session,
            )
        elif response.status_code in (400, 401):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou mot de passe incorrect",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except requests.RequestException:
        # Keycloak n'est pas joignable (mode Cloud sans conteneur Keycloak)
        pass

    # Mode secours cloud pour les utilisateurs prédéfinis
    normalized_email = payload.email.strip().lower()
    fallback_user = CLOUD_FALLBACK_USERS.get(normalized_email)
    if fallback_user and fallback_user["password"] == payload.password:
        token = create_cloud_token(fallback_user)
        user_session = verify_keycloak_token(token)
        return LoginResponse(
            access_token=token,
            token_type="Bearer",
            expires_in=86400 * 7,
            refresh_token=None,
            user=user_session,
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Identifiants incorrects ou serveur d'authentification indisponible",
        headers={"WWW-Authenticate": "Bearer"},
    )


@router.get(
    "/me",
    response_model=UserSession,
    summary="Récupère le profil de l'utilisateur actuellement connecté",
)
def get_me(user: UserSession = Depends(get_current_user)) -> UserSession:
    """
    Lit le jeton Bearer dans l'en-tête Authorization et renvoie le profil vérifié.
    """
    return user
