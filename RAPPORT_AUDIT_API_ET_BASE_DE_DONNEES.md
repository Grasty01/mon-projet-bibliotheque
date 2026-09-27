# Rapport d'audit et plan de correction de l'API

**Projet :** Le Rayon - Bibliothèque de quartier  
**Date :** 27 septembre 2026  
**Périmètre :** API Express, accès PostgreSQL, schéma SQL et cohérence avec le frontend  
**Nature du document :** audit et recommandations uniquement. Aucune modification de l'API ou du schéma n'a été apportée.

## 1. Référentiel et limites de l'audit

Aucun fichier autonome de cahier des charges n'a été trouvé dans le dépôt. Pour établir le périmètre fonctionnel, cet audit s'appuie sur les fonctionnalités annoncées dans [README.md](README.md), le contrat API qu'il documente, et l'historique d'intégration présent dans [RAPPORT_CORRECTIONS_API.md](RAPPORT_CORRECTIONS_API.md). Les exigences qui ne figurent pas dans ces documents doivent être confirmées avec le cahier des charges original avant développement.

L'analyse décrit l'état des sources actuellement présentes, et non l'état qui aurait été testé lors de corrections précédentes. Plusieurs recommandations concernent un déploiement professionnel; elles ne signifient pas que le projet local est inutilisable.

## 2. Synthèse

Les fonctions CRUD de base, le tableau de bord et le cycle d'emprunt/retour sont représentés dans les routes. Toutefois, des défauts importants empêchent de considérer l'API comme robuste en production :

- le mot de passe PostgreSQL et le token d'autorisation sont inscrits en clair dans le code; le token est également livré au navigateur et ne protège donc pas réellement les opérations;
- l'emprunt et le retour mettent à jour plusieurs lignes sans transaction, avec une course possible entre deux emprunts concurrents;
- certains chemins renvoient des statuts incorrects ou échouent avec une exception au lieu d'une réponse métier propre;
- l'historique des emprunts d'un adhérent est un placeholder, pas une fonctionnalité;
- le fichier de création SQL ne bascule pas vers `library_db` après `CREATE DATABASE`, alors que le README demande de l'exécuter en une seule commande;
- le schéma ne formalise pas plusieurs invariants métier et ses suppressions peuvent faire perdre des livres ou être bloquées par l'historique.

**Ordre recommandé :** sécuriser les secrets et l'accès DB; rendre les opérations d'emprunt atomiques; corriger les erreurs fonctionnelles; renforcer le schéma via des migrations contrôlées; puis formaliser validation, contrats, tests et exploitation.

## 3. Constats API, par priorité

### P0 - Secrets et contrôle d'accès non sûrs

**Constat.** [backend/config/db.js](backend/config/db.js) contient des paramètres de connexion en dur, dont un mot de passe et l'utilisateur PostgreSQL `postgres`. [backend/src/middlewares/authMiddleware.js](backend/src/middlewares/authMiddleware.js) accepte un token constant codé en dur. Le même token apparaît dans [frontend/js/api/loanApi.js](frontend/js/api/loanApi.js), donc tout utilisateur peut le lire dans le navigateur et appeler les routes protégées. Seules les créations et retours d'emprunts passent par ce middleware; les opérations sur les autres ressources et les données personnelles ne sont pas authentifiées.

**Risque.** Une fuite du dépôt, du bundle frontend ou de la machine expose la base ou permet d'usurper le rôle de bibliothécaire. Un token statique côté client ne constitue pas une authentification.

**À faire.** Révoquer/renouveler le mot de passe actuellement écrit dans le dépôt, créer un compte DB applicatif à privilèges minimaux, charger les secrets depuis l'environnement (et un gestionnaire de secrets en production), ne jamais embarquer de secret serveur dans le frontend et mettre en place une vraie authentification avec autorisation par rôle. Protéger aussi les opérations sur les adhérents et les données personnelles selon le besoin métier. CORS ne remplace pas l'authentification.

### P1 - Emprunt/retour non atomiques et concurrence

**Constat.** [backend/src/controllers/loanController.js](backend/src/controllers/loanController.js) vérifie la disponibilité, insère l'emprunt, puis met à jour le livre avec des requêtes distinctes. Le retour fait également deux mises à jour séparées. Chaque modèle utilise son propre appel au pool et aucun client transactionnel n'est passé entre ces opérations.

**Risque.** Une erreur après la première écriture laisse un emprunt et la disponibilité du livre incohérents. Deux requêtes simultanées peuvent toutes deux lire le livre comme disponible puis créer deux emprunts actifs. Un retour échoué à mi-parcours a le problème inverse.

**À faire.** Déplacer ces opérations dans une fonction métier transactionnelle utilisant un même client `pg` (`BEGIN` / `COMMIT` / `ROLLBACK`). Réserver le livre par une mise à jour conditionnelle atomique (`... WHERE book_availability_status = true RETURNING ...`) ou un verrou de ligne; si aucune ligne n'est retournée, répondre que le livre n'est plus disponible. Ajouter en base une contrainte empêchant deux emprunts actifs du même exemplaire (proposition §5). Vérifier et traiter le retour dans la même transaction.

### P1 - Erreurs lors de mises à jour/suppressions d'adhérents inexistants

**Constat.** Dans [backend/src/models/memberModel.js](backend/src/models/memberModel.js), `updateExistingMember` et `deleteExistingMembber` font un `findMemberById`, puis lisent `memberToBeUpdated[0].member_id` / `memberToBeDeleted[0].member_id` sans vérifier que le tableau contient une ligne.

**Impact.** Un identifiant absent provoque une exception TypeError et finit en erreur serveur, au lieu d'un `404`. La lecture préalable est en outre inutile : `UPDATE ... WHERE member_id = $id RETURNING *` ou `DELETE ... RETURNING *` suffit à savoir si la ressource existe.

**À faire.** Exécuter directement l'écriture avec l'identifiant fourni, examiner la ligne retournée et traiter zéro ligne comme `404 Not Found`. Valider également que l'identifiant est un entier positif.

### P1 - Historique d'emprunts non implémenté

**Constat.** La route `GET /api/members/:id/loans` est déclarée dans [backend/src/routes/memberRoutes.js](backend/src/routes/memberRoutes.js), mais `getAllOfLoansMember` dans [backend/src/controllers/memberController.js](backend/src/controllers/memberController.js) renvoie seulement un texte statique.

**Impact.** L'exigence annoncée dans le README (historique des emprunts d'un membre) n'est pas satisfaite; ni les emprunts actifs ni les retours passés ne sont récupérés.

**À faire.** Ajouter une requête paramétrée filtrée par `member_id`, joindre les informations nécessaires sur le livre et trier par date/id. Distinguer un membre inexistant (`404`) d'un membre existant sans emprunt (réponse `200` avec `[]`). Ajouter un test pour chacun de ces cas.

### P1 - Création et suppression d'auteur : résultat absent mal géré

**Constat.** [backend/src/controllers/authorController.js](backend/src/controllers/authorController.js) teste la vérité de `newAuthorWasUpdated` et `authorWasDeleted`, qui sont des objets résultat PostgreSQL même quand `rows` est vide. Après une suppression d'identifiant inconnu, le contrôleur accède à `authorWasDeleted.rows[0].author_name`, ce qui peut lever une TypeError. Une mise à jour inexistante peut retourner `201` avec un tableau vide. La mise à jour lit `req.query`, alors que les autres modifications emploient le corps JSON; le contrat de modification n'est pas documenté clairement dans le README.

**À faire.** Tester `result.rows[0]`; renvoyer `404` si elle est absente; répondre `200` pour une mise à jour et `201` uniquement pour une création. Standardiser la mise à jour en JSON (`req.body`) et documenter les propriétés requises.

### P1 - Erreur de propriété dans la création d'un livre

**Constat.** [backend/src/controllers/bookController.js](backend/src/controllers/bookController.js) vérifie `result.lenght` au lieu de `result.length`.

**Impact.** La condition ne permet pas de détecter une liste vide. Les erreurs SQL restent propagées, mais la vérification de succès est inopérante et peut masquer un défaut de contrat ou une régression.

**À faire.** Corriger le contrôle et ajouter un test qui vérifie la réponse de création. Renvoie `404` pour une mise à jour/suppression de livre inconnu plutôt qu'un `400` générique; `DELETE` synchrone doit normalement répondre `204` sans corps ou `200` avec la ressource supprimée, plutôt que `202`.

### P1 - Gestionnaire d'erreurs incorrect et fuites d'informations

**Constat.** [backend/server.js](backend/server.js) journalise `err.statck` (typo, la propriété habituelle est `stack`). Les modèles construisent des erreurs contenant souvent le texte de l'erreur PostgreSQL; le gestionnaire renvoie `err.message` au client, ce qui peut exposer des détails SQL et de schéma. Il n'y a pas de middleware JSON `404` pour les routes inconnues. Le contrôleur du tableau de bord intercepte séparément les erreurs et renvoie `400`, même quand la panne est serveur/DB.

**À faire.** Centraliser la traduction des erreurs avec un format stable (`code`, `message`, éventuellement `details` de validation), journaliser les détails serveur sans les exposer en production, distinguer `4xx` et `5xx`, ajouter une réponse `404` JSON et faire passer les erreurs du dashboard par la même stratégie. Ne jamais envoyer au client les messages bruts PostgreSQL.

### P2 - Les listes vides sont traitées comme des erreurs

**Constat.** Les contrôleurs livres et membres renvoient `404` quand leur liste est vide. Le contrôleur auteurs compare `results.rows === 0` alors que `findAllAuthors` renvoie déjà un tableau depuis [backend/src/models/authorModel.js](backend/src/models/authorModel.js); cette vérification est inopérante. `GET /api/loans` renvoie aussi `404` sans emprunt.

**À faire.** Pour une collection valide mais vide, renvoyer `200` avec `[]` (ou l'objet de pagination vide). Réserver `404` à une ressource précise absente. Cela simplifie les vues frontend et évite de traiter une bibliothèque nouvellement installée comme une panne.

### P2 - Validation des entrées insuffisante

**Constat.** Les contrôleurs transmettent `req.body`, `req.params` et des dates aux modèles sans validation complète. La date d'emprunt accepte deux conventions de nom; `new Date()` peut normaliser ou mal interpréter certaines chaînes. Les champs obligatoires, types, longueurs, email et plages numériques ne sont pas validés avant les requêtes.

**À faire.** Définir un schéma de validation par endpoint (par exemple avec une bibliothèque maintenue), rejeter les propriétés inconnues si approprié, normaliser les chaînes, vérifier les identifiants entiers positifs, l'email et une date ISO calendaire réelle. Retourner `400` ou `422` avec erreurs de champs prévisibles. La validation applicative complète les contraintes SQL, elle ne les remplace pas.

### P2 - Contrats API inégaux et sélection `SELECT *`

**Constat.** Les réponses sont tantôt des tableaux, tantôt enveloppées (`booksList`, `updatedBook`), les suppressions ont différents formats et les erreurs diffèrent. Les modèles utilisent `SELECT *`, ce qui expose toute nouvelle colonne par défaut et lie le JSON directement au schéma SQL.

**À faire.** Choisir une convention de réponse stable, exposer des DTO explicites (noms API cohérents, indépendants des noms de colonnes), sélectionner explicitement les colonnes, documenter les payloads et statuts. Pour les listes qui grandissent, ajouter pagination/tri/filtrage bornés; un point est déjà recommandé dans le rapport historique, mais pas implémenté ici.

### P2 - Configuration et exploitation minimales

**Constat.** [backend/server.js](backend/server.js) fixe le port à `3000`, utilise `cors()` sans liste d'origines, n'expose pas de route de santé et ne gère pas explicitement arrêt/grâce du serveur et du pool. Les logs ne comportent ni identifiant de requête ni structure exploitable. [package.json](package.json) ne fournit pas de scripts de démarrage/test fonctionnels; le script `test` échoue volontairement.

**À faire.** Externaliser port et environnement, restreindre CORS aux origines requises, ajouter une limite de taille de requête adaptée, en-têtes de sécurité (par exemple Helmet), limitation de débit sur les endpoints sensibles, journalisation structurée sans données personnelles, endpoints liveness/readiness et arrêt gracieux. Prévoir des scripts `start`, `dev`, `test` et une configuration de déploiement reproductible.

## 4. Audit du fichier `schema.sql`

### P0 - Le script peut créer les tables dans la mauvaise base

**Constat.** [backend/schema.sql](backend/schema.sql) exécute `CREATE DATABASE library_db`, puis enchaîne immédiatement avec `CREATE TABLE`. `CREATE DATABASE` ne change pas la base utilisée par la session `psql`. Or [README.md](README.md) conseille `psql -U postgres -f backend/schema.sql`, qui ouvre généralement la base par défaut `postgres`. Dans ce cas, les tables sont créées dans `postgres`, pas dans `library_db`, alors que l'application se connecte à `library_db`.

**À faire.** Séparer la création de la base de la création du schéma, puis exécuter le second script avec `psql -d library_db`; ou utiliser explicitement `\connect library_db` si le script est destiné à `psql` seulement. Documenter et tester l'installation à partir d'une base vierge. Le script actuel ne doit pas être considéré idempotent : `CREATE DATABASE` et `CREATE TABLE` échouent si les objets existent déjà.

### P1 - Permissions de base trop larges

**Constat.** La base est créée avec `OWNER = postgres`, et la configuration runtime utilise également `postgres`.

**À faire.** Réserver le superutilisateur aux opérations d'administration/migration. Créer un rôle propriétaire du schéma utilisé uniquement par les migrations, puis un rôle d'exécution avec les seuls droits nécessaires (`SELECT`, `INSERT`, `UPDATE`, `DELETE` sur les tables concernées, séquences selon l'usage). Interdire à l'application de créer des bases, rôles ou extensions. Limiter l'accès réseau à PostgreSQL et exiger TLS lorsque la DB est distante.

### P1 - Modèle d'emprunt sans historique temporel complet

**Constat.** `loans` stocke une date de retour prévue et un booléen `is_returned`, mais pas la date d'emprunt ni la date effective de retour. Le booléen ne permet pas de savoir quand le retour a été fait ni d'auditer le cycle de vie.

**À faire.** Ajouter une date/heure de création d'emprunt (`timestamptz`) et une date/heure de retour effective nullable. Définir la cohérence (`is_returned` et `returned_at` ne doivent pas diverger) ou remplacer le booléen par un modèle d'état approprié. Planifier le remplissage des anciennes lignes à partir de données fiables; ne pas inventer de dates historiques lors d'une migration.

### P1 - État du livre dupliqué entre `books` et `loans`

**Constat.** `books.book_availability_status` décrit une disponibilité qui peut être déduite de la présence d'un emprunt non retourné. Cette valeur est mise à jour séparément de la ligne d'emprunt et peut diverger. Le schéma ne garantit pas qu'un seul emprunt actif existe par livre.

**À faire.** Décider quelle donnée est la source de vérité. Pour un exemplaire physique par ligne, l'emprunt actif peut piloter la disponibilité; si le booléen est conservé pour les lectures, les deux états doivent être modifiés transactionnellement et contrôlés. Après nettoyage d'éventuels doublons existants, une contrainte PostgreSQL peut protéger contre deux emprunts ouverts :

```sql
CREATE UNIQUE INDEX loans_one_active_loan_per_book
    ON loans (book_id)
    WHERE is_returned = false;
```

Si chaque ligne `books` représente un titre avec plusieurs exemplaires, le modèle devra plutôt séparer `book_title`/catalogue et `book_copy`/exemplaires; ne pas appliquer cet index à un inventaire multi-exemplaires sans adapter le modèle.

### P1 - Politique de suppression incompatible avec l'historique

**Constat.** `books.author_id` est en `ON DELETE CASCADE`: supprimer un auteur supprime ses livres. Les lignes `loans` référencent ensuite ces livres sans cascade; une suppression peut donc être bloquée dès qu'un livre a un historique d'emprunt. La suppression d'un adhérent ayant des emprunts est également bloquée par le comportement par défaut de la clé étrangère. Cette protection DB vaut mieux qu'une suppression incohérente, mais l'API ne traduit pas clairement le conflit.

**À faire.** Préserver l'historique de bibliothèque : envisager une désactivation/archivage (`deleted_at` ou `is_active`) des auteurs, livres et membres plutôt qu'une suppression physique. Sinon, formaliser pour chaque relation `RESTRICT`/`NO ACTION`/`CASCADE` en fonction d'une règle métier claire, et transformer une violation de clé étrangère en `409 Conflict` compréhensible. Ne pas mettre `CASCADE` sur les emprunts historiques sans règle de conservation explicite.

### P2 - Coordonnées et contraintes métier insuffisantes

**Constat.** `member_contact INTEGER` n'est pas un type de numéro de téléphone : il perd les zéros initiaux, ne représente pas `+`, et borne artificiellement le format. `member_email` n'est ni unique ni normalisé, malgré le besoin courant d'identifier un compte par email. Les champs texte obligatoires peuvent contenir une chaîne vide. L'année de publication n'a pas de contrainte de domaine.

**À faire.** Migrer le téléphone vers un champ texte de longueur raisonnable (par exemple `VARCHAR(32)`), valider le format côté API et préserver les valeurs déjà stockées. Après détection/résolution des doublons, rendre l'email unique selon une règle insensible à la casse, par exemple un index sur `lower(btrim(member_email))`. Ajouter des contrôles pour les noms/titres non vides après trim et choisir une plage d'année conforme au cahier des charges. Vérifier les données existantes avant d'ajouter toute contrainte.

Exemple d'index email à n'appliquer qu'après audit des doublons :

```sql
CREATE UNIQUE INDEX members_email_normalized_uq
    ON members (lower(btrim(member_email)));
```

### P2 - Indexation manquante sur les relations

**Constat.** Les clés primaires sont indexées, mais PostgreSQL ne crée pas automatiquement d'index sur les colonnes référentes (`books.author_id`, `loans.member_id`, `loans.book_id`). Les listes, jointures, recherches d'historique et contrôles de suppression peuvent ralentir quand les tables grossissent.

**À faire.** Mesurer les requêtes puis indexer au minimum les clés étrangères souvent filtrées/jointes. Le filtre `is_returned = false` peut bénéficier de l'index partiel précédent. Ajouter les index correspondant aux recherches réelles et contrôler leur utilité avec `EXPLAIN (ANALYZE, BUFFERS)` sur des données représentatives.

### P2 - Script initial non versionné et sauvegardes non spécifiées

**Constat.** `schema.sql` représente une installation initiale, sans système de migration/version de schéma ni stratégie de sauvegarde décrite.

**À faire.** Conserver le bootstrap pour une base neuve, puis versionner les changements avec des migrations séquentielles testées en staging. Documenter sauvegardes chiffrées, rétention, restauration périodiquement vérifiée et procédure de rotation des secrets. Une sauvegarde non testée n'est pas une procédure de reprise.

## 5. Plan de correction étape par étape

1. **Avant toute correction**, confirmer le cahier des charges original, les règles de suppression et si un livre est un titre ou un exemplaire physique. Faire une sauvegarde vérifiée de la base; inventorier les utilisateurs, données et doublons existants.
2. **Fermer les expositions de secrets.** Renouveler le mot de passe présent dans le dépôt; créer un compte DB dédié et à privilèges minimaux; sortir secrets/port/origines des sources. Remplacer le token statique par une authentification réelle, sans secret dans le frontend.
3. **Fiabiliser les emprunts.** Introduire une transaction commune pour réserver un livre + créer un emprunt et pour enregistrer le retour; empêcher atomiquement les doubles emprunts actifs; décider quelle donnée fait autorité pour la disponibilité.
4. **Corriger les bugs API de priorité P1.** Cas d'adhérent inexistant, réponse auteur inexistante, propriété `lenght`, historique d'emprunts statique, erreurs non atomiques. Appliquer les statuts HTTP appropriés.
5. **Fixer l'installation SQL.** Séparer création DB et création tables ou connecter explicitement le script à `library_db`; tester les instructions du README à partir d'une instance vierge.
6. **Écrire et exécuter des migrations contrôlées.** Auditer les doublons et données invalides avant changements; choisir la politique de suppression; convertir téléphone; ajouter contraintes et index uniquement après correction des données incompatibles.
7. **Formaliser les contrats et validations.** Définir payloads/réponses, erreurs, pagination, validation backend et documentation OpenAPI. Ne plus dépendre de `SELECT *` ni exposer les colonnes de base sans filtre.
8. **Ajouter les tests automatisés.** Couvrir collections vides, identifiants inconnus, validation, erreurs FK, création/retour emprunt, deux demandes concurrentes sur un livre, routes non autorisées et retour de dashboard sans prêts. Tester les migrations sur base neuve et base contenant des données.
9. **Préparer l'exploitation.** CORS par environnement, limitation de débit, headers de sécurité, logs structurés sans données personnelles, health checks, arrêt gracieux, scripts npm et vérification de restauration de sauvegarde.

## 6. Critères d'acceptation recommandés

- Une installation vierge crée les quatre tables dans `library_db`, pas dans la base de maintenance `postgres`.
- Aucun secret de production ne se trouve dans les sources ou dans les bundles frontend; le rôle DB d'exécution n'est pas superutilisateur.
- Une liste vide renvoie `200` et `[]`; une ressource précise inconnue renvoie `404`; une suppression empêchée par l'historique renvoie `409`.
- Chaque route documente son corps JSON, sa réponse et ses codes d'erreur; les entrées invalides ne provoquent pas d'erreur `500`.
- Une panne à n'importe quelle étape d'emprunt/retour annule toutes les écritures de cette opération.
- Deux tentatives concurrentes ne peuvent pas créer deux emprunts actifs pour un même exemplaire.
- L'historique d'un membre existant renvoie ses prêts; un membre sans prêt renvoie `[]`.
- Le dashboard renvoie des valeurs explicites même lorsque la base ne contient encore aucun prêt; les erreurs DB y restent des erreurs serveur, pas des `400`.
- `npm test` exécute une suite réelle et réussie; les migrations et la restauration d'une sauvegarde sont testées.

## 7. Fichiers examinés

- [backend/server.js](backend/server.js)
- [backend/schema.sql](backend/schema.sql)
- [backend/config/db.js](backend/config/db.js)
- [backend/src/controllers](backend/src/controllers)
- [backend/src/models](backend/src/models)
- [backend/src/routes](backend/src/routes)
- [backend/src/middlewares/authMiddleware.js](backend/src/middlewares/authMiddleware.js)
- [frontend/js/api/loanApi.js](frontend/js/api/loanApi.js)
- [frontend/js/api/memberApi.js](frontend/js/api/memberApi.js)
- [package.json](package.json)
- [README.md](README.md)
- [RAPPORT_CORRECTIONS_API.md](RAPPORT_CORRECTIONS_API.md)
