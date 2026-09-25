<template>
    <!-- What the count on the topbar button is made of. The badge said "9+" and
    the panel it opened said hello, so the number led nowhere. Same brief, same
    wording as My day: computed by the API, not generated. -->
    <section v-if="assistantStore.brief.length" aria-labelledby="cody-brief-heading" class="mt-3">
        <h2 id="cody-brief-heading"
            class="mb-2 flex items-center gap-1.5 px-0.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {{ $t('myDay.brief.heading') }}
            <span class="rounded-full bg-primary px-1.5 text-[11px] font-bold tabular-nums text-white">
                {{ assistantStore.waitingCount }}
            </span>
        </h2>
        <ul class="space-y-1.5">
            <li v-for="item in assistantStore.brief" :key="item.key"
                class="flex items-stretch rounded-xl border border-gray-200 bg-white transition-colors hover:border-cody/50">
                <!-- The page it belongs to. The panel stays open: the page behind
                is live, and the list is still here to work down. -->
                <button type="button" class="flex min-h-11 min-w-0 flex-1 items-start gap-2.5 rounded-l-xl px-3 py-2 text-left"
                    @click="navigateTo(item.link)">
                    <span class="mt-1.5 size-2 shrink-0 rounded-full" :class="{
                        'bg-red-500': item.severity === 'critical',
                        'bg-amber-500': item.severity === 'warning',
                        'bg-slate-400': item.severity === 'info',
                    }" aria-hidden="true"></span>
                    <span class="min-w-0 flex-1">
                        <span class="block text-[13px] font-medium leading-snug text-gray-800">
                            {{ $t(`myDay.brief.${item.key}`, item.count) }}
                        </span>
                        <span v-if="item.details?.length" class="mt-0.5 block truncate text-xs text-gray-500">
                            {{ describeBriefItem(item) }}
                        </span>
                    </span>
                </button>
                <!-- Asking about a line should not mean typing it out again. -->
                <button type="button"
                    class="flex shrink-0 items-center rounded-r-xl px-2.5 text-gray-400 transition-colors hover:bg-cody-pale hover:text-cody-deep"
                    :aria-label="$t('myDay.brief.askCody', { subject: $t(`myDay.brief.${item.key}`, item.count) })"
                    :title="$t('myDay.brief.askCodyShort')"
                    @click="askAbout(item)">
                    <ModulesUserNavbarCodyMark :size="17" />
                </button>
            </li>
        </ul>
    </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAssistantStore, describeBriefItem, type BriefItem } from '@/store/assistant'

const assistantStore = useAssistantStore()
const { t } = useI18n()

// Built from what the line already says, so Cody is asked about exactly what the
// reader can see - initials and times, never full names.
function askAbout(item: BriefItem) {
    const subject = t(`myDay.brief.${item.key}`, item.count)
    const detail = item.details?.length ? ` ${describeBriefItem(item)}.` : ''

    assistantStore.askAbout(t('myDay.brief.askCodyPrompt', { subject, detail }))
}
</script>
