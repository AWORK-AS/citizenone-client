<template>
    <div>
        <NuxtLayout name="user">
            <Head>
                <Title>{{ $t('attendance.weeklyReport') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('attendance.weeklyReport') }}</template>

            <div class="p-1">
                <NuxtLink to="/protocols"
                    class="inline-flex items-center gap-1.5 text-sm text-[#5C6478] hover:text-[#1F2533] mb-5 transition-colors">
                    <Icon name="ph:arrow-left" class="w-4 h-4" />
                    {{ $t('back') }}
                </NuxtLink>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <!-- Week picker -->
                <div class="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm mb-5">
                    <div class="flex flex-wrap items-end gap-4">
                        <div class="flex items-center gap-2">
                            <button @click="prevWeek"
                                class="p-2 rounded-lg border border-[#EAECF0] text-[#5C6478] hover:bg-[#F5F6F8] transition-colors">
                                <Icon name="ph:caret-left" class="w-4 h-4" />
                            </button>
                            <div class="text-sm font-medium text-[#1F2533] min-w-[180px] text-center">
                                {{ weekLabel }}
                            </div>
                            <button @click="nextWeek"
                                class="p-2 rounded-lg border border-[#EAECF0] text-[#5C6478] hover:bg-[#F5F6F8] transition-colors">
                                <Icon name="ph:caret-right" class="w-4 h-4" />
                            </button>
                            <button @click="goToCurrentWeek"
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
                        <p class="text-[#8891A4] text-sm">{{ $t('attendance.selectWeekToGenerate') }}</p>
                    </div>

                    <div v-else-if="!state.rows.length"
                        class="bg-white border border-[#EAECF0] rounded-xl p-12 text-center shadow-sm">
                        <Icon name="ph:calendar-x" class="w-12 h-12 text-[#8891A4] opacity-30 mx-auto mb-3" />
                        <p class="text-[#8891A4] text-sm">{{ $t('attendance.noDataForPeriod') }}</p>
                    </div>

                    <div v-else class="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="bg-[#F9FAFB] border-b border-[#EAECF0]">
                                    <th class="co-th sticky left-0 bg-[#F9FAFB] z-10 min-w-[160px]">
                                        {{ $t('attendance.citizen') }}
                                    </th>
                                    <th v-for="day in weekDays" :key="day.date"
                                        class="co-th text-center min-w-[100px]"
                                        :class="day.isToday ? 'bg-[#E4F1F6]' : ''">
                                        <div class="text-[11px] font-bold">{{ day.weekday }}</div>
                                        <div class="text-[11px] font-normal text-[#8891A4]">{{ day.display }}</div>
                                    </th>
                                    <th class="co-th text-center">{{ $t('attendance.total') }}</th>
                                    <th class="co-th text-center">%</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="row in state.rows" :key="row.citizen_uuid"
                                    class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors">
                                    <td class="co-td sticky left-0 bg-white z-10 font-medium text-[#1F2533] text-[13px]">
                                        {{ row.citizen_name }}
                                    </td>
                                    <td v-for="day in weekDays" :key="day.date"
                                        class="co-td text-center"
                                        :class="day.isToday ? 'bg-[#F0F8FC]' : ''">
                                        <span v-if="row.days?.[day.date] === 'attended'"
                                            class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#EDF7EE] text-[#2E9E33] text-[12px] font-bold">
                                            ✓
                                        </span>
                                        <span v-else-if="row.days?.[day.date] === 'absent'"
                                            class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#FFF0F0] text-[#CC3B2D] text-[12px] font-bold"
                                            :title="row.absence_reasons?.[day.date] ?? ''">
                                            ✗
                                        </span>
                                        <span v-else class="text-[#D5D9E2] text-[13px]">—</span>
                                    </td>
                                    <td class="co-td text-center text-[13px] font-semibold text-[#1F2533]">
                                        {{ row.attended_count ?? 0 }}
                                    </td>
                                    <td class="co-td text-center text-[13px]"
                                        :class="(row.attended_pct ?? 0) >= 80 ? 'text-[#2E9E33]' : (row.attended_pct ?? 0) >= 50 ? 'text-[#D4900A]' : 'text-[#CC3B2D]'">
                                        {{ row.attended_pct ?? 0 }}%
                                    </td>
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

const currentWeekStart = ref(moment().startOf('isoWeek'))

const weekDays = computed(() => {
    return Array.from({ length: 7 }, (_, i) => {
        const d = currentWeekStart.value.clone().add(i, 'days')
        return {
            date: d.format('YYYY-MM-DD'),
            weekday: d.format('ddd'),
            display: d.format('D/M'),
            isToday: d.isSame(moment(), 'day'),
        }
    })
})

const weekLabel = computed(() => {
    const start = currentWeekStart.value.format('D. MMM')
    const end = currentWeekStart.value.clone().endOf('isoWeek').format('D. MMM YYYY')
    const week = currentWeekStart.value.isoWeek()
    return `${t('attendance.week')} ${week} · ${start} – ${end}`
})

function prevWeek() { currentWeekStart.value = currentWeekStart.value.clone().subtract(1, 'week') }
function nextWeek() { currentWeekStart.value = currentWeekStart.value.clone().add(1, 'week') }
function goToCurrentWeek() { currentWeekStart.value = moment().startOf('isoWeek') }

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
        const response = await citizenProtocolService.getWeeklyAttendanceReport({
            week_start: currentWeekStart.value.format('YYYY-MM-DD'),
            week_end: currentWeekStart.value.clone().endOf('isoWeek').format('YYYY-MM-DD'),
        })
        state.rows = response?.data ?? response ?? []
        state.hasFetched = true
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
