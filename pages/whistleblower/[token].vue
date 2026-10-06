<template>
    <Head>
        <Title>{{ $t('whistleblower.public.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
        <!-- A company's private report link should never end up in a search engine. -->
        <Meta name="robots" content="noindex, nofollow" />
        <Meta name="referrer" content="no-referrer" />
    </Head>

    <div class="min-h-screen bg-gray-50">
        <div class="mx-auto w-full max-w-2xl px-4 py-10">
            <div class="mb-6 flex items-center justify-between gap-4">
                <div class="flex items-center gap-x-2 text-primary">
                    <Icon name="ph:shield-check" class="h-6 w-6" aria-hidden="true" />
                    <span class="text-sm font-semibold">{{ $t('whistleblower.public.title') }}</span>
                </div>
                <!-- Language: same look as the switcher on the login pages -->
                <div ref="languageMenu" class="relative" @keydown.escape="state.languageOpen = false">
                    <button type="button" @click="state.languageOpen = !state.languageOpen"
                        :aria-expanded="state.languageOpen" aria-haspopup="listbox"
                        :aria-label="$t('whistleblower.public.language')"
                        class="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white py-[5px] pl-[6px] pr-[10px] text-xs font-semibold text-slate-500 transition-colors hover:border-slate-300">
                        <img :src="currentLanguage.flag" alt="" class="h-5 w-5 rounded-full object-cover" />
                        {{ currentLanguage.code }}
                        <Icon name="ph:caret-down" class="h-3 w-3" aria-hidden="true" />
                    </button>
                    <ul v-if="state.languageOpen" role="listbox" :aria-label="$t('whistleblower.public.language')"
                        class="absolute right-0 top-[calc(100%+6px)] z-[100] min-w-[140px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                        <li v-for="language in LANGUAGES" :key="language.value" role="option"
                            :aria-selected="locale === language.value">
                            <button type="button" @click="setLanguage(language.value)"
                                :class="['flex w-full items-center gap-2 px-3.5 py-2.5 text-[13px] font-medium text-slate-800 transition-colors hover:bg-primary-25',
                                    locale === language.value && 'bg-primary-25']">
                                <img :src="language.flag" alt="" class="h-5 w-5 rounded-full object-cover" />
                                {{ language.label }}
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            <LoadingSpinner :isActive="state.isLoading">
                <!-- Wrong or switched-off link -->
                <div v-if="state.notFound" class="rounded-xl border border-gray-200 bg-white p-8 text-center">
                    <Icon name="ph:link-break" class="mx-auto h-10 w-10 text-slate-300" aria-hidden="true" />
                    <h1 class="mt-3 text-lg font-semibold text-slate-900">{{ $t('whistleblower.public.notFoundTitle') }}</h1>
                    <p class="mt-1 text-sm text-slate-600">{{ $t('whistleblower.public.notFound') }}</p>
                </div>

                <!-- Sent -->
                <div v-else-if="state.receipt" class="rounded-xl border border-gray-200 bg-white p-8 text-center"
                    role="status">
                    <Icon name="ph:check-circle" class="mx-auto h-12 w-12 text-emerald-500" aria-hidden="true" />
                    <h1 class="mt-3 text-xl font-semibold text-slate-900">{{ $t('whistleblower.public.sentTitle') }}</h1>
                    <p class="mt-2 text-sm text-slate-600">{{ $t('whistleblower.public.sent', { company: state.form.company_name }) }}</p>
                    <p class="mt-5 text-xs uppercase tracking-wide text-slate-500">{{ $t('whistleblower.public.reference') }}</p>
                    <p class="mt-1 font-mono text-2xl font-semibold tracking-wider text-slate-900">{{ state.receipt.reference }}</p>
                    <p class="mt-4 text-sm text-slate-600">
                        {{ state.receipt.anonymous ? $t('whistleblower.public.sentAnonymous') : $t('whistleblower.public.sentWithContact') }}
                    </p>
                </div>

                <!-- The form -->
                <form v-else-if="state.form" class="space-y-5" @submit.prevent="submit" novalidate>
                    <div>
                        <h1 class="text-2xl font-semibold text-slate-900">{{ $t('whistleblower.public.heading', { company: state.form.company_name }) }}</h1>
                        <p class="mt-2 text-sm text-slate-600">{{ $t('whistleblower.public.intro') }}</p>
                    </div>

                    <div class="flex items-start gap-x-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-slate-700">
                        <Icon name="ph:user-circle-dashed" class="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                        <div class="space-y-1">
                            <p class="font-medium text-slate-900">{{ $t('whistleblower.public.anonymousTitle') }}</p>
                            <p>{{ $t('whistleblower.public.anonymousText') }}</p>
                        </div>
                    </div>

                    <!-- Translated here rather than taken from the API, so the
                         messages follow the language chosen on this page. -->
                    <Alert type="danger" :text="$t(`whistleblower.public.${state.errorKey}`)" v-if="state.errorKey" />

                    <div class="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
                        <div>
                            <FormLabel :label="$t('whistleblower.public.category')" />
                            <FormSelect v-model="state.values.category" :options="categoryOptions" :canClear="false"
                                :canDeselect="false" :placeholder="$t('whistleblower.public.categoryPlaceholder')" />
                            <FormError :error="fieldError('category')" />
                        </div>
                        <div>
                            <FormLabel for="wb-subject" :label="$t('whistleblower.public.subject')" />
                            <FormTextField id="wb-subject" name="subject" v-model="state.values.subject" :maxLength="200" />
                            <FormError :error="fieldError('subject')" />
                        </div>
                        <div>
                            <FormLabel for="wb-description" :label="$t('whistleblower.public.description')" />
                            <FormTextArea name="wb-description" v-model="state.values.description" :rows="8"
                                :placeholder="$t('whistleblower.public.descriptionPlaceholder')" />
                            <FormError :error="fieldError('description')" />
                        </div>

                        <div v-if="SHOW_CONTACT_OPTION" class="border-t border-gray-100 pt-4">
                            <div class="flex items-start gap-x-3">
                                <FormSwitch :value="state.includeContact" @toggleSwitch="state.includeContact = !state.includeContact" />
                                <div>
                                    <p class="text-sm font-medium text-slate-900">{{ $t('whistleblower.public.includeContact') }}</p>
                                    <p class="text-xs text-slate-500">{{ $t('whistleblower.public.includeContactHelp') }}</p>
                                </div>
                            </div>
                            <div v-if="state.includeContact" class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <FormLabel for="wb-name" :label="$t('whistleblower.public.name')" />
                                    <FormTextField id="wb-name" name="name" v-model="state.values.reporter_name" :maxLength="200" />
                                </div>
                                <div>
                                    <FormLabel for="wb-contact" :label="$t('whistleblower.public.contact')" />
                                    <FormTextField id="wb-contact" name="contact" v-model="state.values.reporter_contact" :maxLength="200" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end">
                        <FormButton type="submit" buttonStyle="primary" :disabled="state.isSending">
                            <Icon name="ph:paper-plane-tilt" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('whistleblower.public.send') }}
                        </FormButton>
                    </div>
                </form>
            </LoadingSpinner>
        </div>
    </div>
</template>

<script setup lang="ts">
import { PublicWhistleblowerClient } from '@/components/api/public/PublicWhistleblowerClient'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'

definePageMeta({ layout: false })

// The "include my name or contact details" option is hidden for now, so every
// report is anonymous. The API still accepts the fields; set this to true to
// offer it again.
const SHOW_CONTACT_OPTION = false

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { t, locale } = useI18n()
const client = new PublicWhistleblowerClient(runtimeConfig.public.apiBaseURL as string, route.params.token as string)

const LANGUAGES = [
    { value: 'dk', code: 'DK', label: 'Dansk', flag: '/img/icons/flags/denmark.svg' },
    { value: 'en', code: 'EN', label: 'English', flag: '/img/icons/flags/united-kingdom.svg' },
    { value: 'no', code: 'NO', label: 'Norsk', flag: '/img/icons/flags/norway.svg' },
    { value: 'sv', code: 'SV', label: 'Svenska', flag: '/img/icons/flags/sweden.svg' },
]

const languageMenu = ref<HTMLElement | null>(null)
const currentLanguage = computed(() => LANGUAGES.find((language) => language.value === locale.value) ?? LANGUAGES[0])

// Close the language menu on a click anywhere else.
function closeLanguageOnOutsideClick(event: MouseEvent) {
    if (languageMenu.value && !languageMenu.value.contains(event.target as Node)) state.languageOpen = false
}
onMounted(() => document.addEventListener('click', closeLanguageOnOutsideClick))
onBeforeUnmount(() => document.removeEventListener('click', closeLanguageOnOutsideClick))

const state = reactive({
    languageOpen: false,
    isLoading: true,
    isSending: false,
    notFound: false,
    form: null as any,
    receipt: null as { reference: string, anonymous: boolean } | null,
    includeContact: false,
    // i18n keys under whistleblower.public, not text: see the Alert above.
    errorKey: '',
    fieldErrors: {} as Record<string, 'required' | 'invalidField'>,
    values: {
        category: null as string | null,
        subject: '',
        description: '',
        reporter_name: '',
        reporter_contact: '',
    },
})

const categoryOptions = computed(() => (state.form?.categories ?? [])
    .map((key: string) => ({ value: key, label: t(`whistleblower.categories.${key}`) })))

onMounted(async () => {
    // The same language the browser last used in the app, else Danish.
    if (userStore.getLanguage) locale.value = userStore.getLanguage
    try {
        const response = await client.getForm()
        state.form = response?.data
    } catch {
        state.notFound = true
    }
    state.isLoading = false
})

function setLanguage(lang: string) {
    locale.value = lang
    userStore.setLanguage(lang)
    state.languageOpen = false
}

function fieldError(field: string): string {
    const key = state.fieldErrors[field]
    return key ? t(`whistleblower.public.${key}`) : ''
}

/** The three required fields, checked here so the messages are in the page's language. */
function validate(): boolean {
    const fieldErrors: Record<string, 'required'> = {}
    if (!state.values.category) fieldErrors.category = 'required'
    if (!state.values.subject.trim()) fieldErrors.subject = 'required'
    if (!state.values.description.trim()) fieldErrors.description = 'required'
    state.fieldErrors = fieldErrors
    return Object.keys(fieldErrors).length === 0
}

async function submit() {
    state.errorKey = ''
    if (!validate()) {
        state.errorKey = 'checkFields'
        return
    }
    state.isSending = true
    try {
        const anonymous = !SHOW_CONTACT_OPTION || !state.includeContact
        const response = await client.submit({
            category: state.values.category,
            subject: state.values.subject,
            description: state.values.description,
            reporter_name: anonymous ? null : state.values.reporter_name || null,
            reporter_contact: anonymous ? null : state.values.reporter_contact || null,
        })
        state.receipt = { reference: response?.data?.reference, anonymous: anonymous || (!state.values.reporter_name && !state.values.reporter_contact) }
        window.scrollTo({ top: 0 })
    } catch (error: any) {
        if (error?.status === 404) state.notFound = true
        else if (error?.status === 429) state.errorKey = 'tooMany'
        else if (error?.status === 422) {
            // Anything the API still rejects (e.g. too long): marked, in this page's language.
            state.errorKey = 'checkFields'
            state.fieldErrors = Object.fromEntries(Object.keys(error.errors ?? {}).map((field) => [field, 'invalidField']))
        }
        else state.errorKey = 'sendFailed'
    }
    state.isSending = false
}
</script>
