<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>
                    {{ $t('superadmin.licenses.pageTitle') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>
            <template #header>
                {{ $t('superadmin.licenses.header') }}
            </template>

            <div class="p-1">
                <ModulesSuperadminPageHeader :title="$t('superadmin.licenses.header')"
                    :subtitle="$t('superadmin.licenses.subtitle')">
                    <template #actions>
                    <NuxtLink to="/superadmin/apps"
                        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm bg-tertiary">
                        <Icon name="ph:plus" class="w-4 h-4" />
                        {{ $t('superadmin.licenses.newLicense') }}
                    </NuxtLink>
                    </template>
                </ModulesSuperadminPageHeader>

                <!-- Info banner -->
                <div
                    class="flex items-start gap-3 px-4 py-3.5 bg-info-soft border border-accent/20 rounded-xl mb-6 text-[13px] text-tertiary">
                    <Icon name="ph:info" class="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>
                        <span class="font-semibold">{{ $t('superadmin.licenses.licenseModelLabel') }}:</span>
                        {{ $t('superadmin.licenses.licenseModelDesc') }}
                    </p>
                </div>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <!-- Loading -->
                <div v-if="state.isLoading" class="flex justify-center py-16">
                    <Icon name="ph:spinner" class="w-7 h-7 text-accent animate-spin" />
                </div>

                <!-- No apps -->
                <div v-else-if="!state.apps.length" class="flex flex-col items-center gap-3 py-16 text-ink-muted">
                    <Icon name="ph:squares-four" class="w-12 h-12 opacity-30" />
                    <p class="text-sm">
                        {{ $t('superadmin.licenses.noAppsFound') }}
                    </p>
                    <p class="text-xs">
                        {{ $t('superadmin.licenses.noAppsFoundSub') }}
                    </p>
                </div>

                <!-- Apps list -->
                <div v-else class="bg-white border border-line rounded-xl shadow-sm overflow-hidden">
                    <div v-for="app in state.apps" :key="app.uuid ?? app.id"
                        class="flex items-center justify-between px-5 py-4 border-b border-surface-canvas last:border-0 hover:bg-surface-subtle transition-colors">
                        <div class="flex items-center gap-3 flex-1 min-w-0">
                            <!-- App icon squares -->
                            <div class="grid grid-cols-2 gap-0.5 w-7 h-7 flex-shrink-0">
                                <div class="rounded-sm bg-accent"></div>
                                <div class="rounded-sm bg-tertiary"></div>
                                <div class="rounded-sm bg-tertiary"></div>
                                <div class="rounded-sm bg-accent"></div>
                            </div>
                            <div class="min-w-0">
                                <div class="flex items-center gap-2">
                                    <p class="text-[14px] font-semibold text-ink truncate">{{ app.name }}</p>
                                    <span v-if="app.is_active === false" class="co-badge co-badge-gray">
                                        {{ $t('superadmin.licenses.inactive') }}
                                    </span>
                                </div>
                                <p v-if="app.category?.name" class="text-[11px] text-ink-muted">
                                    {{ app.category.name }}
                                </p>
                            </div>
                        </div>

                        <div class="text-right flex-shrink-0 mr-6">
                            <p class="text-[14px] font-bold text-ink">
                                {{ priceLabel(app) }}
                            </p>
                        </div>

                        <button @click="openGrantModal(app)"
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-tertiary border border-accent/30 bg-accent-soft hover:bg-tertiary-soft transition-colors flex-shrink-0">
                            <Icon name="ph:plus" class="w-3.5 h-3.5" />
                            {{ $t('superadmin.grantLicense.grantButton') }}
                        </button>
                    </div>
                </div>
            </div>

            <ModulesSuperadminCompanyModalGrantApplicationLicense :open="state.grantModalOpen"
                :preselectedApplicationUuid="state.grantApp?.uuid ?? state.grantApp?.id"
                @close="state.grantModalOpen = false" @granted="state.grantModalOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { appService } from '@/components/api/superadmin/AppService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()

const state = reactive({
    apps: [] as any[],
    error: {} as Error,
    grantApp: null as any,
    grantModalOpen: false,
    isLoading: false,
})

onMounted(() => {
    fetchApps()
})

async function fetchApps() {
    state.isLoading = true
    try {
        const response = await appService.getApplications()
        state.apps = Array.isArray(response) ? response : (response?.data ?? [])
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function priceLabel(app: any) {
    if (app.is_one_time_fee) {
        return formatAmount(app.price ?? 0, 'DKK')
    }
    return `${formatAmount(app.yearly_price ?? 0, 'DKK')}/yr`
}

function openGrantModal(app: any) {
    state.grantApp = app
    state.grantModalOpen = true
}
</script>

<style scoped>
.co-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 7px;
    border-radius: 999px;
    font-weight: 600;
    white-space: nowrap;
    font-size: 10px
}

.co-badge-gray {
    background: theme('colors.surface.canvas');
    color: theme('colors.ink.body')
}
</style>
