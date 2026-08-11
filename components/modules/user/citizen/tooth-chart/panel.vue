<template>
    <div class="px-4 py-5 sm:p-6 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg space-y-5">
        <div v-if="!props.tooth" class="text-center py-10">
            <div class="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="ph:tooth" class="h-6 w-6 text-primary" />
            </div>
            <h3 class="mt-3 text-base font-semibold text-gray-900">{{ $t('citizens.toothChart.panel.emptyTitle') }}</h3>
            <p class="mt-1 text-sm text-gray-500">{{ $t('citizens.toothChart.panel.emptyText') }}</p>
        </div>

        <template v-else>
            <div class="flex items-start justify-between gap-3">
                <div>
                    <h3 class="text-base font-semibold text-gray-900">
                        {{ $t('citizens.toothChart.tooth') }} {{ props.tooth.fdi_number }}
                        <span class="text-sm font-normal text-gray-500">
                            ({{ $t('citizens.toothChart.universalShort') }} {{ props.tooth.number }})
                        </span>
                    </h3>
                    <p class="text-sm text-gray-500">{{ toothName }}</p>
                </div>
                <FormButton buttonStyle="action" buttonSize="xs" @click="emit('close')">
                    <Icon name="ph:x" class="size-4" />
                </FormButton>
            </div>

            <Alert type="danger" :text="state.error" v-if="state.error" />

            <div class="space-y-3">
                <div v-for="row in state.rows" :key="row.surface"
                    class="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div class="sm:col-span-3">
                        <FormLabel :for="`status-${row.surface}`"
                            :label="$t(`citizens.toothChart.surfaces.${row.surface}`)" />
                    </div>
                    <div class="sm:col-span-4">
                        <FormSelect :id="`status-${row.surface}`" :options="statusOptions" v-model="row.status"
                            :placeholder="$t('citizens.toothChart.panel.noStatus')" />
                    </div>
                    <div class="sm:col-span-2">
                        <FormDateField :id="`treated-${row.surface}`" :name="`treated-${row.surface}`"
                            :placeholder="$t('citizens.toothChart.panel.treatedAt')" v-model="row.treated_at"
                            v-if="row.status" />
                    </div>
                    <div class="sm:col-span-3">
                        <FormTextField :id="`note-${row.surface}`" :name="`note-${row.surface}`" v-model="row.note"
                            :placeholder="$t('citizens.toothChart.panel.notePlaceholder')" v-if="row.status" />
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-end gap-2">
                <FormButton buttonStyle="action" @click="reset" :disabled="state.isSaving">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton buttonStyle="primary" @click="save" :disabled="state.isSaving">
                    <Icon name="ph:floppy-disk" class="size-4" />
                    {{ $t('save') }}
                </FormButton>
            </div>

            <div class="border-t border-gray-200 pt-4 space-y-3">
                <h4 class="text-sm font-semibold text-gray-900">{{ $t('citizens.toothChart.panel.history') }}</h4>

                <LoadingSpinner :isActive="state.isHistoryLoading">
                    <p class="text-sm text-gray-500" v-if="state.journals.length === 0">
                        {{ $t('citizens.toothChart.panel.noHistory') }}
                    </p>

                    <ul class="space-y-3" v-else>
                        <li v-for="journal in state.journals" :key="journal.uuid"
                            class="rounded-md border border-gray-200 p-3">
                            <div class="flex items-center justify-between gap-2">
                                <p class="text-sm font-medium text-gray-900">{{ journal.title }}</p>
                                <span class="text-xs text-gray-500">{{ formatDate(journal.date) }}</span>
                            </div>
                            <p class="text-xs text-gray-500" v-if="journal.author">{{ journal.author }}</p>
                            <div class="mt-2 text-sm text-gray-700 line-clamp-4" v-html="journal.content" />
                        </li>
                    </ul>
                </LoadingSpinner>

                <FormButton buttonStyle="action" buttonSize="xs"
                    @click="navigateTo(`/citizens/${props.citizenUuid}/journals`)">
                    <Icon name="ph:notebook" class="size-4" />
                    {{ $t('citizens.toothChart.panel.openJournals') }}
                </FormButton>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { toothChartService } from '@/components/api/user/ToothChartService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
    citizenUuid: string
    tooth: any | null
    statuses: any[]
    statusOptions: string[]
    surfaceOptions: string[]
    selectedSurface?: string | null
}>()

const emit = defineEmits<{ (event: 'saved'): void; (event: 'close'): void }>()

const { t, locale } = useI18n()
const { successAlert } = useAlert()

const state = reactive({
    rows: [] as any[],
    journals: [] as any[],
    isHistoryLoading: false,
    isSaving: false,
    error: '',
})

const statusOptions = computed(() => (props.statusOptions || []).map((status: string) => ({
    value: status,
    label: t(`citizens.toothChart.statuses.${status}`),
})))

const toothName = computed(() => (locale.value === 'en' ? props.tooth?.en_name : props.tooth?.dk_name) || '')

function buildRows() {
    const recorded: Record<string, any> = {}

    for (const status of props.statuses || []) {
        recorded[status.surface] = status
    }

    state.rows = (props.surfaceOptions || []).map((surface: string) => ({
        surface,
        status: recorded[surface]?.status || null,
        note: recorded[surface]?.note || '',
        treated_at: recorded[surface]?.treated_at || '',
    }))
}

function reset() {
    buildRows()
}

async function loadHistory() {
    if (!props.tooth) return

    state.isHistoryLoading = true
    state.error = ''

    try {
        const response = await toothChartService.getToothHistory(props.citizenUuid, props.tooth.uuid)
        state.journals = response?.data?.journals || []
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isHistoryLoading = false
    }
}

async function save() {
    if (!props.tooth) return

    state.isSaving = true
    state.error = ''

    try {
        await toothChartService.updateTooth(props.citizenUuid, props.tooth.uuid, {
            statuses: state.rows
                .filter((row: any) => row.status)
                .map((row: any) => ({
                    surface: row.surface,
                    status: row.status,
                    note: row.note || null,
                    treated_at: row.treated_at || null,
                })),
        })

        successAlert(`${t('alert.success')}!`, `${t('citizens.toothChart.panel.saved')}.`)
        emit('saved')
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isSaving = false
    }
}

function formatDate(date: string): string {
    return date ? moment(date).format('DD.MM.YYYY') : ''
}

watch(() => props.tooth?.uuid, () => {
    buildRows()
    loadHistory()
}, { immediate: true })

watch(() => props.statuses, () => buildRows(), { deep: true })
</script>
