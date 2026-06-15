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

            <Tabs v-if="isEmploymentServices" :tabs="tabs" />

            <div :class="isEmploymentServices ? 'mt-6' : ''">
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserForm formType="update" :selectedForm="state.formForm" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateForm" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { formService } from '@/components/api/user/FormService'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const formUuid = router?.currentRoute?.value?.params?.form_uuid
const userStore = useUserStore()

const isEmploymentServices = computed(() =>
    userStore.getUser?.company?.industry?.system_name === 'employment_services'
)
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

const tabs = computed(() => [
    {
        name: 'forms.tabs.formBuilder',
        isTranslateName: true,
        href: `/forms/${formUuid}/edit`,
        routeNames: ['forms-form_uuid-edit'],
    },
    {
        name: 'forms.tabs.predefinedEvents',
        isTranslateName: true,
        href: `/forms/${formUuid}/predefined-events`,
        routeNames: ['forms-form_uuid-predefined-events'],
    },
])

const state = reactive({
    error: {} as Error,
    formForm: {
        description: '',
        fields: [] as any,
        title: '',
        document_title: '',
        is_follow_up_enabled: false,
        follow_up_duration: '',
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
                document_title: response.data?.document_title ?? '',
                is_follow_up_enabled: Boolean(response.data?.is_follow_up_enabled),
                follow_up_duration: response.data?.follow_up_duration ?? '',
                fields: [],
            }
            response?.data?.form_fields?.forEach((field: any) => {
                const parsedField = JSON.parse(field?.field)
                state.formForm.fields.push({
                    ...parsedField,
                    uuid: field?.uuid,
                })
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
            document_title: formDetails.document_title,
            fields: formDetails.fields,
            is_follow_up_enabled: formDetails.is_follow_up_enabled,
            follow_up_duration: formDetails.follow_up_duration,
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
