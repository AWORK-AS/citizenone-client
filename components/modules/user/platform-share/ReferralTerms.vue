<template>
    <!--
        "Giv en måned, få en måned": what the share link earns, and the terms in full. Shown in the
        "Del CitizenOne" modal and after a 9-10 NPS answer, to whoever may commit the company to paying.
        Plain and calm on purpose: no countdown, no nudging.
    -->
    <div class="rounded-xl border border-[#D5EEF7] bg-[#F4FAFD] p-4" data-testid="referral-program">
        <p class="flex items-center gap-1.5 text-sm font-semibold text-[#0f4c75]">
            <Icon name="ph:gift" class="size-4 text-[#42AED9]" aria-hidden="true" />
            {{ $t('referralProgram.title') }}
        </p>
        <p class="mt-1 text-xs text-gray-600">{{ $t('referralProgram.intro') }}</p>

        <ul v-if="summary && summary.referred > 0" class="mt-2 space-y-0.5 text-xs text-gray-600"
            data-testid="referral-program-status">
            <li>{{ $t('referralProgram.statusReferred', { count: summary.referred }) }}</li>
            <li v-if="summary.pending > 0">{{ $t('referralProgram.statusPending', { count: summary.pending }) }}</li>
            <li v-if="toCome > 0">{{ $t('referralProgram.statusMonths', { count: toCome }) }}</li>
        </ul>

        <details class="mt-2 text-xs text-gray-600">
            <summary class="cursor-pointer font-medium text-[#0f4c75]">{{ $t('referralProgram.termsTitle') }}</summary>
            <ul class="mt-1.5 list-disc space-y-1 pl-4">
                <li>{{ $t('referralProgram.terms1') }}</li>
                <li>{{ $t('referralProgram.terms2') }}</li>
                <li>{{ $t('referralProgram.terms3') }}</li>
                <li>{{ $t('referralProgram.terms4', { cap: offer.yearly_cap }) }}</li>
                <li>{{ $t('referralProgram.terms5') }}</li>
            </ul>
        </details>
    </div>
</template>

<script setup lang="ts">
import { monthsToCome, type ReferralOffer, type ReferralSummary } from '@/composables/referralProgram'

const props = defineProps<{
    offer: ReferralOffer
    summary?: ReferralSummary | null
}>()

const toCome = computed(() => monthsToCome(props.summary))
</script>
