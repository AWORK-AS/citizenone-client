<template>
    <p v-if="shown" class="mt-10 mb-4 px-4 text-center text-xs text-gray-500">
        {{ $t('citizenoneAttribution.portal') }}
        <a :href="CITIZENONE_URL" target="_blank" rel="noopener"
            class="font-medium text-primary hover:text-secondary-500">citizenone.dk</a>
    </p>
</template>

<script setup lang="ts">
// One quiet line under the portals relatives, patients and external parties
// log in to. Most of them have never heard of CitizenOne; this is where they
// can. The company can switch it off in Settings (hide_citizenone_attribution),
// the same switch that removes it from its PDFs and mails.
import { useUserStore } from '@/store/user'
import { citizenoneAttributionShown, citizenoneAttributionUrl } from '@/composables/citizenoneAttribution'

const CITIZENONE_URL = citizenoneAttributionUrl('portal')

const userStore = useUserStore() as any
const shown = computed(() => citizenoneAttributionShown(userStore.getUser?.company))
</script>
