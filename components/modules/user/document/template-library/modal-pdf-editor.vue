<template>
    <!--
        A KRAP worksheet from "Skabeloner" (task #94), filled in in the PDF editor and saved as a new
        PDF in a folder of the user's choice - the blank worksheet itself never changes. The editor is
        the same page the mobile app uses (utils/pdfFormEditorHtml.ts), shown here in a frame.
    -->
    <Modal size="4xl" :title="title" titleIcon="ph:file-pdf" titleIconColor="42AED9" :show="props.isModalOpen"
        @close="requestClose">
        <template #modal-body>
            <div class="space-y-4" data-testid="pdf-template-editor">
                <Alert type="danger" :text="state.error" v-if="state.error" />

                <form class="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end" @submit.prevent="save">
                    <div class="space-y-1">
                        <FormLabel for="pdf_template_filename" :label="$t('templateLibrary.pdfEditor.fileName')" />
                        <FormTextField id="pdf_template_filename" name="pdf_template_filename" v-model="state.filename"
                            :maxLength="150" :placeholder="$t('templateLibrary.pdfEditor.fileName')" data-testid="pdf-template-filename" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="pdf_template_folder" :label="$t('templateLibrary.pdfEditor.folder')" />
                        <FormSelect id="pdf_template_folder" v-model="state.folderUuid" :options="state.folders"
                            :placeholder="$t('templateLibrary.pdfEditor.rootFolder')" data-testid="pdf-template-folder" />
                    </div>
                    <div class="flex gap-2">
                        <FormButton type="button" buttonStyle="cancel" @click="requestClose">
                            {{ $t('cancel') }}
                        </FormButton>
                        <FormButton type="submit" buttonStyle="primary" :disabled="!state.isReady || state.isSaving"
                            data-testid="pdf-template-save">
                            <Icon v-if="state.isSaving" name="ph:spinner-gap" class="mr-1 size-4 animate-spin" />
                            {{ $t('templateLibrary.pdfEditor.save') }}
                        </FormButton>
                    </div>
                </form>

                <p class="text-xs text-gray-500">
                    {{ $t('templateLibrary.pdfEditor.intro') }}
                    <a v-if="props.template?.source_url" :href="props.template.source_url" target="_blank" rel="noopener"
                        class="underline">{{ $t('templateLibrary.pdfEditor.source', { source: props.template?.source }) }}</a>
                </p>

                <div class="relative h-[70vh] overflow-hidden rounded-xl border border-gray-200 bg-[#E5E9EE]">
                    <iframe v-if="state.html" ref="frame" :srcdoc="state.html" class="size-full"
                        :title="title" data-testid="pdf-template-frame" />
                    <div v-if="!state.isReady && !state.error" class="absolute inset-0 flex items-center justify-center">
                        <Icon name="ph:spinner-gap" class="size-8 animate-spin text-[#0F4C75]" />
                    </div>
                </div>
            </div>

            <DialogConfirmation :isModalOpen="state.isConfirmCloseOpen" :title="$t('templateLibrary.pdfEditor.discardTitle')"
                :message="$t('templateLibrary.pdfEditor.discardMessage')"
                :confirmLabel="$t('templateLibrary.pdfEditor.discard')"
                @close="state.isConfirmCloseOpen = false" @confirm="close" />
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formService } from '@/components/api/user/FormService'
import { citizenDocumentService } from '@/components/api/user/CitizenDocumentService'
import { documentService } from '@/components/api/user/DocumentService'
import { useAlert } from '@/composables/alert'
import { folderOptionLabel } from '@/utils/folderOptionLabel'
import { pdfFormEditorHtml } from '@/utils/pdfFormEditorHtml'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    area: {
        type: String as () => 'citizen' | 'company',
        required: true,
    },
    // The worksheet from the library: key, number, title, source, source_url.
    template: {
        type: Object as () => any,
        default: null,
    },
    citizenUuid: {
        type: String,
        default: '',
    },
    // The folder the user is in; the copy is saved there unless they pick another.
    presetFolderUuid: {
        type: String,
        default: '',
    },
})

const emit = defineEmits(['close', 'saved'])
const { t } = useI18n()
const { successAlert } = useAlert()
const frame = ref<HTMLIFrameElement | null>(null)

const state = reactive({
    html: '',
    filename: '',
    // null is the top of the documents area.
    folderUuid: null as string | null,
    folders: [] as { value: string, label: string }[],
    isReady: false,
    isSaving: false,
    isDirty: false,
    isConfirmCloseOpen: false,
    error: '',
})

const title = computed(() => props.template ? `${props.template.number} ${props.template.title}` : t('templateLibrary.title'))

function today(): string {
    const now = new Date()
    const pad = (value: number) => String(value).padStart(2, '0')
    return `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}`
}

async function load() {
    state.html = ''
    state.isReady = false
    state.isSaving = false
    state.isDirty = false
    state.error = ''
    state.filename = `${props.template?.title ?? ''} - ${today()}`
    state.folderUuid = props.presetFolderUuid || null
    loadFolders()
    try {
        const response = await formService.getPdfTemplate(props.template.key, props.area)
        const pdf = response?.data?.pdf
        if (!pdf) throw new Error()
        state.html = pdfFormEditorHtml(pdf, {
            addText: t('templateLibrary.pdfEditor.addText'),
            addTextHint: t('templateLibrary.pdfEditor.addTextHint'),
            done: t('templateLibrary.pdfEditor.done'),
            remove: t('templateLibrary.pdfEditor.remove'),
            textPlaceholder: t('templateLibrary.pdfEditor.textPlaceholder'),
            noFields: t('templateLibrary.pdfEditor.noFields'),
        })
    } catch (error: any) {
        state.error = error?.message || t('templateLibrary.pdfEditor.loadFailed')
    }
}

// Every folder by its path; none picked is the top of the documents area.
async function loadFolders() {
    state.folders = []
    try {
        const response = props.area === 'citizen'
            ? await citizenDocumentService.getAllFolders(props.citizenUuid)
            : await documentService.getAllFolders()
        state.folders = (response?.data ?? []).map((folder: any) => ({ value: folder.uuid, label: folderOptionLabel(folder) }))
    } catch (error) {
        // Without the list the copy still goes to the folder the user is in, or the top.
    }
}

function onMessage(event: MessageEvent) {
    if (!frame.value || event.source !== frame.value.contentWindow) return
    let message: any
    try {
        message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
    } catch (error) {
        return
    }
    if (message?.type === 'ready') state.isReady = true
    if (message?.type === 'changed') state.isDirty = true
    if (message?.type === 'saved') upload(message.data)
    if (message?.type === 'failed') {
        state.isSaving = false
        state.error = message.stage === 'save' ? t('templateLibrary.pdfEditor.saveFailed') : t('templateLibrary.pdfEditor.loadFailed')
    }
}

function save() {
    if (!state.isReady || state.isSaving) return
    if (!state.filename.trim()) {
        state.error = t('templateLibrary.pdfEditor.fileNameRequired')
        return
    }
    state.error = ''
    state.isSaving = true
    frame.value?.contentWindow?.postMessage(JSON.stringify({ type: 'save' }), '*')
}

function fileName(): string {
    const name = state.filename.trim().replace(/[\\/:*?"<>|\x00-\x1F]/g, '_').replace(/\.pdf$/i, '')
    return `${name || props.template?.title || 'KRAP'}.pdf`
}

async function upload(base64: string) {
    try {
        const binary = atob(base64)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        const file = new File([bytes], fileName(), { type: 'application/pdf' })

        const params = new FormData()
        params.append('files[]', file)
        params.append('type', 'file')
        params.append('is_admin_access', 'false')
        if (state.folderUuid) params.append('folder_uuid', state.folderUuid)

        let response: any
        if (props.area === 'citizen') {
            params.append('citizen_uuid', props.citizenUuid)
            response = await citizenDocumentService.saveCitizenFileFolder(params)
        } else {
            response = await documentService.saveFileFolder(params)
        }
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, t('templateLibrary.pdfEditor.saved'))
            emit('saved')
            close()
            return
        }
        state.error = t('templateLibrary.pdfEditor.saveFailed')
    } catch (error: any) {
        state.error = error?.message || t('templateLibrary.pdfEditor.saveFailed')
    }
    state.isSaving = false
}

function requestClose() {
    if (state.isSaving) return
    if (state.isDirty) {
        state.isConfirmCloseOpen = true
        return
    }
    close()
}

function close() {
    state.isConfirmCloseOpen = false
    state.html = ''
    emit('close')
}

onMounted(() => window.addEventListener('message', onMessage))
onBeforeUnmount(() => window.removeEventListener('message', onMessage))

watch(() => [props.isModalOpen, props.template?.key], ([isOpen]) => {
    if (isOpen && props.template) load()
}, { immediate: true })
</script>
