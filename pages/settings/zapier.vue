<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('settings.zapier.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('settings.zapier.title') }}</template>

            <LoadingSpinner :isActive="state.isLoading">
                <div class="mt-8 max-w-3xl space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <p class="text-sm text-slate-500">{{ $t('settings.zapier.subtitle') }}</p>

                    <Alert v-if="!isAdmin" type="info" :text="$t('settings.zapier.adminOnly')" />

                    <!-- App not purchased: point the admin to the Apps marketplace -->
                    <div v-if="!state.status.app_active"
                        class="rounded-xl border border-dashed border-surface-200 bg-surface-50 p-8 text-center">
                        <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary">
                            <Icon name="ph:lock-key" class="size-6" />
                        </div>
                        <p class="mt-3 text-sm text-slate-500">{{ $t('settings.zapier.notPurchased') }}</p>
                        <div class="mt-4 flex justify-center">
                            <FormButton buttonStyle="primary" @click="navigateTo('/apps')">
                                <Icon name="ph:storefront" class="h-4 w-4" />
                                {{ $t('settings.zapier.goToApps') }}
                            </FormButton>
                        </div>
                    </div>

                    <template v-if="state.status.app_active && isAdmin">
                        <!-- What is shared -->
                        <Alert type="info" :text="$t('settings.zapier.dataNote')" />

                        <!-- Typed texts: task titles can contain names -->
                        <div class="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
                            <div class="flex items-center gap-x-3">
                                <FormSwitch :value="state.status.include_free_text" :disabled="state.isLoading"
                                    @toggleSwitch="toggleFreeText" :label="$t('settings.zapier.freeTextLabel')" />
                                <p class="text-sm font-semibold text-slate-900">{{ $t('settings.zapier.freeTextLabel') }}</p>
                            </div>
                            <p class="mt-2 text-xs text-slate-400">{{ $t('settings.zapier.freeTextHint') }}</p>
                        </div>

                        <!-- Freshly created key: shown once -->
                        <div v-if="state.rawKey" class="rounded-xl border border-primary/20 bg-primary-50 p-4">
                            <p class="text-xs font-semibold text-[#1b6d8a]">{{ $t('settings.zapier.keyOnce') }}</p>
                            <div class="mt-2 flex items-center gap-2">
                                <code class="flex-1 truncate rounded-md bg-white px-3 py-2 text-sm text-slate-700 border border-surface-200">
                                    {{ state.rawKey }}
                                </code>
                                <FormButton buttonStyle="action" @click="copy(state.rawKey)">
                                    <Icon name="ph:copy" class="h-4 w-4" />
                                    {{ copied ? $t('settings.zapier.copied') : $t('settings.zapier.copy') }}
                                </FormButton>
                            </div>
                        </div>

                        <!-- Keys -->
                        <div class="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
                            <h3 class="text-sm font-semibold text-slate-900">{{ $t('settings.zapier.keys') }}</h3>
                            <p class="mt-1 text-xs text-slate-400">{{ $t('settings.zapier.ownerNote') }}</p>

                            <div class="mt-4 flex items-end gap-2">
                                <div class="flex-1 space-y-1">
                                    <label for="zapier-key-name" class="text-xs font-medium text-slate-500">
                                        {{ $t('settings.zapier.keyName') }}
                                    </label>
                                    <FormTextField id="zapier-key-name" name="zapier-key-name"
                                        :placeholder="$t('settings.zapier.keyNamePlaceholder')" v-model="state.keyName"
                                        :maxLength="100" />
                                    <FormError :error="state?.error?.errors?.name?.[0]" />
                                </div>
                                <FormButton buttonStyle="primary" :disabled="!state.keyName.trim()" @click="createKey">
                                    <Icon name="ph:key" class="h-4 w-4" />
                                    {{ $t('settings.zapier.createKey') }}
                                </FormButton>
                            </div>

                            <p v-if="state.status.keys.length === 0" class="mt-4 text-sm text-slate-400">
                                {{ $t('settings.zapier.noKeys') }}
                            </p>
                            <ul v-else class="mt-4 divide-y divide-surface-200">
                                <li v-for="key in state.status.keys" :key="key.id"
                                    class="flex items-center justify-between gap-3 py-3">
                                    <div class="min-w-0">
                                        <p class="truncate text-sm font-semibold text-slate-900">{{ key.name }}</p>
                                        <p class="text-xs text-slate-400">
                                            {{ $t('settings.zapier.keyEnds') }} …{{ key.last4 }} ·
                                            {{ key.last_used_at ? `${$t('settings.zapier.lastUsed')} ${formatDate(key.last_used_at)}` : $t('settings.zapier.neverUsed') }}
                                        </p>
                                    </div>
                                    <FormButton buttonStyle="danger" @click="state.confirmRevokeId = key.id">
                                        <Icon name="ph:prohibit" class="h-4 w-4" />
                                        {{ $t('settings.zapier.revoke') }}
                                    </FormButton>
                                </li>
                            </ul>
                        </div>

                        <!-- How to connect -->
                        <div class="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
                            <h3 class="text-sm font-semibold text-slate-900 mb-3">{{ $t('settings.zapier.howTitle') }}</h3>
                            <ol class="space-y-2 text-sm text-slate-600 list-decimal pl-5">
                                <li>{{ $t('settings.zapier.how1') }}</li>
                                <li>{{ $t('settings.zapier.how2') }}</li>
                                <li>{{ $t('settings.zapier.how3') }}</li>
                            </ol>
                            <div v-if="state.status.invite_url" class="mt-4">
                                <a :href="state.status.invite_url" target="_blank" rel="noopener noreferrer">
                                    <FormButton buttonStyle="action">
                                        <Icon name="ph:arrow-square-out" class="h-4 w-4" />
                                        {{ $t('settings.zapier.openZapier') }}
                                    </FormButton>
                                </a>
                            </div>
                        </div>

                        <!-- Recent deliveries -->
                        <div class="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
                            <h3 class="text-sm font-semibold text-slate-900 mb-3">{{ $t('settings.zapier.deliveries') }}</h3>
                            <p v-if="state.status.deliveries.length === 0" class="text-sm text-slate-400">
                                {{ $t('settings.zapier.noDeliveries') }}
                            </p>
                            <ul v-else class="divide-y divide-surface-200">
                                <li v-for="(delivery, index) in state.status.deliveries" :key="index"
                                    class="flex items-center justify-between gap-3 py-2 text-sm">
                                    <span class="flex items-center gap-2 text-slate-700">
                                        <span class="size-2.5 rounded-full" :class="statusDot(delivery.status)"></span>
                                        {{ delivery.event }}
                                    </span>
                                    <span class="text-xs text-slate-400">
                                        {{ $t(`settings.zapier.status.${delivery.status}`) }} · {{ formatDate(delivery.created_at) }}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </template>
                </div>
            </LoadingSpinner>

            <DialogConfirmation :isModalOpen="!!state.confirmRevokeId"
                :message="$t('settings.zapier.confirmRevoke')"
                @close="state.confirmRevokeId = ''" @confirm="revokeKey" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { zapierService } from '@/components/api/user/ZapierService'
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
    { name: 'settings.zapier.title', translate: true, href: '/settings/zapier' },
]

const state = reactive({
    error: {} as Error,
    isLoading: false,
    rawKey: '' as string,
    keyName: '' as string,
    confirmRevokeId: '' as string,
    status: {
        app_active: false,
        invite_url: null as string | null,
        include_free_text: true,
        keys: [] as any[],
        deliveries: [] as any[],
    },
})

const copied = ref(false)

onMounted(() => fetchStatus())

async function fetchStatus() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await zapierService.getStatus()
        state.status = response?.data ?? state.status
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function toggleFreeText() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await zapierService.updateSettings(!state.status.include_free_text)
        state.status = response?.data ?? state.status
        successAlert(`${t('alert.success')}!`, t('settings.zapier.settingSaved'))
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function createKey() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await zapierService.createKey(state.keyName.trim())
        state.rawKey = response?.data?.key ?? ''
        state.keyName = ''
        successAlert(`${t('alert.success')}!`, t('settings.zapier.keyCreated'))
        // The list comes from the server; the raw key is only ever in this response.
        const refreshed = await zapierService.getStatus()
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
        const response = await zapierService.revokeKey(id)
        state.rawKey = ''
        state.status = response?.data ?? state.status
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function copy(value: string) {
    try {
        await navigator.clipboard.writeText(value)
        copied.value = true
        setTimeout(() => { copied.value = false }, 1500)
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
