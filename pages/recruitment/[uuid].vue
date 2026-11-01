<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ state.case?.title || $t('recruitment.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ state.case?.title || $t('recruitment.title') }}</template>

            <div class="space-y-6">
                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

                <div v-if="state.case" class="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div class="space-y-6 lg:col-span-2">
                        <!-- The case itself -->
                        <section class="rounded-lg border border-gray-200 bg-white p-5">
                            <div class="flex flex-wrap items-start justify-between gap-3">
                                <div class="flex flex-wrap items-center gap-2">
                                    <span class="rounded-full bg-surface-100 px-2.5 py-[3px] text-[11.5px] font-bold text-slate-600">
                                        {{ $t('recruitment.types.' + state.case.type) }}
                                    </span>
                                    <span class="rounded-full px-2.5 py-[3px] text-[11.5px] font-bold"
                                        :class="statusClass(state.case.status)">
                                        {{ $t('recruitment.statuses.' + state.case.status) }}
                                    </span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <FormButton buttonStyle="action" @click="state.isEditOpen = true">
                                        <Icon name="ph:pencil-simple" class="h-4 w-4" aria-hidden="true" />
                                        {{ $t('recruitment.edit') }}
                                    </FormButton>
                                    <FormButton buttonStyle="action" @click="state.isDeleteOpen = true">
                                        <Icon name="ph:trash" class="h-4 w-4" aria-hidden="true" />
                                        {{ $t('recruitment.delete') }}
                                    </FormButton>
                                </div>
                            </div>

                            <dl class="mt-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                                <div>
                                    <dt class="text-xs font-semibold text-slate-500">{{ $t('recruitment.fields.citizen') }}</dt>
                                    <dd class="mt-0.5">
                                        <NuxtLink v-if="state.case.citizen" :to="`/citizens/${state.case.citizen.uuid}/contacts`"
                                            class="font-semibold text-secondary hover:underline">
                                            {{ personName(state.case.citizen) }}
                                        </NuxtLink>
                                        <span v-else class="text-slate-400">{{ $t('recruitment.none') }}</span>
                                    </dd>
                                </div>
                                <div>
                                    <dt class="text-xs font-semibold text-slate-500">{{ $t('recruitment.fields.inquiry') }}</dt>
                                    <dd class="mt-0.5">
                                        <NuxtLink v-if="state.case.inquiry" :to="`/inquiries/${state.case.inquiry.uuid}`"
                                            class="font-semibold text-secondary hover:underline">
                                            {{ state.case.inquiry.inquirer_name || $t('recruitment.openInquiry') }}
                                        </NuxtLink>
                                        <span v-else class="text-slate-400">{{ $t('recruitment.none') }}</span>
                                    </dd>
                                </div>
                                <div>
                                    <dt class="text-xs font-semibold text-slate-500">{{ $t('recruitment.fields.responsible') }}</dt>
                                    <dd class="mt-0.5">{{ personName(state.case.responsible) || $t('recruitment.none') }}</dd>
                                </div>
                                <div>
                                    <dt class="text-xs font-semibold text-slate-500">{{ $t('recruitment.fields.createdBy') }}</dt>
                                    <dd class="mt-0.5">
                                        {{ personName(state.case.created_by) || $t('recruitment.none') }},
                                        {{ formatDateToReadable(state.case.created_at) }}
                                    </dd>
                                </div>
                                <div class="sm:col-span-2" v-if="state.case.needs">
                                    <dt class="text-xs font-semibold text-slate-500">{{ $t('recruitment.fields.needs') }}</dt>
                                    <dd class="mt-0.5 whitespace-pre-line">{{ state.case.needs }}</dd>
                                </div>
                                <div class="sm:col-span-2" v-if="state.case.requirements">
                                    <dt class="text-xs font-semibold text-slate-500">{{ $t('recruitment.fields.requirements') }}</dt>
                                    <dd class="mt-0.5 whitespace-pre-line">{{ state.case.requirements }}</dd>
                                </div>
                            </dl>
                        </section>

                        <!-- How it ended, or the actions that end it -->
                        <section class="rounded-lg border border-gray-200 bg-white p-5">
                            <h2 class="text-sm font-semibold text-gray-900">{{ $t('recruitment.outcome') }}</h2>

                            <div v-if="state.case.status === 'open'" class="mt-3 space-y-3">
                                <p class="text-sm text-slate-500">{{ $t('recruitment.openHint') }}</p>
                                <div class="flex flex-wrap gap-2">
                                    <FormButton buttonStyle="primary" @click="state.isSearchOpen = !state.isSearchOpen">
                                        <Icon name="ph:user-focus" class="h-4 w-4" aria-hidden="true" />
                                        {{ $t('recruitment.chooseConsultant') }}
                                    </FormButton>
                                    <FormButton buttonStyle="action" @click="openNotSolved">
                                        {{ $t('recruitment.closeNotSolved') }}
                                    </FormButton>
                                </div>
                            </div>

                            <div v-else class="mt-3 space-y-2 text-sm">
                                <p v-if="state.case.status === 'solved'">
                                    {{ $t('recruitment.solvedWith', {
                                        name: personName(state.case.chosen_consultant) || $t('recruitment.none'),
                                        date: formatDateToReadable(state.case.solved_at),
                                    }) }}
                                </p>
                                <p v-else>{{ $t('recruitment.closedNotSolved') }}</p>
                                <p v-if="state.case.outcome_note" class="whitespace-pre-line text-slate-600">
                                    {{ state.case.outcome_note }}
                                </p>
                                <FormButton buttonStyle="action" @click="reopen">
                                    {{ $t('recruitment.reopen') }}
                                </FormButton>
                            </div>
                        </section>

                        <!-- The same search as from an inquiry; a result is chosen here. -->
                        <section v-if="state.isSearchOpen && state.case.status === 'open'">
                            <ModulesUserConsultantSearch :pickMode="true" @pick="openChoose" />
                        </section>
                    </div>

                    <!-- History: the case's notes and changes, newest first -->
                    <aside class="space-y-4">
                        <section class="rounded-lg border border-gray-200 bg-white p-5">
                            <h2 class="text-sm font-semibold text-gray-900">{{ $t('recruitment.history') }}</h2>
                            <form class="mt-3 space-y-2" @submit.prevent="addNote">
                                <FormTextArea id="recruitment-note" name="recruitment-note" v-model="state.note"
                                    :placeholder="$t('recruitment.placeholders.note')" :rows="3" />
                                <FormButton type="submit" buttonStyle="primary" :disabled="!state.note.trim() || state.isSavingNote">
                                    {{ $t('recruitment.addNote') }}
                                </FormButton>
                            </form>

                            <ul class="mt-4 space-y-3">
                                <li v-for="entry in state.history" :key="entry.id" class="border-t border-surface-100 pt-3 text-sm">
                                    <p class="text-xs text-slate-500">
                                        {{ personName(entry.causer) || $t('recruitment.system') }},
                                        {{ formatDateTimeToReadable(entry.created_at) }}
                                    </p>
                                    <p v-if="entry.event === 'note'" class="mt-1 whitespace-pre-line text-gray-900">{{ entry.note }}</p>
                                    <p v-else class="mt-1 text-gray-700">{{ historyText(entry) }}</p>
                                </li>
                            </ul>
                        </section>
                    </aside>
                </div>
            </div>

            <ModulesUserRecruitmentModalForm :isModalOpen="state.isEditOpen" :recruitmentCase="state.case"
                @close="state.isEditOpen = false" @saved="afterEdit" />

            <DialogConfirmation :isModalOpen="state.isDeleteOpen" :message="$t('recruitment.deleteConfirm')"
                @close="state.isDeleteOpen = false" @confirm="deleteCase" />

            <!-- Choosing the consultant solves the case. On a case with a citizen
                 the consultant can go onto the indsats in the same step. -->
            <Modal size="md" :title="$t('recruitment.chooseTitle')" :show="!!state.picked" @close="state.picked = null">
                <template #modal-body>
                    <form class="space-y-4" @submit.prevent="confirmChoose">
                        <p class="text-sm text-gray-700">
                            {{ $t('recruitment.chooseText', { name: personName(state.picked) }) }}
                        </p>
                        <label v-if="state.case?.citizen" class="flex cursor-pointer items-start gap-2 text-sm"
                            @click.prevent="state.addToCitizen = !state.addToCitizen">
                            <FormCheckbox :value="state.addToCitizen" />
                            <span>{{ $t('recruitment.addToCitizen', { name: personName(state.case.citizen) }) }}</span>
                        </label>
                        <div class="space-y-1">
                            <FormLabel for="recruitment-choose-note" :label="$t('recruitment.fields.outcomeNote')" />
                            <FormTextArea id="recruitment-choose-note" name="recruitment-choose-note" v-model="state.outcomeNote"
                                :placeholder="$t('recruitment.placeholders.outcomeNote')" :rows="3" />
                        </div>
                        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <FormButton type="button" buttonStyle="cancel" @click="state.picked = null">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary" :disabled="state.isSaving">
                                {{ $t('recruitment.chooseConsultant') }}
                            </FormButton>
                        </div>
                    </form>
                </template>
            </Modal>

            <Modal size="md" :title="$t('recruitment.closeNotSolved')" :show="state.isNotSolvedOpen"
                @close="state.isNotSolvedOpen = false">
                <template #modal-body>
                    <form class="space-y-4" @submit.prevent="confirmNotSolved">
                        <div class="space-y-1">
                            <FormLabel for="recruitment-not-solved-note" :label="$t('recruitment.fields.outcomeNote')" />
                            <FormTextArea id="recruitment-not-solved-note" name="recruitment-not-solved-note"
                                v-model="state.outcomeNote" :placeholder="$t('recruitment.placeholders.notSolvedNote')" :rows="3" />
                        </div>
                        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <FormButton type="button" buttonStyle="cancel" @click="state.isNotSolvedOpen = false">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary" :disabled="state.isSaving">
                                {{ $t('recruitment.closeNotSolved') }}
                            </FormButton>
                        </div>
                    </form>
                </template>
            </Modal>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
/**
 * One recruitment case: what is needed, how it ended, and its history. Open,
 * it is solved by choosing a consultant from the consultant search.
 */
import { recruitmentCaseService } from '@/components/api/user/RecruitmentCaseService'
import { useAlert } from '@/composables/alert'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

definePageMeta({ middleware: 'require-page', requiredPage: 'Inquiries', requiredCompanyFlag: 'inquiry_pipeline_enabled' })

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { successAlert } = useAlert()
const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()

const caseUuid = route.params.uuid as string

const breadcrumbLinks = [
    { name: 'recruitment.title', translate: true, href: '/recruitment' },
]

const state = reactive({
    error: {} as Error,
    case: null as any,
    history: [] as any[],
    note: '',
    outcomeNote: '',
    addToCitizen: true,
    picked: null as any,
    isEditOpen: false,
    isDeleteOpen: false,
    isNotSolvedOpen: false,
    isSearchOpen: false,
    isSaving: false,
    isSavingNote: false,
})

function personName(person: any): string {
    return person ? `${person.firstname ?? ''} ${person.lastname ?? ''}`.trim() : ''
}

function statusClass(status: string): string {
    if (status === 'solved') return 'bg-[#e6f4ee] text-[#1f7a55]'
    if (status === 'not_solved') return 'bg-surface-100 text-slate-600'
    return 'bg-[#eef6fb] text-secondary'
}

// A change in words: the status and type by value, the rest by field name.
function historyText(entry: any): string {
    if (entry.event === 'created') return t('recruitment.historyCreated')
    const status = entry.changes?.find((change: any) => change.field === 'status')
    if (status) {
        return t('recruitment.historyStatus', {
            from: status.old ? t('recruitment.statuses.' + status.old) : '',
            to: t('recruitment.statuses.' + status.new),
        })
    }
    const fields = (entry.changes ?? [])
        .map((change: any) => t('recruitment.changedFields.' + change.field))
        .join(', ')
    return t('recruitment.historyUpdated', { fields })
}

async function fetchCase() {
    state.error = {}
    try {
        const [caseResponse, historyResponse] = await Promise.all([
            recruitmentCaseService.getCase(caseUuid),
            recruitmentCaseService.getHistory(caseUuid),
        ])
        state.case = caseResponse?.data ?? null
        state.history = historyResponse?.data ?? []
    } catch (error: any) {
        state.error = error
    }
}

async function fetchHistory() {
    try {
        state.history = (await recruitmentCaseService.getHistory(caseUuid))?.data ?? []
    } catch (error: any) {
        state.error = error
    }
}

async function addNote() {
    if (!state.note.trim()) return
    state.isSavingNote = true
    try {
        state.history = (await recruitmentCaseService.addNote(caseUuid, state.note))?.data ?? state.history
        state.note = ''
    } catch (error: any) {
        state.error = error
    }
    state.isSavingNote = false
}

function afterEdit(updated: any) {
    state.isEditOpen = false
    if (updated) state.case = updated
    fetchHistory()
}

async function deleteCase() {
    try {
        await recruitmentCaseService.deleteCase(caseUuid)
        router.push('/recruitment')
    } catch (error: any) {
        state.error = error
    }
    state.isDeleteOpen = false
}

function openChoose(consultant: any) {
    state.picked = consultant
    state.outcomeNote = ''
    // Re-match is for a running indsats, so the consultant goes onto it by default.
    state.addToCitizen = state.case?.type === 'rematch'
}

async function confirmChoose() {
    if (!state.picked) return
    state.isSaving = true
    try {
        const response = await recruitmentCaseService.chooseConsultant(caseUuid, {
            consultant_uuid: state.picked.uuid,
            add_to_citizen: !!state.case?.citizen && state.addToCitizen,
            outcome_note: state.outcomeNote || null,
        })
        state.case = response?.data ?? state.case
        state.picked = null
        state.isSearchOpen = false
        successAlert(t('alert.success'), response?.added_to_citizen ? t('recruitment.solvedAndAdded') : t('recruitment.solved'))
        fetchHistory()
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

function openNotSolved() {
    state.outcomeNote = ''
    state.isNotSolvedOpen = true
}

async function confirmNotSolved() {
    await setStatus('not_solved', state.outcomeNote || null)
    state.isNotSolvedOpen = false
}

async function reopen() {
    await setStatus('open')
}

async function setStatus(status: 'open' | 'not_solved', outcomeNote?: string | null) {
    state.isSaving = true
    try {
        const payload = outcomeNote === undefined ? { status } : { status, outcome_note: outcomeNote }
        const response = await recruitmentCaseService.updateStatus(caseUuid, payload)
        state.case = response?.data ?? state.case
        fetchHistory()
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

onMounted(fetchCase)
</script>
