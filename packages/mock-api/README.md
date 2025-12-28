# @facts/mock-api

JSON Server setup for local HTTP-based development and testing.

## Purpose

This package provides a local HTTP server that mimics the BFF (Backend for Frontend) API structure, allowing you to:
- Test HTTP data flow without backend dependency
- Validate request/response handling
- Develop offline
- Simulate network delays

## Usage

### Start JSON Server

```bash
# From repository root - starts ALL packages with dev scripts (web + mock-api)
pnpm dev

# Or start just the web app (without mock-api)
pnpm dev:web
```

Turborepo automatically starts all packages with `dev` scripts in parallel.
The JSON Server runs on `http://localhost:3001` by default.

### Configure Web App

Create `.env.local` in `apps/web/`:

```bash
# Use JSON Server instead of in-memory mocks
VITE_API_TYPE=json-server
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

## Files

- **`db.json`**: Mock data for all entities (locations, contracts, sales, etc.)
- **`routes.json`**: Endpoint mappings that match BFF structure
- **`server.js`**: Middleware for CORS and optional network delay simulation

## Environment Variables

- **`SIMULATE_DELAY`**: Optional network delay in milliseconds (e.g., `SIMULATE_DELAY=200`)

## Data Structure

The `db.json` follows the backend entity structure:
- Locations with all backend-aligned fields
- Contracts with nested sales, people, payments, financing
- Normalized structure for easy querying

## Routes

All routes are prefixed with `/api/v1/`:

- `GET /api/v1/locations` → List all locations
- `GET /api/v1/locations/:id` → Get location by ID
- `GET /api/v1/contracts` → List all contracts
- `GET /api/v1/contracts/:id` → Get contract by ID
- `GET /api/v1/contracts/:contractId/sales` → Get sales for contract
- `GET /api/v1/contracts/:contractId/people` → Get people for contract
- And more...

## Note

This is a **development tool only**. It is not used in production. For production, the web app connects to the real BFF (Backend for Frontend) service.

