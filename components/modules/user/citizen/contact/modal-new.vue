<template>
    <div>
        <Modal size="lg" :title="$t('citizens.contacts.newContact')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenContactForm formType="create" :selectedContact="state.formContact"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveContact" />
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
})
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const emit = defineEmits(['close', 'refreshContacts'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formContact: {
        uuid: '',
        title: '',
        employees_uuid: [],
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        street: '',
        region: '',
        municipality: '',
        city: '',
        post_code: '',
        // risk_level: '',
        // notification_types: [],
        notifications: [{
            notification_uuid: '',
            risk_level_uuid: '',
        }],
    },
})

function closeModal() {
    emit('close')
}

function refreshContacts() {
    emit('refreshContacts')
}

async function saveContact(contactDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = {}
        if (contactDetails.title === 'our_contact_person') {
            params = {
                citizen_uuid: citizenUuid,
                title: contactDetails.title,
                employees_uuid: contactDetails.employees,
                notifications: contactDetails.notifications,
            }
        } else {
            params = {
                citizen_uuid: citizenUuid,
                title: contactDetails.title,
                employees_uuid: contactDetails.employees,
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
        const response = await citizenContactService.saveContact(params)
        if (response?.data) {
            refreshContacts()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.contacts.form.alert.contactSuccessfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>