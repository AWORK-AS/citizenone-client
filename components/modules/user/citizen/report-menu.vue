<template>
    <!-- Use of force and incidents used to fill a whole column beside the header on
         every visit, for something reported rarely. One labelled menu keeps both
         reports a click away; a missing attachment still shows on the button. -->
    <Menu as="div" class="relative inline-block text-left">
        <MenuButton
            class="relative inline-flex items-center gap-x-1.5 rounded-lg border-1.5 border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:border-red-300 hover:bg-red-100 transition-colors">
            <Icon name="ph:warning-circle" class="size-4" aria-hidden="true" />
            {{ $t('citizens.reportMenu') }}
            <Icon name="ph:caret-down" class="size-3" aria-hidden="true" />
            <span v-if="isMissingForm" class="absolute -top-1 -right-1 size-2.5 rounded-full bg-yellow-500 ring-2 ring-white"
                aria-hidden="true" />
        </MenuButton>
        <transition enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0">
            <MenuItems
                class="absolute right-0 z-30 mt-2 w-72 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                <div class="px-1 py-1" v-if="showUseOfForce">
                    <MenuItem v-slot="{ active }">
                        <button type="button" @click="useOfForceRef?.openReport()"
                            :class="[active && 'bg-gray-100', 'flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-sm']">
                            <Icon name="ph:hand-palm" class="size-4 text-red-500" aria-hidden="true" />
                            {{ $t('citizens.useOfForce.reportUseOfForce') }}
                        </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                        <button type="button" @click="useOfForceRef?.openPrevious()"
                            :class="[active && 'bg-gray-100', 'flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-sm']">
                            <Icon name="ph:clock-counter-clockwise" class="size-4 text-gray-500" aria-hidden="true" />
                            <span class="flex-1 text-left">{{ $t('citizens.useOfForce.seePreviousUseOfForce') }}</span>
                            <Icon v-if="isMissingForm" name="ph:warning" class="size-4 text-yellow-500"
                                :aria-label="$t('citizens.useOfForce.missingAttachmentToOneOrMoreRecord')" />
                        </button>
                    </MenuItem>
                </div>
                <div class="px-1 py-1">
                    <MenuItem v-slot="{ active }">
                        <button type="button" @click="incidentsRef?.openReport()"
                            :class="[active && 'bg-gray-100', 'flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-sm']">
                            <Icon name="ph:warning-circle" class="size-4 text-red-500" aria-hidden="true" />
                            {{ $t('citizens.incidents.reportIncident') }}
                        </button>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                        <button type="button" @click="incidentsRef?.openPrevious()"
                            :class="[active && 'bg-gray-100', 'flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-sm']">
                            <Icon name="ph:clock-counter-clockwise" class="size-4 text-gray-500" aria-hidden="true" />
                            {{ $t('citizens.incidents.seePreviousIncident') }}
                        </button>
                    </MenuItem>
                </div>
                <div class="px-1 py-1">
                    <MenuItem v-slot="{ active }">
                        <button type="button" @click="emit('help')"
                            :class="[active && 'bg-gray-100', 'flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-left text-sm text-gray-600']">
                            <Icon name="ph:question" class="size-4 shrink-0 text-gray-500" aria-hidden="true" />
                            {{ $t('citizens.useOfForce.relevantHelpLinksForWorkingWithUseOfForceAndIncidentReports.relevantHelpLinksForWorkingWithUseOfForceAndIncidentReports') }}
                        </button>
                    </MenuItem>
                </div>
            </MenuItems>
        </transition>
    </Menu>
    <ModulesUserCitizenUseOfForceHeader v-if="showUseOfForce" ref="useOfForceRef" headless
        :selectedCitizen="selectedCitizen" />
    <ModulesUserCitizenIncidentsHeader ref="incidentsRef" headless />
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

const props = defineProps<{ selectedCitizen?: any, showUseOfForce?: boolean }>()
const emit = defineEmits<{ (e: 'help'): void }>()

const useOfForceRef = ref<any>(null)
const incidentsRef = ref<any>(null)

const isMissingForm = computed(() => props.showUseOfForce && !!props.selectedCitizen?.data?.is_missing_form)
</script>
