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

📖 **Start here:** [Documentation Guide](./docs/README.md)

Documentation is organized as a **technical book** with clear naming conventions:

### Main Guides (Read in Order)

1. **[Getting Started](./docs/00-getting-started.md)** - Setup, commands, project structure
2. **[Architecture](./docs/01-architecture.md)** - FSD layers, domain composables, location context
3. **[Conventions](./docs/02-conventions.md)** - Naming, file organization, FSD import rules
4. **[Common Patterns](./docs/03-common-patterns.md)** - Forms, API integration, dialogs
5. **[Design System](./docs/04-design-system.md)** - MD3, wrapper components, Vuetify
6. **[Security](./docs/05-security.md)** - Authentication, permissions, OIDC
7. **[Appendices](./docs/06-appendices.md)** - Reference documentation index

### File Naming Conventions

- **`00-` to `06-`** - Main documentation guides (read in order)
- **`ref/{topic}/`** - Reference documentation organized by topic:
  - `ref/api/` - API integration patterns
  - `ref/architecture/` - Architecture patterns, refactors, and error handling
  - `ref/data/` - Data models and type mappings
- **`README.md`** - Documentation index

See [docs/README.md](./docs/README.md) for the complete guide and all reference documentation.

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

## Contributing

When contributing, please follow the documentation:

1. **[Conventions](./docs/02-conventions.md)** - Naming, file organization, FSD rules
2. **[Architecture](./docs/01-architecture.md)** - FSD layer structure and patterns
3. **[Common Patterns](./docs/03-common-patterns.md)** - Form patterns and composables

## License

[Add your license here]
