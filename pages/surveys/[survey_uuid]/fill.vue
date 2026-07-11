<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('surveys.fillInternally') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('surveys.fillInternally') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" :to="returnRoute">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="max-w-5xl mx-auto space-y-5">
                    <div class="space-y-3 px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <h3 class="text-lg font-semibold">{{ state.survey?.title }}</h3>
                        <p class="text-sm" v-html="state.survey?.description"></p>
                        <p class="text-sm font-medium bg-gray-100 rounded-md px-3 py-2" v-if="state.citizenName">
                            {{ $t('surveys.fillingForCitizen') }}: {{ state.citizenName }}
                        </p>
                        <div class="mt-5">
                            <ModulesSharedSurveyFill ref="surveyFill" :questions="state.survey?.questions ?? []"
                                :answers="state.answers" />
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormButton type="button" buttonStyle="cancel" @click="navigateTo(returnRoute)">
                            {{ $t('cancel') }}
                        </FormButton>
                        <FormButton type="button" buttonStyle="primary" @click="submitAnswers">
                            {{ $t('save') }}
                        </FormButton>
                    </div>
                </div>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { surveyService } from '@/components/api/user/SurveyService'
import { citizenService } from '@/components/api/user/CitizenService'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any
const router = useRouter()

watch(() => userStore.getUser, (user: any) => {
    if (user?.uuid && user?.is_surveys_active === false) navigateTo('/apps')
}, { immediate: true })

const surveyUuid = router?.currentRoute?.value?.params?.survey_uuid
const citizenUuid = router?.currentRoute?.value?.query?.citizen_uuid as string
const fromCitizen = router?.currentRoute?.value?.query?.from === 'citizen'
const returnRoute = fromCitizen ? `/citizens/${citizenUuid}/surveys` : `/surveys/${surveyUuid}/assignments`
const surveyFill = ref()

const state = reactive({
    error: {} as Error,
    survey: null as any,
    answers: {} as any,
    citizenName: '',
    isPageLoading: false,
})

onMounted(() => { fetchSurvey(); fetchCitizen() })

async function fetchSurvey() {
    state.isPageLoading = true
    try {
        const response = await surveyService.getSurvey(surveyUuid)
        if (response?.data) state.survey = response.data
    } catch (error: any) { state.error = error }
    state.isPageLoading = false
}

async function fetchCitizen() {
    if (!citizenUuid) return
    try {
        const response = await citizenService.getAllCitizens({})
        const c = response?.data?.find((item: any) => item?.uuid === citizenUuid)
        if (c) state.citizenName = `${c?.firstname ?? ''} ${c?.lastname ?? ''}`.trim()
    } catch { }
}

async function submitAnswers() {
    state.error = {}
    const missing = surveyFill.value?.missingRequiredQuestions() ?? []
    if (missing.length > 0) {
        state.error = { message: `${t('surveys.answerRequired')}.` } as any
        return
    }
    state.isPageLoading = true
    try {
        const response = await surveyService.saveAssignment(surveyUuid, {
            citizen_uuid: citizenUuid,
            answers: state.answers,
        })
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('surveys.alert.responseSaved')}.`)
            navigateTo(returnRoute)
        }
    } catch (error: any) { state.error = error }
    state.isPageLoading = false
}
</script>
