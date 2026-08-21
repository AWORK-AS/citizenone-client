<template>
    <div>
        <Modal size="2xl" :title="$t('citizens.medicineJournals.history.batchDispense.modalTitle')"
            :show="props.isModalOpen && !state.modal.isPouringEmptyOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <!-- STEP: form -->
                    <form v-if="state.step === 'form'" @submit.prevent="preview">
                        <div class="space-y-3">
                            <p class="text-sm text-gray-500">
                                {{ $t('citizens.medicineJournals.history.batchDispense.form.description') }}
                            </p>

                            <div class="space-y-1">
                                <FormLabel for="date_range"
                                    :label="$t('citizens.medicineJournals.history.batchDispense.form.dateRangeLabel')" />
                                <FormDateRangeField id="date_range" name="date_range"
                                    :placeholder="$t('citizens.medicineJournals.history.batchDispense.form.dateRangeLabel')"
                                    v-model="state.form.date_range" />
                                <FormError :error="v$?.form.date_range?.$errors[0]?.$message.toString()" />
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="type"
                                    :label="$t('citizens.medicineJournals.history.batchDispense.form.typeLabel')" />
                                <FormSelect id="type" name="type" :options="state.options.types"
                                    v-model="state.form.type" />
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="comment"
                                    :label="$t('citizens.medicineJournals.history.batchDispense.form.commentLabel')" />
                                <FormTextArea id="comment" name="comment"
                                    :placeholder="$t('citizens.medicineJournals.history.batchDispense.form.commentLabel')"
                                    v-model="state.form.comment" />
                            </div>

                            <div class="space-y-1" v-if="state.selectedMedicines.length > 0">
                                <p class="text-sm text-gray-600">
                                    {{ $t('citizens.medicineJournals.table.medicine') }}
                                </p>
                                <ul class="text-sm text-gray-700 list-disc list-inside">
                                    <li v-for="medicine in state.selectedMedicines" :key="medicine.uuid">
                                        <span v-if="language.locale.value === 'en'">{{ medicine.medicine?.en_name }}</span>
                                        <span v-else-if="language.locale.value === 'no'">{{ medicine.medicine?.no_name }}</span>
                                        <span v-else-if="language.locale.value === 'sv'">{{ medicine.medicine?.sv_name }}</span>
                                        <span v-else>{{ medicine.medicine?.dk_name }}</span>
                                    </li>
                                </ul>
                            </div>

                            <Alert type="warning"
                                :text="$t('citizens.medicineJournals.history.batchDispense.form.pnExcludedNotice', { n: state.excludedPnMedicines.length })"
                                v-if="state.excludedPnMedicines.length > 0" />
                        </div>

                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="w-full"
                                    v-if="state.scheduledMedicines.length > 0">
                                    {{ $t('citizens.medicineJournals.history.batchDispense.form.previewButton') }}
                                </FormButton>
                            </div>
                        </div>
                    </form>

                    <!-- STEP: confirm -->
                    <div v-if="state.step === 'confirm'">
                        <h3 class="text-base font-semibold text-gray-800">
                            {{ $t('citizens.medicineJournals.history.batchDispense.confirm.title') }}
                        </h3>
                        <div class="mt-3 space-y-2 text-sm">
                            <p class="text-gray-700">
                                {{ $t('citizens.medicineJournals.history.batchDispense.confirm.willCreate', { n: state.preview?.created_count ?? 0 }) }}
                            </p>
                            <p class="text-gray-500" v-if="(state.preview?.skipped_count ?? 0) > 0">
                                {{ $t('citizens.medicineJournals.history.batchDispense.confirm.willSkip', { n: state.preview?.skipped_count ?? 0 }) }}
                            </p>
                            <Alert type="danger"
                                :text="$t('citizens.medicineJournals.history.batchDispense.confirm.noneToCreate')"
                                v-if="(state.preview?.created_count ?? 0) === 0" />

                            <Disclosure v-slot="{ open }" v-if="(state.preview?.skipped?.length ?? 0) > 0">
                                <DisclosureButton class="text-xs text-primary hover:underline flex items-center gap-0.5">
                                    <Icon :name="open ? 'ic:round-keyboard-arrow-up' : 'ic:round-keyboard-arrow-down'"
                                        class="w-3 h-3" />
                                    {{ $t('citizens.medicineJournals.history.batchDispense.confirm.willSkip', { n: state.preview?.skipped_count ?? 0 }) }}
                                </DisclosureButton>
                                <DisclosurePanel>
                                    <ul class="mt-1 text-xs text-gray-500 space-y-0.5">
                                        <li v-for="(skip, index) in state.preview?.skipped" :key="index">
                                            {{ skip.date }} {{ skip.time }}
                                        </li>
                                    </ul>
                                </DisclosurePanel>
                            </Disclosure>
                        </div>

                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" @click="state.step = 'form'">
                                    {{ $t('citizens.medicineJournals.history.batchDispense.confirm.backButton') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="primary" class="w-full"
                                    @click="() => confirmDispense()" v-if="(state.preview?.created_count ?? 0) > 0">
                                    {{ $t('citizens.medicineJournals.history.batchDispense.confirm.confirmButton') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>

                    <!-- STEP: result -->
                    <div v-if="state.step === 'result'">
                        <h3 class="text-base font-semibold text-gray-800">
                            {{ $t('citizens.medicineJournals.history.batchDispense.result.title') }}
                        </h3>
                        <p class="mt-3 text-sm text-gray-700">
                            {{ $t('citizens.medicineJournals.history.batchDispense.result.summary', {
                                created: state.result?.created_count ?? 0,
                                skipped: state.result?.skipped_count ?? 0,
                            }) }}
                        </p>

                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                    {{ $t('close') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="danger" class="w-full" @click="undoBatch">
                                    {{ $t('citizens.medicineJournals.history.batchDispense.result.undoButton') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>
                </LoadingSpinner>

                <DialogConfirmation :isModalOpen="state.modal.isPouringEmptyOpen"
                    :title="$t('citizens.medicineJournals.pouring.emptyWarningTitle')"
                    :message="state.pouringEmptyMessage"
                    :confirmLabel="$t('citizens.medicineJournals.pouring.giveFromMainStock')"
                    @close="state.modal.isPouringEmptyOpen = false" @confirm="confirmDispenseFromMainStock" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { medicineHistoryService } from '@/components/api/user/MedicineHistoryService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useCitizenMedicineStore } from '@/store/citizen-medicines'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()
const citizenMedicineStore = useCitizenMedicineStore() as any

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    citizenUuid: {
        type: String,
        required: true,
    },
    medicines: {
        type: Array as () => any[],
        default: () => [],
    },
})
const emit = defineEmits(['close', 'refreshMedicines', 'refreshMedicineHistories'])

const state = reactive({
    step: 'form' as 'form' | 'confirm' | 'result',
    error: {} as Error,
    isPageLoading: false,
    selectedMedicines: [] as any[],
    scheduledMedicines: [] as any[],
    excludedPnMedicines: [] as any[],
    form: {
        date_range: [] as any,
        type: 'given',
        comment: '',
    },
    preview: null as any,
    result: null as any,
    modal: {
        isPouringEmptyOpen: false,
    },
    pouringEmptyMessage: '',
    options: {
        types: [
            { value: 'given', label: '' },
            { value: 'delivered', label: '' },
            { value: 'deviated', label: '' },
        ],
    },
})

function refreshTypeLabels() {
    state.options.types = [
        { value: 'given', label: t('citizens.medicineJournals.history.form.type.given') },
        { value: 'delivered', label: t('citizens.medicineJournals.history.form.type.delivered') },
        { value: 'deviated', label: t('citizens.medicineJournals.history.form.type.deviated') },
    ]
}

watch(() => props.isModalOpen, (isOpen) => {
    if (isOpen) {
        resetState()
        refreshTypeLabels()
        deriveSelectedMedicines()
    }
})

function resetState() {
    state.step = 'form'
    state.error = {}
    state.form.date_range = []
    state.form.type = 'given'
    state.form.comment = ''
    state.preview = null
    state.result = null
}

function deriveSelectedMedicines() {
    state.error = {}
    // Uses the citizen's already-loaded medicine list (passed in as a prop)
    // rather than the `/citizen-medicines/multiple/list` endpoint: that
    // endpoint was built for "give medicines scheduled today" and silently
    // drops any non-PN medicine that doesn't occur on today's date, which
    // isn't meaningful for a date-range batch action that may not include
    // today at all. Eligibility per-date within the chosen range is instead
    // determined server-side in the preview step.
    const selectedUuids = new Set(citizenMedicineStore.getSelectedMedicines)
    const selected = (props.medicines ?? []).filter((m: any) => selectedUuids.has(m?.uuid))

    state.selectedMedicines = selected
    state.excludedPnMedicines = selected.filter((m: any) => m?.is_pn_medicine)
    state.scheduledMedicines = selected.filter((m: any) => !m?.is_pn_medicine)
}

const rules = computed(() => {
    return {
        form: {
            date_range: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

function buildParams(forceMainStock = false) {
    return {
        citizen_uuid: props.citizenUuid,
        medicine_uuids: state.scheduledMedicines.map((m: any) => m.uuid),
        date_start: state.form.date_range?.[0],
        date_end: state.form.date_range?.[1],
        type: state.form.type,
        comment: state.form.comment || undefined,
        give_from_main_stock: forceMainStock || undefined,
    }
}

async function preview() {
    v$.value.$validate()
    if (v$.value.$error) {
        return
    }

    state.error = {}
    state.isPageLoading = true
    try {
        const response = await medicineHistoryService.previewBatchDispenseMedicineHistory(buildParams())
        if (response?.data) {
            state.preview = response.data
            state.step = 'confirm'
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function confirmDispense(forceMainStock = false) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await medicineHistoryService.saveBatchDispenseMedicineHistory(buildParams(forceMainStock))
        if (response?.data) {
            state.result = response.data
            state.step = 'result'
            successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.history.form.alert.successfullyAdded')}.`)
            citizenMedicineStore.resetSelectedMedicine()
            emit('refreshMedicines')
            emit('refreshMedicineHistories')
        }
    } catch (error: any) {
        if (error?.pouring_empty && !forceMainStock) {
            state.pouringEmptyMessage = error?.message ?? t('citizens.medicineJournals.pouring.emptyWarningMessage')
            state.modal.isPouringEmptyOpen = true
            state.isPageLoading = false
            return
        }
        state.error = error
    }
    state.isPageLoading = false
}

function confirmDispenseFromMainStock() {
    state.modal.isPouringEmptyOpen = false
    confirmDispense(true)
}

async function undoBatch() {
    if (!state.result?.batch_uuid) {
        return
    }

    state.error = {}
    state.isPageLoading = true
    try {
        await medicineHistoryService.undoBatchDispenseMedicineHistory(state.result.batch_uuid)
        successAlert(`${t('alert.success')}!`, t('citizens.medicineJournals.history.batchDispense.undo.successMessage'))
        emit('refreshMedicines')
        emit('refreshMedicineHistories')
        closeModal()
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
