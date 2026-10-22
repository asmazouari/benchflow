# 🎨 Spécifications du Design Stitch — BenchFlow

Ce document contient le prompt officiel d'art-direction pour générer la maquette de l'application **BenchFlow** sur Google Stitch.

---

## 📋 Informations Générales

- **Projet :** BenchFlow (Plateforme de Gestion Proactive des Inter-Projets)
- **Cible :** Web Desktop-first (1440px)
- **Style visuel :** SaaS d'entreprise moderne, fond épuré `slate-50`, cartes `white`, bordures subtiles `slate-200`, typographie nette (*Plus Jakarta Sans* pour les titres, *Inter* pour le corps).
- **Accents de couleur :**
  - Bleu/Indigo d'entreprise (`#4f46e5`) pour les actions principales
  - Métiers : Dev (`blue-600`), QA (`purple-600`), PO (`amber-600`), DevOps (`indigo-600`)
  - Alertes temporelles : Vert (> 30j), Orange (< 15j / Urgent), Rouge (En intermission)

---

## 📝 Prompt d'Art-Direction Officiel pour Stitch

```markdown
Plateforme SaaS moderne d'entreprise appelée 'BenchFlow', dédiée à la gestion proactive des fins de mission (staffings) et à la valorisation des périodes d'inter-projet pour équipes tech (Développeurs, QA, PO, DevOps).

PLATFORM: Web, Desktop-first (1440px wide, fond épuré slate-50, cartes blanches avec bordures subtiles border-slate-200, coins arrondis rounded-xl, typographie Plus Jakarta Sans et Inter).

PAGE STRUCTURE & COMPOSANTS :

1. Header & Sélecteur d'identité (Top Navigation) :
   - Logo BenchFlow à gauche avec emblème 'Tech Talent Hub'.
   - Au centre : Barre de navigation par 3 onglets distincts :
     * 📑 Onglet 1 : 'Radar des Staffings' (badge avec compteur d'alertes)
     * 💡 Onglet 2 : 'Réserve d'Initiatives' (Catalogue pré-validé)
     * ⏳ Onglet 3 : 'Suivi & Validations' (Idées et projets en cours)
   - À droite : Sélecteur interactif de profil actif 'Connecté en tant que : [ 👤 Thomas Laurent (Manager) ▼ ]' avec possibilité de basculer vers les profils collaborateurs (Sara Ben Ali - Dev, Ahmed Kacem - QA).

2. Onglet 1 — Le Radar des Staffings (Anticipation & Alertes) :
   - Bannière de métriques en 3 compteurs :
     * 🟢 12 en mission stable (> 30 jours)
     * 🟠 3 en fin de mission imminente (< 15 jours — Action requise)
     * 🔴 2 actuellement en inter-projet disponible
   - Bouton d'action Manager à droite : '+ Ajouter un collaborateur'.
   - Tableau / Grille des collaborateurs avec colonnes : Collaborateur (nom & avatar), Métier (Badge coloré Dev/QA/PO/DevOps), Date de fin de mission, Statut temporel (Badge Vert/Orange/Rouge avec décompte des jours restants 'J-12'), et bouton d'action 'Proposer une initiative'.

3. Onglet 2 — Le Catalogue d'Initiatives (La Réserve Pré-validée par le Manager) :
   - Barre d'outils avec filtres combinés :
     * Filtre Métier : Boutons pilules [Tous] [Dev] [QA] [PO] [DevOps].
     * Filtre Durée : [⚡ Flash < 3 jours] [📅 Sprint 1-2 semaines] [🚀 Fond > 2 semaines].
   - Grille de cartes de projets internes pré-validés avec :
     * Titre de l'initiative (ex: 'Banc de tests automatisés Cypress', 'Template API FastAPI & Docker').
     * Description concise (2 lignes).
     * Badge '🟢 Disponible (Pré-validé par le Manager)'.
     * Pastille de durée estimée et compétences requises.
     * Bouton d'action proéminent en 1 clic : '👉 Je prends ce sujet' (passage immédiat en cours sans e-mail).

4. Onglet 3 — Boîte à Idées & Suivi des Validations :
   - Espace Collaborateur : Encadré d'action '💡 Proposer une nouvelle initiative personnelle' avec formulaire modal (Titre, Métier, Motivation).
   - Espace Manager (File de validation) : Liste des cartes avec statut '🟡 En attente de validation', affichant l'auteur et la date, avec 2 boutons d'action rapide :
     * '✅ Valider' (passe immédiatement le statut en 'En cours')
     * '💬 Échanger'
   - Section des Projets en Cours : Liste des initiatives actives avec le collaborateur assigné et un bouton d'action finale pour le collaborateur : '🏁 Marquer comme terminé' ouvrant une invite pour renseigner l'URL du livrable (GitHub, Notion, Certification).
```
