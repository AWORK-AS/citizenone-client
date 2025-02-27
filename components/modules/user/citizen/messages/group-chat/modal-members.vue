<template>
    <div>
        <Modal size="sm" :title="$t('messages.groupChat.groupMembers')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="flex justify-end items-center">
                        <FormButton buttonStyle="action" buttonSize="sm" class="rounded-lg"
                            @click="state.modal.isAddNewGroupChatMembersOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('messages.groupChat.addUsers') }}
                        </FormButton>
                    </div>
                    <h3 class="text-xs font-semibold text-primary">
                        {{ $t('messages.groupChat.name') }}
                    </h3>
                    <div class="mt-2 text-sm divide-y divide-dotted pb-4">
                        <div v-for="(member, index) in state.chatMembers?.data" :key="index"
                            class="flex items-center justify-between gap-x-2 py-2">
                            <p>
                                {{ member?.user?.firstname }} {{ member?.user?.lastname }}
                            </p>
                            <Tooltip :text="$t('messages.groupChat.removeUser')">
                                <button @click="confirmUserRemoval(member)">
                                    <Icon name="line-md:account-delete" class="h-5 w-5" aria-hidden="true" />
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                </LoadingSpinner>
                <ModulesUserCitizenMessagesGroupChatModalNewMembers
                    :isModalOpen="state.modal.isAddNewGroupChatMembersOpen"
                    @close="state.modal.isAddNewGroupChatMembersOpen = false"
                    @refreshGroupChatMembers="fetchGroupMembers" @refreshChat="emit('refreshChat')" />
                <DialogConfirmation :isModalOpen="state.modal.isRemoveUserOpen"
                    :message="$t('messages.groupChat.confirmation.removeConfirmation') + '?'"
                    @close="state.modal.isRemoveUserOpen = false" @confirm="removeUser" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { messageService } from '@/components/api/citizen/MessageService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshChat'])

const router = useRouter()
const chatUuid = router?.currentRoute?.value?.params?.chat_uuid
const { t } = useI18n()
const { successAlert } = useAlert()

const state = reactive({
    error: {} as Error,
    chatMembers: [] as any,
    isPageLoading: false,
    modal: {
        isAddNewGroupChatMembersOpen: false,
        isRemoveUserOpen: false,
    },
    selectedUser: {} as any,
})

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        fetchGroupMembers()
    }
})

function closeModal() {
    emit('close')
}

async function fetchGroupMembers() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            chat_uuid: chatUuid
        }
        const response = await messageService.getGroupMembers(params)
        if (response) {
            state.chatMembers = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function confirmUserRemoval(member: any) {
    state.selectedUser = member
    state.modal.isRemoveUserOpen = true
}

async function removeUser() {
    state.error = {}
    state.isPageLoading = true
    try {
        const memberUuid = state.selectedUser.uuid
        const response = await messageService.deleteGroupMember(memberUuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            successAlert(`${t('alert.success')}!`, `${t('messages.groupChat.alert.usersSuccessfullyRemoved')}.`)
            fetchGroupMembers()
            emit('refreshChat')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>