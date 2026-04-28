<template>
    <div>
        <Modal size="lg" :title="$t('addressBook.assignFromAddressBook')" :show="props.isModalOpen" @close="emit('close')">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isLoading">
                    <div class="space-y-4">
                        <Alert type="danger" :text="state.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />

                        <div v-if="state.contacts.length === 0 && !state.isLoading" class="text-center text-gray-500 py-6">
                            {{ $t('addressBook.noContactsInAddressBook') }}
                        </div>

                        <div v-for="contact in state.contacts" :key="contact.uuid"
                            class="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <p class="font-medium text-sm">{{ contact?.firstname }} {{ contact?.lastname }}</p>
                                <p class="text-xs text-gray-500">
                                    {{ language.locale.value === 'en' ? contact?.contact_job_title?.en_title : contact?.contact_job_title?.dk_title }}
                                </p>
                                <p class="text-xs text-gray-400" v-if="contact?.email">{{ contact?.email }}</p>
                            </div>
                            <FormButton
                                v-if="!isAlreadyAssigned(contact.uuid)"
                                buttonStyle="action"
                                @click="assign(contact)"
                            >
                                <Icon name="ph:link" class="size-4" />
                                {{ $t('addressBook.assign') }}
                            </FormButton>
                            <Badge v-else type="success">
                                <p class="text-xxs px-2">{{ $t('addressBook.assigned') }}</p>
                            </Badge>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { companyContactService } from '@/components/api/user/CompanyContactService'
import { citizenCompanyContactService } from '@/components/api/user/CitizenCompanyContactService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    citizenUuid: {
        type: String,
        required: true,
    },
    assignedContacts: {
        type: Array as () => any[],
        default: () => [],
    },
})

const emit = defineEmits(['close', 'refreshAddressBookContacts'])

const state = reactive({
    contacts: [] as any[],
    isLoading: false,
    error: {} as Error,
})

watch(() => props.isModalOpen, (val) => {
    if (val) fetchAddressBook()
})

async function fetchAddressBook() {
    state.isLoading = true
    try {
        const response = await companyContactService.getContactList()
        if (response) {
            state.contacts = response?.data ?? response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function isAlreadyAssigned(contactUuid: string) {
    return props.assignedContacts.some((c: any) => c.uuid === contactUuid)
}

async function assign(contact: any) {
    try {
        await citizenCompanyContactService.assign(props.citizenUuid, contact.uuid)
        successAlert(`${t('alert.success')}!`, `${t('addressBook.alert.contactSuccessfullyAssigned')}.`)
        emit('refreshAddressBookContacts')
    } catch (error: any) {
        state.error = error
    }
}
</script>
