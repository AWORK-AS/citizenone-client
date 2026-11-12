<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.companyHeader.tabs.meetings') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.companyHeader.tabs.meetings') }}</template>

            <div class="p-1 space-y-4">
                <ModulesSuperadminCompanyHeader />

                <p class="text-[13px] text-ink-muted max-w-3xl">{{ $t('superadmin.salesMeetings.customerIntro') }}</p>

                <ModulesSuperadminSalesMeetingsPanel :companyUuid="companyUuid" :canPlan="can('manage_companies')"
                    :defaultTitle="`CitizenOne · ${summary?.name ?? ''}`" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
/**
 * Superadmin: our own online meetings with this customer. We host them in
 * CitizenOne's own account and the customer's people get a link by email;
 * it has nothing to do with the Meetings app the customer may have bought.
 */
import { usePermissions } from '@/composables/usePermissions'
import { useCompanySummary } from '@/composables/useCompanySummary'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { can } = usePermissions()
const companyUuid = String(route.params.company_uuid ?? '')
const { summary } = useCompanySummary(computed(() => companyUuid))
</script>
