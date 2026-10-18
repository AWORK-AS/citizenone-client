<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.nps.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.nps.title') }}</template>

            <div class="p-1 space-y-5">
                <div>
                    <h1 class="text-[22px] font-bold text-[#1F2533]">{{ $t('superadmin.nps.title') }}</h1>
                    <p class="text-sm text-[#5C6478] mt-0.5">{{ $t('superadmin.nps.subtitle') }}</p>
                </div>

                <LoadingSpinner :isActive="loading">
                    <!-- Tallene -->
                    <div class="grid grid-cols-2 gap-3 lg:grid-cols-5">
                        <div v-for="tile in tiles" :key="tile.key" class="bg-white border border-[#EAECF0] rounded-xl p-4">
                            <p class="text-[12px] font-medium text-[#8891A4]">{{ $t(`superadmin.nps.${tile.key}`) }}</p>
                            <p class="text-[24px] font-bold text-[#1F2533] mt-1 tabular-nums">{{ tile.value }}</p>
                        </div>
                    </div>

                    <!-- Svarene -->
                    <div class="mt-5 bg-white border border-[#EAECF0] rounded-xl overflow-hidden">
                        <p v-if="!responses.length" class="p-8 text-center text-sm text-[#8891A4]">{{ $t('superadmin.nps.empty') }}</p>
                        <table v-else class="w-full text-sm">
                            <thead class="bg-[#F9FAFB] text-left text-[12px] text-[#5C6478]">
                                <tr>
                                    <th class="px-4 py-3 font-medium">{{ $t('superadmin.nps.score') }}</th>
                                    <th class="px-4 py-3 font-medium">{{ $t('superadmin.nps.company') }}</th>
                                    <th class="px-4 py-3 font-medium">{{ $t('superadmin.nps.comment') }}</th>
                                    <th class="px-4 py-3 font-medium">{{ $t('superadmin.nps.reviewClicked') }}</th>
                                    <th class="px-4 py-3 font-medium">{{ $t('superadmin.nps.date') }}</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-[#EAECF0]">
                                <tr v-for="row in responses" :key="row.uuid" class="align-top">
                                    <td class="px-4 py-3">
                                        <span class="inline-flex items-center gap-2 font-semibold text-[#1F2533] tabular-nums">
                                            <span class="size-2.5 rounded-full" :class="BAND_DOT[npsBand(row.score)]" aria-hidden="true" />
                                            {{ row.score }}
                                            <span class="font-normal text-[#8891A4]">{{ $t(`superadmin.nps.band.${npsBand(row.score)}`) }}</span>
                                        </span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <NuxtLink v-if="row.company" :to="`/superadmin/companies/${row.company.uuid}/overview`" class="font-medium text-primary hover:underline">{{ row.company.name }}</NuxtLink>
                                        <p class="text-[12px] text-[#8891A4]">{{ row.user?.name }}</p>
                                    </td>
                                    <td class="px-4 py-3 text-[#1F2533] whitespace-pre-line max-w-md">{{ row.comment || '-' }}</td>
                                    <td class="px-4 py-3">{{ row.review_clicked ? $t('superadmin.nps.yes') : '-' }}</td>
                                    <td class="px-4 py-3 text-[#5C6478] whitespace-nowrap">{{ formatDate(row.answered_at) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
// Superadmin: the recommendation score and every answer from the last 90 days.
// The answers come from the in-app question (components/modules/user/nps/prompt.vue).
import { superadminNpsService } from '@/components/api/superadmin/NpsService'
import { npsBand, type NpsBand } from '@/composables/npsPrompt'

const runtimeConfig = useRuntimeConfig()
const loading = ref(true)
const data = ref<any>(null)

const BAND_DOT: Record<NpsBand, string> = { promoter: 'bg-emerald-500', passive: 'bg-amber-400', detractor: 'bg-red-500' }

const responses = computed<any[]>(() => data.value?.responses ?? [])
const tiles = computed(() => [
    { key: 'nps', value: data.value?.nps ?? '-' },
    { key: 'answers', value: data.value?.answers ?? 0 },
    { key: 'promoters', value: data.value?.promoters ?? 0 },
    { key: 'detractors', value: data.value?.detractors ?? 0 },
    { key: 'reviewClicks', value: data.value?.review_clicks ?? 0 },
])

function formatDate(iso: string | null): string {
    return iso ? new Date(iso).toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''
}

onMounted(async () => {
    try {
        const res = await superadminNpsService.overview()
        data.value = res?.data ?? null
    } catch (e) { /* the layout shows the API error */ }
    loading.value = false
})
</script>
