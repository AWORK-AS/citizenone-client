<template>
    <div>
        <Modal size="xs" :title="$t('messages.groupChat.addUsers')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <form @submit.prevent="addToGroupMembers">
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="users" :label="$t('messages.users')" />
                                <FormSelectMultiple id="users" :options="state.options.users"
                                    v-model="state.formChat.users" />
                                <FormError :error="v$?.formChat?.users?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.user_uuid?.[0]" />
                            </div>
                        </div>
                        <div class="mt-6 mb-2">
                            <FormButton type="submit" buttonStyle="primary" class="w-full rounded-md">
                                {{ $t('messages.groupChat.add') }}
                            </FormButton>
                        </div>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { messageService } from '@/components/api/MessageService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshGroupChatMembers', 'refreshChat'])
const { t } = useI18n()
const router = useRouter()
const chatUuid = router?.currentRoute?.value?.params?.chat_uuid

const state = reactive({
    error: {} as Error,
    formChat: {
        users: [] as any,
    },
    isPageLoading: false,
    options: {
        users: []
    }
})

const rules = computed(() => {
    return {
        formChat: {
            users: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        fetchAvailableGroupMembers()
    }
})

async function fetchAvailableGroupMembers() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            chat_uuid: chatUuid
        }
        const response = await messageService.getAllAvailableUsers(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (user: any) => options.push({
                    value: user?.uuid,
                    label: user?.firstname + " " + user?.lastname,
                })
            )
            state.options.users = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function addToGroupMembers() {
    v$.value.$validate()
    if (!v$.value.$error) {
        state.isPageLoading = true
        try {
            const params = {
                chat_uuid: chatUuid,
                user_uuid: state.formChat.users,
            }
            const response = await messageService.saveGroupMembers(params)
            if (response) {
                closeModal()
                emit('refreshGroupChatMembers')
                emit('refreshChat')
                fetchAvailableGroupMembers
                state.formChat.users = []
                v$.value.$reset()
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}
</script>