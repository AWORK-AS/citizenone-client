<template>
    <div>
        <Modal size="sm" :title="$t('messages.editMessage')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <form @submit.prevent="submitForm">
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="message" :label="$t('messages.message')" />
                                <FormTextArea id="message" name="message" :placeholder="$t('messages.message')"
                                    v-model="state.formMessage.message" />
                                <FormError :error="v$?.formMessage?.message?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.message?.[0]" />
                            </div>
                        </div>
                        <div class="mt-6 mb-2">
                            <FormButton type="submit" buttonStyle="primary" class="w-full rounded-md">
                                {{ $t('update') }}
                            </FormButton>
                        </div>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { messageService } from '@/components/api/user/MessageService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedChat: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['close', 'updateMessage'])
const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formMessage: {
        message: '',
    },
    isPageLoading: false,
})

const rules = computed(() => {
    return {
        formMessage: {
            message: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

watch(() => props.selectedChat, (selectedChat: any) => {
    if (selectedChat) {
        state.formMessage.message = selectedChat.message || ''
    }
})

function closeModal() {
    emit('close')
}

async function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        state.isPageLoading = true
        try {
            const chatMessageUuid = props.selectedChat?.uuid
            const params = {
                message: state.formMessage.message,
            }
            const response = await messageService.updateChatMessage(chatMessageUuid, params)
            if (response) {
                closeModal()
                successAlert(`${t('alert.success')}!`, `${t('messages.alert.messageSuccessfullyUpdated')}.`)
                state.formMessage.message = ''
                v$.value.$reset()
                emit('updateMessage', response?.data?.message)
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}
</script>