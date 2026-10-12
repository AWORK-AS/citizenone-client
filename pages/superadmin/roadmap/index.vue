<template>
    <div>
        <NuxtLayout name="superadmin">
            <Head>
                <Title>{{ $t('superadmin.roadmap.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.roadmap.title') }}</template>

            <div class="p-1">
                <div class="mb-5 flex items-start justify-between gap-x-4">
                    <div>
                        <h1 class="text-[22px] font-semibold text-[#1F2533]">{{ $t('superadmin.roadmap.title') }}</h1>
                        <p class="text-sm text-[#6B7280]">{{ $t('superadmin.roadmap.intro') }}</p>
                    </div>
                    <FormButton v-if="canManage" buttonStyle="primary" @click="openForm()">
                        <Icon name="ph:plus" class="h-4 w-4" /> {{ $t('superadmin.roadmap.newItem') }}
                    </FormButton>
                </div>

                <div class="mb-4 flex flex-wrap gap-2">
                    <button v-for="status in statuses" :key="status" type="button" @click="state.activeStatus = status"
                        class="flex items-center gap-x-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                        :class="state.activeStatus === status ? 'bg-tertiary/10 text-tertiary' : 'text-gray-500 hover:bg-gray-100'">
                        {{ $t(`comingFunctions.status.${status}`) }}
                        <span class="rounded-full bg-white/70 px-1.5 text-[11px]">{{ itemsFor(status).length }}</span>
                    </button>
                </div>

                <Alert type="danger" :text="state.error" v-if="state.error" />

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="!state.isLoading && !visibleItems.length"
                        class="flex flex-col items-center gap-y-2 py-12 text-center text-sm text-[#6B7280]">
                        <Icon name="ph:map-trifold" class="h-8 w-8 text-gray-300" />
                        {{ $t('superadmin.roadmap.noItems') }}
                    </div>
                    <p v-else-if="canManage && visibleItems.length > 1" class="mb-2 text-xs text-gray-400">
                        {{ $t('superadmin.roadmap.dragHint') }}
                    </p>
                    <ul class="space-y-3">
                        <li v-for="(item, index) in visibleItems" :key="item.uuid"
                            :draggable="canManage" @dragstart="onDragStart(index)" @dragover.prevent="onDragOver(index)"
                            @drop.prevent="onDrop" @dragend="onDrop"
                            class="flex items-start justify-between gap-x-4 rounded-lg border bg-white p-4 transition-colors"
                            :class="state.dragIndex === index ? 'border-primary bg-primary/5' : 'border-gray-200'">
                            <div class="flex min-w-0 items-start gap-x-3">
                                <Icon v-if="canManage" name="ph:dots-six-vertical" class="mt-0.5 h-5 w-5 flex-none cursor-grab text-gray-300" />
                                <div class="min-w-0">
                                    <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                                        <span class="font-semibold text-gray-900">{{ item.title }}</span>
                                        <span class="co-badge" :class="item.is_published ? 'co-badge-green' : 'co-badge-gray'">
                                            {{ item.is_published ? $t('superadmin.roadmap.published') : $t('superadmin.roadmap.draft') }}
                                        </span>
                                        <span v-if="item.expected_period" class="co-badge co-badge-blue">{{ item.expected_period }}</span>
                                        <span v-for="industry in item.industries" :key="industry.uuid" class="co-badge co-badge-navy">
                                            {{ industryName(industry) }}
                                        </span>
                                    </div>
                                    <div v-if="item.description" class="content mt-1 line-clamp-2 text-sm text-gray-600"
                                        v-safe-html="item.description"></div>
                                    <p class="mt-1 text-xs text-gray-400">
                                        {{ item.industries?.length ? $t('superadmin.roadmap.visibleToIndustries') : $t('superadmin.roadmap.visibleToEveryone') }}
                                        <template v-if="item.released_at"> · {{ $t('superadmin.roadmap.releasedOn', { date: formatDate(item.released_at) }) }}</template>
                                    </p>
                                </div>
                            </div>
                            <div v-if="canManage" class="flex flex-none items-center gap-x-2">
                                <FormButton buttonStyle="cancel" buttonSize="sm" @click="togglePublished(item)">
                                    {{ item.is_published ? $t('superadmin.roadmap.unpublish') : $t('superadmin.roadmap.publish') }}
                                </FormButton>
                                <FormButton buttonStyle="action" buttonSize="sm" @click="openForm(item)">
                                    <Icon name="ph:pencil-simple" class="h-4 w-4" />
                                </FormButton>
                                <FormButton buttonStyle="danger" buttonSize="sm" @click="confirmDelete(item)">
                                    <Icon name="ph:trash" class="h-4 w-4" />
                                </FormButton>
                            </div>
                        </li>
                    </ul>
                </LoadingSpinner>
            </div>

            <Modal size="md" :title="state.selectedItem ? $t('superadmin.roadmap.editItem') : $t('superadmin.roadmap.newItem')"
                :show="state.showForm" @close="closeForm">
                <template #modal-body>
                    <ModulesSuperadminRoadmapForm v-if="state.showForm" :selectedItem="state.selectedItem"
                        :industries="state.industries" :error="state.formError" @close="closeForm" @submitForm="saveItem" />
                </template>
            </Modal>

            <DialogConfirmation :isModalOpen="state.deleteOpen" :message="$t('superadmin.roadmap.deleteConfirm')"
                @close="state.deleteOpen = false" @confirm="doDelete" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { roadmapItemService } from '@/components/api/superadmin/RoadmapItemService'
import { industryService } from '@/components/api/superadmin/IndustryService'
import { useAlert } from '@/composables/alert'
import { usePermissions } from '@/composables/usePermissions'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { can } = usePermissions()
const { t, locale } = useI18n()

const canManage = computed(() => can('manage_content'))

// Same order the users' page shows them in.
const statuses = ['in_progress', 'planned', 'released']

const state = reactive({
    isLoading: false,
    error: '',
    items: [] as any[],
    industries: [] as any[],
    activeStatus: 'in_progress',
    showForm: false,
    selectedItem: null as any,
    formError: {} as any,
    deleteOpen: false,
    deleteTarget: null as any,
    dragIndex: null as number | null,
    dragFrom: null as number | null,
})

const visibleItems = computed(() => itemsFor(state.activeStatus))

function itemsFor(status: string) {
    return state.items.filter((item: any) => item.status === status)
}

onMounted(() => {
    fetchItems()
    fetchIndustries()
})

async function fetchItems() {
    state.isLoading = true
    state.error = ''
    try {
        const response = await roadmapItemService.getRoadmapItems()
        state.items = response?.data ?? []
    } catch (error: any) {
        state.error = error?.message ?? 'Error'
    }
    state.isLoading = false
}

async function fetchIndustries() {
    try {
        const response = await industryService.getAllIndustries()
        state.industries = response?.data ?? response ?? []
    } catch {
        // The form still works without industries: the item is then shown to everyone.
    }
}

function industryName(industry: any): string {
    return (locale.value === 'dk' ? industry.dk_name : industry.en_name) || industry.en_name || industry.dk_name
}

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: 'numeric' })
}

function openForm(item: any = null) {
    state.selectedItem = item
    state.formError = {}
    state.showForm = true
}

function closeForm() {
    state.showForm = false
    state.selectedItem = null
}

async function saveItem(form: any) {
    state.formError = {}
    try {
        if (state.selectedItem) {
            await roadmapItemService.updateRoadmapItem(state.selectedItem.uuid, form)
        } else {
            await roadmapItemService.saveRoadmapItem(form)
        }
        state.activeStatus = form.status
        closeForm()
        successAlert(`${t('alert.success')}!`, '')
        fetchItems()
    } catch (error: any) {
        state.formError = error
    }
}

async function togglePublished(item: any) {
    state.error = ''
    try {
        await roadmapItemService.updateRoadmapItem(item.uuid, {
            title: item.title,
            description: item.description,
            status: item.status,
            expected_period: item.expected_period,
            is_published: !item.is_published,
            industry_uuids: (item.industries ?? []).map((industry: any) => industry.uuid),
        })
        fetchItems()
    } catch (error: any) {
        state.error = error?.message ?? 'Error'
    }
}

function confirmDelete(item: any) {
    state.deleteTarget = item
    state.deleteOpen = true
}

async function doDelete() {
    state.deleteOpen = false
    try {
        await roadmapItemService.deleteRoadmapItem(state.deleteTarget.uuid)
        fetchItems()
    } catch (error: any) {
        state.error = error?.message ?? 'Error'
    }
}

// Native drag and drop, as elsewhere in the panel: the item moves live while dragged,
// and the new order is saved once when it's dropped.
function onDragStart(index: number) {
    state.dragFrom = index
    state.dragIndex = index
}

function onDragOver(index: number) {
    if (state.dragIndex === null || state.dragIndex === index) return

    const column = [...visibleItems.value]
    const [moved] = column.splice(state.dragIndex, 1)
    column.splice(index, 0, moved)

    const others = state.items.filter((item: any) => item.status !== state.activeStatus)
    state.items = [...others, ...column]
    state.dragIndex = index
}

async function onDrop() {
    if (state.dragIndex === null) return
    const changed = state.dragIndex !== state.dragFrom
    state.dragIndex = null
    state.dragFrom = null
    if (!changed) return

    try {
        await roadmapItemService.reorderRoadmapItems(
            visibleItems.value.map((item: any, index: number) => ({ uuid: item.uuid, sort_order: index + 1 }))
        )
    } catch (error: any) {
        state.error = error?.message ?? 'Error'
        fetchItems()
    }
}
</script>
