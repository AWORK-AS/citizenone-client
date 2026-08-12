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
                    <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
                        <div class="xl:col-span-2 space-y-5">
                            <div class="px-4 py-5 sm:p-6 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
                                <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
                                    <h3 class="text-base font-semibold text-gray-900">
                                        {{ $t('citizens.toothChart.title') }}
                                    </h3>
                                    <div class="flex flex-wrap items-center gap-2">
                                        <FormButton :buttonStyle="state.showPerio ? 'primary' : 'action'" buttonSize="xs"
                                            @click="state.showPerio = !state.showPerio">
                                            <Icon name="ph:eye" class="size-4" />
                                            {{ $t('citizens.toothChart.perio.show') }}
                                        </FormButton>
                                        <FormButton buttonStyle="action" buttonSize="xs" @click="downloadPdf"
                                            :disabled="state.isDownloading">
                                            <Icon name="ph:file-pdf" class="size-4" />
                                            {{ $t('citizens.toothChart.downloadPdf') }}
                                        </FormButton>
                                        <span class="text-xs text-gray-500">{{ $t('citizens.toothChart.dentition.label') }}</span>
                                        <FormButton :buttonStyle="state.dentition === 'permanent' ? 'primary' : 'action'"
                                            buttonSize="xs" @click="state.dentition = 'permanent'">
                                            {{ $t('citizens.toothChart.dentition.permanent') }}
                                        </FormButton>
                                        <FormButton :buttonStyle="state.dentition === 'primary' ? 'primary' : 'action'"
                                            buttonSize="xs" @click="state.dentition = 'primary'">
                                            {{ $t('citizens.toothChart.dentition.primary') }}
                                        </FormButton>
                                        <span class="text-xs text-gray-500">{{ $t('citizens.toothChart.numbering') }}</span>
                                        <FormButton :buttonStyle="state.numbering === 'fdi' ? 'primary' : 'action'"
                                            buttonSize="xs" @click="state.numbering = 'fdi'">
                                            {{ $t('citizens.toothChart.fdi') }}
                                        </FormButton>
                                        <FormButton
                                            :buttonStyle="state.numbering === 'universal' ? 'primary' : 'action'"
                                            buttonSize="xs" @click="state.numbering = 'universal'">
                                            {{ $t('citizens.toothChart.universal') }}
                                        </FormButton>
                                    </div>
                                </div>

                                <ModulesUserCitizenToothChartDiagram :teeth="state.teeth" :statuses="state.statuses"
                                    :perio="state.perio" :showPerio="state.showPerio"
                                    :statusOptions="state.statusOptions" :selectedToothUuid="state.selectedToothUuid"
                                    :numbering="state.numbering" :dentition="state.dentition"
                                    @select="selectTooth" />
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
                            <ModulesUserCitizenToothChartPanel :citizenUuid="citizenUuid" :tooth="selectedTooth"
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
import { saveAs } from 'file-saver'
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
    generalNotes: '',
    oralHealthNotes: '',
    numbering: 'fdi' as 'fdi' | 'universal',
    dentition: 'permanent' as 'permanent' | 'primary',
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
        state.generalNotes = response?.data?.general_notes || ''
        state.oralHealthNotes = response?.data?.oral_health_notes || ''
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isPageLoading = false
    }
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
})
</script>
