<template>
  <v-app>
    <AppBootstrapper />
    <div class="route-view-wrapper">
      <RouterView v-slot="{ Component }">
        <Suspense
          v-if="Component"
          @pending="handleSuspensePending"
          @resolve="handleSuspenseResolve"
        >
          <!-- appear: transition only on initial render after bootstrap -->
          <!-- No transition on subsequent route navigation -->
          <Transition
            appear
            :name="bootstrapper.isInitialLoad ? 'fade' : ''"
          >
            <component
              :is="Component"
              :key="routeKey"
            />
          </Transition>
          <template #fallback>
            <div />
          </template>
        </Suspense>
      </RouterView>
    </div>
    <ToastProvider />
  </v-app>
</template>

<script lang="ts" setup>
  import { computed, onErrorCaptured } from 'vue'
  import { RouterView, useRoute } from 'vue-router'
  import AppBootstrapper from '@/app/AppBootstrapper.vue'
  import { useBootstrapperStore } from '@/shared/lib'
  import { createAppContext, provideAppContext, ToastProvider, useToast } from '@/shared/ui'

  // Create and provide app context to UI components (FLoader, FFullScreenDialog, etc.)
  // Pass the store's computed directly - it's already a ComputedRef from Pinia
  const bootstrapper = useBootstrapperStore()
  const appContext = createAppContext(computed(() => bootstrapper.isBootstrapping))
  provideAppContext(appContext)

  const toast = useToast()
  const $route = useRoute()

  // Use the first matched route's path as key to avoid remounting parent components
  // when only nested child routes change (e.g. opening a dialog)
  const routeKey = computed(() => $route.matched[0]?.path || $route.path)

  function handleSuspenseResolve() {
    if (bootstrapper.loadingRouteData) {
      bootstrapper.setLoadingRouteData(false)
      bootstrapper.setInitialLoadComplete()
      appContext.markFirstRouteComplete()
    }
  }

  function handleSuspensePending() {
    const pastBootstrap = !bootstrapper.loadingEndpoints && !bootstrapper.initializingAuth
    if (pastBootstrap && !bootstrapper.loadingRouteData) {
      bootstrapper.setLoadingRouteData(true)
    }
  }

  // Global error handling for async component errors
  onErrorCaptured((error, _instance, info) => {
    console.error('[App] Async error captured:', error, info)
    toast.error('An error occurred while loading. Please try again.')
    return false
  })
</script>

<style>
  .route-view-wrapper {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  /* Simple fade transition */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
