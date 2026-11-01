<template>
    <div class="flex flex-wrap items-center gap-x-1.5 text-sm text-gray-700" data-testid="leverandorservice-line">
        <Tooltip :text="$t('paymentDunning.leverandorservice.help')" position="top" wrap>
            <span class="inline-flex items-center gap-1.5">
                <Icon name="ph:bank" class="w-4 h-4 text-gray-400" aria-hidden="true" />
                {{ $t('paymentDunning.leverandorservice.line', { value }) }}
            </span>
        </Tooltip>
        <Tooltip v-if="props.companyUuid" :text="$t('paymentDunning.leverandorservice.linkHelp')" position="top" wrap>
            <NuxtLink :to="`/superadmin/companies/${props.companyUuid}/overview`"
                class="text-[#205E77] underline underline-offset-2 text-[13px]">
                {{ $t('paymentDunning.leverandorservice.link') }}
            </NuxtLink>
        </Tooltip>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

/**
 * Leverandørservice is a company setting (Betalingsmåde on the overview), so the
 * dialogs that used to carry their own checkbox show it read-only. `null` means
 * the setting has not loaded.
 */
const props = defineProps({
    leverandorservice: { type: Boolean as () => boolean | null, default: null },
    companyUuid: { type: String, default: '' },
})

const { t } = useI18n()
const value = computed(() => props.leverandorservice === null
    ? t('paymentDunning.leverandorservice.unknown')
    : t(props.leverandorservice ? 'paymentDunning.leverandorservice.yes' : 'paymentDunning.leverandorservice.no'))
</script>
