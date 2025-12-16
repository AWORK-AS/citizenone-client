<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('contactJobTitles.addNewContactJobTitle') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('contactJobTitles.addNewContactJobTitle') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                to="/settings/contact-job-titles">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserCitizenContactJobTitleForm formType="create"
                    :selectedContactJobTitle="state.formContactJobTitle" :error="state.error"
                    @isPageLoading="(value: boolean) => state.isPageLoading = value"
                    @submitForm="saveContactJobTitle" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { contactJobTitlesService } from '@/components/api/user/ContactJobTitlesService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    {
        name: 'contactJobTitles.contactJobTitles',
        translate: true,
        href: '/settings/contact-job-titles',
    },
    {
        name: 'contactJobTitles.addNewContactJobTitle',
        translate: true,
        href: '/settings/contact-job-titles/new',
    },
]

const state = reactive({
    error: {} as Error,
    formContactJobTitle: {
        en_title: '',
        dk_title: '',
    },
    isPageLoading: false,
})

async function saveContactJobTitle(contactJobTitleDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            en_title: contactJobTitleDetails.en_title,
            dk_title: contactJobTitleDetails.dk_title,
        }
        const response = await contactJobTitlesService.saveContactJobTitle(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('contactJobTitles.form.alert.newContactJobTitleSuccessfullySaved')}.`)
            navigateTo('/settings/contact-job-titles')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>