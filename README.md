# Aura Salon Management — Minimalist Glassmorphic Mobile App & High-Concurrency Backend

A high-scale, dual-role mobile application built with **React Native (Expo)** paired with an enterprise **Spring Boot 3.3 (Java 21)** backend engineered to serve millions of concurrent customers and salon partners.

---

## Key Features & Highlights

### 1. Minimalist & Light-Mode Default Design
- **Airy, elegant typography** and refined micro-borders tailored for luxury salon ateliers.
- **Ultra-Small Theme Switch Icon**: A discrete 12px micro-toggle button positioned neatly in the header for effortless switching between Light Mode and Dark Onyx Mode.
- **Customizable Glassmorphism Design Pattern**:
  - Translucent frosted glass cards with backdrop blurs, luminous edge reflections, and soft shadows.
  - **Dynamic In-App Switcher**: Users can toggle or switch styles in **Settings** between:
    - `Glassmorphism` (Frosted glass with backdrop blur and soft glow)
    - `Minimal Clean Flat` (Clean monochrome surfaces and sharp borders)
    - `Soft Neumorphic` (Subtle embossed surfaces and soft diffused depth)

### 2. Dual User Roles (Instant Switching in App)
- **Customer / Explore Mode**:
  - **Salons Near You**: Displays nearby salons calculated using geospatial Haversine metrics with live distance (e.g. `0.8 km`), rating (`4.9 ★`), open/closed status, and live waiting list counters (`2 in queue • ~25 min wait`).
  - **Interactive Google Maps Radar**: Visual map showing salon locations, your live position, and salon cards.
  - **One-Tap Google Maps Navigation Button**: Direct trigger launching Google Maps turn-by-turn navigation (`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`) for instant GPS guidance.
  - **Slot Booking & Arrival Code Generation**: Choose preferred slot and service, creating an active pass with a unique verification code (e.g. `SLN-8429`) to present upon arrival.
  - **Live Waitlist Tracker**: Monitor real-time progress in line (`#1 Up Next`, `#2 in line`).

- **Salon Owner Portal**:
  - **Salon Open/Closed Switch**: Instantly toggle salon status (`Open - Accepting Walk-ins & Bookings` ↔ `Closed - Taking Break`), synchronizing in real time across all customer devices.
  - **Customer Code Verification**: Input or scan arriving customer's code (e.g. `SLN-4819`) to verify the booking, admitting the customer and transitioning their status from `WAITING` to `SERVING`.
  - **Live Actual User Counter**: Live counters for *Serving Now*, *In Waiting Line*, and *Finished Today*.
  - **Active Queue Manager**: View currently seated clients, advance queue positions, and mark services as completed.

### 3. Scalable Architecture for Millions of Users
- **Spring Boot 3.3.4 & Java 21 LTS** with asynchronous request handling and thread-safe operations.
- **Optimistic Locking (`@Version`)** on queue entities preventing double-booking during peak traffic spikes.
- **Real-Time Queue Synchronization**: Server-Sent Events (SSE) and WebSocket channels push live waitlist updates instantly to all connected devices without client-side polling.
- **Geospatial Indexing**: Rapid database proximity queries for locating nearest salons within metropolitan coordinates.
- **Production-Ready Docker Stack**: Pre-configured `docker-compose.yml` supporting multi-instance Spring Boot nodes with **PostgreSQL** and **Redis** pub/sub caching.

---

## Project Structure

```
SalonManagement/
├── mobile/                        # React Native / Expo Mobile App
│   ├── App.tsx                    # Main app container & role coordinator
│   ├── package.json               # Expo & React Native dependencies
│   ├── src/
│   │   ├── types/                 # TypeScript interfaces (Salon, QueueEntry, etc.)
│   │   ├── context/
│   │   │   ├── ThemeContext.tsx   # Glassmorphism / Flat / Neumorphic styling engine
│   │   │   └── AppContext.tsx     # Role state, active passes, and salon store
│   │   ├── services/
│   │   │   └── api.ts             # REST & SSE client for Spring Boot backend
│   │   ├── components/
│   │   │   ├── Header.tsx         # Brand header with micro theme switch & role pill
│   │   │   ├── SalonCard.tsx      # Glassmorphic salon card with waitlist & directions
│   │   │   ├── GoogleMapView.tsx  # Interactive map with Google Maps navigation button
│   │   │   └── BookSlotModal.tsx  # Slot picker & arrival verification code generator
│   │   └── screens/
│   │       ├── CustomerScreen.tsx # Customer discovery & live pass tracking
│   │       ├── OwnerScreen.tsx    # Owner verification portal & live queue counter
│   │       └── SettingsModal.tsx  # Glassmorphism & preferences modal
│   └── dist/                      # Pre-bundled web release
│
├── server/                        # High-Concurrency Spring Boot Backend
│   ├── pom.xml                    # Maven configuration (Java 21, JPA, Web, H2, PostgreSQL)
│   ├── Dockerfile                 # Multi-stage production container build
│   └── src/main/java/com/salon/
│       ├── SalonApplication.java  # Main application entry point
│       ├── model/                 # JPA Entities: Salon, QueueEntry, QueueStatus
│       ├── repository/            # Spring Data JPA repositories with custom queries
│       ├── service/               # Geospatial calculations, queue logic, SSE broker
│       ├── controller/            # REST API endpoints & SSE event streams
│       ├── dto/                   # DTOs for booking, verification, and status updates
│       └── config/                # CORS and DataInitializer (pre-seeded salons & queues)
│
└── docker-compose.yml             # PostgreSQL + Redis + Spring Boot cluster
```

---

## Running the Application

### 1. Spring Boot Backend
Requires JDK 21:
```bash
cd server
mvn spring-boot:run
```
- API Base: `http://localhost:8080/api`
- Health Check: `http://localhost:8080/api/health`
- Nearby Salons: `http://localhost:8080/api/salons/nearby`
- H2 In-Memory Console: `http://localhost:8080/h2-console`

### 2. React Native Mobile App
```bash
cd mobile
npm install
npm start
```
- Web Preview: `npm run web` (or visit `http://localhost:3000`)
- Android: `npm run android`
- iOS: `npm run ios`

---

## Verified End-to-End User Flow
1. **Explore & Navigate**: Customer selects "Aura Minimalist Studio", checks live waitlist (~25 min), and taps **"Directions"** to launch Google Maps with turn-by-turn routing.
2. **Book Slot**: Customer books an 11:45 AM slot, instantly receiving arrival verification code `SLN-7081`.
3. **Arrival Verification**: Customer arrives at the salon and presents code `SLN-7081`.
4. **Owner Verification & Slot Confirmation**: Salon owner enters `SLN-7081` in the Owner Portal, clicking **"Verify Slot"**. The customer is confirmed and admitted to the chair (*Serving Now*).
5. **Real-Time Synchronization**: All customer devices immediately see the updated queue count in real time!
