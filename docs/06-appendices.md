# Appendices

Reference documentation index. All reference docs are organized by topic in the `ref/` directory.

## Reference Documentation

### API & Integration

- **[ref/api/integration.md](./ref/api/integration.md)** - Comprehensive BFF endpoint patterns, response handling, and integration details

### Architecture

- **[ref/architecture/legacy-patterns.md](./ref/architecture/legacy-patterns.md)** - Detailed patterns from the legacy Facts app that we've adopted

  **Key Patterns:**
  - **ID Generation**: Upfront ID generation using `nextIds()` API (matches legacy)
  - **Entity Base Types**: Standardized `Entity` interface with timestamps
  - **Enum Controllers**: Centralized enum management with display labels

- **[ref/architecture/bff-alignment.md](./ref/architecture/bff-alignment.md)** - Details on the refactor that aligned the frontend with the BFF response format

  **Key Changes:**
  - Removed mapping layer (BFF format = Frontend format)
  - Numeric enums matching C# backend
  - Field name standardization (`dateCreated`/`dateLastModified`)
  - Entity base type system

- **[ref/architecture/effect-ts.md](./ref/architecture/effect-ts.md)** - Effect TS integration for typed error handling (✅ IMPLEMENTED)

  **Key Features:**
  - Typed error handling with `Data.TaggedError`
  - TanStack Query bridge for Effect integration
  - HTTP error mapping utilities
  - Used across Contract and Location entities

### Data Models

- **[ref/data/models.md](./ref/data/models.md)** - Comprehensive backend/frontend field mapping and type alignment (30KB, very detailed)

### Error Handling

- **[ref/architecture/effect-ts.md](./ref/architecture/effect-ts.md)** - Effect TS integration for typed error handling (✅ IMPLEMENTED)
