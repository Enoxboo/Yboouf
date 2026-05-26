# Yboouf

Plateforme de partage de recettes du monde entier. Les utilisateurs peuvent parcourir, soumettre, noter et commenter des recettes, avec un système de modération avant publication.

## Stack

- **Backend** : Node.js, Express, PostgreSQL, Prisma ORM, JWT
- **Frontend** : React, Vite, Tailwind CSS, React Query

## Lancer le projet

### Prérequis
- Node.js 18+
- PostgreSQL

### Backend

```bash
cd backend
npm install
cp .env.example .env   # renseigner DATABASE_URL et JWT_SECRET
npx prisma migrate dev
npm run dev
```

Le serveur démarre sur `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application démarre sur `http://localhost:5173`.

## Fonctionnalités

- Inscription / connexion (JWT)
- Parcourir les recettes avec filtres (pays, type, régime, ingrédients)
- Soumettre une recette avec photo
- Noter et commenter les recettes
- Ajouter des recettes en favoris
- Profil utilisateur avec statistiques
- Espace admin : modération des recettes, gestion des utilisateurs
- Mode sombre / clair

## Rôles

| Rôle | Accès |
|------|-------|
| `USER` | Soumettre, noter, commenter, favoris |
| `MODERATOR` | + gestion des utilisateurs |
| `ADMIN` | + approbation/rejet des recettes |
| `SUPER_ADMIN` | + attribution des rôles |
