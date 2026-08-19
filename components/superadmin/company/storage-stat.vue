<template>
    <div class="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-sm">
        <p class="text-[10px] font-semibold text-[#8891A4] uppercase tracking-wide mb-1">
            {{ $t('superadmin.companies.storage.title') }}
        </p>
        <p class="text-[26px] font-bold" :class="textClass">
            <Icon v-if="isLoading && !hasData" name="ph:spinner" class="w-5 h-5 text-[#D0D5DD] animate-spin" />
            <template v-else>
                {{ formatStorageGb(usedGb) }}
                <span class="text-[16px] font-normal text-[#8891A4]">/ {{ formatStorageGb(quotaGb) }} GB</span>
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
import { useCompanyStorage, formatStorageGb } from '@/composables/companyStorage'

const props = defineProps<{ companyUuid: string }>()

const { isLoading, hasData, usedGb, quotaGb, percent, textClass, barClass, load } = useCompanyStorage(props.companyUuid)

onMounted(() => load())
</script>
