<template>
    <div class="w-screen h-screen bg-white flex flex-col overflow-hidden">
        <div class="app-drag-region flex items-center justify-between px-4 h-11 shrink-0 border-b border-gray-100">
            <div class="flex gap-1">
                <button type="button" @click="tab = 'note'" class="app-no-drag-region px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                    :class="tab === 'note' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-700'">
                    {{ $t('desktopQuickCapture.note') }}
                </button>
                <button type="button" @click="tab = 'message'" class="app-no-drag-region px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                    :class="tab === 'message' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-700'">
                    {{ $t('desktopQuickCapture.message') }}
                </button>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            <Alert type="danger" :text="error" v-if="error" />
            <Alert type="success" :text="$t('desktopQuickCapture.saved')" v-if="justSaved" />

            <template v-if="tab === 'note'">
                <div>
                    <FormLabel for="qc-citizen" :label="$t('desktopQuickCapture.citizen')" />
                    <FormSelect id="qc-citizen" :options="citizenOptions" v-model="note.citizenUuid"
                        :placeholder="$t('desktopQuickCapture.selectCitizen')" />
                </div>
                <div>
                    <FormLabel for="qc-title" :label="$t('desktopQuickCapture.title')" />
                    <FormTextField id="qc-title" name="qc-title" v-model="note.title"
                        :placeholder="$t('desktopQuickCapture.title')" />
                </div>
                <div>
                    <FormLabel for="qc-content" :label="$t('desktopQuickCapture.content')" />
                    <FormTextArea name="qc-content" v-model="note.content" :rows="4" auto-capitalize
                        :placeholder="$t('desktopQuickCapture.content')" />
                </div>
            </template>

            <template v-else>
                <div>
                    <FormLabel for="qc-receiver" :label="$t('desktopQuickCapture.to')" />
                    <FormSelect id="qc-receiver" :options="userOptions" v-model="message.receiverUuid"
                        :placeholder="$t('desktopQuickCapture.selectColleague')" />
                </div>
                <div>
                    <FormLabel for="qc-subject" :label="$t('desktopQuickCapture.subject')" />
                    <FormTextField id="qc-subject" name="qc-subject" v-model="message.subject"
                        :placeholder="$t('desktopQuickCapture.subject')" />
                </div>
                <div>
                    <FormLabel for="qc-message" :label="$t('desktopQuickCapture.message')" />
                    <FormTextArea name="qc-message" v-model="message.body" rows="4"
                        :placeholder="$t('desktopQuickCapture.message')" />
                </div>
            </template>
        </div>

        <div class="border-t border-gray-100 px-4 py-2.5 shrink-0 flex justify-end gap-2">
            <button type="button" @click="close" class="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100">
                {{ $t('cancel') }}
            </button>
            <button type="button" @click="save" :disabled="isSaving"
                class="px-3 py-1.5 rounded-lg bg-primary text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50">
                {{ $t('save') }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { citizenService } from '@/components/api/user/CitizenService'
import { userService } from '@/components/api/user/UserService'
import { journalService } from '@/components/api/user/JournalService'
import { messageService } from '@/components/api/user/MessageService'
import { useDepartmentStore } from '@/store/department'
import { useI18n } from 'vue-i18n'
import { useChatCprWarning } from '@/composables/chatCprWarning'

definePageMeta({ layout: false })

const { t } = useI18n()
const { confirmChatText } = useChatCprWarning()
const departmentStore = useDepartmentStore()
const tab = ref<'note' | 'message'>('note')
const citizenOptions = ref<any[]>([])
const userOptions = ref<any[]>([])
const error = ref('')
const isSaving = ref(false)
const justSaved = ref(false)

const note = reactive({ citizenUuid: '', title: '', content: '' })
const message = reactive({ receiverUuid: '', subject: '', body: '' })

function close() {
    window.close()
}

async function save() {
    error.value = ''
    isSaving.value = true
    try {
        if (tab.value === 'note') {
            if (!note.citizenUuid || !note.title) {
                error.value = t('desktopQuickCapture.missingNoteFields')
                return
            }
            await journalService.saveJournal({
                citizen_uuid: note.citizenUuid,
                title: note.title,
                date: moment().format('YYYY-MM-DD'),
                content: note.content,
                is_draft: false,
            })
        } else {
            if (!message.receiverUuid || !message.body) {
                error.value = t('desktopQuickCapture.missingMessageFields')
                return
            }
            if (!(await confirmChatText(message.subject || note.title, message.body))) return
            await messageService.sendMessageViaReceiverUuid({
                subject: message.subject || note.title,
                message: message.body,
                receiver_uuid: [message.receiverUuid],
            })
        }
        justSaved.value = true
        setTimeout(() => window.close(), 700)
    } catch (e: any) {
        error.value = e?.message ?? t('somethingWentWrong')
    } finally {
        isSaving.value = false
    }
}

onMounted(async () => {
    const department = departmentStore.getSelectedDepartmentName
    try {
        const [citizens, users] = await Promise.all([
            citizenService.getAllCitizens({}),
            userService.getAllUsersWithoutMyself({ department }),
        ])
        citizenOptions.value = (citizens?.data ?? []).map((c: any) => ({
            value: c?.uuid,
            label: `${c?.firstname ?? ''} ${c?.lastname ?? ''}`.trim(),
        }))
        userOptions.value = (users?.data ?? []).map((u: any) => ({
            value: u?.uuid,
            label: `${u?.firstname ?? ''} ${u?.lastname ?? ''}`.trim(),
        }))
    } catch {
        // Silent - both selects just stay empty, the form is still usable
        // once the user retries via the normal in-app flows.
    }
})
</script>
