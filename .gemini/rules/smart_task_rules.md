---
description: Règles de développement et architecture pour SmartTask AI
globs: **/*
---

# Règles Officielles du Projet SmartTask AI

## 1. Emplacement strict des fichiers
- Backend routes : `backend/app/api/`
- Backend configuration : `backend/app/core/`
- Backend schémas : `backend/app/schemas/`
- Backend services : `backend/app/services/`
- Frontend pages : `frontend/app/`
- Frontend composants : `frontend/components/`
- Frontend API client : `frontend/lib/api.ts`
- Frontend types : `frontend/types/`

## 2. Standards Backend (FastAPI / Python)
- Pydantic obligatoire pour toute entrée/sortie de données.
- Ne jamais mettre de logique métier ou d'appel LLM directement dans les fichiers de routes.
- Toujours déléguer aux services dans `services/`.
- Gestion des erreurs avec `HTTPException`.

## 3. Standards Frontend (Next.js / React)
- TypeScript strict, aucun type `any`.
- Pas d'appels d'URL en dur dans les composants; passer par `frontend/lib/api.ts`.
- Composants UI réutilisables dans `frontend/components/ui/` pilotés par des props (Button, Badge, Modal, Input). Zéro duplication.
- Icônes SVG isolées et typées dans `frontend/components/icons/` avec `frontend/types/icons.ts`. Interdiction d'injecter des balises `<svg>` brutes dans les composants métiers.
- Tailwind CSS et Lucide Icons pour les icônes standards.

## 4. Standards IA (Ollama)
- Réponse anti-procrastination en 3 phrases maximum.
- 1 seule micro-action concrète de moins de 2 minutes.
- Toujours encapsuler les appels Ollama avec fallback en cas de panne.

## 5. Qualité & Pédagogie
- Commenter le code en français pour l'apprentissage.
- Pas de secrets en dur; utiliser les variables d'environnement.
