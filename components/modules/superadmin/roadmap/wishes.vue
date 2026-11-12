<template>
    <div>
        <!-- Wishes from "Send a wish" in the app. Before this they only reached a mailbox. -->
        <div class="mb-4 flex flex-wrap items-center gap-2">
            <button v-for="status in STATUSES" :key="status" type="button" @click="state.status = status"
                class="flex items-center gap-x-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                :class="state.status === status ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
                {{ $t(`superadmin.roadmap.wishes.status.${status}`) }}
                <span class="opacity-70">{{ state.counts[status] ?? 0 }}</span>
            </button>
            <p class="text-xs text-gray-400 sm:ml-auto">{{ $t('superadmin.roadmap.wishes.intro') }}</p>
        </div>

        <Alert type="danger" :text="state.error" v-if="state.error" />

        <LoadingSpinner :isActive="state.isLoading">
            <div v-if="!state.isLoading && !state.wishes.length"
                class="flex flex-col items-center gap-y-2 py-12 text-center text-sm text-ink-body">
                <Icon name="ph:shooting-star" class="h-8 w-8 text-gray-300" />
                {{ $t('superadmin.roadmap.wishes.empty') }}
            </div>
            <ul class="space-y-3">
                <li v-for="wish in state.wishes" :key="wish.uuid" class="rounded-lg border border-gray-200 bg-white p-4">
                    <div class="flex flex-wrap items-start justify-between gap-3">
                        <div class="min-w-0 flex-1">
                            <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                                <span class="font-mono text-gray-400">{{ wish.reference }}</span>
                                <span class="font-semibold text-gray-900">{{ wish.company?.name ?? '—' }}</span>
                                <span v-if="wish.user">{{ wish.user.name }}</span>
                                <span>{{ formatDate(wish.created_at) }}</span>
                                <span v-if="wish.roadmap_item" class="co-badge co-badge-blue">
                                    #{{ wish.roadmap_item.number }} {{ wish.roadmap_item.title }}
                                </span>
                            </div>
                            <p class="mt-2 whitespace-pre-line text-sm text-gray-800">{{ wish.message }}</p>
                            <div v-if="wish.images?.length" class="mt-2 flex flex-wrap gap-2">
                                <a v-for="image in wish.images" :key="image.uuid" :href="image.url" target="_blank" rel="noopener">
                                    <img :src="image.url" :alt="image.file_name" class="h-16 w-24 rounded border border-gray-200 object-cover" />
                                </a>
                            </div>
                        </div>
                        <div class="flex flex-none flex-wrap items-center gap-2">
                            <FormButton buttonStyle="secondary" buttonSize="sm" @click="emit('copy', wishBrief(wish))">
                                <Icon name="ph:copy" class="h-4 w-4" /> {{ $t('superadmin.roadmap.copyBrief') }}
                            </FormButton>
                            <template v-if="canManage">
                                <FormButton v-if="wish.status !== 'on_roadmap'" buttonStyle="primary" buttonSize="sm" @click="openLink(wish)">
                                    <Icon name="ph:map-trifold" class="h-4 w-4" /> {{ $t('superadmin.roadmap.wishes.toRoadmap') }}
                                </FormButton>
                                <FormButton v-if="wish.status === 'new'" buttonStyle="cancel" buttonSize="sm" @click="setStatus(wish, 'declined')">
                                    {{ $t('superadmin.roadmap.wishes.decline') }}
                                </FormButton>
                                <FormButton v-else buttonStyle="cancel" buttonSize="sm" @click="setStatus(wish, 'new')">
                                    {{ $t('superadmin.roadmap.wishes.reopen') }}
                                </FormButton>
                            </template>
                        </div>
                    </div>
                </li>
            </ul>
        </LoadingSpinner>

        <Modal size="md" :title="$t('superadmin.roadmap.wishes.toRoadmap')" :show="!!state.linking" @close="state.linking = null">
            <template #modal-body>
                <div v-if="state.linking" class="space-y-4 pb-6 text-left text-sm">
                    <p class="whitespace-pre-line rounded-md bg-gray-50 p-3 text-gray-700">{{ state.linking.message }}</p>

                    <div class="flex gap-4">
                        <label class="inline-flex items-center gap-1.5">
                            <input v-model="state.mode" type="radio" value="new" /> {{ $t('superadmin.roadmap.wishes.newItem') }}
                        </label>
                        <label class="inline-flex items-center gap-1.5">
                            <input v-model="state.mode" type="radio" value="existing" /> {{ $t('superadmin.roadmap.wishes.existingItem') }}
                        </label>
                    </div>

                    <div v-if="state.mode === 'new'" class="space-y-1">
                        <label class="block font-medium text-gray-800" for="wish-roadmap-title">{{ $t('superadmin.roadmap.wishes.itemTitle') }}</label>
                        <input id="wish-roadmap-title" v-model="state.title" type="text" maxlength="255"
                            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none" />
                        <p class="text-xs text-gray-500">{{ $t('superadmin.roadmap.wishes.newItemHint') }}</p>
                    </div>
                    <div v-else class="space-y-1">
                        <input v-model="state.itemSearch" type="search" :placeholder="$t('superadmin.roadmap.filters.search')"
                            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none" />
                        <select v-model="state.itemUuid" size="8" class="w-full rounded-md border border-gray-300 px-2 py-1">
                            <option v-for="item in pickableItems" :key="item.uuid" :value="item.uuid">
                                #{{ item.number }} {{ item.title }}
                            </option>
                        </select>
                    </div>

                    <Alert type="danger" :text="state.linkError" v-if="state.linkError" />

                    <div class="flex justify-end gap-x-2">
                        <FormButton buttonStyle="cancel" @click="state.linking = null">{{ $t('cancel') }}</FormButton>
                        <FormButton buttonStyle="primary" :disabled="!canSubmit || state.busy" @click="submitLink">
                            {{ $t('superadmin.roadmap.wishes.toRoadmap') }}
                        </FormButton>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { roadmapItemService } from '@/components/api/superadmin/RoadmapItemService'
import { wishBrief } from '@/utils/roadmapBrief'

const props = defineProps<{ items: any[]; canManage: boolean }>()
const emit = defineEmits<{ counts: [Record<string, number>]; changed: []; copy: [string] }>()

const STATUSES = ['new', 'on_roadmap', 'declined']

const state = reactive({
    status: 'new',
    isLoading: false,
    error: '',
    wishes: [] as any[],
    counts: {} as Record<string, number>,
    linking: null as any,
    mode: 'new' as 'new' | 'existing',
    title: '',
    itemUuid: '',
    itemSearch: '',
    linkError: '',
    busy: false,
})

// Released items last: a wish usually belongs to something still to be built.
const pickableItems = computed(() => {
    const needle = state.itemSearch.trim().toLowerCase()
    const order: Record<string, number> = { in_progress: 0, planned: 1, released: 2 }
    return props.items
        .filter((item: any) => !needle || `#${item.number} ${item.title}`.toLowerCase().includes(needle))
        .sort((a: any, b: any) => (order[a.status] ?? 3) - (order[b.status] ?? 3) || (a.number ?? 0) - (b.number ?? 0))
})

const canSubmit = computed(() => state.mode === 'new' ? state.title.trim().length > 0 : !!state.itemUuid)

watch(() => state.status, () => fetchWishes(), { immediate: true })

async function fetchWishes() {
    state.isLoading = true
    state.error = ''
    try {
        const response = await roadmapItemService.getWishes(state.status)
        state.wishes = response?.data ?? []
        state.counts = response?.counts ?? {}
        emit('counts', state.counts)
    } catch (error: any) {
        state.error = error?.message ?? 'Error'
    }
    state.isLoading = false
}

function openLink(wish: any) {
    state.linking = wish
    state.mode = 'new'
    // First line of the wish, as a start for the title.
    state.title = (wish.message ?? '').split('\n')[0].slice(0, 120)
    state.itemUuid = ''
    state.itemSearch = ''
    state.linkError = ''
}

async function submitLink() {
    state.busy = true
    state.linkError = ''
    try {
        await roadmapItemService.wishToRoadmap(state.linking.uuid, state.mode === 'new'
            ? { title: state.title.trim() }
            : { roadmap_item_uuid: state.itemUuid })
        state.linking = null
        emit('changed')
        await fetchWishes()
    } catch (error: any) {
        state.linkError = error?.message ?? 'Error'
    }
    state.busy = false
}

async function setStatus(wish: any, status: 'new' | 'declined') {
    state.error = ''
    try {
        await roadmapItemService.updateWishStatus(wish.uuid, status)
        await fetchWishes()
    } catch (error: any) {
        state.error = error?.message ?? 'Error'
    }
}

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
