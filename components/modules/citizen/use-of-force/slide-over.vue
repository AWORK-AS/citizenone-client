<template>
    <TransitionRoot as="template" :show="props.isOpen">
        <Dialog class="relative z-50" @close="closeSlide">
            <div class="fixed inset-0" />

            <div class="fixed inset-0 overflow-hidden">
                <div class="absolute inset-0 overflow-hidden">
                    <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                        <TransitionChild as="template"
                            enter="transform transition ease-in-out duration-500 sm:duration-600"
                            enter-from="translate-x-full" enter-to="translate-x-0"
                            leave="transform transition ease-in-out duration-500 sm:duration-700"
                            leave-from="translate-x-0" leave-to="translate-x-full">
                            <DialogPanel class="pointer-events-auto w-screen max-w-4xl">
                                <div class="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                                    <LoadingSpinner :isActive="state.isPageLoading">
                                        <div class="px-4 sm:px-6">
                                            <div class="flex items-start justify-between">
                                                <DialogTitle class="text-base font-semibold leading-6 text-gray-900">
                                                    {{ $t('citizens.useOfForce.useOfForce') }}
                                                </DialogTitle>
                                                <div class="ml-3 flex h-7 items-center">
                                                    <button type="button"
                                                        class="relative rounded-md bg-white text-tertiary-800 hover:text-tertiary focus:outline-none"
                                                        @click="closeSlide">
                                                        <span class="absolute -inset-2.5" />
                                                        <span class="sr-only">Close panel</span>
                                                        <Icon name="ph:x" class="h-6 w-6" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="relative mt-10 flex-1 px-4 sm:px-6">
                                            <Alert type="danger" :text="state?.error?.message"
                                                v-if="state.error?.message && state.error.message.length > 0" />
                                            <input type="file" ref="file" @change="onFileChange" class="hidden" />
                                            <div>
                                                <div class="space-y-5">
                                                    <div class="bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-4 border-secondary"
                                                        v-for="(useOfForce, index) in state.useOfForce?.data"
                                                        :key="index">
                                                        <Badge type="harmless" class="text-xxs truncate w-fit"
                                                            v-if="useOfForce?.risk_level === 'harmless'">
                                                            {{ $t('citizens.useOfForce.table.riskLevels.harmless') }}
                                                        </Badge>
                                                        <Badge type="low-risk" class="text-xxs truncate w-fit"
                                                            v-if="useOfForce?.risk_level === 'low-risk'">
                                                            {{
                                                                $t('citizens.useOfForce.table.riskLevels.lowRisk')
                                                            }}
                                                        </Badge>
                                                        <Badge type="moderate-risk" class="text-xxs truncate w-fit"
                                                            v-if="useOfForce?.risk_level === 'moderate-risk'">
                                                            {{
                                                                $t('citizens.useOfForce.table.riskLevels.moderateRisk')
                                                            }}
                                                        </Badge>
                                                        <Badge type="high-risk" class="text-xxs truncate w-fit"
                                                            v-if="useOfForce?.risk_level === 'high-risk'">
                                                            {{ $t('citizens.useOfForce.table.riskLevels.highRisk') }}
                                                        </Badge>
                                                        <div class="flex justify-between">
                                                            <div>
                                                                <div class="grow space-y-1.5">
                                                                    <p class="mt-1 text-xs text-muted-400">
                                                                        <span>
                                                                            {{
                                                                                formatDateToReadable(useOfForce.date_time)
                                                                            }}
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                                <p class="text-sm">
                                                                    {{
                                                                        $t('citizens.useOfForce.table.reportedBy')
                                                                    }}:
                                                                    {{ useOfForce?.user?.firstname }}
                                                                    {{ useOfForce?.user?.lastname }}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <FormButton @click="viewStatuses(useOfForce)">
                                                                    {{ $t('citizens.useOfForce.table.statuses') }}
                                                                </FormButton>
                                                            </div>
                                                            <div v-if="useOfForce?.is_form_missing"
                                                                @click="attachUseOfForceAttachment(useOfForce)">
                                                                <button class="flex items-center text-xs gap-x-2">
                                                                    <Icon name="ph:warning"
                                                                        class="h-5 w-5 text-yellow-500"
                                                                        aria-hidden="true" />
                                                                    {{
                                                                        $t('citizens.useOfForce.table.missingAttachment')
                                                                    }}. <br />
                                                                    {{
                                                                        $t('citizens.useOfForce.table.clickToUpload')
                                                                    }}.
                                                                </button>
                                                                <FormError :error="state?.error?.errors?.file?.[0]"
                                                                    class="text-center" />
                                                            </div>
                                                            <div class="flex items-center gap-x-3" v-else>
                                                                <button
                                                                    class="flex items-center gap-x-1 text-xs text-primary hover:text-primary-700"
                                                                    @click="downloadAttachment(useOfForce)">
                                                                    <Icon name="ph:download" class="h-4 w-4"
                                                                        aria-hidden="true" />
                                                                    {{ $t('citizens.useOfForce.table.download') }}
                                                                </button>
                                                                <button
                                                                    class="flex items-center gap-x-1 text-xs text-red-500 hover:text-red-700"
                                                                    @click="confirmAttachmentDeletion(useOfForce)">
                                                                    <Icon name="ph:trash" class="h-4 w-4"
                                                                        aria-hidden="true" />
                                                                    {{
                                                                        $t('citizens.useOfForce.table.deleteAttachment')
                                                                    }}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div v-if="state.useOfForce?.data?.length === 0">
                                                        <p class="text-center py-10">
                                                            {{ $t('theresNoDataAvailableToDisplay') }}.
                                                        </p>
                                                    </div>
                                                    <Pagination :data="state.useOfForce" @previous="previous"
                                                        @next="next" />
                                                </div>
                                            </div>
                                        </div>
                                    </LoadingSpinner>
                                </div>
                                <DialogConfirmation :isModalOpen="state.modal.isDeleteAttachmentOpen"
                                    :message="$t('citizens.useOfForce.table.confirmation.deleteAttachmentConfirmation') + '?'"
                                    @close="state.modal.isDeleteAttachmentOpen = false" @confirm="deleteAttachment" />
                                <ModulesCitizenUseOfForceStatusModalStatuses :isModalOpen="state.modal.isStatusesOpen"
                                    :selectedData="state.selectedUseOfForce" @close="closeStatusesModal"
                                    @refreshData="fetchUseOfForce" />
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useOfForceService } from '@/components/api/UseOfForceService'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { saveAs } from 'file-saver'

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])
const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
let currentTablePage = 1
const file = ref<HTMLInputElement | null>(null)

function closeSlide() {
    emit('close')
}

const state = reactive({
    error: {} as Error,
    formUseOfForce: {
        file: ''
    } as any,
    useOfForce: [] as any,
    isPageLoading: false,
    modal: {
        isDeleteAttachmentOpen: false,
        isStatusesOpen: false,
    },
    selectedUseOfForce: {} as any,
    sortData: {
        sortField: 'date_time',
        sortOrder: 'descend',
    },
})

watch(() => props.isOpen, (isOpen: any) => {
    if (isOpen) {
        fetchUseOfForce()
    }
})

async function fetchUseOfForce() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        }
        const response = await useOfForceService.getUseOfForces(params)
        if (response) {
            state.useOfForce = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function previous() {
    currentTablePage--
    fetchUseOfForce()
}

function next() {
    currentTablePage++
    fetchUseOfForce()
}

function viewStatuses(useOfForce: any) {
    state.selectedUseOfForce = useOfForce
    state.modal.isStatusesOpen = true
}

function closeStatusesModal() {
    state.modal.isStatusesOpen = false
}

function attachUseOfForceAttachment(useOfForce: any) {
    state.selectedUseOfForce = useOfForce
    if (file.value) {
        file.value.click()
    }
}

function onFileChange(event: any) {
    state.formUseOfForce.file = event.target.files[0]
    uploadUseOfForceAttachment()
}

async function uploadUseOfForceAttachment() {
    state.error = {}
    state.isPageLoading = true
    try {
        const useOfForceUuid = state.selectedUseOfForce?.uuid
        let params = new FormData()
        params.append('citizen_uuid', citizenUuid.toString())
        params.append('file', state.formUseOfForce.file)
        const response = await useOfForceService.uploadUseOfForceAttachment(useOfForceUuid, params)
        if (response?.data) {
            fetchUseOfForce()
            successAlert(`${t('alert.success')}!`, `${t('citizens.useOfForce.table.alert.uploadedSuccessfully')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function downloadAttachment(useOfForce: any) {
    state.isPageLoading = true
    state.error = {}
    try {
        const useOfForceUuid = useOfForce?.uuid
        const response = await useOfForceService.downloadUseOfForceAttachment(useOfForceUuid)
        if (response) {
            saveAs(response, useOfForce?.file_name)
        }
    } catch (error: any) {
        state.error.message = error?.message || 'An error occurred during the download.'
    }
    state.isPageLoading = false
}

function confirmAttachmentDeletion(useOfForce: any) {
    state.selectedUseOfForce = useOfForce
    state.modal.isDeleteAttachmentOpen = true
}

async function deleteAttachment() {
    state.error = {}
    state.isPageLoading = true
    try {
        const useOfForceUuid = state.selectedUseOfForce?.uuid
        const response = await useOfForceService.deleteUseOfForceAttachment(useOfForceUuid)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('citizens.useOfForce.table.alert.attachmentDeletedSuccessfully')}.`)
            fetchUseOfForce()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>