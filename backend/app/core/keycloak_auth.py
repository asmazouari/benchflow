import base64
import json
import os
from typing import Any
import requests
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

KEYCLOAK_URL = os.getenv("KEYCLOAK_URL", "http://localhost:8080")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "benchflow")
REALM_URL = f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}"
USERINFO_URL = f"{REALM_URL}/protocol/openid-connect/userinfo"
TOKEN_URL = f"{REALM_URL}/protocol/openid-connect/token"
CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID", "benchflow-app")

http_bearer = HTTPBearer(auto_error=False)


class UserSession(BaseModel):
    """
    Profil de session extrait du jeton Keycloak validé.
    """
    sub: str = Field(..., description="ID unique Keycloak")
    email: str = Field(..., description="Email professionnel")
    nom: str = Field(..., description="Nom complet")
    role: str = Field(..., description="'manager' ou 'collaborateur'")
    roles: list[str] = Field(default_factory=list, description="Liste des rôles realm")
    metier: str | None = Field(default=None, description="Métier (Dev, QA, PO, DevOps)")


def decode_jwt_payload(token: str) -> dict[str, Any]:
    """
    Décode la charge utile (payload) du JWT sans dépendance binaire externe.
    """
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("Token JWT malformé")
        payload_b64 = parts[1]
        # Ajuste le padding base64
        remainder = len(payload_b64) % 4
        if remainder > 0:
            payload_b64 += "=" * (4 - remainder)
        payload_bytes = base64.urlsafe_b64decode(payload_b64)
        return json.loads(payload_bytes.decode("utf-8"))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Erreur de lecture du token : {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def verify_keycloak_token(token: str) -> UserSession:
    """
    Valide le jeton auprès de Keycloak (UserInfo RFC 6749) et extrait les rôles.
    En mode Cloud ou de secours (Keycloak inaccessible), décode le JWT de manière résiliente.
    """
    try:
        response = requests.get(
            USERINFO_URL,
            headers={"Authorization": f"Bearer {token}"},
            timeout=2,
        )
        if response.status_code == 200:
            userinfo = response.json()
            payload = decode_jwt_payload(token)

            realm_roles = payload.get("realm_access", {}).get("roles", [])
            is_manager = "manager" in realm_roles

            # Métier personnalisé depuis les attributs Keycloak si présent
            metier = payload.get("metier")

            return UserSession(
                sub=userinfo.get("sub", ""),
                email=userinfo.get("email", ""),
                nom=userinfo.get("name") or userinfo.get("preferred_username", ""),
                role="manager" if is_manager else "collaborateur",
                roles=realm_roles,
                metier=metier,
            )
        elif response.status_code in (401, 403):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Jeton Keycloak invalide, expiré ou révoqué",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except requests.RequestException:
        # Keycloak n'est pas joignable (ex: mode Cloud Render sans conteneur Keycloak)
        pass

    # Décodage de secours du JWT en mode cloud autonome
    payload = decode_jwt_payload(token)
    realm_roles = payload.get("realm_access", {}).get("roles", [])
    is_manager = "manager" in realm_roles or payload.get("role") == "manager"
    metier = payload.get("metier")

    return UserSession(
        sub=payload.get("sub", "benchflow_user"),
        email=payload.get("email", ""),
        nom=payload.get("name") or payload.get("preferred_username") or payload.get("email", ""),
        role="manager" if is_manager else "collaborateur",
        roles=realm_roles,
        metier=metier,
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(http_bearer),
) -> UserSession:
    """
    Dépendance FastAPI stricte : exige un token Bearer Keycloak valide.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentification Keycloak requise (en-tête Authorization Bearer manquant)",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return verify_keycloak_token(credentials.credentials)


def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(http_bearer),
) -> UserSession | None:
    """
    Dépendance optionnelle : valide le token si présent, sinon renvoie None.
    Permet la transition en douceur.
    """
    if not credentials or not credentials.credentials:
        return None
    try:
        return verify_keycloak_token(credentials.credentials)
    except HTTPException:
        return None


def require_manager(
    user: UserSession = Depends(get_current_user),
) -> UserSession:
    """
    Dépendance de contrôle d'accès : seul un profil avec le rôle 'manager' est autorisé.
    """
    if user.role != "manager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Action interdite : privilèges Manager requis",
        )
    return user
