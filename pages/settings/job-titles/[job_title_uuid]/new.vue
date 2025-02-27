<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('jobSpecialties.newJobSpecialty') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('jobSpecialties.newJobSpecialty') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    :to="`/settings/job-titles/${jobTitleUuid}`">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserJobSpecialtyForm formType="create" :selectedJobSpecialty="state.formJobSpecialty"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveJobSpecialty" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { jobSpecialtyService } from '@/components/api/user/JobSpecialtyService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const jobTitleUuid = router?.currentRoute?.value?.params?.job_title_uuid
const breadcrumbLinks = [
    {
        name: 'jobTitles.jobTitles',
        translate: true,
        href: '/settings/job-titles',
    },
    {
        name: 'jobSpecialties.jobSpecialties',
        translate: true,
        href: `/settings/job-titles/${jobTitleUuid}`,
    },
    {
        name: 'jobSpecialties.newJobSpecialty',
        translate: true,
        href: `/settings/job-titles/${jobTitleUuid}/new`,
    },
]

const state = reactive({
    error: {} as Error,
    formJobSpecialty: {
        title: '',
    },
    isPageLoading: false,
})

async function saveJobSpecialty(jobSpecialtyDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            job_title_uuid: jobTitleUuid,
            title: jobSpecialtyDetails.title,
        }
        const response = await jobSpecialtyService.saveJobSpecialty(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('jobSpecialties.form.alert.newJobSpecialtySuccessfullySaved')}.`)
            navigateTo(`/settings/job-titles/${jobTitleUuid}`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>