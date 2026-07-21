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

            <ModulesUserSettingsTab />

            <LoadingSpinner :isActive="state.isLoading">
                <div class="mt-8 max-w-3xl space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <p class="text-sm text-slate-500">{{ $t('settings.fst.subtitle') }}</p>

                    <Alert v-if="!isAdmin" type="info" :text="$t('settings.fst.adminOnly')" />

                    <!-- Not installed: point to the Apps marketplace (plan §9/§14 — -->
                    <!-- installation happens there, this page is the manage screen). -->
                    <div v-if="!state.status.installed"
                        class="rounded-xl border border-dashed border-surface-200 bg-surface-50 p-8 text-center">
                        <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f0faf9] text-[#2dbab2]">
                            <Icon name="ph:plugs-connected" class="size-6" />
                        </div>
                        <p class="mt-3 text-sm text-slate-500">{{ $t('settings.fst.notInstalled') }}</p>
                        <div class="mt-4 flex justify-center">
                            <FormButton buttonStyle="primary" @click="navigateTo('/apps')">
                                <Icon name="ph:storefront" class="h-4 w-4" />
                                {{ $t('settings.fst.goToApps') }}
                            </FormButton>
                        </div>
                    </div>

                    <template v-else>
                        <!-- Installed but never configured (co_activated_at is null) -->
                        <div v-if="!state.status.co_activated_at && isAdmin"
                            class="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
                            <h3 class="text-sm font-semibold text-slate-900 mb-3">{{ $t('settings.fst.configureTitle') }}</h3>
                            <div class="flex flex-wrap items-end gap-3">
                                <div>
                                    <label class="text-xs font-medium text-slate-500">{{ $t('settings.fst.cvrLabel') }}</label>
                                    <input v-model="state.cvr" type="text" :placeholder="$t('settings.fst.cvrPlaceholder')"
                                        class="mt-1 block rounded-md border border-surface-200 px-3 py-2 text-sm" />
                                </div>
                                <FormButton buttonStyle="primary" @click="activate">
                                    <Icon name="ph:link" class="h-4 w-4" />
                                    {{ $t('settings.fst.activate') }}
                                </FormButton>
                            </div>
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
                                </div>
                                <div class="flex items-center gap-2 flex-wrap" v-if="isAdmin">
                                    <FormButton v-if="state.status.connection_status === 'active'" buttonStyle="primary"
                                        :disabled="!state.status.sync_eligible" @click="triggerSync">
                                        <Icon name="ph:arrows-clockwise" class="h-4 w-4" />
                                        {{ $t('settings.fst.syncNow') }}
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
                                    <FormButton v-if="state.status.connection_status && state.status.connection_status !== 'disconnected'"
                                        buttonStyle="danger" @click="state.modal.confirmDisconnect = true">
                                        <Icon name="ph:plug" class="h-4 w-4" />
                                        {{ $t('settings.fst.disconnect') }}
                                    </FormButton>
                                    <FormButton v-if="state.status.connection_status === 'active'" buttonStyle="action" @click="rotateSecret">
                                        <Icon name="ph:key" class="h-4 w-4" />
                                        {{ $t('settings.fst.rotateSecret') }}
                                    </FormButton>
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
                        </div>

                        <div v-if="state.status.sync_eligible" class="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
                            <h3 class="text-sm font-semibold text-slate-900 mb-3">{{ $t('settings.fst.syncHistory') }}</h3>
                            <ul class="divide-y divide-surface-100 text-sm">
                                <li v-for="run in state.syncHistory" :key="run.uuid" class="py-2 flex justify-between">
                                    <span>{{ run.type }} ({{ run.direction }})</span>
                                    <span :class="run.status === 'success' ? 'text-[#1f9d6b]' : 'text-slate-400'">{{ run.status }}</span>
                                </li>
                            </ul>
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
import { fstService } from '@/components/api/user/FstService'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error, FstConnectionStatusResponse, FstInquiry, FstSyncRun } from '@/types'

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
}

const state = reactive({
    error: {} as Error,
    isLoading: false,
    cvr: '',
    status: { ...defaultStatus } as FstConnectionStatusResponse,
    inquiries: [] as FstInquiry[],
    syncHistory: [] as FstSyncRun[],
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

onMounted(() => fetchStatus())

async function fetchStatus() {
    state.error = {}
    state.isLoading = true
    try {
        state.status = await fstService.getStatus()
        if (state.status.sync_eligible) {
            const [inquiriesRes, historyRes] = await Promise.all([
                fstService.getInquiries(),
                fstService.getSyncHistory(),
            ])
            state.inquiries = inquiriesRes?.data ?? []
            state.syncHistory = historyRes?.data ?? []
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
        state.status = await fstService.activate(state.cvr)
        successAlert(`${t('alert.success')}!`, t('settings.fst.activate'))
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
        state.syncHistory = []
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
