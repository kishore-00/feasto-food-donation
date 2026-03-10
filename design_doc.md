# Surplus Food Redistribution Platform - Usage & Design Doc

## 1. Project Mission
To connect food donors (restaurants/events) with volunteers and recipients (shelters) to reduce food waste and hunger, using a "Uber for Leftovers" model.

## 2. Architecture Overview
The application follows a standard MERN stack architecture (MongoDB, Express, React, Node.js) with a clear separation between frontend and backend.

```mermaid
graph TD
    User[User (Mobile/Web)] -->|HTTPS| Frontend[React + Vite (Vercel)]
    Frontend -->|REST API| Backend[Node.js + Express (Render/Railway)]
    Backend -->|Mongoose| DB[(MongoDB Atlas)]
    Frontend -->|Tiles| OSM[OpenStreetMap]
    Volunteer -->|Claim| Backend
    Donor -->|Post| Backend
```

## 3. Tech Stack & Free Tier Strategy (Cost: $0)

| Component | Technology | Free Tier Provider | Limits / Constraints |
| :--- | :--- | :--- | :--- |
| **Frontend** | React, Tailwind, Vite | **Vercel** | Hobby Plan (Bandwidth limits, but sufficient for MVP) |
| **Backend** | Node.js, Express | **Render** | Free Web Service (Spins down after inactivity, slow cold start) |
| **Database** | MongoDB | **MongoDB Atlas** | M0 Sandbox (512MB storage, sufficient for thousands of text records) |
| **Maps** | Leaflet.js | **OpenStreetMap** | Free tile usage (Requires compliant attribution) |
| **Images** | (Optional) Cloudinary | **Cloudinary** | Free Plan (Generous credit for small apps) |

## 4. Database Schema Design (MongoDB)

### 4.1. Users Collection
Stores profile and authentication details for all three roles.
*   **_id**: ObjectId
*   **name**: String
*   **email**: String (Unique, Indexed)
*   **password**: String (Bcrypt hash)
*   **role**: Enum ['donor', 'volunteer', 'recipient']
*   **contact**: String (Phone number)
*   **location**: { type: "Point", coordinates: [lng, lat] } (Optional, for default area)
*   **createdAt**: Date

### 4.2. Listings Collection
Represents a donation offer.
*   **_id**: ObjectId
*   **title**: String
*   **description**: String
*   **quantity**: String (e.g., "5 kg" or "10 boxes")
*   **type**: Enum ['veg', 'non-veg', 'bakery', 'other']
*   **expiryDate**: Date
*   **donor**: ObjectId (Ref: User)
*   **status**: Enum ['available', 'claimed', 'picked_up', 'delivered', 'expired']
*   **location**: GeoJSON Point (CRITICAL for map queries)
    *   `type`: "Point"
    *   `coordinates`: [longitude, latitude]
*   **createdAt**: Date

### 4.3. Transactions Collection
Tracks the lifecycle of a claimed donation to ensure accountability.
*   **_id**: ObjectId
*   **listing**: ObjectId (Ref: Listing)
*   **volunteer**: ObjectId (Ref: User)
*   **recipient**: ObjectId (Ref: User) (Optional initially)
*   **status**: Enum ['claimed', 'picked_up', 'delivered']
*   **history**: Array of { status, timestamp, location }
*   **proofImage**: String (URL) (For verification at pickup/delivery)
*   **createdAt**: Date

## 5. API Strategy (Phase 2 Preview)
*   Auth: JWT-based stateless authentication.
*   Geo-Queries: Use MongoDB `$near` or `$geoWithin` to find available listings near a volunteer.

