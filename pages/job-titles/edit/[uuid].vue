<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('jobTitles.editJobTitle') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('jobTitles.editJobTitle') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/job-titles">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesJobTitleForm formType="update" :selectedJobTitle="state.formJobTitle" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateJobTitle" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { jobTitleService } from '@/components/api/JobTitleService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const jobTitleUuid = router?.currentRoute?.value?.params?.uuid

const state = reactive({
    error: {} as Error,
    formJobTitle: {
        title: '',
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchJobTitle()
})

async function fetchJobTitle() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await jobTitleService.getJobTitle(jobTitleUuid)
        if (response) {
            state.formJobTitle = {
                title: response?.data?.title ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateJobTitle(jobTitleDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            title: jobTitleDetails.title,
        }
        const response = await jobTitleService.updateJobTitle(jobTitleUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('jobTitles.form.alert.jobTitleSuccessfullyUpdated')}.`)
            navigateTo('/job-titles')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>