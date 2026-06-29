<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('gdpr.deletionLog.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('gdpr.deletionLog.title') }}</template>
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <div>
                <ModulesUserSettingsTab />

                <div class="mt-6">
                    <NuxtLink to="/settings/gdpr-retention"
                        class="inline-flex items-center gap-1.5 text-sm text-[#5C6478] hover:text-[#1F2533] mb-5 transition-colors">
                        <Icon name="ph:arrow-left" class="w-4 h-4" />
                        {{ $t('back') }}
                    </NuxtLink>

                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <!-- Filters -->
                    <div class="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm mb-5">
                        <div class="flex flex-wrap items-end gap-4">
                            <div class="space-y-1">
                                <FormLabel :label="$t('gdpr.deletionLog.fromDate')" />
                                <FormDateField id="from_date" name="from_date"
                                    :placeholder="$t('gdpr.deletionLog.fromDate')" v-model="state.filter.from_date" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel :label="$t('gdpr.deletionLog.toDate')" />
                                <FormDateField id="to_date" name="to_date" :placeholder="$t('gdpr.deletionLog.toDate')"
                                    v-model="state.filter.to_date" />
                            </div>
                            <div class="space-y-1 min-w-[180px]">
                                <FormLabel :label="$t('gdpr.deletionLog.trigger')" />
                                <FormSelect id="trigger" :options="triggerOptions" :canClear="false"
                                    v-model="state.filter.trigger" />
                            </div>
                            <FormButton buttonStyle="primary" @click="fetchLog" :disabled="state.isLoading">
                                <Icon name="ph:funnel" class="w-4 h-4" />
                                {{ $t('filter') }}
                            </FormButton>
                        </div>
                    </div>

                    <LoadingSpinner :isActive="state.isLoading">
                        <div v-if="!state.rows.length"
                            class="bg-white border border-[#EAECF0] rounded-xl p-12 text-center shadow-sm">
                            <Icon name="ph:clock-clockwise" class="w-12 h-12 text-[#8891A4] opacity-30 mx-auto mb-3" />
                            <p class="text-[#8891A4] text-sm">{{ $t('gdpr.deletionLog.noEntries') }}</p>
                        </div>

                        <div v-else class="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden">
                            <table class="w-full">
                                <thead>
                                    <tr class="bg-[#F9FAFB] border-b border-[#EAECF0]">
                                        <th class="co-th">{{ $t('gdpr.deletionLog.citizen') }}</th>
                                        <th class="co-th">{{ $t('gdpr.deletionLog.deletedAt') }}</th>
                                        <th class="co-th">{{ $t('gdpr.deletionLog.retentionMonths') }}</th>
                                        <th class="co-th">{{ $t('gdpr.deletionLog.trigger') }}</th>
                                        <th class="co-th">{{ $t('gdpr.deletionLog.deletedBy') }}</th>
                                        <th class="co-th"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="row in state.rows" :key="row.uuid"
                                        class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors">
                                        <td class="co-td text-[13px] font-medium text-[#1F2533]">
                                            {{ row.citizen_name }}
                                        </td>
                                        <td class="co-td text-[13px] text-[#5C6478]">
                                            {{ formatDateTimeToReadable(row.deleted_at) }}
                                        </td>
                                        <td class="co-td text-[13px] text-[#5C6478]">
                                            {{ row.retention_months }} {{ $t('gdpr.retention.monthsShort') }}
                                        </td>
                                        <td class="co-td">
                                            <span class="co-badge text-[11px]"
                                                :class="row.trigger === 'system' ? 'co-badge-navy' : 'co-badge-gray'">
                                                <Icon :name="row.trigger === 'system' ? 'ph:robot' : 'ph:user'"
                                                    class="w-3 h-3" />
                                                {{ row.trigger === 'system' ? $t('gdpr.deletionLog.triggerSystem') :
                                                $t('gdpr.deletionLog.triggerUser') }}
                                            </span>
                                        </td>
                                        <td class="co-td text-[13px] text-[#5C6478]">
                                            {{ row.deleted_by_name ?? '—' }}
                                        </td>
                                        <td class="co-td" @click.stop>
                                            <div
                                                class="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <SuperadminTableButton v-if="row.is_recoverable" buttonStyle="success"
                                                    @click="confirmRestore(row)">
                                                    <Icon name="ph:arrow-counter-clockwise" class="w-3.5 h-3.5" />
                                                    {{ $t('gdpr.deletionLog.restore') }}
                                                </SuperadminTableButton>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <Pagination :data="state.pagination" @previous="previous" @next="next" />
                        </div>
                    </LoadingSpinner>
                </div>
            </div>

            <DialogConfirmation :isModalOpen="state.modal.isRestoreOpen"
                :message="$t('gdpr.deletionLog.restoreConfirmation') + '?'" @close="state.modal.isRestoreOpen = false"
                @confirm="restoreCitizen" />
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
const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any

onMounted(() => {
    if (userStore.getUser?.company?.industry?.system_name !== 'employment_services') {
        navigateTo('/overview')
    }
    fetchLog()
})

const breadcrumbLinks = [
    { name: 'gdpr.retention.title', translate: true, href: '/settings/gdpr-retention' },
    { name: 'gdpr.deletionLog.title', translate: true, href: '/settings/gdpr-retention/deletion-log' },
]

const triggerOptions = computed(() => [
    { value: '', label: t('gdpr.deletionLog.allTriggers') },
    { value: 'system', label: t('gdpr.deletionLog.triggerSystem') },
    { value: 'user', label: t('gdpr.deletionLog.triggerUser') },
])

let currentPage = 1

const state = reactive({
    error: {} as Error,
    filter: {
        from_date: '',
        to_date: '',
        trigger: '',
    },
    isLoading: false,
    modal: { isRestoreOpen: false },
    pagination: {} as any,
    rows: [] as any[],
    selectedItem: null as any,
})

async function fetchLog() {
    state.isLoading = true
    state.error = {} as Error
    try {
        const params: any = { page: currentPage }
        if (state.filter.from_date) params.from_date = state.filter.from_date
        if (state.filter.to_date) params.to_date = state.filter.to_date
        if (state.filter.trigger) params.trigger = state.filter.trigger
        const response = await gdprService.getDeletionLog(params)
        state.rows = response?.data ?? response ?? []
        state.pagination = response
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function previous() { currentPage--; fetchLog() }
function next() { currentPage++; fetchLog() }

function confirmRestore(item: any) {
    state.selectedItem = item
    state.modal.isRestoreOpen = true
}

async function restoreCitizen() {
    state.modal.isRestoreOpen = false
    if (!state.selectedItem) return
    state.error = {} as Error
    try {
        await gdprService.restoreCitizen(state.selectedItem.citizen_uuid)
        successAlert(`${t('alert.success')}!`, `${t('gdpr.deletionLog.citizenRestored')}.`)
        await fetchLog()
    } catch (error: any) {
        state.error = error
    }
    state.selectedItem = null
}
</script>
