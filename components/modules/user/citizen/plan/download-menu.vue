<template>
    <!-- The bulk export used to be its own sidebar entry, far from the plans it
         exports. It now opens from the same Download people already use here. -->
    <Menu as="div" class="w-full md:w-fit relative inline-block text-left z-20" v-if="canBulkExport">
        <MenuButton as="template">
            <FormButton buttonStyle="action" class="w-full md:w-fit">
                <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                {{ $t('plansandgoals.download') }}
                <Icon name="ph:caret-down" class="h-3 w-3" aria-hidden="true" />
            </FormButton>
        </MenuButton>
        <transition enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0">
            <MenuItems
                class="absolute right-0 mt-2 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                <div class="px-1 py-1">
                    <MenuItem v-slot="{ active }">
                        <button type="button" @click="emit('download')"
                            :class="[active && 'bg-gray-100', 'group flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-sm']">
                            <Icon name="ph:file-pdf" class="h-4 w-4 text-gray-500" aria-hidden="true" />
                            {{ $t('plansAndGoalsExport.thisCitizen') }}
                        </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                        <button type="button" @click="navigateTo('/reports/plans-and-goals-export')"
                            :class="[active && 'bg-gray-100', 'group flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-sm']">
                            <Icon name="ph:file-zip" class="h-4 w-4 text-gray-500" aria-hidden="true" />
                            {{ $t('plansAndGoalsExport.severalCitizens') }}
                        </button>
                    </MenuItem>
                </div>
            </MenuItems>
        </transition>
    </Menu>
    <FormButton v-else buttonStyle="action" @click="emit('download')">
        <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
        {{ $t('plansandgoals.download') }}
    </FormButton>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { usePermissions } from '@/composables/usePermissions'

const emit = defineEmits<{ (e: 'download'): void }>()
const { isAtLeast, can } = usePermissions()

// Same gate as the export page itself.
const canBulkExport = computed(() => isAtLeast('Admin') || can('save_and_download_citizen_plan'))
</script>
