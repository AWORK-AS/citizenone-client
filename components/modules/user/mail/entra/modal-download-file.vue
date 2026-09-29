<template>
    <div>
        <Modal size="md" :title="$t('mail.download')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="downloadAttachment()" id="formDownloadFile">
                        <div class="space-y-3">
                            <Alert type="danger" :text="state?.error?.message"
                                v-if="state.error?.message && state.error.message.length > 0" />
                            <fieldset class="space-y-1">
                                <div class="grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
                                    <label
                                        v-for="(downloadFile, downloadFileIndex) in state.options.downloadFileOptions"
                                        :key="downloadFileIndex" :aria-label="downloadFile.title"
                                        class="group relative flex rounded-lg border border-gray-300 bg-white p-4 has-[:disabled]:border-gray-400 has-[:disabled]:bg-gray-200 has-[:disabled]:opacity-25 has-[:checked]:outline has-[:focus-visible]:outline has-[:checked]:outline-2 has-[:focus-visible]:outline-[3px] has-[:checked]:-outline-offset-2 has-[:focus-visible]:-outline-offset-1 has-[:checked]:outline-secondary">
                                        <input type="radio" name="mailing-list" :value="downloadFile.id"
                                            :checked="downloadFile === state.options.downloadFileOptions[0]"
                                            class="absolute inset-0 appearance-none focus:outline focus:outline-0"
                                            v-model="state.formDownload.fileOption" />
                                        <div class="flex-1">
                                            <p class="block text-sm font-medium text-gray-900">
                                                <span v-if="downloadFile.title === 'Download file to my computer'">
                                                    {{ $t('mail.downloadFile.downloadFileToMyComputer') }}
                                                </span>
                                                <span
                                                    v-if="downloadFile.title === 'Download file to citizen\'s folder'">
                                                    {{ $t('mail.downloadFile.downloadFileToCitizensFolder') }}
                                                </span>
                                                <span v-if="downloadFile.title === 'Add file to inquiry'">
                                                    {{ $t('mail.downloadFile.addFileToInquiry') }}
                                                </span>
                                                <span
                                                    v-if="downloadFile.title === 'Download file to organization\'s folder'">
                                                    {{
                                                        $t('mail.downloadFile.downloadFileToOrganizationsFolder')
                                                    }}
                                                </span>
                                            </p>
                                        </div>
                                        <Icon name="heroicons:check-circle-20-solid"
                                            class="invisible size-5 text-secondary group-has-[:checked]:visible"
                                            aria-hidden="true" />
                                    </label>
                                </div>
                            </fieldset>
                            <div class="space-y-3"
                                v-if="state.formDownload.fileOption === 'Download file to citizen\'s folder'">
                                <div class="space-y-1">
                                    <FormLabel for="citizen_uuid" :label="$t('mail.downloadFile.citizen')" />
                                    <FormSelectMultiple id="citizen_uuid" v-model="state.formDownload.citizens_uuid"
                                        :options="state.options.citizens" />
                                    <FormError
                                        :error="v$?.formDownload?.citizens_uuid?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.citizens_uuid?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="citizen_folder_uuid"
                                        :label="$t('mail.downloadFile.citizenFolder')" />
                                    <FormSelect id="citizen_folder_uuid"
                                        v-model="state.formDownload.citizen_folder_uuid"
                                        :options="state.options.citizen_folders" />
                                    <FormError
                                        :error="v$?.formDownload?.citizen_folder_uuid?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.citizen_folder_uuid?.[0]" />
                                </div>
                            </div>
                            <div class="space-y-1"
                                v-if="state.formDownload.fileOption === 'Download file to organization\'s folder'">
                                <FormLabel for="company_folder_uuid"
                                    :label="$t('mail.downloadFile.organizationFolder')" />
                                <FormSelect id="company_folder_uuid" v-model="state.formDownload.company_folder_uuid"
                                    :options="state.options.company_folders" />
                                <FormError
                                    :error="v$?.formDownload?.company_folder_uuid?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.company_folder_uuid?.[0]" />
                            </div>
                            <div class="space-y-1"
                                v-if="state.formDownload.fileOption === 'Add file to inquiry'">
                                <FormLabel for="inquiry_uuid" :label="$t('mail.downloadFile.inquiry')" />
                                <FormSelect id="inquiry_uuid" v-model="state.formDownload.inquiry_uuid"
                                    :options="state.options.inquiries" :searchable="true" />
                                <p class="text-xs text-gray-500">{{ $t('mail.downloadFile.inquiryHint') }}</p>
                                <FormError
                                    :error="v$?.formDownload?.inquiry_uuid?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.attachments?.[0]" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" @click="emit('close')">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary">
                                    {{ $t('mail.download') }}
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
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { citizenService } from '@/components/api/user/CitizenService'
import { citizenDocumentService } from '@/components/api/user/CitizenDocumentService'
import { documentService } from '@/components/api/user/DocumentService'
import { mailEntraService } from "@/components/api/user/MailEntraService"
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { citizenInquiryService } from '@/components/api/user/CitizenInquiryService'
import { inquiryDocumentService } from '@/components/api/user/InquiryDocumentService'
import { canOpenPage } from '@/composables/pageAccess'
import { useUserStore } from '@/store/user'
import { saveAs } from 'file-saver'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedAttachment: {
        type: String,
        required: true,
    },
    // The message the attachment belongs to, in the user's own mailbox, and
    // which folder it sits in. Only needed to add the file to an inquiry: the
    // server reads it straight from the mailbox rather than from a stored copy.
    messageId: {
        type: [String, Number],
        default: '',
    },
    folder: {
        type: String,
        default: 'inbox',
    },
})
const emit = defineEmits(['close'])
const { t } = useI18n()
const { successAlert } = useAlert()
const userStore = useUserStore() as any

// Adding to an inquiry is only offered where the inquiry itself can be opened.
const canAddToInquiry = computed(() => canOpenPage(userStore.getUser, 'Inquiries', 'inquiry_pipeline_enabled'))

const state = reactive({
    formDownload: {
        citizens_uuid: [],
        citizen_folder_uuid: '',
        company_folder_uuid: '',
        inquiry_uuid: '',
        fileOption: 'Download file to my computer',
    },
    error: {} as Error,
    isPageLoading: false,
    options: {
        citizens: [] as any,
        citizen_folders: [] as any,
        company_folders: [] as any,
        inquiries: [] as any,
        downloadFileOptions: [
            { id: 'Download file to my computer', title: 'Download file to my computer' },
            { id: 'Download file to citizen\'s folder', title: 'Download file to citizen\'s folder' },
            { id: 'Download file to organization\'s folder', title: 'Download file to organization\'s folder' },
        ],
    }
})

watch(canAddToInquiry, (allowed: boolean) => {
    const option = { id: 'Add file to inquiry', title: 'Add file to inquiry' }
    const has = state.options.downloadFileOptions.some((o: any) => o.id === option.id)
    if (allowed && !has) state.options.downloadFileOptions.push(option)
    if (!allowed && has) state.options.downloadFileOptions = state.options.downloadFileOptions.filter((o: any) => o.id !== option.id)
}, { immediate: true })

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    state.formDownload.fileOption = 'Download file to my computer'
})

watch(() => state.formDownload.fileOption, (fileOption: any) => {
    if (fileOption === 'Download file to my computer') {
        state.formDownload.citizens_uuid = []
        state.formDownload.citizen_folder_uuid = ''
        state.formDownload.company_folder_uuid = ''
    } else if (fileOption === 'Download file to citizen\'s folder') {
        fetchAllCitizens()
        state.formDownload.citizens_uuid = []
        state.formDownload.citizen_folder_uuid = ''
        state.formDownload.company_folder_uuid = ''
    } else if (fileOption === 'Download file to organization\'s folder') {
        fetchAllCompanyFolders()
        state.formDownload.citizens_uuid = []
        state.formDownload.citizen_folder_uuid = ''
        state.formDownload.company_folder_uuid = ''
    } else if (fileOption === 'Add file to inquiry') {
        fetchInquiries()
        state.formDownload.citizens_uuid = []
        state.formDownload.citizen_folder_uuid = ''
        state.formDownload.company_folder_uuid = ''
    }
    state.formDownload.inquiry_uuid = ''
})

watch(() => state.formDownload.citizens_uuid, () => {
    fetchAllCitizenFolders()
})

const rules = computed(() => {
    if (state.formDownload.fileOption === 'Download file to citizen\'s folder') {
        return {
            formDownload: {
                citizens_uuid: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
                citizen_folder_uuid: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    } else if (state.formDownload.fileOption === 'Download file to organization\'s folder') {
        return {
            formDownload: {
                company_folder_uuid: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }    } else if (state.formDownload.fileOption === 'Add file to inquiry') {
        return {
            formDownload: {
                inquiry_uuid: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

async function fetchAllCitizens() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {}
        const response = await citizenService.getAllCitizensPerCurrentUserAssignment(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item?.uuid,
                    label: item.firstname + " " + (item.lastname ? item.lastname : ''),
                })
            )
            state.options.citizens = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAllCitizenFolders() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizens_uuid: Array(state.formDownload.citizens_uuid),
        }
        const response = await citizenDocumentService.getAllFoldersPerCitizen(params)
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.citizen_folders = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAllCompanyFolders() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await documentService.getAllFolders()
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.company_folders = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchInquiries() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await citizenInquiryService.getInquiries({ page_length: 500, sortField: 'inquiry_date', sortOrder: 'descend' })
        state.options.inquiries = (response?.data ?? []).map((item: any) => {
            const name = `${item?.firstname ?? ''} ${item?.lastname ?? ''}`.trim()
            const title = item?.purpose || name || item?.inquirer_name || '-'
            const date = item?.inquiry_date ? ` (${item.inquiry_date})` : ''
            return {
                value: item?.uuid,
                label: `${title}${item?.inquirer_name && item.inquirer_name !== title ? ' - ' + item.inquirer_name : ''}${date}`,
            }
        })
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

/**
 * The attachment's name as the inbox lists it, which is what the server
 * matches on: the last path segment of its URL, without the signature.
 */
function attachmentName(url: string): string {
    const path = (url || '').split('?')[0]
    return decodeURIComponent(path.split('/').pop() || '')
}

/**
 * The message id, from the prop when the list knows it and otherwise from the
 * attachment URL, which carries it as the folder the file was stored under.
 */
function messageIdFor(url: string): string {
    if (props.messageId) return String(props.messageId)
    const segments = (url || '').split('?')[0].split('/')
    return segments.length >= 2 ? decodeURIComponent(segments[segments.length - 2]) : ''
}

async function addToInquiry() {
    const response = await inquiryDocumentService.addFromMail(state.formDownload.inquiry_uuid, {
        message_id: messageIdFor(props.selectedAttachment),
        folder: props.folder === 'sent' ? 'sent' : 'inbox',
        attachments: [attachmentName(props.selectedAttachment)],
    })
    if (response) {
        successAlert(`${t('alert.success')}!`, `${t('mail.downloadFile.alert.fileSuccessfullyAddedToInquiry')}.`)
        emit('close')
    }
}

async function downloadAttachment() {
    v$.value.$validate()
    if (!v$.value.$error) {
        state.isPageLoading = true
        state.error = {}
        try {
            if (state.formDownload.fileOption === 'Add file to inquiry') {
                await addToInquiry()
                state.isPageLoading = false
                return
            }
            const params = {
                file_url: props?.selectedAttachment
            } as any
            if (state.formDownload.citizen_folder_uuid) {
                params.citizen_folder_uuid = state.formDownload.citizen_folder_uuid
            }
            else if (state.formDownload.company_folder_uuid) {
                params.company_folder_uuid = state.formDownload.company_folder_uuid
            }
            const response = await mailEntraService.downloadAttachment(params)
            if (response) {
                if (state.formDownload.fileOption === 'Download file to my computer') {
                    saveAs(response, props?.selectedAttachment?.split('/').pop())
                } else if (state.formDownload.fileOption === 'Download file to citizen\'s folder') {
                    successAlert(`${t('alert.success')}!`, `${t('mail.downloadFile.alert.fileSuccessfullyDownloadedToCitizensFolder')}.`)
                } if (state.formDownload.fileOption === 'Download file to organization\'s folder') {
                    successAlert(`${t('alert.success')}!`, `${t('mail.downloadFile.alert.fileSuccessfullyDownloadedToOrganizationsFolder')}.`)
                }
            }
        } catch (error: any) {
            state.error.message = error?.message || 'An error occurred during the download.'
        }
        state.isPageLoading = false
    }
}
</script>

<style>
#formDownloadFile .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>