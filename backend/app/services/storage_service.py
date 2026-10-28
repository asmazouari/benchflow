import json
import logging
from datetime import date, datetime
from pathlib import Path
from typing import Any, Tuple

from sqlalchemy import or_, text
from sqlalchemy.orm import Session

from app.core.database import Base, SessionLocal, engine
from app.models.collaborateur_model import CollaborateurModel
from app.models.initiative_model import InitiativeModel
from app.schemas.collaborateur_schema import (
    CollaborateurCreate,
    CollaborateurResponse,
    CollaborateurUpdate,
    RadarSummary,
    StatutAlerte,
)
from app.schemas.initiative_schema import (
    InitiativeCreate,
    InitiativeResponse,
    InitiativeUpdate,
    StatutInitiative,
)
from app.services.minio_service import minio_service

logger = logging.getLogger(__name__)

# Fichier JSON historique pour migration transparente
DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
LEGACY_STORAGE_FILE = DATA_DIR / "storage.json"


def compute_alert(date_fin_str: str) -> tuple[int, StatutAlerte]:
    """
    Calcule le nombre de jours restants et le niveau d'alerte :
    - <= 0 jour   : intermission (rouge)
    - <= 15 jours : urgent (orange)
    - > 15 jours  : stable (vert)
    """
    try:
        fin = datetime.strptime(date_fin_str, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return 0, "intermission"

    diff = (fin - date.today()).days
    if diff <= 0:
        statut = "intermission"
    elif diff <= 15:
        statut = "urgent"
    else:
        statut = "stable"

    return diff, statut


SEED_COLLABORATEURS = [
    {
        "id": 2,
        "nom": "Sara Ben Ali",
        "email": "sara.benali@benchflow.tech",
        "metier": "Dev",
        "date_fin_staffing": "2026-10-25",
        "role": "collaborateur",
        "client_actuel": "Banque Populaire (Refonte API)",
        "initiative_active_id": 105,
    },
    {
        "id": 3,
        "nom": "Ahmed Kacem",
        "email": "ahmed.kacem@benchflow.tech",
        "metier": "QA",
        "date_fin_staffing": "2026-10-15",
        "role": "collaborateur",
        "client_actuel": "Fin de mission Retail",
        "initiative_active_id": None,
    },
    {
        "id": 4,
        "nom": "Julien Martin",
        "email": "julien.martin@benchflow.tech",
        "metier": "DevOps",
        "date_fin_staffing": "2026-10-22",
        "role": "collaborateur",
        "client_actuel": "Assurance Directe (Cloud AWS)",
        "initiative_active_id": None,
    },
    {
        "id": 5,
        "nom": "Claire Dubois",
        "email": "claire.dubois@benchflow.tech",
        "metier": "PO",
        "date_fin_staffing": "2026-11-30",
        "role": "collaborateur",
        "client_actuel": "SaaS E-commerce",
        "initiative_active_id": None,
    },
    {
        "id": 6,
        "nom": "Mehdi Zayani",
        "email": "mehdi.zayani@benchflow.tech",
        "metier": "Dev",
        "date_fin_staffing": "2026-12-15",
        "role": "collaborateur",
        "client_actuel": "Portail Logistique",
        "initiative_active_id": None,
    },
    {
        "id": 7,
        "nom": "Emma Rousseau",
        "email": "emma.rousseau@benchflow.tech",
        "metier": "QA",
        "date_fin_staffing": "2026-10-18",
        "role": "collaborateur",
        "client_actuel": "Mission Télécom",
        "initiative_active_id": None,
    },
    {
        "id": 8,
        "nom": "Karim Belhadj",
        "email": "karim.belhadj@benchflow.tech",
        "metier": "DevOps",
        "date_fin_staffing": "2026-11-05",
        "role": "collaborateur",
        "client_actuel": "Migration Kubernetes",
        "initiative_active_id": None,
    },
    {
        "id": 9,
        "nom": "Sophie Laurent",
        "email": "sophie.laurent@benchflow.tech",
        "metier": "PO",
        "date_fin_staffing": "2026-10-12",
        "role": "collaborateur",
        "client_actuel": "Fin cadrage Banque",
        "initiative_active_id": None,
    },
]

SEED_INITIATIVES = [
    {
        "id": 101,
        "titre": "Création d'un Starter Kit Next.js + Tailwind + Clean Architecture",
        "description": "Normaliser les développements front-end de l'ESN avec un template pré-configuré, documenté et testé.",
        "metier": "Dev",
        "duree": "Sprint",
        "statut": "DISPONIBLE",
        "origine": "manager",
        "auteur_nom": "Thomas Laurent (Manager)",
        "assigne_nom": None,
        "date_creation": "2026-10-01",
        "livrable_url": None,
    },
    {
        "id": 102,
        "titre": "Stratégie de Tests Automatisés E2E avec Playwright",
        "description": "Mettre en place une suite de tests réutilisable avec génération automatique de rapports HTML.",
        "metier": "QA",
        "duree": "Sprint",
        "statut": "DISPONIBLE",
        "origine": "manager",
        "auteur_nom": "Thomas Laurent (Manager)",
        "assigne_nom": None,
        "date_creation": "2026-10-02",
        "livrable_url": None,
    },
    {
        "id": 103,
        "titre": "Template de Cahier des Charges & User Stories pour Projets Agiles",
        "description": "Standardiser le recueil de besoins et les critères d'acceptation Gherkin pour les avant-ventes.",
        "metier": "PO",
        "duree": "Flash",
        "statut": "DISPONIBLE",
        "origine": "manager",
        "auteur_nom": "Thomas Laurent (Manager)",
        "assigne_nom": None,
        "date_creation": "2026-10-05",
        "livrable_url": None,
    },
    {
        "id": 104,
        "titre": "Pipeline CI/CD GitLab générique avec scan SonarQube & Trivy",
        "description": "Automatiser le contrôle qualité du code et la sécurité des conteneurs Docker pour tous les projets clients.",
        "metier": "DevOps",
        "duree": "Sprint",
        "statut": "DISPONIBLE",
        "origine": "manager",
        "auteur_nom": "Thomas Laurent (Manager)",
        "assigne_nom": None,
        "date_creation": "2026-10-06",
        "livrable_url": None,
    },
    {
        "id": 105,
        "titre": "Refonte du module d'authentification OAuth2 / Keycloak",
        "description": "Sécuriser les endpoints et uniformiser la gestion des rôles RBAC sur l'ensemble des API internes.",
        "metier": "Dev",
        "duree": "Sprint",
        "statut": "EN_COURS",
        "origine": "manager",
        "auteur_nom": "Thomas Laurent (Manager)",
        "assigne_nom": "Sara Ben Ali",
        "date_creation": "2026-10-10",
        "livrable_url": None,
    },
    {
        "id": 106,
        "titre": "Veille technologique & Guide de migration vers Java 21 LTS",
        "description": "Rédiger un livre blanc interne sur les Virtual Threads et les nouvelles fonctionnalités de Java 21.",
        "metier": "Dev",
        "duree": "Flash",
        "statut": "TERMINE",
        "origine": "collaborateur",
        "auteur_nom": "Sara Ben Ali",
        "assigne_nom": "Sara Ben Ali",
        "date_creation": "2026-10-08",
        "livrable_url": "https://notion.so/benchflow/guide-migration-java21",
    },
    {
        "id": 107,
        "titre": "Audit d'accessibilité RGAA sur les composants Design System",
        "description": "Vérifier la conformité contrastes et navigation clavier pour répondre aux normes européennes.",
        "metier": "QA",
        "duree": "Sprint",
        "statut": "A_VALIDER",
        "origine": "collaborateur",
        "auteur_nom": "Ahmed Kacem",
        "assigne_nom": "Ahmed Kacem",
        "date_creation": "2026-10-14",
        "livrable_url": None,
    },
]


class StorageService:
    """
    Couche de service métier : gère la persistance relationnelle avec SQLAlchemy
    et garantit la cohérence des transactions ACID de BenchFlow.
    """

    def __init__(self):
        try:
            self.init_db()
        except Exception as e:
            logger.warning(f"Connexion initiale différée ({e})")

    def init_db(self) -> None:
        """
        Crée les tables SQL si elles n'existent pas et injecte les données initiales.
        Exécute également une migration d'auto-remédiation pour ajouter les colonnes MinIO si absentes.
        """
        Base.metadata.create_all(bind=engine)

        db: Session = SessionLocal()
        try:
            # Migration automatique des colonnes document si table existante
            if engine.dialect.name == "postgresql":
                try:
                    db.execute(text("ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS document_nom VARCHAR(255);"))
                    db.execute(text("ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS document_type VARCHAR(100);"))
                    db.execute(text("ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS document_taille INTEGER;"))
                    db.execute(text("ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS document_s3_key VARCHAR(500);"))
                    db.commit()
                except Exception as mig_err:
                    logger.warning(f"Note migration colonnes initiatives : {mig_err}")
                    db.rollback()

            # 1. Vérification / Amorçage des initiatives
            count_initiatives = db.query(InitiativeModel).count()
            if count_initiatives == 0:
                initiatives_to_seed = SEED_INITIATIVES

                if LEGACY_STORAGE_FILE.exists():
                    try:
                        with open(LEGACY_STORAGE_FILE, "r", encoding="utf-8") as f:
                            data = json.load(f)
                            if data.get("initiatives"):
                                initiatives_to_seed = data["initiatives"]
                    except Exception as e:
                        logger.warning(f"Impossible de lire storage.json pour initiatives: {e}")

                for init_data in initiatives_to_seed:
                    db_init = InitiativeModel(
                        id=init_data["id"],
                        titre=init_data["titre"],
                        description=init_data["description"],
                        metier=init_data["metier"],
                        duree=init_data["duree"],
                        statut=init_data["statut"],
                        origine=init_data.get("origine", "manager"),
                        auteur_nom=init_data["auteur_nom"],
                        assigne_nom=init_data.get("assigne_nom"),
                        date_creation=init_data["date_creation"],
                        livrable_url=init_data.get("livrable_url"),
                    )
                    db.add(db_init)
                db.commit()

            # 2. Vérification / Amorçage des collaborateurs
            count_collabs = db.query(CollaborateurModel).count()
            if count_collabs == 0:
                collabs_to_seed = SEED_COLLABORATEURS

                if LEGACY_STORAGE_FILE.exists():
                    try:
                        with open(LEGACY_STORAGE_FILE, "r", encoding="utf-8") as f:
                            data = json.load(f)
                            if data.get("collaborateurs"):
                                collabs_to_seed = data["collaborateurs"]
                    except Exception as e:
                        logger.warning(f"Impossible de lire storage.json pour collaborateurs: {e}")

                for collab_data in collabs_to_seed:
                    db_collab = CollaborateurModel(
                        id=collab_data["id"],
                        nom=collab_data["nom"],
                        email=collab_data["email"],
                        metier=collab_data["metier"],
                        date_fin_staffing=collab_data["date_fin_staffing"],
                        role=collab_data.get("role", "collaborateur"),
                        client_actuel=collab_data.get("client_actuel"),
                        initiative_active_id=collab_data.get("initiative_active_id"),
                    )
                    db.add(db_collab)
                db.commit()

            # 3. Synchronisation préventive des séquences PostgreSQL
            if engine.dialect.name == "postgresql":
                try:
                    db.execute(text("SELECT setval('collaborateurs_id_seq', (SELECT COALESCE(MAX(id), 1) FROM collaborateurs));"))
                    db.execute(text("SELECT setval('initiatives_id_seq', (SELECT COALESCE(MAX(id), 1) FROM initiatives));"))
                    db.commit()
                except Exception as seq_err:
                    logger.warning(f"Avertissement synchronisation séquences : {seq_err}")
                    db.rollback()

        finally:
            db.close()

    # ==========================================================
    # COLLABORATEURS & RADAR
    # ==========================================================

    def get_collaborateurs(self) -> list[CollaborateurResponse]:
        """Récupère tous les collaborateurs depuis la base SQL avec alertes calculées."""
        db: Session = SessionLocal()
        try:
            records = db.query(CollaborateurModel).order_by(CollaborateurModel.id.asc()).all()
            results: list[CollaborateurResponse] = []

            for item in records:
                jours, alerte = compute_alert(item.date_fin_staffing)
                results.append(
                    CollaborateurResponse(
                        id=item.id,
                        nom=item.nom,
                        email=item.email,
                        metier=item.metier,
                        date_fin_staffing=item.date_fin_staffing,
                        jours_restants=jours,
                        statut_alerte=alerte,
                        client_actuel=item.client_actuel,
                        role=item.role,
                        initiative_active_id=item.initiative_active_id,
                    )
                )
            return results
        finally:
            db.close()

    def get_radar_summary(self) -> RadarSummary:
        """Génère le résumé KPI pour l'en-tête du Radar."""
        collabs = self.get_collaborateurs()
        stables = sum(1 for c in collabs if c.statut_alerte == "stable")
        urgents = sum(1 for c in collabs if c.statut_alerte == "urgent")
        intermissions = sum(1 for c in collabs if c.statut_alerte == "intermission")

        return RadarSummary(
            stables=stables,
            urgents=urgents,
            intermissions=intermissions,
            total=len(collabs),
            collaborateurs=collabs,
        )

    def create_collaborateur(self, collab: CollaborateurCreate) -> CollaborateurResponse:
        """Crée et persiste un nouveau collaborateur en base de données relationnelle."""
        db: Session = SessionLocal()
        try:
            jours, alerte = compute_alert(collab.date_fin_staffing)

            new_collab = CollaborateurModel(
                nom=collab.nom,
                email=collab.email,
                metier=collab.metier,
                date_fin_staffing=collab.date_fin_staffing,
                client_actuel=collab.client_actuel,
                role=collab.role,
                initiative_active_id=None,
            )
            db.add(new_collab)
            try:
                db.commit()
            except Exception:
                db.rollback()
                if engine.dialect.name == "postgresql":
                    db.execute(text("SELECT setval('collaborateurs_id_seq', (SELECT COALESCE(MAX(id), 1) FROM collaborateurs));"))
                    db.commit()
                    db.add(new_collab)
                    db.commit()
                else:
                    raise
            db.refresh(new_collab)

            return CollaborateurResponse(
                id=new_collab.id,
                nom=new_collab.nom,
                email=new_collab.email,
                metier=new_collab.metier,
                date_fin_staffing=new_collab.date_fin_staffing,
                jours_restants=jours,
                statut_alerte=alerte,
                client_actuel=new_collab.client_actuel,
                role=new_collab.role,
                initiative_active_id=new_collab.initiative_active_id,
            )
        finally:
            db.close()

    def update_collaborateur(
        self,
        collaborateur_id: int,
        collab_update: CollaborateurUpdate,
    ) -> CollaborateurResponse:
        """
        Met à jour un collaborateur existant (Manager uniquement).
        Recalcule immédiatement le statut temporel (jours restants et alerte).
        """
        db: Session = SessionLocal()
        try:
            target = db.query(CollaborateurModel).filter(CollaborateurModel.id == collaborateur_id).first()
            if not target:
                raise ValueError(f"Collaborateur {collaborateur_id} introuvable.")

            if collab_update.nom is not None:
                target.nom = collab_update.nom.strip()
            if collab_update.email is not None:
                target.email = collab_update.email.strip().lower()
            if collab_update.metier is not None:
                target.metier = collab_update.metier
            if collab_update.date_fin_staffing is not None:
                target.date_fin_staffing = collab_update.date_fin_staffing.strip()
            if collab_update.client_actuel is not None:
                target.client_actuel = collab_update.client_actuel.strip() or None
            if collab_update.role is not None:
                target.role = collab_update.role

            db.commit()
            db.refresh(target)

            jours, alerte = compute_alert(target.date_fin_staffing)

            return CollaborateurResponse(
                id=target.id,
                nom=target.nom,
                email=target.email,
                metier=target.metier,
                date_fin_staffing=target.date_fin_staffing,
                jours_restants=jours,
                statut_alerte=alerte,
                client_actuel=target.client_actuel,
                role=target.role,
                initiative_active_id=target.initiative_active_id,
            )
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    # ==========================================================
    # INITIATIVES & WORKFLOW
    # ==========================================================

    def get_initiatives(
        self,
        metier: str | None = None,
        duree: str | None = None,
        statut: str | None = None,
    ) -> list[InitiativeResponse]:
        """Récupère les initiatives depuis SQL avec filtres dynamiques."""
        db: Session = SessionLocal()
        try:
            query = db.query(InitiativeModel)

            if metier and metier != "Tous":
                query = query.filter(
                    or_(
                        InitiativeModel.metier == metier,
                        InitiativeModel.metier == "Tous",
                    )
                )

            if duree and duree != "Tous":
                query = query.filter(InitiativeModel.duree == duree)

            if statut and statut != "Tous":
                query = query.filter(InitiativeModel.statut == statut)

            items = query.order_by(InitiativeModel.id.desc()).all()

            return [
                InitiativeResponse(
                    id=item.id,
                    titre=item.titre,
                    description=item.description,
                    metier=item.metier,
                    duree=item.duree,
                    statut=item.statut,
                    origine=item.origine,
                    auteur_nom=item.auteur_nom,
                    assigne_nom=item.assigne_nom,
                    date_creation=item.date_creation,
                    livrable_url=item.livrable_url,
                    document_nom=getattr(item, "document_nom", None),
                    document_type=getattr(item, "document_type", None),
                    document_taille=getattr(item, "document_taille", None),
                )
                for item in items
            ]
        finally:
            db.close()

    def create_initiative(
        self,
        initiative: InitiativeCreate,
        is_manager: bool = False,
    ) -> InitiativeResponse:
        """
        Crée une nouvelle initiative :
        - Si manager : statut 'DISPONIBLE' (catalogue prêt pour le staff)
        - Si collaborateur : statut 'A_VALIDER' (en attente du manager)
        """
        db: Session = SessionLocal()
        try:
            origine = "manager" if is_manager else "collaborateur"
            statut: StatutInitiative = "DISPONIBLE" if is_manager else "A_VALIDER"

            new_init = InitiativeModel(
                titre=initiative.titre,
                description=initiative.description,
                metier=initiative.metier,
                duree=initiative.duree,
                statut=statut,
                origine=origine,
                auteur_nom=initiative.auteur_nom,
                assigne_nom=initiative.assigne_nom,
                date_creation=date.today().isoformat(),
                livrable_url=None,
                document_nom=initiative.document_nom,
                document_type=initiative.document_type,
                document_taille=getattr(initiative, "document_taille", None),
            )
            db.add(new_init)
            try:
                db.commit()
            except Exception:
                db.rollback()
                if engine.dialect.name == "postgresql":
                    db.execute(text("SELECT setval('initiatives_id_seq', (SELECT COALESCE(MAX(id), 1) FROM initiatives));"))
                    db.commit()
                    db.add(new_init)
                    db.commit()
                else:
                    raise
            db.refresh(new_init)

            return InitiativeResponse(
                id=new_init.id,
                titre=new_init.titre,
                description=new_init.description,
                metier=new_init.metier,
                duree=new_init.duree,
                statut=new_init.statut,
                origine=new_init.origine,
                auteur_nom=new_init.auteur_nom,
                assigne_nom=new_init.assigne_nom,
                date_creation=new_init.date_creation,
                livrable_url=new_init.livrable_url,
                document_nom=new_init.document_nom,
                document_type=new_init.document_type,
                document_taille=new_init.document_taille,
            )
        finally:
            db.close()

    def update_initiative(
        self,
        initiative_id: int,
        init_update: InitiativeUpdate,
        user_nom: str,
        is_manager: bool,
    ) -> InitiativeResponse:
        """
        Modifie une initiative existante :
        - Le Manager peut modifier n'importe quelle initiative.
        - Le Collaborateur ne peut modifier que sa propre idée tant qu'elle est 'A_VALIDER'.
        """
        db: Session = SessionLocal()
        try:
            target = db.query(InitiativeModel).filter(InitiativeModel.id == initiative_id).first()
            if not target:
                raise ValueError(f"Initiative {initiative_id} introuvable.")

            # Contrôle des droits RBAC
            if not is_manager:
                is_author = (
                    target.auteur_nom.strip().lower() == user_nom.strip().lower()
                    or user_nom.strip().lower() in target.auteur_nom.lower()
                )
                if not is_author:
                    raise PermissionError("Vous ne pouvez modifier que les initiatives que vous avez créées.")
                if target.statut != "A_VALIDER":
                    raise PermissionError("Une initiative déjà validée ou en cours ne peut plus être modifiée.")

            if init_update.titre is not None:
                target.titre = init_update.titre.strip()
            if init_update.description is not None:
                target.description = init_update.description.strip()
            if init_update.metier is not None:
                target.metier = init_update.metier
            if init_update.duree is not None:
                target.duree = init_update.duree

            db.commit()
            db.refresh(target)

            return InitiativeResponse(
                id=target.id,
                titre=target.titre,
                description=target.description,
                metier=target.metier,
                duree=target.duree,
                statut=target.statut,
                origine=target.origine,
                auteur_nom=target.auteur_nom,
                assigne_nom=target.assigne_nom,
                date_creation=target.date_creation,
                livrable_url=target.livrable_url,
                document_nom=target.document_nom,
                document_type=target.document_type,
                document_taille=target.document_taille,
            )
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    def attach_initiative_document(
        self,
        initiative_id: int,
        file_name: str,
        file_bytes: bytes,
        content_type: str,
    ) -> InitiativeResponse:
        """
        Téléverse un document de cadrage dans MinIO et associe les métadonnées S3 à l'initiative.
        """
        db: Session = SessionLocal()
        try:
            target = db.query(InitiativeModel).filter(InitiativeModel.id == initiative_id).first()
            if not target:
                raise ValueError(f"Initiative {initiative_id} introuvable.")

            # Envoi du fichier à MinIO
            object_key, file_size = minio_service.upload_document(
                initiative_id=initiative_id,
                file_name=file_name,
                file_bytes=file_bytes,
                content_type=content_type,
            )

            # Mise à jour des métadonnées relationnelles
            target.document_nom = file_name
            target.document_type = content_type
            target.document_taille = file_size
            target.document_s3_key = object_key

            db.commit()
            db.refresh(target)

            return InitiativeResponse(
                id=target.id,
                titre=target.titre,
                description=target.description,
                metier=target.metier,
                duree=target.duree,
                statut=target.statut,
                origine=target.origine,
                auteur_nom=target.auteur_nom,
                assigne_nom=target.assigne_nom,
                date_creation=target.date_creation,
                livrable_url=target.livrable_url,
                document_nom=target.document_nom,
                document_type=target.document_type,
                document_taille=target.document_taille,
            )
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    def get_initiative_document(self, initiative_id: int) -> Tuple[bytes, str, str]:
        """
        Récupère le fichier binaire depuis MinIO pour le téléchargement.
        Renvoie (contenu_binaire, content_type, nom_fichier).
        """
        db: Session = SessionLocal()
        try:
            target = db.query(InitiativeModel).filter(InitiativeModel.id == initiative_id).first()
            if not target:
                raise ValueError(f"Initiative {initiative_id} introuvable.")
            if not target.document_s3_key:
                raise FileNotFoundError(f"Aucun document n'est rattaché à l'initiative {initiative_id}.")

            file_bytes, content_type, file_name = minio_service.get_document_stream(target.document_s3_key)
            real_name = target.document_nom or file_name
            return file_bytes, content_type, real_name
        finally:
            db.close()

    def take_initiative(self, initiative_id: int, user_nom: str) -> InitiativeResponse:
        """
        Action 1-clic : un consultant s'auto-staffe sur une initiative disponible.
        Transaction ACID : Passe le statut en 'EN_COURS', assigne le collaborateur
        et met à jour la table collaborateurs avec l'ID d'initiative active.
        """
        db: Session = SessionLocal()
        try:
            target = db.query(InitiativeModel).filter(InitiativeModel.id == initiative_id).first()
            if not target:
                raise ValueError(f"Initiative {initiative_id} introuvable.")

            target.statut = "EN_COURS"
            target.assigne_nom = user_nom

            collab = (
                db.query(CollaborateurModel)
                .filter(CollaborateurModel.nom.ilike(user_nom.strip()))
                .first()
            )
            if collab:
                collab.initiative_active_id = initiative_id

            db.commit()
            db.refresh(target)

            return InitiativeResponse(
                id=target.id,
                titre=target.titre,
                description=target.description,
                metier=target.metier,
                duree=target.duree,
                statut=target.statut,
                origine=target.origine,
                auteur_nom=target.auteur_nom,
                assigne_nom=target.assigne_nom,
                date_creation=target.date_creation,
                livrable_url=target.livrable_url,
                document_nom=target.document_nom,
                document_type=target.document_type,
                document_taille=target.document_taille,
            )
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    def validate_initiative(self, initiative_id: int) -> InitiativeResponse:
        """
        Action Manager : valide une initiative proposée.
        Si quelqu'un est déjà assigné, passe en 'EN_COURS', sinon 'DISPONIBLE'.
        """
        db: Session = SessionLocal()
        try:
            target = db.query(InitiativeModel).filter(InitiativeModel.id == initiative_id).first()
            if not target:
                raise ValueError(f"Initiative {initiative_id} introuvable.")

            if target.assigne_nom:
                target.statut = "EN_COURS"
            else:
                target.statut = "DISPONIBLE"

            db.commit()
            db.refresh(target)

            return InitiativeResponse(
                id=target.id,
                titre=target.titre,
                description=target.description,
                metier=target.metier,
                duree=target.duree,
                statut=target.statut,
                origine=target.origine,
                auteur_nom=target.auteur_nom,
                assigne_nom=target.assigne_nom,
                date_creation=target.date_creation,
                livrable_url=target.livrable_url,
                document_nom=target.document_nom,
                document_type=target.document_type,
                document_taille=target.document_taille,
            )
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    def reject_initiative(self, initiative_id: int) -> InitiativeResponse:
        """Action Manager : refuse une initiative proposée."""
        db: Session = SessionLocal()
        try:
            target = db.query(InitiativeModel).filter(InitiativeModel.id == initiative_id).first()
            if not target:
                raise ValueError(f"Initiative {initiative_id} introuvable.")

            target.statut = "REFUSE"
            db.commit()
            db.refresh(target)

            return InitiativeResponse(
                id=target.id,
                titre=target.titre,
                description=target.description,
                metier=target.metier,
                duree=target.duree,
                statut=target.statut,
                origine=target.origine,
                auteur_nom=target.auteur_nom,
                assigne_nom=target.assigne_nom,
                date_creation=target.date_creation,
                livrable_url=target.livrable_url,
                document_nom=target.document_nom,
                document_type=target.document_type,
                document_taille=target.document_taille,
            )
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    def complete_initiative(self, initiative_id: int, livrable_url: str) -> InitiativeResponse:
        """
        Clôture une initiative avec son URL de livrable (GitHub, Notion, Certif).
        Libère le collaborateur qui travaillait dessus.
        """
        db: Session = SessionLocal()
        try:
            target = db.query(InitiativeModel).filter(InitiativeModel.id == initiative_id).first()
            if not target:
                raise ValueError(f"Initiative {initiative_id} introuvable.")

            target.statut = "TERMINE"
            target.livrable_url = livrable_url

            collabs = (
                db.query(CollaborateurModel)
                .filter(CollaborateurModel.initiative_active_id == initiative_id)
                .all()
            )
            for c in collabs:
                c.initiative_active_id = None

            db.commit()
            db.refresh(target)

            return InitiativeResponse(
                id=target.id,
                titre=target.titre,
                description=target.description,
                metier=target.metier,
                duree=target.duree,
                statut=target.statut,
                origine=target.origine,
                auteur_nom=target.auteur_nom,
                assigne_nom=target.assigne_nom,
                date_creation=target.date_creation,
                livrable_url=target.livrable_url,
                document_nom=target.document_nom,
                document_type=target.document_type,
                document_taille=target.document_taille,
            )
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()


# Instance singleton utilisable dans toute l'application
storage_service = StorageService()
