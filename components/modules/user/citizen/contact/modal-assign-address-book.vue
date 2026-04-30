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
                            <FormButton buttonStyle="action" @click="useContact(contact)">
                                <Icon name="ph:arrow-square-out" class="size-4" />
                                {{ $t('addressBook.useContact') }}
                            </FormButton>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { companyContactService } from '@/components/api/user/CompanyContactService'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const language = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close', 'prefillContact'])

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

function useContact(contact: any) {
    emit('prefillContact', contact)
    emit('close')
}
</script>
