<template>
    <p class="text-xs" v-if="journal?.linked_to">
        {{ $t('citizens.citizenJournals.linkedTo') }}: {{ linkedToLabel(journal.linked_to) }}
        <NuxtLink :to="linkedToHref(plansAndGoalsBasePath, journal.linked_to)" class="text-primary hover:underline">
            {{ $t('citizens.citizenJournals.linkedToOpen') }}
        </NuxtLink>
    </p>
</template>

<script setup lang="ts">
import { linkedToLabel, linkedToHref } from '@/composables/journalLinkedTo'

defineProps<{
    journal: any,
    plansAndGoalsBasePath: string,
}>()
</script>
