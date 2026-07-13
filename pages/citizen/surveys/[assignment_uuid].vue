<template>
    <div>
        <NuxtLayout name="citizen">

            <Head>
                <Title>{{ state.survey?.survey?.title ?? $t('surveys.citizen.mySurveys') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ state.survey?.survey?.title }}</template>

            <div class="mt-6 space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizen/surveys">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="state.survey?.status === 'completed'">
                        <Alert type="info" :text="$t('surveys.citizen.alreadyCompleted')" />
                    </div>

                    <div v-else-if="state.survey?.survey" class="max-w-3xl space-y-5">
                        <div class="space-y-3 px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
                            <p class="text-sm" v-if="state.survey?.survey?.description"
                                v-html="state.survey?.survey?.description"></p>
                            <div class="mt-5">
                                <ModulesSharedSurveyFill ref="surveyFill"
                                    :questions="state.survey?.survey?.questions ?? []" :answers="state.answers" />
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" @click="navigateTo('/citizen/surveys')">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" :disabled="state.isSubmitting"
                                @click="submitSurvey">
                                {{ $t('surveys.citizen.return') }}
                            </FormButton>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenSurveyService } from '@/components/api/citizen/SurveyService'
import { useI18n } from 'vue-i18n'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const assignmentUuid = router?.currentRoute?.value?.params?.assignment_uuid as string
const surveyFill = ref()

const state = reactive({ error: {} as Error, isLoading: false, isSubmitting: false, survey: null as any, answers: {} as any })

onMounted(() => fetchSurvey())

async function fetchSurvey() {
    state.isLoading = true
    try {
        const response = await citizenSurveyService.getSurvey(assignmentUuid)
        if (response?.data) state.survey = response.data
    } catch (error: any) { state.error = error }
    state.isLoading = false
}

async function submitSurvey() {
    state.error = {}
    const missing = surveyFill.value?.missingRequiredQuestions() ?? []
    if (missing.length > 0) {
        state.error = { message: `${t('surveys.answerRequired')}.` } as any
        return
    }
    state.isSubmitting = true
    try {
        const response = await citizenSurveyService.submitSurvey(assignmentUuid, { answers: state.answers })
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('surveys.citizen.returned')}.`)
            navigateTo('/citizen/surveys')
        }
    } catch (error: any) { state.error = error }
    state.isSubmitting = false
}
</script>
