<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('settings.publicApi.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('settings.publicApi.title') }}</template>

            <LoadingSpinner :isActive="state.isLoading">
                <div class="mt-8 max-w-3xl space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <p class="text-sm text-slate-500">{{ $t('settings.publicApi.subtitle') }}</p>

                    <Alert v-if="!isAdmin" type="info" :text="$t('settings.publicApi.adminOnly')" />

                    <!-- Off: an admin switches it on after confirming the data processing agreement -->
                    <div v-if="isAdmin && !state.status.enabled"
                        class="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
                        <div class="flex items-start gap-4">
                            <div class="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#f0faf9] text-[#1b6d8a]">
                                <Icon name="ph:plugs-connected" class="size-6" />
                            </div>
                            <div class="min-w-0">
                                <h3 class="text-sm font-semibold text-slate-900">{{ $t('settings.publicApi.offTitle') }}</h3>
                                <p class="mt-1 text-sm text-slate-500">{{ $t('settings.publicApi.offBody') }}</p>
                            </div>
                        </div>
                        <button type="button" class="mt-5 flex w-full items-start gap-1 rounded-lg border px-3 py-3 text-left transition"
                            :class="state.dpaConfirmed ? 'border-[#2dbab2] bg-[#f0faf9]' : 'border-surface-200 hover:bg-surface-50'"
                            @click="state.dpaConfirmed = !state.dpaConfirmed">
                            <FormCheckbox :value="state.dpaConfirmed" class="pointer-events-none mt-0.5" />
                            <span class="text-sm text-slate-700">{{ $t('settings.publicApi.dpaConfirm') }}</span>
                        </button>
                        <FormError :error="state?.error?.errors?.dpa_confirmed?.[0]" />
                        <div class="mt-4 flex justify-end">
                            <FormButton buttonStyle="primary" :disabled="!state.dpaConfirmed" @click="setEnabled(true)">
                                <Icon name="ph:power" class="h-4 w-4" />
                                {{ $t('settings.publicApi.enable') }}
                            </FormButton>
                        </div>
                    </div>

                    <template v-if="state.status.enabled && isAdmin">
                        <!-- On: who switched it on, and the way back -->
                        <div class="flex items-center justify-between gap-3 rounded-xl border border-[#2dbab2]/40 bg-[#f0faf9] px-5 py-4">
                            <p class="flex items-center gap-2 text-sm text-slate-700">
                                <span class="size-2.5 shrink-0 rounded-full bg-[#2dbab2]"></span>
                                <span>
                                    <span class="font-semibold">{{ $t('settings.publicApi.onTitle') }}</span>
                                    <template v-if="state.status.enabled_at">
                                        · {{ $t('settings.publicApi.enabledBy', { name: state.status.enabled_by ?? '', date: formatDate(state.status.enabled_at) }) }}
                                    </template>
                                </span>
                            </p>
                            <FormButton buttonStyle="danger" @click="state.confirmDisable = true">
                                <Icon name="ph:power" class="h-4 w-4" />
                                {{ $t('settings.publicApi.disable') }}
                            </FormButton>
                        </div>

                        <!-- What is shared, and the agreement it needs -->
                        <Alert type="info" :text="$t('settings.publicApi.dataNote')" />

                        <!-- Where the integration connects -->
                        <div class="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
                            <h3 class="text-sm font-semibold text-slate-900">{{ $t('settings.publicApi.baseUrl') }}</h3>
                            <p class="mt-1 text-xs text-slate-400">{{ $t('settings.publicApi.baseUrlHint') }}</p>
                            <div class="mt-3 flex items-center gap-2">
                                <code class="flex-1 truncate rounded-md border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-slate-700">
                                    {{ baseUrl }}
                                </code>
                                <FormButton buttonStyle="action" @click="copy(baseUrl, 'url')">
                                    <Icon name="ph:copy" class="h-4 w-4" />
                                    {{ copied === 'url' ? $t('settings.publicApi.copied') : $t('settings.publicApi.copy') }}
                                </FormButton>
                            </div>
                        </div>

                        <!-- Freshly created key: shown once -->
                        <div v-if="state.rawKey" class="rounded-xl border border-primary/20 bg-primary-50 p-4">
                            <p class="text-xs font-semibold text-[#1b6d8a]">{{ $t('settings.publicApi.keyOnce') }}</p>
                            <div class="mt-2 flex items-center gap-2">
                                <code class="flex-1 truncate rounded-md border border-surface-200 bg-white px-3 py-2 text-sm text-slate-700">
                                    {{ state.rawKey }}
                                </code>
                                <FormButton buttonStyle="action" @click="copy(state.rawKey, 'key')">
                                    <Icon name="ph:copy" class="h-4 w-4" />
                                    {{ copied === 'key' ? $t('settings.publicApi.copied') : $t('settings.publicApi.copy') }}
                                </FormButton>
                            </div>
                        </div>

                        <!-- Create a key -->
                        <div class="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
                            <h3 class="text-sm font-semibold text-slate-900">{{ $t('settings.publicApi.newKey') }}</h3>
                            <p class="mt-1 text-xs text-slate-400">{{ $t('settings.publicApi.ownerNote') }}</p>

                            <div class="mt-4 space-y-1">
                                <label for="public-api-key-name" class="text-xs font-medium text-slate-500">
                                    {{ $t('settings.publicApi.keyName') }}
                                </label>
                                <FormTextField id="public-api-key-name" name="public-api-key-name"
                                    :placeholder="$t('settings.publicApi.keyNamePlaceholder')" v-model="state.form.name"
                                    :maxLength="100" />
                                <FormError :error="state?.error?.errors?.name?.[0]" />
                            </div>

                            <fieldset class="mt-4">
                                <legend class="text-xs font-medium text-slate-500">{{ $t('settings.publicApi.access') }}</legend>
                                <div class="mt-2 space-y-2">
                                    <button v-for="scope in state.status.available_scopes" :key="scope" type="button"
                                        class="flex w-full items-start gap-1 rounded-lg border px-3 py-2 text-left transition"
                                        :class="state.form.scopes.includes(scope) ? 'border-[#2dbab2] bg-[#f0faf9]' : 'border-surface-200 hover:bg-surface-50'"
                                        @click="toggleScope(scope)">
                                        <FormCheckbox :value="state.form.scopes.includes(scope)" class="pointer-events-none mt-0.5" />
                                        <span class="min-w-0">
                                            <span class="block text-sm font-semibold text-slate-900">{{ $t(`settings.publicApi.scopes.${scopeKey(scope)}.title`) }}</span>
                                            <span class="block text-xs text-slate-500">{{ $t(`settings.publicApi.scopes.${scopeKey(scope)}.body`) }}</span>
                                        </span>
                                    </button>
                                </div>
                                <FormError :error="state?.error?.errors?.scopes?.[0]" />
                            </fieldset>

                            <div class="mt-4 space-y-1">
                                <label class="text-xs font-medium text-slate-500">
                                    {{ $t('settings.publicApi.allowedIps') }}
                                </label>
                                <FormTextArea name="public-api-allowed-ips" :rows="2"
                                    :placeholder="$t('settings.publicApi.allowedIpsPlaceholder')"
                                    v-model="state.form.allowedIps" />
                                <p class="text-xs text-slate-400">{{ $t('settings.publicApi.allowedIpsHint') }}</p>
                                <FormError :error="firstIpError" />
                            </div>

                            <div class="mt-4 flex justify-end">
                                <FormButton buttonStyle="primary" :disabled="!canCreate" @click="createKey">
                                    <Icon name="ph:key" class="h-4 w-4" />
                                    {{ $t('settings.publicApi.createKey') }}
                                </FormButton>
                            </div>
                        </div>

                        <!-- Keys -->
                        <div class="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
                            <h3 class="text-sm font-semibold text-slate-900">{{ $t('settings.publicApi.keys') }}</h3>

                            <p v-if="state.status.keys.length === 0" class="mt-4 text-sm text-slate-400">
                                {{ $t('settings.publicApi.noKeys') }}
                            </p>
                            <ul v-else class="mt-2 divide-y divide-surface-200">
                                <li v-for="key in state.status.keys" :key="key.id"
                                    class="flex items-start justify-between gap-3 py-3">
                                    <div class="min-w-0">
                                        <p class="truncate text-sm font-semibold text-slate-900">{{ key.name }}</p>
                                        <p class="text-xs text-slate-400">
                                            {{ $t('settings.publicApi.keyEnds') }} …{{ key.last4 }} ·
                                            {{ key.last_used_at ? `${$t('settings.publicApi.lastUsed')} ${formatDate(key.last_used_at)}` : $t('settings.publicApi.neverUsed') }}
                                            <template v-if="key.created_by"> · {{ $t('settings.publicApi.createdBy') }} {{ key.created_by }}</template>
                                        </p>
                                        <div class="mt-2 flex flex-wrap gap-1">
                                            <span v-for="scope in key.scopes" :key="scope"
                                                class="rounded-full bg-[#f0faf9] px-2 py-0.5 text-[11px] font-semibold text-[#1b6d8a]">
                                                {{ $t(`settings.publicApi.scopes.${scopeKey(scope)}.title`) }}
                                            </span>
                                            <span v-if="key.allowed_ips?.length"
                                                class="rounded-full bg-surface-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                                                {{ $t('settings.publicApi.ipLimited', { count: key.allowed_ips.length }) }}
                                            </span>
                                        </div>
                                    </div>
                                    <FormButton buttonStyle="danger" @click="state.confirmRevokeId = key.id">
                                        <Icon name="ph:prohibit" class="h-4 w-4" />
                                        {{ $t('settings.publicApi.revoke') }}
                                    </FormButton>
                                </li>
                            </ul>
                        </div>

                        <!-- Webhooks: registered by the integration itself -->
                        <div class="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
                            <h3 class="text-sm font-semibold text-slate-900">{{ $t('settings.publicApi.webhooks') }}</h3>
                            <p class="mt-1 text-xs text-slate-400">{{ $t('settings.publicApi.webhooksHint') }}</p>

                            <p v-if="state.status.webhooks.length === 0" class="mt-4 text-sm text-slate-400">
                                {{ $t('settings.publicApi.noWebhooks') }}
                            </p>
                            <ul v-else class="mt-2 divide-y divide-surface-200">
                                <li v-for="webhook in state.status.webhooks" :key="webhook.id"
                                    class="flex items-start justify-between gap-3 py-3">
                                    <div class="min-w-0">
                                        <p class="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                            <span class="truncate">{{ webhook.url }}</span>
                                            <span class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                                                :class="webhook.is_active ? 'bg-[#f0faf9] text-[#1b6d8a]' : 'bg-[#fef2f2] text-[#dc2626]'">
                                                {{ webhook.is_active ? $t('settings.publicApi.active') : $t('settings.publicApi.switchedOff') }}
                                            </span>
                                        </p>
                                        <p class="mt-1 text-xs text-slate-400">{{ webhook.events.join(', ') }}</p>
                                        <p v-if="!webhook.is_active" class="mt-1 text-xs text-[#dc2626]">
                                            {{ $t('settings.publicApi.switchedOffHint') }}
                                        </p>
                                    </div>
                                    <FormButton buttonStyle="danger" @click="state.confirmDeleteWebhookId = webhook.id">
                                        <Icon name="ph:trash" class="h-4 w-4" />
                                        {{ $t('settings.publicApi.delete') }}
                                    </FormButton>
                                </li>
                            </ul>
                        </div>

                        <!-- Recent deliveries -->
                        <div class="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
                            <h3 class="mb-3 text-sm font-semibold text-slate-900">{{ $t('settings.publicApi.deliveries') }}</h3>
                            <p v-if="state.status.recent_deliveries.length === 0" class="text-sm text-slate-400">
                                {{ $t('settings.publicApi.noDeliveries') }}
                            </p>
                            <ul v-else class="divide-y divide-surface-200">
                                <li v-for="delivery in state.status.recent_deliveries" :key="delivery.id"
                                    class="flex items-center justify-between gap-3 py-2 text-sm">
                                    <span class="flex min-w-0 items-center gap-2 text-slate-700">
                                        <span class="size-2.5 shrink-0 rounded-full" :class="statusDot(delivery.status)"></span>
                                        <span class="truncate">{{ delivery.event }}</span>
                                    </span>
                                    <span class="shrink-0 text-xs text-slate-400">
                                        {{ $t(`settings.publicApi.status.${delivery.status}`) }}
                                        <template v-if="delivery.response_code"> ({{ delivery.response_code }})</template>
                                        · {{ formatDate(delivery.created_at) }}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </template>
                </div>
            </LoadingSpinner>

            <DialogConfirmation :isModalOpen="state.confirmDisable"
                :message="$t('settings.publicApi.confirmDisable')"
                @close="state.confirmDisable = false" @confirm="setEnabled(false)" />

            <DialogConfirmation :isModalOpen="!!state.confirmRevokeId"
                :message="$t('settings.publicApi.confirmRevoke')"
                @close="state.confirmRevokeId = ''" @confirm="revokeKey" />

            <DialogConfirmation :isModalOpen="!!state.confirmDeleteWebhookId"
                :message="$t('settings.publicApi.confirmDeleteWebhook')"
                @close="state.confirmDeleteWebhookId = ''" @confirm="deleteWebhook" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { publicApiService } from '@/components/api/user/PublicApiService'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()

const isAdmin = computed(() => userStore.getUser?.roles?.some((r: any) => r.name === 'Admin'))

const breadcrumbLinks = [
    { name: 'settings.publicApi.title', translate: true, href: '/settings/public-api' },
]

// The read scopes most integrations start from. CPR is never preselected.
const DEFAULT_SCOPES = ['citizens:read', 'journals:read']

const state = reactive({
    error: {} as Error,
    isLoading: false,
    rawKey: '' as string,
    confirmRevokeId: '' as string,
    confirmDeleteWebhookId: '' as string,
    confirmDisable: false,
    dpaConfirmed: false,
    form: {
        name: '' as string,
        scopes: [...DEFAULT_SCOPES] as string[],
        allowedIps: '' as string,
    },
    status: {
        enabled: false,
        enabled_at: null as string | null,
        enabled_by: null as string | null,
        available_scopes: [] as string[],
        keys: [] as any[],
        webhooks: [] as any[],
        recent_deliveries: [] as any[],
    },
})

const copied = ref('')

const baseUrl = computed(() => `${String(runtimeConfig.public.apiBaseURL ?? '').replace(/\/+$/, '')}/v1`)

const canCreate = computed(() => state.form.name.trim().length > 0 && state.form.scopes.length > 0)

// The server checks each address; show the first problem under the field.
const firstIpError = computed(() => {
    const errors = (state.error as any)?.errors ?? {}
    const key = Object.keys(errors).find((k) => k.startsWith('allowed_ips'))
    return key ? errors[key][0] : ''
})

onMounted(() => fetchStatus())

function scopeKey(scope: string) {
    return scope.replace(':', '_')
}

function toggleScope(scope: string) {
    const scopes = state.form.scopes
    if (scopes.includes(scope)) {
        state.form.scopes = scopes.filter((s) => s !== scope)
        // CPR is part of a citizen; without citizens it means nothing.
        if (scope === 'citizens:read') {
            state.form.scopes = state.form.scopes.filter((s) => s !== 'citizens:cpr')
        }
        return
    }
    state.form.scopes = [...scopes, scope]
    if (scope === 'citizens:cpr' && !state.form.scopes.includes('citizens:read')) {
        state.form.scopes.push('citizens:read')
    }
}

async function fetchStatus() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await publicApiService.getStatus()
        state.status = response?.data ?? state.status
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function setEnabled(enabled: boolean) {
    state.confirmDisable = false
    state.error = {}
    state.isLoading = true
    try {
        const response = await publicApiService.setEnabled(enabled, state.dpaConfirmed)
        state.status = response?.data ?? state.status
        state.dpaConfirmed = false
        state.rawKey = ''
        successAlert(`${t('alert.success')}!`, t(enabled ? 'settings.publicApi.enabledToast' : 'settings.publicApi.disabledToast'))
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function createKey() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await publicApiService.createKey({
            name: state.form.name.trim(),
            scopes: state.form.scopes,
            allowed_ips: state.form.allowedIps.split(/[\s,]+/).map((ip) => ip.trim()).filter(Boolean),
        })
        state.rawKey = response?.data?.key ?? ''
        state.form = { name: '', scopes: [...DEFAULT_SCOPES], allowedIps: '' }
        successAlert(`${t('alert.success')}!`, t('settings.publicApi.keyCreated'))
        // The list comes from the server; the raw key is only ever in this response.
        const refreshed = await publicApiService.getStatus()
        state.status = refreshed?.data ?? state.status
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function revokeKey() {
    const id = state.confirmRevokeId
    state.confirmRevokeId = ''
    state.error = {}
    state.isLoading = true
    try {
        const response = await publicApiService.revokeKey(id)
        state.rawKey = ''
        state.status = response?.data ?? state.status
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function deleteWebhook() {
    const id = state.confirmDeleteWebhookId
    state.confirmDeleteWebhookId = ''
    state.error = {}
    state.isLoading = true
    try {
        const response = await publicApiService.deleteWebhook(id)
        state.status = response?.data ?? state.status
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function copy(value: string, what: string) {
    try {
        await navigator.clipboard.writeText(value)
        copied.value = what
        setTimeout(() => { copied.value = '' }, 1500)
    } catch {
        // clipboard unavailable, no-op
    }
}

function statusDot(status: string) {
    if (status === 'delivered') return 'bg-[#1f9d6b]'
    if (status === 'failed') return 'bg-red-500'
    return 'bg-slate-300'
}

function formatDate(value: string) {
    return new Date(value).toLocaleString()
}
</script>
