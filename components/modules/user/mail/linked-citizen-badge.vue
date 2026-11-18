<template>
    <!-- "Tilknyttet indsats": the mail is tagged to these interventions (Memox 18/11).
         A span, not a link: it sits inside the row's button, where an <a> is not allowed. -->
    <div v-if="props.links.length > 0" class="mt-1 flex flex-wrap gap-1">
        <span v-for="link in props.links" :key="link.citizen_uuid" role="link" tabindex="0"
            :title="$t('mail.linkedCitizen.open')"
            class="inline-flex max-w-full items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/20 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            @click.stop="open(link)" @keydown.enter.stop.prevent="open(link)">
            <Icon name="ph:link-simple" class="size-3 shrink-0" aria-hidden="true" />
            <span class="truncate">
                {{ $t('mail.linkedCitizen.label') }}: {{ link.citizen_name }}<template v-if="link.case_number"> ({{ link.case_number }})</template>
            </span>
        </span>
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { LinkedCitizen } from '@/composables/useLinkedCitizens'

const props = defineProps({
    links: {
        type: Array as PropType<LinkedCitizen[]>,
        default: () => [],
    },
})

function open(link: LinkedCitizen) {
    navigateTo(`/citizens/${link.citizen_uuid}/emails`)
}
</script>
