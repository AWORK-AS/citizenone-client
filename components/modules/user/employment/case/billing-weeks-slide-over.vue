<template>
    <TransitionRoot as="template" :show="props.isOpen">
        <Dialog class="relative z-50" @close="emit('close')">
            <div class="fixed inset-0 bg-black/30" />

            <div class="fixed inset-0 overflow-hidden">
                <div class="absolute inset-0 overflow-hidden">
                    <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
                        <TransitionChild as="template" enter="transform transition ease-in-out duration-300"
                            enter-from="translate-x-full" enter-to="translate-x-0"
                            leave="transform transition ease-in-out duration-200" leave-from="translate-x-0"
                            leave-to="translate-x-full">
                            <DialogPanel class="pointer-events-auto w-screen max-w-[560px]">
                                <div class="flex h-full flex-col bg-white shadow-2xl">

                                    <!-- Header -->
                                    <div class="flex items-start justify-between px-6 py-5 border-b border-[#EAECF0]">
                                        <div>
                                            <DialogTitle class="text-[16px] font-semibold text-[#1F2533]">
                                                {{ $t('employment.billing.billingWeeks') }}
                                            </DialogTitle>
                                            <p class="text-[12px] text-[#8891A4] mt-0.5">
                                                {{ props.selectedCase?.agreement?.name }}
                                            </p>
                                        </div>
                                        <button @click="emit('close')"
                                            class="w-8 h-8 rounded-lg flex items-center justify-center text-[#8891A4] hover:bg-[#F5F6F8] hover:text-[#1F2533] transition-colors">
                                            <Icon name="ph:x" class="w-4 h-4" />
                                        </button>
                                    </div>

                                    <!-- Error -->
                                    <div v-if="state.error?.message" class="px-6 pt-4">
                                        <Alert type="danger" :text="state.error.message" />
                                    </div>

                                    <!-- Content -->
                                    <div class="flex-1 overflow-y-auto px-6 py-5">
                                        <LoadingSpinner :isActive="state.isLoading">

                                            <!-- Empty state -->
                                            <div v-if="!state.isLoading && !state.weeks.length"
                                                class="flex flex-col items-center justify-center py-16 text-center">
                                                <Icon name="ph:calendar-x" class="w-12 h-12 text-[#8891A4] opacity-40 mb-3" />
                                                <p class="text-[#8891A4] text-sm">
                                                    {{ $t('employment.billing.noBillingWeeks') }}
                                                </p>
                                            </div>

                                            <!-- Week list -->
                                            <div v-else class="space-y-2">
                                                <div v-for="week in state.weeks" :key="week.week_start"
                                                    class="flex items-center justify-between px-4 py-3 rounded-xl border transition-colors"
                                                    :class="week.is_excluded
                                                        ? 'border-[#F5C2C7] bg-[#FFF5F5]'
                                                        : 'border-[#EAECF0] bg-white hover:bg-[#F9FAFB]'">

                                                    <!-- Left: week info -->
                                                    <div class="flex items-center gap-3">
                                                        <div class="w-9 h-9 rounded-lg flex items-center justify-center text-[12px] font-bold"
                                                            :class="week.is_excluded
                                                                ? 'bg-[#F5C2C7] text-[#9B1C1C]'
                                                                : 'bg-[#E4F1F6] text-[#205E77]'">
                                                            {{ week.week_number }}
                                                        </div>
                                                        <div>
                                                            <p class="text-[13px] font-medium text-[#1F2533]">
                                                                {{ $t('employment.billing.week') }} {{ week.week_number }}
                                                            </p>
                                                            <p class="text-[11px] text-[#8891A4] mt-0.5">
                                                                {{ formatDateToReadable(week.week_start) }} –
                                                                {{ formatDateToReadable(week.week_end) }}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <!-- Right: status + action -->
                                                    <div class="flex items-center gap-3">
                                                        <span class="text-[11px] font-medium px-2 py-0.5 rounded-full"
                                                            :class="week.is_excluded
                                                                ? 'bg-[#F5C2C7] text-[#9B1C1C]'
                                                                : 'bg-[#D1FAE5] text-[#065F46]'">
                                                            {{ week.is_excluded
                                                                ? $t('employment.billing.excluded')
                                                                : $t('employment.billing.billable') }}
                                                        </span>
                                                        <button
                                                            class="text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-colors"
                                                            :class="week.is_excluded
                                                                ? 'border-[#205E77] text-[#205E77] hover:bg-[#E4F1F6]'
                                                                : 'border-[#DC2626] text-[#DC2626] hover:bg-[#FFF5F5]'"
                                                            :disabled="state.togglingUuid === week.week_start"
                                                            @click="toggleWeek(week)">
                                                            <Icon v-if="state.togglingUuid === week.week_start"
                                                                name="ph:spinner" class="w-3 h-3 animate-spin" />
                                                            <span v-else>
                                                                {{ week.is_excluded
                                                                    ? $t('employment.billing.includeWeek')
                                                                    : $t('employment.billing.excludeWeek') }}
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </LoadingSpinner>
                                    </div>

                                    <!-- Footer: summary -->
                                    <div v-if="state.weeks.length"
                                        class="px-6 py-4 border-t border-[#EAECF0] bg-[#F9FAFB] flex items-center gap-6 text-[13px] text-[#5C6478]">
                                        <span>
                                            <span class="font-semibold text-[#1F2533]">{{ billableCount }}</span>
                                            {{ $t('employment.billing.billableWeeks') }}
                                        </span>
                                        <span>
                                            <span class="font-semibold text-[#DC2626]">{{ excludedCount }}</span>
                                            {{ $t('employment.billing.excludedWeeks') }}
                                        </span>
                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { employmentService } from '@/components/api/user/EmploymentService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    isOpen: { type: Boolean, required: true },
    selectedCase: { type: Object, required: false, default: null },
})
const emit = defineEmits(['close'])

const { t } = useI18n()
const { successAlert } = useAlert()
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    isLoading: false,
    weeks: [] as any[],
    error: {} as Error,
    togglingUuid: null as string | null,
})

const billableCount = computed(() => state.weeks.filter(w => !w.is_excluded).length)
const excludedCount = computed(() => state.weeks.filter(w => w.is_excluded).length)

watch(() => props.isOpen, (val) => {
    if (val && props.selectedCase?.uuid) {
        fetchWeeks()
    } else {
        state.weeks = []
        state.error = {}
    }
})

async function fetchWeeks() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await employmentService.getCaseBillingWeeks(props.selectedCase.uuid)
        state.weeks = response?.data ?? response ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function toggleWeek(week: any) {
    state.togglingUuid = week.week_start
    state.error = {}
    try {
        const params = { week_start: week.week_start }
        if (week.is_excluded) {
            await employmentService.includeWeekInBilling(props.selectedCase.uuid, params)
            successAlert(`${t('alert.success')}!`, `${t('employment.billing.alert.weekIncluded')}.`)
            week.is_excluded = false
        } else {
            await employmentService.excludeWeekFromBilling(props.selectedCase.uuid, params)
            successAlert(`${t('alert.success')}!`, `${t('employment.billing.alert.weekExcluded')}.`)
            week.is_excluded = true
        }
    } catch (error: any) {
        state.error = error
    }
    state.togglingUuid = null
}
</script>
