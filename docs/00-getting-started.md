# Getting Started

Welcome to Facts Alpha! This guide will help you get up and running quickly.

## Prerequisites

- **Node.js** 22+
- **pnpm** 10+

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

The app runs at `http://localhost:3000` by default.

## Development Commands

```bash
# Lint code (Oxlint + ESLint)
pnpm lint

# Format code (Prettier)
pnpm format

# Type check (TypeScript)
pnpm type-check
```

## Project Structure

```
facts-alpha/
├── apps/
│   └── web/              # Main Vue application
│       └── src/
│           ├── app/      # App initialization, providers
│           ├── pages/    # Route pages (file-based routing)
│           ├── widgets/  # Large composite UI blocks
│           ├── features/ # User interaction features
│           ├── entities/ # Business entities
│           └── shared/   # Shared utilities, API, UI
├── packages/
│   ├── ui/               # @facts/ui - Design system
│   └── utils/            # @facts/utils - Shared utilities
└── docs/                 # Documentation
```

## Key Concepts

1. **Feature-Sliced Design (FSD)** - Architecture methodology (see [Architecture](./01-architecture.md))
2. **Domain Composables** - `useContracts()`, `useContract()` for data fetching
3. **TanStack Query** - Automatic caching and request deduplication
4. **Vuetify 3 + MD3** - Material Design 3 component library

## Next Steps

1. Read [Architecture](./01-architecture.md) to understand the project structure
2. Read [Conventions](./02-conventions.md) for coding standards
3. Read [Common Patterns](./03-common-patterns.md) for development patterns
4. Check [Design System](./04-design-system.md) for UI components

## Key Files Reference

| File                                                     | Purpose                               |
| -------------------------------------------------------- | ------------------------------------- |
| `apps/web/src/app/providers/vuetify.ts`                  | MD3 Blueprint + brand colors          |
| `apps/web/src/app/providers/query.ts`                     | TanStack Query configuration          |
| `apps/web/src/widgets/app-shell/ui/AppShell.vue`         | Main layout with sidebar              |
| `apps/web/src/shared/lib/stores/userContext.ts`           | User, location, and permissions store |
| `apps/web/src/entities/contract/model/useContracts.ts`  | Example domain composable             |

## Browser Support

Modern browsers only (ES2022+). No IE11 support.

