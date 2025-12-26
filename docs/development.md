# Development

## Prerequisites

- Node.js 22+
- pnpm 10+

## Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Lint (Oxlint + ESLint)
pnpm lint

# Format code
pnpm format

# Type check
pnpm type-check
```

## Development Server

The app runs at `http://localhost:3000` by default.

## Key Files Reference

| File                                                     | Purpose                               |
| -------------------------------------------------------- | ------------------------------------- |
| `apps/web/src/app/providers/vuetify.ts`                  | MD3 Blueprint + brand colors          |
| `apps/web/src/app/providers/query.ts`                    | TanStack Query configuration          |
| `apps/web/src/styles/settings.scss`                      | SASS overrides, global styles         |
| `apps/web/src/widgets/app-shell/ui/AppShell.vue`         | Main layout with sidebar              |
| `apps/web/src/widgets/app-shell/ui/LocationSelector.vue` | Location dropdown in toolbar          |
| `apps/web/src/stores/userContext.ts`                     | User, location, and permissions store |
| `apps/web/src/shared/lib/security/securityKeys.ts`       | Security option keys enum             |
| `apps/web/src/shared/lib/security/types.ts`              | Permission types and helpers          |
| `apps/web/src/shared/lib/composables/usePermissions.ts`  | Permission checking composable        |
| `apps/web/src/app/providers/router.ts`                   | Route permission guard                |
| `apps/web/src/entities/case/model/useCases.ts`           | Example domain composable             |
| `apps/web/src/entities/contract/model/useContracts.ts`   | Contract list with location filtering |
| `packages/ui/src/tokens/colors.ts`                       | Brand color definitions               |
| `packages/ui/src/index.ts`                               | UI package exports                    |

## Browser Support

Modern browsers only (ES2022+). No IE11 support.

