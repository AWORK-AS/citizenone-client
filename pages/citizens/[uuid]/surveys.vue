<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.surveys') }} - {{ runtimeConfig?.public?.appName }}</Title>
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

            <template #header>{{ $t('citizens.tabs.surveys') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div class="flex justify-end items-center gap-x-3">
                    <FormButton buttonStyle="action" @click="openSurveyModal('send')">
                        <Icon name="ph:paper-plane-tilt" class="h-4 w-4" />
                        {{ $t('surveys.sendToCitizen') }}
                    </FormButton>
                    <FormButton buttonStyle="action" @click="openSurveyModal('fill')">
                        <Icon name="ph:pencil-simple" class="h-4 w-4" />
                        {{ $t('surveys.fillInternally') }}
                    </FormButton>
                </div>

                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg mb-5"
                        v-if="completedWithScore.length > 0">
                        <h3 class="text-md font-semibold mb-3">{{ $t('surveys.scoreOverTime') }}</h3>
                        <VChart :option="chartOption" style="height: 400px; width: 100%;" />
                    </div>

                    <div v-if="!state.isTableLoading && state.assignments.length === 0"
                        class="px-6 py-14 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg text-center">
                        <div class="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon name="ph:clipboard-text" class="h-7 w-7 text-primary" />
                        </div>
                        <h3 class="mt-4 text-lg font-semibold text-gray-900">{{ $t('surveys.empty.title') }}</h3>
                        <p class="mt-1 text-sm text-gray-500 max-w-md mx-auto">{{ $t('surveys.empty.text') }}</p>
                        <div class="mt-5 flex items-center justify-center gap-2">
                            <FormButton type="button" buttonStyle="primary" @click="openSurveyModal('send')">
                                <Icon name="ph:paper-plane-tilt" class="size-4" />{{ $t('surveys.sendToCitizen') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="action" @click="openSurveyModal('fill')">
                                <Icon name="ph:pencil-simple" class="size-4" />{{ $t('surveys.fillInternally') }}
                            </FormButton>
                        </div>
                    </div>

                    <div class="table-responsive" v-else>
                        <Table :columnHeaders="state.columnHeaders" :data="{ data: state.assignments }"
                            :isLoading="state.isTableLoading" :sortData="state.sortData">
                            <template #body v-if="!(state.isTableLoading || state.assignments.length === 0)">
                                <tr v-for="(a, index) in state.assignments" :key="index">
                                    <td><p class="font-medium">{{ a?.survey?.title }}</p></td>
                                    <td>
                                        <span class="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full"
                                            :class="a?.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
                                            {{ a?.status === 'completed' ? $t('surveys.status.completed') : $t('surveys.status.pending') }}
                                        </span>
                                    </td>
                                    <td><p>{{ a?.source === 'internal' ? $t('surveys.source.internal') : $t('surveys.source.citizen') }}</p></td>
                                    <td><p>{{ formatDate(a?.created_at) }}</p></td>
                                    <td><p>{{ a?.completed_at ? formatDate(a?.completed_at) : '-' }}</p></td>
                                    <td>
                                        <p class="font-semibold">
                                            {{ a?.score ?? '-' }}
                                            <span class="block text-xs font-normal text-gray-500"
                                                v-if="scoreLabel(a?.score, a?.survey?.score_ranges)">
                                                {{ scoreLabel(a?.score, a?.survey?.score_ranges) }}
                                            </span>
                                        </p>
                                    </td>
                                    <td>
                                        <div class="flex items-center justify-end gap-2">
                                            <FormButton v-if="a?.status === 'completed'" type="button" buttonStyle="action"
                                                @click="openAnswers(a)">
                                                <Icon name="ph:eye" class="size-4" />{{ $t('surveys.viewAnswers') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" @click="deleteConfirmation(a)">
                                                <Icon name="ph:trash" class="size-4" />{{ $t('surveys.table.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                </LoadingSpinner>
            </div>

            <Modal size="md"
                :title="state.surveyModal.mode === 'send' ? $t('surveys.sendToCitizen') : $t('surveys.fillInternally')"
                :show="state.surveyModal.isOpen" @close="state.surveyModal.isOpen = false">
                <template #modal-body>
                    <div class="space-y-5">
                        <div>
                            <FormLabel :label="$t('surveys.selectSurvey')" />
                            <FormSelect id="assignment_survey" v-model="state.surveyModal.surveyUuid"
                                :options="state.surveyOptions" :searchable="true" :canClear="false" />
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" @click="state.surveyModal.isOpen = false">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" :disabled="!state.surveyModal.surveyUuid"
                                @click="confirmSurveyModal">
                                {{ state.surveyModal.mode === 'send' ? $t('surveys.send') : $t('surveys.startFilling') }}
                            </FormButton>
                        </div>
                    </div>
                </template>
            </Modal>

            <Modal size="lg" :title="$t('surveys.answers')" :show="state.answersModal.isOpen"
                @close="state.answersModal.isOpen = false">
                <template #modal-body>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <p class="font-semibold">{{ state.answersModal.assignment?.survey?.title }}</p>
                            <span class="text-sm bg-gray-100 rounded-md px-3 py-1"
                                v-if="state.answersModal.assignment?.score !== null && state.answersModal.assignment?.score !== undefined">
                                {{ $t('surveys.score') }}: <span class="font-bold">{{ state.answersModal.assignment?.score }}</span>
                            </span>
                        </div>
                        <div v-for="(entry, index) in answerEntries" :key="index" class="bg-gray-50 rounded-md p-4 space-y-1">
                            <p class="text-sm text-gray-500">{{ index + 1 }}. {{ entry.question }}</p>
                            <p class="font-medium">{{ entry.answer }}</p>
                        </div>
                    </div>
                </template>
            </Modal>

            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="$t('surveys.confirmation.deleteAssignment') + '?'"
                @close="state.modal.isDeleteOpen = false" @confirm="deleteAssignment" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { surveyService } from '@/components/api/user/SurveyService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const customPagesStore = useCustomPagesStore() as any
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()
const route = useRoute()
const citizenUuid = route?.params?.uuid as string

watch(() => userStore.getUser, (user: any) => {
    if (user?.uuid && user?.is_surveys_active === false) navigateTo('/apps')
}, { immediate: true })

const breadcrumbLinks = [{ name: 'citizens.tabs.surveys', translate: true, href: `/citizens/${citizenUuid}/surveys` }]

const state = reactive({
    error: {} as Error,
    assignments: [] as any[],
    surveyOptions: [] as any[],
    columnHeaders: [
        { name: 'surveys.table.survey', isTranslateName: true },
        { name: 'surveys.table.status', isTranslateName: true },
        { name: 'surveys.table.source', isTranslateName: true },
        { name: 'surveys.table.sent', isTranslateName: true },
        { name: 'surveys.table.completed', isTranslateName: true },
        { name: 'surveys.table.score', isTranslateName: true },
        { name: '' },
    ],
    isPageLoading: false,
    isTableLoading: false,
    surveyModal: { isOpen: false, mode: 'send' as 'send' | 'fill', surveyUuid: null as any },
    answersModal: { isOpen: false, assignment: null as any },
    modal: { isDeleteOpen: false },
    selectedAssignment: {} as any,
    sortData: { sortField: 'created_at', sortOrder: 'descend' },
})

const completedWithScore = computed(() =>
    state.assignments.filter((a: any) => a.status === 'completed' && a.score !== null && a.completed_at))

const chartOption = computed(() => {
    const bySurvey: Record<string, { label: string, data: any[] }> = {}
    completedWithScore.value.forEach((a: any) => {
        const key = a.survey?.uuid ?? '-'
        if (!bySurvey[key]) bySurvey[key] = { label: a.survey?.title ?? '-', data: [] }
        bySurvey[key].data.push([moment(a.completed_at).format('YYYY-MM-DD HH:mm'), a.score])
    })
    return {
        tooltip: { trigger: 'axis' },
        legend: { bottom: 0, icon: 'roundRect' },
        xAxis: { type: 'time', axisLabel: { fontSize: 11 } },
        yAxis: { name: t('surveys.score'), splitLine: { lineStyle: { type: 'dashed' } } },
        grid: { left: 50, right: 30, top: 30, bottom: 60, containLabel: true },
        series: Object.values(bySurvey).map((s) => ({
            type: 'line', name: s.label,
            data: s.data.sort((x: any, y: any) => x[0].localeCompare(y[0])),
            smooth: true, symbolSize: 8, lineStyle: { width: 3 }, emphasis: { focus: 'series' },
        })),
    }
})

const answerEntries = computed(() => {
    const a = state.answersModal.assignment
    if (!a) return []
    const entries: any[] = []
    ;(a.survey?.questions ?? []).forEach((q: any) => {
        const def = q.question ?? q
        entries.push({ question: def?.value, answer: resolveAnswer(def, a.answers?.[q.uuid]) })
    })
    return entries
})

function resolveAnswer(def: any, answer: any) {
    if (answer === undefined || answer === null || answer === '') return '-'
    if (def?.type === 'choice') return def?.options?.[answer] ?? '-'
    if (def?.type === 'checkbox' && Array.isArray(answer)) return answer.map((i: any) => def?.options?.[i]).filter(Boolean).join(', ') || '-'
    return String(answer)
}

function scoreLabel(score: any, ranges: any) {
    if (score === null || score === undefined || !Array.isArray(ranges)) return ''
    const hit = ranges.find((r: any) => Number(score) >= Number(r.from) && Number(score) <= Number(r.to) && r.label)
    return hit?.label ?? ''
}

function formatDate(d: any) { return d ? moment(d).format('DD-MM-YYYY HH:mm') : '-' }

onMounted(() => { fetchAssignments(); fetchSurveys() })

async function fetchAssignments() {
    state.isTableLoading = true
    try {
        const response = await surveyService.getCitizenAssignments(citizenUuid)
        if (response?.data) state.assignments = response.data
    } catch (error: any) { state.error = error }
    state.isTableLoading = false
}

async function fetchSurveys() {
    try {
        const response = await surveyService.getAllSurveys()
        if (response?.data) {
            state.surveyOptions = response.data.filter((s: any) => s?.uuid).map((s: any) => ({ value: s?.uuid, label: s?.title }))
        }
    } catch (error: any) { state.error = error }
}

function openSurveyModal(mode: 'send' | 'fill') {
    state.surveyModal.mode = mode
    state.surveyModal.surveyUuid = null
    state.surveyModal.isOpen = true
}

async function confirmSurveyModal() {
    if (state.surveyModal.mode === 'fill') {
        navigateTo(`/surveys/${state.surveyModal.surveyUuid}/fill?citizen_uuid=${citizenUuid}&from=citizen`)
        return
    }
    state.isPageLoading = true
    try {
        const response = await surveyService.saveAssignment(state.surveyModal.surveyUuid, { citizen_uuid: citizenUuid })
        if (response?.data) {
            state.surveyModal.isOpen = false
            successAlert(`${t('alert.success')}!`, `${t('surveys.alert.sent')}.`)
            fetchAssignments()
        }
    } catch (error: any) { state.error = error }
    state.isPageLoading = false
}

function openAnswers(a: any) { state.answersModal.assignment = a; state.answersModal.isOpen = true }
function deleteConfirmation(a: any) { state.selectedAssignment = a; state.modal.isDeleteOpen = true }

async function deleteAssignment() {
    state.modal.isDeleteOpen = false
    state.isTableLoading = true
    try {
        const response = await surveyService.deleteAssignment(state.selectedAssignment?.survey?.uuid, state.selectedAssignment?.uuid)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('surveys.alert.assignmentDeleted')}.`)
            fetchAssignments()
        }
    } catch (error: any) { state.error = error }
    state.isTableLoading = false
}
</script>
