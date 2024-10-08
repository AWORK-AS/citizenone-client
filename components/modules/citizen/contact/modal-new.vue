<template>
    <div>
        <Modal size="md" :title="$t('citizens.contacts.newContact')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenContactForm formType="create" :selectedContact="state.formContact"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveContact" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { citizenContactService } from '@/components/api/CitizenContactService'
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
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        address: '',
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
        const params = {
            citizen_uuid: citizenUuid,
            title: contactDetails.title,
            firstname: contactDetails.firstname,
            lastname: contactDetails.lastname,
            email: contactDetails.email,
            phone: contactDetails.phone,
            address: contactDetails.address,
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