# BFF Alignment Refactor - Complete Overview

**Date:** December 2024  
**Status:** ✅ Complete

## Executive Summary

Facts Alpha has been refactored to **exactly match** the BFF (Backend for Frontend) response format. This eliminates the need for a mapping layer and ensures seamless integration when connecting to the production backend.

## What Changed

### 1. Entity Base Type System ✅

**Created:** `/apps/web/src/shared/lib/entity/types.ts`

- Introduced `Entity` base interface matching legacy app pattern
- All entities now extend `Entity` with standardized fields:
  - `id: string` (BFF sends as string via `LongToStringConverter`)
  - `dateCreated: string` (ISO 8601)
  - `dateLastModified: string` (ISO 8601)
  - `createdByUserId?: number`
  - `version?: string`
- Added `EntityState` enum for change tracking (New, Modified, Deleted, etc.)
- Added `EntityAction<T>` wrapper for batch operations

**Impact:** Eliminates duplicate timestamp fields across all entities, provides consistent base structure.

### 2. Removed Mapping Layer ✅

**Deleted:** Entire `/apps/web/src/shared/api/mappers/` directory

**Why:** The BFF already handles all necessary conversions:

- ✅ **ID Conversion**: `LongToStringConverter` converts `long` → `string`
- ✅ **Field Casing**: `CamelCaseNamingStrategy` converts `PascalCase` → `camelCase`
- ✅ **Field Names**: BFF sends `dateCreated`/`dateLastModified` (not `createdAt`/`updatedAt`)

**Result:** BFF response format = Facts Alpha entity format (1:1 match). No conversion needed.

### 3. Numeric Enums (Matching C# Backend) ✅

**Changed:** All enums from string literals to numeric enums

| Enum            | Before                           | After                                     |
| --------------- | -------------------------------- | ----------------------------------------- |
| `NeedType`      | `'at_need' \| 'pre_need'`        | `enum { AT_NEED = 1, PRE_NEED = 2 }`      |
| `SaleStatus`    | `'draft' \| 'executed' \| ...`   | `enum { DRAFT = 0, EXECUTED = 1, ... }`   |
| `LocationType`  | `'funeral' \| 'cemetery' \| ...` | `enum { FUNERAL = 0, CEMETERY = 1, ... }` |
| `SaleType`      | String literals                  | `enum { CONTRACT = 0, ... }`              |
| `PaymentMethod` | String literals                  | `enum { CASH = 0, CHECK = 1, ... }`       |
| All other enums | String literals                  | Numeric enums matching C# backend         |

**Files Updated:**

- All enum definitions in `/apps/web/src/entities/*/model/*.ts`
- All enum controllers in `/apps/web/src/shared/lib/enums/**/*.ts`
- All form schemas using `z.nativeEnum()` instead of `z.enum()`
- All UI components and composables

### 4. Field Name Standardization ✅

**Changed:** Timestamp field names to match BFF

| Before      | After              | Applied To                        |
| ----------- | ------------------ | --------------------------------- |
| `createdAt` | `dateCreated`      | All entities, handlers, API calls |
| `updatedAt` | `dateLastModified` | All entities, handlers, API calls |

**Files Updated:**

- All entity interfaces
- All handler functions (`useItemsHandler`, `usePeopleHandler`, `usePaymentsHandler`)
- All API client methods
- All entity types

### 5. Simplified EnumController ✅

**Changed:** `/apps/web/src/shared/lib/enums/EnumController.ts`

**Removed:**

- `fromApi()` / `toApi()` conversion methods (no longer needed)
- `value` field in `EnumChoice` (now just `id` and `name`)

**Kept:**

- `getLabel()` for display labels
- `selectItems` for UI components
- `sortedChoices` for sorted lists

**Updated Structure:**

```typescript
// Before
interface EnumChoice<TValue extends string> {
  id: number
  value: TValue // String literal
  name: string
}

// After
interface EnumChoice<TEnum extends number> {
  id: TEnum // Numeric enum value
  name: string
}
```

### 6. Updated Form Schemas ✅

**Changed:** All Zod schemas to use `z.nativeEnum()` for numeric enums

**Files Updated:**

- `/apps/web/src/entities/contract/model/contractSchema.ts`
- `/apps/web/src/entities/location/model/locationSchema.ts`

**Example:**

```typescript
// Before
needType: z.enum([NeedType.AT_NEED, NeedType.PRE_NEED])

// After
needType: z.nativeEnum(NeedType)
```

### 7. Entity Type Alignment ✅

**Changed:** All entity types now match BFF format

- All enum values: Numeric enums matching C# backend
- All field names: `dateCreated`/`dateLastModified` (BFF format)
- All ID types: String IDs (BFF converts from numeric)

## Architecture Impact

### Before

```
BFF Response (numeric IDs, PascalCase, numeric enums)
    ↓
Mapper Layer (converts IDs, enums, field names)
    ↓
Frontend Entities (string IDs, camelCase, string enums)
```

### After

```
BFF Response (string IDs, camelCase, numeric enums)
    ↓
Frontend Entities (string IDs, camelCase, numeric enums)
    ✅ Perfect 1:1 match - no conversion needed!
```

### 8. Name Entity and Nested Structure ✅

**Created:** `/apps/web/src/entities/name/model/name.ts`

**Changed:** ContractPerson now uses nested `Name` object matching BFF structure exactly

**Before (flattened):**

```typescript
interface ContractPerson {
  firstName: string
  lastName: string
  phone?: string
  email?: string
  address?: Address
}
```

**After (nested, matching BFF):**

```typescript
interface ContractPerson {
  nameId: string
  roles: number // Flags enum
  name: Name // Nested object with phones[], addresses[], emailAddresses[]
}

interface Name {
  first: string
  last: string
  phones: NamePhone[]
  addresses: NameAddress[]
  emailAddresses: NameEmail[]
}
```

**Impact:**

- Removed transformation/flattening logic from `contractApi.ts`
- Components now access `person.name.first` instead of `person.firstName`
- Helper functions in `nameHelpers.ts` provide utilities for working with nested structure
- Form schemas updated to validate nested structure

### 9. ContractSession Wrapper ✅

**Changed:** `contractApi.ts` now handles BFF response wrapper

**BFF Response Format:**

```typescript
interface ContractSession {
  contract: Contract
  permissions: ContractPermissions
  data: ContractSessionData
  executeContract: boolean
  finalizeContract: boolean
  voidContract: boolean
}

interface ContractPermissions {
  canExecute: boolean
  canFinalize: boolean
  canVoid: boolean
}
```

**Impact:** API layer returns the full `ContractSession` object, preserving all BFF data including permissions. The state machine stores the full session and exposes both `contract` and `permissions` to consumers.

## Benefits

1. **Simplified Codebase**: Removed entire mapping layer (~500+ lines)
2. **Type Safety**: Numeric enums match C# backend exactly
3. **Performance**: No runtime conversion overhead
4. **Maintainability**: Single source of truth (BFF format)
5. **Integration Ready**: Direct compatibility with production backend

## Migration Notes

### What Works Now

- ✅ All entities use BFF field names directly
- ✅ All enums match C# backend numeric values
- ✅ Entity types match BFF format exactly
- ✅ Form validation uses native enums
- ✅ UI components work with numeric enum values

### When Connecting to Production

**No changes needed!** The frontend now expects:

- String IDs (BFF sends via `LongToStringConverter`)
- camelCase field names (BFF sends via `CamelCaseNamingStrategy`)
- Numeric enum values (BFF sends C# enum values directly)
- `dateCreated`/`dateLastModified` field names (BFF sends these directly)

Simply point the API client to the production BFF URL - everything will work.

## Files Changed Summary

### Created

- `/apps/web/src/shared/lib/entity/types.ts` - Entity base types
- `/apps/web/src/shared/lib/entity/index.ts` - Entity exports
- `/apps/web/src/entities/name/model/name.ts` - Name entity types (BFF-aligned)
- `/apps/web/src/entities/name/model/nameHelpers.ts` - Name utility functions
- `/apps/web/src/entities/name/index.ts` - Name entity exports

### Deleted

- `/apps/web/src/shared/api/mappers/` - Entire directory (no longer needed)

### Modified

- All entity model files (`contract.ts`, `location.ts`, `tenant.ts`)
- All enum controller files (`**/enums/**/*.ts`)
- All form schema files (`contractSchema.ts`, `locationSchema.ts`)
- All handler files (`useItemsHandler.ts`, `usePeopleHandler.ts`, etc.)
- All API client files (`contractApi.ts`, etc.)
- All page components using enums
- Entity types and schemas

## Testing Checklist

- [x] All TypeScript errors resolved
- [x] All enum values match C# backend
- [x] All field names match BFF format
- [x] Form validation works with numeric enums
- [x] UI components display enum labels correctly
- [x] Entity types match BFF format exactly
- [x] ContractPerson uses nested Name structure (matching BFF)
- [x] ContractSession wrapper handled correctly (includes permissions)
- [x] No transformation logic in API layer
- [x] Components access nested name data correctly

## Related Documentation

- [API Integration](./api-integration.md) - Updated to reflect no enum conversion needed
- [Data Models](./data-models.md) - Updated enum and field name conventions
- [Legacy Patterns](./legacy-patterns.md) - Entity base type pattern source
