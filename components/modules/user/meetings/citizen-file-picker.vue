<template>
    <Modal size="md" :title="$t('meetings.files.pickTitle')" :show="show" @close="emit('close')">
        <template #modal-body>
            <div class="space-y-3">
                <div class="flex items-center gap-2 text-sm text-gray-500">
                    <button type="button" class="hover:text-[#0f2b46]" @click="open(null)">{{ $t('meetings.files.root') }}</button>
                    <template v-for="folder in state.path" :key="folder.uuid">
                        <Icon name="ph:caret-right" class="h-3 w-3" />
                        <button type="button" class="hover:text-[#0f2b46]" @click="open(folder)">{{ folder.name }}</button>
                    </template>
                </div>
                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />
                <LoadingSpinner :isActive="state.isLoading">
                    <ul class="divide-y divide-gray-100 max-h-[50vh] overflow-y-auto">
                        <li v-if="!state.items.length" class="py-6 text-center text-sm text-gray-400">{{ $t('meetings.files.empty') }}</li>
                        <li v-for="item in state.items" :key="item.uuid">
                            <button type="button" class="w-full flex items-center gap-3 px-2 py-2.5 text-left text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                :disabled="!!state.sending" @click="item.type === 'folder' ? open(item) : pick(item)">
                                <Icon :name="item.type === 'folder' ? 'ph:folder' : 'ph:file-text'" class="h-5 w-5 text-gray-400 shrink-0" />
                                <span class="flex-1 truncate">{{ item.name }}</span>
                                <Icon v-if="state.sending === item.uuid" name="ph:spinner" class="h-4 w-4 animate-spin" />
                                <Icon v-else-if="item.type === 'folder'" name="ph:caret-right" class="h-4 w-4 text-gray-300" />
                            </button>
                        </li>
                    </ul>
                </LoadingSpinner>
                <p class="text-xs text-gray-500">{{ $t('meetings.files.hint') }}</p>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { citizenDocumentService } from '@/components/api/user/CitizenDocumentService'
import { sharedFileName } from '@/utils/meetings'

/**
 * Pick one of the citizen's documents to send to the others in a meeting.
 * The file is fetched with the user's own access (the same as opening it on
 * the citizen's page) and handed to the room as a File.
 */
const props = defineProps<{ show: boolean, citizenUuid: string }>()
const emit = defineEmits(['close', 'picked'])

const state = reactive({
    items: [] as any[],
    path: [] as any[],
    isLoading: false,
    sending: '' as string,
    error: {} as any,
})

watch(() => props.show, (show) => { if (show) open(null) }, { immediate: true })

async function open(folder: any | null) {
    state.isLoading = true
    state.error = {}
    if (!folder) state.path = []
    else {
        const index = state.path.findIndex((f) => f.uuid === folder.uuid)
        state.path = index >= 0 ? state.path.slice(0, index + 1) : [...state.path, folder]
    }
    try {
        const response = await citizenDocumentService.getCitizenFileFolders({
            citizen_uuid: props.citizenUuid,
            ...(folder && { folder_uuid: folder.uuid }),
            page: 1,
        })
        state.items = response?.data ?? []
    } catch (error: any) {
        state.error = error
        state.items = []
    }
    state.isLoading = false
}

async function pick(item: any) {
    state.sending = item.uuid
    try {
        const blob = await citizenDocumentService.viewCitizenFile(item.uuid)
        if (blob) {
            emit('picked', new File([blob], sharedFileName(item.name, item.file_url), { type: blob.type || 'application/octet-stream' }))
            emit('close')
        }
    } catch (error: any) {
        state.error = error
    }
    state.sending = ''
}
</script>
