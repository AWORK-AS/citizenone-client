<template>
    <div>
        <NuxtLayout name="superadmin">
            <Head>
                <Title>Dashboard - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>Instrumentbræt</template>

            <div class="p-1 space-y-5">

                <!-- Header -->
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-[22px] font-bold text-[#1F2533]">Instrumentbræt</h1>
                        <p class="text-sm text-[#5C6478] mt-0.5 capitalize">{{ formattedDate }}</p>
                    </div>
                    <button @click="navigateTo('/superadmin/companies/new')"
                        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors shadow-sm"
                        style="background:#205E77">
                        <Icon name="ph:plus" class="w-4 h-4" />
                        Ny virksomhed
                    </button>
                </div>

                <!-- Row 1: 4 stat cards matching Obiyen -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <!-- Klienter -->
                    <div @click="navigateTo('/superadmin/companies')"
                        class="co-stat-card cursor-pointer hover:shadow-md transition-shadow" style="--accent:#42AED9">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="co-stat-label">Klienter</p>
                                <p class="co-stat-value">{{ state.totalCompanies }}</p>
                                <p class="co-stat-sub">Aktive virksomheder</p>
                            </div>
                            <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style="background:#E4F1F6">
                                <Icon name="ph:buildings" class="w-5 h-5 text-[#205E77]" />
                            </div>
                        </div>
                    </div>

                    <!-- Betalende -->
                    <div @click="navigateTo('/superadmin/companies?paying=true')"
                        class="co-stat-card cursor-pointer hover:shadow-md transition-shadow" style="--accent:#2E9E33">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="co-stat-label">Betalende</p>
                                <p class="co-stat-value text-[#2E9E33]">{{ state.payingCompanies }}</p>
                                <p class="co-stat-sub">Aktive abonnenter</p>
                            </div>
                            <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style="background:#EDF7EE">
                                <Icon name="ph:currency-circle-dollar" class="w-5 h-5 text-[#2E9E33]" />
                            </div>
                        </div>
                    </div>

                    <!-- Brugere -->
                    <div class="co-stat-card" style="--accent:#368F8B">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="co-stat-label">Brugere</p>
                                <p class="co-stat-value">{{ state.usersWithLicenses }}</p>
                                <p class="co-stat-sub">Registrerede brugere</p>
                            </div>
                            <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style="background:#EEF8F8">
                                <Icon name="ph:users-three" class="w-5 h-5 text-[#368F8B]" />
                            </div>
                        </div>
                    </div>

                    <!-- Fakturaer -->
                    <div @click="navigateTo('/superadmin/invoices')"
                        class="co-stat-card cursor-pointer hover:shadow-md transition-shadow" style="--accent:#368F8B">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="co-stat-label">Fakturaer</p>
                                <p class="co-stat-value">{{ state.totalActiveLicenses }}</p>
                                <p class="co-stat-sub">Aktive licenser</p>
                            </div>
                            <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style="background:#EEF8F8">
                                <Icon name="ph:invoice" class="w-5 h-5 text-[#368F8B]" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Row 2: small licence stats -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-sm">
                        <p class="co-stat-label">Brugere med licenser</p>
                        <p class="text-[22px] font-bold text-[#1F2533] mt-1">{{ state.usersWithLicenses }}</p>
                    </div>
                    <div class="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-sm">
                        <p class="co-stat-label">Aktive licenser</p>
                        <p class="text-[22px] font-bold text-[#1F2533] mt-1">{{ state.totalActiveLicenses }}</p>
                    </div>
                    <div class="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-sm">
                        <p class="co-stat-label">Ubrugte licenser</p>
                        <p class="text-[22px] font-bold text-[#1F2533] mt-1">{{ state.unusedLicenses }}</p>
                    </div>
                    <div class="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-sm">
                        <p class="co-stat-label">Shared CitizenOne</p>
                        <p class="text-[22px] font-bold text-[#1F2533] mt-1">{{ state.sharedCitizenOne }}</p>
                    </div>
                </div>

                <!-- Row 3: recent companies + right column -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    <!-- Seneste virksomheder (2/3) -->
                    <div class="lg:col-span-2 bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden">
                        <div class="flex items-center justify-between px-5 py-4 border-b border-[#EAECF0]">
                            <h2 class="text-[13px] font-semibold text-[#1F2533]">Seneste virksomheder</h2>
                            <button @click="navigateTo('/superadmin/companies')"
                                class="text-[12px] text-[#42AED9] hover:underline flex items-center gap-1">
                                Se alle <Icon name="ph:arrow-right" class="w-3 h-3" />
                            </button>
                        </div>
                        <div v-if="state.isLoading" class="flex justify-center py-10">
                            <Icon name="ph:spinner" class="w-6 h-6 text-[#42AED9] animate-spin" />
                        </div>
                        <div v-else-if="!state.recentCompanies.length"
                            class="flex flex-col items-center gap-2 py-10 text-[#8891A4]">
                            <Icon name="ph:buildings" class="w-10 h-10 opacity-30" />
                            <p class="text-sm">Ingen virksomheder endnu</p>
                        </div>
                        <div v-else>
                            <div v-for="(company, i) in state.recentCompanies" :key="i"
                                class="flex items-center justify-between px-5 py-3.5 border-b border-[#F5F6F8] last:border-0 hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                                @click="navigateTo(`/superadmin/companies/${company.uuid}/accounts`)">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                                        :style="`background:${avatarColor(company.name)}`">
                                        {{ initials(company.name) }}
                                    </div>
                                    <div>
                                        <p class="text-[13px] font-semibold text-[#1F2533]">{{ company.name || '—' }}</p>
                                        <p class="text-[11px] text-[#8891A4]">{{ company.email || company.phone || '' }}</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span v-if="company.is_active"
                                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EDF7EE] text-[#2E9E33]">
                                        <span class="w-1.5 h-1.5 rounded-full bg-[#2E9E33]"></span>
                                        Aktiv
                                    </span>
                                    <span v-else
                                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF0F0] text-[#CC3B2D]">
                                        <span class="w-1.5 h-1.5 rounded-full bg-[#CC3B2D]"></span>
                                        Inaktiv
                                    </span>
                                    <Icon name="ph:caret-right" class="w-3.5 h-3.5 text-[#D5D9E2]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right column: revenue + storage -->
                    <div class="space-y-4">
                        <!-- Revenue -->
                        <div class="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm">
                            <div class="flex items-center justify-between mb-3">
                                <h2 class="text-[13px] font-semibold text-[#1F2533]">Omsætning</h2>
                            </div>
                            <div class="flex gap-1.5 mb-3">
                                <input type="date" v-model="state.revenueDateFrom"
                                    class="text-xs border border-[#EAECF0] rounded-lg px-2 py-1.5 text-[#5C6478] bg-white outline-none focus:border-[#42AED9] flex-1 transition-colors"
                                    @change="fetchDashboard" />
                                <input type="date" v-model="state.revenueDateTo"
                                    class="text-xs border border-[#EAECF0] rounded-lg px-2 py-1.5 text-[#5C6478] bg-white outline-none focus:border-[#42AED9] flex-1 transition-colors"
                                    @change="fetchDashboard" />
                            </div>
                            <p class="text-[24px] font-bold text-[#1F2533]">
                                {{ formatAmount(state.revenue) }}
                            </p>
                            <p class="text-[11px] text-[#8891A4] mt-0.5">ekskl. moms</p>
                        </div>

                        <!-- Storage -->
                        <div class="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm">
                            <h2 class="text-[13px] font-semibold text-[#1F2533] mb-3">Virksomhedslager</h2>
                            <div v-if="!state.companyStorage?.length" class="text-[12px] text-[#8891A4]">
                                Ingen virksomheder endnu
                            </div>
                            <div v-else class="space-y-3">
                                <div v-for="(s, i) in state.companyStorage.slice(0, 5)" :key="i">
                                    <div class="flex items-center justify-between text-[12px] mb-1">
                                        <span class="text-[#1F2533] font-medium truncate max-w-[140px]">{{ s.name }}</span>
                                        <span class="text-[#8891A4] ml-2">{{ s.used_storage ?? 0 }} GB</span>
                                    </div>
                                    <div class="h-1.5 bg-[#F5F6F8] rounded-full overflow-hidden">
                                        <div class="h-full rounded-full transition-all" style="background:#42AED9;opacity:0.6"
                                            :style="`width:${Math.min(100, ((s.used_storage ?? 0) / 10) * 100)}%`"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { dashboardService } from '@/components/api/superadmin/DashboardService'
import { companyService } from '@/components/api/superadmin/CompanyService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()

const formattedDate = computed(() =>
    new Date().toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
)

const COLORS = ['#205E77','#2E9E33','#368F8B','#1A4D99','#D4900A','#9B4D9B']
const avatarColor = (name: string) => COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length]
const initials = (name: string) => (name || '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

const state = reactive({
    totalCompanies: 0,
    payingCompanies: 0,
    nonPayingCompanies: 0,
    usersWithLicenses: 0,
    totalActiveLicenses: 0,
    unusedLicenses: 0,
    sharedCitizenOne: 0,
    revenue: 0,
    companyStorage: [] as any[],
    recentCompanies: [] as any[],
    revenueDateFrom: moment().format('YYYY-MM-DD'),
    revenueDateTo: moment().format('YYYY-MM-DD'),
    isLoading: false,
    error: {} as any,
})

onMounted(() => {
    fetchDashboard()
    fetchRecentCompanies()
})

async function fetchDashboard() {
    try {
        const response = await dashboardService.getDashboardData({
            date: { start_date: state.revenueDateFrom, end_date: state.revenueDateTo }
        })
        if (response) {
            state.totalCompanies      = response?.data?.total_companies ?? 0
            state.payingCompanies     = response?.data?.paying_companies ?? 0
            state.nonPayingCompanies  = response?.data?.non_paying_companies ?? 0
            state.usersWithLicenses   = response?.data?.users_with_licenses ?? 0
            state.totalActiveLicenses = response?.data?.total_active_licenses ?? 0
            state.unusedLicenses      = response?.data?.unused_licenses ?? 0
            state.sharedCitizenOne    = response?.data?.shared_citizen ?? 0
            state.revenue             = response?.data?.total_revenue ?? 0
            state.companyStorage      = response?.data?.company_storage ?? []
        }
    } catch (e: any) { state.error = e }
}

async function fetchRecentCompanies() {
    state.isLoading = true
    try {
        const response = await companyService.getCompanies({ page: 1, sortField: 'id', sortOrder: 'descend' })
        if (response) state.recentCompanies = response?.data?.slice(0, 8) ?? []
    } catch (_) {}
    state.isLoading = false
}
</script>

<style scoped>
.co-stat-card {
    background: white;
    border: 1px solid #EAECF0;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    position: relative;
    overflow: hidden;
}
.co-stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    border-radius: 12px 12px 0 0;
    background: var(--accent, #42AED9);
}
.co-stat-label {
    font-size: 10px;
    font-weight: 700;
    color: #8891A4;
    text-transform: uppercase;
    letter-spacing: 0.07em;
}
.co-stat-value {
    font-size: 28px;
    font-weight: 800;
    color: #1F2533;
    line-height: 1;
    margin-top: 6px;
}
.co-stat-sub {
    font-size: 11px;
    color: #8891A4;
    margin-top: 4px;
}
</style>
