<template>
    <Head>
        <Title>{{ state.form?.title ?? $t('publicForm.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
        <!-- A patient's personal link must never end up in a search engine or a referrer header. -->
        <Meta name="robots" content="noindex, nofollow" />
        <Meta name="referrer" content="no-referrer" />
    </Head>

    <div class="min-h-screen bg-gray-50">
        <div class="mx-auto w-full max-w-2xl px-4 py-10">
            <div class="mb-6 flex items-center gap-x-2 text-primary">
                <Icon name="ph:clipboard-text" class="h-6 w-6" aria-hidden="true" />
                <span class="text-sm font-semibold">{{ state.companyName || $t('publicForm.title') }}</span>
            </div>

            <LoadingSpinner :isActive="state.isLoading">
                <!-- Unknown, answered or expired link -->
                <div v-if="state.step === 'closed'" class="rounded-xl border border-gray-200 bg-white p-8 text-center">
                    <Icon :name="closedIcon" class="mx-auto h-10 w-10 text-slate-300" aria-hidden="true" />
                    <h1 class="mt-3 text-lg font-semibold text-slate-900">{{ $t(`publicForm.closed.${state.closedReason}.title`) }}</h1>
                    <p class="mt-1 text-sm text-slate-600">{{ $t(`publicForm.closed.${state.closedReason}.text`) }}</p>
                </div>

                <!-- Date of birth -->
                <form v-else-if="state.step === 'unlock'" class="space-y-5" @submit.prevent="unlock" novalidate>
                    <div>
                        <h1 class="text-2xl font-semibold text-slate-900">
                            {{ $t('publicForm.unlock.heading', { company: state.companyName }) }}
                        </h1>
                        <p class="mt-2 text-sm text-slate-600">{{ $t('publicForm.unlock.intro') }}</p>
                    </div>

                    <Alert type="danger" :text="state.errorText" v-if="state.errorText" />

                    <div class="space-y-2 rounded-xl border border-gray-200 bg-white p-5">
                        <FormLabel for="birthday" :label="$t('publicForm.unlock.birthday')" />
                        <input id="birthday" type="date" v-model="state.birthday" required autocomplete="bday"
                            :max="today"
                            class="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm" />
                    </div>

                    <div class="flex justify-end">
                        <FormButton type="submit" buttonStyle="primary" :disabled="!state.birthday || state.isSending">
                            {{ $t('publicForm.unlock.open') }}
                        </FormButton>
                    </div>
                </form>

                <!-- The form -->
                <form v-else-if="state.step === 'fill'" class="space-y-5" @submit.prevent="submit" novalidate>
                    <div>
                        <h1 class="text-2xl font-semibold text-slate-900">{{ state.form?.title }}</h1>
                        <p v-if="state.form?.description" class="mt-2 text-sm text-slate-600 whitespace-pre-line">
                            {{ state.form.description }}
                        </p>
                    </div>

                    <div class="rounded-xl border border-gray-200 bg-white p-5">
                        <ModulesSharedSurveyFill ref="formFill" :questions="fields" :answers="state.answers" withLayout />
                    </div>

                    <Alert type="danger" :text="state.errorText" v-if="state.errorText" />

                    <p class="text-xs text-slate-500">{{ $t('publicForm.fill.notice', { company: state.companyName }) }}</p>

                    <div class="flex justify-end">
                        <FormButton type="submit" buttonStyle="primary" :disabled="state.isSending">
                            <Icon name="ph:paper-plane-tilt" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('publicForm.fill.send') }}
                        </FormButton>
                    </div>
                </form>

                <!-- Sent -->
                <div v-else-if="state.step === 'done'" class="rounded-xl border border-gray-200 bg-white p-8 text-center"
                    role="status">
                    <Icon name="ph:check-circle" class="mx-auto h-12 w-12 text-emerald-500" aria-hidden="true" />
                    <h1 class="mt-3 text-xl font-semibold text-slate-900">{{ $t('publicForm.done.title') }}</h1>
                    <p class="mt-2 text-sm text-slate-600">{{ $t('publicForm.done.text', { company: state.companyName }) }}</p>
                </div>
            </LoadingSpinner>
        </div>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { PublicFormLinkClient } from '@/components/api/public/PublicFormLinkClient'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'

definePageMeta({ layout: false })

const ANSWERABLE = ['textfield', 'textarea', 'choice', 'checkbox', 'datefield', 'rating', 'scale']
const LAYOUT = ['heading', 'subheading', 'paragraph', 'guidance']

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { t, locale } = useI18n()
const client = new PublicFormLinkClient(runtimeConfig.public.apiBaseURL as string, route.params.token as string)
const formFill = ref()
const today = moment().format('YYYY-MM-DD')

const state = reactive({
    isLoading: true,
    isSending: false,
    step: 'unlock' as 'unlock' | 'fill' | 'done' | 'closed',
    closedReason: 'notFound' as 'notFound' | 'completed' | 'expired',
    companyName: '',
    birthday: '',
    form: null as any,
    answers: {} as Record<string, any>,
    errorText: '',
})

const closedIcon = computed(() => ({
    notFound: 'ph:link-break',
    completed: 'ph:check-circle',
    expired: 'ph:clock-countdown',
}[state.closedReason]))

// The fill component reads a survey question's definition from `question`; a form field carries
// the same shape under `field`.
const fields = computed(() => (state.form?.fields ?? [])
    .filter((field: any) => [...ANSWERABLE, ...LAYOUT].includes(field?.field?.type))
    .map((field: any) => ({ uuid: field.uuid, question: field.field })))

onMounted(async () => {
    if (userStore.getLanguage) locale.value = userStore.getLanguage
    try {
        const response = await client.getSummary()
        state.companyName = response?.data?.company_name ?? ''
        if (response?.data?.status !== 'pending') close(response?.data?.status)
    } catch {
        close('notFound')
    }
    state.isLoading = false
})

function close(reason: string) {
    state.closedReason = reason === 'completed' || reason === 'expired' ? reason : 'notFound'
    state.step = 'closed'
}

/** Messages for the link's own refusals, in this page's language rather than the API's. */
function handleLinkError(error: any): boolean {
    if (error?.status === 404) close('notFound')
    else if (error?.status === 410) close('expired')
    else if (error?.status === 429) state.errorText = t('publicForm.errors.locked')
    else return false
    return true
}

async function unlock() {
    state.errorText = ''
    state.isSending = true
    try {
        const response = await client.unlock(state.birthday)
        state.form = response?.data?.form
        state.companyName = response?.data?.company_name ?? state.companyName
        state.step = 'fill'
        window.scrollTo({ top: 0 })
    } catch (error: any) {
        if (!handleLinkError(error)) {
            state.errorText = error?.status === 400 || error?.status === 422
                ? t('publicForm.errors.wrongBirthday')
                : t('publicForm.errors.failed')
        }
    }
    state.isSending = false
}

async function submit() {
    state.errorText = ''

    if ((formFill.value?.missingRequiredQuestions() ?? []).length > 0) {
        state.errorText = t('publicForm.errors.required')
        return
    }

    state.isSending = true
    try {
        await client.submit(state.birthday, state.answers)
        state.step = 'done'
        window.scrollTo({ top: 0 })
    } catch (error: any) {
        if (!handleLinkError(error)) {
            state.errorText = error?.message || t('publicForm.errors.failed')
        }
    }
    state.isSending = false
}
</script>
