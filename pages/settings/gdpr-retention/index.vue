<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('gdpr.retention.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('gdpr.retention.title') }}</template>
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <div>

                <div class="mt-6 space-y-6">
                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <!-- Retention settings card (citizen retention is for employment services only) -->
                    <LoadingSpinner v-if="isEmploymentServices" :isActive="state.isPageLoading">
                        <div class="bg-white border border-[#EAECF0] rounded-xl p-6 shadow-sm max-w-2xl">
                            <div class="mb-5">
                                <h2 class="text-[16px] font-semibold text-[#1F2533]">
                                    {{ $t('gdpr.retention.retentionPeriod') }}
                                </h2>
                                <p class="text-sm text-[#5C6478] mt-1">
                                    {{ $t('gdpr.retention.retentionPeriodHint') }}
                                </p>
                            </div>

                            <div class="space-y-4">
                                <!-- Period selector -->
                                <div class="space-y-1">
                                    <FormLabel :label="$t('gdpr.retention.retentionMonths')" />
                                    <div class="flex gap-3">
                                        <button v-for="option in retentionOptions" :key="option.value"
                                            class="flex-1 py-3 rounded-xl border-2 text-[13px] font-semibold transition-colors"
                                            :style="state.form.retention_months === option.value
                                                ? 'border-color:#205E77;background:#E4F1F6;color:#205E77'
                                                : 'border-color:#EAECF0;background:white;color:#5C6478'"
                                            @click="state.form.retention_months = option.value">
                                            {{ option.label }}
                                        </button>
                                    </div>
                                </div>

                                <!-- Auto-delete toggle -->
                                <div class="flex items-center justify-between py-4 border-t border-[#EAECF0]">
                                    <div>
                                        <p class="text-[14px] font-medium text-[#1F2533]">
                                            {{ $t('gdpr.retention.autoDelete') }}
                                        </p>
                                        <p class="text-[12px] text-[#8891A4] mt-0.5">
                                            {{ $t('gdpr.retention.autoDeleteHint') }}
                                        </p>
                                    </div>
                                    <FormSwitch :value="state.form.auto_delete_enabled"
                                        @toggleSwitch="state.form.auto_delete_enabled = !state.form.auto_delete_enabled" />
                                </div>

                                <!-- Notify before deletion -->
                                <div v-if="state.form.auto_delete_enabled"
                                    class="flex items-center justify-between py-4 border-t border-[#EAECF0]">
                                    <div>
                                        <p class="text-[14px] font-medium text-[#1F2533]">
                                            {{ $t('gdpr.retention.notifyBeforeDeletion') }}
                                        </p>
                                        <p class="text-[12px] text-[#8891A4] mt-0.5">
                                            {{ $t('gdpr.retention.notifyBeforeDeletionHint') }}
                                        </p>
                                    </div>
                                    <FormSwitch :value="state.form.notify_before_deletion"
                                        @toggleSwitch="state.form.notify_before_deletion = !state.form.notify_before_deletion" />
                                </div>
                            </div>

                            <div class="flex justify-end mt-6 pt-4 border-t border-[#EAECF0]">
                                <FormButton buttonStyle="primary" @click="saveSettings" :disabled="state.isSaving">
                                    <Icon v-if="state.isSaving" name="ph:spinner" class="w-4 h-4 animate-spin" />
                                    {{ state.isSaving ? $t('saving') : $t('save') }}
                                </FormButton>
                            </div>
                        </div>
                    </LoadingSpinner>

                    <!-- Statuses and journal notes: a rolling rule, switched on by an administrator, any sector -->
                    <LoadingSpinner :isActive="state.isRuleLoading">
                        <div class="bg-white border border-[#EAECF0] rounded-xl p-6 shadow-sm max-w-2xl"
                            data-testid="status-journal-retention">
                            <div class="mb-5">
                                <h2 class="text-[16px] font-semibold text-[#1F2533]">
                                    {{ $t('gdpr.statusJournal.title') }}
                                </h2>
                                <p class="text-sm text-[#5C6478] mt-1">{{ $t('gdpr.statusJournal.hint') }}</p>
                            </div>

                            <div class="flex items-center justify-between py-4 border-t border-[#EAECF0]">
                                <div class="pr-4">
                                    <p class="text-[14px] font-medium text-[#1F2533]">{{ $t('gdpr.statusJournal.statusSwitch') }}</p>
                                    <p class="text-[12px] text-[#8891A4] mt-0.5">{{ $t('gdpr.statusJournal.statusSwitchHint') }}</p>
                                    <p v-if="state.preview" class="text-[12px] text-[#5C6478] mt-1" data-testid="status-preview">
                                        {{ state.saved.status_retention_enabled && state.firstRunAt
                                            ? $t('gdpr.statusJournal.previewOn', { statuses: state.preview.statuses, date: formatDateToReadable(state.firstRunAt) })
                                            : $t('gdpr.statusJournal.previewOff', { statuses: state.preview.statuses }) }}
                                    </p>
                                </div>
                                <FormSwitch :value="state.rule.status_retention_enabled"
                                    :label="$t('gdpr.statusJournal.statusSwitch')" @toggleSwitch="toggleStatusRule" />
                            </div>

                            <div class="flex items-center justify-between py-4 border-t border-[#EAECF0]"
                                :class="state.rule.status_retention_enabled ? '' : 'opacity-50'">
                                <div class="pr-4">
                                    <p class="text-[14px] font-medium text-[#1F2533]">{{ $t('gdpr.statusJournal.journalSwitch') }}</p>
                                    <p class="text-[12px] text-[#8891A4] mt-0.5">{{ $t('gdpr.statusJournal.journalSwitchHint') }}</p>
                                    <p v-if="state.preview && state.rule.journal_retention_enabled" class="text-[12px] text-[#5C6478] mt-1"
                                        data-testid="journal-preview">
                                        {{ $t('gdpr.statusJournal.previewJournals', { journals: state.preview.journals }) }}
                                    </p>
                                </div>
                                <FormSwitch :value="state.rule.journal_retention_enabled"
                                    :disabled="!state.rule.status_retention_enabled"
                                    :label="$t('gdpr.statusJournal.journalSwitch')" @toggleSwitch="toggleJournalRule" />
                            </div>

                            <p class="text-[12px] text-[#8891A4] border-t border-[#EAECF0] pt-4">
                                {{ $t('gdpr.statusJournal.lessHistory') }}
                            </p>
                            <p v-if="state.saved.status_retention_enabled && state.firstRunAt"
                                class="text-[13px] font-medium text-[#1F2533] mt-3" data-testid="next-run">
                                {{ $t('gdpr.statusJournal.nextRun', { date: formatDateToReadable(state.firstRunAt) }) }}
                            </p>

                            <div class="flex items-center justify-end gap-x-2 mt-6 pt-4 border-t border-[#EAECF0]">
                                <!-- Elsewhere the log is reached from the scheduled deletions, which only employment services have. -->
                                <FormButton v-if="!isEmploymentServices" buttonStyle="action"
                                    @click="navigateTo('/settings/gdpr-retention/deletion-log')">
                                    <Icon name="ph:clock-clockwise" class="w-4 h-4" />
                                    {{ $t('gdpr.retention.viewDeletionLog') }}
                                </FormButton>
                                <FormButton buttonStyle="primary" @click="saveRule" :disabled="state.isSaving || !ruleChanged">
                                    {{ state.isSaving ? $t('saving') : $t('save') }}
                                </FormButton>
                            </div>
                        </div>
                    </LoadingSpinner>

                    <!-- Scheduled deletions -->
                    <div v-if="isEmploymentServices">
                        <div class="flex items-center justify-between mb-3">
                            <h2 class="text-[16px] font-semibold text-[#1F2533]">
                                {{ $t('gdpr.retention.scheduledDeletions') }}
                            </h2>
                            <FormButton buttonStyle="action"
                                @click="navigateTo('/settings/gdpr-retention/deletion-log')">
                                <Icon name="ph:clock-clockwise" class="w-4 h-4" />
                                {{ $t('gdpr.retention.viewDeletionLog') }}
                            </FormButton>
                        </div>

                        <LoadingSpinner :isActive="state.isTableLoading">
                            <div v-if="!state.scheduledDeletions.length"
                                class="bg-white border border-[#EAECF0] rounded-xl p-10 text-center shadow-sm">
                                <Icon name="ph:shield-check" class="w-10 h-10 text-[#2E9E33] opacity-50 mx-auto mb-3" />
                                <p class="text-[#8891A4] text-sm">{{ $t('gdpr.retention.noScheduledDeletions') }}</p>
                            </div>

                            <div v-else class="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden">
                                <table class="w-full">
                                    <thead>
                                        <tr class="bg-[#F9FAFB] border-b border-[#EAECF0]">
                                            <th class="co-th">{{ $t('gdpr.retention.citizen') }}</th>
                                            <th class="co-th">{{ $t('gdpr.retention.caseCompletedOn') }}</th>
                                            <th class="co-th">{{ $t('gdpr.retention.scheduledFor') }}</th>
                                            <th class="co-th">{{ $t('gdpr.retention.daysRemaining') }}</th>
                                            <th class="co-th"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="item in state.scheduledDeletions" :key="item.citizen_uuid"
                                            class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors">
                                            <td class="co-td text-[13px] font-medium text-[#1F2533]">
                                                {{ item.citizen_name }}
                                            </td>
                                            <td class="co-td text-[13px] text-[#5C6478]">
                                                {{ formatDateToReadable(item.case_completed_at) }}
                                            </td>
                                            <td class="co-td text-[13px] text-[#5C6478]">
                                                {{ formatDateToReadable(item.scheduled_deletion_at) }}
                                            </td>
                                            <td class="co-td">
                                                <span class="co-badge text-[11px]"
                                                    :class="item.days_remaining <= 7 ? 'co-badge-red' : item.days_remaining <= 30 ? 'co-badge-gray' : 'co-badge-green'">
                                                    {{ item.days_remaining }} {{ $t('gdpr.retention.days') }}
                                                </span>
                                            </td>
                                            <td class="co-td" @click.stop>
                                                <div class="flex items-center gap-1.5 justify-end">
                                                    <SuperadminTableButton @click="confirmCancel(item)">
                                                        <Icon name="ph:x" class="w-3.5 h-3.5" />
                                                        {{ $t('gdpr.retention.cancelDeletion') }}
                                                    </SuperadminTableButton>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </LoadingSpinner>
                    </div>
                </div>
            </div>

            <DialogConfirmation :isModalOpen="state.modal.isEnableRuleOpen"
                :message="$t('gdpr.statusJournal.confirmEnable', { date: formatDateToReadable(ruleStartDate) })"
                @close="state.modal.isEnableRuleOpen = false" @confirm="confirmEnableRule" />
            <DialogConfirmation :isModalOpen="state.modal.isCancelOpen"
                :message="$t('gdpr.retention.cancelDeletionConfirmation') + '?'"
                @close="state.modal.isCancelOpen = false" @confirm="cancelDeletion" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { gdprService } from '@/components/api/user/GdprService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any

// Citizen retention and scheduled deletions are for employment services; the status/journal rule is for every company.
const isEmploymentServices = computed(() => userStore.getUser?.company?.industry?.system_name === 'employment_services')

function fetchEmploymentRetention() {
    fetchRetentionSettings()
    fetchScheduledDeletions()
}

onMounted(() => {
    fetchStatusJournalRule()
    if (isEmploymentServices.value) fetchEmploymentRetention()
})

// The user can finish loading after the page mounts.
watch(isEmploymentServices, (isEmployment: boolean, wasEmployment: boolean) => {
    if (isEmployment && !wasEmployment) fetchEmploymentRetention()
})

const breadcrumbLinks = [
    { name: 'gdpr.retention.title', translate: true, href: '/settings/gdpr-retention' },
]

const retentionOptions = computed(() => [
    { value: 3, label: t('gdpr.retention.months', { n: 3 }) },
    { value: 6, label: t('gdpr.retention.months', { n: 6 }) },
    { value: 9, label: t('gdpr.retention.months', { n: 9 }) },
])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    isRuleLoading: false,
    isSaving: false,
    isTableLoading: false,
    form: {
        retention_months: 6,
        auto_delete_enabled: false,
        notify_before_deletion: true,
    },
    // The status/journal rule: what is on screen, and what the server has.
    rule: { status_retention_enabled: false, journal_retention_enabled: false },
    saved: { status_retention_enabled: false, journal_retention_enabled: false },
    firstRunAt: null as string | null,
    preview: null as { statuses: number, journals: number } | null,
    modal: { isCancelOpen: false, isEnableRuleOpen: false },
    scheduledDeletions: [] as any[],
    selectedItem: null as any,
})

async function fetchRetentionSettings() {
    state.isPageLoading = true
    state.error = {} as Error
    try {
        const response = await gdprService.getRetentionSettings()
        if (response?.data) {
            state.form.retention_months = response.data.retention_months ?? 6
            state.form.auto_delete_enabled = response.data.auto_delete_enabled ?? false
            state.form.notify_before_deletion = response.data.notify_before_deletion ?? true
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchStatusJournalRule() {
    state.isRuleLoading = true
    try {
        const response = await gdprService.getStatusJournalRule()
        if (response?.data) applyRule(response.data)
    } catch (error: any) {
        state.error = error
    }
    state.isRuleLoading = false
}

async function fetchScheduledDeletions() {
    state.isTableLoading = true
    try {
        const response = await gdprService.getScheduledDeletions()
        state.scheduledDeletions = response?.data ?? response ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function applyRule(data: any) {
    state.saved.status_retention_enabled = !!data.status_retention_enabled
    state.saved.journal_retention_enabled = !!data.journal_retention_enabled
    state.rule.status_retention_enabled = state.saved.status_retention_enabled
    state.rule.journal_retention_enabled = state.saved.journal_retention_enabled
    state.firstRunAt = data.first_run_at ?? null
    state.preview = data.preview ?? null
}

const ruleChanged = computed(() =>
    state.rule.status_retention_enabled !== state.saved.status_retention_enabled
    || state.rule.journal_retention_enabled !== state.saved.journal_retention_enabled)

// Switching either one on starts a new seven-day notice period, so it asks first.
const turnsRuleOn = computed(() =>
    (state.rule.status_retention_enabled && !state.saved.status_retention_enabled)
    || (state.rule.journal_retention_enabled && !state.saved.journal_retention_enabled))

const ruleStartDate = computed(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))

function toggleStatusRule() {
    state.rule.status_retention_enabled = !state.rule.status_retention_enabled
    // The journal switch depends on this one.
    if (!state.rule.status_retention_enabled) state.rule.journal_retention_enabled = false
}

function toggleJournalRule() {
    if (!state.rule.status_retention_enabled) return
    state.rule.journal_retention_enabled = !state.rule.journal_retention_enabled
}

function saveRule() {
    if (turnsRuleOn.value) {
        state.modal.isEnableRuleOpen = true
        return
    }
    persistRule()
}

function confirmEnableRule() {
    state.modal.isEnableRuleOpen = false
    persistRule()
}

async function persistRule() {
    state.isSaving = true
    state.error = {} as Error
    try {
        // Its own endpoint: open to every sector, and it leaves unsaved citizen retention edits alone.
        const response = await gdprService.saveStatusJournalRule({
            status_retention_enabled: state.rule.status_retention_enabled,
            journal_retention_enabled: state.rule.journal_retention_enabled,
        })
        if (response?.data) applyRule(response.data)
        successAlert(`${t('alert.success')}!`, `${t('gdpr.retention.settingsSaved')}.`)
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

async function saveSettings() {
    state.isSaving = true
    state.error = {} as Error
    try {
        await gdprService.saveRetentionSettings(state.form)
        successAlert(`${t('alert.success')}!`, `${t('gdpr.retention.settingsSaved')}.`)
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

function confirmCancel(item: any) {
    state.selectedItem = item
    state.modal.isCancelOpen = true
}

async function cancelDeletion() {
    state.modal.isCancelOpen = false
    if (!state.selectedItem) return
    state.error = {} as Error
    try {
        await gdprService.cancelScheduledDeletion(state.selectedItem.citizen_uuid)
        successAlert(`${t('alert.success')}!`, `${t('gdpr.retention.deletionCancelled')}.`)
        await fetchScheduledDeletions()
    } catch (error: any) {
        state.error = error
    }
    state.selectedItem = null
}
</script>
