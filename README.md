```python
import os

readme_content = """# Feasto 🍲

**Feasto** is a geospatial, full-stack surplus food redistribution platform designed to bridge the gap between food donors (restaurants, banquet halls, caterers, individuals) and local organizations in need (NGOs, shelters, community kitchens). 

By leveraging **geofencing** and hyper-local matching logic, Feasto ensures that excess edible food is dynamically routed, safely transported, and delivered to recipients within its critical safe consumption window.

---

## 🚀 Key Features

- **Geospatial & Geofenced Matching:** Automatically pairs food donors with the closest active NGOs and volunteers using location-based APIs, drastically minimizing transit times.
- **Real-Time Food Listings:** Allows donors to quickly post excess food details including cuisine type, portion sizes, dietary markers, pickup instructions, and dynamic expiry timelines.
- **Interactive Claim System:** NGOs and verified shelters receive immediate alerts for nearby listings and can claim them instantaneously.
- **Logistics & Status Tracking:** Live status lifecycle updates (`Available` ➔ `Claimed` ➔ `In Transit` ➔ `Delivered`) for transparent food handling operations.
- **Impact Analytics Dashboard:** Tracks analytics regarding total food rescued (in kilograms/meals) and carbon footprint offset for both donors and NGOs.

---

## 🛠️ Tech Stack

**Frontend:**
- **React.js** – Component-based UI library
- **Tailwind CSS** – Utility-first CSS framework for clean, responsive designs
- **Axios** – Promise-based HTTP client for API requests

**Backend:**
- **Node.js** – Event-driven asynchronous JavaScript runtime
- **Express.js** – Minimalist web framework for building robust RESTful APIs
- **JSON Web Tokens (JWT)** – Stateless authentication and route protection
- **Bcrypt.js** – Password hashing for secure user access

**Database & Location Services:**
- **MongoDB** – NoSQL document database utilizing Geospatial indexes (`2dsphere`)
- **Mongoose** – Elegant MongoDB object modeling for Node.js
- **Google Maps API / Leaflet.js** – For geofencing, reverse geocoding, and map rendering

---

## 🏗️ Architecture & Project Structure

Feasto uses a clean decoupled architecture split into a client-side frontend and a server-side backend.

```text
feasto/
│
├── client/                 # React Frontend
│   ├── public/
│   └── src/
│       ├── components/     # Reusable UI components (Navbar, Sidebar, Cards)
│       ├── context/        # Global states (AuthContext, LocationContext)
│       ├── pages/          # Main Views (Dashboard, MapView, Analytics, Auth)
│       ├── utils/          # API configs, validation, helpers
│       ├── App.js
│       └── index.js
│
└── server/                 # Node.js/Express Backend
    ├── config/             # DB connection, environment handling
    ├── controllers/        # Request handling logic (foodController, authController)
    ├── middleware/         # Auth, validation, error-handling middlewares
    ├── models/             # Mongoose Schemas (User, FoodListing, Claim, Impact)
    ├── routes/             # REST Endpoints mapping
    └── server.js           # Server initialization

```

---

## 🚦 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

* [Node.js](https://nodejs.org/en) installed (v16.x or higher recommended)
* [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account or local MongoDB instance running

### Installation Steps

1. **Clone the repository:**
```bash
git clone [https://github.com/yourusername/feasto.git](https://github.com/yourusername/feasto.git)
cd feasto

```


2. **Set up the Backend Server:**
```bash
cd server
npm install

```


Create a `.env` file in the root of the `server/` directory and configure your variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GEO_API_KEY=your_google_maps_or_location_api_key

```


Start the backend server:
```bash
npm run dev   # Runs via nodemon if configured, or use 'node server.js'

```


3. **Set up the Frontend Client:**
```bash
cd ../client
npm install

```


Create a `.env` file in the root of the `client/` directory:
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_MAP_API_KEY=your_frontend_map_api_key

```


Start the development server:
```bash
npm start

```



The application will now be running at `http://localhost:3000` with the backend operating concurrently at `http://localhost:5000`.

---

## 📍 API Endpoints (Quick Overview)

### Auth Routes (`/api/auth`)

* `POST /register` - Register a new User (Donor, NGO, or Volunteer)
* `POST /login` - User Authentication & token generation

### Food Listing Routes (`/api/food`)

* `POST /create` - Create a new food listing (Donors only)
* `GET /nearby` - Fetch listings within a specific geofenced radius using MongoDB `$near` query
* `PUT /claim/:id` - Claim a specific food listing (NGOs/Volunteers only)
* `PATCH /status/:id` - Update the active handling state of the donation

---

## 🌍 Impact & Objective

Food waste is responsible for roughly 8-10% of global greenhouse gas emissions while millions face food insecurity. **Feasto** addresses this systemic logistical disconnect by embedding technology into charity networks, ensuring that quality food reaches hungry individuals instead of landfill sites.
"""

with open("README.md", "w", encoding="utf-8") as f:
f.write(readme_content)

```
