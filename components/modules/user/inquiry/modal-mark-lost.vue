<template>
    <div>
        <Modal size="md" :title="$t('inquiryLost.modal.title')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <form class="space-y-4" @submit.prevent="confirm">
                    <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

                    <p class="text-sm text-gray-500">{{ $t('inquiryLost.modal.hint') }}</p>

                    <!-- Without a list of reasons there is nothing to choose, and
                         the case can still be lost; the server says the same. -->
                    <div v-if="reasonOptions.length" class="space-y-1">
                        <FormLabel for="lost-reason" :label="$t('inquiryLost.modal.reason')" />
                        <FormSelect id="lost-reason" v-model="state.form.lost_reason_uuid" :options="reasonOptions"
                            :canClear="false" />
                        <FormError :error="state.reasonMissing ? $t('validation.thisFieldIsRequired') + '.' : ''" />
                    </div>
                    <p v-else-if="!state.isLoading" class="rounded-lg bg-surface-50 px-3 py-2 text-xs text-slate-500">
                        {{ $t('inquiryLost.modal.noReasons') }}
                    </p>

                    <div class="space-y-1">
                        <FormLabel for="lost-note" :label="$t('inquiryLost.modal.note')" />
                        <FormTextArea name="lost-note" id="lost-note" v-model="state.form.lost_reason_note"
                            :placeholder="$t('inquiryLost.modal.notePlaceholder')" :rows="3" />
                    </div>

                    <div class="space-y-1">
                        <FormLabel for="lost-price" :label="$t('inquiryLost.modal.price')" />
                        <FormNumberField name="lost-price" id="lost-price" v-model="state.form.lost_estimated_price"
                            :min="0" :placeholder="$t('inquiryLost.modal.pricePlaceholder')" />
                    </div>

                    <div class="grid grid-cols-1 gap-3 pt-2 md:grid-cols-2">
                        <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                            {{ $t('cancel') }}
                        </FormButton>
                        <FormButton type="submit" buttonStyle="primary">
                            {{ $t('inquiryLost.modal.confirm') }}
                        </FormButton>
                    </div>
                </form>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { inquiryLostReasonService } from '@/components/api/user/InquiryLostReasonService'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close', 'confirm'])

const state = reactive({
    error: {} as Error,
    isLoading: false,
    reasonMissing: false,
    reasons: [] as any[],
    form: {
        lost_reason_uuid: '' as string,
        lost_reason_note: '' as string,
        lost_estimated_price: '' as string,
    },
})

// Only the active ones are offered; a deactivated reason stays on the cases
// that already carry it.
const reasonOptions = computed(() => state.reasons
    .filter((reason: any) => reason.is_active)
    .map((reason: any) => ({ value: reason.uuid, label: reason.name })))

watch(() => props.isModalOpen, (isOpen: boolean) => {
    if (!isOpen) return
    state.form = { lost_reason_uuid: '', lost_reason_note: '', lost_estimated_price: '' }
    state.reasonMissing = false
    fetchReasons()
})

async function fetchReasons() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await inquiryLostReasonService.getReasons()
        state.reasons = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function closeModal() {
    emit('close')
}

function confirm() {
    if (reasonOptions.value.length && !state.form.lost_reason_uuid) {
        state.reasonMissing = true
        return
    }

    const price = state.form.lost_estimated_price === '' ? null : Number(state.form.lost_estimated_price)

    emit('confirm', {
        lost_reason_uuid: state.form.lost_reason_uuid || null,
        lost_reason_note: state.form.lost_reason_note?.trim() || null,
        lost_estimated_price: Number.isFinite(price as number) ? price : null,
    })
}
</script>
