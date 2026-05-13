<template>
    <div>
        <Modal size="lg" :title="$t('addressBook.newContact')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserSettingsAddressBookForm
                        formType="create"
                        :selectedContact="state.formContact"
                        :error="state.error"
                        @closeModal="closeModal"
                        @submitForm="saveContact"
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
})

const emit = defineEmits(['close', 'refreshContacts'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formContact: {
        contact_job_title_uuid: '',
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        street: '',
        post_code: '',
        company_name: '',
        region_uuid: '',
        municipality_uuid: '',
        city_uuid: '',
    },
})

function closeModal() {
    emit('close')
}

async function saveContact(formData: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await companyContactService.saveContact(formData)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('addressBook.alert.contactSuccessfullySaved')}.`)
            emit('refreshContacts')
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
