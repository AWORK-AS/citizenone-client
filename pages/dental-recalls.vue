<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('dentalRecalls.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('dentalRecalls.title') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state.error" v-if="state.error" />

                <div class="flex flex-wrap items-center justify-between gap-3">
                    <p class="text-sm text-gray-500 max-w-2xl">{{ $t('dentalRecalls.help') }}</p>

                    <div class="inline-flex rounded-lg bg-gray-100 p-0.5">
                        <button type="button" v-for="option in windowOptions" :key="option.value"
                            @click="setWindow(option.value)" :class="[
                                'rounded-md px-3 py-1.5 text-sm font-medium transition',
                                state.withinDays === option.value
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            ]">
                            {{ option.label }}
                        </button>
                    </div>
                </div>

                <LoadingSpinner :isActive="state.isPageLoading">
                    <div v-if="state.recalls.length === 0"
                        class="px-6 py-14 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg text-center">
                        <div class="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon name="ph:calendar-check" class="h-7 w-7 text-primary" />
                        </div>
                        <h3 class="mt-4 text-lg font-semibold text-gray-900">{{ $t('dentalRecalls.empty.title') }}</h3>
                        <p class="mt-1 text-sm text-gray-500 max-w-md mx-auto">{{ $t('dentalRecalls.empty.text') }}</p>
                    </div>

                    <div v-else class="space-y-4">
                        <p class="text-sm text-gray-600" v-if="state.overdueCount > 0">
                            <strong class="text-red-600">{{ state.overdueCount }}</strong>
                            {{ $t('dentalRecalls.overdueCount') }}
                        </p>

                        <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-x-auto">
                            <table class="min-w-full text-sm">
                                <thead>
                                    <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
                                        <th class="px-4 py-3">{{ $t('dentalRecalls.table.patient') }}</th>
                                        <th class="px-4 py-3">{{ $t('dentalRecalls.table.due') }}</th>
                                        <th class="px-4 py-3">{{ $t('dentalRecalls.table.channel') }}</th>
                                        <th class="px-4 py-3">{{ $t('dentalRecalls.table.lastContact') }}</th>
                                        <th class="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="recall in state.recalls" :key="recall.citizen_uuid"
                                        class="border-t border-gray-100">
                                        <td class="px-4 py-3">
                                            <button type="button" class="font-medium text-primary hover:underline"
                                                @click="navigateTo(`/citizens/${recall.citizen_uuid}/tooth-chart`)">
                                                {{ recall.name }}
                                            </button>
                                            <p class="text-xs text-gray-500">
                                                <span v-if="recall.patient_number" class="tabular-nums">
                                                    {{ recall.patient_number }}
                                                </span>
                                                <span v-if="recall.phone" class="tabular-nums">
                                                    &middot; {{ recall.phone }}
                                                </span>
                                            </p>
                                        </td>
                                        <td class="px-4 py-3 tabular-nums">
                                            <span :class="recall.days_overdue > 0 ? 'text-red-600 font-medium' : ''">
                                                {{ formatDate(recall.due_date) }}
                                            </span>
                                            <p class="text-xs text-red-600" v-if="recall.days_overdue > 0">
                                                {{ recall.days_overdue }} {{ $t('dentalRecalls.daysOverdue') }}
                                            </p>
                                        </td>
                                        <td class="px-4 py-3">
                                            <span class="inline-flex items-center gap-1.5">
                                                <Icon :name="channelIcon(recall.recall_channel)"
                                                    class="size-4 text-gray-400" />
                                                {{ recall.recall_channel
                                                    ? $t(`citizens.form.dental.recallChannel.${recall.recall_channel}`)
                                                    : $t('dentalRecalls.noChannel') }}
                                            </span>
                                            <p class="text-xs text-amber-700" v-if="recall.needs_manual_contact">
                                                {{ $t('dentalRecalls.manual') }}
                                            </p>
                                            <p class="text-xs text-gray-500" v-else-if="!recall.auto_reminder">
                                                {{ $t('dentalRecalls.autoOff') }}
                                            </p>
                                        </td>
                                        <td class="px-4 py-3 text-gray-600 tabular-nums">
                                            {{ recall.last_reminder_sent_at ? formatDate(recall.last_reminder_sent_at) : '' }}
                                        </td>
                                        <td class="px-4 py-3 text-right">
                                            <div class="inline-flex items-center gap-2">
                                                <FormButton buttonStyle="action" buttonSize="xs"
                                                    @click="markContacted(recall)">
                                                    <Icon name="ph:check" class="size-4" />
                                                    {{ $t('dentalRecalls.markContacted') }}
                                                </FormButton>
                                                <!-- Marking someone contacted is half the job. The
                                                     point of calling them in is to give them a time,
                                                     and the list could only ever do the first half. -->
                                                <FormButton buttonStyle="action" buttonSize="xs"
                                                    @click="bookTime(recall)">
                                                    <Icon name="ph:calendar-plus" class="size-4" />
                                                    {{ $t('citizens.toothChart.strip.bookTime') }}
                                                </FormButton>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { dentalRecallService } from '@/components/api/user/DentalRecallService'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const { industryHasFeature } = useIndustryFeatures()
const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()

const breadcrumbLinks = [{ name: 'dentalRecalls.title', translate: true, href: '/dental-recalls' }]

const state = reactive({
    recalls: [] as any[],
    overdueCount: 0,
    withinDays: 30,
    isPageLoading: true,
    error: '',
})

// The recall list belongs to dental clinics, the same rule the API enforces.
watch(() => userStore.getUser, (user: any) => {
    if (user?.uuid && !industryHasFeature('recalls')) {
        navigateTo('/overview')
    }
}, { immediate: true })

const windowOptions = computed(() => [
    { value: 0, label: t('dentalRecalls.window.overdue') },
    { value: 30, label: t('dentalRecalls.window.month') },
    { value: 90, label: t('dentalRecalls.window.quarter') },
])

function channelIcon(channel: string | null): string {
    return {
        letter: 'ph:envelope-simple',
        sms: 'ph:chat-text',
        email: 'ph:at',
        app: 'ph:bell',
        phone: 'ph:phone',
    }[channel as string] || 'ph:question'
}

function formatDate(date: string): string {
    return date ? moment(date).format('DD.MM.YYYY') : ''
}

async function load() {
    state.error = ''

    try {
        const response = await dentalRecallService.getRecalls({ within_days: state.withinDays })
        state.recalls = response?.data?.recalls || []
        state.overdueCount = response?.data?.overdue_count || 0
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isPageLoading = false
    }
}

function setWindow(days: number) {
    state.withinDays = days
    load()
}

function bookTime(recall: any) {
    navigateTo({
        path: `/citizens/${recall.citizen_uuid}/calendar`,
        query: { date: recall.due_date },
    })
}

async function markContacted(recall: any) {
    state.error = ''

    try {
        await dentalRecallService.markContacted(recall.citizen_uuid)
        successAlert(`${t('alert.success')}!`, `${t('dentalRecalls.contacted')}.`)
        await load()
    } catch (error: any) {
        state.error = error?.message || ''
    }
}

onMounted(() => load())
</script>
