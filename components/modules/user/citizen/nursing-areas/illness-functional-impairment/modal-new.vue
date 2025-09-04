<template>
    <div>
        <Modal size="sm"
            :title="$t('citizens.nursingAreas.illnessAndFunctionalImpairment.newIllnessAndFunctionalImpairment')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenNursingAreasIllnessFunctionalImpairmentForm formType="create"
                        :selectedIllnessFunctionalImpairment="state.formIllnessFunctionalImpairment"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveIllnessFunctionalImpairment" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { illnessFunctionalImpairmentService } from '@/components/api/user/IllnessFunctionalImpairmentService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedIllnessFunctionalImpairment: {
        type: Object,
        required: true,
    }
})
const emit = defineEmits(['close', 'refreshIllnessFunctionalImpairment'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formIllnessFunctionalImpairment: {
        id: '',
        uuid: '',
        date: '',
        illness_functional_impairment: '',
        healthcare_provider: '',
        our_contact_person_uuid: '',
    },
})

function closeModal() {
    emit('close')
}

function refreshIllnessFunctionalImpairment() {
    emit('refreshIllnessFunctionalImpairment')
}

async function saveIllnessFunctionalImpairment(illnessFunctionalImpairmentDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            date: illnessFunctionalImpairmentDetails.date,
            illness_functional_impairment: illnessFunctionalImpairmentDetails.illness_functional_impairment,
        } as any
        if (illnessFunctionalImpairmentDetails.healthcare_provider) {
            params.healthcare_provider = illnessFunctionalImpairmentDetails.healthcare_provider
        } else {
            params.our_contact_person_uuid = illnessFunctionalImpairmentDetails.our_contact_person_uuid
        }
        const response = await illnessFunctionalImpairmentService.saveIllnessFunctionalImpairment(params)
        if (response?.data) {
            refreshIllnessFunctionalImpairment()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.nursingAreas.illnessAndFunctionalImpairment.form.alert.illnessAndFunctionalImpairmentSucessfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>