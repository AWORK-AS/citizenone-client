<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('consentDeclarationTypes.newConsentDeclarationType') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                {{ $t('consentDeclarationTypes.newConsentDeclarationType') }}
            </template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/consent-declaration-types">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserConsentDeclarationTypeForm formType="create"
                        :selectedConsentDeclarationType="state.formConsentDeclarationType" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveConsentDeclarationType" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { consentDeclarationTypeService } from '@/components/api/user/ConsentDeclarationTypeService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const breadcrumbLinks = [
    {
        name: 'consentDeclarationTypes.consentDeclarationTypes',
        translate: true,
        href: '/settings/consent-declaration-types',
    },
    {
        name: 'consentDeclarationTypes.newConsentDeclarationType',
        translate: true,
        href: '/settings/consent-declaration-types/new',
    },
]

const state = reactive({
    error: {} as Error,
    formConsentDeclarationType: {
        name: '',
    },
    isPageLoading: false,
})

async function saveConsentDeclarationType(consentDeclarationType: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: consentDeclarationType.name,
        }
        const response = await consentDeclarationTypeService.saveConsentDeclarationType(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('consentDeclarationTypes.form.alert.successfullySaved')}.`)
            navigateTo('/settings/consent-declaration-types')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
