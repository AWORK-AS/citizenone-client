<template>
    <!-- Eight unlabelled icon buttons of equal weight left people guessing. The two
         things done most - open and edit - stay visible with their names; the
         rest sit in one labelled menu, and delete is set apart at the bottom. -->
    <div class="flex items-center gap-2">
        <FormButton buttonStyle="action" buttonSize="sm" @click="emit('view')">
            <Icon name="ph:eye" class="size-4" aria-hidden="true" />
            {{ plan?.is_single_goal ? $t('plansandgoals.table.actions.seeSubgoals') : $t('plansandgoals.table.actions.seeGoals') }}
        </FormButton>
        <FormButton v-if="plan?.is_editable" buttonStyle="action" buttonSize="sm" @click="emit('edit')">
            <Icon name="ph:pencil-simple" class="size-4" aria-hidden="true" />
            {{ $t('plansandgoals.table.actions.edit') }}
        </FormButton>
        <Menu as="div" class="relative inline-block text-left">
            <MenuButton as="template">
                <FormButton buttonStyle="action" buttonSize="sm" :aria-label="$t('plansandgoals.table.actions.more')">
                    <Icon name="ph:dots-three-outline-fill" class="size-4" aria-hidden="true" />
                </FormButton>
            </MenuButton>
            <transition enter-active-class="transition duration-100 ease-out"
                enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0">
                <MenuItems
                    class="absolute right-0 z-30 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                    <div class="px-1 py-1">
                        <MenuItem v-for="item in items" :key="item.event" v-slot="{ active }">
                            <button type="button" @click="emit(item.event)"
                                :class="[active && 'bg-gray-100', 'group flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-sm']">
                                <Icon :name="item.icon" class="size-4 text-gray-500" aria-hidden="true" />
                                {{ $t(item.label) }}
                            </button>
                        </MenuItem>
                    </div>
                    <div class="px-1 py-1" v-if="plan?.is_deletable">
                        <MenuItem v-slot="{ active }">
                            <button type="button" @click="emit('delete')"
                                :class="[active && 'bg-red-50', 'group flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-sm text-red-600']">
                                <Icon name="heroicons:trash" class="size-4" aria-hidden="true" />
                                {{ $t('plansandgoals.table.actions.delete') }}
                            </button>
                        </MenuItem>
                    </div>
                </MenuItems>
            </transition>
        </Menu>
    </div>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

const props = defineProps<{ plan: any, archived?: boolean }>()
const emit = defineEmits<{
    (e: 'view' | 'edit' | 'archive' | 'unarchive' | 'chart' | 'notes' | 'statuses' | 'notifications' | 'delete'): void
}>()

const items = computed(() => [
    { event: 'chart', icon: 'ph:chart-line', label: 'plansandgoals.table.actions.graph' },
    { event: 'notes', icon: 'ph:check-square-offset', label: 'plansandgoals.table.actions.notes' },
    { event: 'statuses', icon: 'ph:file', label: 'plansandgoals.table.actions.reports' },
    { event: 'notifications', icon: 'ph:bell', label: 'plansandgoals.table.actions.notifications' },
    props.archived
        ? { event: 'unarchive', icon: 'ph:arrow-counter-clockwise', label: 'plansandgoals.table.actions.unarchive' }
        : { event: 'archive', icon: 'ph:archive', label: 'plansandgoals.table.actions.archive' },
] as const)
</script>
