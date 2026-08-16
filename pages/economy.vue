<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('economy.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('economy.title') }}</template>

            <div class="space-y-5">
                <!-- Three questions in one place: how is it going, what have we
                     earned, and what has to go out. They used to be three
                     addresses, and nobody could say which one they wanted. -->
                <nav class="border-b border-gray-200" v-if="tabs.length > 1">
                    <div class="-mb-px flex gap-6 overflow-x-auto">
                        <button type="button" v-for="tab in tabs" :key="tab.value" @click="setTab(tab.value)" :class="[
                            'whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition',
                            state.tab === tab.value
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        ]">
                            {{ tab.label }}
                        </button>
                    </div>
                </nav>

                <ModulesUserEconomyOverview v-if="state.tab === 'overview'" />
                <ModulesUserEconomyRevenue v-else-if="state.tab === 'revenue'" />
                <ModulesUserEconomyBilling v-else-if="state.tab === 'billing'" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const route = useRoute()
const { t } = useI18n()

const breadcrumbLinks = [{ name: 'economy.title', translate: true, href: '/economy' }]

const state = reactive({
    tab: (route.query.tab as string) || '',
})

const industry = computed(() => userStore.getUser?.company?.industry?.system_name)

// Company-level module enablement: no list means every module is on.
const modulePages = computed(() => userStore.getUser?.company?.module_pages)

function hasModule(name: string): boolean {
    const pages = modulePages.value

    return !Array.isArray(pages) || pages.length === 0 || pages.includes(name)
}

// A tab only exists where the figures behind it do, so the area never shows a
// page that would come back empty.
const tabs = computed(() => {
    const available: Array<{ value: string; label: string }> = []

    if (industry.value === 'social_welfare'
        && userStore.getUser?.pages?.some((page: any) => page.name === 'Management & Economy')) {
        available.push({ value: 'overview', label: t('economy.tabs.overview') })
    }

    if (industry.value === 'employment_services') {
        if (hasModule('Revenue report')) {
            available.push({ value: 'revenue', label: t('economy.tabs.revenue') })
        }

        if (hasModule('Billing')) {
            available.push({ value: 'billing', label: t('economy.tabs.billing') })
        }
    }

    return available
})

function setTab(tab: string) {
    state.tab = tab
    navigateTo({ path: '/economy', query: { tab } })
}

// An address without a tab lands on the first one the company actually has.
watch(tabs, (available: any[]) => {
    if (!available.length) return

    if (!available.some((tab: any) => tab.value === state.tab)) {
        state.tab = available[0].value
    }
}, { immediate: true })
</script>
