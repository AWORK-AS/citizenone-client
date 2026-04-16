<template>
    <div>
        <Modal size="4xl" :title="modalTitle()" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="flex justify-end items-center mb-5">
                        <FormButton buttonStyle="action" class="rounded-lg"
                            @click="state.modal.isAddMedicineHistoryOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('citizens.medicineJournals.history.giveMedicine') }}
                        </FormButton>
                    </div>
                    <div class="space-y-5">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />

                        <!-- PN: pending evaluations banner -->
                        <div v-if="props.selectedMedicine?.is_pn_medicine && pendingEvaluations.length > 0"
                            class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 space-y-2">
                            <div class="flex items-center gap-2">
                                <Icon name="ph:clock" class="size-4 text-amber-600 shrink-0" />
                                <p class="text-sm font-medium text-amber-800">
                                    {{ pendingEvaluations.length }} effektevaluering{{ pendingEvaluations.length > 1 ? 'er' : '' }} afventer
                                </p>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <button v-for="pending in pendingEvaluations" :key="pending.key"
                                    type="button"
                                    @click="openEvaluation(pending)"
                                    class="inline-flex items-center gap-1.5 text-xs bg-white border border-amber-300 text-amber-800 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors font-medium">
                                    <Icon name="ph:clock" class="size-3" />
                                    Evaluér kl. {{ pending.evalTime }} — {{ pending.medicineName }}
                                </button>
                            </div>
                        </div>

                        <!-- PN: Timeline view -->
                        <div v-if="props.selectedMedicine?.is_pn_medicine" class="space-y-3">
                            <div v-if="state.isTableLoading" class="flex justify-center py-8">
                                <Icon name="ph:spinner" class="size-6 text-primary animate-spin" />
                            </div>
                            <div v-else-if="!state.medicineHistories?.data?.length"
                                class="border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center py-10 text-sm text-gray-400">
                                Ingen tidligere givninger registreret
                            </div>
                            <div v-else class="space-y-3">
                                <div v-for="(entry, idx) in state.medicineHistories?.data" :key="entry.uuid"
                                    class="rounded-xl border border-gray-200 overflow-hidden">
                                    <!-- Entry header -->
                                    <div class="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                                        <div class="flex items-center gap-3">
                                            <div :class="[
                                                'w-2.5 h-2.5 rounded-full shrink-0',
                                                entry.type === 'given' ? 'bg-green-500' :
                                                entry.type === 'delivered' ? 'bg-primary' :
                                                entry.type === 'deviated' ? 'bg-red-500' : 'bg-gray-300'
                                            ]"></div>
                                            <span class="text-sm font-medium text-gray-800">
                                                {{ formatDateToReadable(entry.date) }}
                                            </span>
                                            <span :class="[
                                                'text-xs px-2 py-0.5 rounded-full font-medium',
                                                entry.type === 'given' ? 'bg-green-100 text-green-700' :
                                                entry.type === 'delivered' ? 'bg-blue-100 text-blue-700' :
                                                entry.type === 'deviated' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                            ]">
                                                {{ getTypeLabel(entry.type) }}
                                            </span>
                                            <span v-if="entry.quantity" class="text-xs text-gray-500">
                                                {{ formatNumber(language.locale.value, entry.quantity) }}
                                                {{ props.selectedMedicine?.dosage?.dk_name ?? '' }}
                                            </span>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <span class="text-xs text-gray-400">
                                                {{ entry.user?.firstname }} {{ entry.user?.lastname }}
                                            </span>
                                            <button type="button"
                                                class="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                                                @click="editMedicineHistory(entry)">
                                                <Icon name="ph:pencil-simple" class="size-3.5" />
                                            </button>
                                            <button type="button"
                                                class="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500"
                                                @click="confirmMedicineDeletion(entry)">
                                                <Icon name="ph:trash" class="size-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div class="px-4 py-3 space-y-3">
                                        <!-- Comment -->
                                        <p v-if="entry.comment" class="text-xs text-gray-500 italic">
                                            "{{ entry.comment }}"
                                        </p>

                                        <!-- Evaluator -->
                                        <div v-if="entry.evaluator?.firstname" class="flex items-center gap-1.5 text-xs text-gray-500">
                                            <Icon name="ph:user" class="size-3" />
                                            Evaluator: {{ entry.evaluator.firstname }} {{ entry.evaluator.lastname }}
                                        </div>

                                        <!-- Pending evaluations -->
                                        <div v-if="entry.evaluation_frequency?.length > 0" class="space-y-2">
                                            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Effektevaluering</p>
                                            <div class="flex flex-wrap gap-2">
                                                <div v-for="evalTime in entry.evaluation_frequency" :key="evalTime"
                                                    class="flex items-center gap-1.5">
                                                    <!-- Check if already evaluated at this time -->
                                                    <template v-if="isEvaluated(entry, evalTime)">
                                                        <div class="inline-flex items-center gap-1.5 text-xs bg-green-50 border border-green-200 text-green-700 px-2.5 py-1.5 rounded-lg">
                                                            <Icon name="ph:check-circle" class="size-3" />
                                                            Evalueret kl. {{ evalTime }}
                                                        </div>
                                                    </template>
                                                    <template v-else>
                                                        <button type="button"
                                                            @click="openEvaluation({ evalTime, medicineName: getEntryMedicineName(), entry })"
                                                            class="inline-flex items-center gap-1.5 text-xs bg-amber-50 border border-amber-300 text-amber-800 px-2.5 py-1.5 rounded-lg hover:bg-amber-100 transition-colors font-medium">
                                                            <Icon name="ph:clock" class="size-3" />
                                                            Evaluér kl. {{ evalTime }}
                                                        </button>
                                                    </template>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Completed evaluations -->
                                        <div v-if="getEvaluations(entry).length > 0" class="space-y-2">
                                            <div v-for="(evaluation, eIdx) in getEvaluations(entry)" :key="eIdx"
                                                class="bg-gray-50 rounded-lg px-3 py-2.5 space-y-1">
                                                <div class="flex items-center justify-between">
                                                    <span class="text-xs font-medium text-gray-600">
                                                        Effektevaluering kl. {{ evaluation.time ?? evaluation.evaluated_at }}
                                                    </span>
                                                    <span class="text-xs text-gray-400">{{ evaluation.evaluator ?? (evaluation.user ? evaluation.user.firstname + ' ' + (evaluation.user.lastname ?? '') : '') }}</span>
                                                </div>
                                                <p class="text-xs text-gray-700">{{ evaluation.comment }}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Pagination :data="state.medicineHistories" @previous="previous" @next="next" />

                        <!-- All evaluations section -->
                        <div v-if="state.apiEvaluations.length > 0" class="mt-4">
                            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Alle effektevalueringer</p>
                            <div class="space-y-2">
                                <div v-for="ev in state.apiEvaluations" :key="ev.uuid"
                                    class="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
                                    <div class="flex items-center justify-between mb-1">
                                        <span class="text-xs font-medium text-blue-800">
                                            <Icon name="ph:stethoscope" class="size-3 inline mr-1" />
                                            Effektevaluering
                                        </span>
                                        <span class="text-xs text-gray-400">
                                            {{ ev.user ? ev.user.firstname + ' ' + (ev.user.lastname ?? '') : 'Ukendt' }} · {{ formatDateTimeToReadable(ev.created_at) }}
                                        </span>
                                    </div>
                                    <p class="text-xs text-gray-700">{{ ev.evaluation }}</p>
                                </div>
                            </div>
                        </div>
                        </div>

                        <!-- Regular medicine: original table view -->
                        <div v-else>
                            <div class="table-responsive">
                                <Table :columnHeaders="state.columnHeaders" :data="state.medicineHistories"
                                    :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                                    <template #body
                                        v-if="!(state.isTableLoading || (state.medicineHistories?.data?.length === 0))">
                                        <tr v-for="(medicineHistory, index) in state.medicineHistories?.data" :key="index">
                                            <td width="20%">
                                                <span class="truncate">{{ formatDateToReadable(medicineHistory?.date) }}</span>
                                            </td>
                                            <td width="5%">
                                                <p>{{ formatNumber(language.locale.value, medicineHistory?.quantity) }}</p>
                                            </td>
                                            <td width="10%">
                                                <span v-if="medicineHistory?.type === 'delivered'">{{ $t('citizens.medicineJournals.history.table.type.delivered') }}</span>
                                                <span v-if="medicineHistory?.type === 'deviated'">{{ $t('citizens.medicineJournals.history.table.type.deviated') }}</span>
                                                <span v-if="medicineHistory?.type === 'given'">{{ customPagesStore.getCustomPagesName?.giveMedicine }}</span>
                                            </td>
                                            <td width="15%">
                                                <span class="truncate">{{ medicineHistory?.user?.firstname }} {{ medicineHistory?.user?.lastname }}</span>
                                            </td>
                                            <td width="15%">
                                                <p>{{ medicineHistory?.comment }}</p>
                                            </td>
                                            <td width="10%">
                                                <span class="truncate">{{ formatDateTimeToReadable(medicineHistory?.created_at) }}</span>
                                            </td>
                                            <td width="10%">
                                                <div class="flex items-end gap-2">
                                                    <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                        @click="editMedicineHistory(medicineHistory)">
                                                        <Icon name="ph:pencil-simple" class="size-4" />
                                                        {{ $t('citizens.medicineJournals.table.actions.edit') }}
                                                    </FormButton>
                                                    <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                        @click="confirmMedicineDeletion(medicineHistory)">
                                                        <Icon name="ph:trash-duotone" class="size-4" />
                                                        {{ $t('citizens.medicineJournals.table.actions.delete') }}
                                                    </FormButton>
                                                </div>
                                            </td>
                                        </tr>
                                    </template>
                                </Table>
                            </div>
                            <Pagination :data="state.medicineHistories" @previous="previous" @next="next" />
                        </div>
                    </div>

                    <!-- Evaluation modal via Teleport to bypass z-index stacking -->
                    <Teleport to="body">
                    <div v-if="state.activeEvaluation"
                        style="position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);">
                        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                            <div class="bg-primary text-white px-5 py-4 flex items-center justify-between">
                                <div>
                                    <p class="font-semibold text-sm">Registrér effektevaluering</p>
                                    <p class="text-xs opacity-75 mt-0.5">
                                        Planlagt kl. {{ state.activeEvaluation.evalTime }} · {{ state.activeEvaluation.medicineName }}
                                    </p>
                                </div>
                                <button type="button" @click="state.activeEvaluation = null" class="opacity-70 hover:opacity-100">
                                    <Icon name="ph:x" class="size-5" />
                                </button>
                            </div>
                            <div class="p-5 space-y-4">
                                <div class="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                                    <p class="text-xs text-blue-700">
                                        Beskriv borgerens reaktion og effekt af medicinen siden den blev givet.
                                    </p>
                                </div>
                                <div class="space-y-1">
                                    <label class="text-sm font-medium text-gray-700">Observation</label>
                                    <textarea v-model="state.evalComment" rows="4"
                                        placeholder="Fx: God smertelindring efter 45 min. Borger angiver smerteniveau 3/10 mod tidligere 8/10..."
                                        class="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary resize-none bg-gray-50"></textarea>
                                </div>
                                <div class="grid grid-cols-2 gap-3">
                                    <button type="button" @click="state.activeEvaluation = null"
                                        class="text-sm border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors text-gray-600">
                                        Annuller
                                    </button>
                                    <button type="button" @click="saveEvaluation"
                                        :disabled="!state.evalComment.trim() || state.isSavingEval"
                                        class="text-sm bg-primary text-white rounded-xl py-2.5 hover:bg-primary/90 transition-colors font-medium disabled:opacity-50">
                                        {{ state.isSavingEval ? 'Gemmer...' : 'Gem evaluering' }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    </Teleport>

                    <ModulesUserCitizenMedicineHistoryModalNew :isModalOpen="state.modal.isAddMedicineHistoryOpen"
                        :selectedMedicine="props.selectedMedicine" @close="state.modal.isAddMedicineHistoryOpen = false"
                        @refreshMedicineHistories="fetchCitizenMedicineHistories" />
                    <ModulesUserCitizenMedicineHistoryModalEdit :isModalOpen="state.modal.isEditMedicineHistoryOpen"
                        :selectedMedicine="props.selectedMedicine"
                        :selectedMedicineHistory="state.selectedMedicineHistory" @close="closeEditMedicineHistoryModal"
                        @refreshMedicineHistories="fetchCitizenMedicineHistories" />
                    <DialogConfirmation :isModalOpen="state.modal.isDeleteMedicineHistoryOpen"
                        :message="$t('citizens.medicineJournals.history.confirmation.deleteConfirmation') + '?'"
                        @close="state.modal.isDeleteMedicineHistoryOpen = false" @confirm="deleteMedicineHistory" />
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { medicineHistoryService } from '@/components/api/user/MedicineHistoryService'
import { effectEvaluationService } from '@/components/api/user/EffectEvaluationService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useCustomPagesStore } from '@/store/custom-pages'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    selectedMedicine: { type: Object, required: true },
})

const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const { formatNumber } = useNumberFormatter()
const language = useI18n()
const customPagesStore = useCustomPagesStore() as any
let currentTablePage = 1
const emit = defineEmits(['close'])

const state = reactive({
    columnHeaders: [] as any,
    error: {} as Error,
    isTableLoading: false,
    medicineHistories: [] as any,
    modal: {
        isAddMedicineHistoryOpen: false,
        isDeleteMedicineHistoryOpen: false,
        isEditMedicineHistoryOpen: false,
    },
    selectedMedicineHistory: [] as any,
    sortData: { sortField: 'id', sortOrder: 'descend' },
    activeEvaluation: null as any,
    evalComment: '',
    isSavingEval: false,
    localEvaluations: {} as Record<string, any[]>,
    apiEvaluations: [] as any[], // evaluations fetched from API
})

// ─── Computed ─────────────────────────────────────────────────

const pendingEvaluations = computed(() => {
    const pending: any[] = []
    const entries = state.medicineHistories?.data ?? []
    entries.forEach((entry: any) => {
        entry.evaluation_frequency?.forEach((evalTime: string) => {
            if (!isEvaluated(entry, evalTime)) {
                pending.push({
                    key: `${entry.uuid}_${evalTime}`,
                    evalTime,
                    medicineName: getEntryMedicineName(),
                    entry,
                })
            }
        })
    })
    return pending
})

// ─── Helpers ──────────────────────────────────────────────────

function getTypeLabel(type: string): string {
    if (type === 'given') return customPagesStore.getCustomPagesName?.giveMedicine ?? t('citizens.medicineJournals.history.form.type.given')
    if (type === 'delivered') return t('citizens.medicineJournals.history.table.type.delivered')
    if (type === 'deviated') return t('citizens.medicineJournals.history.table.type.deviated')
    return type
}

function getEntryMedicineName(): string {
    const lang = language.locale.value
    return lang === 'en'
        ? props.selectedMedicine?.medicine?.en_name
        : props.selectedMedicine?.medicine?.dk_name
}

function isEvaluated(entry: any, evalTime: string): boolean {
    const local = state.localEvaluations[`${entry.uuid}_${evalTime}`]
    if (local?.length) return true
    return entry.evaluations?.some((e: any) =>
        e.time === evalTime || e.evaluated_at === evalTime
    ) ?? false
}

function getEvaluations(entry: any): any[] {
    const apiEvals = entry.evaluations ?? []
    // Also check our fetched API evaluations
    const fetchedEvals = state.apiEvaluations.filter((e: any) =>
        e.citizen_medicine?.uuid === props.selectedMedicine?.uuid
    )
    const localEvals = Object.entries(state.localEvaluations)
        .filter(([key]) => key.startsWith(entry.uuid))
        .flatMap(([, evals]) => evals)
    return [...apiEvals, ...fetchedEvals, ...localEvals]
}

// ─── Evaluation ───────────────────────────────────────────────

function openEvaluation(pending: any) {
    state.activeEvaluation = pending
    state.evalComment = ''
}

async function saveEvaluation() {
    if (!state.evalComment.trim() || !state.activeEvaluation) return
    state.isSavingEval = true
    try {
        // Save to API
        await effectEvaluationService.createEffectEvaluation({
            citizen_medicine_uuid: props.selectedMedicine?.uuid,
            evaluation: state.evalComment,
        })
        // Also optimistic local update so UI updates immediately
        const key = `${state.activeEvaluation.entry.uuid}_${state.activeEvaluation.evalTime}`
        if (!state.localEvaluations[key]) state.localEvaluations[key] = []
        state.localEvaluations[key].push({
            time: state.activeEvaluation.evalTime,
            comment: state.evalComment,
            evaluator: 'Mig',
        })
        successAlert('Gemt!', 'Effektevalueringen er registreret.')
        state.activeEvaluation = null
        state.evalComment = ''
        // Refresh to get server data
        await fetchEffectEvaluations()
    } catch (error: any) {
        state.error = error
    }
    state.isSavingEval = false
}

// ─── Data ─────────────────────────────────────────────────────

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        fetchCitizenMedicineHistories()
        if (props.selectedMedicine?.is_pn_medicine) fetchEffectEvaluations()
        if (props.selectedMedicine?.is_pn_medicine) {
            state.columnHeaders = [
                { name: 'citizens.medicineJournals.history.table.date', isTranslateName: true, sorter: true, key: 'date' },
                { name: 'citizens.medicineJournals.history.table.dose', isTranslateName: true },
                { name: 'citizens.medicineJournals.history.table.type.type', isTranslateName: true },
                { name: 'citizens.medicineJournals.history.table.evaluator', isTranslateName: true },
                { name: 'citizens.medicineJournals.history.table.user', isTranslateName: true },
                { name: 'citizens.medicineJournals.history.table.comment', isTranslateName: true },
                { name: 'citizens.medicineJournals.history.table.dateCreated', isTranslateName: true },
                { name: '' },
            ]
        } else {
            state.columnHeaders = [
                { name: 'citizens.medicineJournals.history.table.date', isTranslateName: true, sorter: true, key: 'date' },
                { name: 'citizens.medicineJournals.history.table.dose', isTranslateName: true },
                { name: 'citizens.medicineJournals.history.table.type.type', isTranslateName: true },
                { name: 'citizens.medicineJournals.history.table.user', isTranslateName: true },
                { name: 'citizens.medicineJournals.history.table.comment', isTranslateName: true },
                { name: 'citizens.medicineJournals.history.table.dateCreated', isTranslateName: true },
                { name: '' },
            ]
        }
    }
})

function closeModal() { emit('close') }

function modalTitle() {
    return `${t('citizens.medicineJournals.history.medicineHistory')} (${language.locale.value === 'en' ? props.selectedMedicine?.medicine?.en_name : props.selectedMedicine?.medicine?.dk_name})`
}

async function fetchEffectEvaluations() {
    try {
        const res = await effectEvaluationService.getEffectEvaluations({
            citizen_medicine_uuid: props.selectedMedicine?.uuid,
        })
        if (res?.data) state.apiEvaluations = res.data
    } catch (e) { /* ignore */ }
}

async function fetchCitizenMedicineHistories() {
    state.error = {} as Error
    state.isTableLoading = true
    try {
        const response = await medicineHistoryService.getMedicineHistories({
            medicine_uuid: props.selectedMedicine?.uuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        })
        if (response) state.medicineHistories = response
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() { currentTablePage--; fetchCitizenMedicineHistories() }
function next() { currentTablePage++; fetchCitizenMedicineHistories() }

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = { sortField: sortingData.column, sortOrder: sortingData.sort }
    fetchCitizenMedicineHistories()
}

function editMedicineHistory(medicineHistory: any) {
    state.selectedMedicineHistory = medicineHistory
    state.modal.isEditMedicineHistoryOpen = true
}

function closeEditMedicineHistoryModal() {
    state.modal.isEditMedicineHistoryOpen = false
    state.selectedMedicineHistory = []
}

function confirmMedicineDeletion(journal: any) {
    state.selectedMedicineHistory = journal
    state.modal.isDeleteMedicineHistoryOpen = true
}

async function deleteMedicineHistory() {
    state.error = {} as Error
    state.isTableLoading = true
    try {
        const response = await medicineHistoryService.deleteMedicineHistory(state.selectedMedicineHistory.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            if (state.selectedMedicineHistory?.data?.length === 1) currentTablePage = 1
            fetchCitizenMedicineHistories()
            successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.history.alert.successfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
