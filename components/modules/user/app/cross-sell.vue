<template>
    <div v-if="apps.length" class="mt-8 border-t border-gray-100 pt-6 text-left">
        <h3 class="text-sm font-semibold text-muted-800 mb-4 flex items-center gap-2">
            <Icon name="ph:squares-four" class="w-4 h-4 text-secondary" />
            {{ categoryName ? $t('apps.otherIn', { category: categoryName }) : $t('apps.recommendedForYou') }}
        </h3>
        <div class="space-y-2">
            <NuxtLink v-for="app in apps" :key="app.uuid" to="/apps"
                class="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-200 hover:border-primary hover:bg-gray-50 transition-colors">
                <div v-if="appIconFor(app).useTile"
                    class="brand-tile w-9 h-9 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <Icon :name="appIconFor(app).icon" class="w-5 h-5" />
                </div>
                <img v-else-if="app?.logo" :src="app.logo" alt=""
                    class="w-9 h-9 object-contain rounded flex-shrink-0" />
                <div v-else
                    class="w-9 h-9 rounded bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {{ (app?.name || '?').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                    <p class="text-sm font-medium text-muted-800 truncate">{{ app.name }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ app.description }}</p>
                </div>
                <Icon name="ph:arrow-right" class="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" />
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import { appService } from '@/components/api/user/AppService'

const props = defineProps({
    categorySlug: { type: String, default: '' },
    excludeUuid: { type: String, default: '' },
})

const apps = ref<any[]>([])
const categoryName = ref('')

onMounted(async () => {
    if (!props.categorySlug) return
    try {
        const res = await appService.getApps({ type: props.categorySlug })
        const rows = (res?.data ?? []).filter((a: any) => a?.uuid !== props.excludeUuid)
        apps.value = rows.slice(0, 4)
        categoryName.value = rows[0]?.category?.name ?? ''
    } catch (_) {
        apps.value = []
    }
})
</script>
