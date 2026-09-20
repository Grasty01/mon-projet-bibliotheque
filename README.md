# Le Rayon

Application web de gestion d'une bibliothèque de quartier. Le projet permet de gérer les auteurs, les livres, les adhérents et les emprunts, avec un tableau de bord statistique.

Projet réalisé dans le cadre du projet pratique des semaines 14 et 15 de l'Akieni Academy.

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Lancement](#lancement)
- [Architecture du projet](#architecture-du-projet)
- [Modèle de données](#modèle-de-données)
- [API](#api)
- [Format des données](#format-des-données)
- [Sécurité et configuration](#sécurité-et-configuration)
- [Dépannage](#dépannage)
- [Limites connues et améliorations](#limites-connues-et-améliorations)

## Fonctionnalités

### Auteurs

- Consulter la liste des auteurs.
- Ajouter un auteur avec son nom et sa nationalité.
- Supprimer un auteur.
- Modifier un auteur via l'API.

### Livres

- Consulter le catalogue des livres.
- Ajouter un livre associé à un auteur.
- Afficher l'année de publication et la disponibilité du livre.
- Rechercher un livre par titre ou par auteur via l'API.
- Supprimer ou modifier un livre via l'API.

### Adhérents

- Consulter la liste des adhérents.
- Ajouter un adhérent avec son identité, son email, son adresse et son contact.
- Supprimer un adhérent.
- Modifier un adhérent via l'API.
- Consulter le point d'entrée prévu pour l'historique des emprunts d'un adhérent.

### Emprunts

- Consulter les emprunts.
- Créer un emprunt pour un adhérent et un livre.
- Vérifier qu'un livre est disponible avant l'emprunt.
- Enregistrer le retour d'un livre.
- Détecter les emprunts en retard dans les statistiques.

### Tableau de bord

- Nombre total de livres.
- Nombre total d'adhérents.
- Nombre d'emprunts en cours.
- Nombre d'emprunts en retard.
- Livre le plus emprunté.
- Adhérent le plus actif.

## Stack technique

### Backend

- Node.js avec modules ES (`type: module`).
- Express 5.
- PostgreSQL.
- `pg` pour la connexion à PostgreSQL.
- Middleware de journalisation des requêtes.
- Middleware CORS configuré pour le frontend local.

### Frontend

- HTML5.
- CSS3, avec une feuille globale et une feuille de composants.
- JavaScript natif avec modules ES.
- `fetch()` pour communiquer avec l'API.

## Prérequis

- Node.js 18 ou une version plus récente.
- npm.
- PostgreSQL 13 ou une version plus récente.
- Un navigateur moderne.
- Un serveur HTTP local pour servir le dossier `frontend`.

## Installation

### 1. Installer les dépendances

Depuis la racine du projet :

```bash
npm install
```

### 2. Préparer PostgreSQL

Le fichier [backend/schema.sql](backend/schema.sql) crée la base `library_db` et les tables nécessaires.

Avec `psql`, une installation PostgreSQL locale peut être initialisée avec :

```bash
psql -U postgres -f backend/schema.sql
```

Selon la configuration de PostgreSQL, il peut être nécessaire de préciser l'hôte :

```bash
psql -h localhost -U postgres -f backend/schema.sql
```

Le script crée les tables suivantes :

- `authors`
- `books`
- `members`
- `loans`

### 3. Vérifier la connexion à PostgreSQL

La connexion est actuellement définie dans [backend/config/db.js](backend/config/db.js). Les valeurs utilisées par défaut sont :

| Paramètre | Valeur actuelle |
|---|---|
| Hôte | `localhost` |
| Port | `5432` |
| Utilisateur | `postgres` |
| Base | `library_db` |
| Mot de passe | valeur définie dans `backend/config/db.js` |

## Lancement

### Démarrer l'API

Depuis la racine du projet :

```bash
node backend/server.js
```

L'API est disponible à l'adresse :

```text
http://localhost:3000
```

Le projet ne contient pas encore de script npm `start`. Pour un développement plus confortable, le serveur peut être lancé avec :

```bash
npx nodemon backend/server.js
```

### Démarrer le frontend

Le frontend doit être servi par un serveur HTTP local. Il ne faut pas ouvrir directement les fichiers HTML avec une URL `file://`, car cela peut bloquer les appels `fetch()` vers l'API.

Avec l'extension VS Code Live Server :

1. Ouvrir le dossier `frontend` dans VS Code.
2. Ouvrir `frontend/index.html`.
3. Cliquer sur **Go Live**.
4. Ouvrir l'URL proposée, généralement `http://127.0.0.1:5500/frontend/`.

Les pages principales sont :

- `index.html` : tableau de bord.
- `authors.html` : gestion des auteurs.
- `books.html` : gestion des livres.
- `members.html` : gestion des adhérents.
- `loans.html` : gestion des emprunts.

## Architecture du projet

```text
mon-projet-bibliotheque/
├── backend/
│   ├── schema.sql
│   ├── server.js
│   ├── config/
│   │   ├── db.js
│   │   └── utilities.js
│   └── src/
│       ├── controllers/
│       ├── middlewares/
│       ├── models/
│       └── routes/
├── frontend/
│   ├── index.html
│   ├── authors.html
│   ├── books.html
│   ├── members.html
│   ├── loans.html
│   ├── assets/
│   ├── css/
│   │   ├── style.css
│   │   └── components.css
│   └── js/
│       ├── api/
│       ├── utils/
│       ├── views/
│       └── main.js
├── package.json
└── README.md
```

### Backend

- `server.js` : point d'entrée Express, branchement des middlewares et des routeurs.
- `routes/` : déclaration des URLs et des méthodes HTTP.
- `controllers/` : traitement des requêtes et construction des réponses HTTP.
- `models/` : requêtes SQL et accès à PostgreSQL.
- `middlewares/` : journalisation et contrôle d'accès aux actions sensibles.
- `config/db.js` : création du pool de connexions PostgreSQL.

### Frontend

- `main.js` : point d'entrée, initialisation de la sidebar et détection de la page active.
- `api/` : fonctions `fetch()` dédiées à chaque ressource.
- `views/` : rendu du DOM, formulaires et événements utilisateur.
- `css/style.css` : structure et style global.
- `css/components.css` : tableaux, formulaires, cartes et composants visuels.

## Modèle de données

```mermaiderDiagram
		AUTHORS ||--o{ BOOKS : écrit
		MEMBERS ||--o{ LOANS : effectue
		BOOKS ||--o{ LOANS : concerne

		AUTHORS {
				integer author_id PK
				varchar author_name
				varchar author_nationality
		}

		BOOKS {
				integer book_id PK
				varchar book_title
				integer author_id FK
				smallint book_year_of_publication
				boolean book_availability_status
		}

		MEMBERS {
				integer member_id PK
				varchar member_firstname
				varchar member_lastname
				varchar member_email
				varchar member_address
				integer member_contact
		}

		LOANS {
				integer loan_id PK
				integer member_id FK
				integer book_id FK
				date loan_estimated_return_date
				boolean is_returned
		}
```

### Règles métier principales

- Un livre appartient à un auteur.
- Un emprunt appartient à un adhérent et concerne un livre.
- Un livre disponible possède `book_availability_status = true`.
- Lors de la création d'un emprunt, le livre passe à `false`.
- Lors du retour, le livre repasse à `true` et l'emprunt passe à `is_returned = true`.
- Un emprunt est considéré en retard si sa date prévue est dépassée et qu'il n'est pas retourné.
- La suppression d'un auteur supprime ses livres grâce à `ON DELETE CASCADE`.

## API

URL de base :

```text
http://localhost:3000/api
```

### Auteurs

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/authors` | Liste des auteurs |
| `POST` | `/authors` | Créer un auteur |
| `PUT` | `/authors/:id` | Modifier un auteur |
| `DELETE` | `/authors/:id` | Supprimer un auteur |

Corps attendu pour la création :

```json
{
	"name": "Victor Hugo",
	"nationality": "Française"
}
```

### Livres

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/books` | Liste des livres |
| `GET` | `/books/search/book/title/:title` | Rechercher par titre exact |
| `GET` | `/books/search/book/author/:author_name` | Rechercher par nom d'auteur |
| `POST` | `/books` | Créer un livre |
| `PUT` | `/books/update/:book_id` | Modifier un livre |
| `DELETE` | `/books/delete/:book_id` | Supprimer un livre |

Corps attendu pour la création :

```json
{
	"bookTitle": "Le Petit Prince",
	"authorId": 1,
	"yearOfPublication": 1943,
	"bookAvailabilityStatus": true
}
```

La réponse de `GET /books` est enveloppée dans la propriété `booksList` :

```json
{
	"booksList": []
}
```

### Adhérents

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/members` | Liste des adhérents |
| `GET` | `/members/:id/loans` | Historique d'un adhérent |
| `POST` | `/members` | Créer un adhérent |
| `PUT` | `/members/:id` | Modifier un adhérent |
| `DELETE` | `/members/:id` | Supprimer un adhérent |

Corps attendu pour la création :

```json
{
	"firstname": "Jean",
	"lastname": "Dupont",
	"email": "jean.dupont@example.com",
	"address": "12 rue des Lilas",
	"contact": 612345678
}
```

### Emprunts

| Méthode | Route | Authentification | Description |
|---|---|---|---|
| `GET` | `/loans` | Non | Liste des emprunts |
| `POST` | `/loans` | Oui | Créer un emprunt |
| `PUT` | `/loans/:loan_id/return` | Oui | Enregistrer un retour |

Les routes protégées nécessitent le header suivant :

```http
Authorization: secret-token-biblio
```

Corps attendu pour créer un emprunt :

```json
{
	"member_id": 1,
	"book_id": 1,
	"estimated_return_date": "2026-10-01"
}
```

### Tableau de bord

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/dashboard` | Statistiques globales |

La réponse contient notamment :

```json
{
	"total_books": 0,
	"total_members": 0,
	"number_current_loan": 0,
	"number_of_overdue_loan": 0,
	"most_borrowed_book": {},
	"most_active_member": {}
}
```

## Exemples avec curl

Récupérer les adhérents :

```bash
curl http://localhost:3000/api/members
```

Créer un adhérent :

```bash
curl -X POST http://localhost:3000/api/members \
	-H "Content-Type: application/json" \
	-d '{
		"firstname": "Jean",
		"lastname": "Dupont",
		"email": "jean.dupont@example.com",
		"address": "12 rue des Lilas",
		"contact": 612345678
	}'
```

Créer un emprunt :

```bash
curl -X POST http://localhost:3000/api/loans \
	-H "Content-Type: application/json" \
	-H "Authorization: secret-token-biblio" \
	-d '{
		"member_id": 1,
		"book_id": 1,
		"estimated_return_date": "2026-10-01"
	}'
```

Enregistrer un retour :

```bash
curl -X PUT http://localhost:3000/api/loans/1/return \
	-H "Authorization: secret-token-biblio"
```

## Sécurité et configuration

La configuration actuelle est adaptée à un environnement local, mais ne doit pas être conservée telle quelle en production :

- Les identifiants PostgreSQL sont écrits en clair dans `backend/config/db.js`.
- Le token des emprunts est écrit en clair dans le middleware et le frontend.
- CORS autorise toutes les origines avec `*`.
- Il n'existe pas encore de fichier `.env.example`.
- Les erreurs SQL ne doivent pas être renvoyées directement à l'utilisateur en production.

Pour une version destinée à la production, il faudra utiliser des variables d'environnement, limiter les origines CORS, remplacer le token fixe par une authentification réelle et ajouter une validation serveur structurée.

## Dépannage

### Le frontend ne reçoit aucune donnée

Vérifier les points suivants :

1. Le backend est lancé avec `node backend/server.js`.
2. PostgreSQL est démarré et la base `library_db` existe.
3. Le frontend est ouvert via HTTP et non via `file://`.
4. L'URL `http://localhost:3000/api` est accessible.
5. La console du navigateur ne contient pas d'erreur CORS ou JavaScript.

### Erreur `ECONNREFUSED`

Le serveur Node.js ou PostgreSQL n'est probablement pas démarré, ou le port configuré ne correspond pas au port utilisé.

### Erreur CORS

Vérifier que le backend est bien celui qui contient le middleware CORS et redémarrer le serveur après toute modification.

### Erreur sur `member_contact`

La colonne est obligatoire et de type `INTEGER`. Le corps de la requête doit donc contenir une valeur numérique pour `contact`.

### Erreur `401` lors d'un emprunt

Ajouter le header :

```http
Authorization: secret-token-biblio
```

## Limites connues et prochaines améliorations

- Ajouter un script `npm start` et un script de développement avec `nodemon`.
- Déplacer les secrets dans un fichier `.env` non versionné.
- Ajouter des tests automatisés API et frontend.
- Ajouter une vraie validation des données côté serveur.
- Compléter l'historique réel des emprunts par adhérent.
- Ajouter une pagination fonctionnelle côté API et frontend.
- Ajouter la modification des auteurs, livres et adhérents dans l'interface.
- Améliorer la gestion des messages d'erreur pour afficher les détails utiles.
- Ajouter une gestion transactionnelle lors de la création d'un emprunt afin de garantir la cohérence entre `loans` et `books`.
- Remplacer l'authentification par token fixe par une authentification sécurisée.

## Licence

Projet pédagogique. Aucune licence spécifique n'est actuellement déclarée.
