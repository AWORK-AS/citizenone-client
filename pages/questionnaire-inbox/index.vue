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
                <div class="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        {{ $t('questionnaireInbox.title') }}
                        <p class="text-sm font-normal text-gray-900">
                            {{ $t('questionnaireInbox.subtitle') }}
                        </p>
                    </div>
                    <FormButton v-if="canSend" type="button" buttonStyle="primary" @click="state.modal.isSendOpen = true">
                        <Icon name="ph:paper-plane-tilt" class="h-4 w-4" />
                        {{ $t('questionnaireInbox.sendQuestionnaire') }}
                    </FormButton>
                </div>
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
                            <FormLabel for="inbox_from" :label="isAwaitingTab ? $t('questionnaireInbox.filters.sentFrom') : $t('questionnaireInbox.filters.from')" />
                            <FormDateField id="inbox_from" name="inbox_from" v-model="state.filters.from"
                                :placeholder="isAwaitingTab ? $t('questionnaireInbox.filters.sentFrom') : $t('questionnaireInbox.filters.from')" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="inbox_to" :label="isAwaitingTab ? $t('questionnaireInbox.filters.sentTo') : $t('questionnaireInbox.filters.to')" />
                            <FormDateField id="inbox_to" name="inbox_to" v-model="state.filters.to"
                                :placeholder="isAwaitingTab ? $t('questionnaireInbox.filters.sentTo') : $t('questionnaireInbox.filters.to')" />
                        </div>
                    </div>
                    <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
                            <div class="flex items-center gap-x-2">
                                <FormSwitch :value="state.filters.sentByMe" :label="$t('questionnaireInbox.filters.sentByMe')"
                                    @toggleSwitch="state.filters.sentByMe = !state.filters.sentByMe" />
                                <span class="text-sm text-gray-700">{{ $t('questionnaireInbox.filters.sentByMe') }}</span>
                            </div>
                            <div v-if="isAwaitingTab" class="flex items-center gap-x-2">
                                <FormSwitch :value="state.filters.onlyExpired" :label="$t('questionnaireInbox.filters.onlyExpired')"
                                    @toggleSwitch="state.filters.onlyExpired = !state.filters.onlyExpired" />
                                <span class="text-sm text-gray-700">{{ $t('questionnaireInbox.filters.onlyExpired') }}</span>
                            </div>
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
                        <div class="space-y-3" v-if="isAwaitingTab && items.length > 0">
                            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead class="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        <tr>
                                            <th scope="col" class="px-4 py-3">{{ $t('questionnaireInbox.awaiting.patient') }}</th>
                                            <th scope="col" class="px-4 py-3">{{ $t('questionnaireInbox.awaiting.questionnaire') }}</th>
                                            <th scope="col" class="px-4 py-3">
                                                <button type="button" class="inline-flex items-center gap-1 uppercase tracking-wide"
                                                    @click="toggleSort">
                                                    {{ $t('questionnaireInbox.awaiting.sent') }}
                                                    <Icon :name="state.sort === 'oldest' ? 'ph:arrow-up' : 'ph:arrow-down'" class="h-3 w-3"
                                                        aria-hidden="true" />
                                                </button>
                                            </th>
                                            <th scope="col" class="px-4 py-3">{{ $t('questionnaireInbox.awaiting.waiting') }}</th>
                                            <th scope="col" class="px-4 py-3">{{ $t('questionnaireInbox.sentBy') }}</th>
                                            <th scope="col" class="px-4 py-3">{{ $t('questionnaireInbox.awaiting.delivery') }}</th>
                                            <th scope="col" class="px-4 py-3">{{ $t('questionnaireInbox.awaiting.status') }}</th>
                                            <th scope="col" class="px-4 py-3"><span class="sr-only">{{ $t('questionnaireInbox.awaiting.actions') }}</span></th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-100">
                                        <tr v-for="item in items" :key="`${item.type}-${item.uuid}`"
                                            class="cursor-pointer hover:bg-gray-50" @click="openAwaiting(item)">
                                            <td class="px-4 py-3 font-medium text-gray-900">
                                                <NuxtLink :to="awaitingLink(item)" @click.stop>{{ patientName(item) }}</NuxtLink>
                                            </td>
                                            <td class="px-4 py-3">
                                                <p class="text-gray-900">{{ item.title }}</p>
                                                <span :class="['mt-1 inline-block text-xs font-medium rounded-full px-2.5 py-0.5',
                                                    item.type === 'survey' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800']">
                                                    {{ $t(`questionnaireInbox.type.${item.type}`) }}
                                                </span>
                                            </td>
                                            <td class="px-4 py-3 whitespace-nowrap text-gray-700">{{ formatDateTime(item.sent_at) }}</td>
                                            <td class="px-4 py-3 whitespace-nowrap text-gray-700">{{ waitingText(item.days_waiting) }}</td>
                                            <td class="px-4 py-3 text-gray-700">{{ item.sent_by?.name || '-' }}</td>
                                            <td class="px-4 py-3 text-gray-700">
                                                {{ $t(`patientForms.delivery.${item.delivery ?? 'portal'}`) }}
                                                <span v-if="item.recipient" class="block text-xs text-gray-500">{{ item.recipient }}</span>
                                            </td>
                                            <td class="px-4 py-3 whitespace-nowrap">
                                                <span :class="['text-xs font-medium rounded-full px-2.5 py-0.5', pendingStyle(item.pending_state)]">
                                                    {{ $t(`questionnaireInbox.pending.${pendingKey(item.pending_state)}`) }}
                                                </span>
                                            </td>
                                            <td class="px-4 py-3">
                                                <div class="flex flex-wrap items-center justify-end gap-2">
                                                    <FormButton v-if="item.can_resend" type="button" buttonStyle="cancel" buttonSize="xs"
                                                        :disabled="state.busyUuid === item.uuid" @click.stop="resend(item)">
                                                        {{ $t('questionnaireInbox.actions.resend') }}
                                                    </FormButton>
                                                    <FormButton v-if="item.can_withdraw" type="button" buttonStyle="danger" buttonSize="xs"
                                                        :disabled="state.busyUuid === item.uuid" @click.stop="confirmWithdraw(item)">
                                                        {{ $t('questionnaireInbox.actions.withdraw') }}
                                                    </FormButton>
                                                    <NuxtLink v-if="item.citizen?.uuid" :to="`/citizens/${item.citizen.uuid}/journals`"
                                                        class="text-sm font-medium text-primary hover:underline whitespace-nowrap" @click.stop>
                                                        {{ $t('questionnaireInbox.actions.openPatient') }}
                                                    </NuxtLink>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <Pagination :data="state.questionnaires" :showPages="true" @previous="previous" @next="next"
                                @page="goToPage" />
                        </div>
                        <div class="space-y-3" v-else-if="items.length > 0">
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

            <ModulesUserQuestionnaireModalSend :isModalOpen="state.modal.isSendOpen" :showToast="false"
                @close="state.modal.isSendOpen = false" @sent="onSent" />

            <DialogConfirmation :isModalOpen="state.modal.isWithdrawOpen"
                :title="$t('questionnaireInbox.actions.withdraw')" :message="$t('questionnaireInbox.withdrawConfirm')"
                @close="state.modal.isWithdrawOpen = false" @confirm="withdraw" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { questionnaireInboxService } from '@/components/api/user/QuestionnaireInboxService'
import { formService } from '@/components/api/user/FormService'
import { surveyService } from '@/components/api/user/SurveyService'
import { canUseQuestionnaireInbox, useQuestionnaireInbox } from '@/composables/questionnaireInbox'
import { usePermissions } from '@/composables/usePermissions'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

definePageMeta({ middleware: 'require-questionnaire-inbox' })

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { refreshCounts } = useQuestionnaireInbox()
const { successAlert } = useAlert()
const { isAtLeast, can } = usePermissions()

// The same rule as the inbox itself: those who may send forms and surveys.
const canSend = computed(() => canUseQuestionnaireInbox(userStore.getUser, isAtLeast, can))

const breadcrumbLinks = [
    {
        name: 'questionnaireInbox.title',
        translate: true,
        href: '/questionnaire-inbox',
    },
]

const TABS = ['awaiting', 'to_review', 'approved', 'declined', 'all']
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
        // Awaiting tab only.
        onlyExpired: false,
    },
    // Awaiting tab: longest waiting first.
    sort: 'oldest' as 'oldest' | 'newest',
    awaitingCount: undefined as number | undefined,
    busyUuid: '',
    selectedItem: null as any,
    modal: { isSendOpen: false, isWithdrawOpen: false },
    options: { questionnaires: [] as any[] },
})

const isAwaitingTab = computed(() => state.tab === 'awaiting')

const items = computed<any[]>(() => state.questionnaires?.data ?? [])

const toReviewCount = computed<number | undefined>(() => {
    const count = userStore.getUser?.questionnaire_inbox_to_review_count
    return typeof count === 'number' && count > 0 ? count : undefined
})

const tabs = computed(() => [
    { key: 'awaiting', label: t('questionnaireInbox.tabs.awaiting'), count: state.awaitingCount && state.awaitingCount > 0 ? state.awaitingCount : undefined },
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
    || state.filters.sentByMe
    || (isAwaitingTab.value && state.filters.onlyExpired))

function patientName(item: any): string {
    return [item?.citizen?.firstname, item?.citizen?.lastname].filter(Boolean).join(' ')
}

function formatDateTime(date: any): string {
    return date ? moment(date).format('DD-MM-YYYY HH:mm') : '-'
}

function waitingText(days: any): string {
    const count = Number(days ?? 0)
    if (count <= 0) return t('questionnaireInbox.awaiting.today')
    if (count === 1) return t('questionnaireInbox.awaiting.daysWaitingOne')
    return t('questionnaireInbox.awaiting.daysWaiting', { days: count })
}

function pendingKey(pendingState: any): string {
    return pendingState === 'opened' || pendingState === 'expired' ? pendingState : 'waiting'
}

function pendingStyle(pendingState: any): string {
    if (pendingState === 'opened') return 'bg-blue-100 text-blue-800'
    if (pendingState === 'expired') return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-700'
}

// A waiting questionnaire is not returned, so there is nothing to review: the row leads to the
// patient's own forms or surveys tab, where it was sent.
function awaitingLink(item: any): string {
    return `/citizens/${item?.citizen?.uuid}/${item?.type === 'survey' ? 'surveys' : 'patient-forms'}`
}

function openAwaiting(item: any) {
    if (item?.citizen?.uuid) navigateTo(awaitingLink(item))
}

function toggleSort() {
    state.sort = state.sort === 'oldest' ? 'newest' : 'oldest'
}

async function refreshAllCounts() {
    const counts = await refreshCounts()
    if (counts) state.awaitingCount = counts.awaiting
}

async function onSent(payload: any) {
    successAlert(`${t('alert.success')}!`, t('questionnaireInbox.sentToast', { name: payload?.citizenName ?? '' }))
    await Promise.all([fetchQuestionnaires(), refreshAllCounts()])
}

async function resend(item: any) {
    state.error = {}
    state.busyUuid = item.uuid
    try {
        const response = await questionnaireInboxService.resend(item.uuid)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, t('questionnaireInbox.alert.resent'))
            await Promise.all([fetchQuestionnaires(), refreshAllCounts()])
        }
    } catch (error: any) {
        state.error = error
    }
    state.busyUuid = ''
}

function confirmWithdraw(item: any) {
    state.selectedItem = item
    state.modal.isWithdrawOpen = true
}

async function withdraw() {
    const item = state.selectedItem
    if (!item) return
    state.error = {}
    state.busyUuid = item.uuid
    try {
        await questionnaireInboxService.withdraw(item.type, item.uuid, item.questionnaire_uuid)
        successAlert(`${t('alert.success')}!`, t('questionnaireInbox.alert.withdrawn'))
        await Promise.all([fetchQuestionnaires(), refreshAllCounts()])
    } catch (error: any) {
        state.error = error
    }
    state.busyUuid = ''
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
        if (state.tab === 'awaiting') {
            if (state.filters.onlyExpired) params.only_expired = 1
            params.sort = state.sort
        }
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
    () => [state.tab, state.filters.search, state.filters.questionnaire, state.filters.from, state.filters.to, state.filters.sentByMe, state.filters.onlyExpired, state.sort],
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
    state.filters.onlyExpired = false
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
    // The numbers (sidebar badge, Awaiting tab) may be stale if colleagues have been working in the inbox.
    refreshAllCounts()
})

onBeforeUnmount(() => clearTimeout(filterTimeout))
</script>
