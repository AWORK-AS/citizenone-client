<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('appointments.appointments') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('appointments.appointments') }}</template>

            <!-- <div class="flex justify-end items-center mb-5 gap-x-2">
                <Menu as="div" class="relative inline-block text-left z-20">
                    <div>
                        <MenuButton>
                            <FormButton buttonStyle="action" class="rounded-lg">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('events.newEvent') }}
                            </FormButton>
                        </MenuButton>
                    </div>

                    <transition enter-active-class="transition duration-100 ease-out"
                        enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                        leave-active-class="transition duration-75 ease-in"
                        leave-from-class="transform scale-100 opacity-100"
                        leave-to-class="transform scale-95 opacity-0">
                        <MenuItems
                            class="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                            <div class="px-1 py-1">
                                <MenuItem v-slot="{ active }" @click="state.modal.isAddEventForMyselfOpen = true">
                                <button :class="[
                                    active && 'bg-gray-100',
                                    'group flex w-full items-center rounded-md px-2 py-2.5 text-sm',
                                ]">
                                    <Icon name="ph:user" class="mr-2 h-5 w-5" aria-hidden="true" />
                                    {{ $t('events.myself') }}
                                </button>
                                </MenuItem>
                                <MenuItem v-slot="{ active }" @click="state.modal.isAddEventForEmployeeOpen = true">
                                <button :class="[
                                    active && 'bg-gray-100',
                                    'group flex w-full items-center rounded-md px-2 py-2.5 text-sm',
                                ]">
                                    <Icon name="ph:users-three" class="mr-2 h-5 w-5" aria-hidden="true" />
                                    {{ $t('events.employees') }}
                                </button>
                                </MenuItem>
                                <MenuItem v-slot="{ active }" @click="state.modal.isAddEventForCitizenOpen = true">
                                <button :class="[
                                    active && 'bg-gray-100',
                                    'group flex w-full items-center rounded-md px-2 py-2.5 text-sm',
                                ]">
                                    <Icon name="heroicons:user-group" class="mr-2 h-5 w-5" aria-hidden="true" />
                                    {{ $t('events.citizens') }}
                                </button>
                                </MenuItem>
                            </div>
                        </MenuItems>
                    </transition>
                </Menu>
            </div> -->
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const language = useI18n()
const { successAlert } = useAlert()
const { t } = useI18n()

const breadcrumbLinks = [
    {
        name: 'appointments.appointments',
        translate: true,
        href: '/appointments',
    },
]

const state = reactive({
    appointments: [],
    error: {} as Error,
    isPageLoading: false,
    modal: {},
})

onMounted(() => {

})
</script>