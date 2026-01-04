# App Initialization & Loading States

This document explains the app bootstrapper system, Suspense integration, and how loading states are managed throughout the application lifecycle.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Bootstrapper Phases](#bootstrapper-phases)
- [Suspense Integration](#suspense-integration)
- [App Context Pattern](#app-context-pattern)
- [Route Transitions](#route-transitions)
- [Component Loading States](#component-loading-states)
- [Best Practices](#best-practices)
- [Why Suspense is Essential](#why-suspense-is-essential)

## Overview

The app uses a unified bootstrapper system to manage loading states during initialization and route navigation. This ensures:

- **Single loading state** - No multiple competing spinners
- **Smooth first impression** - Fade-in transition after bootstrap
- **Consistent UX** - All components follow the same loading patterns
- **Automatic coordination** - Components automatically suppress themselves during bootstrap

## Architecture

The system consists of four main components:

### 1. Bootstrapper Store

**Location:** `shared/lib/stores/bootstrapper.ts`

Tracks app initialization phases in a Pinia store:

```typescript
const bootstrapper = useBootstrapperStore()

// Phases tracked:
bootstrapper.loadingEndpoints        // Configuration loading
bootstrapper.initializingAuth         // Auth service init
bootstrapper.checkingAuth            // Router guard auth check
bootstrapper.initializingUserContext  // User permissions/settings
bootstrapper.loadingRouteData        // Route component data (via Suspense)

// Computed:
bootstrapper.isBootstrapping         // True if any phase is active
bootstrapper.isInitialLoad          // True on first page load only
```

### 2. App Bootstrapper Component

**Location:** `app/AppBootstrapper.vue`

Full-screen loading overlay that shows during bootstrap:

```vue
<v-overlay :model-value="bootstrapper.isBootstrapping" persistent>
  <v-progress-circular indeterminate />
  <div>Loading application...</div>
</v-overlay>
```

### 3. Suspense Integration

**Location:** `App.vue`

Wraps `RouterView` with Vue's `<Suspense>` to wait for async route components:

```vue
<Suspense
  @pending="handleSuspensePending"
  @resolve="handleSuspenseResolve"
>
  <Transition :name="bootstrapper.isInitialLoad ? 'fade' : ''">
    <component :is="Component" :key="routeKey" />
  </Transition>
</Suspense>
```

### 4. App Context

**Location:** `packages/ui/composables/useAppContext.ts`

Provides app-level state to UI components via Vue's `provide`/`inject`:

```typescript
// In App.vue
const appContext = createAppContext(computed(() => bootstrapper.isBootstrapping))
provideAppContext(appContext)

// In UI components (automatic)
const appContext = useAppContext()
// Components can check: appContext?.isBootstrapping.value
```

## Bootstrapper Phases

The bootstrapper tracks these phases in order:

### 1. Loading Endpoints

Configuration endpoints are fetched during app startup:

```typescript
// main.ts
bootstrapper.setLoadingEndpoints(true)
await EndpointsProvider.getEndpoints()
bootstrapper.setLoadingEndpoints(false)
```

### 2. Initializing Auth

Auth service initializes (OIDC setup, token refresh, etc.):

```typescript
// main.ts
bootstrapper.setInitializingAuth(true)
await AuthService.initialize()
bootstrapper.setInitializingAuth(false)
```

### 3. Checking Auth

Router guard checks authentication (only on initial load):

```typescript
// router.ts
bootstrapper.setCheckingAuth(true)
const isAuthenticated = await AuthService.checkAuth()
bootstrapper.setCheckingAuth(false)
```

### 4. Initializing User Context

User permissions and settings are loaded:

```typescript
// router.ts
bootstrapper.setInitializingUserContext(true)
await userContext.initFromAuth()
bootstrapper.setInitializingUserContext(false)
```

### 5. Loading Route Data

Route component data loads via Suspense:

```typescript
// App.vue - Suspense events
function handleSuspensePending() {
  bootstrapper.setLoadingRouteData(true)
}

function handleSuspenseResolve() {
  bootstrapper.setLoadingRouteData(false)
  bootstrapper.setInitialLoadComplete()
}
```

**The bootstrapper overlay shows during ANY of these phases on initial load.**

## Suspense Integration

### Why Suspense is Essential

**Suspense is required** for the bootstrapper synchronization to work properly.

**With Suspense:**

- Vue automatically tracks when async components resolve
- `@pending` and `@resolve` events provide clean hooks for loading state
- Components declare "I'm async" and Suspense handles orchestration
- Simple, declarative pattern: `await useSuspenseReady(...)`

**Without Suspense (alternative approaches):**

- ❌ Manually watch Vue Query's global fetching state (unreliable, doesn't know which queries belong to which route)
- ❌ Track query completion in router guards (complex, error-prone, doesn't handle nested queries)
- ❌ Use timeouts/delays (hacky, unreliable)
- ❌ Manual coordination between router and queries (fragile, hard to maintain)

**The Problem Suspense Solves:**

When a route loads, we need to know when **all** its data dependencies are ready. Without Suspense:

- We can't reliably detect when a route component's async work is done
- We'd need to manually track every query, watch, and async operation
- Edge cases multiply (queries that start after mount, nested queries, etc.)

Suspense provides a **declarative contract**: "This component is async, wait for it to resolve." Vue handles all the complexity of tracking promises, errors, and timing.

**Example - Without Suspense (complex):**

```typescript
// Would need something like this - much more complex!
router.beforeEach(async (to) => {
  bootstrapper.setLoadingRouteData(true)

  // Wait for route component to mount
  await router.push(to)
  await nextTick()

  // Manually track all queries for this route
  const queryClient = useQueryClient()
  const activeQueries = queryClient.getQueryCache().getAll()

  // Wait for all queries to complete (but which ones belong to this route?)
  await Promise.all(activeQueries.map((q) => q.promise))

  bootstrapper.setLoadingRouteData(false)
})
```

**With Suspense (simple):**

```typescript
// In App.vue - just listen to Suspense events
function handleSuspenseResolve() {
  bootstrapper.setLoadingRouteData(false)
}

// In route component - just await
await useSuspenseReady(isLoading, () => !!(data.value || error.value))
```

Suspense provides the **orchestration layer** that makes the bootstrapper synchronization possible.

### Using Suspense in Route Components

Route components should use `useSuspenseReady` to wait for data before rendering:

```vue
<script lang="ts" setup>
  import { useSuspenseReady } from '@/shared/lib'
  import { useContract } from '@/entities/contract'

  const route = useRoute()
  const contractId = computed(() => route.params.id as string)

  // Fetch data
  const { contract, isLoading, error } = useContract(contractId)

  // Wait for data before Suspense resolves
  // This keeps the bootstrapper visible until data is ready
  await useSuspenseReady(isLoading, () => !!(contract.value || error.value))

  // Component only renders after data is loaded or error occurs
</script>
```

**Key Rules:**

1. **Always include error in ready condition** - Use `() => !!(data.value || error.value)` to prevent Suspense from hanging on errors
2. **Only use in route components** - These are for top-level pages, not nested components
3. **Component must be async** - The `await` makes the component async, which is required for Suspense

### Multiple Queries

For components that depend on multiple queries:

```vue
<script lang="ts" setup>
  import { useSuspenseReadyAll } from '@/shared/lib'

  const { data1, isLoading: loading1 } = useQuery1()
  const { data2, isLoading: loading2 } = useQuery2()

  // Wait for ALL queries to complete
  await useSuspenseReadyAll(loading1, loading2)
</script>
```

**Don't** await multiple `useSuspenseReady` calls sequentially - use `useSuspenseReadyAll` instead.

### Why Not Suspense for Nested Components?

Suspense is designed for **top-level route components** that need to block the entire page render. Nested components should use `FLoader` instead:

**Suspense (Route Components):**

- Blocks entire page render
- Shows app bootstrapper overlay
- Used for initial page load data
- Component must be async

**FLoader (Nested Components):**

- Shows loading overlay within component bounds
- Doesn't block parent rendering
- Used for component-level data loading
- Component stays synchronous

**Example - Nested Component with FLoader:**

```vue
<!-- widgets/contract-editor/ui/ContractEditorProvider.vue -->
<template>
  <div style="position: relative">
    <FLoader :model-value="isLoading" />

    <!-- Content renders immediately, loader covers it -->
    <slot v-if="!isLoading" />
  </div>
</template>

<script lang="ts" setup>
  // No async/await needed - component renders immediately
  const { data, isLoading } = useMyQuery()
</script>
```

**Why this pattern?**

1. **Progressive rendering** - Parent can render while child loads
2. **Better UX** - User sees page structure immediately, not blank screen
3. **Simpler code** - No need to make nested components async
4. **Automatic suppression** - `FLoader` suppresses itself during bootstrap

## App Context Pattern

UI components can access app-level state via the app context without tight coupling.

### Setup

```typescript
// In App.vue
import { createAppContext, provideAppContext } from '@/shared/ui'

const bootstrapper = useBootstrapperStore()
const appContext = createAppContext(computed(() => bootstrapper.isBootstrapping))
provideAppContext(appContext)
```

### Usage in Components

Components automatically benefit from app context:

- **FLoader** - Suppresses itself during bootstrap
- **FFullScreenDialog** - Skips transition on initial route render

No manual wiring needed - components inject the context automatically:

```typescript
// In FLoader.vue (automatic)
const appContext = useAppContext()
const effectiveLoading = computed(() => {
  if (appContext?.isBootstrapping.value) {
    return false // Suppress during bootstrap
  }
  return props.modelValue
})
```

## Route Transitions

Route transitions are **only enabled on initial bootstrap** for a smooth first impression. Subsequent navigation is instant (no transition) for better performance.

### Implementation

```vue
<!-- App.vue -->
<Transition
  appear
  :name="bootstrapper.isInitialLoad ? 'fade' : ''"
>
  <component :is="Component" :key="routeKey" />
</Transition>
```

**Behavior:**

- **Initial load:** Fade-in transition after bootstrap completes
- **Subsequent navigation:** Instant (no transition)
- **Route key:** Uses first matched route path to prevent unnecessary remounts

## Component Loading States

For component-level loading (after bootstrap), use `FLoader`:

```vue
<template>
  <div style="position: relative">
    <FLoader :model-value="isLoading" />
    <!-- Content stays visible but covered by loader -->
  </div>
</template>
```

`FLoader` automatically suppresses itself during bootstrap, so you don't need conditional logic.

## Best Practices

### ✅ Do

- ✅ Use `await useSuspenseReady()` in route components
- ✅ Always include error in ready condition: `() => !!(data.value || error.value)`
- ✅ Use `FLoader` for nested component loading
- ✅ Let `FLoader` automatically suppress during bootstrap
- ✅ Use `useSuspenseReadyAll` for multiple queries

### ❌ Don't

- ❌ Use Suspense in nested components (use `FLoader` instead)
- ❌ Manually suppress `FLoader` during bootstrap (it's automatic)
- ❌ Await multiple `useSuspenseReady` calls sequentially (use `useSuspenseReadyAll`)
- ❌ Forget to include error in ready condition
- ❌ Make nested components async just for loading states

### Complete Example

```vue
<template>
  <div>
    <h1>{{ contract?.contractNumber }}</h1>
    <!-- Content renders only after data loads -->
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { useSuspenseReady } from '@/shared/lib'
  import { useContract } from '@/entities/contract'

  const route = useRoute()
  const contractId = computed(() => route.params.id as string)

  const { contract, isLoading, error } = useContract(contractId)

  // Wait for data - bootstrapper shows until this resolves
  await useSuspenseReady(isLoading, () => !!(contract.value || error.value))

  // Handle error state
  if (error.value) {
    // Show error UI
  }
</script>
```

## Troubleshooting

### Bootstrapper shows during navigation

**Problem:** Bootstrapper appears on subsequent navigation, not just initial load.

**Solution:** Check that `isInitialLoad` is being set to `false` after first route resolves:

```typescript
function handleSuspenseResolve() {
  if (bootstrapper.loadingRouteData) {
    bootstrapper.setLoadingRouteData(false)
    bootstrapper.setInitialLoadComplete() // ← Make sure this is called
  }
}
```

### Multiple spinners showing

**Problem:** Component-level loaders show alongside bootstrapper.

**Solution:** Ensure components use `FLoader`, which automatically suppresses during bootstrap. Don't create custom loading overlays.

### Suspense never resolves

**Problem:** Route component hangs, Suspense never resolves.

**Solution:** Check that:
1. Ready condition includes error: `() => !!(data.value || error.value)`
2. Component is actually async (uses `await`)
3. Loading state eventually becomes `false`

### Dialog focus issues on initial load

**Problem:** Dialogs opened during initial load have focus highlighting.

**Solution:** `FFullScreenDialog` automatically handles this via app context. For nested dialogs, ensure parent dialog opens first.

