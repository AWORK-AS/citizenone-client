<template>
    <!-- Marks where a medicine came from / its status: imported from FMK and/or a
         draft awaiting human confirmation. Kept tiny so it can sit inline next to
         the medicine name in every medicine-list layout. -->
    <span v-if="medicine?.is_from_fmk"
        :title="$t('citizens.medicineJournals.fmk.fromFmkHint')"
        class="shrink-0 inline-flex items-center gap-0.5 rounded-full bg-sky-100 px-1.5 py-0.5 text-xxs font-semibold text-sky-800">
        <Icon name="ph:pill" class="size-3" />
        {{ $t('citizens.medicineJournals.fmk.fromFmk') }}
    </span>
    <span v-if="medicine?.is_draft"
        :title="$t('citizens.medicineJournals.fmk.draftHint')"
        class="shrink-0 inline-flex items-center gap-0.5 rounded-full bg-gray-200 px-1.5 py-0.5 text-xxs font-semibold text-gray-700">
        <Icon name="ph:pencil-simple" class="size-3" />
        {{ $t('citizens.medicineJournals.fmk.draftBadge') }}
    </span>
</template>

<script setup lang="ts">
defineProps<{ medicine: any }>()
</script>
