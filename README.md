
# 🌍 Wanderlust — Travel Itinerary Planner

A robust REST API powering the Wanderlust travel itinerary planner. Built with Node.js, Express, and Supabase (PostgreSQL), it handles authentication, trip management, itinerary planning, expense tracking, and more.

---

## 📌 Project Overview

Wanderlust is a full-stack travel planning application that allows users to plan trips, track expenses, manage packing lists, store travel documents, write reviews, set reminders, and get activity recommendations. The backend exposes a RESTful API consumed by the React frontend.

**Key Features:**
- JWT-based authentication with role-based access control (RBAC)
- Full CRUD for trips, itineraries, expenses, packing, documents, reviews, and reminders
- Trip sharing with permission levels (view / edit)
- Activity recommendations (per-trip and global)
- Role management: `USER`, `TRAVEL_AGENT`, `ADMIN`

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (v18+) |
| Framework | Express.js |
| Database | PostgreSQL via Supabase |
| Auth | JWT (JSON Web Tokens) |
| ORM / Query | Supabase JS Client (`@supabase/supabase-js`) |
| Password Hashing | bcrypt |
| Environment Config | dotenv |
| CORS | cors middleware |

---

## ⚙️ Installation Steps

### Prerequisites
- Node.js v18 or higher
- A [Supabase](https://supabase.com) account and project

### 1. Clone the repository

```bash
git clone https://github.com/your-username/wanderlust-backend.git
cd wanderlust-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
PORT=4000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3000
```

### 4. Set up the database

Run the SQL schema (see Database Schema section below) in your Supabase SQL editor to create all required tables.

### 5. Start the server

```bash
# Development
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:4000`

---

## 🗄️ Database Schema Explanation

The database is hosted on Supabase (PostgreSQL) and consists of the following tables:

### `users`
Stores registered user accounts with role-based access.
```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name     TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url    TEXT,
  role          TEXT DEFAULT 'USER',        -- USER | TRAVEL_AGENT | ADMIN
  is_active     BOOLEAN DEFAULT TRUE,
  last_login    TIMESTAMP WITH TIME ZONE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### `trips`
Core table storing all trip plans created by users.
```sql
CREATE TABLE trips (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  description         TEXT,
  start_date          DATE NOT NULL,
  end_date            DATE NOT NULL,
  destination_country TEXT NOT NULL,
  cover_image         TEXT,
  budget              DECIMAL(10, 2),
  currency            TEXT DEFAULT 'USD',
  status              TEXT DEFAULT 'planning', -- planning | upcoming | ongoing | completed
  is_shared           BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### `itinerary_items`
Day-by-day activity planning for each trip.
```sql
CREATE TABLE itinerary_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id     UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number  INTEGER NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  location    TEXT,
  start_time  TIME,
  end_time    TIME,
  type        TEXT,     -- flight | accommodation | activity | restaurant | transport
  status      TEXT DEFAULT 'planned',  -- planned | confirmed | completed | cancelled
  cost        DECIMAL(10, 2),
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### `expenses`
Expense tracking per trip with category breakdown.
```sql
CREATE TABLE expenses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id     UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  amount      DECIMAL(10, 2) NOT NULL,
  category    TEXT,   -- food | transport | accommodation | activities | shopping | health | other
  date        DATE,
  notes       TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### `packing_items`
Packing checklist with toggle support.
```sql
CREATE TABLE packing_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id    UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  category   TEXT,
  quantity   INTEGER DEFAULT 1,
  is_packed  BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### `documents`
Travel document storage (passport, visa, tickets, etc.).
```sql
CREATE TABLE documents (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id     UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  type        TEXT,   -- passport | visa | ticket | hotel | insurance | id | other
  file_url    TEXT,
  expiry_date DATE,
  notes       TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### `reviews`
Star-rated reviews for places visited during a trip.
```sql
CREATE TABLE reviews (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id      UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  place_name   TEXT NOT NULL,
  category     TEXT,   -- Attraction | Restaurant | Hotel | Transport | Experience | Other
  rating       INTEGER CHECK (rating BETWEEN 1 AND 5),
  review_text  TEXT,
  visited_date DATE,
  approved     BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### `reminders`
Trip reminders and alerts with date/time.
```sql
CREATE TABLE reminders (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id      UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  type         TEXT,   -- flight | checkin | checkout | activity | general
  reminder_at  TIMESTAMP WITH TIME ZONE NOT NULL,
  notes        TEXT,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### `trip_shares`
Controls who a trip is shared with and their permission level.
```sql
CREATE TABLE trip_shares (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id         UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  shared_with     TEXT NOT NULL,   -- email address
  permission      TEXT DEFAULT 'view',  -- view | edit
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### `activity_recommendations`
Activity suggestions tied to a trip or a destination globally.
```sql
CREATE TABLE activity_recommendations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id     UUID REFERENCES trips(id) ON DELETE CASCADE,  -- NULL = global rec
  destination TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT,   -- Adventure | Culture | Food | Nature | Nightlife | Shopping | Wellness | Other
  rating      DECIMAL(3, 2),
  price_range TEXT,   -- Free | $ | $$ | $$$ | $$$$
  image_url   TEXT,
  tags        JSONB DEFAULT '[]',
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

---

## 📡 API Documentation

**Base URL:** http://localhost:4000

All protected routes require the `Authorization: Bearer <token>` header.

---

### 🔐 Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Register a new user |
| POST | `/login` | ❌ | Login and receive JWT |
| POST | `/logout` | ✅ | Logout current user |
| GET | `/me` | ✅ | Get current user profile |
| PUT | `/profile` | ✅ | Update name / avatar |
| PUT | `/change-password` | ✅ | Change password |
| GET | `/users` | ✅ Admin | Get all users |
| PUT | `/users/:id/role` | ✅ Admin | Update a user's role |
| PUT | `/users/:id/status` | ✅ Admin | Activate / deactivate user |

**Register — Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Login — Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "full_name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

---

### ✈️ Trips — `/api/trips`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✅ | Get all trips for current user |
| GET | `/:id` | ✅ | Get a single trip by ID |
| GET | `/:id/stats` | ✅ | Get trip stats (budget, packing, etc.) |
| POST | `/` | ✅ | Create a new trip |
| PUT | `/:id` | ✅ | Update a trip |
| DELETE | `/:id` | ✅ | Delete a trip |

**Create Trip — Request Body:**
```json
{
  "title": "Tokyo Adventure",
  "description": "Two weeks exploring Japan",
  "start_date": "2025-06-01",
  "end_date": "2025-06-14",
  "destination_country": "Japan",
  "budget": 3000,
  "currency": "USD",
  "status": "planning",
  "cover_image": "https://example.com/tokyo.jpg"
}
```

---

### 🧭 Itinerary — `/api/itinerary`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/trips/:tripId/itinerary` | ✅ | Get all itinerary items |
| POST | `/trips/:tripId/itinerary` | ✅ | Add an itinerary item |
| PUT | `/trips/:tripId/itinerary/:id` | ✅ | Update an item |
| DELETE | `/trips/:tripId/itinerary/:id` | ✅ | Delete an item |

---

### 💰 Expenses — `/api/expenses`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/trips/:tripId/expenses` | ✅ | Get all expenses |
| POST | `/trips/:tripId/expenses` | ✅ | Add an expense |
| PUT | `/trips/:tripId/expenses/:id` | ✅ | Update an expense |
| DELETE | `/trips/:tripId/expenses/:id` | ✅ | Delete an expense |

---

### 🎒 Packing — `/api/packing`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/trips/:tripId/packing` | ✅ | Get packing list |
| POST | `/trips/:tripId/packing` | ✅ | Add a packing item |
| PUT | `/trips/:tripId/packing/:id` | ✅ | Update an item |
| PATCH | `/trips/:tripId/packing/:id/toggle` | ✅ | Toggle packed status |
| DELETE | `/trips/:tripId/packing/:id` | ✅ | Delete an item |

---

### 📄 Documents — `/api/documents`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/trips/:tripId/documents` | ✅ | Get all documents |
| POST | `/trips/:tripId/documents` | ✅ | Add a document |
| PUT | `/trips/:tripId/documents/:id` | ✅ | Update a document |
| DELETE | `/trips/:tripId/documents/:id` | ✅ | Delete a document |

---

### ⭐ Reviews — `/api/reviews`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/trips/:tripId/reviews` | ✅ | Get all reviews |
| POST | `/trips/:tripId/reviews` | ✅ | Add a review |
| DELETE | `/trips/:tripId/reviews/:id` | ✅ | Delete a review |

---

### 🔔 Reminders — `/api/reminders`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/trips/:tripId/reminders` | ✅ | Get all reminders |
| POST | `/trips/:tripId/reminders` | ✅ | Add a reminder |
| PUT | `/trips/:tripId/reminders/:id` | ✅ | Update a reminder |
| DELETE | `/trips/:tripId/reminders/:id` | ✅ | Delete a reminder |

---

### 👥 Trip Shares — `/api/trip-shares`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/trips/:tripId/shares` | ✅ | Get all shares for a trip |
| POST | `/trips/:tripId/share` | ✅ | Share trip with a user |
| DELETE | `/trips/:tripId/shares/:id` | ✅ | Remove a share |

---

### ✨ Recommendations — `/api/recommendations`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/trips/:tripId/recommendations` | ✅ All | Get recommendations for a trip |
| POST | `/trips/:tripId/recommendations` | ✅ All | Add recommendation to a trip |
| GET | `/` | ✅ Admin / Agent | Get all global recommendations |
| POST | `/` | ✅ Admin / Agent | Create a global recommendation |
| DELETE | `/:id` | ✅ Admin / Agent | Delete a recommendation |

---

## 🚀 Deployment Link

> **Live API:** https://travel-itinerary-planner-be-1.onrender.com

**Recommended deployment platforms:**

| Platform | Free Tier | Notes |
|----------|-----------|-------|
| [Railway](https://railway.app) | ✅ | Easiest for Node.js |
| [Render](https://render.com) | ✅ | Auto-deploy from GitHub |
| [Fly.io](https://fly.io) | ✅ | Good for production |

**Environment variables required in production:**

```env
PORT=4000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=https://your-frontend-url.com
```

---

## 📁 Project Structure

```
wanderlust-backend/
├── config/
│   └── supabase.js         
├── controllers/
│   ├── auth.controller.js
│   ├── trip.controller.js
│   ├── itinerary.controller.js
│   ├── expense.controller.js
│   ├── packing.controller.js
│   ├── document.controller.js
│   ├── review.controller.js
│   ├── reminder.controller.js
│   ├── tripShare.controller.js
│   └── recommendation.controller.js
├── middleware/
│   └── auth.middleware.js   
├── routes/
│   ├── auth.routes.js
│   ├── trip.routes.js
│   ├── itinerary.routes.js
│   ├── expense.routes.js
│   ├── packing.routes.js
│   ├── document.routes.js
│   ├── review.routes.js
│   ├── reminder.routes.js
│   ├── tripShare.routes.js
│   └── recommendation.routes.js
├── .env
├── package.json
└── server.js               
```

---

## 👤 Role Permissions Summary

| Permission | USER | TRAVEL_AGENT | ADMIN |
|---|---|---|---|
| Manage own trips | ✅ | ✅ | ✅ |
| Add recommendations to own trips | ✅ | ✅ | ✅ |
| Manage global recommendations | ❌ | ✅ | ✅ |
| Approve reviews | ❌ | ✅ | ✅ |
| Manage all users | ❌ | ❌ | ✅ |
| Change user roles | ❌ | ❌ | ✅ |
| Deactivate users | ❌ | ❌ | ✅ |

---

*Built with ❤️ using Node.js + Supabase*
