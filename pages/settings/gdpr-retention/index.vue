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
                <ModulesUserSettingsTab />

                <div class="mt-6 space-y-6">
                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <!-- Retention settings card -->
                    <LoadingSpinner :isActive="state.isPageLoading">
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

                    <!-- Scheduled deletions -->
                    <div>
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

onMounted(() => {
    if (userStore.getUser?.company?.industry?.system_name !== 'employment_services') {
        navigateTo('/overview')
    }
    fetchRetentionSettings()
    fetchScheduledDeletions()
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
    isSaving: false,
    isTableLoading: false,
    form: {
        retention_months: 6,
        auto_delete_enabled: false,
        notify_before_deletion: true,
    },
    modal: { isCancelOpen: false },
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
