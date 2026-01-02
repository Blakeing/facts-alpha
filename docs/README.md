# Documentation Guide

## 📖 For New Developers

**Read these in order** (like a book):

1. **[00-getting-started.md](./00-getting-started.md)** - Setup, commands, project structure
2. **[01-architecture.md](./01-architecture.md)** - FSD layers, domain composables, location context
3. **[02-conventions.md](./02-conventions.md)** - Naming, file organization, FSD import rules
4. **[03-common-patterns.md](./03-common-patterns.md)** - Forms, API integration, dialogs
5. **[04-design-system.md](./04-design-system.md)** - MD3, wrapper components, Vuetify
6. **[05-security.md](./05-security.md)** - Authentication, permissions, OIDC
7. **[06-appendices.md](./06-appendices.md)** - Reference documentation index

## 📚 Reference Documentation

Detailed reference docs organized by topic in `ref/` folders:

### API & Integration
- **[ref/api/integration.md](./ref/api/integration.md)** - Comprehensive BFF endpoint patterns

### Architecture
- **[ref/architecture/legacy-patterns.md](./ref/architecture/legacy-patterns.md)** - Patterns from legacy Facts app
- **[ref/architecture/bff-alignment.md](./ref/architecture/bff-alignment.md)** - Historical refactor notes
- **[ref/architecture/effect-ts.md](./ref/architecture/effect-ts.md)** - Effect TS integration for typed error handling (✅ IMPLEMENTED)

### Data Models
- **[ref/data/models.md](./ref/data/models.md)** - Backend/frontend field mapping (30KB, very detailed)

See [Appendices](./06-appendices.md) for complete reference index.

## File Naming Conventions

- **Numbered guides** (`00-`, `01-`, etc.) - Main documentation, read in order
- **Reference docs** (`ref/{topic}/`) - Organized by topic (api, architecture, data, future)
- **README.md** - This file, documentation index
