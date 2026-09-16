<template>
    <div class="flex items-center gap-x-6">
        <span class="transition-colors"
            :class="active === 'overview' ? 'text-primary border-b-2 border-primary pb-1 font-semibold cursor-default' : 'text-slate-400 hover:text-slate-600 cursor-pointer mb-1.5'"
            @click="active !== 'overview' && navigateTo('/overview')">
            {{ $t('overview.overview') }}
        </span>
        <span class="transition-colors"
            :class="active === 'my-day' ? 'text-primary border-b-2 border-primary pb-1 font-semibold cursor-default' : 'text-slate-400 hover:text-slate-600 cursor-pointer mb-1.5'"
            @click="active !== 'my-day' && navigateTo('/my-day')">
            {{ $t('myDay.title') }}
        </span>
        <span class="transition-colors"
            :class="active === 'statistics' ? 'text-primary border-b-2 border-primary pb-1 font-semibold cursor-default' : 'text-slate-400 hover:text-slate-600 cursor-pointer mb-1.5'"
            @click="active !== 'statistics' && navigateTo('/statistics')">
            {{ $t('overview.statisticsTab') }}
        </span>
        <span v-if="isGoogleDriveConnected" class="transition-colors"
            :class="active === 'google-drive' ? 'text-primary border-b-2 border-primary pb-1 font-semibold cursor-default' : 'text-slate-400 hover:text-slate-600 cursor-pointer mb-1.5'"
            @click="active !== 'google-drive' && navigateTo('/overview/google-drive')">
            {{ $t('overview.googleDriveTab') }}
        </span>
    </div>
</template>

<script setup lang="ts">
import { googledriveService } from '@/components/api/user/GoogleDriveService'

defineProps<{ active: 'overview' | 'my-day' | 'statistics' | 'discover' | 'google-drive' }>()

const isGoogleDriveConnected = ref(false)

onMounted(async () => {
    try {
        const status = await googledriveService.getGoogleDriveStatus()
        isGoogleDriveConnected.value = status?.connected || false
    } catch {
        isGoogleDriveConnected.value = false
    }
})
</script>
