<template>
    <div>
        <Modal size="2xl" :title="$t('citizens.medicineJournals.dosageChange.dosageHistory')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <div v-if="state.isLoading" class="flex justify-center py-8">
                        <Icon name="ph:spinner" class="size-6 text-primary animate-spin" />
                    </div>
                    <div v-else-if="!state.dosageChanges?.data?.length"
                        class="border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center py-10 text-sm text-gray-400">
                        {{ $t('citizens.medicineJournals.dosageChange.noDosageChangesRecorded') }}
                    </div>
                    <div v-else class="space-y-3">
                        <div v-for="(entry, entryIndex) in state.dosageChanges?.data" :key="entryIndex"
                            class="rounded-xl border border-gray-200 overflow-hidden">
                            <div class="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                                <div class="flex items-center gap-3">
                                    <span :class="[
                                        'text-xs px-2 py-0.5 rounded-full font-medium',
                                        entry.type === 'escalation' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                    ]">
                                        <Icon :name="entry.type === 'escalation' ? 'ph:trend-up' : 'ph:trend-down'"
                                            class="size-3 inline-block align-text-bottom mr-0.5" />
                                        {{ entry.type === 'escalation'
                                            ? $t('citizens.medicineJournals.dosageChange.escalate')
                                            : $t('citizens.medicineJournals.dosageChange.deEscalate') }}
                                    </span>
                                    <p class="text-sm font-medium text-gray-800">
                                        {{ formatDateToReadable(entry.effective_date) }}
                                    </p>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-xs text-gray-400">
                                        {{ entry.recorded_by?.firstname }} {{ entry.recorded_by?.lastname }}
                                    </span>
                                    <button type="button"
                                        class="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500"
                                        @click="confirmDosageChangeDeletion(entry)">
                                        <Icon name="ph:trash" class="size-3.5" />
                                    </button>
                                </div>
                            </div>
                            <div class="px-4 py-3 space-y-1.5">
                                <p v-if="entry.previous_strength !== entry.new_strength" class="text-xs text-gray-600">
                                    {{ $t('citizens.medicineJournals.dosageChange.newStrength') }}:
                                    <span class="line-through text-gray-400">{{ entry.previous_strength || '—' }}</span>
                                    → <span class="font-medium">{{ entry.new_strength || '—' }}</span>
                                </p>
                                <p v-if="entry.previous_max_daily_dose !== entry.new_max_daily_dose"
                                    class="text-xs text-gray-600">
                                    {{ $t('citizens.medicineJournals.dosageChange.newMaxDailyDose') }}:
                                    <span class="line-through text-gray-400">{{ entry.previous_max_daily_dose || '—' }}</span>
                                    → <span class="font-medium">{{ entry.new_max_daily_dose || '—' }}</span>
                                </p>
                                <p v-if="entry.reason" class="text-xs text-gray-500 italic">
                                    "{{ entry.reason }}"
                                </p>
                            </div>
                        </div>
                    </div>
                    <Pagination :data="state.dosageChanges" @previous="previous" @next="next" />
                </div>

                <DialogConfirmation :isModalOpen="state.modal.isDeleteDosageChangeOpen"
                    :message="$t('citizens.medicineJournals.dosageChange.confirmDelete') + '?'"
                    @close="state.modal.isDeleteDosageChangeOpen = false" @confirm="deleteDosageChange" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { medicineDosageChangeService } from '@/components/api/user/MedicineDosageChangeService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    selectedMedicine: { type: Object, required: true },
})

const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentPage = 1
const emit = defineEmits(['close', 'refreshMedicines'])

const state = reactive({
    dosageChanges: [] as any,
    error: {} as Error,
    isLoading: false,
    modal: {
        isDeleteDosageChangeOpen: false,
    },
    selectedDosageChange: {} as any,
})

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        currentPage = 1
        fetchDosageChanges()
    }
})

function closeModal() {
    emit('close')
}

async function fetchDosageChanges() {
    state.error = {} as Error
    state.isLoading = true
    try {
        const response = await medicineDosageChangeService.getDosageChanges(props.selectedMedicine?.uuid, {
            page: currentPage,
        })
        if (response) state.dosageChanges = response
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function previous() { currentPage--; fetchDosageChanges() }
function next() { currentPage++; fetchDosageChanges() }

function confirmDosageChangeDeletion(entry: any) {
    state.selectedDosageChange = entry
    state.modal.isDeleteDosageChangeOpen = true
}

async function deleteDosageChange() {
    state.error = {} as Error
    state.isLoading = true
    try {
        await medicineDosageChangeService.deleteDosageChange(props.selectedMedicine?.uuid, state.selectedDosageChange.uuid)
        fetchDosageChanges()
        successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.dosageChange.alert.successfullyDeleted')}.`)
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

defineExpose({ fetchDosageChanges })
</script>
