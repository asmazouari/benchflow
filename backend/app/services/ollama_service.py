import json
import logging
import os
import re
import requests

from app.schemas.ai_schema import AiInitiativeProposal, AiSuggestionResponse
from app.schemas.collaborateur_schema import Metier
from app.schemas.initiative_schema import Duree

logger = logging.getLogger(__name__)

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
OLLAMA_TIMEOUT = int(os.getenv("OLLAMA_TIMEOUT", "30"))

# ============================================================================
# CATALOGUE DE SECOURS (RÉSILIENCE CLOUD & HORS-LIGNE)
# ============================================================================
FALLBACK_SUGGESTIONS: dict[Metier, list[dict]] = {
    "Dev": [
        {
            "titre": "PoC d'Intégration d'un Cache Redis Distribué",
            "description": "Étudier et implémenter une couche de mise en cache distribuée pour soulager les requêtes PostgreSQL récurrentes et accélérer le Radar des Staffings.",
            "metier": "Dev",
            "duree": "Sprint",
            "livrable_attendu": "Dépôt GitHub avec benchmark comparatif de latence et documentation d'intégration.",
        },
        {
            "titre": "Création d'un SDK Client TypeScript Typé",
            "description": "Générer et packager un client TypeScript autonome consommant l'API OpenAPI/Swagger pour sécuriser les appels front-end.",
            "metier": "Dev",
            "duree": "Flash",
            "livrable_attendu": "Package npm interne avec typages automatiques et tests unitaires.",
        },
    ],
    "QA": [
        {
            "titre": "Suite de Tests E2E Automatisés avec Playwright",
            "description": "Mettre en place une couverture de tests bout en bout sur les parcours critiques : authentification SSO, ajout de consultant et validation d'initiative.",
            "metier": "QA",
            "duree": "Sprint",
            "livrable_attendu": "Suite Playwright intégrée au pipeline CI GitHub Actions avec rapport visuel.",
        },
        {
            "titre": "Campagne de Tests de Montée en Charge avec k6",
            "description": "Simuler 500 utilisateurs simultanés sur l'API FastAPI et la base PostgreSQL pour identifier les éventuels goulots d'étranglement.",
            "metier": "QA",
            "duree": "Flash",
            "livrable_attendu": "Script k6 reproductible et rapport d'analyse des temps de réponse p95/p99.",
        },
    ],
    "PO": [
        {
            "titre": "Matrice de Priorisation RICE pour les Épics 2026",
            "description": "Structurer le scoring des fonctionnalités futures (Reach, Impact, Confidence, Effort) pour orienter la roadmap produit du prochain trimestre.",
            "metier": "PO",
            "duree": "Flash",
            "livrable_attendu": "Fichier de cadrage Notion/Excel avec guide méthodologique de notation.",
        },
        {
            "titre": "Discovery Utilisateur : Parcours Candidat Inter-projets",
            "description": "Mener 5 interviews avec des consultants en intermission pour cartographier les irritants et enrichir l'expérience d'auto-staffing.",
            "metier": "PO",
            "duree": "Sprint",
            "livrable_attendu": "User Journey Map synthétique et 3 User Stories prêtes pour le backlog.",
        },
    ],
    "DevOps": [
        {
            "titre": "Automatisation du Déploiement Multi-Environnements (IaC)",
            "description": "Créer des scripts Terraform pour instancier automatiquement les bases PostgreSQL Neon et les services Render selon la branche Git.",
            "metier": "DevOps",
            "duree": "Fond",
            "livrable_attendu": "Templates Terraform modulaires et documentation de runbook.",
        },
        {
            "titre": "Scan de Vulnérabilités Continu des Conteneurs",
            "description": "Intégrer Trivy dans GitHub Actions pour scanner chaque image Docker et dépendance Python avant toute mise en production.",
            "metier": "DevOps",
            "duree": "Flash",
            "livrable_attendu": "Workflow GitHub Actions bloquant en cas de CVE critique.",
        },
    ],
    "Tous": [
        {
            "titre": "Guide de Bonnes Pratiques Clean Code & Architecture",
            "description": "Rédiger le standard d'ingénierie interne pour l'équipe technique : conventions de commits, gestion des erreurs et revues de code.",
            "metier": "Tous",
            "duree": "Flash",
            "livrable_attendu": "Guide markdown versionné à la racine du projet partagé à tous les nouveaux arrivants.",
        },
        {
            "titre": "Veille Technologique : Agents Autonomes & LLM Locaux",
            "description": "Analyser les opportunités d'intégration de modèles open-source pour automatiser la qualification de CV et le staffing.",
            "metier": "Tous",
            "duree": "Sprint",
            "livrable_attendu": "Synthèse exécutive de 3 pages avec recommandations concrètes et plan d'action.",
        },
    ],
}


class OllamaService:
    """
    Service d'assistance IA pour la génération intelligente d'initiatives.
    Communique avec le serveur local Ollama (Llama 3.2 / Mistral) avec repli automatique résilient.
    """

    def __init__(self, host: str = OLLAMA_HOST, model: str = OLLAMA_MODEL):
        self.host = host.rstrip("/")
        self.model = model
        self.generate_url = f"{self.host}/api/generate"

    def generate_initiatives(
        self,
        metier: Metier = "Dev",
        contexte: str | None = None,
    ) -> AiSuggestionResponse:
        """
        Interroge Ollama en mode JSON structuré pour proposer 2 initiatives concrètes.
        Si Ollama est inaccessible ou échoue, renvoie des suggestions de secours de haute qualité.
        """
        # Tentative d'appel à Ollama
        try:
            prompt = self._build_prompt(metier, contexte)
            logger.info(f"Interrogation d'Ollama ({self.model}) sur {self.generate_url} pour le métier '{metier}'...")

            response = requests.post(
                self.generate_url,
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "format": "json",
                    "stream": False,
                    "options": {
                        "temperature": 0.6,
                        "top_p": 0.9,
                    },
                },
                timeout=OLLAMA_TIMEOUT,
            )

            if response.status_code == 200:
                raw_json = response.json().get("response", "{}")
                proposals = self._parse_llm_response(raw_json, metier)
                if proposals:
                    logger.info(f"Ollama a généré {len(proposals)} propositions avec succès.")
                    return AiSuggestionResponse(
                        metier=metier,
                        source="ollama_local",
                        suggestions=proposals,
                    )
        except requests.RequestException as e:
            logger.warning(f"Ollama inaccessible ({e}). Bascule sur le moteur résilient cloud.")
        except Exception as e:
            logger.error(f"Erreur inattendue lors de la génération Ollama : {e}")

        # Mode de secours résilient
        return self._get_fallback_response(metier)

    def _build_prompt(self, metier: str, contexte: str | None) -> str:
        ctx_clause = f"Contexte ou technologie demandée : '{contexte}'." if contexte else ""
        return f"""Tu es le Directeur Technique (CTO) d'une ESN de premier plan.
Un collaborateur au profil '{metier}' est en période d'inter-contrat (disponible). {ctx_clause}
Propose exactement 2 initiatives ou projets internes à forte valeur ajoutée qu'il peut réaliser.

RÈGLES STRICTES :
1. Chaque initiative doit avoir un titre professionnel et percutant.
2. La description doit être claire, motivante et résumée en 2 ou 3 phrases.
3. La durée doit être obligatoirement l'une de ces 3 valeurs : 'Flash', 'Sprint' ou 'Fond'.
4. Le livrable attendu doit être concret (ex: 'Dépôt GitHub avec tests', 'Documentation Notion', etc.).
5. Réponds UNIQUEMENT sous forme d'un objet JSON strict avec la clé 'initiatives'.

Exemple de structure attendue :
{{
  "initiatives": [
    {{
      "titre": "Titre du projet 1",
      "description": "Description concise en deux phrases...",
      "duree": "Sprint",
      "livrable_attendu": "Dépôt GitHub avec documentation"
    }},
    {{
      "titre": "Titre du projet 2",
      "description": "Description concise en deux phrases...",
      "duree": "Flash",
      "livrable_attendu": "Rapport synthétique et présentation"
    }}
  ]
}}"""

    def _parse_llm_response(self, raw_text: str, default_metier: Metier) -> list[AiInitiativeProposal]:
        """Extrait et valide les propositions contenues dans le texte JSON produit par le LLM."""
        try:
            # Extraction JSON robuste (au cas où le modèle ajoute du markdown)
            match = re.search(r"\{.*\}", raw_text, re.DOTALL)
            if not match:
                return []
            payload = json.loads(match.group(0))

            items = payload.get("initiatives") or payload.get("suggestions") or []
            if not isinstance(items, list):
                return []

            valid_proposals: list[AiInitiativeProposal] = []
            valid_durees: set[Duree] = {"Flash", "Sprint", "Fond"}

            for item in items[:3]:
                raw_duree = str(item.get("duree", "Sprint")).capitalize()
                duree: Duree = raw_duree if raw_duree in valid_durees else "Sprint"

                proposal = AiInitiativeProposal(
                    titre=str(item.get("titre", "Initiative sans titre")).strip(),
                    description=str(item.get("description", "Description indisponible.")).strip(),
                    metier=default_metier,
                    duree=duree,
                    livrable_attendu=str(item.get("livrable_attendu", "Livrable documenté.")).strip(),
                )
                valid_proposals.append(proposal)

            return valid_proposals
        except Exception as err:
            logger.warning(f"Impossible de parser le JSON retourné par Ollama : {err}")
            return []

    def _get_fallback_response(self, metier: Metier) -> AiSuggestionResponse:
        """Retourne des suggestions pré-calibrées de qualité professionnelle."""
        items = FALLBACK_SUGGESTIONS.get(metier) or FALLBACK_SUGGESTIONS["Tous"]
        proposals = [
            AiInitiativeProposal(
                titre=item["titre"],
                description=item["description"],
                metier=item["metier"],
                duree=item["duree"],
                livrable_attendu=item["livrable_attendu"],
            )
            for item in items
        ]
        return AiSuggestionResponse(
            metier=metier,
            source="cloud_resilient",
            suggestions=proposals,
        )


# Instance singleton réutilisable dans toute l'application
ollama_service = OllamaService()
