import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import {
    apiSortParams,
    hasListFilters,
    mergeListQuery,
    nextSort,
    parseListQuery,
    sameListQuery,
    type ListQueryOptions,
    type ListQueryState,
    type ListSortOrder,
} from '@/composables/listQuery'

export interface UseListQueryOptions extends ListQueryOptions {
    /** Called with the state whenever the list should be (re)loaded, including once on mount. */
    onChange: (state: ListQueryState) => void | Promise<void>
    /** How long typing waits before it searches. */
    debounceMs?: number
    /** Load on mount (default). `false` leaves the first load to the page, through `start()`. */
    immediate?: boolean
}

/**
 * Search, filters, sort and page of a superadmin list, kept in the route query
 * (see composables/listQuery.ts for the format). Every change goes through
 * `router.replace`, and the list reloads from the route, so a pasted link and
 * back/forward to the list show exactly what was on screen.
 *
 * `searchInput` is what the box shows while typing; it reaches the URL (and the
 * server) after `debounceMs`.
 */
export function useListQuery(options: UseListQueryOptions) {
    const route = useRoute()
    const router = useRouter()
    const path = route.path

    const state = reactive<ListQueryState>(parseListQuery(route.query as any, options))
    const searchInput = ref(state.search)
    let applied: ListQueryState | null = null
    let timer: ReturnType<typeof setTimeout> | null = null

    function apply(next: ListQueryState) {
        state.search = next.search
        state.page = next.page
        state.sort = next.sort
        state.order = next.order
        state.filters = { ...next.filters }
        if (searchInput.value.trim() !== next.search) searchInput.value = next.search
        applied = parseListQuery(route.query as any, options)
        options.onChange(state)
    }

    function push(patch: Partial<ListQueryState>) {
        const next: ListQueryState = {
            search: state.search,
            page: state.page,
            sort: state.sort,
            order: state.order,
            filters: { ...state.filters },
            ...patch,
        }
        if (patch.filters) next.filters = { ...state.filters, ...patch.filters }
        // Nothing changed for this list: still reload, a click on the same tab is a refresh.
        if (applied && sameListQuery(applied, next, options)) {
            options.onChange(state)
            return
        }
        router.replace({ query: mergeListQuery(route.query as any, next, options) as any })
    }

    function flushSearch() {
        if (timer) clearTimeout(timer)
        timer = null
        const search = searchInput.value.trim()
        if (search === state.search) return
        push({ search, page: 1 })
    }

    watch(searchInput, () => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(flushSearch, options.debounceMs ?? 350)
    })

    // The route is the source of truth. Only this page's own keys matter: a
    // `?inquiry=` that opens a detail, or a second list's keys, reload nothing.
    watch(() => route.query, (query) => {
        if (route.path !== path) return
        const next = parseListQuery(query as any, options)
        if (applied && sameListQuery(applied, next, options)) return
        apply(next)
    })

    const start = () => apply(parseListQuery(route.query as any, options))

    onMounted(() => {
        if (options.immediate !== false) start()
    })
    onBeforeUnmount(() => {
        if (timer) clearTimeout(timer)
    })

    return {
        state,
        searchInput,
        flushSearch,
        setFilter: (name: string, value: string) => push({ filters: { [name]: value ?? '' }, page: 1 }),
        setFilters: (filters: Record<string, string>) => push({ filters, page: 1 }),
        setPage: (page: number) => push({ page: Math.max(1, page) }),
        setSort: (sort: string | null, order: ListSortOrder | null) => push({ sort, order, page: 1 }),
        toggleSort: (field: string) => push({ ...nextSort(state, field, options), page: 1 }),
        reset: () => {
            if (timer) clearTimeout(timer)
            searchInput.value = ''
            push({ search: '', page: 1, filters: { ...(options.filters ?? {}) } })
        },
        isFiltered: computed(() => hasListFilters(state, options)),
        apiSort: () => apiSortParams(state),
        reload: () => options.onChange(state),
        start,
    }
}
