<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('surveys.results') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('surveys.results') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/surveys">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 class="text-lg font-semibold">{{ state.survey?.title }}</h3>
                            <p class="text-sm text-gray-500" v-html="state.survey?.description"></p>
                        </div>
                        <div class="flex items-center gap-2">
                            <FormButton type="button" buttonStyle="action" @click="openCitizenModal('send')">
                                <Icon name="ph:paper-plane-tilt" class="size-4" />
                                {{ $t('surveys.sendToCitizen') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="action" @click="openCitizenModal('fill')">
                                <Icon name="ph:pencil-simple" class="size-4" />
                                {{ $t('surveys.fillInternally') }}
                            </FormButton>
                        </div>
                    </div>

                    <div class="px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg"
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
                            <FormButton type="button" buttonStyle="primary" @click="openCitizenModal('send')">
                                <Icon name="ph:paper-plane-tilt" class="size-4" />
                                {{ $t('surveys.sendToCitizen') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="action" @click="openCitizenModal('fill')">
                                <Icon name="ph:pencil-simple" class="size-4" />
                                {{ $t('surveys.fillInternally') }}
                            </FormButton>
                        </div>
                    </div>

                    <div class="table-responsive" v-else>
                        <Table :columnHeaders="state.columnHeaders" :data="{ data: state.assignments }"
                            :isLoading="state.isTableLoading" :sortData="state.sortData">
                            <template #body v-if="!(state.isTableLoading || state.assignments.length === 0)">
                                <tr v-for="(a, index) in state.assignments" :key="index">
                                    <td><p>{{ a?.citizen?.firstname }} {{ a?.citizen?.lastname }}</p></td>
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
                                                v-if="scoreLabel(a?.score, state.survey?.score_ranges)">
                                                {{ scoreLabel(a?.score, state.survey?.score_ranges) }}
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
                </div>
            </LoadingSpinner>

            <Modal size="md"
                :title="state.citizenModal.mode === 'send' ? $t('surveys.sendToCitizen') : $t('surveys.fillInternally')"
                :show="state.citizenModal.isOpen" @close="state.citizenModal.isOpen = false">
                <template #modal-body>
                    <div class="space-y-5">
                        <div>
                            <FormLabel :label="$t('surveys.selectCitizen')" />
                            <FormSelect id="assignment_citizen" v-model="state.citizenModal.citizenUuid"
                                :options="state.citizenOptions" :searchable="true" :canClear="false" />
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" @click="state.citizenModal.isOpen = false">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" :disabled="!state.citizenModal.citizenUuid"
                                @click="confirmCitizenModal">
                                {{ state.citizenModal.mode === 'send' ? $t('surveys.send') : $t('surveys.startFilling') }}
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
                            <p class="font-semibold">
                                {{ state.answersModal.assignment?.citizen?.firstname }}
                                {{ state.answersModal.assignment?.citizen?.lastname }}
                            </p>
                            <span class="text-sm bg-gray-100 rounded-md px-3 py-1"
                                v-if="state.answersModal.assignment?.score !== null && state.answersModal.assignment?.score !== undefined">
                                {{ $t('surveys.score') }}:
                                <span class="font-bold">{{ state.answersModal.assignment?.score }}</span>
                                <span v-if="scoreLabel(state.answersModal.assignment?.score, state.survey?.score_ranges)">
                                    · {{ scoreLabel(state.answersModal.assignment?.score, state.survey?.score_ranges) }}
                                </span>
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
import { citizenService } from '@/components/api/user/CitizenService'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any
const router = useRouter()
const surveyUuid = router?.currentRoute?.value?.params?.survey_uuid

watch(() => userStore.getUser, (user: any) => {
    if (user?.uuid && user?.is_surveys_active === false) navigateTo('/apps')
}, { immediate: true })

const state = reactive({
    error: {} as Error,
    survey: null as any,
    assignments: [] as any[],
    citizenOptions: [] as any[],
    columnHeaders: [
        { name: 'surveys.table.citizen', isTranslateName: true },
        { name: 'surveys.table.status', isTranslateName: true },
        { name: 'surveys.table.source', isTranslateName: true },
        { name: 'surveys.table.sent', isTranslateName: true },
        { name: 'surveys.table.completed', isTranslateName: true },
        { name: 'surveys.table.score', isTranslateName: true },
        { name: '' },
    ],
    isPageLoading: false,
    isTableLoading: false,
    citizenModal: { isOpen: false, mode: 'send' as 'send' | 'fill', citizenUuid: null as any },
    answersModal: { isOpen: false, assignment: null as any },
    modal: { isDeleteOpen: false },
    selectedAssignment: {} as any,
    sortData: { sortField: 'created_at', sortOrder: 'ascend' },
})

const completedWithScore = computed(() =>
    state.assignments.filter((a: any) => a.status === 'completed' && a.score !== null && a.completed_at))

const chartOption = computed(() => {
    const byCitizen: Record<string, { label: string, data: any[] }> = {}
    completedWithScore.value.forEach((a: any) => {
        const key = a.citizen?.uuid ?? '-'
        if (!byCitizen[key]) byCitizen[key] = { label: `${a.citizen?.firstname ?? ''} ${a.citizen?.lastname ?? ''}`.trim(), data: [] }
        byCitizen[key].data.push([moment(a.completed_at).format('YYYY-MM-DD HH:mm'), a.score])
    })
    return {
        tooltip: { trigger: 'axis' },
        legend: { bottom: 0, icon: 'roundRect' },
        xAxis: { type: 'time', axisLabel: { fontSize: 11 } },
        yAxis: { name: t('surveys.score'), splitLine: { lineStyle: { type: 'dashed' } } },
        grid: { left: 50, right: 30, top: 30, bottom: 60, containLabel: true },
        series: Object.values(byCitizen).map((s) => ({
            type: 'line', name: s.label,
            data: s.data.sort((x: any, y: any) => x[0].localeCompare(y[0])),
            smooth: true, symbolSize: 8, lineStyle: { width: 3 }, emphasis: { focus: 'series' },
        })),
    }
})

const answerEntries = computed(() => {
    const a = state.answersModal.assignment
    if (!a) return []
    const questions = state.survey?.questions ?? []
    const entries: any[] = []
    questions.forEach((q: any) => {
        const def = q.question ?? q
        const answer = a.answers?.[q.uuid]
        entries.push({ question: def?.value, answer: resolveAnswer(def, answer) })
    })
    return entries
})

function resolveAnswer(def: any, answer: any) {
    if (answer === undefined || answer === null || answer === '') return '-'
    if (def?.type === 'choice') return def?.options?.[answer] ?? '-'
    if (def?.type === 'checkbox' && Array.isArray(answer)) {
        return answer.map((i: any) => def?.options?.[i]).filter(Boolean).join(', ') || '-'
    }
    return String(answer)
}

function scoreLabel(score: any, ranges: any) {
    if (score === null || score === undefined || !Array.isArray(ranges)) return ''
    const hit = ranges.find((r: any) => Number(score) >= Number(r.from) && Number(score) <= Number(r.to) && r.label)
    return hit?.label ?? ''
}

function formatDate(d: any) { return d ? moment(d).format('DD-MM-YYYY HH:mm') : '-' }

onMounted(() => { fetchSurvey(); fetchAssignments(); fetchCitizens() })

async function fetchSurvey() {
    try {
        const response = await surveyService.getSurvey(surveyUuid)
        if (response?.data) state.survey = response.data
    } catch (error: any) { state.error = error }
}

async function fetchAssignments() {
    state.isTableLoading = true
    try {
        const response = await surveyService.getAssignments(surveyUuid)
        if (response?.data) state.assignments = response.data
    } catch (error: any) { state.error = error }
    state.isTableLoading = false
}

async function fetchCitizens() {
    try {
        const response = await citizenService.getAllCitizens({})
        if (response?.data) {
            state.citizenOptions = response.data
                .filter((c: any) => c?.uuid)
                .map((c: any) => ({ value: c?.uuid, label: `${c?.firstname ?? ''} ${c?.lastname ?? ''}`.trim() }))
        }
    } catch (error: any) { state.error = error }
}

function openCitizenModal(mode: 'send' | 'fill') {
    state.citizenModal.mode = mode
    state.citizenModal.citizenUuid = null
    state.citizenModal.isOpen = true
}

async function confirmCitizenModal() {
    if (state.citizenModal.mode === 'fill') {
        navigateTo(`/surveys/${surveyUuid}/fill?citizen_uuid=${state.citizenModal.citizenUuid}`)
        return
    }
    state.isPageLoading = true
    try {
        const response = await surveyService.saveAssignment(surveyUuid, { citizen_uuid: state.citizenModal.citizenUuid })
        if (response?.data) {
            state.citizenModal.isOpen = false
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
        const response = await surveyService.deleteAssignment(surveyUuid, state.selectedAssignment?.uuid)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('surveys.alert.assignmentDeleted')}.`)
            fetchAssignments()
        }
    } catch (error: any) { state.error = error }
    state.isTableLoading = false
}
</script>
