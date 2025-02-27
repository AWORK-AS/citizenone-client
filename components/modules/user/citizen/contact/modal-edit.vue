<template>
    <div>
        <Modal size="lg" :title="$t('citizens.contacts.editContact')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenContactForm formType="update" :selectedContact="props.selectedContact"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateContact" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { citizenContactService } from '@/components/api/user/CitizenContactService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
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
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshContacts() {
    emit('refreshContacts')
}

async function updateContact(contactDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const contactUuid = contactDetails.uuid
        let params = {}
        if (contactDetails.title === 'our_contact_person') {
            params = {
                title: contactDetails.title,
                employee_uuid: contactDetails.employee,
                notifications: contactDetails.notifications,
            }
        } else {
            params = {
                title: contactDetails.title,
                relationship_uuid: contactDetails.title === 'relatives' ? contactDetails.relationship : '',
                company_name: contactDetails.company_name,
                firstname: contactDetails.firstname,
                lastname: contactDetails.lastname,
                email: contactDetails.email,
                phone: contactDetails.phone,
                street: contactDetails.street,
                region_uuid: contactDetails.region,
                municipality_uuid: contactDetails.municipality,
                city_uuid: contactDetails.city,
                post_code: contactDetails.post_code,
            }
        }
        const response = await citizenContactService.updateContact(contactUuid, params)
        if (response?.data) {
            refreshContacts()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.contacts.form.alert.contactSuccessfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>