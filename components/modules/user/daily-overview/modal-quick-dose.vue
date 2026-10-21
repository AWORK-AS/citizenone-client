<template>
    <Modal size="xs" :title="$t('overview.medicationOverview.quickDose.title')" :show="props.isModalOpen"
        @close="closeModal">
        <template #modal-body>
            <div class="space-y-4">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <div class="space-y-1">
                    <p class="text-base font-semibold">{{ props.medicineName }}</p>
                    <p class="text-sm text-gray-600" v-if="props.citizenName">{{ props.citizenName }}</p>
                    <p class="text-sm text-gray-600">{{ summary }}</p>
                </div>
                <div class="space-y-1">
                    <FormLabel for="quick_dose_comment" :label="$t('citizens.medicineJournals.history.form.comment')" />
                    <FormTextArea id="quick_dose_comment" name="quick_dose_comment"
                        :placeholder="$t('citizens.medicineJournals.history.form.comment')" :rows="2"
                        v-model="state.comment" />
                </div>
                <div class="flex flex-wrap items-center justify-end gap-2 pt-2 pb-6">
                    <FormButton buttonStyle="link" :disabled="state.saving !== null" @click="openFullForm">
                        {{ $t('overview.medicationOverview.quickDose.moreOptions') }}
                    </FormButton>
                    <FormButton buttonStyle="danger" :disabled="state.saving !== null" @click="record('deviated')">
                        <Icon name="ph:spinner" class="size-4 animate-spin" v-if="state.saving === 'deviated'" />
                        {{ $t('overview.medicationOverview.deviated') }}
                    </FormButton>
                    <FormButton buttonStyle="success" :disabled="state.saving !== null" @click="record('given')">
                        <Icon name="ph:spinner" class="size-4 animate-spin" v-if="state.saving === 'given'" />
                        {{ $t('overview.medicationOverview.given') }}
                    </FormButton>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { medicineHistoryService } from '@/components/api/user/MedicineHistoryService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

// Records one scheduled dose straight from the daily overview, the way the
// mobile app's quick-dose sheet does. It posts the same payload to the same
// endpoint as the full history form, so permissions, stock and the day's other
// doses are decided by the backend exactly as before.
const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    medicineUuid: { type: String, required: false },
    medicineName: { type: String, required: false },
    citizenName: { type: String, required: false },
    slot: { type: Object, required: false },
    dosage: { type: String, required: false },
})

const emit = defineEmits(['close', 'saved', 'openForm'])

const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    comment: '',
    saving: null as null | 'given' | 'deviated',
    error: {} as Error,
})

const summary = computed(() => [props.slot?.date, props.slot?.time, props.dosage].filter(Boolean).join(' · '))

watch(() => props.isModalOpen, (isOpen: boolean) => {
    if (isOpen) {
        state.comment = ''
        state.saving = null
        state.error = {}
    }
})

function closeModal() {
    if (state.saving !== null) return
    emit('close')
}

function openFullForm() {
    emit('close')
    emit('openForm')
}

async function record(outcome: 'given' | 'deviated') {
    state.error = {}
    state.saving = outcome
    try {
        const response = await medicineHistoryService.saveMedicineHistory({
            medicine_uuid: props.medicineUuid,
            date: props.slot?.date,
            dosages: [{
                medicine_uuid: props.medicineUuid,
                time: props.slot?.time,
                dosage: props.dosage,
                type: outcome,
                comment: state.comment.trim(),
            }],
        })
        // The endpoint can answer with a message instead of throwing; a refusal must not read as a recorded dose.
        if (response?.message) {
            state.error = { message: response.message } as Error
            state.saving = null
            return
        }
        successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.history.form.alert.successfullyAdded')}.`)
        emit('saved')
        emit('close')
    } catch (error: any) {
        state.error = error
    }
    state.saving = null
}
</script>
