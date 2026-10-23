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
import { registrationRuleService, fromUserRuleDraft, userRuleIsSet } from '@/components/api/user/RegistrationRuleService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    prefillData: {
        type: Object as () => any,
        default: null,
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
        contact_job_title_uuid: '',
        company_contact_uuid: '',
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
        notifications: [{
            notification_uuid: '',
            risk_level_uuid: '',
        }],
        has_system_access: false,
    },
})

watch(() => props.prefillData, (data) => {
    if (!data) return
    state.formContact = {
        ...state.formContact,
        company_contact_uuid: data.uuid ?? '',
        contact_job_title_uuid: data.contact_job_title?.uuid ?? '',
        firstname: data.firstname ?? '',
        lastname: data.lastname ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        street: data.street ?? '',
        region: data.region?.uuid ?? '',
        municipality: data.municipality?.uuid ?? '',
        city: data.city?.uuid ?? '',
        post_code: data.post_code ?? '',
    }
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
                contact_job_title_uuid: contactDetails.contact_job_title_uuid,
                employees_uuid: contactDetails.employees,
                notifications: contactDetails.notifications,
            }
        } else {
            params = {
                citizen_uuid: citizenUuid,
                contact_job_title_uuid: contactDetails.contact_job_title_uuid,
                relationship_uuid: contactDetails.title === 'relatives' ? contactDetails.relationship : '',
                company_name: contactDetails.company_name,
                firstname: contactDetails.firstname,
                lastname: contactDetails.lastname,
                email: contactDetails.email,
                phone: contactDetails.phone,
                note: contactDetails.note,
                street: contactDetails.street,
                region_uuid: contactDetails.region,
                municipality_uuid: contactDetails.municipality,
                city_uuid: contactDetails.city,
                post_code: contactDetails.post_code,
                has_system_access: contactDetails.has_system_access,
                chat_user_uuid: contactDetails.chat_users ?? [],
                company_contact_uuid: state.formContact.company_contact_uuid || null,
            }
        }
        if (contactDetails.title === 'doctor') {
            params = {
                ...params,
                is_primary_gp: contactDetails.is_primary_gp === true,
                provider_number: contactDetails.provider_number || null,
                clinic_name: contactDetails.clinic_name || null,
                clinic_ean: contactDetails.clinic_ean || null,
                sor_code: contactDetails.sor_code || null,
            }
        }
        const response = await citizenContactService.saveContact(params)
        if (response?.data) {
            if (contactDetails.title === 'our_contact_person') {
                await saveRegistrationRules(contactDetails)
            }
            refreshContacts()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.contacts.form.alert.contactSuccessfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

// The optional rule from the form, for each employee just put on the case.
// The contact is saved either way; a refused rule is said, not hidden.
async function saveRegistrationRules(contactDetails: any) {
    const rule = contactDetails.registration_rule ? fromUserRuleDraft(contactDetails.registration_rule) : null
    if (!rule || !userRuleIsSet(rule) || !citizenUuid) return

    // "All employees" is not one person: a rule is set per employee.
    for (const employeeUuid of (contactDetails.employees ?? []).filter((uuid: string) => uuid !== 'all-employees')) {
        try {
            await registrationRuleService.saveUserRule('citizen', String(citizenUuid), employeeUuid, rule)
        } catch (error: any) {
            errorAlert(t('alert.warning'), error?.message ?? t('registrationRules.saveFailed'))
        }
    }
}
</script>
