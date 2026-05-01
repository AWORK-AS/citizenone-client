<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('consentDeclarationTypes.editConsentDeclarationType') }} - {{ runtimeConfig?.public?.appName
                    }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                {{ $t('consentDeclarationTypes.editConsentDeclarationType') }}
            </template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/consent-declaration-types">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserConsentDeclarationTypeForm formType="update"
                        :selectedConsentDeclarationType="state.formConsentDeclarationType" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateConsentDeclarationType" />
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
const router = useRouter()
const uuid = router?.currentRoute?.value?.params?.uuid

const breadcrumbLinks = [
    {
        name: 'consentDeclarationTypes.consentDeclarationTypes',
        translate: true,
        href: '/settings/consent-declaration-types',
    },
    {
        name: 'consentDeclarationTypes.editConsentDeclarationType',
        translate: true,
        href: `/settings/consent-declaration-types/${uuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formConsentDeclarationType: {
        name: '',
        photo: false,
        parent_collaboration: false,
        student_collaboration: false,
        general_consent: false,
        personal_guardianship: false,
        financial_guardianship: false,
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchConsentDeclarationType()
})

async function fetchConsentDeclarationType() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await consentDeclarationTypeService.getConsentDeclarationType(uuid)
        if (response) {
            state.formConsentDeclarationType = {
                name: response?.data?.name ?? '',
                photo: response?.data?.photo ? true : false,
                parent_collaboration: response?.data?.parent_collaboration ? true : false,
                student_collaboration: response?.data?.student_collaboration ? true : false,
                general_consent: response?.data?.general_consent ? true : false,
                personal_guardianship: response?.data?.personal_guardianship ? true : false,
                financial_guardianship: response?.data?.financial_guardianship ? true : false,
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateConsentDeclarationType(consentDeclarationType: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: consentDeclarationType.name,
            photo: consentDeclarationType.photo,
            parent_collaboration: consentDeclarationType.parent_collaboration,
            student_collaboration: consentDeclarationType.student_collaboration,
            general_consent: consentDeclarationType.general_consent,
            personal_guardianship: consentDeclarationType.personal_guardianship,
            financial_guardianship: consentDeclarationType.financial_guardianship,
        }
        const response = await consentDeclarationTypeService.updateConsentDeclarationType(uuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('consentDeclarationTypes.form.alert.successfullyUpdated')}.`)
            navigateTo('/settings/consent-declaration-types')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
