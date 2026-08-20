<template>
    <div class="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm">
        <div class="flex items-start justify-between gap-4 mb-4">
            <div>
                <h3 class="text-[13px] font-semibold text-[#1F2533]">
                    {{ $t('superadmin.companies.storage.breakdownTitle') }}
                </h3>
                <p class="text-[11px] text-[#8891A4] mt-0.5">
                    {{ $t('superadmin.companies.storage.breakdownHint') }}
                    <span v-if="storage?.measured_at">
                        · {{ $t('superadmin.companies.storage.measuredAt', { at: formatMeasuredAt(storage.measured_at) }) }}
                    </span>
                </p>
            </div>
            <button
                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium bg-white text-[#5C6478] hover:bg-[#F9FAFB] border border-[#EAECF0] transition-colors disabled:opacity-50"
                :disabled="isLoading" @click="load(true)">
                <Icon name="ph:arrows-clockwise" class="w-4 h-4" :class="isLoading ? 'animate-spin' : ''" />
                {{ $t('superadmin.companies.storage.recalculate') }}
            </button>
        </div>

        <div v-if="isLoading && !hasData" class="flex justify-center py-4">
            <Icon name="ph:spinner" class="w-5 h-5 text-[#8891A4] animate-spin" />
        </div>
        <div v-else-if="!breakdown.length" class="text-[13px] text-[#8891A4] py-2">
            {{ $t('superadmin.companies.storage.empty') }}
        </div>
        <div v-else class="space-y-3">
            <div v-for="item in breakdown" :key="item.category">
                <div class="flex items-center justify-between text-[13px] mb-1">
                    <span class="text-[#1F2533]">{{ categoryLabel(item.category) }}</span>
                    <span class="text-[#5C6478]">
                        {{ formatStorageSize(item.bytes) }}
                        <span class="text-[#8891A4] ml-1">({{ item.percent }}%)</span>
                    </span>
                </div>
                <div class="h-1.5 bg-[#F5F6F8] rounded-full overflow-hidden">
                    <div class="h-full bg-[#42AED9] rounded-full" :style="`width:${Math.min(100, item.percent)}%`"></div>
                </div>
            </div>
        </div>

        <p v-if="storage?.storage_limit_gb !== null && storage?.storage_limit_gb !== undefined"
            class="text-[11px] text-[#8891A4] mt-4">
            {{ $t('superadmin.companies.storage.manualLimit', { limit: formatStorageGb(storage.storage_limit_gb) }) }}
        </p>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useCompanyStorage, formatStorageGb, formatStorageSize } from '@/composables/companyStorage'

const props = defineProps<{ companyUuid: string }>()

const { t, locale } = useI18n()
const { storage, isLoading, hasData, breakdown, load } = useCompanyStorage(props.companyUuid)

// Keys come from the backend breakdown (StorageCalculator) and are stable.
function categoryLabel(category: string) {
    const key = `superadmin.companies.storage.categories.${category}`
    const label = t(key)

    return label === key ? category : label
}

function formatMeasuredAt(value: string) {
    return new Date(value).toLocaleString(locale.value === 'en' ? 'en-GB' : 'da-DK', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    })
}

onMounted(() => load())
</script>
