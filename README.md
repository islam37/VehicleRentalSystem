# 🚗 Vehicle Rental System API

A scalable, secure, and modern RESTful backend API for a Vehicle Rental Management platform, built with **Node.js**, **Express**, **TypeScript**, and **PostgreSQL (NeonDB)**.

[![Live API](https://img.shields.io/badge/Live%20API-Visit-brightgreen)](https://vehicle-rental-system-lac-eight.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-NeonDB-4169E1?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)

**🔗 Live API URL:** [https://vehicle-rental-system-lac-eight.vercel.app](https://vehicle-rental-system-lac-eight.vercel.app)

---

## 📑 Table of Contents

- [Project Architecture & Design Pattern](#project-architecture--design-pattern)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [API Endpoints Reference](#api-endpoints-reference)

---

## Project Architecture & Design Pattern

The application follows a **Modular Layered Architecture** (Controller–Service–Route Pattern) to ensure separation of concerns, scalability, and maintainability.

```text
vehicle-rental-system/
├── dist/                     # Compiled JavaScript output
├── node_modules/             # Project dependencies
├── src/
│   ├── config/                  # Database and environment configurations
│   │   └── db.ts                # PostgreSQL NeonDB pool connection
│   │
│   ├── middlewares/              # Custom Express middlewares
│   │   ├── auth.middleware.ts    # JWT verification and role-based authorization
│   │   └── error.middleware.ts   # Global error handling and 404 router
│   │
│   ├── modules/                  # Modular feature domains
│   │   ├── auth/                 # Authentication Module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.route.ts
│   │   │   └── auth.service.ts
│   │   ├── booking/               # Rental & Booking Module
│   │   │   ├── booking.controller.ts
│   │   │   ├── booking.route.ts
│   │   │   └── booking.service.ts
│   │   ├── user/                  # User Management Module
│   │   │   ├── user.controller.ts
│   │   │   ├── user.route.ts
│   │   │   └── user.service.ts
│   │   └── vehicles/              # Vehicle Fleet Module
│   │       ├── vehicle.controller.ts
│   │       ├── vehicle.route.ts
│   │       └── vehicle.service.ts
│   │
│   ├── app.ts                # Express application setup & middleware mounting
│   └── server.ts             # Server initialization & entry point
│
├── .env                       # Local environment variables
├── .gitignore
├── package.json
├── tsconfig.json               # TypeScript compiler configurations
├── vercel.json                 # Vercel serverless deployment setup
└── README.md
```

### Architectural Flow

| Layer | File Pattern | Responsibility |
| --- | --- | --- |
| **Routing** | `*.route.ts` | Defines REST endpoints and attaches relevant middlewares (e.g. `authenticate`, `authorize`) |
| **Controller** | `*.controller.ts` | Parses HTTP requests, validates input, invokes the service layer, shapes JSON responses |
| **Service** | `*.service.ts` | Contains pure business logic, calculations, date parsing, database queries, and SQL transactions |
| **Data Access** | `db.ts` | Manages the pooled PostgreSQL connection with SSL support via NeonDB |

---

## Features

- **🔐 Authentication & Authorization**
  Secure user registration and login using `bcrypt` for password hashing and JSON Web Tokens (JWT) for role-based access control (`admin` and `customer`).

- **🚙 Vehicle Fleet Management**
  Complete CRUD operations for vehicles with real-time status management (`available` / `booked`).

- **📅 Booking Workflow**
  - Customers can reserve available vehicles and cancel bookings before the start date.
  - Admins can view all platform bookings and process vehicle returns.
  - Automated duration and total price calculation based on daily rental rates.
  - Auto-return logic to update vehicle availability when rent end dates expire.

- **👤 User Management**
  Secure profile updates for individual users, plus administrative management for platform users.

- **🧩 Data Integrity**
  PostgreSQL transactions ensure atomic operations during booking and vehicle state transitions.

- **⚠️ Error Handling**
  Standardized error formats with global middlewares for 404 (Not Found) and 500 (Internal Server) errors.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Language** | TypeScript |
| **Database** | PostgreSQL (NeonDB Serverless) |
| **Database Driver** | `pg` (node-postgres) |
| **Security & Auth** | JSON Web Tokens (`jsonwebtoken`), Bcrypt (`bcrypt`), CORS |
| **Deployment** | Vercel Serverless |

---

## Database Schema

```sql
-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles Table
CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  vehicle_name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('car', 'bike', 'van', 'SUV')),
  registration_number VARCHAR(100) UNIQUE NOT NULL,
  daily_rent_price NUMERIC(10, 2) NOT NULL,
  availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN ('available', 'booked')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE,
  rent_start_date DATE NOT NULL,
  rent_end_date DATE NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'returned')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm or yarn
- A PostgreSQL database instance or NeonDB connection URL

### 1. Clone the Repository

```bash
git clone https://github.com/islam37/VehicleRentalSystem.git
cd VehicleRentalSystem
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
DATABASE_URL=postgres://<username>:<password>@<neon_host>/<database_name>?sslmode=require
JWT_SECRET=super_secret_jwt_key_12345
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 4. Run the Project

```bash
# Start the development server
npm run dev

# Build for production
npm run build

# Start the production server
npm start
```

---

## API Endpoints Reference

### 🔑 Authentication — `/api/v1/auth`

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/signup` | Public | Register a new user (`admin` / `customer`) |
| `POST` | `/signin` | Public | Sign in and retrieve a JWT access token |

### 🚗 Vehicles — `/api/v1/vehicles`

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/` | Admin | Add a new vehicle |
| `GET` | `/` | Public | List all vehicles |
| `GET` | `/:vehicleId` | Public | Get single vehicle details by ID |
| `PUT` | `/:vehicleId` | Admin | Update vehicle details |
| `DELETE` | `/:vehicleId` | Admin | Delete a vehicle (if no active bookings) |

### 📅 Bookings — `/api/v1/bookings`

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/` | Customer / Admin | Book an available vehicle |
| `GET` | `/` | Authenticated | View own bookings (Customer) or all bookings (Admin) |
| `PUT` | `/:bookingId` | Authenticated | Cancel booking (Customer) or mark returned (Admin) |

### 👤 Users — `/api/v1/users`

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Admin | Retrieve all registered users |
| `PUT` | `/:userId` | Admin / Self | Update profile information |
| `DELETE` | `/:userId` | Admin | Delete a user (if no active bookings) |

---

## 📄 License

This project is available for educational and portfolio purposes.

## 👨‍💻 Author

**Islam** — [GitHub](https://github.com/islam37)
