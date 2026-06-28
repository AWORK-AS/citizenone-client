<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('settings.powerBi.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('settings.powerBi.title') }}</template>

            <ModulesUserSettingsTab />

            <LoadingSpinner :isActive="state.isLoading">
                <div class="mt-8 max-w-3xl space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <p class="text-sm text-slate-500">{{ $t('settings.powerBi.subtitle') }}</p>

                    <Alert v-if="!isAdmin" type="info" :text="$t('settings.powerBi.adminOnly')" />

                    <!-- Status + actions -->
                    <div class="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
                        <div class="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <p class="text-xs uppercase tracking-wide text-slate-400">
                                    {{ $t('settings.powerBi.status') }}
                                </p>
                                <div class="mt-1 flex items-center gap-2">
                                    <span class="size-2.5 rounded-full"
                                        :class="state.status.enabled ? 'bg-[#1f9d6b]' : 'bg-slate-300'"></span>
                                    <span class="font-semibold text-slate-900">
                                        {{ state.status.enabled ? $t('settings.powerBi.active') : $t('settings.powerBi.inactive') }}
                                    </span>
                                    <span v-if="state.status.enabled && state.status.last4"
                                        class="text-xs text-slate-400">
                                        ({{ $t('settings.powerBi.tokenEnds') }} …{{ state.status.last4 }})
                                    </span>
                                </div>
                            </div>
                            <div class="flex items-center gap-2" v-if="isAdmin">
                                <FormButton buttonStyle="primary" @click="generate">
                                    <Icon name="ph:key" class="h-4 w-4" />
                                    {{ state.status.enabled ? $t('settings.powerBi.regenerate') : $t('settings.powerBi.generate') }}
                                </FormButton>
                                <FormButton v-if="state.status.enabled" buttonStyle="danger" @click="state.modal.confirmRevoke = true">
                                    <Icon name="ph:prohibit" class="h-4 w-4" />
                                    {{ $t('settings.powerBi.revoke') }}
                                </FormButton>
                            </div>
                        </div>

                        <!-- Freshly generated token — shown once -->
                        <div v-if="state.rawToken"
                            class="mt-4 rounded-lg border border-[#2dbab2]/40 bg-[#f0faf9] p-3">
                            <p class="text-xs font-semibold text-[#1b6d8a]">{{ $t('settings.powerBi.tokenOnce') }}</p>
                            <div class="mt-2 flex items-center gap-2">
                                <code class="flex-1 truncate rounded-md bg-white px-3 py-2 text-sm text-slate-700 border border-surface-200">
                                    {{ state.rawToken }}
                                </code>
                                <FormButton buttonStyle="action" @click="copy(state.rawToken, 'token')">
                                    <Icon name="ph:copy" class="h-4 w-4" />
                                    {{ copiedKey === 'token' ? $t('settings.powerBi.copied') : $t('settings.powerBi.copy') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>

                    <!-- Feed URLs -->
                    <div v-if="state.status.enabled" class="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
                        <h3 class="text-sm font-semibold text-slate-900 mb-3">{{ $t('settings.powerBi.feeds') }}</h3>
                        <div class="space-y-3">
                            <div v-for="feed in feedList" :key="feed.key" class="space-y-1">
                                <p class="text-xs font-medium text-slate-500">{{ feed.label }}</p>
                                <div class="flex items-center gap-2">
                                    <code class="flex-1 truncate rounded-md bg-surface-50 px-3 py-2 text-xs text-slate-600 border border-surface-200">
                                        {{ feed.url }}
                                    </code>
                                    <FormButton buttonStyle="action" @click="copy(feed.url, feed.key)">
                                        <Icon name="ph:copy" class="h-4 w-4" />
                                        {{ copiedKey === feed.key ? $t('settings.powerBi.copied') : $t('settings.powerBi.copy') }}
                                    </FormButton>
                                </div>
                            </div>
                        </div>
                        <p v-if="!state.rawToken" class="mt-3 text-xs text-slate-400">
                            {{ $t('settings.powerBi.tokenOnce') }}
                        </p>
                    </div>

                    <!-- How-to -->
                    <div class="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
                        <h3 class="text-sm font-semibold text-slate-900 mb-3">{{ $t('settings.powerBi.howTitle') }}</h3>
                        <ol class="space-y-2 text-sm text-slate-600 list-decimal pl-5">
                            <li>{{ $t('settings.powerBi.how1') }}</li>
                            <li>{{ $t('settings.powerBi.how2') }}</li>
                            <li>{{ $t('settings.powerBi.how3') }}</li>
                        </ol>
                    </div>
                </div>
            </LoadingSpinner>

            <DialogConfirmation :isModalOpen="state.modal.confirmRevoke"
                :message="$t('settings.powerBi.confirmRevoke')"
                @close="state.modal.confirmRevoke = false" @confirm="revoke" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { powerBiService } from '@/components/api/user/PowerBiService'
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
    { name: 'settings.powerBi.title', translate: true, href: '/settings/power-bi' },
]

const state = reactive({
    error: {} as Error,
    isLoading: false,
    rawToken: '' as string,
    status: { enabled: false, last4: null as string | null, created_at: null as string | null, feeds: {} as Record<string, string> },
    modal: { confirmRevoke: false },
})

const copiedKey = ref('')

// Feed URLs come from the backend without the token; append it so the URL is
// copy-paste ready right after generation. Once the raw token is gone (page
// reload), we show the base URL and remind the admin to add their token.
const feedList = computed(() => {
    const feeds = state.status.feeds || {}
    const tokenSuffix = state.rawToken ? `?token=${state.rawToken}` : ''
    return [
        { key: 'economy', label: t('settings.powerBi.feedEconomy'), url: (feeds.coordinator_economy ?? '') + tokenSuffix },
        { key: 'inquiries', label: t('settings.powerBi.feedInquiries'), url: (feeds.inquiries ?? '') + tokenSuffix },
        { key: 'cases', label: t('settings.powerBi.feedCases'), url: (feeds.cases ?? '') + tokenSuffix },
    ]
})

onMounted(() => fetchStatus())

async function fetchStatus() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await powerBiService.getStatus()
        state.status = response?.data ?? state.status
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function generate() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await powerBiService.generateToken()
        const data = response?.data ?? {}
        state.rawToken = data.token ?? ''
        state.status = { enabled: data.enabled, last4: data.last4, created_at: data.created_at, feeds: data.feeds }
        successAlert(`${t('alert.success')}!`, t('settings.powerBi.active'))
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function revoke() {
    state.modal.confirmRevoke = false
    state.error = {}
    state.isLoading = true
    try {
        const response = await powerBiService.revokeToken()
        state.rawToken = ''
        state.status = response?.data ?? { enabled: false, last4: null, created_at: null, feeds: {} }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function copy(value: string, key: string) {
    try {
        await navigator.clipboard.writeText(value)
        copiedKey.value = key
        setTimeout(() => { if (copiedKey.value === key) copiedKey.value = '' }, 1500)
    } catch {
        // clipboard unavailable — no-op
    }
}
</script>
