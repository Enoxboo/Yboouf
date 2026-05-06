# Documentation - Fonctionnalité de Commentaires sur les Recettes

## Vue d'ensemble
Ajout d'une fonctionnalité complète de commentaires pour les recettes avec:
- ✅ Lecture des commentaires par tous les utilisateurs
- ✅ Création de commentaires par les utilisateurs authentifiés
- ✅ Suppression par les auteurs des commentaires, modérateurs et admins

## Changements du Backend

### 1. Contrôleur (recipes.controller.js)
Deux nouvelles fonctions ajoutées:

#### `addComment(req, res)`
- **Route**: `POST /api/recipes/:id/comments`
- **Authentification**: ✅ Requise (utilisateur connecté)
- **Validation**: Contenu entre 1 et 1000 caractères
- **Fonctionnalité**: 
  - Crée un nouveau commentaire
  - Retourne le commentaire créé avec les infos de l'utilisateur
  - Mets à jour le compteur de commentaires de la recette
  
**Réponse réussie (201)**:
```json
{
  "message": "Comment added successfully",
  "comment": {
    "id": "uuid",
    "content": "Excellent recette!",
    "createdAt": "2026-05-06T12:00:00Z",
    "updatedAt": "2026-05-06T12:00:00Z",
    "userId": "user-id",
    "recipeId": "recipe-id",
    "user": {
      "id": "user-id",
      "username": "john_doe"
    }
  }
}
```

#### `deleteComment(req, res)`
- **Route**: `DELETE /api/recipes/comments/:commentId`
- **Authentification**: ✅ Requise (utilisateur connecté)
- **Autorisation**: 
  - Auteur du commentaire (toujours autorisé)
  - Modérateur (MODERATOR)
  - Admin (ADMIN)
  - Super Admin (SUPER_ADMIN)
- **Fonctionnalité**: 
  - Supprime le commentaire spécifié
  - Mets à jour le compteur de commentaires
  
**Réponse réussie (200)**:
```json
{
  "message": "Comment deleted successfully"
}
```

### 2. Routes (recipes.routes.js)
Deux nouvelles routes configurées:
```javascript
router.post('/:id/comments', authenticateToken, commentValidation, validate, addComment);
router.delete('/comments/:commentId', authenticateToken, deleteComment);
```

### 3. Validations
Validation des commentaires:
```javascript
const commentValidation = [
    body('content')
        .trim()
        .isLength({min: 1, max: 1000})
        .withMessage('Comment must be between 1 and 1000 characters'),
];
```

### 4. Modèle Prisma existant
Le modèle `Comment` était déjà présent dans `schema.prisma`:
```prisma
model Comment {
  id        String   @id @default(uuid())
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  recipeId String
  recipe   Recipe @relation(fields: [recipeId], references: [id], onDelete: Cascade)
}
```

## Changements du Frontend

### 1. Service API (recipeService.js)
Deux nouvelles méthodes ajoutées:

#### `addComment(recipeId, content)`
- Envoie une requête POST pour ajouter un commentaire
- Retourne le commentaire créé

#### `deleteComment(commentId)`
- Envoie une requête DELETE pour supprimer un commentaire
- Aucun paramètre supplémentaire nécessaire (l'ID du commentaire est suffisant)

### 2. Composant (RecipePage.jsx)
Modifications du composant pour ajouter une section complète de commentaires:

#### Etats ajoutés
```javascript
const [newComment, setNewComment] = useState('');
const [commentLoading, setCommentLoading] = useState(false);
const [commentError, setCommentError] = useState(null);
```

#### Fonction `handleAddComment`
- Validation du contenu du commentaire
- Appel API pour créer le commentaire
- Mise à jour du state avec le nouveau commentaire
- Gestion des erreurs avec affichage à l'utilisateur

#### Fonction `handleDeleteComment`
- Confirmation avant suppression
- Appel API pour supprimer le commentaire
- Mise à jour du state en supprimant le commentaire de la liste
- Mises à jour du compteur de commentaires

#### Section de commentaires
- **Zones affichées**:
  - Formulaire d'ajout de commentaire (utilisateurs connectés uniquement)
  - Message si non connecté
  - Liste de tous les commentaires
  - Message si aucun commentaire

- **Fonctionnalités**:
  - Compteur de caractères en temps réel
  - Bouton "Supprimer" visible uniquement pour:
    - L'auteur du commentaire
    - Les modérateurs (+)
    - Les admins (+)
  - Affichage du nom d'utilisateur et de la date/heure
  - Format de date localisé en français

## Flux d'utilisation

### 1. Lecture des commentaires
```
Tout utilisateur (même non connecté)
→ Accède à une recette
→ Voit tous les commentaires existants
→ Voir les infos: auteur, date, contenu
```

### 2. Ajout d'un commentaire
```
Utilisateur authentifié
→ Accède à une recette
→ Entre un commentaire (1-1000 caractères)
→ Clique sur "Publier"
→ Le commentaire s'ajoute immédiatement à la liste
→ Compteur de commentaires mises à jour
```

### 3. Suppression d'un commentaire
```
Auteur/Modérateur/Admin du commentaire
→ Voir le bouton "Supprimer" sur le commentaire
→ Clique sur "Supprimer"
→ Confirmation demandée
→ Le commentaire est supprimé
→ Compteur de commentaires mises à jour
```

## Modèles de données

### Commentaire (Comment)
```typescript
{
  id: string (UUID)
  content: string (max 1000 caractères)
  createdAt: DateTime
  updatedAt: DateTime
  userId: string (FK -> User)
  recipeId: string (FK -> Recipe)
  user: {
    id: string
    username: string
  }
}
```

### Comptes rendus Recipe
```
_count: {
  comments: number
}
```

## Niveaux d'accès (Roles)
- **USER**: Lecture + Création de commentaires
- **MODERATOR**: Lecture + Création + Suppression de tous les commentaires
- **ADMIN**: Lecture + Création + Suppression de tous les commentaires
- **SUPER_ADMIN**: Lecture + Création + Suppression de tous les commentaires

## Tests recommandés

### Backend
1. ✅ POST /api/recipes/:id/comments sans authentification → 401
2. ✅ POST /api/recipes/:id/comments avec contenu vide → 400
3. ✅ POST /api/recipes/:id/comments avec >1000 caractères → 400
4. ✅ POST /api/recipes/:id/comments avec contenu valide → 201
5. ✅ DELETE /api/recipes/comments/:id sans authentification → 401
6. ✅ DELETE /api/recipes/comments/:id par non-auteur → 403
7. ✅ DELETE /api/recipes/comments/:id par auteur/mod → 200

### Frontend
1. ✅ Vérifier que les commentaires s'affichent
2. ✅ Vérifier que seuls les utilisateurs connectés peuvent ajouter
3. ✅ Vérifier que le compteur se met à jour
4. ✅ Vérifier que les dates s'affichent correctement
5. ✅ Vérifier que les boutons supprimer s'affichent correctement

## Branche Git
- Branche créée: `feature/comments`
- Commit: `8f92bd6` - "feat: add comments functionality for recipes"

## Fichiers modifiés
1. `/backend/src/controllers/recipes.controller.js` +82 lignes
2. `/backend/src/routes/recipes.routes.js` +15 lignes
3. `/frontend/src/services/recipeService.js` +6 lignes
4. `/frontend/src/pages/RecipePage.jsx` +114 lignes

