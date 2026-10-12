<template>
    <!--
        Task #115: a self-administered medicine is taken by the citizen; staff only
        hand it out. It has to stand out on every medicine screen, so it has its own
        solid colour - amber is already low stock, red is expired, primary is PN.
    -->
    <Tooltip :text="$t('citizens.medicineJournals.selfAdministered.hint')" :wrap="true" class="shrink-0">
        <span v-if="props.compact"
            class="inline-flex items-center justify-center rounded-full bg-violet-600 p-0.5 text-white"
            :aria-label="$t('citizens.medicineJournals.selfAdministered.label')" role="img">
            <Icon name="ph:hand-palm-fill" class="size-3" aria-hidden="true" />
        </span>
        <span v-else
            class="inline-flex items-center gap-1 rounded-full bg-violet-600 px-2 py-0.5 text-xs font-semibold text-white whitespace-nowrap">
            <Icon name="ph:hand-palm-fill" class="size-3.5" aria-hidden="true" />
            {{ $t('citizens.medicineJournals.selfAdministered.label') }}
        </span>
    </Tooltip>
</template>

<script setup lang="ts">
const props = defineProps({
    /** Icon only, for tight spots like the week and month grids. */
    compact: {
        type: Boolean,
        default: false,
    },
})
</script>
