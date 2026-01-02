# Enum Controllers

This directory contains UI controllers for TypeScript enums, providing display labels and integration with select components.

## Architecture

```
@/entities/[entity]/model/[entity].enums.ts  <-- Enum definitions (source of truth)
        ↓
@/entities/[entity]/lib/controllers/[enum].controller.ts  <-- Enum controllers (display logic)
        ↓
Vue components (FEnumSelect, etc.)     <-- UI usage
```

**Note:** Enum controllers are now located in the entity's `lib/controllers/` directory to follow FSD architecture. The base `EnumController` and `EnumRegistry` infrastructure remains in `@/shared/lib/enums/`.

## ⚠️ CRITICAL: Circular Dependency Prevention

### The Problem

When enum controllers import from entity index files (e.g., `@/entities/contract`), it creates circular dependencies:

```typescript
// ❌ BAD - Creates circular dependency
import { SaleStatus } from '@/entities/contract'

// This is because:
// 1. @/entities/contract/index.ts exports everything from ./model
// 2. ./model/index.ts may import enum controllers
// 3. Result: circular dependency at module initialization
// 4. At runtime: enum is undefined when controller initializes
```

### The Solution

**Always import enums directly from their model file, not from entity index:**

```typescript
// ✅ GOOD - Direct import bypasses circular dependency
import { SaleStatus } from '@/entities/contract/model/contract'
import { EnumController } from '../EnumController'
import { enumRegistry } from '../EnumRegistry'

class SaleStatusController extends EnumController<SaleStatus> {
  choices = [
    { id: SaleStatus.DRAFT, name: 'Draft' },
    { id: SaleStatus.EXECUTED, name: 'Executed' },
  ]
  // Note: NO "as const" - base class expects mutable array
}
```

## Pattern Template

When creating a new enum controller:

```typescript
// 1. Import enum from direct model file path
import { YourEnum } from '@/entities/[entity]/model/[entity]'
import { EnumController } from '@/shared/lib/enums/EnumController'
import { enumRegistry } from '@/shared/lib/enums/EnumRegistry'

// 2. Create controller class
class YourEnumController extends EnumController<YourEnum> {
  // 3. Define choices WITHOUT "as const"
  choices = [
    { id: YourEnum.VALUE_1, name: 'Display Name 1' },
    { id: YourEnum.VALUE_2, name: 'Display Name 2' },
  ]
}

// 4. Export singleton instance
export const yourEnumController = new YourEnumController()

// 5. Auto-register for global lookup
enumRegistry.register('yourEnum', yourEnumController)
```

## Import Order (for linter)

```typescript
// 1. Direct entity model imports (internal, absolute paths starting with @/)
import { SaleStatus } from '@/entities/contract/model/contract'

// 2. Shared infrastructure imports (absolute paths)
import { EnumController } from '@/shared/lib/enums/EnumController'
import { enumRegistry } from '@/shared/lib/enums/EnumRegistry'
```

## Common Mistakes

### ❌ Using entity index path

```typescript
import { SaleStatus } from '@/entities/contract' // WRONG
```

### ❌ Using "as const"

```typescript
choices = [...] as const // WRONG - creates readonly array
```

### ❌ Wrong import order

```typescript
import { EnumController } from '@/shared/lib/enums/EnumController'
import { SaleStatus } from '@/entities/contract/model/contract' // WRONG ORDER
```

## Why This Pattern?

1. **Avoids circular dependencies**: Direct imports break the circular module dependency chain
2. **Type safety**: Ensures enum values are defined before controller initialization
3. **Consistency**: Single pattern applied across all enum controllers
4. **Maintainability**: Clear separation between data model and display logic

## Testing

If you see errors like:

```
TypeError: Cannot read properties of undefined (reading 'DRAFT')
```

This means a circular dependency exists. Check that:

1. All enum imports use direct model paths
2. No "as const" is used in choices arrays
3. Import order follows the linter rules

## Related Files

- `EnumController.ts` - Base class for all controllers (in `@/shared/lib/enums/`)
- `EnumRegistry.ts` - Global registry for runtime enum lookup (in `@/shared/lib/enums/`)
- Entity enum controllers (`@/entities/*/lib/controllers/*.controller.ts`) - Domain-specific controllers
- Entity model files (`@/entities/*/model/*.enums.ts`) - Source enum definitions

## Importing Controllers in Components

Controllers are exported from the entity index:

```typescript
// ✅ GOOD - Import from entity
import { saleStatusController, needTypeController } from '@/entities/contract'

// ❌ BAD - Don't import from shared/lib/enums
import { saleStatusController } from '@/shared/lib/enums'
```
