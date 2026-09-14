<template>
    <div>
        <Modal size="md" :title="$t('messages.newConversation')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message" class="mb-4"
                        v-if="state.error?.message && state.error.message.length > 0 && !state.error?.errors" />
                    <form @submit.prevent="sendMessage">
                        <div class="flex items-start gap-3 mb-5">
                            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary">
                                <Icon name="ph:chats-circle" class="h-5 w-5" aria-hidden="true" />
                            </span>
                            <div class="min-w-0">
                                <h3 class="text-sm font-semibold text-gray-900">{{ $t('messages.startTheConversation') }}</h3>
                                <p class="text-xs text-gray-500">{{ $t('messages.recipientsHint') }}</p>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <!-- Writing to a whole employee group: picking one fills the
                                 recipients with its members, which stays editable
                                 afterwards, so the group is a shortcut and not a
                                 second kind of conversation. -->
                            <div class="space-y-1" v-if="userStore.getUser?.company?.group_chat_enabled">
                                <FormLabel for="employee_groups" :label="$t('messages.employeeGroups')" />
                                <FormSelectMultiple id="employee_groups" :options="state.options.employeeGroups"
                                    :placeholder="$t('messages.selectEmployeeGroups')"
                                    v-model="state.formChat.employeeGroups" />
                                <p class="text-xs text-gray-500">{{ $t('messages.employeeGroupsHint') }}</p>
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="receivers" :label="$t('messages.recipients')" />
                                <FormSelectMultiple id="receivers" :options="state.options.receivers"
                                    :placeholder="$t('messages.selectRecipients')"
                                    v-model="state.formChat.receivers"
                                    v-if="userStore.getUser?.company?.group_chat_enabled" />
                                <FormSelect id="receivers" :options="state.options.receivers"
                                    :placeholder="$t('messages.selectRecipients')"
                                    v-model="state.formChat.receivers" v-else />
                                <FormError :error="v$?.formChat?.receivers?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.receiver_uuid?.[0]" />
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="subject" :label="$t('messages.subjectOptional')" />
                                <FormTextField id="subject" name="subject"
                                    :placeholder="$t('messages.subjectPlaceholder')" v-model="state.formChat.subject" />
                                <FormError :error="state?.error?.errors?.subject?.[0]" />
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="message" :label="$t('messages.message')" />
                                <FormTextArea id="message" name="message" :placeholder="$t('messages.messagePlaceholder')"
                                    v-model="state.formChat.message" @keydown="handleKeydown" />
                                <div class="flex items-center justify-between">
                                    <FormError :error="v$?.formChat?.message?.$errors[0]?.$message.toString()" />
                                    <span class="ml-auto text-[11px] text-gray-400">{{ $t('messages.sendHint') }}</span>
                                </div>
                                <FormError :error="state?.error?.errors?.message?.[0]" />
                            </div>
                        </div>

                        <div class="mt-6 flex items-center justify-end gap-2">
                            <button type="button" @click="closeModal"
                                class="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                                {{ $t('cancel') }}
                            </button>
                            <button type="submit" :disabled="!canSend"
                                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-600 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <Icon v-if="!state.isSending" name="ph:paper-plane-tilt" class="h-4 w-4" aria-hidden="true" />
                                <Icon v-else name="ph:circle-notch" class="h-4 w-4 animate-spin" aria-hidden="true" />
                                {{ $t('messages.send') }}
                            </button>
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
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'
import { userService } from '@/components/api/user/UserService'
import { useDepartmentStore } from '@/store/department'
import { employeeGroupService } from '@/components/api/user/EmployeeGroupService'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'chatCreated'])
const { t } = useI18n()
const departmentStore = useDepartmentStore()
const userStore = useUserStore() as any
const router = useRouter()
const userUuid = router?.currentRoute?.value?.query?.user_uuid

const state = reactive({
    error: {} as Error,
    formChat: {
        employeeGroups: [] as string[],
        message: '',
        receivers: [] as any,
        subject: '',
    },
    isPageLoading: false,
    isSending: false,
    options: {
        employeeGroups: [] as any[],
        receivers: [] as any[],
    },
    // The group's members, so deselecting a group takes its members out again
    // without touching anyone who was picked by hand.
    groupMembers: {} as Record<string, string[]>,
})

const canSend = computed(() => {
    const hasRecipients = Array.isArray(state.formChat.receivers)
        ? state.formChat.receivers.length > 0
        : !!state.formChat.receivers
    return hasRecipients && state.formChat.message.trim().length > 0 && !state.isSending
})

onMounted(() => {
    fetchAllAvailableChatUsers()
    if (userStore.getUser?.company?.group_chat_enabled) {
        fetchEmployeeGroups()
    }
    if (userUuid) {
        state.formChat.receivers.push(userUuid)
    }
})

watch(() => [...state.formChat.employeeGroups], (selected, previous) => {
    const members = (uuids: string[]) => uuids.flatMap((uuid) => state.groupMembers[uuid] ?? [])
    const added = members(selected.filter((uuid) => !(previous ?? []).includes(uuid)))
    const removed = members((previous ?? []).filter((uuid) => !selected.includes(uuid)))
    const stillWanted = new Set(members(selected))

    const receivers = Array.isArray(state.formChat.receivers) ? state.formChat.receivers : []
    const kept = receivers.filter((uuid: string) => !removed.includes(uuid) || stillWanted.has(uuid))

    state.formChat.receivers = Array.from(new Set([...kept, ...added]))
})

const rules = computed(() => {
    return {
        formChat: {
            message: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            receivers: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

function handleKeydown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault()
        sendMessage()
    }
}

function closeModal() {
    emit('close')
}

async function fetchAllAvailableChatUsers() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName
        }
        const response = await userService.getAllUsers(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (user: any) => options.push({
                    value: user?.uuid,
                    label: user?.firstname + " " + (user?.lastname ?? ''),
                })
            )
            state.options.receivers = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchEmployeeGroups() {
    try {
        const response = await employeeGroupService.getEmployeeGroups({ per_page: 200 })
        const groups = response?.data ?? []
        state.options.employeeGroups = groups.map((group: any) => ({
            value: group.uuid,
            label: group.department?.name ? `${group.name} (${group.department.name})` : group.name,
        }))
        state.groupMembers = Object.fromEntries(
            groups.map((group: any) => [group.uuid, (group.users ?? []).map((member: any) => member.uuid)])
        )
    } catch (error: any) {
        state.error = error
    }
}

async function sendMessage() {
    v$.value.$validate()
    if (!v$.value.$error) {
        state.isSending = true
        try {
            const params = {
                subject: state.formChat.subject,
                message: state.formChat.message,
                receiver_uuid: userStore.getUser?.company?.group_chat_enabled ?
                    state.formChat.receivers :
                    [state.formChat.receivers]
            }
            const response = await messageService.sendMessageViaReceiverUuid(params)
            if (response) {
                const chatUuid = response?.data?.chat?.uuid
                state.formChat.receivers = []
                state.formChat.employeeGroups = []
                state.formChat.subject = ''
                state.formChat.message = ''
                v$.value.$reset()
                emit('chatCreated')
                navigateTo(`/messages/${chatUuid}`)
                closeModal()
            }
        } catch (error: any) {
            state.error = error
        }
        state.isSending = false
    }
}
</script>
