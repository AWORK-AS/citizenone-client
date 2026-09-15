<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('settings.fst.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('settings.fst.title') }}</template>

            <LoadingSpinner :isActive="state.isLoading">
                <div class="mt-8 max-w-3xl space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <p v-if="state.status.connection_status !== 'active' && !notInstalledCoversError"
                        class="text-sm text-slate-500">
                        {{ $t('settings.fst.subtitle') }}
                    </p>

                    <Alert v-if="!isAdmin" type="info" :text="$t('settings.fst.adminOnly')" />

                    <!-- Shown regardless of installed/co_activated_at — a failed automatic
                         activation attempt (CompanyService::tryActivateFstConnection) uninstalls
                         the app again, so this can't be nested under the "installed" branch below
                         without becoming unreachable. Suppressed whenever the "not installed" card's
                         own message already covers the same error (see notInstalledCoversError). -->
                    <Alert v-if="isAdmin && state.status.last_activation_error_code && !notInstalledCoversError"
                        type="danger" :text="$t(`settings.fst.activationError.${state.status.last_activation_error_code}`)" />

                    <!-- Not installed: point to the Apps marketplace (plan §9/§14 — -->
                    <!-- installation happens there, this page is the manage screen). -->
                    <div v-if="!state.status.installed"
                        class="rounded-xl border border-dashed border-surface-200 bg-surface-50 p-8 text-center">
                        <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f0faf9] text-[#2dbab2]">
                            <Icon name="ph:plugs-connected" class="size-6" />
                        </div>
                        <p class="mt-3 text-sm text-slate-500">{{ notInstalledCard.message }}</p>
                        <div class="mt-4 flex justify-center">
                            <FormButton buttonStyle="primary" @click="goToNotInstalledCardTarget">
                                <Icon name="ph:storefront" class="h-4 w-4" />
                                {{ notInstalledCard.buttonLabel }}
                            </FormButton>
                        </div>
                    </div>

                    <template v-else>
                        <!-- Installed but never configured (co_activated_at is null). The
                             CVR itself is never entered here — it's always the company's
                             own registered CVR (Company settings), verified against FST
                             server-side, so there's nothing for the admin to type. -->
                        <div v-if="!state.status.co_activated_at && isAdmin"
                            class="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
                            <h3 class="text-sm font-semibold text-slate-900 mb-3">{{ $t('settings.fst.configureTitle') }}</h3>
                            <p class="text-sm text-slate-500 mb-3">{{ $t('settings.fst.configureDescription') }}</p>
                            <FormButton buttonStyle="primary" @click="activate">
                                <Icon name="ph:link" class="h-4 w-4" />
                                {{ $t('settings.fst.activate') }}
                            </FormButton>
                        </div>

                        <!-- Status + actions once at least CO-side configuration exists -->
                        <div v-if="state.status.co_activated_at" class="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
                            <div class="flex items-center justify-between flex-wrap gap-3">
                                <div>
                                    <p class="text-xs uppercase tracking-wide text-slate-400">{{ $t('settings.fst.status') }}</p>
                                    <div class="mt-1 flex items-center gap-2">
                                        <span class="size-2.5 rounded-full" :class="statusDotClass"></span>
                                        <span class="font-semibold text-slate-900">{{ statusLabel }}</span>
                                    </div>
                                    <p class="mt-1 text-xs text-slate-400">
                                        {{ state.status.sync_eligible ? $t('settings.fst.syncEligible') : $t('settings.fst.syncNotEligible') }}
                                        <span v-if="!state.status.sync_eligible && state.status.unmet_conditions?.length">
                                            — {{ $t('settings.fst.unmetConditions') }}: {{ state.status.unmet_conditions.join(', ') }}
                                        </span>
                                    </p>
                                    <p v-if="state.status.fst_company_id" class="mt-1 text-xs text-slate-400">
                                        {{ $t('settings.fst.fstCompanyId') }}: {{ state.status.fst_company_id }}
                                    </p>
                                    <p v-if="state.status.sync_eligible" class="mt-1 text-xs text-slate-400">
                                        {{ $t('settings.fst.syncCadence') }}
                                    </p>
                                </div>
                                <div class="flex items-center gap-2 flex-wrap" v-if="isAdmin">
                                    <!-- Temporarily hidden pending further review — Disconnect and Sync
                                         now stay as the actions available while this integration is new. -->
                                    <FormButton v-if="state.status.connection_status === 'active'" buttonStyle="primary"
                                        :disabled="!state.status.sync_eligible" @click="triggerSync">
                                        <Icon name="ph:arrows-clockwise" class="h-4 w-4" />
                                        {{ $t('settings.fst.syncNow') }}
                                    </FormButton>
                                    <template v-if="false">
                                    <FormButton buttonStyle="action" @click="refreshStatus">
                                        <Icon name="ph:arrows-clockwise" class="h-4 w-4" />
                                        {{ $t('settings.fst.refreshStatus') }}
                                    </FormButton>
                                    <FormButton v-if="state.status.connection_status === 'active'" buttonStyle="action"
                                        @click="state.modal.confirmDeactivate = true">
                                        <Icon name="ph:pause" class="h-4 w-4" />
                                        {{ $t('settings.fst.deactivate') }}
                                    </FormButton>
                                    <!-- Suspended resumes in place (no re-verification) — rejected/disconnected
                                         need a fresh CVR submission through activate() instead (plan §9 step 7). -->
                                    <FormButton v-if="state.status.connection_status === 'suspended'"
                                        buttonStyle="primary" @click="reactivate">
                                        <Icon name="ph:arrow-clockwise" class="h-4 w-4" />
                                        {{ $t('settings.fst.reconnect') }}
                                    </FormButton>
                                    <FormButton v-if="state.status.connection_status === 'rejected'"
                                        buttonStyle="primary" @click="activate">
                                        <Icon name="ph:arrow-clockwise" class="h-4 w-4" />
                                        {{ $t('settings.fst.reconnect') }}
                                    </FormButton>
                                    </template>
                                    <FormButton v-if="state.status.connection_status && state.status.connection_status !== 'disconnected'"
                                        buttonStyle="danger" @click="state.modal.confirmDisconnect = true">
                                        <Icon name="ph:plug" class="h-4 w-4" />
                                        {{ $t('settings.fst.disconnect') }}
                                    </FormButton>
                                    <FormButton v-if="false && state.status.connection_status === 'active'" buttonStyle="action" @click="rotateSecret">
                                        <Icon name="ph:key" class="h-4 w-4" />
                                        {{ $t('settings.fst.rotateSecret') }}
                                    </FormButton>
                                </div>
                            </div>
                        </div>

                        <!-- Pending: the approval itself happens outside CitizenOne, on FST's own
                             site, so tell the admin exactly where to go and what to click. -->
                        <div v-if="state.status.connection_status === 'pending'"
                            class="rounded-xl border border-[#bfe4df] bg-[#e2f4f2] p-5">
                            <div class="flex items-start gap-3">
                                <Icon name="ph:info" class="h-5 w-5 shrink-0 mt-0.5 text-[#0d5850]" />
                                <div>
                                    <h3 class="text-sm font-semibold text-[#0d5850]">{{ $t('settings.fst.pendingGuideTitle') }}</h3>
                                    <ol class="mt-2 space-y-1.5 text-sm text-slate-700 list-decimal list-inside">
                                        <li>{{ $t('settings.fst.pendingGuideStep1') }}</li>
                                        <li>{{ $t('settings.fst.pendingGuideStep2') }}</li>
                                        <li>{{ $t('settings.fst.pendingGuideStep3') }}</li>
                                        <li>{{ $t('settings.fst.pendingGuideStep4') }}</li>
                                    </ol>
                                    <p class="mt-3 text-xs text-[#0d5850]">{{ $t('settings.fst.pendingGuideNote') }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Cached data once synchronising -->
                        <div v-if="state.status.sync_eligible" class="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
                            <h3 class="text-sm font-semibold text-slate-900 mb-3">{{ $t('settings.fst.inquiries') }}</h3>
                            <p v-if="!state.inquiries.length" class="text-sm text-slate-400">{{ $t('settings.fst.noInquiriesYet') }}</p>
                            <ul v-else class="divide-y divide-surface-100">
                                <li v-for="inquiry in state.inquiries" :key="inquiry.uuid" class="py-2 text-sm flex justify-between">
                                    <span>{{ inquiry.inquirer_name || inquiry.fst_case_id }}</span>
                                    <span class="text-slate-400">{{ inquiry.status }}</span>
                                </li>
                            </ul>
                            <div v-if="state.inquiriesMeta && state.inquiriesMeta.current_page < state.inquiriesMeta.last_page"
                                class="mt-3 text-center">
                                <FormButton buttonStyle="action" :disabled="state.isLoadingMoreInquiries" @click="loadMoreInquiries">
                                    {{ $t('settings.fst.loadMore') }}
                                </FormButton>
                            </div>
                        </div>

                        <div v-if="state.status.sync_eligible" class="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
                            <h3 class="text-sm font-semibold text-slate-900 mb-3">{{ $t('settings.fst.syncHistory') }}</h3>
                            <p v-if="!state.syncHistory.length" class="text-sm text-slate-400">{{ $t('settings.fst.noSyncHistoryYet') }}</p>
                            <ul v-else class="divide-y divide-surface-100 text-sm">
                                <li v-for="run in state.syncHistory" :key="run.uuid" class="py-2.5 flex items-center justify-between gap-3">
                                    <div>
                                        <p class="text-slate-900">{{ syncRunLabel(run) }}</p>
                                        <p class="text-xs text-slate-400">{{ formatSyncRunDate(run.started_at) }}</p>
                                    </div>
                                    <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                                        :class="syncRunStatusClass(run.status)">
                                        <span class="size-1.5 rounded-full" :class="syncRunDotClass(run.status)"></span>
                                        {{ syncRunStatusLabel(run.status) }}
                                    </span>
                                </li>
                            </ul>
                            <div v-if="state.syncHistoryMeta && state.syncHistoryMeta.current_page < state.syncHistoryMeta.last_page"
                                class="mt-3 text-center">
                                <FormButton buttonStyle="action" :disabled="state.isLoadingMoreSyncHistory" @click="loadMoreSyncHistory">
                                    {{ $t('settings.fst.loadMore') }}
                                </FormButton>
                            </div>
                        </div>
                    </template>
                </div>
            </LoadingSpinner>

            <DialogConfirmation :isModalOpen="state.modal.confirmDisconnect"
                :message="$t('settings.fst.confirmDisconnect')"
                @close="state.modal.confirmDisconnect = false" @confirm="disconnect" />

            <DialogConfirmation :isModalOpen="state.modal.confirmDeactivate"
                :message="$t('settings.fst.confirmDeactivate')"
                @close="state.modal.confirmDeactivate = false" @confirm="deactivate" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { fstService } from '@/components/api/user/FstService'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error, FstConnectionStatusResponse, FstInquiry, FstSyncRun, FstPageMeta } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()

const isAdmin = computed(() => userStore.getUser?.roles?.some((r: any) => r.name === 'Admin'))

const breadcrumbLinks = [
    { name: 'settings.fst.title', translate: true, href: '/settings/fst' },
]

const defaultStatus: FstConnectionStatusResponse = {
    installed: false,
    co_activated_at: null,
    fst_activated_at: null,
    org_verified_at: null,
    connection_status: null,
    sync_eligible: false,
    unmet_conditions: [],
    fst_company_id: null,
    last_activation_error_code: null,
}

const state = reactive({
    error: {} as Error,
    isLoading: false,
    status: { ...defaultStatus } as FstConnectionStatusResponse,
    inquiries: [] as FstInquiry[],
    inquiriesMeta: null as FstPageMeta | null,
    isLoadingMoreInquiries: false,
    syncHistory: [] as FstSyncRun[],
    syncHistoryMeta: null as FstPageMeta | null,
    isLoadingMoreSyncHistory: false,
    modal: { confirmDisconnect: false, confirmDeactivate: false },
})

const statusLabel = computed(() => {
    switch (state.status.connection_status) {
        case 'pending': return t('settings.fst.statusPending')
        case 'rejected': return t('settings.fst.statusRejected')
        case 'active': return t('settings.fst.statusActive')
        case 'suspended': return t('settings.fst.statusSuspended')
        case 'disconnected': return t('settings.fst.statusDisconnected')
        default: return t('settings.fst.statusInstalledNotConfigured')
    }
})

const statusDotClass = computed(() => (state.status.connection_status === 'active' ? 'bg-[#1f9d6b]' : 'bg-slate-300'))

// The "not installed" card's copy and CTA depend on why a prior automatic
// activation attempt failed (CompanyService::tryActivateFstConnection uninstalls
// the app again on any failure, so this card is what an admin actually sees).
const notInstalledCard = computed(() => {
    switch (state.status.last_activation_error_code) {
        case 'fst_cvr_no_qualified_subscription':
            return { message: t('settings.fst.needsSubscription'), buttonLabel: t('settings.fst.goToApps'), to: '/apps?category=fst', external: false }
        case 'fst_company_cvr_missing':
            return { message: t('settings.fst.needsCvr'), buttonLabel: t('settings.fst.goToCompanySettings'), to: '/settings/company', external: false }
        case 'fst_cvr_not_found':
            return { message: t('settings.fst.needsProfile'), buttonLabel: t('settings.fst.goToPartner'), to: 'https://findsocialetilbud.dk', external: true }
        default:
            return { message: t('settings.fst.notInstalled'), buttonLabel: t('settings.fst.goToApps'), to: '/apps?category=integrations', external: false }
    }
})

// Whether the "not installed" card's own message already explains the stored
// error — used to suppress the redundant standalone danger Alert + subtitle.
const notInstalledCoversError = computed(() => (
    ['fst_cvr_no_qualified_subscription', 'fst_company_cvr_missing', 'fst_cvr_not_found'].includes(state.status.last_activation_error_code ?? '')
))

async function goToNotInstalledCardTarget() {
    if (notInstalledCard.value.external) {
        await navigateTo(notInstalledCard.value.to, { external: true, open: { target: '_blank' } })
    } else {
        await navigateTo(notInstalledCard.value.to)
    }
}

function syncRunLabel(run: FstSyncRun): string {
    if (run.type === 'inquiries') return t('settings.fst.syncRunInquiries')
    if (run.type === 'analytics') return t('settings.fst.syncRunAnalytics')
    if (run.type === 'profile_push') return t('settings.fst.syncRunProfilePush')
    return run.type
}

function syncRunStatusLabel(status: string): string {
    switch (status) {
        case 'success': return t('settings.fst.syncRunSuccess')
        case 'partial': return t('settings.fst.syncRunPartial')
        case 'failed': return t('settings.fst.syncRunFailed')
        case 'skipped_ineligible': return t('settings.fst.syncRunSkipped')
        default: return status
    }
}

function syncRunStatusClass(status: string): string {
    switch (status) {
        case 'success': return 'bg-[#e2f4f2] text-[#0d5850]'
        case 'partial': return 'bg-amber-100 text-amber-700'
        case 'failed': return 'bg-red-100 text-red-700'
        default: return 'bg-slate-100 text-slate-500'
    }
}

function syncRunDotClass(status: string): string {
    switch (status) {
        case 'success': return 'bg-[#1f9d6b]'
        case 'partial': return 'bg-amber-500'
        case 'failed': return 'bg-red-500'
        default: return 'bg-slate-400'
    }
}

function formatSyncRunDate(startedAt: string | null): string {
    return startedAt ? moment(startedAt).format('DD.MM.YYYY HH:mm') : ''
}

onMounted(() => fetchStatus())

async function loadFirstPageOfLists() {
    const [inquiriesRes, historyRes] = await Promise.all([
        fstService.getInquiries(),
        fstService.getSyncHistory(),
    ])
    state.inquiries = inquiriesRes?.data ?? []
    state.inquiriesMeta = inquiriesRes?.meta ?? null
    state.syncHistory = historyRes?.data ?? []
    state.syncHistoryMeta = historyRes?.meta ?? null
}

async function loadMoreInquiries() {
    if (!state.inquiriesMeta) return
    state.isLoadingMoreInquiries = true
    try {
        const res = await fstService.getInquiries(state.inquiriesMeta.current_page + 1)
        state.inquiries = [...state.inquiries, ...(res?.data ?? [])]
        state.inquiriesMeta = res?.meta ?? null
    } catch (error: any) {
        state.error = error
    }
    state.isLoadingMoreInquiries = false
}

async function loadMoreSyncHistory() {
    if (!state.syncHistoryMeta) return
    state.isLoadingMoreSyncHistory = true
    try {
        const res = await fstService.getSyncHistory(state.syncHistoryMeta.current_page + 1)
        state.syncHistory = [...state.syncHistory, ...(res?.data ?? [])]
        state.syncHistoryMeta = res?.meta ?? null
    } catch (error: any) {
        state.error = error
    }
    state.isLoadingMoreSyncHistory = false
}

async function fetchStatus() {
    state.error = {}
    state.isLoading = true
    try {
        state.status = await fstService.getStatus()
        if (state.status.sync_eligible) {
            await loadFirstPageOfLists()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function activate() {
    state.error = {}
    state.isLoading = true
    try {
        state.status = await fstService.activate()
        successAlert(`${t('alert.success')}!`, t('settings.fst.activate'))
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function refreshStatus() {
    state.error = {}
    state.isLoading = true
    try {
        state.status = await fstService.refreshRemoteStatus()
        if (state.status.sync_eligible) {
            await loadFirstPageOfLists()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function deactivate() {
    state.modal.confirmDeactivate = false
    state.error = {}
    state.isLoading = true
    try {
        state.status = await fstService.deactivate()
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function reactivate() {
    state.error = {}
    state.isLoading = true
    try {
        state.status = await fstService.reactivate()
        successAlert(`${t('alert.success')}!`, t('settings.fst.reconnect'))
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function disconnect() {
    state.modal.confirmDisconnect = false
    state.error = {}
    state.isLoading = true
    try {
        state.status = await fstService.disconnect()
        state.inquiries = []
        state.inquiriesMeta = null
        state.syncHistory = []
        state.syncHistoryMeta = null
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function rotateSecret() {
    state.error = {}
    state.isLoading = true
    try {
        await fstService.rotateSecret()
        successAlert(`${t('alert.success')}!`, t('settings.fst.rotateSecret'))
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function triggerSync() {
    state.error = {}
    try {
        await fstService.triggerSync()
        successAlert(`${t('alert.success')}!`, t('settings.fst.syncNow'))
        setTimeout(fetchStatus, 1500)
    } catch (error: any) {
        state.error = error
    }
}
</script>
