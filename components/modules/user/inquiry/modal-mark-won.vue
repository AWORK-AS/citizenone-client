<template>
    <div>
        <Modal size="md" :title="$t('inquiryWon.modal.title')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <!-- What approving the offer asks, so moving the case to won and
                     registering the municipality's answer record the same thing. -->
                <form class="space-y-4" @submit.prevent="confirm">
                    <p class="text-sm text-gray-500">{{ $t('inquiryWon.modal.hint') }}</p>

                    <div class="space-y-1">
                        <FormLabel for="won-responded-at" :label="$t('inquiryOffer.respondedAt')" />
                        <FormDateField id="won-responded-at" name="won-responded-at"
                            :placeholder="$t('inquiryOffer.respondedAt')" v-model="state.form.responded_at" />
                    </div>

                    <div class="space-y-1">
                        <FormLabel for="won-start-wishes" :label="$t('inquiryOffer.startWishes')" />
                        <FormTextArea id="won-start-wishes" name="won-start-wishes" :rows="2"
                            :placeholder="$t('inquiryOffer.startWishesPlaceholder')" v-model="state.form.start_wishes" />
                    </div>

                    <div class="space-y-1">
                        <FormLabel for="won-remarks" :label="$t('inquiryOffer.remarks')" />
                        <FormTextArea id="won-remarks" name="won-remarks" :rows="2"
                            :placeholder="$t('inquiryOffer.remarks')" v-model="state.form.response_remarks" />
                    </div>

                    <div class="grid grid-cols-1 gap-3 pt-2 md:grid-cols-2">
                        <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                            {{ $t('cancel') }}
                        </FormButton>
                        <FormButton type="submit" buttonStyle="primary">
                            {{ $t('inquiryWon.modal.confirm') }}
                        </FormButton>
                    </div>
                </form>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { localDateString } from '@/composables/localDate'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close', 'confirm'])

const state = reactive({
    form: {
        responded_at: '' as string,
        start_wishes: '' as string,
        response_remarks: '' as string,
    },
})

watch(() => props.isModalOpen, (isOpen: boolean) => {
    if (!isOpen) return
    state.form = { responded_at: localDateString(), start_wishes: '', response_remarks: '' }
})

function closeModal() {
    emit('close')
}

function confirm() {
    emit('confirm', {
        responded_at: state.form.responded_at || null,
        start_wishes: state.form.start_wishes?.trim() || null,
        response_remarks: state.form.response_remarks?.trim() || null,
    })
}
</script>
