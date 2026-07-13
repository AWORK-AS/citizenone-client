<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('surveys.newSurvey') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('surveys.newSurvey') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/surveys">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>

            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserSurveyBuilder formType="create" :selectedSurvey="state.survey" :error="state.error"
                    @submitForm="saveSurvey" />
            </LoadingSpinner>
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

watch(() => userStore.getUser, (user: any) => {
    if (user?.uuid && user?.is_surveys_active === false) navigateTo('/apps')
}, { immediate: true })

const state = reactive({
    error: {} as Error,
    survey: { title: '', description: '', score_ranges: [], questions: [] } as any,
    isPageLoading: false,
})

async function saveSurvey(payload: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await surveyService.saveSurvey(payload)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('surveys.alert.created')}.`)
            navigateTo('/surveys')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
