import { useQueryClient, type FetchQueryOptions } from '@tanstack/vue-query'
import { ref, type Ref } from 'vue'

/**
 * Edit dialog state managed by useListController
 */
export interface EditDialogState {
  /** Whether the edit dialog is visible */
  visible: Ref<boolean>
  /** ID of the item being edited, null for new items */
  itemId: Ref<string | null>
  /** Whether prefetch is in progress */
  isBusy: Ref<boolean>
}

/**
 * Additional options for the prefetch query (excludes queryKey and queryFn which are set automatically)
 */
export type PrefetchQueryOptions = Omit<FetchQueryOptions, 'queryKey' | 'queryFn'>

/**
 * Options for useListController
 */
export interface UseListControllerOptions<TItem, TListReturn> {
  /** Composable function that provides list data */
  useList: () => TListReturn
  /** Fetch function to get item by ID (enables prefetch) */
  getItem?: (id: string) => Promise<unknown>
  /** Query key for caching (required if getItem is provided) */
  queryKey?: (id: string) => unknown[]
  /** Additional options for the prefetch query (staleTime, retry, etc.) */
  queryOptions?: PrefetchQueryOptions
  /** Get ID from list item (defaults to item.id) */
  getId?: (item: TItem) => string
  /** Callback when edit dialog opens */
  onOpen?: (id: string | null) => void
  /** Callback when edit dialog closes */
  onClose?: () => void
}

/**
 * Return type for useListController
 */
export interface UseListControllerReturn<TListReturn> {
  /** All properties from the list composable */
  list: TListReturn
  /** Edit dialog state */
  editDialog: EditDialogState
  /** Open dialog to create new item */
  showAdd: () => void
  /** Open dialog to edit existing item (with prefetch if configured) */
  showEdit: (item: unknown) => Promise<void>
  /** Close the edit dialog */
  closeEdit: () => void
}

/**
 * useListController - Standardized list-to-edit workflow
 *
 * Combines a list composable with edit dialog state management,
 * providing a consistent pattern for list pages with edit dialogs.
 *
 * Prefetch is automatic when you provide `getItem` and `queryKey`.
 *
 * @example
 * ```ts
 * // Basic usage - just pass fetch function and query key
 * const { list, editDialog, showAdd, showEdit } = useListController({
 *   useList: useContracts,
 *   getItem: contractApi.get,
 *   queryKey: (id) => ['contract', id],
 * })
 *
 * // With query options for more control
 * const { list, editDialog, showAdd, showEdit } = useListController({
 *   useList: useContracts,
 *   getItem: contractApi.get,
 *   queryKey: (id) => ['contract', id],
 *   queryOptions: { staleTime: 60_000, retry: 2 },
 * })
 *
 * // In template:
 * <FListCard
 *   :items="list.filteredContracts.value"
 *   :busy="editDialog.isBusy.value"
 *   @click:row="(e, { item }) => showEdit(item)"
 * />
 * <ContractDialog
 *   v-model="editDialog.visible.value"
 *   :contract-id="editDialog.itemId.value"
 * />
 * ```
 */
export function useListController<TItem extends { id: string }, TListReturn extends object>(
  options: UseListControllerOptions<TItem, TListReturn>,
): UseListControllerReturn<TListReturn> {
  const {
    useList,
    getItem,
    queryKey,
    queryOptions,
    getId = (item: TItem) => item.id,
    onOpen,
    onClose,
  } = options

  // Get query client for prefetching (only used if getItem is provided)
  const queryClient = getItem ? useQueryClient() : null

  // Initialize list composable
  const list = useList()

  // Edit dialog state
  const visible = ref(false)
  const itemId = ref<string | null>(null)
  const isBusy = ref(false)

  const editDialog: EditDialogState = {
    visible,
    itemId,
    isBusy,
  }

  /**
   * Open dialog to create a new item
   */
  function showAdd(): void {
    itemId.value = null
    visible.value = true
    onOpen?.(null)
  }

  /**
   * Open dialog to edit an existing item
   * Automatically prefetches if getItem and queryKey are configured
   */
  async function showEdit(item: unknown): Promise<void> {
    const typedItem = item as TItem
    const id = getId(typedItem)

    // Prefetch if configured
    if (queryClient && getItem && queryKey) {
      try {
        isBusy.value = true
        await queryClient.fetchQuery({
          ...queryOptions,
          queryKey: queryKey(id),
          queryFn: () => getItem(id),
        })
      } catch {
        // Prefetch failed, but we can still open the dialog
        // The dialog component will handle loading/error states
      } finally {
        isBusy.value = false
      }
    }

    itemId.value = id
    visible.value = true
    onOpen?.(id)
  }

  /**
   * Close the edit dialog
   */
  function closeEdit(): void {
    visible.value = false
    itemId.value = null
    onClose?.()
  }

  return {
    list,
    editDialog,
    showAdd,
    showEdit,
    closeEdit,
  }
}
