<template>
    <div>
        <Modal size="xs" :title="$t('messages.groupChat.addUsers')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <form @submit.prevent="addToGroupMembers" id="formGroupMember">
                        <div class="space-y-3">
                            <!-- Colleagues and citizens in separate lists, as when starting a chat. -->
                            <div class="space-y-1" v-if="state.options.citizens.length > 0">
                                <FormLabel for="member_type" :label="$t('messages.recipientType')" />
                                <div id="member_type" role="radiogroup" :aria-label="$t('messages.recipientType')"
                                    class="grid grid-cols-2 gap-2">
                                    <button v-for="option in memberTypes" :key="option.value" type="button" role="radio"
                                        :aria-checked="state.memberType === option.value" @click="setMemberType(option.value)"
                                        :class="['flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-colors',
                                            state.memberType === option.value
                                                ? (option.value === 'citizens' ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-primary bg-primary-50 text-primary')
                                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300']">
                                        <Icon :name="option.icon" class="h-4 w-4" aria-hidden="true" />
                                        {{ option.label }}
                                    </button>
                                </div>
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="users"
                                    :label="state.memberType === 'citizens' ? $t('messages.citizenRecipients') : $t('messages.users')" />
                                <FormSelectMultiple id="users" :key="state.memberType"
                                    :options="state.memberType === 'citizens' ? state.options.citizens : state.options.users"
                                    v-model="state.formChat.users" />
                                <p v-if="state.memberType === 'citizens'" class="text-xs text-amber-800">
                                    {{ $t('messages.citizenRecipientWarning') }}
                                </p>
                                <FormError :error="v$?.formChat?.users?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.user_uuid?.[0]" />
                            </div>
                        </div>
                        <div class="mt-6 mb-2">
                            <FormButton type="submit" buttonStyle="primary" class="w-full">
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
import { messageService } from '@/components/api/user/MessageService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { citizenRecipientOptions, staffRecipientOptions, type RecipientType } from '@/composables/chatRecipients'

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
    memberType: 'employees' as RecipientType,
    options: {
        users: [] as any[],
        citizens: [] as any[],
    }
})

const memberTypes = computed(() => [
    { value: 'employees' as RecipientType, label: t('messages.recipientTypeEmployees'), icon: 'ph:users-three' },
    { value: 'citizens' as RecipientType, label: t('messages.recipientTypeCitizens'), icon: 'ph:user-circle' },
])

// Changing the list starts the choice over, so nobody from the other list is added along with it.
function setMemberType(type: RecipientType) {
    if (state.memberType === type) return
    state.memberType = type
    state.formChat.users = []
}

const rules = computed(() => {
    return {
        formChat: {
            users: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
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
            state.options.users = staffRecipientOptions(response.data)
            state.options.citizens = citizenRecipientOptions(response.data)
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
                state.memberType = 'employees'
                v$.value.$reset()
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}
</script>

<style>
#formGroupMember .multiselect-dropdown {
    max-height: 4.8rem !important;
}
</style>