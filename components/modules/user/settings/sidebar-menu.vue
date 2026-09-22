<template>
    <div>
        <p class="text-sm text-slate-500 mb-4">{{ $t('settings.profile.sidebarMenu.description') }}</p>
        <div v-for="group in groupedItems" :key="group.key" class="mb-4 last:mb-0">
            <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{{ $t(group.label) }}</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div v-for="item in group.items" :key="item.name"
                    class="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5">
                    <span class="text-sm text-slate-800">{{ item.label }}</span>
                    <FormSwitch :value="item.visible" :label="item.label" @toggleSwitch="toggleItem(item.name)" />
                </div>
            </div>
        </div>
        <p v-if="groupedItems.length === 0" class="text-sm text-slate-400">
            {{ $t('settings.profile.sidebarMenu.empty') }}
        </p>
        <div class="mt-5">
            <FormButton type="button" buttonStyle="primary" class="w-full" :disabled="state.isSaving" @click="save">
                {{ $t('save') }}
            </FormButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { userService } from '@/components/api/user/UserService'
import { useUserStore } from '@/store/user'
import { useSidebarNavStore } from '@/store/sidebar-nav'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const userStore = useUserStore() as any
const sidebarNavStore = useSidebarNavStore()
const customPagesStore = useCustomPagesStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()

const GROUP_LABELS: Record<string, string> = {
    daily: 'sidebar.groups.daily',
    documentation: 'sidebar.groups.documentation',
    organisation: 'sidebar.groups.organisation',
    shortcuts: 'sidebar.groups.shortcuts',
}

const state = reactive({
    isSaving: false,
    visibility: {} as Record<string, boolean>,
})

// generateSidebarLinks() (in layouts/user.vue) re-runs in the background whenever
// userStore.getUser is reassigned - which also happens for reasons unrelated to
// sidebar preferences (e.g. presence/online-status updates over the websocket).
// Each run replaces sidebarNavStore.eligibleItems with a new array, even when its
// contents haven't changed. Re-initializing on every such change would silently
// discard any toggle the user hasn't saved yet - so this only runs once, the
// first time eligibleItems becomes available.
let hasInitialized = false

function initVisibility() {
    const savedPreferences: { name: string, visible: boolean }[] = Array.isArray(userStore.getUser?.sidebar_preferences)
        ? userStore.getUser.sidebar_preferences
        : []
    const savedByName = new Map(savedPreferences.map((p) => [p.name, p.visible]))

    const visibility: Record<string, boolean> = {}
    sidebarNavStore.eligibleItems.forEach((item: any) => {
        visibility[item.name] = savedByName.has(item.name) ? !!savedByName.get(item.name) : true
    })
    state.visibility = visibility
    hasInitialized = true
}

watch(() => sidebarNavStore.eligibleItems, () => {
    if (!hasInitialized) initVisibility()
}, { immediate: true })

const groupedItems = computed(() => {
    return Object.keys(GROUP_LABELS)
        .map((key) => ({
            key,
            label: GROUP_LABELS[key],
            items: sidebarNavStore.eligibleItems
                .filter((item: any) => (item.group || 'daily') === key)
                .map((item: any) => ({
                    name: item.name,
                    label: getSidebarNavItemLabel(item, t, customPagesStore),
                    visible: state.visibility[item.name] ?? true,
                })),
        }))
        .filter((group) => group.items.length > 0)
})

function toggleItem(name: string) {
    state.visibility[name] = !state.visibility[name]
}

async function save() {
    state.isSaving = true
    try {
        const preferences = sidebarNavStore.eligibleItems.map((item: any) => ({
            name: item.name,
            visible: state.visibility[item.name] ?? true,
        }))
        await userService.updateSidebarPreferences(preferences)
        // Optimistic: the request just persisted exactly this array, so update the
        // store from it directly rather than depending on the response's shape -
        // this immediately re-triggers the sidebar's own generateSidebarLinks watch.
        userStore.setUser({ ...userStore.getUser, sidebar_preferences: preferences })
        successAlert(`${t('alert.success')}!`, t('settings.profile.sidebarMenu.saved'))
    } finally {
        state.isSaving = false
    }
}
</script>
