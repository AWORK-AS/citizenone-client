<template>
    <div>
        <Modal size="xs" :title="`${$t('employees.importEmployees.importEmployees')}`" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="flex justify-end">
                        <button type="button" class="text-sm text-right text-primary hover:text-primary-700"
                            @click="downloadTemplate">
                            {{ $t('employees.importEmployees.downloadTemplate') }}
                        </button>
                    </div>
                    <form @submit.prevent="importEmployees" class="mt-3">
                        <Alert v-if="state.error?.message" type="danger" :text="state.error.message" />
                        <div class="space-y-3">
                            <div>
                                <input type="file" ref="fileUpload" @change="handleFileChange" class="hidden" />
                                <div class="p-4 border border-dashed border-gray-400 cursor-pointer hover:border-2"
                                    @click="triggerFileInput">
                                    <div class="flex items-center justify-between text-xs">
                                        <p>{{ $t('chooseFile') }}</p>
                                        <Icon name="ph:upload-simple" class="h-6 w-6 text-gray-600"
                                            aria-hidden="true" />
                                    </div>
                                </div>
                                <div v-if="state.formImport.file" class="mt-3 space-y-1">
                                    <p class="text-sm text-gray-700">{{ $t('selectedFile') }}:</p>
                                    <ul class="list-disc list-inside text-sm text-gray-600">
                                        <li>{{ state.formImport.file.name }}</li>
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
                                    {{ $t('employees.importEmployees.importEmployees') }}
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
import { employeeService } from '@/components/api/user/EmployeeService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
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
    error: {} as { message?: string },
    isPageLoading: false,
    formImport: {
        file: null as File | null,
    },
})

watch(() => props.isModalOpen, (isModalOpen) => {
    if (isModalOpen) {
        state.error = {}
        state.formImport.file = null
    }
})

function closeModal() {
    emit('close')
}

function triggerFileInput() {
    fileUpload.value?.click()
}

function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
        state.formImport.file = target.files[0]
    }
}

async function downloadTemplate() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await employeeService.downloadImportEmployeesTemplate()
        if (response) {
            saveAs(response, `${t('employees.importEmployees.importTemplate')}`)
        }
    } catch (error: any) {
        state.error.message = error?.message || 'An error occurred during the download.'
    }
    state.isPageLoading = false
}

async function importEmployees() {
    if (!state.formImport.file) {
        state.error.message = `${t('employees.importEmployees.noFileSelected')}`
        return
    }

    state.isPageLoading = true
    state.error = {}
    try {
        const params = new FormData()
        params.append('file', state.formImport.file)
        const response = await employeeService.importEmployees(params)
        if (response) {
            closeModal()
            successAlert(`${t('alert.success')}!`, response?.message)
        }
    } catch (error: any) {
        state.error.message = error?.message || 'An error occurred during the import.'
    }
    state.isPageLoading = false
}
</script>
