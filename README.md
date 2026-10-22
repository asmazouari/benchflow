# SmartTask AI 🚀

Application moderne de gestion de tâches avec assistant anti-procrastination intelligent alimenté par **Ollama** (IA 100% locale).

## 🛠️ Stack Technique

- **Frontend :** Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons
- **Backend :** FastAPI (Python 3.14), Pydantic
- **Intelligence Artificielle :** Ollama (`llama3.2` ou `mistral`)
- **Design :** Stitch
- **Qualité de code :** SonarLint / SonarCloud

## 📁 Architecture du Projet

```text
smart-task/
├── backend/          # API FastAPI & Service Ollama
│   ├── app/
│   │   ├── api/      # Endpoints HTTP (/tasks, /ai)
│   │   ├── core/     # Configuration & variables .env
│   │   ├── schemas/  # Schémas Pydantic
│   │   └── services/ # Services métier (Ollama, stockage)
│   ├── .env          # Variables d'environnement
│   └── requirements.txt
│
├── frontend/         # Application Next.js (React)
├── docs/             # Spécifications et maquettes Stitch
└── .gitignore        # Protection des fichiers sensibles
```
