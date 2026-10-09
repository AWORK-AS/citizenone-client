<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('settings.dinero.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('settings.dinero.title') }}</template>

            <LoadingSpinner :isActive="state.isLoading">
                <div class="mt-8 max-w-3xl space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <p class="text-sm text-slate-500">{{ $t('settings.dinero.subtitle') }}</p>

                    <Alert v-if="!isAdmin" type="info" :text="$t('settings.dinero.adminOnly')" />

                    <!-- App not purchased -->
                    <div v-if="!state.status.app_active"
                        class="rounded-xl border border-dashed border-surface-200 bg-surface-50 p-8 text-center">
                        <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-[#eafaf2] text-[#1a7a5e]">
                            <Icon name="ph:lock-key" class="size-6" />
                        </div>
                        <p class="mt-3 text-sm text-slate-500">{{ $t('settings.dinero.notPurchased') }}</p>
                        <div class="mt-4 flex justify-center">
                            <FormButton buttonStyle="primary" @click="navigateTo('/apps')">
                                <Icon name="ph:storefront" class="h-4 w-4" />
                                {{ $t('settings.dinero.goToApps') }}
                            </FormButton>
                        </div>
                    </div>

                    <!-- Connection card -->
                    <div v-else class="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
                        <div class="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <p class="text-xs uppercase tracking-wide text-slate-400">{{ $t('settings.dinero.connection') }}</p>
                                <div class="mt-1 flex items-center gap-2">
                                    <span class="size-2.5 rounded-full" :class="state.status.connected ? 'bg-[#1f9d6b]' : 'bg-slate-300'"></span>
                                    <span class="font-semibold text-slate-900">
                                        {{ state.status.connected ? $t('settings.dinero.connected') : $t('settings.dinero.notConnected') }}
                                    </span>
                                    <span v-if="state.status.organization?.organization_name" class="text-xs text-slate-400">
                                        · {{ state.status.organization.organization_name }}
                                    </span>
                                </div>
                            </div>
                            <div class="flex items-center gap-2" v-if="isAdmin && state.status.connected">
                                <FormButton buttonStyle="danger" @click="state.modal.confirmDisconnect = true">
                                    <Icon name="ph:plugs" class="h-4 w-4" />
                                    {{ $t('settings.dinero.disconnect') }}
                                </FormButton>
                            </div>
                        </div>

                        <!-- Credentials form -->
                        <form v-if="isAdmin && !state.status.connected" class="mt-4 space-y-3" @submit.prevent="connect">
                            <div class="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label class="block text-xs font-medium text-slate-500 mb-1">{{ $t('settings.dinero.clientIdLabel') }}</label>
                                    <input v-model="form.clientId" type="text" autocomplete="off"
                                        class="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm"
                                        :placeholder="$t('settings.dinero.clientIdPlaceholder')" />
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-slate-500 mb-1">{{ $t('settings.dinero.clientSecretLabel') }}</label>
                                    <input v-model="form.clientSecret" type="password" autocomplete="off"
                                        class="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm"
                                        :placeholder="$t('settings.dinero.clientSecretPlaceholder')" />
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-slate-500 mb-1">{{ $t('settings.dinero.apiKeyLabel') }}</label>
                                <input v-model="form.apiKey" type="password" autocomplete="off"
                                    class="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm"
                                    :placeholder="$t('settings.dinero.apiKeyPlaceholder')" />
                            </div>
                            <FormButton buttonStyle="primary" type="submit" :disabled="!form.clientId || !form.clientSecret || !form.apiKey">
                                <Icon name="ph:plug" class="h-4 w-4" />
                                {{ $t('settings.dinero.connect') }}
                            </FormButton>
                        </form>
                    </div>

                    <!-- How-to -->
                    <div v-if="state.status.app_active && !state.status.connected" class="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
                        <h3 class="text-sm font-semibold text-slate-900 mb-3">{{ $t('settings.dinero.howTitle') }}</h3>
                        <ol class="space-y-2 text-sm text-slate-600 list-decimal pl-5">
                            <li>{{ $t('settings.dinero.how1') }}</li>
                            <li>{{ $t('settings.dinero.how2') }}</li>
                            <li>{{ $t('settings.dinero.how3') }}</li>
                        </ol>
                    </div>
                </div>
            </LoadingSpinner>

            <DialogConfirmation :isModalOpen="state.modal.confirmDisconnect"
                :message="$t('settings.dinero.confirmDisconnect')"
                @close="state.modal.confirmDisconnect = false" @confirm="disconnect" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { dineroService } from '@/components/api/user/DineroService'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { t } = useI18n()

const isAdmin = computed(() => userStore.getUser?.roles?.some((r: any) => r.name === 'Admin'))

const breadcrumbLinks = [
    { name: 'settings.dinero.title', translate: true, href: '/settings/dinero' },
]

const state = reactive({
    error: {} as Error,
    isLoading: false,
    status: { app_active: false, connected: false, connected_at: null as string | null, organization: null as any },
    modal: { confirmDisconnect: false },
})

const form = reactive({ clientId: '', clientSecret: '', apiKey: '' })

onMounted(() => {
    fetchStatus()
})

async function fetchStatus() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await dineroService.getStatus()
        state.status = response?.data ?? state.status
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function connect() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await dineroService.connect(form.clientId, form.clientSecret, form.apiKey)
        state.status = response?.data ?? state.status
        if (state.status.connected) {
            form.clientId = ''
            form.clientSecret = ''
            form.apiKey = ''
        }
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
        const response = await dineroService.disconnect()
        state.status = response?.data ?? state.status
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
