# Facts Alpha - Funeral Home ERP

A modern, scalable funeral home ERP system built with Vue 3, Vuetify 3, and Feature-Sliced Design architecture.

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

## Tech Stack

- **Framework**: Vue 3 (Composition API, `<script setup>`)
- **UI Library**: Vuetify 3 with MD3 Blueprint
- **Build Tool**: Vite 7
- **Monorepo**: Turborepo + pnpm workspaces
- **Data Fetching**: TanStack Query (Vue Query)
- **State Management**: Pinia (for global state)
- **Routing**: Vue Router (file-based with unplugin-vue-router)
- **Linting**: Oxlint (fast) + ESLint (Vue/Vuetify rules)
- **Formatting**: Prettier
- **TypeScript**: 5.9

## Documentation

Detailed documentation is organized in the [`docs/`](./docs/) folder:

- **[Architecture](./docs/architecture.md)** - Feature-Sliced Design, project structure, domain composables
- **[Design System](./docs/design-system.md)** - MD3, wrapper components, Vuetify configuration
- **[Forms](./docs/forms.md)** - Form patterns, composables, state architecture, full-screen dialogs
- **[Location Context](./docs/location-context.md)** - Location-scoped data filtering and context management
- **[Permissions](./docs/permissions.md)** - Route guards, UI-level permission checks, security keys
- **[Conventions](./docs/conventions.md)** - FSD import rules, naming conventions, state management patterns
- **[Development](./docs/development.md)** - Setup, commands, key files reference
- **[Status](./docs/status.md)** - Implementation status and roadmap

## Project Structure

```
facts-alpha/
├── apps/
│   └── web/                    # Main Vue application
│       └── src/
│           ├── app/            # FSD: App layer (providers, global config)
│           ├── pages/          # FSD: Pages layer (file-based routing)
│           ├── widgets/        # FSD: Widgets layer (composite UI blocks)
│           ├── features/       # FSD: Features layer (user interactions)
│           ├── entities/       # FSD: Entities layer (business entities)
│           └── shared/         # FSD: Shared layer (utilities, API)
├── packages/
│   ├── ui/                     # @facts/ui - Design system components
│   └── utils/                  # @facts/utils - Shared utilities
└── docs/                       # Documentation
```

## Development Commands

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

## Browser Support

Modern browsers only (ES2022+). No IE11 support.
