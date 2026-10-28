<template>
    <!-- The "⋯ More actions" menu for a list row (or, with a label, a toolbar's
         "More" menu): labelled items, destructive ones set apart at the bottom in red. -->
    <Menu as="div" class="relative inline-block text-left" v-if="items.length">
        <MenuButton as="template">
            <FormButton buttonStyle="action" :buttonSize="buttonSize"
                :aria-label="label ? undefined : $t('plansandgoals.table.actions.more')">
                <template v-if="label">
                    {{ label }}
                    <Icon name="ph:caret-down" class="size-3" aria-hidden="true" />
                </template>
                <Icon v-else name="ph:dots-three-outline-fill" class="size-4" aria-hidden="true" />
            </FormButton>
        </MenuButton>
        <transition enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0">
            <MenuItems
                class="absolute right-0 z-30 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                <div class="px-1 py-1" v-if="regular.length">
                    <MenuItem v-for="item in regular" :key="item.key" v-slot="{ active }">
                        <button type="button" @click="item.run()"
                            :class="[active && 'bg-gray-100', 'flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-sm']">
                            <Icon :name="item.icon" class="size-4 text-gray-500" aria-hidden="true" />
                            {{ item.label }}
                        </button>
                    </MenuItem>
                </div>
                <div class="px-1 py-1" v-if="danger.length">
                    <MenuItem v-for="item in danger" :key="item.key" v-slot="{ active }">
                        <button type="button" @click="item.run()"
                            :class="[active && 'bg-red-50', 'flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-sm text-red-600']">
                            <Icon :name="item.icon" class="size-4" aria-hidden="true" />
                            {{ item.label }}
                        </button>
                    </MenuItem>
                </div>
            </MenuItems>
        </transition>
    </Menu>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { splitRowActions, type RowAction } from '@/utils/rowActions'

const props = withDefaults(defineProps<{ items: (RowAction | false | null | undefined)[], buttonSize?: string, label?: string }>(), {
    buttonSize: 'xs',
})

const split = computed(() => splitRowActions(props.items))
const regular = computed(() => split.value.regular)
const danger = computed(() => split.value.danger)
</script>
