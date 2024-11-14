<template>
    <div>
        <Modal size="xs" :title="`${$t('superadmin.companies.importCompanies.importCompanies')}`"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="flex justify-end">
                        <button type="button" class="text-sm text-right text-primary hover:text-primary-700"
                            @click="downloadTemplate">
                            {{ $t('superadmin.companies.importCompanies.downloadTemplate') }}
                        </button>
                    </div>
                    <form @submit.prevent="importCompanies" class="mt-3">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-3">
                            <div>
                                <input type="file" ref="fileUpload" @change="handleFileChange" class="hidden" />
                                <div class="p-4 border border-dashed border-gray-400 cursor-pointer hover:border-2"
                                    @click="triggerFileInput">
                                    <div class="flex items-center justify-between text-xs">
                                        <p>
                                            {{ $t('chooseFile') }}
                                        </p>
                                        <Icon name="ph:upload-simple" class="h-6 w-6 text-gray-600"
                                            aria-hidden="true" />
                                    </div>
                                </div>
                                <div v-if="state.formImport.file.length > 0" class="mt-3 space-y-1">
                                    <p class="text-sm text-gray-700">{{ $t('selectedFile') }}:</p>
                                    <ul class="list-disc list-inside text-sm text-gray-600">
                                        <li v-for="(file, index) in state.formImport.file" :key="index">
                                            {{ file?.name }}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                                    {{ $t('superadmin.companies.importCompanies.importCompanies') }}
                                </FormButton>
                            </div>
                        </div>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { companyService } from '@/components/api/superadmin/CompanyService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { saveAs } from 'file-saver'

const { successAlert } = useAlert()
const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const { t } = useI18n()
const emit = defineEmits(['close'])
const fileUpload = ref<HTMLInputElement | null>(null)

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formImport: {
        file: [] as any,
    },
})

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        state.error = {}
    }
})

function closeModal() {
    emit('close')
}

function triggerFileInput() {
    if (fileUpload.value) {
        fileUpload.value.click()
    }
}

function handleFileChange(event: any) {
    state.formImport.file = event.target.files[0]
}

async function downloadTemplate() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await companyService.downloadTemplate()
        if (response) {
            saveAs(response, `${t('superadmin.companies.importCompanies.importTemplate')}`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function importCompanies() {
    state.isPageLoading = true
    state.error = {}
    try {
        const params = new FormData()
        params.append('file', state.formImport.file)
        const response = await companyService.importCompanies(params)
        if (response) {
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('superadmin.companies.importCompanies.alert.companiesSuccessfullyImported')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>