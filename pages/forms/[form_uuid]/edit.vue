<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('forms.editForm') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('forms.editForm') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/forms">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>

            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserForm formType="update" :selectedForm="state.formForm" :error="state.error"
                    @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateForm" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { formService } from '@/components/api/user/FormService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const formUuid = router?.currentRoute?.value?.params?.form_uuid
const breadcrumbLinks = [
    {
        name: 'forms.forms',
        translate: true,
        href: '/forms',
    },
    {
        name: 'forms.editForm',
        translate: true,
        href: `/forms/${formUuid}/edit`,
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

onMounted(() => {
    fetchForm()
})

async function fetchForm() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await formService.getForm(formUuid)
        if (response) {
            state.formForm = {
                title: response.data?.title ?? '',
                description: response.data?.description ?? '',
                fields: [],
            }
            response?.data?.form_fields?.forEach((field: any) => {
                state.formForm.fields.push(JSON.parse(field?.field))
            })
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateForm(formDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            title: formDetails.title,
            description: formDetails.description,
            fields: formDetails.fields,
            is_active: true,
        }
        const response = await formService.updateForm(formUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('forms.alert.formSuccessfullyUpdated')}.`)
            navigateTo('/forms')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
} 
</script>