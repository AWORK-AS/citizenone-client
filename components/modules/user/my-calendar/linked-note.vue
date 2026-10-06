<template>
    <!-- The note written from this booking. -->
    <NuxtLink v-if="props.journal?.uuid && props.citizenUuid"
        :to="`/citizens/${props.citizenUuid}/journals?open_journal=${props.journal.uuid}`" @click.stop
        class="inline-flex max-w-full items-center gap-x-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/20">
        <Icon name="ph:notebook" class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span class="truncate">{{ $t('events.linkedNote', { title: props.journal.title }) }}</span>
    </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps({
    journal: {
        type: Object,
        default: null,
    },
    citizenUuid: {
        type: String,
        default: '',
    },
})
</script>
