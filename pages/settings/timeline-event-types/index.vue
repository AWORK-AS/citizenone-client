<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('timelineEventTypes.timelineEventTypes') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('timelineEventTypes.timelineEventTypes') }}</template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8 space-y-8">
                <p class="text-sm text-gray-500">{{ $t('timelineEventTypes.description') }}</p>

                <!-- Types -->
                <div>
                    <div class="flex justify-end items-center mb-5">
                        <FormButton buttonStyle="action" @click="openCreate">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('timelineEventTypes.addNew') }}
                        </FormButton>
                    </div>
                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="bg-white ring-1 ring-gray-200 rounded-xl">
                        <div v-if="!state.isLoading && state.types.length === 0"
                            class="py-16 text-center text-gray-400">
                            {{ $t('timelineEventTypes.noTypes') }}
                        </div>
                        <div v-for="(type, index) in state.types" :key="type.uuid"
                            :class="index > 0 ? 'border-t border-gray-100' : ''">
                            <div class="flex items-center gap-3 px-5 py-3.5">
                                <span class="w-3.5 h-3.5 rounded-full flex-shrink-0 ring-1 ring-black/5"
                                    :style="{ backgroundColor: type.color || '#94a3b8' }" />
                                <span class="grow text-sm font-medium text-gray-800">{{ type.name }}</span>
                                <FormButton buttonStyle="action" buttonSize="sm" @click="confirmDelete(type)">
                                    <Icon name="ph:trash" class="h-4 w-4" aria-hidden="true" />
                                </FormButton>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Statistics -->
                <div>
                    <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ $t('timelineEventTypes.statistics') }}</h3>
                    <div class="bg-white ring-1 ring-gray-200 rounded-xl">
                        <div v-if="state.stats.length === 0" class="py-10 text-center text-xs text-gray-400">
                            {{ $t('timelineEventTypes.noStatistics') }}
                        </div>
                        <div v-for="(row, index) in state.stats" :key="row.uuid"
                            :class="['flex items-center gap-3 px-5 py-3', index > 0 ? 'border-t border-gray-100' : '']">
                            <span class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: row.color || '#94a3b8' }" />
                            <span class="grow text-sm text-gray-700">{{ row.name }}</span>
                            <span class="text-sm font-semibold text-gray-900 tabular-nums">{{ row.count }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <Modal size="sm" :title="$t('timelineEventTypes.addNew')" :show="state.modal.isFormOpen" @close="closeForm">
                <template #modal-body>
                    <div class="space-y-4">
                        <div class="space-y-1">
                            <FormLabel for="name" :label="$t('timelineEventTypes.form.name')" />
                            <FormTextField id="name" name="name" :placeholder="$t('timelineEventTypes.form.namePlaceholder')"
                                v-model="state.form.name" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="color" :label="$t('timelineEventTypes.form.color')" />
                            <input id="color" type="color" v-model="state.form.color"
                                class="h-10 w-16 rounded-md border border-gray-200 cursor-pointer" />
                        </div>
                        <div class="flex justify-end gap-3 pt-2">
                            <FormButton buttonStyle="secondary" @click="closeForm">{{ $t('cancel') }}</FormButton>
                            <FormButton buttonStyle="primary" :disabled="state.isSaving || !state.form.name.trim()"
                                @click="save">{{ $t('save') }}</FormButton>
                        </div>
                    </div>
                </template>
            </Modal>

            <Modal size="sm" :title="$t('timelineEventTypes.deleteTitle')" :show="state.modal.isDeleteOpen"
                @close="state.modal.isDeleteOpen = false">
                <template #modal-body>
                    <p class="text-sm text-gray-600">{{ $t('timelineEventTypes.deleteConfirm') }}</p>
                    <div class="flex justify-end gap-3 pt-5">
                        <FormButton buttonStyle="secondary" @click="state.modal.isDeleteOpen = false">
                            {{ $t('cancel') }}
                        </FormButton>
                        <FormButton buttonStyle="danger" :disabled="state.isSaving" @click="doDelete">
                            {{ $t('timelineEventTypes.deleteAction') }}
                        </FormButton>
                    </div>
                </template>
            </Modal>

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { timelineService } from '@/components/api/user/TimelineService'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const { successAlert, errorAlert } = useAlert()

const breadcrumbLinks = [
    { name: 'settings.tabs.profile', translate: true, href: '/settings/profile' },
    { name: 'timelineEventTypes.timelineEventTypes', translate: true, href: '/settings/timeline-event-types' },
]

const state = reactive({
    error: {} as Error,
    isLoading: false,
    isSaving: false,
    types: [] as any[],
    stats: [] as any[],
    form: { name: '', color: '#368F8B' },
    modal: { isFormOpen: false, isDeleteOpen: false },
    deleteTarget: null as any,
})

async function fetchTypes() {
    state.isLoading = true
    try {
        const response = await timelineService.getEventTypes()
        state.types = Array.isArray(response) ? response : (response?.data ?? [])
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function fetchStats() {
    try {
        const response = await timelineService.getStatistics()
        state.stats = Array.isArray(response) ? response : (response?.data ?? [])
    } catch (error: any) {
        state.error = error
    }
}

function openCreate() {
    state.form = { name: '', color: '#368F8B' }
    state.modal.isFormOpen = true
}

function closeForm() {
    state.modal.isFormOpen = false
}

async function save() {
    if (!state.form.name.trim()) return
    state.isSaving = true
    try {
        await timelineService.createEventType(state.form)
        state.modal.isFormOpen = false
        await Promise.all([fetchTypes(), fetchStats()])
        successAlert(`${t('alert.success')}!`, `${t('timelineEventTypes.saved')}.`)
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('timelineEventTypes.saveFailed'))
    }
    state.isSaving = false
}

function confirmDelete(type: any) {
    state.deleteTarget = type
    state.modal.isDeleteOpen = true
}

async function doDelete() {
    if (!state.deleteTarget) return
    state.isSaving = true
    try {
        await timelineService.deleteEventType(state.deleteTarget.uuid)
        state.modal.isDeleteOpen = false
        await Promise.all([fetchTypes(), fetchStats()])
        successAlert(`${t('alert.success')}!`, `${t('timelineEventTypes.deleted')}.`)
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('timelineEventTypes.saveFailed'))
    }
    state.isSaving = false
}

onMounted(() => {
    fetchTypes()
    fetchStats()
})
</script>
