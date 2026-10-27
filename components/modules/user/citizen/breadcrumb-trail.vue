<template>
    <!-- Citizens > the citizen's name, so the trail says whose record this is. It
         replaces the separate Back link, which only went to the list. -->
    <div class="flex items-center">
        <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400" aria-hidden="true" />
        <button @click="navigateTo('/citizens')" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
            {{ customPagesStore.getCustomPagesName?.citizens ?? $t('citizens.citizens') }}
        </button>
    </div>
    <div class="flex items-center" v-if="citizenName">
        <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400" aria-hidden="true" />
        <button @click="navigateTo(`/citizens/${citizenUuid}/journals`)"
            class="ml-4 max-w-48 truncate text-sm font-medium text-gray-500 hover:text-gray-700">
            {{ citizenName }}
        </button>
    </div>
</template>

<script setup lang="ts">
import { useCustomPagesStore } from '@/store/custom-pages'
import { useCitizenStore } from '@/store/citizen'

const route = useRoute()
const customPagesStore = useCustomPagesStore() as any
const citizenStore = useCitizenStore() as any

const citizenUuid = computed(() => String(route.params.uuid ?? ''))

// The store still holds the previous citizen until the header has fetched this one.
const citizenName = computed(() => {
    const citizen = citizenStore.getSelectedCitizen
    if (!citizen?.uuid || citizen.uuid !== citizenUuid.value) return ''
    return `${citizen.firstname ?? ''} ${citizen.lastname ?? ''}`.trim()
})
</script>
