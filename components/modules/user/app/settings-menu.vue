<template>
    <Menu as="div" class="absolute right-3 top-3 z-10">
        <MenuButton class="flex items-center justify-center p-1.5 rounded-md bg-white/80 hover:bg-gray-100">
            <Icon name="ph:gear" class="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-pointer" />
        </MenuButton>
        <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
            <MenuItems
                class="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div class="px-1 py-1">
                    <MenuItem v-slot="{ active }">
                        <button
                            :class="[active && 'bg-gray-100', 'group flex w-full items-center rounded-md px-2 py-2.5 text-sm text-red-600']"
                            @click="emit('disconnect')">
                            {{ $t(disconnectLabelKey ?? `apps.${appGenericName}.disconnect`) }}
                        </button>
                    </MenuItem>
                </div>
            </MenuItems>
        </transition>
    </Menu>
</template>

<script setup lang="ts">
// Small per-card overlay for apps that connect via OAuth and need a disconnect
// action, but have no dedicated settings page of their own yet (see
// composables/appSetupLink.ts). Kept out of ModulesUserAppCard itself so the
// shared card's contract stays the same for every other app.
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

// `apps.${appGenericName}.disconnect` breaks for any generic_name containing
// a literal dot (e.g. "salary.dk" -> the nonexistent key
// "apps.salary.dk.disconnect", since translation keys nest on dots) - pass
// disconnectLabelKey explicitly for those instead of relying on interpolation.
defineProps<{ appGenericName: string; disconnectLabelKey?: string }>()
const emit = defineEmits(['disconnect'])
</script>
