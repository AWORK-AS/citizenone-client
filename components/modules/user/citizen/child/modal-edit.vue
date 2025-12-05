<template>
    <div>
        <Modal size="lg" :title="$t('children.editChild')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenChildForm formType="update" :selectedChild="props.selectedChild"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateChild" />
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
    selectedChild: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshChildren'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshChildren() {
    emit('refreshChildren')
}

async function updateChild(childDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const childUuid = props.selectedChild.uuid
        let params = {
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
        const response = await citizenChildService.updateCitizenChild(childUuid, params)
        if (response?.data) {
            refreshChildren()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('children.form.alert.childSuccessfullyUpdate')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>