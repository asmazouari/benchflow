---
description: Règles de développement et architecture pour BenchFlow
globs: **/*
---

# Règles Officielles du Projet BenchFlow

## 1. Emplacement strict des fichiers
- Backend routes : `backend/app/api/`
- Backend configuration : `backend/app/core/`
- Backend modèles : `backend/app/models/`
- Backend schémas : `backend/app/schemas/`
- Backend services : `backend/app/services/`
- Frontend pages : `frontend/src/app/`
- Frontend composants : `frontend/src/components/` (atoms, molecules, organisms, templates)
- Frontend hooks : `frontend/src/hooks/`
- Frontend API client : `frontend/src/lib/api.ts`
- Frontend types : `frontend/src/types/`

## 2. Standards Backend (FastAPI / Python)
- Pydantic obligatoire pour toute entrée/sortie de données.
- Ne jamais mettre de logique métier ou d'appel LLM directement dans les fichiers de routes.
- Toujours déléguer aux services dans `services/`.
- Gestion des erreurs avec `HTTPException`.

## 3. Standards Frontend (Next.js / React)
- TypeScript strict, aucun type `any`.
- Pas d'appels d'URL en dur dans les composants; passer par `@/lib/api`.
- Composants UI réutilisables dans `frontend/src/components/` selon l'Atomic Design strict. Zéro duplication.
- Tailwind CSS et Lucide Icons pour les icônes standards.

## 4. Standards IA (Ollama)
- Suggestion d'initiatives adaptées au métier du collaborateur (`Dev`, `QA`, `PO`, `DevOps`).
- Toujours encapsuler les appels Ollama avec fallback en cas de panne.

## 5. Qualité & Pédagogie
- Commenter le code en français pour l'apprentissage.
- Pas de secrets en dur; utiliser les variables d'environnement.
