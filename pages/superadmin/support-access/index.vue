<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>
                    {{ $t('superadmin.supportAccess.pageTitle') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>
            <template #header>
                {{ $t('superadmin.supportAccess.header') }}
            </template>

            <div class="p-1">
                <div class="mb-5">
                    <h1 class="text-[22px] font-semibold text-[#1F2533]">
                        {{ $t('superadmin.supportAccess.header') }}
                    </h1>
                    <p class="text-sm text-[#5C6478] mt-0.5 max-w-3xl">
                        {{ $t('superadmin.supportAccess.subtitle') }}
                    </p>
                </div>

                <Alert type="danger" :text="state.error" v-if="state.error" />

                <div v-if="state.isLoading" class="text-sm text-[#8891A4] py-8 text-center">
                    {{ $t('superadmin.supportAccess.loading') }}
                </div>

                <div v-else-if="state.requests.length === 0"
                    class="bg-white border border-[#EAECF0] rounded-xl shadow-sm px-4 py-10 text-center text-sm text-[#8891A4]">
                    {{ $t('superadmin.supportAccess.empty') }}
                </div>

                <div v-else class="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="bg-[#F8F9FB] text-left text-[11px] font-semibold uppercase tracking-wide text-[#8891A4]">
                                <th class="px-4 py-3">{{ $t('superadmin.supportAccess.table.status') }}</th>
                                <th class="px-4 py-3">{{ $t('superadmin.supportAccess.table.account') }}</th>
                                <th class="px-4 py-3">{{ $t('superadmin.supportAccess.table.company') }}</th>
                                <th class="px-4 py-3">{{ $t('superadmin.supportAccess.table.reason') }}</th>
                                <th class="px-4 py-3">{{ $t('superadmin.supportAccess.table.deadline') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in state.requests" :key="item.uuid" class="border-t border-[#EAECF0]">
                                <td class="px-4 py-3">
                                    <span class="co-badge" :class="badgeClass(item)">
                                        {{ $t('superadmin.supportAccess.status.' + item.status) }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-[#1F2533]">{{ item.user?.name }}</td>
                                <td class="px-4 py-3 text-[#5C6478]">{{ item.company?.name }}</td>
                                <td class="px-4 py-3 text-[#5C6478] max-w-md">
                                    {{ item.reason }}
                                    <span v-if="item.case_reference" class="text-[#8891A4]">
                                        &middot; {{ item.case_reference }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-[#5C6478] whitespace-nowrap">
                                    <!-- To forskellige frister, og hvilken der gælder afhænger
                                         af tilstanden: ventetiden på et svar, eller tiden til
                                         adgangen lukker. Én kolonne, fordi kun én er relevant
                                         ad gangen. -->
                                    <template v-if="item.grants_access_now">
                                        {{ $t('superadmin.supportAccess.table.accessUntil') }}
                                        {{ formatDateTime(item.access_expires_at) }}
                                    </template>
                                    <template v-else-if="item.is_actionable">
                                        {{ $t('superadmin.supportAccess.table.answerBefore') }}
                                        {{ formatDateTime(item.expires_at) }}
                                    </template>
                                    <template v-else>—</template>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { supportAccessService } from '@/components/api/superadmin/SupportAccessService'

/**
 * Hvad vi har spurgt kunderne om, og hvad de har svaret.
 *
 * Ingen handlinger på siden. Anmodningen sendes fra det sted man forsøgte at gå ind, og
 * svaret er kundens - der er ikke noget her vi kan gøre ved den, og en knap der ser ud
 * som om der var, ville være det værste på skærmen.
 */
const runtimeConfig = useRuntimeConfig()

const state = reactive({
    isLoading: true,
    error: '',
    requests: [] as any[],
})

onMounted(() => load())

async function load() {
    state.isLoading = true
    state.error = ''

    try {
        const response = await supportAccessService.getRequests()
        state.requests = response?.data ?? []
    } catch (error: any) {
        state.error = error?.message ?? error
    } finally {
        state.isLoading = false
    }
}

function badgeClass(item: any): string {
    if (item.grants_access_now) return 'co-badge-green'
    if (item.is_actionable) return 'co-badge-blue'
    if (item.status === 'denied' || item.status === 'revoked') return 'co-badge-red'

    return 'co-badge-gray'
}

function formatDateTime(value: string | null): string {
    if (!value) return '—'

    return new Date(value).toLocaleString('da-DK', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
}
</script>
