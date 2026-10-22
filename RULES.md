# 📜 Règles Officielles du Projet (Project Guidelines)

Ce document définit les règles d'architecture, de qualité de code et d'intégration de l'IA pour le projet **SmartTask AI**. 
**Toute nouvelle fonctionnalité doit impérativement respecter ces règles.**

---

## 1. 🏛️ Architecture & Emplacement Strict des Fichiers

Chaque fichier doit être placé dans son dossier dédié. **Aucun fichier de code en vrac n'est autorisé.**

```text
smart-task/
├── backend/app/
│   ├── api/          -> UNIQUEMENT les routes HTTP (FastAPI APIRouter)
│   ├── core/         -> Configuration, variables d'environnement (.env)
│   ├── schemas/      -> Modèles de données Pydantic (validation des entrées/sorties)
│   └── services/     -> Logique métier, stockage, et appels à Ollama
└── frontend/
    ├── app/          -> Pages et Layouts Next.js (App Router)
    ├── components/   -> Composants React réutilisables (TaskCard, UnblockModal...)
    ├── lib/          -> Fonctions d'appel API (fetch) vers FastAPI
    └── types/        -> Interfaces et types TypeScript
```

---

## 2. 🐍 Conventions Backend (FastAPI & Python)

1. **Typage strict Pydantic :**
   * Deux entités principales typées : `Collaborateur` et `Initiative`.
   * Tout échange de données DOIT utiliser un schéma Pydantic (`CollaborateurCreate`, `CollaborateurResponse`, `InitiativeCreate`, `InitiativeResponse`).
   * Ne jamais renvoyer de dictionnaire brut non typé.
2. **Modularité des routes :**
   * Le fichier `main.py` initialise FastAPI, active CORS et charge les routeurs avec `app.include_router(...)`.
   * `routes_collaborateurs.py` : Gestion des profils et calcul du radar des fins de staffing.
   * `routes_initiatives.py` : Catalogue d'initiatives, prise en charge immédiate, validations et clôture.
   * `routes_ai.py` : Suggestions et enrichissements d'initiatives par Ollama.
3. **Isolation des services :**
   * Les routes HTTP délèguent toujours aux services dans `app/services/` (`storage_service.py`, `ollama_service.py`).
4. **Gestion des exceptions :**
   * Renvoyer systématiquement des codes HTTP explicites avec `HTTPException` (ex: 404 Not Found, 400 Bad Request, 503 Service Unavailable).

---

## 3. ⚛️ Conventions Frontend (Next.js & TypeScript)

1. **TypeScript strict :**
   * Le type `any` est **strictement interdit**.
   * Toutes les données reçues de l'API doivent correspondre à une interface définie dans `types/index.ts`.
2. **Centralisation des appels réseau :**
   * Aucun composant React ne doit écrire d'URL en dur (`http://localhost:8000/...`).
   * Tous les appels `fetch` sont regroupés dans `lib/api.ts` et utilisent la variable `process.env.NEXT_PUBLIC_API_URL`.
3. **Composants UI Atomiques & Réutilisables (Zéro Redondance) :**
   * Tout élément générique (Bouton, Badge, Input, Modal) doit être placé dans `frontend/components/ui/`.
   * Chaque composant est configuré exclusivement via ses **props** (`variant`, `size`, `isLoading`, `onClick`...) pour être 100% réutilisable.
4. **Gestion Propre des Icônes SVG (Isolées et Typées) :**
   * Les icônes personnalisées (extraites de Stitch) doivent être créées sous forme de composants dans `frontend/components/icons/`.
   * Tout SVG doit être typé avec l'interface `IconProps` définie dans `frontend/types/icons.ts`.
   * **Interdiction stricte** d'écrire des blocs `<svg>...</svg>` bruts au milieu des pages ou des composants métiers.
5. **Design & Découpage :**
   * Utiliser **Tailwind CSS** pour le stylage.
   * Utiliser **Lucide React** (`lucide-react`) pour les icônes standards du système.
   * Découper les composants en briques unitaires propres (Single Responsibility Principle).

---

## 4. 🤖 Conventions IA (Ollama & Local LLM - Optionnel)

1. **Rôle de l'IA (Conseiller & Rédacteur) :**
   * L'IA assiste le collaborateur en lui suggérant des initiatives adaptées à son métier (`Dev`, `QA`, `PO`, `DevOps`).
   * L'IA aide le manager à rédiger rapidement des objectifs et livrables clairs en 3 puces.
2. **Résilience et Tolérance aux pannes :**
   * Les appels à Ollama doivent être sécurisés dans un bloc `try / except`.
   * Si Ollama est inaccessible (éteint, chargement long), le backend ne doit pas planter : il renvoie un message de repli bienveillant avec code HTTP adapté.
3. **Souveraineté des données :**
   * Par défaut, aucune donnée n'est envoyée vers des serveurs externes tiers (100% Ollama local).

---

## 5. 🔍 Conventions Qualité & Sonar

1. **Lisibilité :**
   * Noms de variables et fonctions explicites (camelCase en TypeScript, snake_case en Python).
   * Zéro code mort, zéro import inutilisé.
2. **Pédagogie :**
   * Chaque fonction clé doit comporter une docstring ou un commentaire explicatif en français.
3. **Sécurité :**
   * Aucun mot de passe, clé secrète ou URL en dur dans le code (utiliser exclusivement `.env` et `.env.local`).
