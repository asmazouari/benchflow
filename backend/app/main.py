from dotenv import load_dotenv

# Chargement explicite des variables du fichier .env
load_dotenv()

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    router_auth,
    router_collaborateurs,
    router_initiatives,
    router_ai,
)

# Initialisation de l'application FastAPI
app = FastAPI(
    title="BenchFlow API",
    description="API REST pour la gestion des staffings, l'anticipation d'inter-contrats et l'auto-staffing sur initiatives internes.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configuration du CORS (Cross-Origin Resource Sharing)
# Autorise les environnements locaux et tous les domaines de prévisualisation Vercel
cors_env = os.getenv("CORS_ORIGINS", "")
extra_origins = [o.strip() for o in cors_env.split(",") if o.strip()]

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
] + extra_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enregistrement des Routeurs sous le préfixe /api
app.include_router(router_auth, prefix="/api")
app.include_router(router_collaborateurs, prefix="/api")
app.include_router(router_initiatives, prefix="/api")
app.include_router(router_ai, prefix="/api")


@app.get("/", tags=["Health"])
def root():
    """Point d'entrée racine : vérifie que l'API est en ligne."""
    return {
        "app": "BenchFlow API",
        "status": "online",
        "version": "1.0.0",
        "documentation": "/docs",
    }


@app.get("/api/health", tags=["Health"])
def health_check():
    """Vérification de santé du système."""
    return {"status": "healthy"}
