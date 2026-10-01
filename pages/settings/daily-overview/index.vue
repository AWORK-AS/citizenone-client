<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('dailyOverviewLayouts.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('dailyOverviewLayouts.title') }}</template>

            <div class="mt-8 max-w-4xl space-y-6">
                <p class="text-sm text-slate-600">{{ $t('dailyOverviewLayouts.intro') }}</p>

                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

                <!-- Which layout is being edited -->
                <div class="card card-body">
                    <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div class="w-full sm:max-w-sm">
                            <FormLabel :label="$t('dailyOverviewLayouts.scope')" />
                            <FormSelect v-model="state.scope" :options="scopeOptions" :canClear="false"
                                :canDeselect="false" :searchable="true" />
                        </div>
                        <span :class="['badge w-fit', state.layout?.exists ? 'badge-green' : 'badge-gray']">
                            {{ scopeStatus }}
                        </span>
                    </div>
                </div>

                <LoadingSpinner :isActive="state.isLoading">
                    <div class="space-y-6">
                        <!-- Lock -->
                        <div class="card card-body">
                            <div class="flex items-start gap-x-3">
                                <FormSwitch :value="state.isLocked" @toggleSwitch="state.isLocked = !state.isLocked" />
                                <div>
                                    <p class="text-sm font-medium text-slate-900">{{ $t('dailyOverviewLayouts.lock') }}</p>
                                    <p class="text-xs text-slate-500">{{ $t('dailyOverviewLayouts.lockHelp') }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Standard boxes -->
                        <div class="card">
                            <div class="card-header">
                                <h3 class="text-sm font-semibold text-slate-900">{{ $t('dailyOverviewLayouts.builtInBoxes') }}</h3>
                            </div>
                            <ul class="divide-y divide-surface-100 px-5">
                                <li v-for="box in DAILY_OVERVIEW_BOXES" :key="box.key"
                                    class="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <span class="text-sm text-slate-800">{{ $t(box.label) }}</span>
                                    <ModulesUserDailyOverviewLayoutStatePicker :modelValue="displayState(box.key)"
                                        :locked="state.isLocked" @update:modelValue="setState(box.key, $event)" />
                                </li>
                            </ul>
                        </div>

                        <!-- Custom boxes -->
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <h3 class="text-sm font-semibold text-slate-900">{{ $t('dailyOverviewLayouts.customBoxes') }}</h3>
                                    <p class="text-xs text-slate-500">{{ $t('dailyOverviewLayouts.customBoxesHelp') }}</p>
                                </div>
                                <FormButton buttonStyle="action" @click="openBox(null)">
                                    <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                    {{ $t('dailyOverviewLayouts.newBox') }}
                                </FormButton>
                            </div>
                            <p v-if="state.customBoxes.length === 0" class="px-5 py-4 text-sm text-slate-500">
                                {{ $t('dailyOverviewLayouts.noCustomBoxes') }}
                            </p>
                            <ul v-else class="divide-y divide-surface-100 px-5">
                                <li v-for="box in state.customBoxes" :key="box.uuid"
                                    class="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div class="min-w-0">
                                        <p class="truncate text-sm font-medium text-slate-800">{{ box.title }}</p>
                                        <p class="text-xs text-slate-500">{{ $t(`dailyOverviewLayouts.sources.${box.source}`) }}</p>
                                    </div>
                                    <div class="flex items-center gap-x-2">
                                        <ModulesUserDailyOverviewLayoutStatePicker :modelValue="displayState(box.key)"
                                            :locked="state.isLocked" @update:modelValue="setState(box.key, $event)" />
                                        <button type="button" class="rounded p-1.5 text-slate-400 hover:bg-surface-100 hover:text-slate-700"
                                            :aria-label="$t('edit')" @click="openBox(box)">
                                            <Icon name="ph:pencil-simple" class="h-4 w-4" />
                                        </button>
                                        <button type="button" class="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                            :aria-label="$t('delete')" @click="confirmDeleteBox(box)">
                                            <Icon name="ph:trash" class="h-4 w-4" />
                                        </button>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div class="flex flex-wrap justify-end gap-3">
                            <FormButton v-if="state.layout?.exists" buttonStyle="cancel"
                                @click="state.modal.isRemoveLayoutOpen = true">
                                {{ $t('dailyOverviewLayouts.removeLayout') }}
                            </FormButton>
                            <FormButton buttonStyle="primary" :disabled="state.isSaving" @click="saveLayout">
                                {{ $t('save') }}
                            </FormButton>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>

            <ModulesUserDailyOverviewLayoutModalCustomBox :isModalOpen="state.modal.isBoxOpen" :box="state.selectedBox"
                @close="state.modal.isBoxOpen = false" @saved="onBoxSaved" />
            <DialogConfirmation :isModalOpen="state.modal.isDeleteBoxOpen"
                :message="$t('dailyOverviewLayouts.deleteBoxConfirmation') + '?'"
                @close="state.modal.isDeleteBoxOpen = false" @confirm="deleteBox" />
            <DialogConfirmation :isModalOpen="state.modal.isRemoveLayoutOpen"
                :message="(state.scope ? $t('dailyOverviewLayouts.removeDepartmentLayoutConfirmation') : $t('dailyOverviewLayouts.removeCompanyLayoutConfirmation')) + '?'"
                @close="state.modal.isRemoveLayoutOpen = false" @confirm="removeLayout" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { DAILY_OVERVIEW_BOXES, useDailyOverviewLayout, type BoxState } from '@/composables/useDailyOverviewLayout'
import { useUserStore } from '@/store/user'
import { usePermissions } from '@/composables/usePermissions'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { isAtLeast, can } = usePermissions()
const { successAlert } = useAlert()
const { t } = useI18n()
const { refreshLayout } = useDailyOverviewLayout()

const breadcrumbLinks = [
    { name: 'dailyOverviewLayouts.title', translate: true, href: '/settings/daily-overview' },
]

// '' is the company default; otherwise a department uuid.
const state = reactive({
    scope: '' as string,
    departments: [] as any[],
    layouts: [] as any[],
    layout: null as any,
    customBoxes: [] as any[],
    isLocked: false,
    states: {} as Record<string, BoxState>,
    selectedBox: null as any,
    error: {} as any,
    isLoading: false,
    isSaving: false,
    modal: {
        isBoxOpen: false,
        isDeleteBoxOpen: false,
        isRemoveLayoutOpen: false,
    },
})

const scopeOptions = computed(() => [
    { value: '', label: t('dailyOverviewLayouts.companyDefault') },
    ...state.departments.map((department: any) => ({ value: department.uuid, label: department.name })),
])

const scopeStatus = computed(() => {
    if (state.layout?.exists) return t('dailyOverviewLayouts.hasOwnLayout')
    if (!state.scope) return t('dailyOverviewLayouts.noLayout')
    return t('dailyOverviewLayouts.usesCompanyDefault')
})

// Only Admins, or roles given manage_daily_overview, reach this page; the API
// refuses everyone else anyway.
watch(() => userStore.getUser, (user: any) => {
    if (user && Object.keys(user).length > 0 && !isAtLeast('Admin') && !can('manage_daily_overview')) {
        navigateTo('/settings/profile')
    }
}, { immediate: true })

onMounted(async () => {
    await fetchDepartments()
    await fetchScope()
})

watch(() => state.scope, fetchScope)

async function fetchDepartments() {
    try {
        const response = await departmentService.getAllDepartments({})
        state.departments = (response?.data ?? []).filter((department: any) => department.uuid !== 'all-departments')
    } catch (error: any) {
        state.error = error
    }
}

async function fetchScope() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await dailyOverviewService.getLayoutScope(state.scope ? { department_uuid: state.scope } : {})
        applyLayout(response?.data)
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function applyLayout(layout: any) {
    state.layout = layout
    state.isLocked = !!layout?.is_locked
    state.customBoxes = layout?.custom_boxes ?? []
    state.states = { ...(layout?.boxes ?? {}) }
    for (const box of state.customBoxes) state.states[box.key] = box.state ?? 'hidden'
}

/** In a locked layout every box is either shown to everyone or hidden. */
function displayState(key: string): BoxState {
    const value = state.states[key] ?? (key.startsWith('custom:') ? 'hidden' : 'optional')
    return state.isLocked && value === 'optional' ? 'mandatory' : value
}

function setState(key: string, value: BoxState) {
    state.states[key] = value
}

async function saveLayout() {
    state.error = {}
    state.isSaving = true
    try {
        const boxes: Record<string, BoxState> = {}
        for (const key of [...DAILY_OVERVIEW_BOXES.map((box) => box.key), ...state.customBoxes.map((box: any) => box.key)]) {
            boxes[key] = displayState(key)
        }
        const response = await dailyOverviewService.saveLayoutScope({
            department_uuid: state.scope || null,
            is_locked: state.isLocked,
            boxes,
        })
        if (response?.data) {
            applyLayout(response.data)
            refreshLayout()
            successAlert(`${t('alert.success')}!`, `${t('dailyOverviewLayouts.saved')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

async function removeLayout() {
    state.modal.isRemoveLayoutOpen = false
    state.error = {}
    try {
        await dailyOverviewService.deleteLayoutScope(state.scope ? { department_uuid: state.scope } : {})
        await fetchScope()
        refreshLayout()
        successAlert(`${t('alert.success')}!`, `${t('dailyOverviewLayouts.layoutRemoved')}.`)
    } catch (error: any) {
        state.error = error
    }
}

function openBox(box: any) {
    state.selectedBox = box
    state.modal.isBoxOpen = true
}

/**
 * A new or edited box. Any unsaved choices on this page are kept; a new box
 * starts hidden here until the admin picks where it shows.
 */
async function onBoxSaved(box: any) {
    state.modal.isBoxOpen = false
    const index = state.customBoxes.findIndex((entry: any) => entry.uuid === box.uuid)
    if (index >= 0) state.customBoxes.splice(index, 1, { ...state.customBoxes[index], ...box })
    else {
        state.customBoxes.push({ ...box, state: 'hidden' })
        state.states[box.key] = 'hidden'
    }
    successAlert(`${t('alert.success')}!`, `${t('dailyOverviewLayouts.boxSaved')}.`)
}

function confirmDeleteBox(box: any) {
    state.selectedBox = box
    state.modal.isDeleteBoxOpen = true
}

async function deleteBox() {
    state.modal.isDeleteBoxOpen = false
    state.error = {}
    try {
        await dailyOverviewService.deleteCustomBox(state.selectedBox.uuid)
        state.customBoxes = state.customBoxes.filter((box: any) => box.uuid !== state.selectedBox.uuid)
        delete state.states[state.selectedBox.key]
        refreshLayout()
        successAlert(`${t('alert.success')}!`, `${t('dailyOverviewLayouts.boxDeleted')}.`)
    } catch (error: any) {
        state.error = error
    }
}
</script>
