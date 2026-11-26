<template>
    <!-- Roadmap #396: use of force or incidents as Excel/CSV, for one citizen or every citizen you can see. -->
    <Modal size="sm" :title="title" :show="props.isModalOpen" @close="closeModal" allowOverflow>
        <template #modal-body>
            <div data-testid="records-export-modal">
                <Alert type="danger" :text="state.error" v-if="state.error" class="mb-3" />

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="records_export_from" :label="$t('recordsExport.from')" />
                        <FormDateField id="records_export_from" name="records_export_from" v-model="state.from"
                            :placeholder="$t('recordsExport.from')" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="records_export_to" :label="$t('recordsExport.to')" />
                        <FormDateField id="records_export_to" name="records_export_to" v-model="state.to"
                            :placeholder="$t('recordsExport.to')" />
                    </div>
                </div>
                <p v-if="periodMessage" class="mt-1 text-xs text-red-600" data-testid="records-export-period-error">{{ periodMessage }}</p>

                <div v-if="!props.citizenUuid" class="mt-4 space-y-1" data-testid="records-export-department">
                    <FormLabel for="records_export_department" :label="$t('recordsExport.department')" />
                    <FormSelect id="records_export_department" v-model="state.departmentUuid" :options="departmentOptions"
                        :canDeselect="false" :searchable="true" />
                </div>

                <fieldset class="mt-4">
                    <legend class="text-sm font-medium text-gray-700">{{ $t('recordsExport.format') }}</legend>
                    <div class="mt-1 grid grid-cols-2 gap-2" role="radiogroup">
                        <button v-for="option in formats" :key="option.value" type="button" role="radio"
                            :aria-checked="state.format === option.value" :data-testid="`records-export-format-${option.value}`"
                            class="flex items-center justify-center gap-x-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors"
                            :class="state.format === option.value ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'"
                            @click="state.format = option.value">
                            <Icon :name="option.icon" class="h-4 w-4" aria-hidden="true" />
                            {{ option.label }}
                        </button>
                    </div>
                </fieldset>

                <label v-if="props.kind === 'incidents'" class="mt-4 flex items-center gap-x-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" v-model="state.includeDrafts" data-testid="records-export-drafts"
                        class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    {{ $t('recordsExport.includeDrafts') }}
                </label>

                <div class="mt-5">
                    <FormButton type="button" buttonStyle="primary" class="w-full" :disabled="!canDownload"
                        data-testid="records-export-download" @click="download">
                        <template #icon-left>
                            <Icon :name="state.isDownloading ? 'ph:spinner' : 'ph:download-simple'" class="h-4 w-4"
                                :class="state.isDownloading && 'animate-spin'" aria-hidden="true" />
                        </template>
                        {{ state.isDownloading ? $t('recordsExport.downloading') : $t('recordsExport.download') }}
                    </FormButton>
                </div>

                <p class="mt-3 flex items-start gap-1.5 text-xs text-gray-400">
                    <Icon name="ph:info" class="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    {{ $t('recordsExport.personalData') }}
                </p>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOfForceService } from '@/components/api/user/UseOfForceService'
import { incidentService } from '@/components/api/user/IncidentService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { useDepartmentStore } from '@/store/department'
import { defaultPeriod, exportParams, filenameFrom, periodProblem, MAX_YEARS } from '@/composables/recordsExport'
import type { RecordsFormat, RecordsKind } from '@/composables/recordsExport'

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    kind: { type: String as PropType<RecordsKind>, required: true },
    // One citizen; without it every citizen the user can see.
    citizenUuid: { type: String, required: false, default: '' },
    // The statistics page's range ({ start_date, end_date }), to start from.
    dateRange: { type: Object, required: false, default: null },
})
const emit = defineEmits(['close'])
const { t } = useI18n()
const departmentStore = useDepartmentStore() as any

const state = reactive({
    from: '',
    to: '',
    format: 'xlsx' as RecordsFormat,
    departmentUuid: '',
    includeDrafts: false,
    departments: [] as { value: string, label: string }[],
    isDownloading: false,
    error: '',
})

const title = computed(() => props.kind === 'incidents' ? t('recordsExport.titleIncidents') : t('recordsExport.titleUseOfForce'))
const formats = computed(() => [
    { value: 'xlsx' as RecordsFormat, label: 'Excel (.xlsx)', icon: 'ph:microsoft-excel-logo' },
    { value: 'csv' as RecordsFormat, label: 'CSV', icon: 'ph:file-csv' },
])
const departmentOptions = computed(() => [{ value: '', label: t('recordsExport.allDepartments') }, ...state.departments])
const problem = computed(() => periodProblem(state.from, state.to))
const periodMessage = computed(() => {
    if (problem.value === 'order') return t('recordsExport.toBeforeFrom')
    if (problem.value === 'tooLong') return t('recordsExport.tooLong', { years: MAX_YEARS })
    return ''
})
const canDownload = computed(() => !state.isDownloading && problem.value === '')

watch(() => props.isModalOpen, (isOpen: boolean) => {
    if (!isOpen) return
    const period = defaultPeriod(props.dateRange as any)
    state.from = period.from
    state.to = period.to
    state.error = ''
    state.isDownloading = false
    state.includeDrafts = false
    if (!props.citizenUuid) fetchDepartments()
}, { immediate: true })

async function fetchDepartments() {
    try {
        const response = await departmentService.getAllDepartments({})
        state.departments = (response?.data ?? []).map((item: any) => ({ value: item.uuid, label: item.name }))
        // Start from the department chosen at the top of the page, if it is one of them.
        const selected = departmentStore.getSelectedDepartment?.uuid
        state.departmentUuid = state.departments.some((d) => d.value === selected) ? selected : ''
    } catch {
        state.departments = []
        state.departmentUuid = ''
    }
}

async function download() {
    if (!canDownload.value) return
    state.error = ''
    state.isDownloading = true
    let headers: Headers | null = null
    const params = exportParams({
        kind: props.kind,
        format: state.format,
        from: state.from,
        to: state.to,
        citizenUuid: props.citizenUuid,
        departmentUuid: state.departmentUuid,
        includeDrafts: state.includeDrafts,
    })

    try {
        const service = props.kind === 'incidents' ? incidentService : useOfForceService
        const blob = await service.exportRecords(params, (h: Headers) => { headers = h })
        if (!blob) {
            state.error = t('recordsExport.error')
            return
        }
        const fallback = `${props.kind === 'incidents' ? 'incidents' : 'use-of-force'}-${state.from}-${state.to}.${state.format}`
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filenameFrom((headers as Headers | null)?.get('content-disposition'), fallback)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setTimeout(() => URL.revokeObjectURL(url), 60000)
        closeModal()
    } catch (error: any) {
        state.error = firstError(error) || t('recordsExport.error')
    } finally {
        state.isDownloading = false
    }
}

function firstError(error: any): string {
    const errors = error?.errors
    if (errors && typeof errors === 'object') {
        const first = Object.values(errors)[0] as any
        if (Array.isArray(first) && first[0]) return String(first[0])
    }
    return error?.message || ''
}

function closeModal() {
    emit('close')
}
</script>
