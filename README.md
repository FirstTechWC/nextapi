# Next.js + FastAPI Boilerplate

A production-ready full-stack boilerplate featuring **Next.js 16** frontend and **FastAPI** backend with built-in authentication, encryption, rate limiting, and dual database support.

## Features

- **Authentication System**
  - JWT-based authentication for user sessions
  - API Key/Secret authentication for external clients
  - NextAuth v5 integration with credentials provider
  - Encrypted credential transmission (AES-256-CBC)
  - Password hashing with bcrypt

- **Dual Database Support**
  - SQLite (default) - zero configuration required
  - MongoDB - optional, async with Motor driver

- **Security**
  - End-to-end encryption for auth payloads
  - Rate limiting per user type (60/min users, 100/min API clients)
  - CORS middleware configured
  - JWT tokens with expiration

- **API Client Management**
  - Create/revoke API credentials
  - Separate rate limits for API clients
  - Track client usage

- **Modern Stack**
  - Next.js 16 with App Router
  - React 19
  - TypeScript
  - Tailwind CSS 4
  - FastAPI with async support
  - Pydantic v2 validation

## Project Structure

```
nextapi/
├── backend/                 # FastAPI backend
│   ├── main.py             # FastAPI application & routes
│   ├── auth.py             # JWT & API key authentication
│   ├── models.py           # SQLAlchemy models
│   ├── models_mongo.py     # MongoDB models
│   ├── database.py         # SQLite configuration
│   ├── database_mongo.py   # MongoDB configuration
│   ├── schemas.py          # Pydantic schemas
│   ├── crypto_utils.py     # AES decryption utilities
│   ├── config.py           # Database type selection
│   ├── rate_limiter.py     # Rate limiting logic
│   └── pyproject.toml      # Python dependencies
├── frontend/               # Next.js frontend
│   ├── app/               # App router pages
│   │   ├── page.tsx       # Dashboard (protected)
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   └── api/           # API routes & NextAuth
│   ├── lib/               # Utilities
│   │   ├── crypto.ts      # Client-side encryption
│   │   └── crypto-server.ts # Server-side encryption
│   ├── types/             # TypeScript definitions
│   └── auth.ts            # NextAuth configuration
└── package.json           # Root scripts
```

## Prerequisites

- **Node.js** 18+
- **Python** 3.12+
- **uv** (Python package manager) - [Install uv](https://docs.astral.sh/uv/getting-started/installation/)
- **MongoDB** (optional) - only if using MongoDB instead of SQLite

## Quick Start

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd nextapi
```

### 2. Install dependencies

```bash
# Install root dependencies (concurrently)
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && uv sync && cd ..
```

### 3. Configure environment variables

#### Backend (`backend/.env`)

```env
# Encryption key for payload encryption (32 bytes hex)
ENCRYPTION_KEY=your-32-byte-hex-key-here

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Rate Limiting (requests per minute)
RATE_LIMIT_USER=60
RATE_LIMIT_API_CLIENT=100

# Database Configuration (optional)
DATABASE_TYPE=sqlite                    # or "mongo"
MONGO_URL=mongodb://localhost:27017     # if using MongoDB
MONGO_DB_NAME=your_database_name        # if using MongoDB
```

#### Frontend (`frontend/.env.local`)

```env
# NextAuth secret (generate with: openssl rand -base64 32)
AUTH_SECRET=your-nextauth-secret-here

# NextAuth URL
AUTH_URL=http://localhost:3000

# Encryption key (MUST match backend ENCRYPTION_KEY)
NEXT_PUBLIC_ENCRYPTION_KEY=your-32-byte-hex-key-here
```

### 4. Generate encryption keys

```bash
# Generate a 32-byte hex key for encryption
openssl rand -hex 32

# Generate a base64 secret for NextAuth
openssl rand -base64 32
```

**Important:** The `ENCRYPTION_KEY` (backend) and `NEXT_PUBLIC_ENCRYPTION_KEY` (frontend) must be identical for encrypted communication to work.

### 5. Run the development server

```bash
# From the root directory - runs both frontend and backend
npm run dev
```

This starts:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive JWT token |

### Protected Endpoints

Requires JWT Bearer token OR API Key/Secret headers.

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/health` | Health check | 60/min (user), 100/min (API) |
| GET | `/get_user_details` | Get authenticated user details | 60/min (user), 100/min (API) |

### API Client Management

Requires JWT Bearer token.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api-clients` | Create new API client |
| GET | `/api-clients` | List your API clients |
| DELETE | `/api-clients/{client_id}` | Revoke an API client |

## Authentication

### JWT Authentication (Users)

```bash
# Login to get token
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"data": "<encrypted-payload>"}'

# Use token in requests
curl http://localhost:8000/health \
  -H "Authorization: Bearer <your-jwt-token>"
```

### API Key Authentication (External Clients)

```bash
# Create API client (requires JWT)
curl -X POST http://localhost:8000/api-clients \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "My App"}'

# Use API credentials
curl http://localhost:8000/health \
  -H "X-API-Key: <client-id>" \
  -H "X-API-Secret: <client-secret>"
```

## Database Configuration

### SQLite (Default)

No configuration needed. The database file (`app.db`) is created automatically.

### MongoDB

1. Set environment variables in `backend/.env`:
   ```env
   DATABASE_TYPE=mongo
   MONGO_URL=mongodb://localhost:27017
   MONGO_DB_NAME=your_database
   ```

2. Ensure MongoDB is running on your system.

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENCRYPTION_KEY` | Yes | - | 32-byte hex key for AES encryption |
| `JWT_SECRET_KEY` | Yes | - | Secret key for JWT signing |
| `JWT_ALGORITHM` | No | `HS256` | JWT algorithm |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | No | `30` | Token expiration time |
| `RATE_LIMIT_USER` | No | `60` | User requests per minute |
| `RATE_LIMIT_API_CLIENT` | No | `100` | API client requests per minute |
| `DATABASE_TYPE` | No | `sqlite` | Database type (`sqlite` or `mongo`) |
| `MONGO_URL` | No | `mongodb://localhost:27017` | MongoDB connection URL |
| `MONGO_DB_NAME` | No | `learning_scheduler` | MongoDB database name |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | Yes | NextAuth.js secret for session encryption |
| `AUTH_URL` | Yes | Base URL of your application |
| `NEXT_PUBLIC_ENCRYPTION_KEY` | Yes | Must match backend `ENCRYPTION_KEY` |

## Scripts

### Root

```bash
npm run dev    # Run frontend + backend concurrently
npm run api    # Run backend only
```

### Frontend (`frontend/`)

```bash
npm run dev    # Development server
npm run build  # Production build
npm run start  # Production server
npm run lint   # Run ESLint
```

### Backend (`backend/`)

```bash
uv run uvicorn main:app --reload  # Development server
uv run uvicorn main:app           # Production server
```

## Tech Stack

### Frontend
- Next.js 16.1.4
- React 19.2.3
- NextAuth 5.0.0-beta
- TypeScript 5
- Tailwind CSS 4
- crypto-js (client-side encryption)

### Backend
- FastAPI 0.128+
- SQLAlchemy 2.0+
- Motor 3.7+ (MongoDB async driver)
- Pydantic 2.0+
- python-jose (JWT)
- bcrypt (password hashing)
- PyCryptodome (AES encryption)
- slowapi (rate limiting)

## License

ISC

## Contact

For questions or feedback, please contact:

    Name:   Mohammed K.
    Email:  mkhan@live.co.za
    GitHub: sup3rus3r
