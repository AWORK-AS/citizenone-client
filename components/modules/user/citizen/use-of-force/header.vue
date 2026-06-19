<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <div class="flex flex-col gap-y-2">
            <button type="button"
                class="flex w-full items-center justify-center gap-x-1.5 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 hover:border-red-300 transition-colors"
                @click="state.modal.isReportUseOfForceOpen = true">
                <Icon name="ph:warning-circle" class="h-4 w-4" aria-hidden="true" />
                {{ $t('citizens.useOfForce.reportUseOfForce') }}
            </button>
            <div class="flex items-center justify-center gap-x-1" @click="state.slideOver.isReportUseOfForceOpen = true">
                <Tooltip :text="$t('citizens.useOfForce.missingAttachmentToOneOrMoreRecord')"
                    v-if="props.selectedCitizen?.data?.is_missing_form" class="cursor-pointer">
                    <Icon name="ph:warning" class="h-5 w-5 text-yellow-500" aria-hidden="true" />
                </Tooltip>
                <button type="button" class="text-xs font-medium text-slate-500 hover:text-red-600 transition-colors whitespace-nowrap">
                    {{ $t('citizens.useOfForce.seePreviousUseOfForce') }}
                </button>
            </div>
            <ModulesUserCitizenUseOfForceSlideOver :isOpen="state.slideOver.isReportUseOfForceOpen"
                @close="state.slideOver.isReportUseOfForceOpen = false" />
            <ModulesUserCitizenUseOfForceModalReportConfirmation :isModalOpen="state.modal.isReportUseOfForceOpen"
                @close="state.modal.isReportUseOfForceOpen = false" @submitForm="saveUseOfForce" />
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { useOfForceService } from '@/components/api/user/UseOfForceService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const props = defineProps({
    selectedCitizen: {
        type: Object,
        required: false,
    },
})

const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const userStore = useUserStore() as any
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
            if (userStore.getUser?.company?.social_og_boligstyrelsen) {
                navigateToSocialForm()
            }
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