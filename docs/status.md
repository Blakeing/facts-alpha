# Implementation Status

## Completed

- [x] Monorepo setup (Turborepo + pnpm)
- [x] FSD folder structure
- [x] Design tokens (colors, spacing, typography)
- [x] Wrapper component library (20+ components)
- [x] Application shell with collapsible sidebar (rail mode)
- [x] Location context and filtering:
  - [x] Location selector dropdown in AppShell toolbar
  - [x] User context store with location management (`useUserContextStore`)
  - [x] Location-scoped data filtering (contracts filtered by current location)
  - [x] Location entity integration with API
  - [x] **Backend-aligned fields** (coordinates, accounting, display settings)
  - [x] Location form with extended backend fields
- [x] Permissions & Route Guards:
  - [x] Security keys enum aligned with legacy FACTS app (100+ keys)
  - [x] Permission types and helpers (Read/Edit levels, Requirement)
  - [x] User context store with permission checking methods
  - [x] Router guard for route-level permission validation
  - [x] `usePermissions` composable for UI-level permission gating
  - [x] Route meta permissions on protected routes
  - [x] Mock permissions for development testing
- [x] Vuetify MD3 blueprint integration
- [x] Case Management module:
  - [x] Case list page with filtering and search
  - [x] Case detail page
  - [x] Case create/edit form
  - [x] Case entity (types, store, mock data)
- [x] Contract Management module:
  - [x] Contract list page with FListCard + AG Grid
  - [x] Full-screen dialog editing pattern (FFullScreenDialog)
  - [x] Tabbed interface (General, Items, Payments)
  - [x] Contract entity (types, schema, mock API, composables)
  - [x] **Backend-aligned data models** (Contract/Sale/SaleItem structure)
  - [x] **Updated enums** (NeedType, SaleStatus, PaymentMethod with ACH)
  - [x] **Primary buyer/beneficiary** (role-based people relationships)
  - [x] Location-scoped filtering (contracts filtered by current location)
  - [x] Form validation with Zod (custom implementation, no vee-validate)
  - [x] Dirty form tracking with unsaved changes confirmation
  - [x] Save validation with inline errors + snackbar + toast feedback
  - [x] **BFF Alignment** - Numeric enums, Entity base type, field name standardization
- [x] Linting/formatting setup (Oxlint, ESLint, Prettier)
- [x] VSCode configuration
- [x] Domain-centric composable architecture:
  - [x] TanStack Query for data fetching and caching
  - [x] Case domain composables (`useCases`, `useCase`, `useCaseForm`)
  - [x] Contract domain composables (`useContracts`, `useContract`, `useContractForm`)
  - [x] Location domain composables (`locationApi`, location entity)
  - [x] Mock API client pattern (`caseApi`, `contractApi`, `locationApi`)
- [x] Form utilities (inspired by legacy FACTS app):
  - [x] `useFormModel` - Live model state management with Zod validation
  - [x] `useFormContext` + `FFormProvider` - Automatic field error/blur binding
  - [x] `FFormErrorsSnackbar` - Dismissable validation error snackbar
  - [x] `useDirtyForm` - Snapshot-based dirty tracking
  - [x] `useConfirm` + `FConfirmDialog` - Promise-based confirmations
  - [x] `useFormSave` - Validate-then-save pattern
  - [x] `useListController` - Standardized list-to-edit workflow with prefetch
  - [x] Zod validators for common patterns (currency, dates, etc.)
- [x] AG Grid integration for `FDataTable`:
  - [x] Slot-based cell rendering (`#item.{key}`)
  - [x] Full AG Grid ColDef support
  - [x] Auto-height and fill-height modes
  - [x] Pagination support
- [x] Utility library (`@facts/utils`):
  - [x] Date/currency/number formatters
  - [x] Lodash re-exports (cloneDeep, isEqual, debounce, etc.)
  - [x] Zod validation schemas
- [x] **BFF Alignment & Entity System**:
  - [x] Entity base type system (matching legacy app pattern)
  - [x] Numeric enums matching C# backend exactly
  - [x] Field name standardization (`dateCreated`/`dateLastModified`)
  - [x] Removed mapping layer (BFF format = Frontend format)
  - [x] Updated all form schemas to use `z.nativeEnum()`
  - [x] Updated mock data to match production format
  - [x] Simplified EnumController (removed conversion methods)

## Next Priorities

- [ ] **Effect TS Integration** - Typed error handling and functional programming
- [ ] **Architectural Patterns** - Railway, Command, Saga patterns for scalability
- [ ] **Feature Expansion** - Financing, multi-sale, item catalog, tax calculation
- [ ] **Authentication** - User management and login system
- [x] **API Integration** - Real backend connection (BFF ready - format aligned, just needs URL change)

## Future Phases

See **[Roadmap](./roadmap.md)** for detailed development phases and timeline.

## Deprecated/Removed

- [x] Dark mode (removed for now, tokens ready for future implementation)
- [x] Multi-tenant support (entity exists, not implemented - future phase)

