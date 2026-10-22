<template>
    <div class="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-sm">
        <p class="text-[10px] font-semibold text-[#8891A4] uppercase tracking-wide mb-1">
            {{ $t('superadmin.companies.storage.title') }}
        </p>
        <p class="text-[26px] font-bold" :class="textClass">
            <Icon v-if="isLoading && !hasData" name="ph:spinner" class="w-5 h-5 text-[#D0D5DD] animate-spin" />
            <template v-else>
                {{ formatStorageUsed(usedBytes, usedGb) }}
                <span class="text-[16px] font-normal text-[#8891A4]">/ {{ formatQuotaGb(quotaGb) }}</span>
            </template>
        </p>
        <div class="mt-2 h-1.5 bg-[#EAECF0] rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all" :class="barClass" :style="`width:${percent}%`"></div>
        </div>
        <p class="text-[11px] text-[#8891A4] mt-1">
            {{ $t('superadmin.companies.storage.used', { percent }) }}
        </p>
    </div>
</template>

<script setup lang="ts">
import { useCompanyStorage } from '@/composables/companyStorage'
import { useStorageFormat } from '@/composables/useStorageFormat'

const props = defineProps<{ companyUuid: string }>()

const { formatStorageUsed, formatQuotaGb } = useStorageFormat()
const { isLoading, hasData, usedGb, usedBytes, quotaGb, percent, textClass, barClass, load } = useCompanyStorage(props.companyUuid)

onMounted(() => load())
</script>
