<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('questionnaireInbox.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                {{ $t('questionnaireInbox.title') }}
                <p class="text-sm font-normal text-gray-900">
                    {{ $t('questionnaireInbox.subtitle') }}
                </p>
            </template>

            <div class="space-y-4">
                <TabsLocal v-model="state.tab" :tabs="tabs" />

                <div class="bg-white ring-1 ring-gray-200 rounded-md p-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 items-end">
                        <div class="space-y-1 xl:col-span-2">
                            <FormLabel for="inbox_search" :label="$t('questionnaireInbox.filters.search')" />
                            <FormTextField id="inbox_search" name="inbox_search" v-model="state.filters.search"
                                :placeholder="$t('questionnaireInbox.filters.searchPlaceholder')" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="inbox_questionnaire" :label="$t('questionnaireInbox.filters.questionnaire')" />
                            <FormSelect id="inbox_questionnaire" :options="state.options.questionnaires"
                                v-model="state.filters.questionnaire"
                                :placeholder="$t('questionnaireInbox.filters.allQuestionnaires')" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="inbox_from" :label="$t('questionnaireInbox.filters.from')" />
                            <FormDateField id="inbox_from" name="inbox_from" v-model="state.filters.from"
                                :placeholder="$t('questionnaireInbox.filters.from')" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="inbox_to" :label="$t('questionnaireInbox.filters.to')" />
                            <FormDateField id="inbox_to" name="inbox_to" v-model="state.filters.to"
                                :placeholder="$t('questionnaireInbox.filters.to')" />
                        </div>
                    </div>
                    <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <div class="flex items-center gap-x-2">
                            <FormSwitch :value="state.filters.sentByMe" :label="$t('questionnaireInbox.filters.sentByMe')"
                                @toggleSwitch="state.filters.sentByMe = !state.filters.sentByMe" />
                            <span class="text-sm text-gray-700">{{ $t('questionnaireInbox.filters.sentByMe') }}</span>
                        </div>
                        <button v-if="hasActiveFilters" type="button"
                            class="text-sm font-medium text-primary hover:underline" @click="clearFilters">
                            {{ $t('questionnaireInbox.filters.clear') }}
                        </button>
                    </div>
                </div>

                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div class="min-h-44">
                    <LoadingSpinner :isActive="state.isPageLoading">
                        <div class="space-y-3" v-if="items.length > 0">
                            <NuxtLink v-for="item in items" :key="`${item.type}-${item.uuid}`"
                                :to="`/questionnaire-inbox/${item.type}/${item.uuid}`"
                                class="block bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-5 py-4 border-l-4 hover:ring-primary/40 transition"
                                :class="item.review_status === 'to_review' ? 'border-amber-400' : 'border-transparent'">
                                <div class="flex flex-col md:flex-row md:items-center gap-3 md:gap-8">
                                    <div class="grow min-w-0 space-y-1">
                                        <p class="font-semibold text-gray-900 truncate">
                                            {{ patientName(item) }}
                                        </p>
                                        <p class="text-sm text-gray-700 truncate">{{ item.title }}</p>
                                        <div class="flex flex-wrap items-center gap-2">
                                            <span :class="['text-xs font-medium rounded-full px-2.5 py-0.5',
                                                item.type === 'survey' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800']">
                                                {{ $t(`questionnaireInbox.type.${item.type}`) }}
                                            </span>
                                            <span v-if="item.type === 'survey' && item.score !== null && item.score !== undefined"
                                                class="text-xs font-medium rounded-full px-2.5 py-0.5 bg-gray-100 text-gray-800">
                                                {{ $t('questionnaireInbox.score') }}: {{ item.score }}
                                                <template v-if="item.score_label">({{ item.score_label }})</template>
                                            </span>
                                        </div>
                                        <p class="text-sm text-gray-500">
                                            {{ $t('questionnaireInbox.returned') }}: {{ formatDateTime(item.completed_at) }}
                                            <template v-if="item.sent_by?.name">
                                                · {{ $t('questionnaireInbox.sentBy') }}: {{ item.sent_by.name }}
                                            </template>
                                        </p>
                                    </div>
                                    <ModulesUserQuestionnaireInboxReviewStatus :status="item.review_status"
                                        :review="item.review" align="end" class="shrink-0" />
                                </div>
                            </NuxtLink>
                            <Pagination :data="state.questionnaires" :showPages="true" @previous="previous" @next="next"
                                @page="goToPage" />
                        </div>
                        <div v-else-if="!state.isPageLoading"
                            class="px-6 py-14 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg text-center">
                            <div class="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                                <Icon name="ph:tray" class="h-7 w-7 text-primary" />
                            </div>
                            <p class="mt-4 text-lg font-semibold text-gray-900">
                                {{ $t(`questionnaireInbox.empty.${state.tab}`) }}
                            </p>
                        </div>
                    </LoadingSpinner>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { questionnaireInboxService } from '@/components/api/user/QuestionnaireInboxService'
import { formService } from '@/components/api/user/FormService'
import { surveyService } from '@/components/api/user/SurveyService'
import { useQuestionnaireInbox } from '@/composables/questionnaireInbox'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

definePageMeta({ middleware: 'require-questionnaire-inbox' })

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { refreshToReviewCount } = useQuestionnaireInbox()

const breadcrumbLinks = [
    {
        name: 'questionnaireInbox.title',
        translate: true,
        href: '/questionnaire-inbox',
    },
]

const TABS = ['to_review', 'approved', 'declined', 'all']
const initialTab = TABS.includes(route.query?.status as string) ? (route.query.status as string) : 'to_review'

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    tab: initialTab,
    page: 1,
    questionnaires: null as any,
    filters: {
        search: '',
        // 'form:<uuid>' or 'survey:<uuid>': one select for both kinds.
        questionnaire: null as string | null,
        from: '',
        to: '',
        sentByMe: false,
    },
    options: { questionnaires: [] as any[] },
})

const items = computed<any[]>(() => state.questionnaires?.data ?? [])

const toReviewCount = computed<number | undefined>(() => {
    const count = userStore.getUser?.questionnaire_inbox_to_review_count
    return typeof count === 'number' && count > 0 ? count : undefined
})

const tabs = computed(() => [
    { key: 'to_review', label: t('questionnaireInbox.tabs.to_review'), count: toReviewCount.value },
    { key: 'approved', label: t('questionnaireInbox.tabs.approved') },
    { key: 'declined', label: t('questionnaireInbox.tabs.declined') },
    { key: 'all', label: t('questionnaireInbox.tabs.all') },
])

const hasActiveFilters = computed(() =>
    state.filters.search.trim() !== ''
    || !!state.filters.questionnaire
    || state.filters.from !== ''
    || state.filters.to !== ''
    || state.filters.sentByMe)

function patientName(item: any): string {
    return [item?.citizen?.firstname, item?.citizen?.lastname].filter(Boolean).join(' ')
}

function formatDateTime(date: any): string {
    return date ? moment(date).format('DD-MM-YYYY HH:mm') : '-'
}

let requestCounter = 0

async function fetchQuestionnaires() {
    const request = ++requestCounter
    state.error = {}
    state.isPageLoading = true
    try {
        const params: Record<string, any> = {
            review_status: state.tab,
            page: state.page,
        }
        const search = state.filters.search.trim()
        if (search) params.search = search
        if (state.filters.sentByMe) params.sent_by_me = 1
        if (state.filters.from) params.date_from = state.filters.from
        if (state.filters.to) params.date_to = state.filters.to
        if (state.filters.questionnaire) {
            const [type, uuid] = state.filters.questionnaire.split(':')
            params.type = type
            params[`${type}_uuid`] = uuid
        }
        const response = await questionnaireInboxService.getQuestionnaires(params)
        // A slower answer to an older filter must not overwrite a newer one.
        if (request !== requestCounter) return
        state.questionnaires = response
    } catch (error: any) {
        if (request !== requestCounter) return
        state.error = error
    }
    state.isPageLoading = false
}

// The questionnaires a company can filter on: its forms and, where surveys are on, its surveys.
async function fetchQuestionnaireOptions() {
    const options: any[] = []
    try {
        const response = await formService.getAllForms()
        ;(response?.data ?? []).filter((form: any) => form?.uuid).forEach((form: any) => {
            options.push({ value: `form:${form.uuid}`, label: `${form.title} (${t('questionnaireInbox.type.form')})` })
        })
    } catch (error: any) {
        state.error = error
    }
    if (userStore.getUser?.is_surveys_active !== false) {
        try {
            const response = await surveyService.getAllSurveys()
            ;(response?.data ?? []).filter((survey: any) => survey?.uuid).forEach((survey: any) => {
                options.push({ value: `survey:${survey.uuid}`, label: `${survey.title} (${t('questionnaireInbox.type.survey')})` })
            })
        } catch {
            // Surveys are an add-on: a company without them just has no surveys to filter on.
        }
    }
    state.options.questionnaires = options
}

// Any change of tab or filter starts again from the first page. Typing in the search box waits a moment.
let filterTimeout: any = null
watch(
    () => [state.tab, state.filters.search, state.filters.questionnaire, state.filters.from, state.filters.to, state.filters.sentByMe],
    () => {
        clearTimeout(filterTimeout)
        filterTimeout = setTimeout(() => {
            state.page = 1
            fetchQuestionnaires()
        }, 300)
    },
)

// The tab goes in the address, so the browser's back button from a questionnaire lands on the same tab.
watch(() => state.tab, (tab) => {
    router.replace({ query: { ...route.query, status: tab === 'to_review' ? undefined : tab } })
})

function clearFilters() {
    state.filters.search = ''
    state.filters.questionnaire = null
    state.filters.from = ''
    state.filters.to = ''
    state.filters.sentByMe = false
}

function previous() {
    state.page--
    fetchQuestionnaires()
}

function next() {
    state.page++
    fetchQuestionnaires()
}

function goToPage(page: number) {
    state.page = page
    fetchQuestionnaires()
}

onMounted(() => {
    fetchQuestionnaires()
    fetchQuestionnaireOptions()
    // The number in the sidebar may be stale if colleagues have been working in the inbox.
    refreshToReviewCount()
})

onBeforeUnmount(() => clearTimeout(filterTimeout))
</script>
