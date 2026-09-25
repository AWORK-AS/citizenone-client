<template>
    <!-- These render inside the page's <h1>, which sets text-2xl. At that size
         three tabs read as three competing page titles, so they set their own
         size. Links rather than clickable spans, so they take focus and open
         in a new window like any other link. -->
    <div class="flex items-center gap-x-5 text-lg">
        <NuxtLink v-for="tab in tabs" :key="tab.key" :to="tab.href"
            :aria-current="active === tab.key ? 'page' : undefined"
            class="transition-colors border-b-2 pb-1 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            :class="active === tab.key
                ? 'text-primary border-primary font-semibold cursor-default'
                : 'text-slate-500 border-transparent font-medium hover:text-slate-700'">
            {{ $t(tab.label) }}
        </NuxtLink>
    </div>
</template>

<script setup lang="ts">
import { googledriveService } from '@/components/api/user/GoogleDriveService'

defineProps<{ active: 'overview' | 'my-day' | 'statistics' | 'discover' | 'google-drive' }>()

const isGoogleDriveConnected = ref(false)

const tabs = computed(() => [
    { key: 'overview', label: 'overview.overview', href: '/overview' },
    { key: 'my-day', label: 'myDay.title', href: '/my-day' },
    { key: 'statistics', label: 'overview.statisticsTab', href: '/statistics' },
    ...(isGoogleDriveConnected.value
        ? [{ key: 'google-drive', label: 'overview.googleDriveTab', href: '/overview/google-drive' }]
        : []),
])

onMounted(async () => {
    try {
        const status = await googledriveService.getGoogleDriveStatus()
        isGoogleDriveConnected.value = status?.connected || false
    } catch {
        isGoogleDriveConnected.value = false
    }
})
</script>
