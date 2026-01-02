# Security & Authentication

## Authentication

Facts Alpha uses **OIDC (OpenID Connect)** for authentication, matching the legacy Facts app.

### Architecture

```
Facts Alpha (Frontend)
  ↓ HTTPS (Bearer Token + Tenant-Id)
Facts BFF Gateway
  ↓ Internal HTTP
Microservices
```

### Key Components

1. **Endpoint Configuration** (`apps/web/public/ep.json`) - Runtime configuration for environment URLs
2. **Authentication Service** (`shared/lib/auth/authService.ts`) - OIDC implementation using `oidc-client-ts`
3. **HTTP Client** - Automatically adds `Authorization: Bearer {token}` and `Tenant-Id: {tenantId}` headers
4. **User Context Store** - Manages user info, tenant ID, permissions, and available locations

### Authentication Flow

All API calls go through the BFF with Bearer token authentication:

- OIDC authentication required
- Bearer token automatically added to requests
- Tenant-Id header included for multi-tenant support

## Permissions

### Permission System

- **Security Keys**: 100+ keys aligned with legacy FACTS app (e.g., `ProcessContracts`, `EditLocations`)
- **Permission Levels**: `Read`, `Edit`, `None`
- **Route Guards**: Automatic permission checking on routes
- **UI-Level Checks**: `usePermissions()` composable for conditional rendering

### Usage

```typescript
// Route-level permissions
// apps/web/src/app/providers/router.ts
{
  path: '/contracts',
  meta: {
    permissions: {
      key: SecurityOptionKeys.ProcessContracts,
      level: PermissionLevel.Read,
    },
  },
}

// UI-level permissions
import { usePermissions } from '@/shared/lib'

const { hasPermission } = usePermissions()
const canEdit = computed(() => hasPermission(SecurityOptionKeys.ProcessContracts, PermissionLevel.Edit))

<FButton v-if="canEdit">Edit Contract</FButton>
```

### Permission Types

```typescript
interface UserEffectivePermissions {
  isAdmin: boolean
  permissionsGranted: PermissionGrant[]
}

interface PermissionGrant {
  key: number // SecurityOptionKeys enum value
  level: PermissionLevel // Read, Edit, or None
}
```

## Related Documentation

- [API Integration](./ref/api/integration.md) - BFF endpoint patterns
- [Getting Started](./00-getting-started.md) - Setup and commands
