# Rapport des corrections de l'API

**Projet :** Le Rayon - Bibliothèque de quartier  
**Date :** 20 septembre 2026  
**Périmètre :** communication frontend/API, routes Express, accès PostgreSQL et cohérence des contrats de données

## 1. Objet du rapport

Ce rapport recense les problèmes rencontrés lors de l'intégration entre le frontend et l'API, explique leur origine, décrit les corrections apportées et présente les vérifications réalisées.

L'objectif était de permettre au frontend de :

- récupérer les auteurs, livres et adhérents ;
- créer et supprimer les ressources principales ;
- afficher les statistiques du tableau de bord ;
- créer un emprunt et enregistrer le retour d'un livre ;
- communiquer avec l'API depuis un serveur frontend local.

## 2. Diagnostic initial

Plusieurs problèmes se cumulaient. Certains empêchaient la requête d'atteindre l'API, tandis que d'autres apparaissaient après réception de la réponse, lorsque le frontend essayait de lire des propriétés qui n'existaient pas dans les données renvoyées par PostgreSQL.

Les principaux symptômes étaient :

- aucune donnée visible dans les tableaux frontend ;
- impossibilité d'enregistrer un adhérent ;
- erreurs lors de la création d'un emprunt ;
- impossibilité de récupérer ou de terminer un emprunt ;
- statistiques affichées à zéro ou laissées vides ;
- erreurs CORS dans le navigateur.

## 3. Corrections réalisées

### 3.1. Absence de CORS côté Express

**Problème**

Le frontend est servi depuis une origine différente de l'API (`localhost:5500` ou `file://` contre `localhost:3000`). Le serveur Express ne renvoyait pas les en-têtes CORS nécessaires. Le navigateur bloquait donc les requêtes `fetch()` avant que le frontend puisse lire la réponse.

**Correction**

Un middleware CORS a été ajouté dans `backend/server.js`. Il autorise :

- les origines du frontend local ;
- les méthodes `GET`, `POST`, `PUT`, `DELETE` et `OPTIONS` ;
- les headers `Content-Type` et `Authorization` ;
- les requêtes de pré-vérification `OPTIONS` avec une réponse `204`.

**Résultat**

Le frontend peut désormais communiquer avec l'API depuis un serveur HTTP local.

**Validation**

Une requête de pré-vérification a répondu correctement :

```text
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

### 3.2. Contrat des auteurs incohérent

**Problème**

Le backend renvoie les colonnes SQL suivantes :

```text
author_id
author_name
author_nationality
```

Mais la vue frontend cherchait des propriétés d'un autre modèle :

```text
id
first_name
last_name
```

Le formulaire envoyait également `first_name` et `last_name`, alors que le controller backend attend `name` et `nationality`.

**Correction**

La vue auteur utilise maintenant :

```js
{
  name: "Nom complet",
  nationality: "Nationalité"
}
```

L'affichage et les boutons de suppression utilisent `author_id`, `author_name` et `author_nationality`.

**Résultat**

Les auteurs reçus par l'API peuvent être affichés et supprimés avec les bons identifiants.

### 3.3. Réponse des livres encapsulée dans `booksList`

**Problème**

La route `GET /api/books` ne renvoie pas directement un tableau. Elle renvoie :

```json
{
  "booksList": []
}
```

La vue faisait directement :

```js
books.forEach(...)
```

Cela provoquait une erreur car `books` était un objet et non un tableau.

**Correction**

La vue extrait maintenant le tableau avant de l'utiliser :

```js
const response = await fetchBooks();
const books = response.booksList || response;
```

Les noms de propriétés ont également été alignés avec la base :

| Ancienne propriété | Propriété correcte |
|---|---|
| `id` | `book_id` |
| `title` | `book_title` |
| `published_year` | `book_year_of_publication` |
| absence de statut | `book_availability_status` |

**Résultat**

Le catalogue peut être affiché avec l'identifiant, le titre, l'année et le statut de disponibilité du livre.

### 3.4. Mauvaise URL de suppression d'un livre

**Problème**

Le frontend appelait :

```text
DELETE /api/books/:id
```

La route Express réelle est :

```text
DELETE /api/books/delete/:book_id
```

**Correction**

`frontend/js/api/bookApi.js` appelle désormais :

```text
DELETE http://localhost:3000/api/books/delete/:id
```

**Résultat**

La suppression utilise maintenant la route réellement déclarée par l'API.

### 3.5. Contrat des adhérents incohérent

**Problème**

La base utilise les colonnes :

```text
member_id
member_firstname
member_lastname
member_email
member_address
member_contact
```

La vue frontend utilisait auparavant des propriétés génériques comme `id`, `first_name`, `last_name` et `phone`.

**Correction**

L'affichage utilise maintenant les noms SQL réels :

```js
member.member_id
member.member_firstname
member.member_lastname
member.member_email
member.member_address
member.member_contact
```

Le formulaire envoie les propriétés attendues par le modèle :

```js
{
  firstname,
  lastname,
  email,
  address,
  contact
}
```

**Résultat**

La liste des adhérents peut être affichée avec toutes les informations disponibles.

### 3.6. Colonne `member_contact` obligatoire non enregistrée

**Problème**

La base PostgreSQL contenait une colonne `member_contact` définie en `NOT NULL`. Le modèle SQL n'insérait pourtant que quatre colonnes :

```text
member_firstname
member_lastname
member_email
member_address
```

L'API renvoyait donc une erreur `500` :

```text
null value in column "member_contact" of relation "members"
violates not-null constraint
```

**Correction**

Les éléments suivants ont été alignés :

- ajout du champ téléphone/contact dans `frontend/members.html` ;
- lecture du champ dans `frontend/js/views/memberView.js` ;
- envoi de `contact` dans le payload JSON ;
- ajout de `member_contact` dans l'`INSERT` du modèle ;
- ajout de `member_contact` dans l'`UPDATE` du modèle ;
- affichage du contact dans le tableau frontend ;
- mise à jour de `backend/schema.sql`.

Le type réel de la colonne a été vérifié dans PostgreSQL :

```text
member_contact | integer | NO
```

Le champ HTML utilise donc `type="number"`.

**Résultat**

Un adhérent peut être créé avec un contact numérique obligatoire.

**Validation**

Test réalisé avec succès :

```text
POST /api/members -> HTTP/1.1 201 Created
```

L'adhérent de test a ensuite été supprimé afin de ne pas modifier définitivement les données de la base.

### 3.7. Route de récupération des emprunts absente

**Problème**

Le frontend appelait :

```text
GET /api/loans
```

Mais le routeur ne déclarait que les routes `POST` et `PUT`. La récupération des emprunts renvoyait donc `404 Not Found`.

**Correction**

Une route `GET /` a été ajoutée dans `backend/src/routes/loanRoutes.js`.

Un modèle `getAllLoans()` a également été ajouté pour récupérer les emprunts depuis PostgreSQL.

**Résultat**

La route suivante est maintenant disponible :

```text
GET http://localhost:3000/api/loans
```

### 3.8. Suppression d'emprunt incorrecte

**Problème**

Le frontend utilisait `DELETE /api/loans/:id`, alors que le backend ne supprimait pas les emprunts. La logique métier prévue est un retour de livre, pas une suppression.

**Correction**

La fonction frontend a été remplacée par `returnLoan(id)` et appelle :

```text
PUT /api/loans/:loan_id/return
```

Le statut de l'emprunt devient retourné et le livre redevient disponible.

### 3.9. Token manquant sur les actions d'emprunt

**Problème**

Le middleware backend vérifie le header :

```http
Authorization: secret-token-biblio
```

Le frontend ne l'envoyait pas. Les créations et retours d'emprunts étaient donc rejetés avec `401 Unauthorized`.

**Correction**

Le header d'autorisation a été ajouté aux fonctions de création et de retour dans `frontend/js/api/loanApi.js`.

**Résultat**

Les actions protégées utilisent désormais le contrat attendu par `authMiddleware.js`.

### 3.10. Date d'emprunt lue avec un mauvais nom

**Problème**

Le controller vérifiait `estimatedReturnDate`, tandis que le frontend et le modèle utilisaient `estimated_return_date`.

La validation pouvait donc considérer la date comme absente ou incorrecte.

**Correction**

Le controller accepte maintenant le nom envoyé par le frontend :

```js
const estimatedReturnDate =
  bodyRequest.estimated_return_date || bodyRequest.estimatedReturnDate;
```

La date est ensuite utilisée pour la validation et l'insertion SQL.

### 3.11. Statistiques consommées avec de mauvais noms

**Problème**

Le backend renvoie des clés en `snake_case` :

```text
total_books
total_members
number_current_loan
number_of_overdue_loan
most_borrowed_book
most_active_member
```

La vue frontend cherchait des clés en `camelCase` et des objets différents :

```text
totalBooks
totalMembers
activeLoans
lateLoans
popularBook
activeMember
```

**Correction**

`dashView.js` utilise maintenant les noms réellement fournis par `dashboardController.js`, notamment :

```js
stats.total_books
stats.total_members
stats.number_current_loan
stats.number_of_overdue_loan
stats.most_borrowed_book
stats.most_active_member
```

**Résultat**

Les compteurs et les classements du tableau de bord sont alimentés par les valeurs retournées par PostgreSQL.

## 4. Fichiers concernés

### Backend

- `backend/server.js`
- `backend/schema.sql`
- `backend/src/controllers/loanController.js`
- `backend/src/models/loanModel.js`
- `backend/src/models/memberModel.js`
- `backend/src/routes/loanRoutes.js`

### Frontend

- `frontend/members.html`
- `frontend/js/api/bookApi.js`
- `frontend/js/api/loanApi.js`
- `frontend/js/views/authorView.js`
- `frontend/js/views/bookView.js`
- `frontend/js/views/dashView.js`
- `frontend/js/views/loanView.js`
- `frontend/js/views/memberView.js`

## 5. Vérifications réalisées

Les vérifications suivantes ont été réalisées après les corrections :

- contrôle syntaxique de tous les fichiers JavaScript avec `node --check` ;
- vérification des diagnostics dans les fichiers modifiés ;
- test de pré-requête CORS avec `OPTIONS /api/books` ;
- test `GET /api/members` avec réponse `200 OK` ;
- test `POST /api/members` avec réponse `201 Created` ;
- suppression de la donnée adhérent créée pour le test ;
- vérification de la structure réelle de la table `members` dans PostgreSQL.

## 6. État actuel de l'API

Les routes principales actuellement disponibles sont :

| Ressource | Lecture | Création | Modification | Suppression / retour |
|---|---|---|---|---|
| Auteurs | `GET /api/authors` | `POST /api/authors` | `PUT /api/authors/:id` | `DELETE /api/authors/:id` |
| Livres | `GET /api/books` | `POST /api/books` | `PUT /api/books/update/:book_id` | `DELETE /api/books/delete/:book_id` |
| Adhérents | `GET /api/members` | `POST /api/members` | `PUT /api/members/:id` | `DELETE /api/members/:id` |
| Emprunts | `GET /api/loans` | `POST /api/loans` | - | `PUT /api/loans/:loan_id/return` |
| Dashboard | `GET /api/dashboard` | - | - | - |

Les routes de création et de retour d'emprunt nécessitent le header :

```http
Authorization: secret-token-biblio
```

## 7. Points restant à améliorer

Les corrections précédentes rendent l'intégration fonctionnelle, mais plusieurs points restent recommandés pour une version professionnelle :

1. Déplacer les identifiants PostgreSQL dans des variables d'environnement.
2. Remplacer le token fixe par une authentification réelle.
3. Remplacer `Access-Control-Allow-Origin: *` par une liste d'origines autorisées.
4. Ajouter une validation complète des données entrantes côté backend.
5. Utiliser des transactions PostgreSQL pour garantir la cohérence entre la création d'un emprunt et la mise à jour du livre.
6. Retourner des erreurs structurées et cohérentes pour toutes les routes.
7. Ajouter des tests automatisés pour les controllers, les modèles et les parcours principaux.
8. Corriger l'endpoint d'historique des emprunts d'un adhérent, qui renvoie actuellement un message statique.
9. Ajouter une pagination réelle pour les livres.
10. Ajouter des scripts npm `start`, `dev` et `test`.

## Conclusion

Les difficultés initiales venaient principalement d'un contrat non partagé entre le frontend, les controllers, les modèles SQL et la base PostgreSQL. Les corrections ont consisté à faire correspondre les URLs, les méthodes HTTP, les headers, les noms de propriétés et les colonnes SQL.

La communication frontend/API est maintenant fonctionnelle pour les ressources testées, avec une attention particulière portée aux adhérents et aux emprunts.
