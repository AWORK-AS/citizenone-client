<template>
    <Modal size="sm" :title="$t('citizens.interventionHours.reject.title')" :show="props.isModalOpen" @close="closeModal">
        <template #modal-body>
            <form @submit.prevent="submit()">
                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />
                <p class="text-sm text-gray-600 mb-3">{{ $t('citizens.interventionHours.reject.help') }}</p>
                <div class="space-y-1">
                    <FormLabel for="reject-reason" :label="$t('citizens.interventionHours.reject.reason')" />
                    <FormTextArea id="reject-reason" name="reason" v-model="state.reason"
                        :placeholder="$t('citizens.interventionHours.reject.reason')" />
                    <FormError :error="state.error?.errors?.reason?.[0]" />
                </div>
                <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" @click="closeModal">{{ $t('cancel') }}</FormButton>
                    <FormButton type="submit" buttonStyle="danger" :disabled="state.isSaving || !state.reason.trim()">
                        {{ $t('citizens.interventionHours.reject.submit') }}
                    </FormButton>
                </div>
            </form>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { interventionHoursService } from '@/components/api/user/InterventionHoursService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

/**
 * Rejects an intervention hour with a reason instead of deleting it. The row
 * stays, is left out of exports and billing, and its consultant corrects it.
 */
const props = defineProps({
    isModalOpen: { type: Boolean, default: false },
    careHour: { type: Object as () => any, default: null },
})
const emit = defineEmits(['close', 'rejected'])
const { t } = useI18n()
const { successAlert } = useAlert()

const state = reactive({
    reason: '',
    isSaving: false,
    error: {} as any,
})

watch(() => props.isModalOpen, (open) => {
    if (open) {
        state.reason = ''
        state.error = {}
    }
})

function closeModal() {
    emit('close')
}

async function submit() {
    if (!props.careHour?.uuid) return
    state.isSaving = true
    state.error = {}
    try {
        await interventionHoursService.rejectInterventionHours(props.careHour.uuid, { reason: state.reason.trim() })
        successAlert(`${t('alert.success')}!`, `${t('citizens.interventionHours.reject.done')}.`)
        emit('rejected')
        emit('close')
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}
</script>
