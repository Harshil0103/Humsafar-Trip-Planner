# 🌍 Humsafar — Full-Stack Trip Planner & Journey Companion

**Humsafar** ( हमसफ़र — *Your Trusted Journey Companion*) is a modern, full-stack travel planning platform built to help travelers discover iconic world destinations, create day-by-day itineraries with timeline precision, organize accommodations and multi-modal transit bookings, and manage budgets in real time with dynamic analytics.

---

## 🌟 Key Features

- **🏛️ Destination Discovery**: Explore 14+ curated global destinations with ratings, photos, must-visit sights, recommended experiences, and estimated daily costs.
- **🧭 Day-by-Day Itinerary Builder**: Organize trips by day with time-stamped activities (09:00 Breakfast, 10:30 Shrines, 15:00 Museums), categories, locations, costs, and drag-and-drop reordering.
- **🏨 Accommodation Hub**: Track stays (Hotels, Ryokans, Resorts, Airbnb) with check-in/out dates, price calculations, and booking confirmation numbers.
- **✈️ Transit & Logistics**: Log multi-modal travel records (Flights, Bullet Trains, Buses, Car Rentals, Ferries) with departure/arrival times and routes.
- **💰 Live Budget Management**: Real-time spending gauges, planned vs actual spend comparison, and category breakdown charts (Food, Stays, Transit, Activities, Shopping).
- **🗺️ Interactive Map Visualization**: OpenStreetMap / Leaflet integration rendering destination hubs, hotel pins (Indigo), activity pins (Green), and itinerary spots.
- **🎒 Packing Checklist & Notes**: Categorized travel packing checklist with click-to-pack progress tracking and emergency contact info.
- **🛡️ Role-Based Admin Portal**: Complete administrator dashboard with platform analytics, destination catalog management (CRUD), and user role management.
- **🔐 Enterprise Security**: Password hashing with Bcrypt, JWT token authorization, protected routes, and strict user data isolation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Lucide React, Leaflet & React-Leaflet, Custom Vanilla CSS Design System |
| **Backend** | Node.js, Express 5, CORS, Morgan, JSON Web Tokens (JWT), Bcryptjs |
| **Database** | SQLite (persistent zero-config database with relational schemas, foreign keys, and indexes) |
| **DevOps & Tooling** | Concurrently, Dotenv, E2E automated test suite |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node v26)
- **npm**: v9.0.0 or higher

### 2. Installation
Clone or navigate to the project root directory and install dependencies:

```bash
# Install root & backend dependencies
npm install

# Install frontend client dependencies
cd client
npm install
cd ..
```

### 3. Environment Variables
Create a `.env` file in the root directory (or use `.env.example`):

```env
PORT=5000
JWT_SECRET=your_super_secret_trip_planner_jwt_key_2026
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 4. Database Setup & Seeding
Initialize the SQLite database with rich demo destinations, multi-day itineraries, stays, transit, and expense records:

```bash
npm run seed
```

### 5. Start the Application
Start both the Express backend API (`localhost:5000`) and Vite frontend (`localhost:5173`) with one command:

```bash
npm run dev
```

Open your browser and navigate to: **`http://localhost:5173`**

---

## 🔑 Demo Login Credentials

The database is pre-seeded with two ready-to-use accounts:

| Role | Email | Password | Features / Notes |
|---|---|---|---|
| **Demo Traveler** | `traveler@tripplanner.com` | `TravelPass123!` | Pre-populated with active Kyoto trip, Rome planning trip, Bali trip, itinerary days, stays, and budget logs. |
| **Demo Admin** | `admin@tripplanner.com` | `AdminPass123!` | Full administrative access to manage destinations, user accounts, and system analytics. |

*(1-Click Quick Demo Login buttons are also available on the Login screen!)*

---

## 📡 Main API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new traveler
- `POST /api/auth/login` — Login and receive JWT token
- `GET /api/auth/me` — Get current logged-in profile
- `PUT /api/auth/profile` — Update name, bio, avatar, or password

### Destinations (`/api/destinations`)
- `GET /api/destinations` — List all destinations with search & filters
- `GET /api/destinations/:id` — Get single destination details
- `POST /api/destinations` — Create destination (Admin only)
- `PUT /api/destinations/:id` — Update destination (Admin only)
- `DELETE /api/destinations/:id` — Delete destination (Admin only)

### Trips (`/api/trips`)
- `GET /api/trips` — List trips for current user
- `POST /api/trips` — Create a new trip
- `GET /api/trips/:id` — Get full trip details (itineraries, stays, transit, expenses)
- `PUT /api/trips/:id` — Update trip meta
- `DELETE /api/trips/:id` — Delete trip
- `POST /api/trips/:id/duplicate` — Duplicate trip and all child entities
- `PATCH /api/trips/:id/status` — Update status (`planning`, `active`, `completed`, `archived`)

---

## 🧪 Testing

Run the end-to-end automated test suite:

```bash
node server/test_e2e.js
```
