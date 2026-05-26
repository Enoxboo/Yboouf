# Yboouf — Recipe Sharing Platform

A full-stack web application for sharing and discovering world recipes, built as a 2nd-year computer science student project. Users can browse, submit, rate, comment on, and favorite recipes from around the world, with a moderation workflow ensuring content quality.

---

## Tech Stack

### Backend
- **Runtime:** Node.js with ES modules
- **Framework:** Express.js 5.x
- **Database:** PostgreSQL via Prisma ORM 5.x
- **Auth:** JWT (`jsonwebtoken`) + bcryptjs for password hashing
- **File uploads:** Multer (disk storage, `/uploads/` directory)
- **Validation:** express-validator
- **Dev:** nodemon

### Frontend
- **Framework:** React 19 + Vite
- **Routing:** React Router DOM v7
- **Data fetching:** TanStack React Query v5
- **Forms:** React Hook Form
- **Styling:** Tailwind CSS v4
- **UI primitives:** Radix UI (Avatar, Dialog, Dropdown, Tabs, Select…)
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **HTTP:** Axios
- **Toasts:** Sonner
- **Theme:** next-themes (dark/light)

---

## Project Structure

```
yboouf/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/            # Prisma migrations
│   ├── src/
│   │   ├── server.js              # Entry point, Express app setup
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── recipes.controller.js
│   │   │   ├── users.controller.js
│   │   │   └── admin.controller.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── recipes.routes.js
│   │   │   ├── users.routes.js
│   │   │   └── admin.routes.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js      # JWT verification + role guards
│   │   │   ├── upload.middleware.js    # Multer config
│   │   │   └── validation.middleware.js
│   │   ├── services/
│   │   │   └── prisma.service.js      # Prisma client singleton
│   │   └── utils/
│   │       └── helpers.js
│   └── uploads/                   # Uploaded recipe images (gitignored)
│
└── frontend/
    └── src/
        ├── main.jsx
        ├── App.jsx                # Routes definition
        ├── context/
        │   ├── AuthContext.jsx    # JWT auth state + localStorage
        │   └── ThemeContext.jsx   # Dark/light theme
        ├── pages/
        │   ├── Home.jsx
        │   ├── RecipePage.jsx
        │   ├── Profile.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── AddRecipe.jsx
        │   ├── Dashboard.jsx          # Admin/moderator panel
        │   └── DashboardEditRecipe.jsx
        ├── components/
        │   ├── common/
        │   │   ├── Navbar.jsx
        │   │   ├── Footer.jsx
        │   │   ├── SearchBar.jsx
        │   │   ├── ProtectedRoute.jsx
        │   │   └── ThemeToggle.jsx
        │   ├── recipe/
        │   │   ├── RecipeCard.jsx
        │   │   └── PopularRecipesCarousel.jsx
        │   └── ui/                # Radix-based reusable components
        ├── hooks/
        │   ├── useRecipes.js
        │   └── useAdmin.js
        ├── services/
        │   ├── api.js             # Axios instance + interceptors
        │   ├── recipes.service.js
        │   └── admin.service.js
        └── utils/
            └── classNames.js
```

---

## Database Schema

### Models

**User**
- `id` (cuid), `username` (unique), `email` (unique), `password` (hashed)
- `role`: `USER | MODERATOR | ADMIN | SUPER_ADMIN`
- Relations: recipes (author), favorites, ratings, comments, moderatedRecipes

**Recipe**
- Core: `title`, `description`, `country`, `prepTime`, `cookTime`, `servings`
- Enums: `difficulty` (EASY/MEDIUM/HARD), `type` (STARTER/MAIN/DESSERT/SNACK/DRINK), `diet[]` (array)
- Moderation: `status` (DRAFT/PENDING/APPROVED/REJECTED), `isPublished`, `moderationNote`
- Relations: author, ingredients, favorites, ratings, comments

**Ingredient** — belongs to Recipe (`name`, `quantity`, `unit`)

**Favorite** — `userId + recipeId` unique pair

**Rating** — `score` (1-5), `userId + recipeId` unique pair (upsert on re-rate)

**Comment** — `content` (text, max 1000 chars), `userId`, `recipeId`

**PendingRecipe** — legacy model; ingredients stored as JSON (superseded by direct Recipe with PENDING status)

---

## API Endpoints

### Auth — `/api/auth`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | — | Register new user |
| POST | `/login` | — | Login, returns JWT |
| GET | `/me` | Required | Current user info |

### Recipes — `/api/recipes`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Optional | List approved recipes (search, country, type, diet, ingredients, page) |
| GET | `/filters` | — | Available filter values |
| POST | `/` | Required | Submit recipe (PENDING unless admin/super_admin) |
| GET | `/:id` | Optional | Recipe detail + user's rating/favorite status |
| PUT | `/:id` | Required (author/admin) | Update recipe |
| DELETE | `/:id` | Required (author/admin) | Delete recipe |
| POST | `/:id/rate` | Required | Rate 1-5 (upsert) |
| POST | `/:id/favorite` | Required | Add to favorites |
| DELETE | `/:id/favorite` | Required | Remove from favorites |
| POST | `/:id/comments` | Required | Add comment |
| DELETE | `/comments/:commentId` | Required | Delete comment (own or moderator+) |

### Users — `/api/users`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/profile` | Required | Own profile + stats |
| GET | `/recipes` | Required | Own recipes (filterable by status) |
| GET | `/stats` | Required | Recipe statistics |
| GET | `/favorites` | Required | Favorited recipes |

### Admin — `/api/admin`
| Method | Path | Min role | Description |
|--------|------|---------|-------------|
| GET | `/users` | MODERATOR | List users |
| GET | `/users/stats` | MODERATOR | User statistics |
| DELETE | `/users/:id` | MODERATOR | Delete user |
| PUT | `/users/:id/promote` | ADMIN | Promote to moderator |
| PATCH | `/users/:id/role` | SUPER_ADMIN | Set any role |
| GET | `/recipes` | ADMIN | List all recipes |
| GET | `/recipes/pending` | ADMIN | Pending recipes queue |
| GET | `/recipes/:id` | ADMIN | Recipe detail (admin view) |
| PUT | `/recipes/:id/approve` | ADMIN | Approve recipe |
| PUT | `/recipes/:id/reject` | ADMIN | Reject with note |
| GET | `/stats` | ADMIN | Moderation statistics |

---

## Auth & Role System

Role hierarchy (numeric level):
```
USER (0) < MODERATOR (1) < ADMIN (2) < SUPER_ADMIN (3)
```

Auth middlewares in `auth.middleware.js`:
- `authenticateToken` — requires valid JWT
- `optionalAuth` — attaches user if token present, doesn't fail otherwise
- `requireModerator` / `requireAdmin` / `requireSuperAdmin` — minimum role gates

Token: JWT in `Authorization: Bearer <token>` header, 7-day default expiry.

---

## Frontend Pages

| Route | Component | Protection |
|-------|-----------|-----------|
| `/` | Home | Public |
| `/recipe/:id` | RecipePage | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/profile` | Profile | Public (shows login prompt if not auth) |
| `/add-recipe` | AddRecipe | Auth required |
| `/dashboard` | Dashboard | MODERATOR / ADMIN / SUPER_ADMIN |
| `/dashboard/recipes/:id/edit` | DashboardEditRecipe | ADMIN / SUPER_ADMIN |

`ProtectedRoute` wraps restricted routes and checks `allowedRoles` against context user.

---

## Key Behaviors

- **Recipe submission flow:** Regular users submit → status=PENDING, isPublished=false. Admins/super_admins skip moderation (APPROVED + isPublished=true immediately). After rejection, re-editing resets to PENDING.
- **Rating:** One rating per user per recipe, upserted. Average shown with 1 decimal.
- **Favorites:** Toggle via add/remove endpoints.
- **Image upload:** Multer, max 5 MB, formats JPEG/JPG/PNG/WebP/GIF. Served statically at `/uploads/`.
- **Comments:** Displayed newest-first; users delete own, MODERATOR+ can delete any.

---

## Environment Variables

### Backend (`.env`)
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
```

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:5000/api
```

Production API base: `http://212.194.254.12:5001/api`

---

## Running Locally

```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npm run dev          # http://localhost:5000

# Frontend
cd frontend
npm install
npm run dev          # http://localhost:5173
```

---

## Database Migrations

```bash
cd backend
npx prisma migrate dev --name <migration_name>
npx prisma generate
npx prisma studio    # GUI at http://localhost:5555
```

Existing migrations:
1. `20251126103223_init` — initial schema
2. `20260121092548_test`
3. `20260415123000_add_super_admin_role` — added SUPER_ADMIN role
