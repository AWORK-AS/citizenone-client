<template>
    <div>
        <NuxtLayout name="user">
            <Head>
                <Title>{{ $t('attendance.monthlyReport') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('attendance.monthlyReport') }}</template>

            <div class="p-1">
                <NuxtLink to="/protocols"
                    class="inline-flex items-center gap-1.5 text-sm text-[#5C6478] hover:text-[#1F2533] mb-5 transition-colors">
                    <Icon name="ph:arrow-left" class="w-4 h-4" />
                    {{ $t('back') }}
                </NuxtLink>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <!-- Month picker -->
                <div class="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm mb-5">
                    <div class="flex flex-wrap items-end gap-4">
                        <div class="flex items-center gap-2">
                            <button @click="prevMonth"
                                class="p-2 rounded-lg border border-[#EAECF0] text-[#5C6478] hover:bg-[#F5F6F8] transition-colors">
                                <Icon name="ph:caret-left" class="w-4 h-4" />
                            </button>
                            <div class="text-sm font-medium text-[#1F2533] min-w-[140px] text-center">
                                {{ monthLabel }}
                            </div>
                            <button @click="nextMonth"
                                class="p-2 rounded-lg border border-[#EAECF0] text-[#5C6478] hover:bg-[#F5F6F8] transition-colors">
                                <Icon name="ph:caret-right" class="w-4 h-4" />
                            </button>
                            <button @click="goToCurrentMonth"
                                class="px-3 py-2 text-xs font-medium rounded-lg border border-[#EAECF0] text-[#5C6478] hover:bg-[#F5F6F8] transition-colors">
                                {{ $t('goToToday') }}
                            </button>
                        </div>
                        <FormButton buttonStyle="primary" @click="fetchReport" :disabled="state.isLoading">
                            <Icon name="ph:chart-bar" class="w-4 h-4" />
                            {{ $t('attendance.generate') }}
                        </FormButton>
                    </div>
                </div>

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="!state.hasFetched"
                        class="bg-white border border-[#EAECF0] rounded-xl p-12 text-center shadow-sm">
                        <Icon name="ph:calendar-check" class="w-12 h-12 text-[#8891A4] opacity-30 mx-auto mb-3" />
                        <p class="text-[#8891A4] text-sm">{{ $t('attendance.selectMonthToGenerate') }}</p>
                    </div>

                    <div v-else-if="!state.rows.length"
                        class="bg-white border border-[#EAECF0] rounded-xl p-12 text-center shadow-sm">
                        <Icon name="ph:calendar-x" class="w-12 h-12 text-[#8891A4] opacity-30 mx-auto mb-3" />
                        <p class="text-[#8891A4] text-sm">{{ $t('attendance.noDataForPeriod') }}</p>
                    </div>

                    <!-- Table -->
                    <div v-else class="space-y-5">
                        <!-- Per-citizen cards -->
                        <div v-for="row in state.rows" :key="row.citizen_uuid"
                            class="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden">
                            <!-- Citizen header -->
                            <div class="flex items-center justify-between px-5 py-3 border-b border-[#EAECF0] bg-[#F9FAFB]">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                                        :style="`background:${avatarColor(row.citizen_name)}`">
                                        {{ initials(row.citizen_name) }}
                                    </div>
                                    <span class="font-semibold text-[#1F2533] text-[14px]">{{ row.citizen_name }}</span>
                                </div>
                                <div class="flex items-center gap-3 text-[12px]">
                                    <span class="co-badge co-badge-green">
                                        ✓ {{ row.attended_count ?? 0 }} ({{ row.attended_pct ?? 0 }}%)
                                    </span>
                                    <span class="co-badge co-badge-red">
                                        ✗ {{ row.absent_count ?? 0 }} ({{ row.absent_pct ?? 0 }}%)
                                    </span>
                                </div>
                            </div>

                            <!-- Protocol rows -->
                            <table class="w-full">
                                <thead>
                                    <tr class="border-b border-[#EAECF0]">
                                        <th class="co-th">{{ $t('attendance.protocol') }}</th>
                                        <th class="co-th text-center">{{ $t('protocols.table.status.attended') }}</th>
                                        <th class="co-th text-center">{{ $t('protocols.table.status.absent') }}</th>
                                        <th class="co-th text-center">{{ $t('attendance.absenceReasons') }}</th>
                                        <th class="co-th text-center">%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="proto in (row.protocols ?? [])" :key="proto.protocol_uuid"
                                        class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors">
                                        <td class="co-td text-[13px] text-[#1F2533] font-medium">
                                            {{ proto.protocol_name }}
                                        </td>
                                        <td class="co-td text-center text-[13px] text-[#2E9E33] font-semibold">
                                            {{ proto.attended ?? 0 }}
                                        </td>
                                        <td class="co-td text-center text-[13px] text-[#CC3B2D] font-semibold">
                                            {{ proto.absent ?? 0 }}
                                        </td>
                                        <td class="co-td text-center text-[13px] text-[#5C6478]">
                                            <span v-if="proto.absence_reasons?.length">
                                                {{ proto.absence_reasons.join(', ') }}
                                            </span>
                                            <span v-else>—</span>
                                        </td>
                                        <td class="co-td text-center text-[13px]"
                                            :class="(proto.attended_pct ?? 0) >= 80 ? 'text-[#2E9E33]' : (proto.attended_pct ?? 0) >= 50 ? 'text-[#D4900A]' : 'text-[#CC3B2D]'">
                                            {{ proto.attended_pct ?? 0 }}%
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { citizenProtocolService } from '@/components/api/user/CitizenProtocolService'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const userStore = useUserStore() as any

onMounted(() => {
    if (userStore.getUser?.company?.industry?.system_name !== 'employment_services') {
        navigateTo('/overview')
    }
})

const currentMonth = ref(moment().startOf('month'))

const monthLabel = computed(() => currentMonth.value.format('MMMM YYYY'))

function prevMonth() { currentMonth.value = currentMonth.value.clone().subtract(1, 'month') }
function nextMonth() { currentMonth.value = currentMonth.value.clone().add(1, 'month') }
function goToCurrentMonth() { currentMonth.value = moment().startOf('month') }

const COLORS = ['#205E77', '#2E9E33', '#368F8B', '#1A4D99', '#D4900A', '#9B4D9B']
const avatarColor = (name: string) => COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length]
const initials = (name: string) =>
    (name || '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

const state = reactive({
    error: {} as Error,
    hasFetched: false,
    isLoading: false,
    rows: [] as any[],
})

async function fetchReport() {
    state.error = {} as Error
    state.isLoading = true
    try {
        const response = await citizenProtocolService.getMonthlyAttendanceReport({
            month_start: currentMonth.value.format('YYYY-MM-DD'),
            month_end: currentMonth.value.clone().endOf('month').format('YYYY-MM-DD'),
        })
        state.rows = response?.data ?? response ?? []
        state.hasFetched = true
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
