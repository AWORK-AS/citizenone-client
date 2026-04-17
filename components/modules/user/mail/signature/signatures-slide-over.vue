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
                            leave="transform transition ease-in-out duration-500 sm:duration-300"
                            leave-from="translate-x-0" leave-to="translate-x-full">
                            <DialogPanel class="pointer-events-auto w-screen max-w-4xl">
                                <div class="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                                    <div class="bg-tertiary px-4 py-6 sm:px-6">
                                        <div class="flex items-center justify-between">
                                            <DialogTitle>
                                                <div class="flex items-center gap-x-2">
                                                    <h3 class="text-base font-semibold leading-6 text-white">
                                                        {{ $t('mail.settings.signatures.signatures') }}
                                                    </h3>
                                                </div>
                                            </DialogTitle>
                                            <div class="ml-3 flex h-7 items-center">
                                                <button type="button" class="relative rounded-md text-white"
                                                    @click="closeSlide">
                                                    <span class="absolute -inset-2.5" />
                                                    <span class="sr-only">Close panel</span>
                                                    <Icon name="heroicons:x-mark" class="h-6 w-6" aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="relative mt-10 flex-1 px-4 sm:px-6">
                                        <div class="space-y-5">
                                            <div class="flex items-center gap-3 justify-end">
                                                <FormButton buttonStyle="action"
                                                    @click="state.modal.isAddSignatureOpen = true">
                                                    <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                                    {{ $t('mail.settings.signatures.newSignature') }}
                                                </FormButton>
                                            </div>
                                            <Alert type="danger" :text="state?.error?.message"
                                                v-if="state.error?.message && state.error.message.length > 0" />
                                            <TableSearch @search="handleSearch" />
                                            <div class="table-responsive">
                                                <Table :columnHeaders="state.columnHeaders" :data="state.signatures"
                                                    :isLoading="state.isTableLoading" :sortData="state.sortData"
                                                    @sort="sort">
                                                    <template #body
                                                        v-if="!(state.isTableLoading || (state.signatures?.data?.length === 0))">
                                                        <tr v-for="(signature, index) in state.signatures?.data"
                                                            :key="index">
                                                            <td width="40%">
                                                                <p>
                                                                    {{ signature?.name }}
                                                                </p>
                                                            </td>
                                                            <td width="30%">
                                                                <Badge type="primary" class="w-fit"
                                                                    v-if="signature?.is_default">
                                                                    <p class="text-xs">
                                                                        {{
                                                                            $t('mail.settings.signatures.table.default')
                                                                        }}
                                                                    </p>
                                                                </Badge>
                                                            </td>
                                                            <td width="30%">
                                                                <div class="flex items-end justify-end gap-2">
                                                                    <Tooltip
                                                                        :text="$t('mail.settings.signatures.table.actions.edit')">
                                                                        <FormButton type="button" buttonStyle="action"
                                                                            @click="editSignature(signature)">
                                                                            <Icon name="ph:pencil-simple"
                                                                                class="size-4" />
                                                                        </FormButton>
                                                                    </Tooltip>
                                                                    <Tooltip
                                                                        :text="$t('mail.settings.signatures.table.actions.setToDefault')"
                                                                        v-if="!signature?.is_default">
                                                                        <FormButton type="button" buttonStyle="action"
                                                                            @click="setSignatureToDefaultConfirmation(signature)">
                                                                            <Icon name="ph:check" class="size-4" />
                                                                        </FormButton>
                                                                    </Tooltip>
                                                                    <Tooltip
                                                                        :text="$t('mail.settings.signatures.table.actions.delete')">
                                                                        <FormButton type="button" buttonStyle="danger"
                                                                            @click="deleteSignatureConfirmation(signature)">
                                                                            <Icon name="ph:trash" class="size-4" />
                                                                        </FormButton>
                                                                    </Tooltip>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </template>
                                                </Table>
                                            </div>
                                            <Pagination :data="state.signatures" @previous="previous" @next="next" />
                                        </div>
                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </div>
            <ModulesUserMailSignatureModalNew :isModalOpen="state.modal.isAddSignatureOpen"
                @close="state.modal.isAddSignatureOpen = false" @refreshSignatures="fetchSignatures" />
            <ModulesUserMailSignatureModalEdit :isModalOpen="state.modal.isEditSignatureOpen"
                :selectedSignature="state.selectedSignature" @close="state.modal.isEditSignatureOpen = false"
                @refreshSignatures="fetchSignatures" />
            <DialogConfirmation :isModalOpen="state.modal.isDeleteSignatureConfirmationOpen"
                :message="$t('mail.settings.signatures.table.confirmation.deleteSignatureConfirmation') + '?'"
                @close="state.modal.isDeleteSignatureConfirmationOpen = false" @confirm="deleteSignature" />
            <DialogConfirmation :isModalOpen="state.modal.isSetSignatureToDefaultConfirmationOpen"
                :message="$t('mail.settings.signatures.table.confirmation.setSignatureToDefaultConfirmation') + '?'"
                @close="state.modal.isSetSignatureToDefaultConfirmationOpen = false" @confirm="setSignatureToDefault" />
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { signatureService } from '@/components/api/user/SignatureService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
    },
})
const { successAlert } = useAlert()
const { t } = useI18n()
const emit = defineEmits(['close'])
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'mail.settings.signatures.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'mail.settings.signatures.table.status', isTranslateName: true, sorter: true, key: 'is_default' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isAddSignatureOpen: false,
        isDeleteSignatureConfirmationOpen: false,
        isEditSignatureOpen: false,
        isSetSignatureToDefaultConfirmationOpen: false,
    },
    selectedSignature: {} as any,
    signatures: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

function closeSlide() {
    emit('close')
}

watch(() => props.isOpen, (isOpen: any) => {
    if (isOpen) {
        fetchSignatures()
    }
})

async function fetchSignatures() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
        }
        const response = await signatureService.getSignatures(params)
        if (response) {
            state.signatures = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchSignatures()
}

function next() {
    currentTablePage++
    fetchSignatures()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchSignatures()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchSignatures()
}

function editSignature(signature: any) {
    state.selectedSignature = signature
    state.modal.isEditSignatureOpen = true
}

function deleteSignatureConfirmation(signature: any) {
    state.selectedSignature = signature
    state.modal.isDeleteSignatureConfirmationOpen = true
}

async function deleteSignature() {
    state.error = {}
    state.isTableLoading = true
    try {
        const signatureUuid = state.selectedSignature.uuid
        const response = await signatureService.deleteSignature(signatureUuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            successAlert(`${t('alert.success')}!`, `${t('mail.settings.signatures.table.alert.emailSignatureSuccessfullyDeleted')}.`)
            fetchSignatures()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function setSignatureToDefaultConfirmation(signature: any) {
    state.selectedSignature = signature
    state.modal.isSetSignatureToDefaultConfirmationOpen = true
}

async function setSignatureToDefault() {
    state.error = {}
    state.isTableLoading = true
    try {
        const signatureUuid = state.selectedSignature.uuid
        const response = await signatureService.setSignatureToDefault(signatureUuid)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('mail.settings.signatures.table.alert.emailSignatureSuccessfullySetToDefault')}.`)
            fetchSignatures()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>