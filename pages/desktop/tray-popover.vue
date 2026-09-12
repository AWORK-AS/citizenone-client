<template>
    <div class="w-screen h-screen bg-white flex flex-col overflow-hidden">
        <div class="app-drag-region flex items-center gap-2 px-4 h-11 shrink-0 border-b border-gray-100">
            <img src="/img/icons/asset-app.png" alt="CitizenOne" class="h-5 w-5 object-contain" />
            <span class="text-sm font-semibold text-gray-800">CitizenOne™</span>
        </div>

        <div class="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            <div v-if="isLoading" class="text-center text-xs text-gray-400 py-8">
                {{ $t('desktopTrayPopover.loading') }}
            </div>
            <template v-else>
                <button type="button" @click="go('/overview')"
                    class="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-colors text-left">
                    <div class="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center shrink-0">
                        <Icon name="heroicons:calendar-days" class="h-4 w-4 text-sky-500" />
                    </div>
                    <span class="text-sm text-gray-700">{{ $t('desktopTrayPopover.appointmentsToday', { count: appointmentsToday }) }}</span>
                </button>
                <button type="button" @click="go('/overview')"
                    class="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-colors text-left">
                    <div class="w-8 h-8 rounded-full bg-secondary-50 flex items-center justify-center shrink-0">
                        <Icon name="ph:cake" class="h-4 w-4 text-secondary" />
                    </div>
                    <span class="text-sm text-gray-700">{{ $t('desktopTrayPopover.birthdaysToday', { count: birthdaysToday }) }}</span>
                </button>
                <button type="button" @click="go('/messages')"
                    class="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-colors text-left">
                    <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon name="ph:chat-circle" class="h-4 w-4 text-primary" />
                    </div>
                    <span class="text-sm text-gray-700">{{ $t('desktopTrayPopover.openMessages') }}</span>
                </button>
                <p v-if="appointmentsToday === 0 && birthdaysToday === 0" class="text-xs text-gray-400 text-center pt-2">
                    {{ $t('desktopTrayPopover.allCalm') }}
                </p>
            </template>
        </div>

        <div class="border-t border-gray-100 px-4 py-2 shrink-0">
            <button type="button" @click="go('/overview')"
                class="w-full rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-700 transition-colors">
                {{ $t('desktopTrayPopover.openApp') }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { useDepartmentStore } from '@/store/department'

definePageMeta({ layout: false })

const departmentStore = useDepartmentStore()
const isLoading = ref(true)
const appointmentsToday = ref(0)
const birthdaysToday = ref(0)

function go(path: string) {
    ;(window as any).citizenOneDesktop?.navigate(`citizenone://${path.replace(/^\//, '')}`)
}

onMounted(async () => {
    const today = moment().format('YYYY-MM-DD')
    const department = departmentStore.getSelectedDepartmentName
    try {
        const [events, birthdays] = await Promise.all([
            dailyOverviewService.getCitizenDailyEvents({ department, start_date: today, end_date: today }),
            dailyOverviewService.getUpcomingBirthdays({ department }),
        ])
        appointmentsToday.value = events?.data?.length ?? 0
        birthdaysToday.value = (birthdays?.data ?? []).filter((b: any) => b.days_until === 0).length
    } catch {
        // Silent - this is a glance-only popover, never worth an error state.
    } finally {
        isLoading.value = false
    }
})
</script>
