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
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
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
                    <FormButton buttonStyle="action" @click="openFormModal('send')">
                        <Icon name="ph:paper-plane-tilt" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('forms.assignments.sendToCitizen') }}
                    </FormButton>
                    <FormButton buttonStyle="action" @click="openFormModal('fill')">
                        <Icon name="ph:pencil-simple" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('forms.assignments.fillInternally') }}
                    </FormButton>
                </div>

                <LoadingSpinner :isActive="state.isPageLoading">
                    <!-- Score graph -->
                    <div class="px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg mb-5"
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
                                        <p class="font-medium">{{ assignment?.form?.title }}</p>
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
                                                v-if="scoreLabel(assignment?.score, assignment?.form?.score_ranges)">
                                                {{ scoreLabel(assignment?.score, assignment?.form?.score_ranges) }}
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
                </LoadingSpinner>
            </div>

            <!-- Form picker modal (send / fill internally) -->
            <Modal size="md"
                :title="state.formModal.mode === 'send' ? $t('forms.assignments.sendToCitizen') : $t('forms.assignments.fillInternally')"
                :show="state.formModal.isOpen" @close="state.formModal.isOpen = false">
                <template #modal-body>
                    <div class="space-y-5">
                        <Alert type="warning" :text="$t('forms.assignments.uploadFieldWarning')"
                            v-if="state.formModal.hasUploadFields" />
                        <div>
                            <FormLabel :label="$t('forms.assignments.selectForm')" />
                            <FormSelect id="assignment_form" v-model="state.formModal.formUuid"
                                :options="state.formOptions" :searchable="true" :canClear="false" />
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" @click="state.formModal.isOpen = false">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" :disabled="!state.formModal.formUuid"
                                @click="confirmFormModal">
                                <span v-if="state.formModal.mode === 'send'">
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
                            <p class="font-semibold">{{ state.answersModal.assignment?.form?.title }}</p>
                            <span class="text-sm bg-gray-100 rounded-md px-3 py-1"
                                v-if="state.answersModal.assignment?.score !== null && state.answersModal.assignment?.score !== undefined">
                                {{ $t('forms.assignments.score') }}:
                                <span class="font-bold">{{ state.answersModal.assignment?.score }}</span>
                                <span v-if="scoreLabel(state.answersModal.assignment?.score, state.answersModal.assignment?.form?.score_ranges)">
                                    · {{ scoreLabel(state.answersModal.assignment?.score, state.answersModal.assignment?.form?.score_ranges) }}
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
import { useCustomPagesStore } from '@/store/custom-pages'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
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
    if (user?.uuid && !user?.is_surveys_active) {
        navigateTo('/apps')
    }
}, { immediate: true })

const breadcrumbLinks = [
    {
        name: 'citizens.tabs.surveys',
        translate: true,
        href: `/citizens/${citizenUuid}/surveys`,
    },
]

const state = reactive({
    error: {} as Error,
    assignments: [] as any[],
    formOptions: [] as any[],
    columnHeaders: [
        { name: 'forms.assignments.table.form', isTranslateName: true },
        { name: 'forms.assignments.table.status', isTranslateName: true },
        { name: 'forms.assignments.table.source', isTranslateName: true },
        { name: 'forms.assignments.table.sent', isTranslateName: true },
        { name: 'forms.assignments.table.completed', isTranslateName: true },
        { name: 'forms.assignments.table.score', isTranslateName: true },
        { name: '' },
    ],
    isPageLoading: false,
    isTableLoading: false,
    formModal: {
        isOpen: false,
        mode: 'send' as 'send' | 'fill',
        formUuid: null as any,
        hasUploadFields: false,
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
        sortOrder: 'descend',
    },
})

const completedWithScore = computed(() =>
    state.assignments.filter((a: any) => a.status === 'completed' && a.score !== null && a.completed_at)
)

const chartOption = computed(() => {
    const byForm: Record<string, any[]> = {}
    completedWithScore.value.forEach((a: any) => {
        const name = a.form?.title ?? '-'
        if (!byForm[name]) byForm[name] = []
        byForm[name].push([moment(a.completed_at).format('YYYY-MM-DD HH:mm'), a.score])
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
        series: Object.entries(byForm).map(([name, data]) => ({
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
    const fields = assignment.form?.form_fields ?? []
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
    fetchAssignments()
    fetchForms()
})

async function fetchAssignments() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await formAssignmentService.getCitizenAssignments(citizenUuid)
        if (response?.data) {
            state.assignments = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function fetchForms() {
    state.error = {}
    try {
        const response = await formService.getAllForms()
        if (response?.data) {
            state.formOptions = response.data
                .filter((form: any) => form?.uuid)
                .map((form: any) => ({
                    value: form?.uuid,
                    label: form?.title,
                }))
        }
    } catch (error: any) {
        state.error = error
    }
}

function openFormModal(mode: 'send' | 'fill') {
    state.formModal.mode = mode
    state.formModal.formUuid = null
    state.formModal.hasUploadFields = false
    state.formModal.isOpen = true
}

// Citizens cannot answer upload fields in surveys, so warn before sending
watch(() => state.formModal.formUuid, async (formUuid: any) => {
    state.formModal.hasUploadFields = false
    if (!formUuid) return
    try {
        const response = await formService.getForm(formUuid)
        state.formModal.hasUploadFields = (response?.data?.form_fields ?? []).some((formField: any) => {
            try {
                return JSON.parse(formField.field)?.type === 'uploadfile'
            } catch {
                return false
            }
        })
    } catch {
        // Warning only; sending still works
    }
})

async function confirmFormModal() {
    if (state.formModal.mode === 'fill') {
        navigateTo(`/forms/${state.formModal.formUuid}/fill?citizen_uuid=${citizenUuid}`)
        return
    }
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await formAssignmentService.saveAssignment(state.formModal.formUuid, {
            citizen_uuid: citizenUuid,
        })
        if (response?.data) {
            state.formModal.isOpen = false
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
        const response = await formAssignmentService.deleteAssignment(
            state.selectedAssignment?.form?.uuid, state.selectedAssignment?.uuid)
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
