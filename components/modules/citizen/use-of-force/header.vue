<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <div class="flex flex-col items-center">
            <FormButton buttonStyle="incident" @click="state.modal.isReportUseOfForceOpen = true">
                ! {{ $t('citizens.useOfForce.reportUseOfForce') }}
            </FormButton>
            <FormButton buttonStyle="incident-link" @click="state.slideOver.isReportUseOfForceOpen = true">
                {{ $t('citizens.useOfForce.seePreviousUseOfForce') }}
            </FormButton>
            <ModulesCitizenUseOfForceSlideOver :isOpen="state.slideOver.isReportUseOfForceOpen"
                @close="state.slideOver.isReportUseOfForceOpen = false" />
            <ModulesCitizenUseOfForceModalReportConfirmation :isModalOpen="state.modal.isReportUseOfForceOpen"
                @close="state.modal.isReportUseOfForceOpen = false" @submitForm="saveUseOfForce" />
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { useOfForceService } from '@/components/api/UseOfForceService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    modal: {
        isReportUseOfForceOpen: false
    },
    slideOver: {
        isReportUseOfForceOpen: false
    },
})

async function saveUseOfForce(useOfForceDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            risk_level: useOfForceDetails.risk_level,
        }
        const response = await useOfForceService.saveUseOfForce(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('citizens.useOfForce.alert.savedSuccessfully')}.`)
            navigateToSocialForm()
            state.modal.isReportUseOfForceOpen = false
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function navigateToSocialForm() {
    await navigateTo('https://www.sbst.dk/tvaergaende-omrader/magtanvendelse/skemaer-til-indberetning', {
        external: true,
        open: {
            target: '_blank',
        }
    })
}
</script>