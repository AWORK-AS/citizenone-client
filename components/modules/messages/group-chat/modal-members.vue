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
                        <p v-for="(name, index) in state.chatMembers?.data" :key="index" class="py-2">
                            {{ name?.user?.firstname }} {{ name?.user?.lastname }}
                        </p>
                    </div>
                </LoadingSpinner>
                <ModulesMessagesGroupChatModalNewMembers :isModalOpen="state.modal.isAddNewGroupChatMembersOpen"
                    @close="state.modal.isAddNewGroupChatMembersOpen = false"
                    @refreshGroupChatMembers="fetchGroupMembers" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { messageService } from '@/components/api/MessageService'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])

const router = useRouter()
const chatUuid = router?.currentRoute?.value?.params?.chat_uuid

const state = reactive({
    error: {} as Error,
    chatMembers: [] as any,
    isPageLoading: false,
    modal: {
        isAddNewGroupChatMembersOpen: false,
    },
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
</script>