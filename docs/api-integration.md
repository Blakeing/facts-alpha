# API Integration

This document describes the backend BFF (Backend for Frontend) API patterns for future integration.

> **Note:** Facts Alpha currently uses mock data. This document serves as a reference for when we integrate with the real backend.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Facts Alpha (Frontend)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Vue Pages  │  │  Composables │  │  API Client │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Facts BFF Gateway                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Controllers │  │  Clients    │  │ Auth/Tenant │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└──────────────────────────┬──────────────────────────────────┘
                           │ Internal HTTP
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Microservices                            │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐        │
│  │Locations│ │Contracts│ │Payments│ │ Trust │ │Workflow│    │
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘        │
└─────────────────────────────────────────────────────────────┘
```

The frontend **only** communicates with the BFF. The BFF handles:
- Authentication token forwarding
- Tenant context management
- Request routing to microservices
- Response aggregation
- Permission validation

## Base URL & Headers

### Environment Configuration

```typescript
// .env.development
VITE_API_URL=http://localhost:5000/api/v1

// .env.production
VITE_API_URL=https://api.facts.com/api/v1
```

### Required Headers

Every request must include:

| Header | Description | Example |
|--------|-------------|---------|
| `Authorization` | Bearer token from auth | `Bearer eyJhbG...` |
| `Tenant-Id` | Current tenant GUID | `a1b2c3d4-...` |
| `Content-Type` | Request body type | `application/json` |

```typescript
// Example HTTP client configuration
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth headers
httpClient.interceptors.request.use((config) => {
  const token = authService.getAccessToken()
  const tenantId = authService.getTenantId()
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (tenantId) {
    config.headers['Tenant-Id'] = tenantId
  }
  
  return config
})
```

## Response Format

### Success Response

All successful responses return data directly:

```typescript
// GET /api/v1/locations/123
// Status: 200 OK
{
  "id": 123,
  "identifier": "FH001",
  "name": "Evergreen Memorial",
  // ... other fields
}
```

### Error Response

Errors return a message with appropriate status code:

```typescript
// GET /api/v1/locations/999
// Status: 404 Not Found
"Location not found"

// POST /api/v1/locations (invalid data)
// Status: 400 Bad Request
{
  "title": "Validation failed",
  "errors": {
    "identifier": ["Location ID is required"]
  }
}

// Any request without auth
// Status: 401 Unauthorized
"Unauthorized"

// Request without permission
// Status: 403 Forbidden
"Access denied"

// Server error
// Status: 500 Internal Server Error
"Server error"
```

### Backend Response<T> Pattern

Internally, the BFF uses a `Response<T>` wrapper:

```csharp
// C# backend
public class Response<T> : ResponseBase {
    public T Value { get; set; }
}

public class ResponseBase {
    public bool Success { get; set; }
    public int StatusCode { get; set; }
    public string ErrorMessage { get; set; }
}
```

This is converted to standard HTTP responses before reaching the frontend.

## Location Endpoints

### List Locations

```
GET /api/v1/locations/listing
```

Returns locations the current user has access to (filtered by permissions).

**Response:** `LocationListing[]`

```json
[
  {
    "id": "123",
    "identifier": "FH001",
    "name": "Evergreen Memorial",
    "city": "Springfield",
    "state": "IL",
    "type": "Funeral",
    "glGroupId": "1"
  }
]
```

### Get Location

```
GET /api/v1/locations/{id}
```

**Response:** `Location`

```json
{
  "id": 123,
  "identifier": "FH001",
  "name": "Evergreen Memorial Funeral Home",
  "type": 0,
  "active": true,
  "address1": "1234 Oak Street",
  "address2": "Suite 100",
  "city": "Springfield",
  "state": "IL",
  "postalCode": "62701",
  "county": "Sangamon",
  "country": "USA",
  "latitude": 39.7817,
  "longitude": -89.6501,
  "phone": "(217) 555-0100",
  "email": "info@evergreen.com",
  "website": "https://evergreen.com",
  "mailingSameAsPhysical": true,
  "mailing_Address1": "",
  "accountingPeriod": "2024-12-01T00:00:00Z",
  "glGroupId": 1,
  "intercompanyGlAccountId": null,
  "glMaps": [],
  "licenses": [
    {
      "id": 1,
      "locationId": 123,
      "licenseNumber": "FH-2024-001234",
      "licenseType": 1
    }
  ],
  "taxId": "12-3456789",
  "timezone": "America/Chicago",
  "contractDisplayName": "Evergreen Memorial"
}
```

### Get Location Settings

```
GET /api/v1/locations/settings/{id}
```

Returns location-specific settings (separate from location entity).

### Create Location

```
POST /api/v1/locations
```

**Permission:** `ManageLocations`

**Request Body:** `LocationEditModel`

```json
{
  "model": {
    "identifier": "FH002",
    "name": "New Funeral Home",
    "type": 0,
    "active": true,
    // ... all LocationModel fields
  },
  "settings": {
    // LocationSettings object
  }
}
```

### Update Location

```
PUT /api/v1/locations/{id}
```

**Permission:** `ManageLocations`

**Request Body:** Same as create

## Contract Endpoints

### List Contracts

```
GET /api/v1/contracts/listing/{locationId}?fromDate={date}&toDate={date}&needType={type}
```

**Query Parameters:**
- `fromDate` - Filter by date range start (optional)
- `toDate` - Filter by date range end (optional)
- `needType` - Filter by need type (optional)

### Get Contract

```
GET /api/v1/contracts/{id}
```

Returns full contract model with all related data.

### Save Contract Draft

```
POST /api/v1/contracts/save/draft
```

**Permission:** `ProcessContracts`

**Request Body:** `ContractSessionSaveModel` - Single payload containing contract, sales, items, and payments

The legacy backend expects **everything in one request**:

```typescript
interface ContractSessionSaveModel {
  executeContract: boolean
  finalizeContract: boolean
  voidContract: boolean
  contract: ContractSaveModel  // Includes nested sales with items
  payments: PaymentSaveModel[]
  commentFeed: CommentFeed
  data: ContractSessionDataSaveModel
  // ... other fields
}

interface ContractSaveModel {
  id: string
  contractNumber: string
  // ... contract fields
  sales: ContractSaleSaveModel[]  // Nested sales
  people: ContractPersonModel[]
  financing: ContractFinancingSaveModel | null
  // ... other fields
}

interface ContractSaleSaveModel {
  id: string
  contractId: string
  saleType: SaleType
  saleStatus: SaleStatus
  items: ContractSaleItemSaveModel[]  // Nested items
  // ... other sale fields
}
```

**Important:** The backend saves everything in **one database transaction**. This ensures atomicity - if any part fails, the entire save is rolled back.

**Backend CREATE vs UPDATE Logic**: The backend automatically determines whether to CREATE or UPDATE entities based on IDs in the payload:
- If an entity has an ID that exists in the database → UPDATE
- If an entity has no ID or an ID that doesn't exist → CREATE
- If an entity is missing from the payload but existed before → DELETE (optional, depends on business rules)

This means the frontend doesn't need to track which entities are new vs modified - just send the complete current state in the nested payload.

**Current Implementation Note:** Our JSON Server implementation uses:
1. **Separate API calls**: create contract → create sale → create items → create payments → update people (because JSON Server doesn't support nested saves)
2. **Client-side CREATE/UPDATE tracking**: Handlers track `originalIds` to determine which entities need `add*()` vs `update*()` methods

**Migration Required**: When connecting to the real BFF:
1. Remove all `persistNewItems()`, `persistNewPayments()`, `persistPeopleChanges()` logic
2. Remove `originalIds` tracking from handlers
3. Remove `getNewItems()`, `getModifiedItems()`, etc. helper methods
4. Update `ContractApi.create()` and `ContractApi.update()` to send the entire nested `ContractSessionSaveModel` payload in one request
5. Simplify `useContractSession.save()` to: build payload → single API call → refresh UI

This will significantly reduce code complexity and align with the backend's atomic transaction model.

### Validate Contract

```
POST /api/v1/contracts/save/validate
```

Validates a contract without saving.

### Save Contract Adjustment

```
POST /api/v1/contracts/save/adjustment
```

**Permission:** Varies by adjustment type (cancellation, exchange, etc.)

## Permission System

### Security Options

The backend uses numeric security option keys:

```typescript
// From legacy SecurityOptionKeys
enum SecurityOptionKeys {
  ProcessContracts = 100,
  ProcessContractItemCancellations = 101,
  ProcessContractDiscountAdjustments = 102,
  // ... etc
  ManageLocations = 200,
  // ... etc
}
```

### Permission Check Pattern

Controllers check permissions before actions:

```csharp
// Backend pattern
[HttpPost, ManageLocations]  // Attribute check
public async Task<IActionResult> Post([FromBody] LocationEditModel model)
{
    // Additional runtime checks if needed
    if (!await permissions.HasAccess(tenantId, userId, category, option, level))
        return Unauthorized();
    
    // ... proceed with action
}
```

### Frontend Permission Handling

```typescript
// Use before making requests
const { hasPermission } = usePermissions()

async function saveLocation(data: LocationFormValues) {
  if (!hasPermission('locations', 'edit')) {
    throw new Error('Permission denied')
  }
  
  // Proceed with API call
}
```

## Error Handling Strategy

### HTTP Client Wrapper

```typescript
// shared/api/httpClient.ts
export async function apiRequest<T>(
  method: string,
  url: string,
  data?: unknown
): Promise<ApiResult<T>> {
  try {
    const response = await httpClient.request<T>({
      method,
      url,
      data,
    })
    return { success: true, data: response.data }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500
      const message = resolveErrorMessage(error)
      
      return {
        success: false,
        error: { status, message },
      }
    }
    return {
      success: false,
      error: { status: 500, message: 'Unknown error' },
    }
  }
}

function resolveErrorMessage(error: AxiosError): string {
  const status = error.response?.status
  const data = error.response?.data
  
  switch (status) {
    case 400:
      return typeof data === 'string' ? data : data?.title ?? 'Bad request'
    case 401:
      return 'Please log in to continue'
    case 403:
      return 'You do not have permission for this action'
    case 404:
      return 'Resource not found'
    case 409:
      return typeof data === 'string' ? data : 'Conflict - resource already exists'
    case 500:
      return 'Server error - please try again'
    default:
      return error.message ?? 'Request failed'
  }
}
```

### Result Type Pattern

```typescript
// For typed results (aligns with Effect TS future)
type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError }

interface ApiError {
  status: number
  message: string
  fields?: Record<string, string[]>  // Validation errors
}
```

## Real-Time Updates (SignalR)

### Connection Setup

```typescript
// Future implementation
import * as signalR from '@microsoft/signalr'

const connection = new signalR.HubConnectionBuilder()
  .withUrl(`${BFF_URL}/hubs/facts`, {
    accessTokenFactory: () => authService.getAccessToken(),
  })
  .withAutomaticReconnect()
  .build()
```

### Entity Change Notifications

The backend publishes entity changes:

```typescript
// Subscribe to location changes
connection.on('LocationChanged', (event: EntityChangeEvent<Location>) => {
  switch (event.type) {
    case 'insert':
    case 'update':
      queryClient.setQueryData(['location', event.entity.id], event.entity)
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      break
    case 'delete':
      queryClient.removeQueries({ queryKey: ['location', event.entity.id] })
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      break
  }
})
```

## Migration Checklist

When connecting to real API:

- [x] Configure environment variables for API URL
- [x] Implement auth service with OIDC
- [x] Add request interceptor for auth headers
- [x] Replace mock API calls with real HTTP requests
- [x] ~~Add enum conversion (backend numeric → frontend string)~~ **REMOVED** - Frontend now uses numeric enums matching backend
- [x] ~~Add date handling (backend DateTime → frontend ISO string)~~ **HANDLED BY BFF** - BFF sends ISO strings
- [x] ~~Add ID conversion (backend long → frontend string)~~ **HANDLED BY BFF** - BFF sends string IDs
- [x] ~~Add field name conversion~~ **HANDLED BY BFF** - BFF sends camelCase field names
- [ ] Implement error handling middleware
- [ ] Add SignalR connection for real-time updates
- [ ] Test permission-gated endpoints
- [ ] Verify location-scoped data filtering

**Note:** The frontend now matches the BFF format exactly. No conversion layer is needed. See [BFF Alignment Refactor](./bff-alignment-refactor.md) for details.

## See Also

- [Data Models](./data-models.md) - Field mapping between backend and frontend
- [Legacy Patterns](./legacy-patterns.md) - Patterns from legacy app
- [Effect TS](./effect-ts.md) - Typed error handling strategy
- [BFF Alignment Refactor](./bff-alignment-refactor.md) - Complete overview of BFF format alignment

