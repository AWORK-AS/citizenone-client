<template>
    <div>
        <NuxtLayout name="patient">

            <Head>
                <Title>{{ $t('patient.nav.documents') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('patient.nav.documents') }}</template>

            <div class="mt-2 space-y-5">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div class="bg-white rounded-2xl border border-gray-200 px-6 py-5 space-y-3">
                    <p class="text-xs font-bold text-primary uppercase tracking-widest">
                        {{ $t('patient.documents.upload') }}
                    </p>
                    <p class="text-sm text-gray-500">{{ $t('patient.documents.uploadHelp') }}</p>
                    <div class="flex flex-wrap items-center gap-3">
                        <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" class="text-sm"
                            @change="onFileSelected" />
                        <FormButton type="button" buttonStyle="action" :disabled="!state.file || state.isUploading"
                            @click="upload">
                            {{ $t('patient.documents.saveFile') }}
                        </FormButton>
                    </div>
                </div>

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="state.documents.length === 0 && !state.isLoading">
                        <Alert type="info" :text="$t('patient.documents.empty')" />
                    </div>

                    <div v-else class="space-y-3">
                        <div v-for="document in state.documents" :key="document.uuid"
                            class="bg-white rounded-2xl border border-gray-200 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p class="font-semibold text-gray-900 flex items-center gap-2">
                                    <Icon name="heroicons:document-text" class="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    {{ document.name }}
                                </p>
                                <p class="mt-1 text-sm text-gray-500">{{ formatDate(document.created_at) }}</p>
                            </div>
                            <FormButton type="button" buttonStyle="action" @click="download(document)">
                                {{ $t('patient.documents.download') }}
                            </FormButton>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { saveAs } from 'file-saver'
import { patientDocumentService } from '@/components/api/patient/DocumentService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    isLoading: false,
    isUploading: false,
    documents: [] as any[],
    file: null as File | null,
})

function formatDate(date: any) {
    return date ? moment(date).format('DD-MM-YYYY') : '-'
}

onMounted(() => fetchDocuments())

async function fetchDocuments() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await patientDocumentService.getDocuments({})
        state.documents = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function onFileSelected(event: any) {
    state.file = event?.target?.files?.[0] ?? null
}

async function upload() {
    if (!state.file) return

    state.error = {}
    state.isUploading = true
    try {
        const formData = new FormData()
        formData.append('file', state.file)

        const response = await patientDocumentService.upload(formData)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, t('patient.documents.uploaded'))
            state.file = null
            await fetchDocuments()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isUploading = false
}

async function download(document: any) {
    state.error = {}
    try {
        const response = await patientDocumentService.download(document.uuid)
        if (response) saveAs(response, document.name)
    } catch (error: any) {
        state.error = error
    }
}
</script>
