<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.toothChart') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ $t('citizens.tabs.toothChart') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <Alert type="danger" :text="state.error" v-if="state.error" />

                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenToothChartPatientStrip class="mb-5" :patient="state.patient"
                        :lastExamination="state.lastExamination" />

                    <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
                        <div class="xl:col-span-2 space-y-5">
                            <div class="px-4 py-5 sm:p-6 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
                                <div class="flex flex-wrap items-start justify-between gap-4 mb-5">
                                    <div>
                                        <h3 class="text-base font-semibold text-gray-900">
                                            {{ $t('citizens.toothChart.title') }}
                                        </h3>
                                        <p class="text-sm text-gray-500">{{ $t('citizens.toothChart.arch.help') }}</p>
                                    </div>

                                    <div class="flex flex-wrap items-center gap-2">
                                        <!-- Two things are switched often while working: which
                                             dentition is charted and how it is drawn. They are
                                             grouped so neither is mistaken for an action. -->
                                        <div class="inline-flex rounded-lg bg-gray-100 p-0.5">
                                            <button type="button" v-for="option in dentitionOptions" :key="option.value"
                                                @click="state.dentition = option.value" :class="[
                                                    'rounded-md px-3 py-1.5 text-sm font-medium transition',
                                                    state.dentition === option.value
                                                        ? 'bg-white text-primary shadow-sm'
                                                        : 'text-gray-500 hover:text-gray-700'
                                                ]">
                                                {{ option.label }}
                                            </button>
                                        </div>

                                        <div class="inline-flex rounded-lg bg-gray-100 p-0.5">
                                            <button type="button" v-for="option in viewOptions" :key="option.value"
                                                @click="state.view = option.value" :class="[
                                                    'rounded-md px-3 py-1.5 text-sm font-medium transition',
                                                    state.view === option.value
                                                        ? 'bg-white text-primary shadow-sm'
                                                        : 'text-gray-500 hover:text-gray-700'
                                                ]">
                                                {{ option.label }}
                                            </button>
                                        </div>

                                        <div class="inline-flex rounded-lg bg-gray-100 p-0.5">
                                            <button type="button" v-for="option in numberingOptions" :key="option.value"
                                                @click="state.numbering = option.value" :class="[
                                                    'rounded-md px-3 py-1.5 text-sm font-medium transition',
                                                    state.numbering === option.value
                                                        ? 'bg-white text-primary shadow-sm'
                                                        : 'text-gray-500 hover:text-gray-700'
                                                ]">
                                                {{ option.label }}
                                            </button>
                                        </div>

                                        <button type="button" @click="state.showPerio = !state.showPerio" :class="[
                                            'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition',
                                            state.showPerio
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        ]">
                                            <Icon name="ph:drop" class="size-4" />
                                            {{ $t('citizens.toothChart.perio.show') }}
                                        </button>

                                        <button type="button" @click="downloadPdf" :disabled="state.isDownloading"
                                            class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:border-gray-300 disabled:opacity-50">
                                            <Icon name="ph:file-pdf" class="size-4" />
                                            {{ $t('citizens.toothChart.downloadPdf') }}
                                        </button>
                                    </div>
                                </div>

                                <div class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2"
                                    v-if="state.viewedExamination">
                                    <p class="text-sm text-amber-900">
                                        {{ $t('citizens.toothChart.history.viewing') }}
                                        <strong>{{ formatDate(state.viewedExamination.examined_at) }}</strong>
                                    </p>
                                    <button type="button" @click="showToday"
                                        class="text-sm font-medium text-amber-900 underline underline-offset-2">
                                        {{ $t('citizens.toothChart.history.backToToday') }}
                                    </button>
                                </div>

                                <div class="mb-4 flex flex-wrap items-center gap-2" v-if="state.examinations.length">
                                    <span class="text-xs text-gray-500">{{ $t('citizens.toothChart.history.label') }}</span>
                                    <button type="button" v-for="examination in state.examinations.slice(0, 6)"
                                        :key="examination.uuid" @click="showExamination(examination)" :class="[
                                            'rounded-full border px-3 py-1 text-xs font-medium tabular-nums transition',
                                            state.viewedExamination?.uuid === examination.uuid
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        ]">
                                        {{ formatDate(examination.examined_at) }}
                                    </button>
                                </div>

                                <ModulesUserCitizenToothChartArch v-if="state.view === 'arch'" :teeth="state.teeth"
                                    :statuses="shownStatuses" :perio="state.perio" :showPerio="state.showPerio"
                                    :selectedToothUuid="state.selectedToothUuid" :numbering="state.numbering"
                                    :dentition="state.dentition" @select="selectTooth" />

                                <ModulesUserCitizenToothChartDiagram v-else :teeth="state.teeth"
                                    :statuses="shownStatuses" :perio="state.perio" :showPerio="state.showPerio"
                                    :statusOptions="state.statusOptions" :selectedToothUuid="state.selectedToothUuid"
                                    :numbering="state.numbering" :dentition="state.dentition"
                                    @select="selectTooth" />

                                <div class="mt-5 border-t border-gray-100 pt-4" v-if="state.view === 'arch'">
                                    <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                                        {{ $t('citizens.toothChart.legend') }}
                                    </p>
                                    <div class="flex flex-wrap gap-1.5">
                                        <span v-for="status in state.statusOptions" :key="status"
                                            class="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] text-gray-600">
                                            <span class="size-2.5 rounded-full ring-1 ring-gray-300"
                                                :style="{ backgroundColor: statusColor(status) }" />
                                            {{ $t(`citizens.toothChart.statuses.${status}`) }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="px-4 py-5 sm:p-6 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg space-y-3">
                                <div class="flex items-center justify-between gap-3">
                                    <h3 class="text-base font-semibold text-gray-900">
                                        {{ $t('citizens.toothChart.generalNotes') }}
                                    </h3>
                                    <FormButton buttonStyle="primary" buttonSize="xs" @click="saveGeneralNotes"
                                        :disabled="state.isSavingNotes">
                                        <Icon name="ph:floppy-disk" class="size-4" />
                                        {{ $t('save') }}
                                    </FormButton>
                                </div>
                                <FormTextArea id="general_notes" name="general_notes"
                                    :placeholder="$t('citizens.toothChart.generalNotesPlaceholder')" :rows="5"
                                    v-model="state.generalNotes" />

                                <h3 class="text-base font-semibold text-gray-900 pt-2">
                                    {{ $t('citizens.toothChart.oralHealthNotes') }}
                                </h3>
                                <FormTextArea id="oral_health_notes" name="oral_health_notes"
                                    :placeholder="$t('citizens.toothChart.oralHealthNotesPlaceholder')" :rows="4"
                                    v-model="state.oralHealthNotes" />
                            </div>

                            <ModulesUserCitizenToothChartExaminations :citizenUuid="citizenUuid" />
                        </div>

                        <div class="xl:col-span-1">
                            <ModulesUserCitizenToothChartPanel v-if="!state.viewedExamination"
                                :citizenUuid="citizenUuid" :tooth="selectedTooth"
                                :statuses="selectedToothStatuses" :perio="selectedToothPerio"
                                :statusOptions="state.statusOptions"
                                :surfaceOptions="state.surfaceOptions" :selectedSurface="state.selectedSurface"
                                @saved="loadChart" @close="clearSelection" />
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { saveAs } from 'file-saver'
import { dentalExaminationService } from '@/components/api/user/DentalExaminationService'
import { toothChartService } from '@/components/api/user/ToothChartService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const customPagesStore = useCustomPagesStore() as any
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()
const route = useRoute()
const citizenUuid = route?.params?.uuid as string

const breadcrumbLinks = [
    { name: 'citizens.tabs.toothChart', translate: true, href: `/citizens/${citizenUuid}/tooth-chart` },
]

const state = reactive({
    teeth: [] as any[],
    statuses: [] as any[],
    statusOptions: [] as string[],
    surfaceOptions: [] as string[],
    perio: [] as any[],
    patient: null as any,
    examinations: [] as any[],
    lastExamination: null as any,
    viewedExamination: null as any,
    viewedStatuses: [] as any[],
    generalNotes: '',
    oralHealthNotes: '',
    numbering: 'fdi' as 'fdi' | 'universal',
    dentition: 'permanent' as 'permanent' | 'primary',
    view: 'arch' as 'arch' | 'surfaces',
    showPerio: false,
    selectedToothUuid: null as string | null,
    selectedSurface: null as string | null,
    isPageLoading: true,
    isSavingNotes: false,
    isDownloading: false,
    error: '',
})

// The chart only exists for dental clinics; anyone else is sent back to the
// citizen's journals rather than shown an endless spinner.
watch(() => userStore.getUser, (user: any) => {
    if (user?.uuid && user?.company?.industry?.system_name !== 'dental') {
        navigateTo(`/citizens/${citizenUuid}/journals`)
    }
}, { immediate: true })

const selectedTooth = computed(() => state.teeth.find((tooth: any) => tooth.uuid === state.selectedToothUuid) || null)

// While a past examination is shown, the drawing reads from its snapshot and
// nothing is edited: that day cannot be changed after the fact.
const shownStatuses = computed(() => (state.viewedExamination ? state.viewedStatuses : state.statuses))

const selectedToothStatuses = computed(() =>
    state.statuses.filter((status: any) => status.tooth_uuid === state.selectedToothUuid))

const selectedToothPerio = computed(() =>
    state.perio.find((measurement: any) => measurement.tooth_uuid === state.selectedToothUuid) || null)

async function loadChart() {
    state.error = ''

    try {
        const response = await toothChartService.getChart(citizenUuid)
        state.teeth = response?.data?.teeth || []
        state.statuses = response?.data?.statuses || []
        state.perio = response?.data?.perio || []
        state.statusOptions = response?.data?.status_options || []
        state.surfaceOptions = response?.data?.surface_options || []
        state.patient = response?.data?.patient || null
        state.generalNotes = response?.data?.general_notes || ''
        state.oralHealthNotes = response?.data?.oral_health_notes || ''
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isPageLoading = false
    }
}

const dentitionOptions = computed(() => [
    { value: 'permanent' as const, label: t('citizens.toothChart.dentition.permanent') },
    { value: 'primary' as const, label: t('citizens.toothChart.dentition.primary') },
])

const viewOptions = computed(() => [
    { value: 'arch' as const, label: t('citizens.toothChart.view.arch') },
    { value: 'surfaces' as const, label: t('citizens.toothChart.view.surfaces') },
])

const numberingOptions = computed(() => [
    { value: 'fdi' as const, label: t('citizens.toothChart.fdi') },
    { value: 'universal' as const, label: t('citizens.toothChart.universal') },
])

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
}

function statusColor(status: string): string {
    return STATUS_COLORS[status] || '#ffffff'
}

async function loadExaminations() {
    try {
        const response = await dentalExaminationService.getExaminations(citizenUuid)
        state.examinations = response?.data || []
        state.lastExamination = state.examinations[0] || null
    } catch {
        // The chart is usable without the examination history.
        state.examinations = []
    }
}

async function showExamination(examination: any) {
    state.error = ''

    try {
        const response = await dentalExaminationService.getExamination(examination.uuid)
        state.viewedStatuses = response?.data?.statuses || []
        state.viewedExamination = examination
        clearSelection()
    } catch (error: any) {
        state.error = error?.message || ''
    }
}

function showToday() {
    state.viewedExamination = null
    state.viewedStatuses = []
    clearSelection()
}

function formatDate(date: string): string {
    return date ? moment(date).format('DD.MM.YYYY') : ''
}

function selectTooth(toothUuid: string, surface: string) {
    state.selectedToothUuid = toothUuid
    state.selectedSurface = surface
}

function clearSelection() {
    state.selectedToothUuid = null
    state.selectedSurface = null
}

async function saveGeneralNotes() {
    state.isSavingNotes = true
    state.error = ''

    try {
        await toothChartService.updateGeneralNotes(citizenUuid, {
            general_notes: state.generalNotes || null,
            oral_health_notes: state.oralHealthNotes || null,
        })
        successAlert(`${t('alert.success')}!`, `${t('citizens.toothChart.generalNotesSaved')}.`)
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isSavingNotes = false
    }
}

async function downloadPdf() {
    state.isDownloading = true
    state.error = ''

    try {
        const response = await toothChartService.downloadPdf(citizenUuid)
        const blob = response instanceof Blob ? response : new Blob([response as any], { type: 'application/pdf' })

        saveAs(blob, `tandkort-${citizenUuid}.pdf`)
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isDownloading = false
    }
}

onMounted(() => {
    loadChart()
    loadExaminations()
})
</script>
