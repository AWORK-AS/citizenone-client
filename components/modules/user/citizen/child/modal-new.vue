<template>
    <div>
        <Modal size="lg" :title="$t('children.newChild')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenChildForm formType="create" :selectedChild="state.formChild" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveChild" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { citizenChildService } from '@/components/api/user/CitizenChildService'
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
const emit = defineEmits(['close', 'refreshChildren'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formChild: {
        firstname: '',
        lastname: '',
        gender: '',
        email: '',
        social_security_number: '',
        birthday: '',
        phone: '',
        street: '',
        region_uuid: '',
        municipality_uuid: '',
        city: '',
        post_code: '',
    },
})

function closeModal() {
    emit('close')
}

function refreshChildren() {
    emit('refreshChildren')
}

async function saveChild(childDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = {
            citizen_uuid: citizenUuid,
            firstname: childDetails.firstname,
            lastname: childDetails.lastname,
            gender: childDetails.gender,
            email: childDetails.email,
            social_security_number: childDetails.social_security_number,
            birthday: childDetails.birthday,
            phone: childDetails.phone,
            street: childDetails.street,
            region_uuid: childDetails.region_uuid,
            municipality_uuid: childDetails.municipality_uuid,
            city: childDetails.city,
            post_code: childDetails.post_code,
        }
        const response = await citizenChildService.saveCitizenChild(params)
        if (response?.data) {
            refreshChildren()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('children.form.alert.childSuccessfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>