<template>
    <div>
        <NuxtLayout name="patient">

            <Head>
                <Title>{{ state.assignment?.form?.title ?? $t('patient.nav.forms') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ state.assignment?.form?.title }}</template>

            <div class="mt-6 space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/patient/forms">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="state.assignment?.status === 'completed'">
                        <Alert type="info" :text="$t('patient.forms.alreadyCompleted')" />
                    </div>

                    <div v-else-if="state.assignment?.form" class="max-w-3xl space-y-5">
                        <div class="space-y-3 px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
                            <p class="text-sm" v-if="state.assignment?.form?.description"
                                v-html="state.assignment.form.description"></p>
                            <p class="text-xs text-gray-500">{{ $t('patient.forms.journalNotice') }}</p>
                            <div class="mt-5">
                                <ModulesSharedSurveyFill ref="formFill" :questions="questions" :answers="state.answers" />
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" @click="navigateTo('/patient/forms')">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" :disabled="state.isSubmitting"
                                @click="submitForm">
                                {{ $t('patient.forms.return') }}
                            </FormButton>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { patientFormService } from '@/components/api/patient/FormService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const assignmentUuid = router?.currentRoute?.value?.params?.assignment_uuid as string
const formFill = ref()

const state = reactive({
    error: {} as Error,
    isLoading: false,
    isSubmitting: false,
    assignment: null as any,
    answers: {} as any,
})

// The fill component was written for surveys, which carry the definition under `question`. A
// form field carries the same shape under `field`, so it is handed over in that shape rather
// than a second component being written to render the same eight field types.
const questions = computed(() => (state.assignment?.form?.fields ?? [])
    .filter((field: any) => ANSWERABLE.includes(field?.field?.type))
    .map((field: any) => ({ uuid: field.uuid, question: field.field })))

const ANSWERABLE = ['textfield', 'textarea', 'choice', 'checkbox', 'datefield', 'rating', 'scale']

onMounted(() => fetchForm())

async function fetchForm() {
    state.isLoading = true
    try {
        const response = await patientFormService.getForm(assignmentUuid)
        if (response?.data) state.assignment = response.data
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function submitForm() {
    state.error = {}

    const missing = formFill.value?.missingRequiredQuestions() ?? []
    if (missing.length > 0) {
        state.error = { message: `${t('patient.forms.answerRequired')}.` } as any

        return
    }

    state.isSubmitting = true
    try {
        const response = await patientFormService.submitForm(assignmentUuid, { answers: state.answers })
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('patient.forms.returned')}.`)
            navigateTo('/patient/forms')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSubmitting = false
}
</script>
