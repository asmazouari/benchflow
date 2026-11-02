# BenchFlow 🚀

Plateforme B2B moderne d'anticipation et de valorisation des inter-projets pour les Entreprises de Services du Numérique (ESN).

## 🛠️ Stack Technique

- **Frontend :** Next.js 16 (React 19, Turbopack, App Router, TypeScript, Tailwind CSS v4, Lucide Icons, Atomic Design, Custom Hooks)
- **Backend :** FastAPI (Python 3), SQLAlchemy, Alembic, Pydantic v2
- **Authentification & Sécurité :** Keycloak (OAuth2 / OpenID Connect / JWT, rôles RBAC Manager & Collaborateur)
- **Base de données :** PostgreSQL
- **Stockage de documents :** MinIO (S3-compatible Object Storage)
- **Intelligence Artificielle :** Ollama (`llama3.2` local pour la génération d'initiatives contextuelles)
- **Design System :** Google Stitch & Atomic Design (Atomes, Molécules, Organismes, Templates, Pages)
- **Qualité de code :** SonarLint / SonarQube Quality Gate A / ESLint 9

## 📁 Architecture du Projet

```text
benchFlow/
├── backend/          # API REST FastAPI & Services (PostgreSQL, MinIO, Keycloak, Ollama)
│   ├── alembic/      # Migrations de base de données
│   ├── app/
│   │   ├── api/      # Endpoints HTTP (/auth, /collaborateurs, /initiatives, /ai)
│   │   ├── core/     # Configuration & variables d'environnement (.env)
│   │   ├── models/   # Entités SQLAlchemy
│   │   ├── schemas/  # Schémas Pydantic (validation stricte)
│   │   └── services/ # Services métier (Database, MinIO, Ollama)
│   ├── .env          # Variables d'environnement
│   ├── alembic.ini   # Configuration Alembic
│   └── requirements.txt
│
├── frontend/         # Application Web Next.js
│   ├── public/       # Fichiers statiques et assets
│   ├── src/          # 100% Code Applicatif
│   │   ├── app/      # Layout, routing & Page orchestrateur (Niveau 5)
│   │   ├── components/ # Atomic Design pur (atoms, molecules, organisms, templates)
│   │   ├── hooks/    # Custom React hooks (useAuthSession, useBenchFlowData)
│   │   ├── lib/      # Client API, constantes, utilitaires
│   │   └── types/    # Typage TypeScript strict par domaine
│   ├── package.json
│   └── tsconfig.json # Aliases de chemins "@/*" -> ["./src/*"]
│
├── docs/             # Spécifications, maquettes Stitch et documentation
├── docker-compose.yml# Orchestration des conteneurs (Keycloak, Postgres, MinIO, Adminer, pgAdmin)
└── .gitignore        # Protection des fichiers sensibles
```
