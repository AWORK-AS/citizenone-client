<template>
    <div class="grid gap-6 xl:grid-cols-2">

        <!-- Shared folders -->
        <section class="bg-white ring-1 ring-gray-200 rounded-2xl p-6 shadow-sm">
            <div class="flex items-center justify-between gap-3">
                <div>
                    <h2 class="text-lg font-semibold text-gray-900">{{ $t('guestPortal.sharedFolders') }}</h2>
                    <p class="text-sm text-gray-600">{{ $t('guestPortal.selectFolderToViewContents') }}</p>
                </div>
                <FormButton type="button" buttonStyle="outline" size="sm" @click="emit('refresh')">
                    {{ $t('guestPortal.refresh') }}
                </FormButton>
            </div>

            <div class="mt-5 grid gap-3">
                <button v-for="folder in folders" :key="folder.uuid || folder.id" type="button"
                    class="text-left rounded-xl border border-gray-200 p-4 hover:border-primary hover:bg-primary/5 transition"
                    :class="state.selectedFolder?.id === folder.id ? 'border-primary bg-primary/5' : ''"
                    @click="openFolder(folder)">
                    <div class="flex items-center justify-between gap-3">
                        <div>
                            <p class="font-semibold text-gray-900">{{ folder.name }}</p>
                            <p class="text-xs text-gray-500">{{ folder.files?.length || 0 }} {{ $t('guestPortal.files')
                            }}</p>
                        </div>
                        <Icon name="ph:folder" class="h-5 w-5 text-primary" />
                    </div>
                </button>
                <p v-if="!folders?.length" class="text-sm text-gray-600">
                    {{ $t('guestPortal.noFoldersShared') }}
                </p>
            </div>

            <div v-if="state.folderContents?.length" class="mt-6 border-t pt-5">
                <h3 class="font-semibold text-gray-900 mb-3">{{ state.selectedFolder?.name }} {{
                    $t('guestPortal.contents') }}</h3>
                <div class="space-y-2">
                    <div v-for="item in state.folderContents" :key="item.uuid || item.id"
                        class="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3">
                        <div>
                            <p class="font-medium text-gray-900">{{ item.name }}</p>
                            <p class="text-xs text-gray-500">{{ item.type }}</p>
                        </div>
                        <FormButton type="button" buttonStyle="outline" size="sm" @click="downloadItem(item)">
                            {{ $t('guestPortal.download') }}
                        </FormButton>
                    </div>
                </div>
            </div>
        </section>

        <!-- Shared reports -->
        <section class="bg-white ring-1 ring-gray-200 rounded-2xl p-6 shadow-sm">
            <div class="flex items-center justify-between gap-3">
                <div>
                    <h2 class="text-lg font-semibold text-gray-900">{{ $t('guestPortal.sharedReports') }}</h2>
                    <p class="text-sm text-gray-600">{{ $t('guestPortal.filesAvailableThroughLink') }}</p>
                </div>
                <FormButton type="button" buttonStyle="outline" size="sm" @click="emit('refreshReports')">
                    {{ $t('guestPortal.refresh') }}
                </FormButton>
            </div>

            <div class="mt-5 space-y-3">
                <div v-for="report in reports" :key="report.uuid || report.id"
                    class="rounded-xl border border-gray-200 p-4">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <p class="font-semibold text-gray-900">{{ report.name }}</p>
                        </div>
                        <FormButton type="button" buttonStyle="outline" size="sm" @click="downloadItem(report)">
                            {{ $t('guestPortal.download') }}
                        </FormButton>
                    </div>
                </div>
                <p v-if="!reports?.length" class="text-sm text-gray-600">
                    {{ $t('guestPortal.noReportsShared') }}
                </p>
            </div>
        </section>

    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { caseworkerService } from '@/components/api/guest/CaseworkerService'

defineOptions({ name: 'ModulesGuestCaseworkerReportsTab' })

const props = defineProps({
    folders: {
        type: Array as PropType<any[]>,
        default: () => [],
    },
    reports: {
        type: Array as PropType<any[]>,
        default: () => [],
    },
    caseworkerUuid: {
        type: String,
        required: true,
    },
})

const emit = defineEmits<{
    (e: 'refresh'): void
    (e: 'refreshReports'): void
}>()

const state = reactive({
    selectedFolder: null as any,
    folderContents: [] as any[],
})

async function openFolder(folder: any) {
    state.selectedFolder = folder
    const response = await caseworkerService.getFolderContents(
        props.caseworkerUuid,
        folder.uuid || folder.id,
    )
    state.folderContents = response?.data ?? response ?? []
}

async function downloadItem(item: any) {
    try {
        const fileUuid = item.uuid || item.file_uuid || item.id
        const blob = await caseworkerService.downloadFile(props.caseworkerUuid, fileUuid)
        const url = window.URL.createObjectURL(blob || item.file_url || '')
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = item.name || 'download'
        anchor.click()
        window.URL.revokeObjectURL(url)
    } catch (_) {
        // silently ignore
    }
}
</script>
