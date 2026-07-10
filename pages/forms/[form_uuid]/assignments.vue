<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('forms.assignments.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('forms.assignments.title') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/forms">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 class="text-lg font-semibold">{{ state.form?.data?.title }}</h3>
                            <p class="text-sm text-gray-500">{{ state.form?.data?.description }}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <FormButton type="button" buttonStyle="action" @click="openCitizenModal('send')">
                                <Icon name="ph:paper-plane-tilt" class="size-4" />
                                {{ $t('forms.assignments.sendToCitizen') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="action" @click="openCitizenModal('fill')">
                                <Icon name="ph:pencil-simple" class="size-4" />
                                {{ $t('forms.assignments.fillInternally') }}
                            </FormButton>
                        </div>
                    </div>

                    <!-- Score graph -->
                    <div class="px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg"
                        v-if="completedWithScore.length > 0">
                        <h3 class="text-md font-semibold mb-3">{{ $t('forms.assignments.scoreOverTime') }}</h3>
                        <VChart :option="chartOption" style="height: 400px; width: 100%;" />
                    </div>

                    <!-- Assignments table -->
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="{ data: state.assignments }"
                            :isLoading="state.isTableLoading" :sortData="state.sortData">
                            <template #body v-if="!(state.isTableLoading || state.assignments.length === 0)">
                                <tr v-for="(assignment, index) in state.assignments" :key="index">
                                    <td>
                                        <p>{{ assignment?.citizen?.firstname }} {{ assignment?.citizen?.lastname }}</p>
                                    </td>
                                    <td>
                                        <span class="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full"
                                            :class="assignment?.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
                                            {{ assignment?.status === 'completed'
                                                ? $t('forms.assignments.status.completed')
                                                : $t('forms.assignments.status.pending') }}
                                        </span>
                                    </td>
                                    <td>
                                        <p>{{ assignment?.source === 'internal'
                                            ? $t('forms.assignments.source.internal')
                                            : $t('forms.assignments.source.citizen') }}</p>
                                    </td>
                                    <td>
                                        <p>{{ formatDate(assignment?.created_at) }}</p>
                                    </td>
                                    <td>
                                        <p>{{ assignment?.completed_at ? formatDate(assignment?.completed_at) : '-' }}
                                        </p>
                                    </td>
                                    <td>
                                        <p class="font-semibold">
                                            {{ assignment?.score ?? '-' }}
                                            <span class="block text-xs font-normal text-gray-500"
                                                v-if="scoreLabel(assignment?.score, state.form?.data?.score_ranges)">
                                                {{ scoreLabel(assignment?.score, state.form?.data?.score_ranges) }}
                                            </span>
                                        </p>
                                    </td>
                                    <td>
                                        <div class="flex items-center justify-end gap-2">
                                            <FormButton v-if="assignment?.status === 'completed'" type="button"
                                                buttonStyle="action" @click="openAnswers(assignment)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('forms.assignments.viewAnswers') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action"
                                                @click="deleteConfirmation(assignment)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('forms.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                </div>
            </LoadingSpinner>

            <!-- Citizen picker modal (send / fill internally) -->
            <Modal size="md"
                :title="state.citizenModal.mode === 'send' ? $t('forms.assignments.sendToCitizen') : $t('forms.assignments.fillInternally')"
                :show="state.citizenModal.isOpen" @close="state.citizenModal.isOpen = false">
                <template #modal-body>
                    <div class="space-y-5">
                        <div>
                            <FormLabel :label="$t('forms.assignments.selectCitizen')" />
                            <FormSelect id="assignment_citizen" v-model="state.citizenModal.citizenUuid"
                                :options="state.citizenOptions" :searchable="true" :canClear="false" />
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel"
                                @click="state.citizenModal.isOpen = false">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" :disabled="!state.citizenModal.citizenUuid"
                                @click="confirmCitizenModal">
                                <span v-if="state.citizenModal.mode === 'send'">
                                    {{ $t('forms.assignments.send') }}
                                </span>
                                <span v-else>{{ $t('forms.assignments.startFilling') }}</span>
                            </FormButton>
                        </div>
                    </div>
                </template>
            </Modal>

            <!-- Answers modal -->
            <Modal size="lg" :title="$t('forms.assignments.answers')" :show="state.answersModal.isOpen"
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
                                {{ $t('forms.assignments.score') }}:
                                <span class="font-bold">{{ state.answersModal.assignment?.score }}</span>
                                <span v-if="scoreLabel(state.answersModal.assignment?.score, state.form?.data?.score_ranges)">
                                    · {{ scoreLabel(state.answersModal.assignment?.score, state.form?.data?.score_ranges) }}
                                </span>
                            </span>
                        </div>
                        <div v-for="(entry, index) in answerEntries" :key="index"
                            class="bg-gray-50 rounded-md p-4 space-y-1">
                            <p class="text-sm text-gray-500">{{ index + 1 }}. {{ entry.question }}</p>
                            <p class="font-medium">{{ entry.answer }}</p>
                        </div>
                    </div>
                </template>
            </Modal>

            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="$t('forms.assignments.confirmation.deleteAssignment') + '?'"
                @close="state.modal.isDeleteOpen = false" @confirm="deleteAssignment" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { formService } from '@/components/api/user/FormService'
import { formAssignmentService } from '@/components/api/user/FormAssignmentService'
import { citizenService } from '@/components/api/user/CitizenService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any
const router = useRouter()

watch(() => userStore.getUser, (user: any) => {
    if (user?.uuid && !user?.is_surveys_active) {
        navigateTo('/apps')
    }
}, { immediate: true })
const formUuid = router?.currentRoute?.value?.params?.form_uuid
const breadcrumbLinks = [
    {
        name: 'forms.forms',
        translate: true,
        href: '/forms',
    },
    {
        name: 'forms.assignments.title',
        translate: true,
        href: `/forms/${formUuid}/assignments`,
    },
]

const state = reactive({
    error: {} as Error,
    form: [] as any,
    assignments: [] as any[],
    citizenOptions: [] as any[],
    columnHeaders: [
        { name: 'forms.assignments.table.citizen', isTranslateName: true },
        { name: 'forms.assignments.table.status', isTranslateName: true },
        { name: 'forms.assignments.table.source', isTranslateName: true },
        { name: 'forms.assignments.table.sent', isTranslateName: true },
        { name: 'forms.assignments.table.completed', isTranslateName: true },
        { name: 'forms.assignments.table.score', isTranslateName: true },
        { name: '' },
    ],
    isPageLoading: false,
    isTableLoading: false,
    citizenModal: {
        isOpen: false,
        mode: 'send' as 'send' | 'fill',
        citizenUuid: null as any,
    },
    answersModal: {
        isOpen: false,
        assignment: null as any,
    },
    modal: {
        isDeleteOpen: false,
    },
    selectedAssignment: {} as any,
    sortData: {
        sortField: 'created_at',
        sortOrder: 'ascend',
    },
})

const completedWithScore = computed(() =>
    state.assignments.filter((a: any) => a.status === 'completed' && a.score !== null && a.completed_at)
)

const chartOption = computed(() => {
    const byCitizen: Record<string, any[]> = {}
    completedWithScore.value.forEach((a: any) => {
        const name = `${a.citizen?.firstname ?? ''} ${a.citizen?.lastname ?? ''}`.trim()
        if (!byCitizen[name]) byCitizen[name] = []
        byCitizen[name].push([moment(a.completed_at).format('YYYY-MM-DD HH:mm'), a.score])
    })
    return {
        tooltip: { trigger: 'axis' },
        legend: { bottom: 0, icon: 'roundRect' },
        xAxis: { type: 'time', axisLabel: { fontSize: 11 } },
        yAxis: {
            name: t('forms.assignments.score'),
            splitLine: { lineStyle: { type: 'dashed' } },
        },
        grid: { left: 50, right: 30, top: 30, bottom: 60, containLabel: true },
        series: Object.entries(byCitizen).map(([name, data]) => ({
            type: 'line',
            name,
            data: data.sort((x: any, y: any) => x[0].localeCompare(y[0])),
            smooth: true,
            symbolSize: 8,
            lineStyle: { width: 3 },
            emphasis: { focus: 'series' },
        })),
    }
})

const answerEntries = computed(() => {
    const assignment = state.answersModal.assignment
    if (!assignment) return []
    const fields = state.form?.data?.form_fields ?? []
    const entries: any[] = []
    fields.forEach((formField: any) => {
        let field: any = null
        try {
            field = JSON.parse(formField.field)
        } catch {
            return
        }
        if (field?.type === 'uploadfile') return
        const answer = assignment.answers?.[formField.uuid]
        entries.push({
            question: field?.value,
            answer: resolveAnswer(field, answer),
        })
    })
    return entries
})

function resolveAnswer(field: any, answer: any) {
    if (answer === undefined || answer === null || answer === '') return '-'
    if (field?.type === 'choice') return field?.options?.[answer] ?? '-'
    if (field?.type === 'checkbox' && Array.isArray(answer)) {
        return answer.map((index: any) => field?.options?.[index]).filter(Boolean).join(', ') || '-'
    }
    return String(answer)
}

function scoreLabel(score: any, ranges: any) {
    if (score === null || score === undefined || !Array.isArray(ranges)) return ''
    const hit = ranges.find((range: any) =>
        Number(score) >= Number(range.from) && Number(score) <= Number(range.to) && range.label)
    return hit?.label ?? ''
}

function formatDate(date: any) {
    return date ? moment(date).format('DD-MM-YYYY HH:mm') : '-'
}

onMounted(() => {
    fetchForm()
    fetchAssignments()
    fetchAllCitizens()
})

async function fetchForm() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await formService.getForm(formUuid)
        if (response) {
            state.form = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAssignments() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await formAssignmentService.getAssignments(formUuid)
        if (response?.data) {
            state.assignments = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function fetchAllCitizens() {
    state.error = {}
    try {
        const response = await citizenService.getAllCitizens({})
        if (response?.data) {
            state.citizenOptions = response.data
                .filter((citizen: any) => citizen?.uuid)
                .map((citizen: any) => ({
                    value: citizen?.uuid,
                    label: `${citizen?.firstname ?? ''} ${citizen?.lastname ?? ''}`.trim(),
                }))
        }
    } catch (error: any) {
        state.error = error
    }
}

function openCitizenModal(mode: 'send' | 'fill') {
    state.citizenModal.mode = mode
    state.citizenModal.citizenUuid = null
    state.citizenModal.isOpen = true
}

async function confirmCitizenModal() {
    if (state.citizenModal.mode === 'fill') {
        navigateTo(`/forms/${formUuid}/fill?citizen_uuid=${state.citizenModal.citizenUuid}`)
        return
    }
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await formAssignmentService.saveAssignment(formUuid, {
            citizen_uuid: state.citizenModal.citizenUuid,
        })
        if (response?.data) {
            state.citizenModal.isOpen = false
            successAlert(`${t('alert.success')}!`, `${t('forms.assignments.alert.surveySent')}.`)
            fetchAssignments()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function openAnswers(assignment: any) {
    state.answersModal.assignment = assignment
    state.answersModal.isOpen = true
}

function deleteConfirmation(assignment: any) {
    state.selectedAssignment = assignment
    state.modal.isDeleteOpen = true
}

async function deleteAssignment() {
    state.error = {}
    state.isTableLoading = true
    state.modal.isDeleteOpen = false
    try {
        const response = await formAssignmentService.deleteAssignment(formUuid, state.selectedAssignment?.uuid)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('forms.assignments.alert.assignmentDeleted')}.`)
            fetchAssignments()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
