<template>
    <div>
        <Modal size="xs" :title="$t('messages.groupChat.editGroupName')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <form @submit.prevent="submitForm">
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="name" :label="$t('messages.groupChat.form.name')" />
                                <FormTextField id="name" name="name" :placeholder="$t('messages.groupChat.form.name')"
                                    v-model="state.formGroupChat.name" />
                                <FormError :error="v$?.formGroupChat?.name?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.name?.[0]" />
                            </div>
                        </div>
                        <div class="mt-6 mb-2">
                            <FormButton type="submit" buttonStyle="primary" class="w-full">
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
const emit = defineEmits(['close', 'refreshChatDetails'])
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const chatUuid = router?.currentRoute?.value?.params?.chat_uuid

const state = reactive({
    error: {} as Error,
    formGroupChat: {
        name: '',
    },
    isPageLoading: false,
})

const rules = computed(() => {
    return {
        formGroupChat: {
            name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

watch(() => props.selectedChat, (newValue: any) => {
    if (newValue != null) {
        state.formGroupChat.name = newValue.name || ''
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
            const params = {
                name: state.formGroupChat.name,
                type: 'group',
            }
            const response = await messageService.updateGroupChatName(chatUuid, params)
            if (response) {
                closeModal()
                successAlert(`${t('alert.success')}!`, `${t('messages.groupChat.alert.groupNameSuccessfullyUpdated')}.`)
                emit('refreshChatDetails', state.formGroupChat)
                state.formGroupChat.name = ''
                v$.value.$reset()
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}
</script>