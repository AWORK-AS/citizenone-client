<template>
    <div class="rounded-xl border border-gray-200 bg-white px-3 py-2.5">
        <div class="flex items-start gap-2.5">
            <Icon :name="isSales ? 'ph:storefront' : 'ph:lifebuoy'" class="mt-0.5 size-4 shrink-0 text-cody-deep"
                aria-hidden="true" />
            <div class="min-w-0 flex-1">
                <p class="text-[13px] font-semibold text-gray-900">{{ $t('assistants.milo.title') }}</p>
                <p class="text-xs text-gray-500">
                    {{ $t(isSales ? 'assistants.milo.sales' : 'assistants.milo.support') }}
                </p>
            </div>
        </div>

        <div class="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 pl-[26px]">
            <button type="button" @click="openMilo"
                class="rounded-lg bg-primary px-3 py-1.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90">
                {{ $t('assistants.milo.open') }}
            </button>
            <!-- Said out loud because the obvious assumption is the opposite:
            that Milo will already know what was asked here. -->
            <span class="text-[11px] text-gray-400">{{ $t('assistants.milo.nothingShared') }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { AnswerCard } from '@/composables/useCodyChat'
import { useAssistantStore } from '@/store/assistant'

/**
 * Cody's answer to a question about CitizenOne itself: a door to Milo.
 *
 * Milo is the Obiyen support chat under Support, and it holds the product
 * knowledge Cody deliberately does not. This card opens it and passes nothing
 * along - the server built it from an intent alone, and the user writes to
 * Milo themselves. See ReferToMiloTool on the backend for why.
 */
const props = defineProps<{ card: AnswerCard }>()

const assistantStore = useAssistantStore()

const isSales = computed(() => props.card.intent === 'citizenone_sales')

// Matches the breakpoint where Cody goes full width. Below it the support chat
// steps aside with `visibility: hidden` for as long as Cody is open (see
// useObiyenChat().setSideOffset), so Milo would open invisibly behind the panel.
// Closing Cody first puts Milo on screen; wider, the two sit side by side.
const FULL_WIDTH_BELOW_PX = 640

function openMilo() {
    if (window.innerWidth < FULL_WIDTH_BELOW_PX) assistantStore.close()

    useObiyenChat().revealAndOpenChat()
}
</script>
