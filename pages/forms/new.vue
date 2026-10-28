<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('forms.newForm') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('forms.newForm') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" :to="returnTo ?? '/forms'">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>

            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserForm formType="create" :selectedForm="state.formForm" :error="state.error"
                    @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveForm" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { formService } from '@/components/api/user/FormService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'
import { safeReturnPath } from '@/utils/returnPath'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()

// Opened from a patient's forms tab: go back there with the new form picked,
// ready to send, instead of to the form list.
const returnTo = safeReturnPath(route.query.return_to)
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    {
        name: 'forms.forms',
        translate: true,
        href: '/forms',
    },
    {
        name: 'forms.newForm',
        translate: true,
        href: '/forms/new',
    },
]

const state = reactive({
    error: {} as Error,
    formForm: {
        description: '',
        fields: [] as any,
        title: '',
    },
    isPageLoading: false,
})

async function saveForm(formDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            title: formDetails.title,
            description: formDetails.description,
            document_title: formDetails.document_title,
            fields: formDetails.fields,
            is_follow_up_enabled: formDetails.is_follow_up_enabled,
            follow_up_duration: formDetails.follow_up_duration,
            show_citizen_profile_data: formDetails.show_citizen_profile_data,
            citizen_profile_fields: formDetails.citizen_profile_fields,
            share_with_community: formDetails.share_with_community,
            is_active: true,
        }
        const response = await formService.saveForm(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('forms.alert.formSuccessfullyAdded')}.`)
            navigateTo(returnTo
                ? { path: returnTo, query: { send_form: response.data.uuid } }
                : '/forms')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
} 
</script>