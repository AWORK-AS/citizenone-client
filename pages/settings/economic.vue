<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('settings.economic.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('settings.economic.title') }}</template>

            <ModulesUserSettingsTab />

            <LoadingSpinner :isActive="state.isLoading">
                <div class="mt-8 max-w-3xl space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <p class="text-sm text-slate-500">{{ $t('settings.economic.subtitle') }}</p>

                    <Alert v-if="!isAdmin" type="info" :text="$t('settings.economic.adminOnly')" />

                    <!-- App not purchased -->
                    <div v-if="!state.status.app_active"
                        class="rounded-xl border border-dashed border-surface-200 bg-surface-50 p-8 text-center">
                        <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-[#eafaf2] text-[#1a7a5e]">
                            <Icon name="ph:lock-key" class="size-6" />
                        </div>
                        <p class="mt-3 text-sm text-slate-500">{{ $t('settings.economic.notPurchased') }}</p>
                        <div class="mt-4 flex justify-center">
                            <FormButton buttonStyle="primary" @click="navigateTo('/apps')">
                                <Icon name="ph:storefront" class="h-4 w-4" />
                                {{ $t('settings.economic.goToApps') }}
                            </FormButton>
                        </div>
                    </div>

                    <!-- Connection card -->
                    <div v-else class="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
                        <div class="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <p class="text-xs uppercase tracking-wide text-slate-400">{{ $t('settings.economic.connection') }}</p>
                                <div class="mt-1 flex items-center gap-2">
                                    <span class="size-2.5 rounded-full" :class="state.status.connected ? 'bg-[#1f9d6b]' : 'bg-slate-300'"></span>
                                    <span class="font-semibold text-slate-900">
                                        {{ state.status.connected ? $t('settings.economic.connected') : $t('settings.economic.notConnected') }}
                                    </span>
                                    <span v-if="state.status.agreement?.company_name" class="text-xs text-slate-400">
                                        · {{ state.status.agreement.company_name }}
                                    </span>
                                </div>
                            </div>
                            <div class="flex items-center gap-2" v-if="isAdmin">
                                <FormButton v-if="!state.status.connected" buttonStyle="primary" @click="connect">
                                    <Icon name="ph:plug" class="h-4 w-4" />
                                    {{ $t('settings.economic.connect') }}
                                </FormButton>
                                <template v-else>
                                    <FormButton buttonStyle="action" @click="connect">
                                        <Icon name="ph:arrows-clockwise" class="h-4 w-4" />
                                        {{ $t('settings.economic.reconnect') }}
                                    </FormButton>
                                    <FormButton buttonStyle="danger" @click="state.modal.confirmDisconnect = true">
                                        <Icon name="ph:plugs" class="h-4 w-4" />
                                        {{ $t('settings.economic.disconnect') }}
                                    </FormButton>
                                </template>
                            </div>
                        </div>
                    </div>

                    <!-- How-to -->
                    <div v-if="state.status.app_active" class="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
                        <h3 class="text-sm font-semibold text-slate-900 mb-3">{{ $t('settings.economic.howTitle') }}</h3>
                        <ol class="space-y-2 text-sm text-slate-600 list-decimal pl-5">
                            <li>{{ $t('settings.economic.how1') }}</li>
                            <li>{{ $t('settings.economic.how2') }}</li>
                            <li>{{ $t('settings.economic.how3') }}</li>
                        </ol>
                    </div>
                </div>
            </LoadingSpinner>

            <DialogConfirmation :isModalOpen="state.modal.confirmDisconnect"
                :message="$t('settings.economic.confirmDisconnect')"
                @close="state.modal.confirmDisconnect = false" @confirm="disconnect" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { economicService } from '@/components/api/user/EconomicService'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const route = useRoute()
const { successAlert } = useAlert()
const { t } = useI18n()

const isAdmin = computed(() => userStore.getUser?.roles?.some((r: any) => r.name === 'Admin'))

const breadcrumbLinks = [
    { name: 'settings.economic.title', translate: true, href: '/settings/economic' },
]

const state = reactive({
    error: {} as Error,
    isLoading: false,
    status: { app_active: false, connected: false, connected_at: null as string | null, agreement: null as any },
    modal: { confirmDisconnect: false },
})

onMounted(() => {
    // Returning from the e-conomic App Connect flow.
    if (route.query.connected === '1') successAlert(`${t('alert.success')}!`, t('settings.economic.connected'))
    fetchStatus()
})

async function fetchStatus() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await economicService.getStatus()
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
        const response = await economicService.connect()
        const url = response?.data?.url
        if (url) {
            // Hand off to e-conomic's App Connect grant flow.
            window.location.href = url
        }
    } catch (error: any) {
        state.error = error
        state.isLoading = false
    }
}

async function disconnect() {
    state.modal.confirmDisconnect = false
    state.error = {}
    state.isLoading = true
    try {
        const response = await economicService.disconnect()
        state.status = response?.data ?? state.status
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
