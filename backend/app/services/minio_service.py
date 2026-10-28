"""
Service de Stockage d'Objets S3 / MinIO pour BenchFlow.
Gère les documents de proposition d'initiatives (PDF, Word, Markdown, etc.).
"""

import os
import logging
from pathlib import Path
from io import BytesIO
from typing import Optional, Tuple
from dotenv import load_dotenv

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError

# Chargement de la configuration .env
ENV_FILE = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=ENV_FILE)

logger = logging.getLogger("benchflow.minio")

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "http://127.0.0.1:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadminpassword123")
MINIO_BUCKET_NAME = os.getenv("MINIO_BUCKET_NAME", "benchflow-initiatives")


class MinIOStorageService:
    """
    Client de stockage S3/MinIO d'entreprise.
    Permet de stocker et distribuer les fichiers de cadrage de manière scalable et sécurisée.
    """

    def __init__(self):
        self.endpoint_url = MINIO_ENDPOINT
        self.access_key = MINIO_ACCESS_KEY
        self.secret_key = MINIO_SECRET_KEY
        self.bucket_name = MINIO_BUCKET_NAME
        self.client = None
        self._initialize_client()

    def _initialize_client(self) -> None:
        """Initialise le client boto3 S3 configuré pour MinIO."""
        try:
            self.client = boto3.client(
                "s3",
                endpoint_url=self.endpoint_url,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                config=Config(signature_version="s3v4"),
                region_name="us-east-1",
            )
            self.ensure_bucket_exists()
        except Exception as e:
            logger.warning(f"Connexion initiale à MinIO différée ({e})")

    def ensure_bucket_exists(self) -> bool:
        """
        Vérifie si le bucket existe dans MinIO, sinon le crée automatiquement.
        """
        if not self.client:
            return False

        try:
            response = self.client.list_buckets()
            existing_buckets = [b["Name"] for b in response.get("Buckets", [])]
            if self.bucket_name not in existing_buckets:
                self.client.create_bucket(Bucket=self.bucket_name)
                logger.info(f"Bucket MinIO '{self.bucket_name}' créé avec succès.")
            return True
        except Exception as e:
            logger.warning(f"Impossible de vérifier/créer le bucket MinIO '{self.bucket_name}': {e}")
            return False

    def upload_document(
        self,
        initiative_id: int,
        file_name: str,
        file_bytes: bytes,
        content_type: str = "application/octet-stream",
    ) -> Tuple[str, int]:
        """
        Téléverse un document dans le bucket MinIO.

        Args:
            initiative_id: ID de l'initiative associée.
            file_name: Nom du fichier d'origine.
            file_bytes: Contenu binaire brut du fichier.
            content_type: Type MIME du fichier.

        Returns:
            Tuple[str, int]: (object_key, file_size_in_bytes)
        """
        if not self.client:
            self._initialize_client()

        # Clé S3 hiérarchique et sécurisée
        clean_filename = Path(file_name).name.replace(" ", "_")
        object_key = f"initiatives/{initiative_id}/{clean_filename}"
        file_size = len(file_bytes)

        try:
            self.client.put_object(
                Bucket=self.bucket_name,
                Key=object_key,
                Body=file_bytes,
                ContentType=content_type,
                Metadata={
                    "initiative_id": str(initiative_id),
                    "original_name": clean_filename,
                },
            )
            logger.info(f"Fichier '{clean_filename}' ({file_size} octets) téléversé sous '{object_key}'.")
            return object_key, file_size
        except ClientError as e:
            logger.error(f"Erreur lors de l'envoi vers MinIO: {e}")
            raise RuntimeError(f"Échec du téléversement MinIO: {e}")

    def get_document_stream(self, object_key: str) -> Tuple[bytes, str, str]:
        """
        Récupère le contenu binaire et les métadonnées d'un document depuis MinIO.

        Args:
            object_key: Chemin de l'objet dans le bucket.

        Returns:
            Tuple[bytes, str, str]: (contenu_binaire, content_type, nom_fichier)
        """
        if not self.client:
            self._initialize_client()

        try:
            response = self.client.get_object(Bucket=self.bucket_name, Key=object_key)
            file_bytes = response["Body"].read()
            content_type = response.get("ContentType", "application/octet-stream")
            file_name = Path(object_key).name

            return file_bytes, content_type, file_name
        except ClientError as e:
            logger.error(f"Erreur lors de la lecture de '{object_key}' depuis MinIO: {e}")
            raise FileNotFoundError(f"Document introuvable dans le stockage MinIO ({e})")

    def generate_presigned_url(self, object_key: str, expires_in: int = 3600) -> str:
        """
        Génère une URL pré-signée sécurisée pour téléchargement direct (expire sous 1 heure).
        """
        if not self.client:
            self._initialize_client()

        try:
            return self.client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": object_key},
                ExpiresIn=expires_in,
            )
        except ClientError as e:
            logger.error(f"Erreur génération URL pré-signée: {e}")
            raise RuntimeError(f"Impossible de générer l'URL MinIO: {e}")

    def delete_document(self, object_key: str) -> bool:
        """Supprime un document du bucket MinIO."""
        if not self.client:
            return False

        try:
            self.client.delete_object(Bucket=self.bucket_name, Key=object_key)
            logger.info(f"Objet '{object_key}' supprimé de MinIO.")
            return True
        except ClientError as e:
            logger.warning(f"Erreur lors de la suppression de '{object_key}': {e}")
            return False


# Instance globale partagée
minio_service = MinIOStorageService()
