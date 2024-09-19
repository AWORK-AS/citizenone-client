<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('jobTitles.newJobTitle') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('jobTitles.newJobTitle') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/job-titles">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesJobTitleForm formType="create" :selectedJobTitle="state.formJobTitle" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveJobTitle" />
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

const state = reactive({
    error: {} as Error,
    formJobTitle: {
        title: '',
    },
    isPageLoading: false,
})

async function saveJobTitle(jobTitleDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            title: jobTitleDetails.title,
        }
        const response = await jobTitleService.saveJobTitle(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('jobTitles.form.alert.newJobTitleSuccessfullySaved')}.`)
            navigateTo('/job-titles')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>