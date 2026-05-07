<template>
    <div>
        <Modal size="lg" :title="$t('addressBook.editContact')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserSettingsAddressBookForm
                        formType="update"
                        :selectedContact="props.selectedContact"
                        :error="state.error"
                        @closeModal="closeModal"
                        @submitForm="updateContact"
                    />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { companyContactService } from '@/components/api/user/CompanyContactService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedContact: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['close', 'refreshContacts'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

async function updateContact(formData: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await companyContactService.updateContact(props.selectedContact.uuid, formData)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('addressBook.alert.contactSuccessfullyUpdated')}.`)
            emit('refreshContacts')
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
