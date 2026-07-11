<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('surveys.editSurvey') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('surveys.editSurvey') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/surveys">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="max-w-5xl mx-auto mb-5" v-if="state.assignmentsCount > 0">
                    <Alert type="warning"
                        :text="$t('surveys.editWarning.hasResponses', { count: state.assignmentsCount })" />
                </div>
                <ModulesUserSurveyBuilder v-if="state.survey" formType="update" :selectedSurvey="state.survey"
                    :error="state.error" @submitForm="updateSurvey" />
            </LoadingSpinner>

            <DialogConfirmation :isModalOpen="state.isConfirmOpen"
                :message="$t('surveys.editWarning.confirmUpdate', { count: state.assignmentsCount }) + '?'"
                @close="state.isConfirmOpen = false" @confirm="confirmUpdate" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { surveyService } from '@/components/api/user/SurveyService'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any
const router = useRouter()
const surveyUuid = router?.currentRoute?.value?.params?.survey_uuid

watch(() => userStore.getUser, (user: any) => {
    if (user?.uuid && user?.is_surveys_active === false) navigateTo('/apps')
}, { immediate: true })

const state = reactive({
    error: {} as Error,
    survey: null as any,
    assignmentsCount: 0,
    isConfirmOpen: false,
    pendingPayload: null as any,
    isPageLoading: false,
})

onMounted(() => fetchSurvey())

async function fetchSurvey() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await surveyService.getSurvey(surveyUuid)
        if (response?.data) {
            state.survey = response.data
            state.assignmentsCount = response.data?.assignments_count ?? 0
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function updateSurvey(payload: any) {
    if (state.assignmentsCount > 0) {
        state.pendingPayload = payload
        state.isConfirmOpen = true
        return
    }
    submitUpdate(payload)
}

function confirmUpdate() {
    state.isConfirmOpen = false
    if (state.pendingPayload) submitUpdate(state.pendingPayload)
}

async function submitUpdate(payload: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await surveyService.updateSurvey(surveyUuid, payload)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('surveys.alert.updated')}.`)
            navigateTo('/surveys')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
