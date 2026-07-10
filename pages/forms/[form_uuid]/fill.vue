<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('forms.assignments.fillInternally') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('forms.assignments.fillInternally') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" :to="returnRoute">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="max-w-5xl mx-auto space-y-5">
                    <div class="space-y-3 px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <h3 class="text-lg font-semibold">
                            {{ state.form?.data?.title }}
                        </h3>
                        <p class="text-sm">
                            {{ state.form?.data?.description }}
                        </p>
                        <p class="text-sm font-medium bg-gray-100 rounded-md px-3 py-2" v-if="citizenName">
                            {{ $t('forms.assignments.fillingForCitizen') }}: {{ citizenName }}
                        </p>

                        <div class="mt-5">
                            <ModulesSharedSurveyFill ref="surveyFill"
                                :fields="state.form?.data?.form_fields ?? []" :answers="state.answers" />
                        </div>
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" @click="navigateTo(returnRoute)">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" @click="submitAnswers">
                                {{ $t('save') }}
                            </FormButton>
                        </div>
                    </div>
                </div>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { formService } from '@/components/api/user/FormService'
import { formAssignmentService } from '@/components/api/user/FormAssignmentService'
import { citizenService } from '@/components/api/user/CitizenService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any
const router = useRouter()

watch(() => userStore.getUser, (user: any) => {
    if (user?.uuid && user?.is_surveys_active === false) {
        navigateTo('/apps')
    }
}, { immediate: true })
const formUuid = router?.currentRoute?.value?.params?.form_uuid
const citizenUuid = router?.currentRoute?.value?.query?.citizen_uuid as string
const fromCitizen = router?.currentRoute?.value?.query?.from === 'citizen'
const returnRoute = fromCitizen ? `/citizens/${citizenUuid}/surveys` : `/forms/${formUuid}/assignments`
const surveyFill = ref()
const breadcrumbLinks = [
    {
        name: 'forms.forms',
        translate: true,
        href: '/forms',
    },
    {
        name: 'forms.assignments.title',
        translate: true,
        href: `/forms/${formUuid}/assignments`,
    },
    {
        name: 'forms.assignments.fillInternally',
        translate: true,
        href: `/forms/${formUuid}/fill`,
    },
]

const state = reactive({
    error: {} as Error,
    form: [] as any,
    answers: {} as any,
    citizenName: '',
    isPageLoading: false,
})

const citizenName = computed(() => state.citizenName)

onMounted(() => {
    fetchForm()
    fetchCitizen()
})

async function fetchForm() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await formService.getForm(formUuid)
        if (response) {
            state.form = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchCitizen() {
    if (!citizenUuid) return
    try {
        const response = await citizenService.getAllCitizens({})
        const citizen = response?.data?.find((item: any) => item?.uuid === citizenUuid)
        if (citizen) {
            state.citizenName = `${citizen?.firstname ?? ''} ${citizen?.lastname ?? ''}`.trim()
        }
    } catch {
        // Name display only; submission still works without it
    }
}

async function submitAnswers() {
    state.error = {}
    const missing = surveyFill.value?.missingRequiredFields() ?? []
    if (missing.length > 0) {
        state.error = { message: `${t('forms.assignments.alert.answerRequiredFields')}.` } as any
        return
    }
    state.isPageLoading = true
    try {
        const response = await formAssignmentService.saveAssignment(formUuid, {
            citizen_uuid: citizenUuid,
            answers: state.answers,
        })
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('forms.alert.responseSuccessfullySaved')}.`)
            navigateTo(returnRoute)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
