# 📋 Backlog Produit — BenchFlow

Ce document contient l'ensemble des User Stories (US) et critères d'acceptation du projet **BenchFlow**.

---

## 🎯 EPIC 1 : Profils & Radar des Staffings (Anticipation)

### US-01 : Création d'un collaborateur avec date de fin de staffing (Must Have)
- **En tant que :** Manager
- **Je veux :** Enregistrer un collaborateur avec son métier et sa date de fin de mission actuelle
- **Afin de :** Centraliser le suivi des disponibilités de l'équipe
- **Critères d'acceptation :**
  1. Formulaire : Nom & Prénom, Email unique, Métier (`Dev`, `QA`, `PO`, `DevOps`), Date de fin de mission.
  2. Le collaborateur apparaît instantanément dans la base de données et dans le radar.
  3. Validation stricte avec Pydantic côté backend.

### US-02 : Radar visuel avec alertes automatiques (Must Have)
- **En tant que :** Collaborateur ou Manager
- **Je veux :** Visualiser les collaborateurs avec un code couleur basé sur leur date de fin de mission
- **Afin de :** Anticiper les fins de contrat avant qu'elles ne deviennent des périodes creuses subies
- **Critères d'acceptation :**
  1. Calcul automatique des jours restants (`date_fin - aujourd'hui`).
  2. 🟢 **Vert :** Plus de 30 jours restants.
  3. 🟠 **Orange :** Moins de 15 jours restants (Alerte proactive).
  4. 🔴 **Rouge :** Date dépassée ou aujourd'hui (En intermission).
  5. Tri par urgence décroissante.

### US-03 : Sélecteur d'identité actif & Architecture flexible (Must Have)
- **En tant que :** Utilisateur
- **Je veux :** Changer de profil actif via un sélecteur en haut de l'écran
- **Afin de :** Tester facilement l'application sans mot de passe au début, tout en restant prêt pour un futur écran de connexion
- **Critères d'acceptation :**
  1. Menu déroulant avec la liste des collaborateurs + le profil Manager.
  2. L'interface s'adapte au profil sélectionné en direct.
  3. Utilisation de `AuthContext` côté front et `get_current_user()` côté back.

---

## 🎯 EPIC 2 : Réserve d'Initiatives Pré-validées (Top-Down)

### US-04 : Dépôt d'une initiative par le Manager (Must Have)
- **En tant que :** Manager
- **Je veux :** Publier un sujet interne dans la réserve d'initiatives
- **Afin que :** Les futurs collaborateurs en intermission aient du travail prêt à l'emploi
- **Critères d'acceptation :**
  1. Champs : Titre, Description, Métier cible (`Dev`, `QA`, `PO`, `DevOps`, `Tous`), Durée (`Flash < 3j`, `Sprint 1-2 sem`, `Fond > 2 sem`).
  2. Statut initial automatique : `🟢 DISPONIBLE`.
  3. Apparaît immédiatement dans le catalogue public.

### US-05 : Filtrage du catalogue par Métier et Durée (Must Have)
- **En tant que :** Collaborateur
- **Je veux :** Filtrer les initiatives selon mon métier et mon temps disponible
- **Afin de :** Trouver en 5 secondes un sujet adapté à ma situation
- **Critères d'acceptation :**
  1. Filtre dynamique par métier (`Dev`, `QA`, `PO`, `DevOps`, `Tous`).
  2. Filtre par durée (`Flash`, `Sprint`, `Fond`).
  3. Ajustement par défaut au métier du collaborateur connecté.

### US-06 : Prise en charge immédiate en 1 clic (Must Have)
- **En tant que :** Collaborateur
- **Je veux :** Cliquer sur « Je prends ce sujet » sur une initiative disponible
- **Afin de :** Démarrer le travail immédiatement sans échange d'e-mails
- **Critères d'acceptation :**
  1. Le statut passe immédiatement à `🚀 EN_COURS`.
  2. Le collaborateur connecté est automatiquement assigné à l'initiative.
  3. L'initiative n'apparaît plus disponible pour les autres.

---

## 🎯 EPIC 3 : Boîte à Idées & Validation en 1 clic (Bottom-Up)

### US-07 : Proposition d'une idée par le Collaborateur (Must Have)
- **En tant que :** Collaborateur
- **Je veux :** Soumettre une idée de projet interne ou de formation qui me tient à cœur
- **Afin de :** La faire valider simplement par mon manager
- **Critères d'acceptation :**
  1. Formulaire minimal : Titre, Description, Métier, Durée estimée.
  2. Statut initial : `🟡 A_VALIDER`.
  3. Apparaît dans la file d'attente du manager.

### US-08 : Validation ou Refus en 1 clic par le Manager (Must Have)
- **En tant que :** Manager
- **Je veux :** Valider ou refuser les idées soumises par mes collaborateurs en 1 clic
- **Afin d' :** Éviter les échanges d'e-mails sans fin et débloquer mon collaborateur instantanément
- **Critères d'acceptation :**
  1. Bouton « ✅ Valider » ➔ Statut passe à `🚀 EN_COURS`.
  2. Bouton « ❌ Refuser » ➔ Statut passe à `REFUSE` avec motif optionnel.
  3. Mise à jour en temps réel sur l'écran du collaborateur.

### US-09 : Clôture avec lien du livrable final (Must Have)
- **En tant que :** Collaborateur
- **Je veux :** Marquer mon initiative comme terminée en ajoutant le lien vers mon livrable
- **Afin de :** Prouver la valeur de mon travail auprès de l'entreprise
- **Critères d'acceptation :**
  1. Bouton « 🏁 Marquer comme terminé » sur une tâche `EN_COURS`.
  2. Popup demandant le lien du livrable (GitHub, Notion, Certification).
  3. Statut passe à `🏁 TERMINE`.

---

## 🤖 EPIC 4 : Assistant IA Optionnel (Ollama)

### US-10 : Suggestion d'initiatives adaptées au profil (Could Have)
- **En tant que :** Collaborateur ou Manager
- **Je veux :** Cliquer sur « 💡 Suggérer une idée avec l'IA »
- **Afin d' :** Obtenir des propositions pertinentes en cas de manque d'inspiration
- **Critères d'acceptation :**
  1. Envoi du rôle métier à Ollama (ex: `QA`).
  2. Ollama génère 2 propositions concrètes avec titre et livrable attendu.
  3. Bouton « Ajouter au catalogue ».
