<template>
    <div>
        <NuxtLayout name="user">
            <Head>
                <Title>{{ $t('employment.jobcenters.newJobcenter') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>{{ $t('employment.jobcenters.newJobcenter') }}</template>
            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/employment-jobcenters">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserEmploymentJobcenterForm formType="create"
                        :selectedJobcenter="state.formJobcenter" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveJobcenter" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employmentService } from '@/components/api/user/EmploymentService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    { name: 'employment.jobcenters.jobcenters', translate: true, href: '/settings/employment-jobcenters' },
    { name: 'employment.jobcenters.newJobcenter', translate: true, href: '/settings/employment-jobcenters/new' },
]

const state = reactive({
    error: {} as Error,
    formJobcenter: { name: '', municipality: '', email: '', phone: '', contact_person: '', sort_order: 0, is_active: true },
    isPageLoading: false,
})

async function saveJobcenter(details: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await employmentService.saveJobcenter(details)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('employment.jobcenters.form.alert.newJobcenterSuccessfullySaved')}.`)
            navigateTo('/settings/employment-jobcenters')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
