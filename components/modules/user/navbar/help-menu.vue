<template>
    <div>
        <Menu as="div" class="relative">
            <MenuButton :aria-label="$t('navbar.helpAndNews')" :title="$t('navbar.helpAndNews')"
                class="relative w-9 h-9 rounded-full flex items-center justify-center text-primary hover:text-primary-700 hover:bg-surface-100 transition-colors">
                <Icon name="ph:question" class="h-5 w-5" aria-hidden="true" />
                <!-- The counts themselves sit on the entries inside; the button only
                     says "there is something in here", so the bar stays quiet. -->
                <span v-if="totalUnread > 0"
                    class="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </MenuButton>
            <transition enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95">
                <MenuItems
                    class="absolute right-0 z-[9999] mt-2 w-64 origin-top-right rounded-xl bg-white py-1.5 shadow-lg ring-1 ring-black/5 focus:outline-none">
                    <MenuItem v-slot="{ active }">
                    <button type="button" @click="emit('openNews')"
                        :class="[active ? 'bg-surface-100' : '', ITEM_CLASS]">
                        <Icon name="ph:megaphone" class="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                        <span class="flex-1 text-left">{{ $t('sidebar.bulletBoard') }}</span>
                        <Badge v-if="newsCount > 0" type="notification">{{ newsCount }}</Badge>
                    </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                    <button type="button" @click="state.modal.isNewUpdatesOpen = true"
                        :class="[active ? 'bg-surface-100' : '', ITEM_CLASS]">
                        <Icon name="ph:lightbulb" class="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                        <span class="flex-1 text-left">{{ $t('updates.newUpdates') }}</span>
                        <Badge v-if="state.unseenCount > 0" type="notification">
                            {{ state.unseenCount > 9 ? '9+' : state.unseenCount }}
                        </Badge>
                    </button>
                    </MenuItem>
                    <div class="my-1 border-t border-surface-200" />
                    <MenuItem v-slot="{ active }">
                    <button type="button" @click="emit('openSupport')"
                        :class="[active ? 'bg-surface-100' : '', ITEM_CLASS]">
                        <Icon name="material-symbols:support" class="h-5 w-5 shrink-0 text-primary"
                            aria-hidden="true" />
                        <span class="flex-1 text-left">{{ $t('support.support') }}</span>
                    </button>
                    </MenuItem>
                </MenuItems>
            </transition>
        </Menu>

        <ModulesUserNewUpdatesModalReleaseNotes :isModalOpen="state.modal.isNewUpdatesOpen"
            @close="state.modal.isNewUpdatesOpen = false" @marked-seen="state.unseenCount = 0" />
    </div>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { releaseNoteService } from '@/components/api/user/ReleaseNoteService'

// The bulletin board, the release notes and support each had their own icon in
// the navbar, next to search, AI, the bell and the avatar. All three are "read
// about something" actions rather than daily work, so they share one entry
// point and leave the bar for the things people click every day.
const props = defineProps<{ unreadNewsCount?: number }>()
const emit = defineEmits<{ openNews: []; openSupport: [] }>()

const ITEM_CLASS = 'flex w-full items-center gap-x-3 px-4 py-2.5 text-sm text-slate-700'

const state = reactive({
    unseenCount: 0,
    modal: {
        isNewUpdatesOpen: false,
    },
})

const newsCount = computed(() => props.unreadNewsCount ?? 0)
const totalUnread = computed(() => newsCount.value + state.unseenCount)

onMounted(() => fetchUnseenCount())

async function fetchUnseenCount() {
    try {
        const response = await releaseNoteService.getUnseenCount()
        state.unseenCount = response?.count ?? 0
    } catch (error: any) {
        state.unseenCount = 0
    }
}
</script>
