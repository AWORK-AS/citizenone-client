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
                <div class="flex items-center gap-3">
                    <span
                        class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-base font-semibold text-primary tabular-nums">
                        {{ props.tooth.fdi_number }}
                    </span>
                    <div>
                        <h3 class="text-base font-semibold text-gray-900">{{ toothName }}</h3>
                        <p class="text-xs text-gray-500">
                            {{ $t('citizens.toothChart.universalShort') }} {{ props.tooth.universal_code ?? props.tooth.number }}
                            <span v-if="wholeStatus" class="text-gray-300">&middot;</span>
                            <span v-if="wholeStatus" class="inline-flex items-center gap-1">
                                <span class="size-2 rounded-full ring-1 ring-gray-300"
                                    :style="{ backgroundColor: statusColor(wholeStatus) }" />
                                {{ $t(`citizens.toothChart.statuses.${wholeStatus}`) }}
                            </span>
                        </p>
                    </div>
                </div>
                <button type="button" @click="emit('close')" :aria-label="$t('cancel')"
                    class="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                    <Icon name="ph:x" class="size-4" />
                </button>
            </div>

            <Alert type="danger" :text="state.error" v-if="state.error" />

            <div class="space-y-2">
                <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {{ $t('citizens.toothChart.panel.quickStatus') }}
                </p>
                <!-- The five findings a clinic reaches for most often, one tap
                     away and gloved-finger sized. -->
                <div class="flex flex-wrap gap-1.5">
                    <button type="button" v-for="status in QUICK_STATUSES" :key="status"
                        @click="setWholeStatus(status)" :class="[
                            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition',
                            wholeRow?.status === status
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        ]">
                        <span class="size-2.5 rounded-full ring-1 ring-gray-300"
                            :style="{ backgroundColor: statusColor(status) }" />
                        {{ $t(`citizens.toothChart.statuses.${status}`) }}
                    </button>
                </div>
            </div>

            <div class="space-y-2">
                <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {{ $t('citizens.toothChart.panel.surfaces') }}
                </p>

                <div v-for="row in state.rows" :key="row.surface"
                    class="rounded-lg border border-gray-200 px-3 py-2 space-y-2"
                    :class="row.status ? 'bg-white' : 'bg-gray-50/60'">
                    <div class="flex items-center justify-between gap-3">
                        <span class="text-sm text-gray-700">
                            {{ $t(`citizens.toothChart.surfaces.${row.surface}`) }}
                        </span>
                        <div class="w-40">
                            <FormSelect :id="`status-${row.surface}`" :options="statusOptions" v-model="row.status"
                                :placeholder="$t('citizens.toothChart.panel.noStatus')" />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2" v-if="row.status">
                        <FormDateField :id="`treated-${row.surface}`" :name="`treated-${row.surface}`"
                            :placeholder="$t('citizens.toothChart.panel.treatedAt')" v-model="row.treated_at" />
                        <FormTextField :id="`note-${row.surface}`" :name="`note-${row.surface}`" v-model="row.note"
                            :placeholder="$t('citizens.toothChart.panel.notePlaceholder')" />
                    </div>
                </div>
            </div>

            <div class="border-t border-gray-200 pt-4 space-y-3">
                <h4 class="text-sm font-semibold text-gray-900">{{ $t('citizens.toothChart.perio.title') }}</h4>

                <div class="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div class="sm:col-span-6">
                        <FormLabel for="perio_bleeding" :label="$t('citizens.toothChart.perio.bleeding')" />
                    </div>
                    <div class="sm:col-span-6">
                        <FormSwitch :value="state.perio.bleeding"
                            @toggleSwitch="state.perio.bleeding = !state.perio.bleeding" />
                    </div>

                    <div class="sm:col-span-6">
                        <FormLabel for="perio_pocket" :label="$t('citizens.toothChart.perio.pocketDepth')" />
                    </div>
                    <div class="sm:col-span-6">
                        <FormNumberField id="perio_pocket" name="perio_pocket" :min="0"
                            :placeholder="$t('citizens.toothChart.perio.pocketPlaceholder')"
                            v-model="state.perio.pocket_depth_mm" />
                    </div>

                    <div class="sm:col-span-6">
                        <FormLabel for="perio_mobility" :label="$t('citizens.toothChart.perio.mobility')" />
                    </div>
                    <div class="sm:col-span-6">
                        <FormSelect id="perio_mobility" :options="mobilityOptions" v-model="state.perio.mobility"
                            :placeholder="$t('citizens.toothChart.panel.noStatus')" />
                    </div>

                    <div class="sm:col-span-6">
                        <FormLabel for="perio_measured" :label="$t('citizens.toothChart.perio.measuredAt')" />
                    </div>
                    <div class="sm:col-span-6">
                        <FormDateField id="perio_measured" name="perio_measured"
                            :placeholder="$t('citizens.toothChart.perio.measuredAt')"
                            v-model="state.perio.measured_at" />
                    </div>

                    <div class="sm:col-span-6">
                        <FormLabel for="perio_note" :label="$t('citizens.toothChart.panel.notePlaceholder')" />
                    </div>
                    <div class="sm:col-span-6">
                        <FormTextField id="perio_note" name="perio_note" v-model="state.perio.note"
                            :placeholder="$t('citizens.toothChart.panel.notePlaceholder')" />
                    </div>
                </div>
            </div>

            <label
                class="flex cursor-pointer items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-gray-600">
                <FormCheckbox id="create_journal" :value="state.createJournal" />
                <span @click="state.createJournal = !state.createJournal">
                    {{ $t('citizens.toothChart.panel.writeToJournal') }}
                </span>
            </label>

            <div class="sticky bottom-0 -mx-4 border-t border-gray-100 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
                <div class="flex items-center justify-end gap-2">
                    <FormButton buttonStyle="action" @click="reset" :disabled="state.isSaving">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" @click="save" :disabled="state.isSaving">
                        <Icon name="ph:floppy-disk" class="size-4" />
                        {{ $t('save') }}
                    </FormButton>
                </div>
            </div>

            <div class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 space-y-1"
                v-if="state.plannedTreatments.length">
                <p class="text-xs font-semibold uppercase tracking-wide text-amber-800">
                    {{ $t('citizens.toothChart.panel.planned') }}
                </p>
                <p v-for="planned in state.plannedTreatments" :key="planned.uuid" class="text-sm text-amber-900">
                    {{ planned.description }}
                    <span class="text-xs text-amber-700" v-if="planned.treatment_code">
                        ({{ planned.treatment_code }})
                    </span>
                    <span class="text-xs text-amber-700">&middot; {{ planned.estimate_number }}</span>
                </p>
            </div>

            <div class="border-t border-gray-200 pt-4 space-y-3">
                <div class="flex items-center justify-between gap-2">
                    <h4 class="text-sm font-semibold text-gray-900">
                        {{ $t('citizens.toothChart.panel.attachments') }}
                    </h4>
                    <label
                        class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-300">
                        <Icon name="ph:upload-simple" class="size-4" />
                        {{ $t('citizens.toothChart.panel.addAttachment') }}
                        <input type="file" class="hidden" accept="image/*,application/pdf"
                            :disabled="state.isUploading" @change="uploadAttachment" />
                    </label>
                </div>

                <p class="text-sm text-gray-500" v-if="state.attachments.length === 0">
                    {{ $t('citizens.toothChart.panel.noAttachments') }}
                </p>

                <ul class="grid grid-cols-2 gap-2" v-else>
                    <li v-for="attachment in state.attachments" :key="attachment.uuid"
                        class="rounded-md border border-gray-200 p-2">
                        <a :href="attachment.file_url" target="_blank" rel="noopener" class="block">
                            <img v-if="isImage(attachment)" :src="attachment.file_url" :alt="attachment.file_name"
                                class="h-24 w-full rounded object-cover" />
                            <div v-else class="flex h-24 items-center justify-center rounded bg-gray-50">
                                <Icon name="ph:file-pdf" class="size-8 text-gray-400" />
                            </div>
                        </a>
                        <p class="mt-1 truncate text-xs text-gray-700" :title="attachment.file_name">
                            {{ attachment.file_name }}
                        </p>
                        <div class="flex items-center justify-between text-[11px] text-gray-500">
                            <span>{{ $t(`citizens.toothChart.attachmentKinds.${attachment.kind}`) }}</span>
                            <button type="button" class="text-gray-400 hover:text-red-600" :aria-label="$t('delete')"
                                @click="removeAttachment(attachment)">
                                <Icon name="ph:trash" class="size-3.5" />
                            </button>
                        </div>
                    </li>
                </ul>
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
    perio: any | null
    statusOptions: string[]
    surfaceOptions: string[]
    selectedSurface?: string | null
}>()

const emit = defineEmits<{ (event: 'saved'): void; (event: 'close'): void }>()

const { t, locale } = useI18n()
const { successAlert } = useAlert()

// Kept in sync with CitizenToothStatus::STATUSES on the backend.
const STATUS_COLORS: Record<string, string> = {
    healthy: '#ffffff',
    caries: '#ef4444',
    filling: '#3b82f6',
    crown: '#fbbf24',
    bridge: '#8b5cf6',
    root_canal: '#ec4899',
    implant: '#64748b',
    veneer: '#22d3ee',
    sealant: '#2dd4bf',
    fracture: '#f97316',
    extracted: '#374151',
    missing: '#d1d5db',
    planned: '#a3e635',
    observation: '#fde047',
    not_erupted: '#eef2ff',
}

const QUICK_STATUSES = ['healthy', 'caries', 'filling', 'crown', 'extracted']

const state = reactive({
    rows: [] as any[],
    perio: { bleeding: false, pocket_depth_mm: '', mobility: null, note: '', measured_at: '' } as any,
    journals: [] as any[],
    attachments: [] as any[],
    plannedTreatments: [] as any[],
    isHistoryLoading: false,
    isSaving: false,
    isUploading: false,
    createJournal: false,
    error: '',
})

const statusOptions = computed(() => (props.statusOptions || []).map((status: string) => ({
    value: status,
    label: t(`citizens.toothChart.statuses.${status}`),
})))

// 0-3 is the Miller mobility scale used chairside.
const mobilityOptions = computed(() => [0, 1, 2, 3].map((value: number) => ({
    value,
    label: String(value),
})))

const wholeRow = computed(() => state.rows.find((row: any) => row.surface === 'whole'))

const wholeStatus = computed(() => wholeRow.value?.status || null)

function statusColor(status: string): string {
    return STATUS_COLORS[status] || '#ffffff'
}

// Tapping the marked status again clears it, so a mis-tap costs one tap.
function setWholeStatus(status: string) {
    const row = wholeRow.value

    if (!row) return

    row.status = row.status === status ? null : status
}

const toothName = computed(() => (locale.value === 'en' ? props.tooth?.en_name : props.tooth?.dk_name) || '')

function buildRows() {
    const recorded: Record<string, any> = {}

    for (const status of props.statuses || []) {
        recorded[status.surface] = status
    }

    // A front tooth has four surfaces, so it is not offered a chewing surface.
    const isBackTooth = ((props.tooth?.fdi_number ?? 0) % 10) >= 4
    const surfaces = (props.surfaceOptions || [])
        .filter((surface: string) => isBackTooth || surface !== 'occlusal')

    state.rows = surfaces.map((surface: string) => ({
        surface,
        status: recorded[surface]?.status || null,
        note: recorded[surface]?.note || '',
        treated_at: recorded[surface]?.treated_at || '',
    }))

    state.perio = {
        bleeding: props.perio?.bleeding ?? false,
        pocket_depth_mm: props.perio?.pocket_depth_mm != null ? String(props.perio.pocket_depth_mm) : '',
        mobility: props.perio?.mobility ?? null,
        note: props.perio?.note || '',
        measured_at: props.perio?.measured_at || '',
    }
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
        state.attachments = response?.data?.attachments || []
        state.plannedTreatments = response?.data?.planned_treatments || []
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isHistoryLoading = false
    }
}

function isImage(attachment: any): boolean {
    return /\.(jpe?g|png|gif|webp)$/i.test(attachment.file_name || '')
}

async function uploadAttachment(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    if (!file || !props.tooth) return

    state.isUploading = true
    state.error = ''

    try {
        const formData = new FormData()
        formData.append('file', file)
        // An x-ray is what a clinic files most; the rest is corrected on the
        // spot if it is a photo or a report.
        formData.append('kind', file.type === 'application/pdf' ? 'document' : 'xray')

        await toothChartService.uploadAttachment(props.citizenUuid, props.tooth.uuid, formData)
        await loadHistory()
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isUploading = false
        input.value = ''
    }
}

async function removeAttachment(attachment: any) {
    state.error = ''

    try {
        await toothChartService.deleteAttachment(attachment.uuid)
        await loadHistory()
    } catch (error: any) {
        state.error = error?.message || ''
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
            create_journal: state.createJournal,
            perio: {
                bleeding: state.perio.bleeding,
                pocket_depth_mm: state.perio.pocket_depth_mm !== '' && state.perio.pocket_depth_mm != null
                    ? Number(state.perio.pocket_depth_mm)
                    : null,
                mobility: state.perio.mobility ?? null,
                note: state.perio.note || null,
                measured_at: state.perio.measured_at || null,
            },
        })

        successAlert(`${t('alert.success')}!`, `${t('citizens.toothChart.panel.saved')}.`)
        state.createJournal = false
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

watch(() => props.perio, () => buildRows(), { deep: true })
</script>
