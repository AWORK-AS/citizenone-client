<template>
    <div>
        <Modal size="4xl" :title="modalTitle()" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <div v-if="state.isLoading" class="flex justify-center py-8">
                        <Icon name="ph:spinner" class="size-6 text-primary animate-spin" />
                    </div>
                    <div v-else-if="!state.pourings.length"
                        class="border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center py-10 text-sm text-gray-400">
                        {{ $t('citizens.medicineJournals.pouringHistory.noPourings') }}
                    </div>
                    <div v-else class="space-y-3">
                        <div v-for="(pouring, index) in state.pourings" :key="index"
                            class="rounded-xl border border-gray-200 overflow-hidden">
                            <div class="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                                <div>
                                    <p class="text-sm font-medium text-gray-800">
                                        {{ formatDateToReadable(pouring.period_start) }} –
                                        {{ formatDateToReadable(pouring.period_end) }}
                                    </p>
                                    <p class="text-xxs text-gray-500">
                                        {{ $t('citizens.medicineJournals.history.table.dateCreated') }}:
                                        {{ formatDateTimeToReadable(pouring.created_at) }}
                                    </p>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-xs text-gray-500">
                                        {{ formatNumber(language.locale.value, pouring.amount) }}
                                    </span>
                                    <span class="text-xs text-gray-400">
                                        {{ pouring.created_by?.firstname }} {{ pouring.created_by?.lastname }}
                                    </span>
                                </div>
                            </div>
                            <div class="px-4 py-3 space-y-2">
                                <p class="text-xs text-gray-500">
                                    {{ $t('citizens.medicineJournals.pouringHistory.remainingStock') }}:
                                    {{ formatNumber(language.locale.value, pouring.current_stocks) }}
                                </p>
                                <p v-if="pouring.comment" class="text-xs text-gray-500 italic">
                                    "{{ pouring.comment }}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { medicinePouringService } from '@/components/api/user/MedicinePouringService'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    selectedMedicine: { type: Object, required: true },
})

const emit = defineEmits(['close'])

const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
const { formatNumber } = useNumberFormatter()
const { t } = useI18n()
const language = useI18n()

const state = reactive({
    error: {} as Error,
    isLoading: false,
    pourings: [] as any[],
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) fetchPouringHistory()
})

function closeModal() {
    emit('close')
}

function modalTitle() {
    return `${t('citizens.medicineJournals.pouringHistory.title')} (${language.locale.value === 'en' ? props.selectedMedicine?.medicine?.en_name : props.selectedMedicine?.medicine?.dk_name})`
}

async function fetchPouringHistory() {
    state.error = {} as Error
    state.isLoading = true
    try {
        const response = await medicinePouringService.getPourings(props.selectedMedicine?.uuid)
        state.pourings = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
