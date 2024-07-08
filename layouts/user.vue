<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <TransitionRoot as="template" :show="sidebarOpen">
            <Dialog as="div" class="relative z-50 lg:hidden" @close="sidebarOpen = false">
                <TransitionChild as="template" enter="transition-opacity ease-linear duration-300"
                    enter-from="opacity-0" enter-to="opacity-100" leave="transition-opacity ease-linear duration-300"
                    leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-primary/80" />
                </TransitionChild>

                <div class="fixed inset-0 flex">
                    <TransitionChild as="template" enter="transition ease-in-out duration-300 transform"
                        enter-from="-translate-x-full" enter-to="translate-x-0"
                        leave="transition ease-in-out duration-300 transform" leave-from="translate-x-0"
                        leave-to="-translate-x-full">
                        <DialogPanel class="relative mr-16 flex w-full max-w-xs flex-1">
                            <TransitionChild as="template" enter="ease-in-out duration-300" enter-from="opacity-0"
                                enter-to="opacity-100" leave="ease-in-out duration-300" leave-from="opacity-100"
                                leave-to="opacity-0">
                                <div class="absolute left-full top-0 flex w-16 justify-center pt-5">
                                    <button type="button" class="-m-2.5 p-2.5" @click="sidebarOpen = false">
                                        <span class="sr-only">Close sidebar</span>
                                        <Icon name="heroicons:x-mark" class="h-6 w-6 text-white" aria-hidden="true" />
                                    </button>
                                </div>
                            </TransitionChild>
                            <div
                                class="flex grow flex-col gap-y-5 overflow-y-auto bg-primary px-6 pb-4 ring-1 ring-white/10">
                                <div class="mt-5">
                                    <span @click="navigateTo('/citizens')">
                                        <LogoWhite />
                                    </span>
                                </div>
                                <nav class="flex flex-1 flex-col">
                                    <ul role="list" class="flex flex-1 flex-col gap-y-7">
                                        <li>
                                            <ul role="list" class="-mx-2 space-y-1">
                                                <li v-for="item in navigation" :key="item.name">
                                                    <div v-if="!item.children" @click="navigateTo(item.href)"
                                                        :class="[item.activeRouteNames.includes($route.name) ? 'text-secondary-25' : 'text-secondary-100', 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold']">
                                                        <Icon :name="item.icon" class="h-5 w-5 shrink-0"
                                                            :class="[item.activeRouteNames.includes($route.name) ? 'text-secondary-25' : 'text-secondary-100']"
                                                            aria-hidden="true" />
                                                        <span v-if="item.name === 'Citizens'">
                                                            {{ $t('sidebar.citizens') }}
                                                        </span>
                                                        <span v-if="item.name === 'Calendar'">
                                                            {{ $t('sidebar.calendar') }}
                                                        </span>
                                                        <span v-if="item.name === 'Duty Schedules'">
                                                            {{ $t('sidebar.dutySchedules') }}
                                                        </span>
                                                        <span v-if="item.name === 'Employees'">
                                                            {{ $t('sidebar.employees') }}
                                                        </span>
                                                        <span v-if="item.name === 'Departments'">
                                                            {{ $t('sidebar.departments') }}
                                                        </span>
                                                        <span v-if="item.name === 'Protocols'">
                                                            {{ $t('sidebar.protocols') }}
                                                        </span>
                                                        <span v-if="item.name === 'Apps'">
                                                            {{ $t('sidebar.apps') }}
                                                        </span>
                                                        <span v-if="item.name === 'Time Logs'">
                                                            {{ $t('sidebar.timeLogs') }}
                                                        </span>
                                                    </div>
                                                    <Disclosure as="div" v-else v-slot="{ open }">
                                                        <DisclosureButton
                                                            :class="[item.activeRouteNames.includes($route.name) ? 'text-secondary-25' : 'text-secondary-100', 'group flex items-center w-full text-left rounded-md p-2 gap-x-3 text-sm leading-6 font-semibold text-secondary-25']">
                                                            <Icon :name="item.icon" class="h-5 w-5 shrink-0"
                                                                :class="[item.activeRouteNames.includes($route.name) ? 'text-secondary-25' : 'text-secondary-100']"
                                                                aria-hidden="true" />
                                                            {{ item.name }}
                                                            <Icon name="heroicons:chevron-right-20-solid"
                                                                :class="[open ? 'rotate-90 text-white' : 'text-secondary-100', 'ml-auto h-5 w-5 shrink-0']"
                                                                aria-hidden="true" />
                                                        </DisclosureButton>
                                                        <DisclosurePanel as="ul" class="mt-1 px-2">
                                                            <div v-for="subItem in item.children" :key="subItem.name">
                                                                <DisclosureButton as="div"
                                                                    @click="navigateTo(subItem.href)"
                                                                    :class="[subItem.current ? 'text-secondary-25' : 'text-secondary-100', 'py-2 pr-2 pl-9 flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold']">
                                                                    {{ subItem.name }}
                                                                </DisclosureButton>
                                                            </div>
                                                        </DisclosurePanel>
                                                    </Disclosure>
                                                </li>
                                            </ul>
                                        </li>
                                        <li class="mt-auto">
                                            <ModulesTimeRegistrationCheckInOut />
                                            <ModulesStorageIndicator />
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </TransitionRoot>

        <!-- Static sidebar for desktop -->
        <div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
            <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-primary border-r border-gray-200 px-6 pb-4">
                <div class="mt-5">
                    <span @click="navigateTo('/citizens')">
                        <LogoWhite />
                    </span>
                </div>
                <nav class="flex flex-1 flex-col">
                    <ul role="list" class="flex flex-1 flex-col gap-y-7">
                        <li>
                            <ul role="list" class="-mx-2 space-y-1">
                                <li v-for="item in navigation" :key="item.name">
                                    <div v-if="!item.children" @click="navigateTo(item.href)"
                                        :class="[item.activeRouteNames.includes($route.name) ? 'text-secondary-25' : 'text-secondary-100 hover:text-secondary-25', 'group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold cursor-pointer']">
                                        <Icon :name="item.icon" class="h-6 w-6 shrink-0" aria-hidden="true" />
                                        <span v-if="item.name === 'Citizens'">
                                            {{ $t('sidebar.citizens') }}
                                        </span>
                                        <span v-if="item.name === 'Calendar'">
                                            {{ $t('sidebar.calendar') }}
                                        </span>
                                        <span v-if="item.name === 'Duty Schedules'">
                                            {{ $t('sidebar.dutySchedules') }}
                                        </span>
                                        <span v-if="item.name === 'Employees'">
                                            {{ $t('sidebar.employees') }}
                                        </span>
                                        <span v-if="item.name === 'Departments'">
                                            {{ $t('sidebar.departments') }}
                                        </span>
                                        <span v-if="item.name === 'Protocols'">
                                            {{ $t('sidebar.protocols') }}
                                        </span>
                                        <span v-if="item.name === 'Apps'">
                                            {{ $t('sidebar.apps') }}
                                        </span>
                                        <span v-if="item.name === 'Time Logs'">
                                            {{ $t('sidebar.timeLogs') }}
                                        </span>
                                    </div>
                                    <Disclosure as="div" v-else v-slot="{ open }">
                                        <DisclosureButton
                                            :class="[item.activeRouteNames.includes($route.name) ? 'text-secondary-25' : 'text-secondary-100 hover:text-secondary-25 hover:bg-sky-500/10', 'group flex items-center w-full text-left rounded-md p-2 gap-x-3 text-sm leading-6 font-semibold text-secondary-25']">
                                            <Icon :name="item.icon" class="h-5 w-5 shrink-0 text-secondary-25"
                                                aria-hidden="true" />
                                            {{ item.name }}
                                            <Icon name="heroicons:chevron-right-20-solid"
                                                :class="[open ? 'rotate-90 text-secondary-25' : 'text-secondary-25 hover:text-secondary-100', 'ml-auto h-5 w-5 shrink-0']"
                                                aria-hidden="true" />
                                        </DisclosureButton>
                                        <DisclosurePanel as="ul" class="mt-1 px-2">
                                            <div v-for="subItem in item.children" :key="subItem.name">
                                                <DisclosureButton as="div" @click="navigateTo(subItem.href)"
                                                    :class="[subItem.current ? 'text-secondary-25' : 'text-secondary-25 hover:text-secondary-100 hover:bg-sky-500/10', 'py-2 pr-2 pl-9 flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold']">
                                                    {{ subItem.name }}
                                                </DisclosureButton>
                                            </div>
                                        </DisclosurePanel>
                                    </Disclosure>
                                </li>
                            </ul>
                        </li>
                        <li class="mt-auto">
                            <ModulesTimeRegistrationCheckInOut />
                            <ModulesStorageIndicator />
                        </li>
                    </ul>
                </nav>
            </div>
        </div>

        <div class="lg:pl-72">
            <div
                class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
                <button type="button" class="-m-2.5 p-2.5 text-gray-700 lg:hidden" @click="sidebarOpen = true">
                    <span class="sr-only">Open sidebar</span>
                    <Icon name="heroicons:bars-3" class="h-6 w-6" aria-hidden="true" />
                </button>

                <!-- Separator -->
                <div class="h-6 w-px bg-primary/10 lg:hidden" aria-hidden="true" />

                <div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                    <div
                        class="flex-1 flex flex-col justify-center gap-x-2 md:flex-row md:items-center md:justify-start">
                        <p class="text-sm md:text-base font-medium">
                            {{ userStore.getUser?.company?.name }}
                        </p>
                        <div class="text-xs">
                            <ModulesDepartmentSelection />
                        </div>
                    </div>
                    <div class="flex items-center gap-x-4 lg:gap-x-3">
                        <!-- <button type="button" class="-m-2.5 p-2.5 text-secondary-25 hover:text-gray-500">
                            <BellIcon class="h-6 w-6" aria-hidden="true" />
                        </button> -->

                        <button type="button" class="-m-2.5 p-2.5 text-sm hover:text-tertiary" @click="openSupport">
                            Support
                        </button>

                        <!-- Separator -->
                        <div class="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10" aria-hidden="true" />
                        <Menu as="div" class="relative">
                            <MenuButton class="-m-1.5 flex items-center p-1.5">
                                <span class="sr-only">Open user menu</span>
                                <img class="h-8 w-8 rounded-full bg-gray-50" src="/img/avatars/user.svg" alt="User" />
                                <span class="hidden lg:flex lg:items-center">
                                    <span class="ml-4 text-sm font-semibold leading-6 text-gray-700" aria-hidden="true">
                                        {{ userStore.getUser?.firstname }} {{ userStore.getUser?.lastname }}
                                    </span>
                                    <Icon name="heroicons:chevron-down-20-solid" class="ml-2 h-5 w-5 text-gray-700"
                                        aria-hidden="true" />
                                </span>
                            </MenuButton>
                            <transition enter-active-class="transition ease-out duration-100"
                                enter-from-class="transform opacity-0 scale-95"
                                enter-to-class="transform opacity-100 scale-100"
                                leave-active-class="transition ease-in duration-75"
                                leave-from-class="transform opacity-100 scale-100"
                                leave-to-class="transform opacity-0 scale-95">
                                <MenuItems
                                    class="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-sm bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                                    <MenuItem>
                                    <div class="cursor-pointer bg-gray-50 block px-3 py-3 text-sm leading-6 text-gray-900 hover:bg-gray-100"
                                        @click="navigateTo('/activity-logs')">
                                        <div class="flex items-center gap-x-2">
                                            <Icon name="ph:clock" class="h-5 w-5" aria-hidden="true" />
                                            {{ $t('navbar.activityLogs') }}
                                        </div>
                                    </div>
                                    </MenuItem>
                                    <MenuItem>
                                    <div class="cursor-pointer bg-gray-50 block px-3 py-3 text-sm leading-6 text-gray-900 hover:bg-gray-100"
                                        @click="selectLanguage">
                                        <div class="flex items-center gap-x-2">
                                            <img :src="identifyFlag()" alt="flag" class="w-5 h-5">
                                            {{ $t('navbar.switchLanguage') }}
                                        </div>
                                    </div>
                                    </MenuItem>
                                    <MenuItem>
                                    <div @click="navigateTo('/settings/profile')"
                                        class="cursor-pointer bg-gray-50 block px-3 py-3 text-sm leading-6 text-gray-900 hover:bg-gray-100">
                                        <div class="flex items-center gap-x-3">
                                            <Icon name="ph:gear" class="h-5 w-5" aria-hidden="true" />
                                            {{ $t('navbar.settings') }}
                                        </div>
                                    </div>
                                    </MenuItem>
                                    <MenuItem>
                                    <div @click="logout()"
                                        class="cursor-pointer bg-gray-50 block px-3 py-3 text-sm leading-6 text-gray-900 hover:bg-gray-100">
                                        <div class="flex items-center gap-x-3">
                                            <Icon name="ph:sign-out" class="h-5 w-5" aria-hidden="true" />
                                            {{ $t('navbar.logout') }}
                                        </div>
                                    </div>
                                    </MenuItem>
                                </MenuItems>
                            </transition>
                        </Menu>
                    </div>
                </div>
            </div>

            <main class="min-h-screen py-10">
                <div class="px-4 sm:px-6 lg:px-8">
                    <div>
                        <h1 class="text-2xl text-gray-900">
                            <slot name="header"></slot>
                        </h1>
                    </div>
                    <div class="mt-4">
                        <h3 class="text-lg text-gray-900">
                            <slot name="sub-header"></slot>
                        </h3>
                    </div>
                    <div class="mt-7 mb-14">
                        <slot />
                    </div>
                </div>
            </main>
        </div>
        <ModulesLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen"
            @close="state.slideOver.isLanguageSwitcherOpen = false" />
        <ModulesSupportSlideOver :isOpen="state.slideOver.isSupportOpen"
            @close="state.slideOver.isSupportOpen = false" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
    Dialog,
    DialogPanel,
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    TransitionChild,
    TransitionRoot,
} from '@headlessui/vue'
import { authService } from '@/components/api/AuthService'
import { userService } from '@/components/api/UserService'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"

const userStore = useUserStore()
const language = useI18n()

const navigation = [
    {
        name: 'Citizens',
        href: '/citizens',
        icon: 'pepicons-pencil:people',
        activeRouteNames: [
            'citizens',
            'citizens-new',
            'citizens-uuid-edit',
            'citizens-uuid-journals',
            'citizens-uuid-medicine-journals',
            'citizens-uuid-plans-and-goals',
            'citizens-uuid-documents',
            'citizens-uuid-documents-document_uuid',
            'citizens-uuid-attendance',
            'citizens-uuid-attendance-citizen_protocol_uuid',
            'citizens-uuid-logs',
        ]
    },
    {
        name: 'Calendar',
        href: '/calendar',
        icon: 'ph:calendar-blank',
        activeRouteNames: [
            'calendar'
        ]
    },
    {
        name: 'Duty Schedules',
        href: '/schedules',
        icon: 'ph:calendar-dots',
        activeRouteNames: [
            'schedules'
        ]
    },
    {
        name: 'Employees',
        href: '/employees',
        icon: 'ph:users-three',
        activeRouteNames: [
            'employees',
            'employees-new',
            'employees-edit-uuid',
        ]
    },
    {
        name: 'Departments',
        href: '/departments',
        icon: 'mdi:hexagon-multiple-outline',
        activeRouteNames: [
            'departments',
            'departments-new',
            'departments-edit-uuid',
        ]
    },
    {
        name: 'Protocols',
        href: '/protocols',
        icon: 'ic:outline-shield',
        activeRouteNames: [
            'protocols',
            'protocols-new',
            'protocols-uuid'
        ]
    },
    {
        name: 'Apps',
        href: '/apps',
        icon: 'ic:baseline-apps',
        activeRouteNames: [
            'apps'
        ]
    },
    {
        name: 'Time Logs',
        href: '/time-logs',
        icon: 'ph:clock',
        activeRouteNames: [
            'time-logs'
        ]
    },
]

const sidebarOpen = ref(false)

const state = reactive({
    error: [],
    isPageLoading: false,
    slideOver: {
        isLanguageSwitcherOpen: false,
        isSupportOpen: false
    },
})

onMounted(() => {
    fetchUser()
})

async function fetchUser() {
    try {
        const response = await userService.getUser()
        if (response?.data) {
            userStore.setUser(response?.data)
            userStore.setLanguage(response?.data?.language?.code)
            language.locale.value = response?.data?.language?.code
        }
    } catch (error: any) {
        state.error = error
    }
}

async function logout() {
    state.isPageLoading = true
    try {
        const response = await authService.logout()
        if (response) {
            localStorage.removeItem("_token")
            userStore.resetUser()
            navigateTo('/')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function openSupport() {
    state.slideOver.isSupportOpen = true
}

function selectLanguage() {
    state.slideOver.isLanguageSwitcherOpen = true
}

function identifyFlag() {
    const selectedLanguage = userStore.getLanguage
    if (selectedLanguage === 'en') {
        return '/img/icons/flags/united-states-of-america.svg'
    } else {
        if (selectedLanguage === 'dk') {
            return '/img/icons/flags/denmark.svg'
        }
    }
}
</script>