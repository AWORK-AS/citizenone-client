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
                            <!-- Colleagues and citizens are picked from two separate lists, never one
                                 mixed dropdown, so sensitive information meant for a colleague is not
                                 sent to a citizen by mistake. Only offered when there are citizens to
                                 write to; otherwise it is colleagues, as before. -->
                            <div class="space-y-1" v-if="hasCitizens">
                                <FormLabel for="recipient_type" :label="$t('messages.recipientType')" />
                                <div id="recipient_type" role="radiogroup" :aria-label="$t('messages.recipientType')"
                                    class="grid grid-cols-2 gap-2" data-testid="chat-recipient-type">
                                    <button v-for="option in recipientTypes" :key="option.value" type="button" role="radio"
                                        :aria-checked="state.recipientType === option.value"
                                        :data-testid="`chat-recipient-type-${option.value}`"
                                        @click="setRecipientType(option.value)"
                                        :class="['flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
                                            state.recipientType === option.value
                                                ? (option.value === 'citizens' ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-primary bg-primary-50 text-primary')
                                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300']">
                                        <Icon :name="option.icon" class="h-4 w-4" aria-hidden="true" />
                                        {{ option.label }}
                                    </button>
                                </div>
                            </div>

                            <!-- Writing to a whole employee group: picking one fills the
                                 recipients with its members, which stays editable
                                 afterwards, so the group is a shortcut and not a
                                 second kind of conversation. -->
                            <div class="space-y-1" v-if="userStore.getUser?.company?.group_chat_enabled && state.recipientType === 'employees'">
                                <FormLabel for="employee_groups" :label="$t('messages.employeeGroups')" />
                                <FormSelectMultiple id="employee_groups" :options="state.options.employeeGroups"
                                    :placeholder="$t('messages.selectEmployeeGroups')"
                                    v-model="state.formChat.employeeGroups" />
                                <p class="text-xs text-gray-500">{{ $t('messages.employeeGroupsHint') }}</p>
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="receivers" :label="receiversLabel" />
                                <FormSelectMultiple id="receivers" :key="`multi-${state.recipientType}`" :options="receiverOptions"
                                    :placeholder="receiversPlaceholder"
                                    v-model="state.formChat.receivers"
                                    v-if="userStore.getUser?.company?.group_chat_enabled" />
                                <FormSelect id="receivers" :key="`single-${state.recipientType}`" :options="receiverOptions"
                                    :placeholder="receiversPlaceholder"
                                    v-model="state.formChat.receivers" v-else />
                                <FormError :error="v$?.formChat?.receivers?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.receiver_uuid?.[0]" />
                            </div>

                            <!-- Said once more before sending: the message goes to a citizen, not a colleague. -->
                            <div v-if="state.recipientType === 'citizens'" role="note" data-testid="chat-citizen-warning"
                                class="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                                <Icon name="ph:warning" class="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                                <span>{{ $t('messages.citizenRecipientWarning') }}</span>
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

                            <div class="space-y-1">
                                <ModulesCitizenMessagesAttachmentPicker v-model="state.formChat.files" />
                                <FormError :error="attachmentError" />
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
import { required, requiredIf, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'
import { useChatCprWarning } from '@/composables/chatCprWarning'
import type { Error } from '@/types'
import { userService } from '@/components/api/user/UserService'
import { useDepartmentStore } from '@/store/department'
import { employeeGroupService } from '@/components/api/user/EmployeeGroupService'
import { citizenRecipientOptions, employeeRecipientOptions, recipientTypeOf, type RecipientType } from '@/composables/chatRecipients'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'chatCreated'])
const { t } = useI18n()
const { confirmChatText } = useChatCprWarning()
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
        files: [] as File[],
    },
    isPageLoading: false,
    isSending: false,
    // Colleagues or citizens: one list at a time, never mixed.
    recipientType: 'employees' as RecipientType,
    options: {
        employeeGroups: [] as any[],
        employees: [] as any[],
        citizens: [] as any[],
    },
    // The group's members, so deselecting a group takes its members out again
    // without touching anyone who was picked by hand.
    groupMembers: {} as Record<string, string[]>,
})

const hasCitizens = computed(() => state.options.citizens.length > 0)

const recipientTypes = computed(() => [
    { value: 'employees' as RecipientType, label: t('messages.recipientTypeEmployees'), icon: 'ph:users-three' },
    { value: 'citizens' as RecipientType, label: t('messages.recipientTypeCitizens'), icon: 'ph:user-circle' },
])

const receiverOptions = computed(() => state.recipientType === 'citizens' ? state.options.citizens : state.options.employees)
const receiversLabel = computed(() => state.recipientType === 'citizens' ? t('messages.citizenRecipients') : t('messages.recipients'))
const receiversPlaceholder = computed(() => state.recipientType === 'citizens' ? t('messages.selectCitizenRecipients') : t('messages.selectRecipients'))

// Changing the type starts the choice over, so nobody picked from the other list is carried along.
function setRecipientType(type: RecipientType) {
    if (state.recipientType === type) return
    state.recipientType = type
    state.formChat.employeeGroups = []
    state.formChat.receivers = userStore.getUser?.company?.group_chat_enabled ? [] : ''
    v$.value.$reset()
}

const canSend = computed(() => {
    const hasRecipients = Array.isArray(state.formChat.receivers)
        ? state.formChat.receivers.length > 0
        : !!state.formChat.receivers
    const hasContent = state.formChat.message.trim().length > 0 || state.formChat.files.length > 0
    return hasRecipients && hasContent && !state.isSending
})

onMounted(() => {
    fetchAllAvailableChatUsers()
    if (userStore.getUser?.company?.group_chat_enabled) {
        fetchEmployeeGroups()
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
            // A conversation can open with just a file, as a reply can.
            message: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`,
                    requiredIf(() => state.formChat.files.length === 0)),
            },
            receivers: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

// The server reports file errors per index (file.0, file.1, ...).
const attachmentError = computed(() => {
    const errors = (state?.error as any)?.errors ?? {}
    const key = Object.keys(errors).find((name) => name === 'file' || name.startsWith('file.'))
    return key ? errors[key]?.[0] : ''
})

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
        const [response, citizens] = await Promise.all([userService.getAllUsers(params), fetchCitizens()])
        state.options.employees = employeeRecipientOptions(response?.data)
        state.options.citizens = citizens
        preselectFromQuery()
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

// A clinic with the patient portal can open a conversation with a patient. The chat members list is the
// source: it holds the citizens with portal access (role Citizen) next to the staff.
async function fetchCitizens() {
    if (!userStore.getUser?.company?.patient_access_activated) return []

    try {
        const response = await messageService.getAllAvailableUsers()
        return citizenRecipientOptions(response?.data)
    } catch {
        // Colleagues stay selectable if the citizen list cannot be loaded.
        return []
    }
}

// "Write to" from someone's page opens on the list that person is in.
function preselectFromQuery() {
    if (typeof userUuid !== 'string' || !userUuid) return
    state.recipientType = recipientTypeOf(userUuid, state.options.citizens) ?? 'employees'
    state.formChat.receivers = userStore.getUser?.company?.group_chat_enabled ? [userUuid] : userUuid
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
        if (!(await confirmChatText(state.formChat.subject, state.formChat.message))) return
        state.isSending = true
        try {
            const receivers = userStore.getUser?.company?.group_chat_enabled ?
                state.formChat.receivers :
                [state.formChat.receivers]
            // Files need multipart; everything else keeps going as JSON.
            let params: any = {
                subject: state.formChat.subject,
                message: state.formChat.message,
                receiver_uuid: receivers,
            }
            if (state.formChat.files.length > 0) {
                params = new FormData()
                params.append('subject', state.formChat.subject ?? '')
                params.append('message', state.formChat.message ?? '')
                receivers.forEach((uuid: string) => params.append('receiver_uuid[]', uuid))
                state.formChat.files.forEach((file: File) => params.append('file[]', file))
            }
            const response = await messageService.sendMessageViaReceiverUuid(params)
            if (response) {
                const chatUuid = response?.data?.chat?.uuid
                state.formChat.receivers = []
                state.formChat.employeeGroups = []
                state.recipientType = 'employees'
                state.formChat.subject = ''
                state.formChat.message = ''
                state.formChat.files = []
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
