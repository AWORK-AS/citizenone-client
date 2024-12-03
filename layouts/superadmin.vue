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
                                    <span @click="navigateTo('/superadmin/dashboard')">
                                        <LogoWhite />
                                    </span>
                                </div>
                                <nav class="flex flex-1 flex-col mt-3">
                                    <ul role="list" class="flex flex-1 flex-col gap-y-7">
                                        <li>
                                            <ul role="list" class="-mx-2 space-y-1">
                                                <li v-for="item in navigation" :key="item.name">
                                                    <div v-if="!item.children" @click="navigateTo(item.href)"
                                                        :class="[item.activeRouteNames.includes($route.name) ? 'text-secondary-25' : 'text-secondary-100', 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold']">
                                                        <Icon :name="item.icon" class="h-5 w-5 shrink-0"
                                                            :class="[item.activeRouteNames.includes($route.name) ? 'text-secondary-25' : 'text-secondary-100']"
                                                            aria-hidden="true" />
                                                        <span v-if="item.name === 'Dashboard'">
                                                            {{ $t('superadmin.sidebar.dashboard') }}
                                                        </span>
                                                        <span v-if="item.name === 'Companies'">
                                                            {{ $t('superadmin.sidebar.companies') }}
                                                        </span>
                                                        <span v-if="item.name === 'Invoices'">
                                                            {{ $t('superadmin.sidebar.invoices') }}
                                                        </span>
                                                        <span v-if="item.name === 'Coupons'">
                                                            {{ $t('superadmin.sidebar.coupons') }}
                                                        </span>
                                                        <span v-if="item.name === 'Sales Campaign'">
                                                            {{ $t('superadmin.sidebar.salesCampaign') }}
                                                        </span>
                                                        <span v-if="item.name === 'Polls'">
                                                            {{ $t('superadmin.sidebar.polls') }}
                                                        </span>
                                                        <span v-if="item.name === 'Apps'">
                                                            {{ $t('superadmin.sidebar.apps') }}
                                                        </span>
                                                        <span v-if="item.name === 'Orders'">
                                                            {{ $t('superadmin.sidebar.orders') }}
                                                        </span>
                                                        <span v-if="item.name === 'Users'">
                                                            {{ $t('superadmin.sidebar.users') }}
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
                    <span @click="navigateTo('/superadmin/dashboard')">
                        <LogoWhite />
                    </span>
                </div>
                <nav class="flex flex-1 flex-col mt-3">
                    <ul role="list" class="flex flex-1 flex-col gap-y-7">
                        <li>
                            <ul role="list" class="-mx-2 space-y-1">
                                <li v-for="item in navigation" :key="item.name">
                                    <div v-if="!item.children" @click="navigateTo(item.href)"
                                        :class="[item.activeRouteNames.includes($route.name) ? 'text-secondary-25' : 'text-secondary-100 hover:text-secondary-25', 'group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold cursor-pointer']">
                                        <Icon :name="item.icon" class="h-6 w-6 shrink-0" aria-hidden="true" />
                                        <span v-if="item.name === 'Dashboard'">
                                            {{ $t('superadmin.sidebar.dashboard') }}
                                        </span>
                                        <span v-if="item.name === 'Companies'">
                                            {{ $t('superadmin.sidebar.companies') }}
                                        </span>
                                        <span v-if="item.name === 'Invoices'">
                                            {{ $t('superadmin.sidebar.invoices') }}
                                        </span>
                                        <span v-if="item.name === 'Coupons'">
                                            {{ $t('superadmin.sidebar.coupons') }}
                                        </span>
                                        <span v-if="item.name === 'Sales Campaign'">
                                            {{ $t('superadmin.sidebar.salesCampaign') }}
                                        </span>
                                        <span v-if="item.name === 'Polls'">
                                            {{ $t('superadmin.sidebar.polls') }}
                                        </span>
                                        <span v-if="item.name === 'Apps'">
                                            {{ $t('superadmin.sidebar.apps') }}
                                        </span>
                                        <span v-if="item.name === 'Orders'">
                                            {{ $t('superadmin.sidebar.orders') }}
                                        </span>
                                        <span v-if="item.name === 'Users'">
                                            {{ $t('superadmin.sidebar.users') }}
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
                    </ul>
                </nav>
            </div>
        </div>

        <div class="lg:pl-72 bg-gray-50 min-h-screen">
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
                    </div>
                    <div class="flex items-center gap-x-4 lg:gap-x-3">
                        <!-- <button type="button" class="-m-2.5 p-2.5 text-secondary-25 hover:text-gray-500">
                            <BellIcon class="h-6 w-6" aria-hidden="true" />
                        </button> -->

                        <!-- Separator -->
                        <!-- <div class="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10" aria-hidden="true" /> -->
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
                                        @click="selectLanguage">
                                        <div class="flex items-center gap-x-2">
                                            <img :src="identifyFlag()" alt="flag" class="w-5 h-5">
                                            {{ $t('navbar.switchLanguage') }}
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

            <main class="py-10">
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
                    <div>
                        <slot />
                    </div>
                </div>
            </main>
        </div>
        <ModulesLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen"
            @close="state.slideOver.isLanguageSwitcherOpen = false" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
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
import { authService } from '@/components/api/superadmin/AuthService'
import { userService } from '@/components/api/superadmin/UserService'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const userStore = useUserStore() as any
const language = useI18n()

const navigation = [
    {
        name: 'Dashboard',
        href: '/superadmin/dashboard',
        icon: 'material-symbols:dashboard',
        activeRouteNames: [
            'superadmin-dashboard'
        ]
    },
    {
        name: 'Companies',
        href: '/superadmin/companies',
        icon: 'ph:users-four',
        activeRouteNames: [
            'superadmin-companies',
            'superadmin-companies-new',
            'superadmin-companies-company_uuid-edit',
            'superadmin-companies-company_uuid-accounts',
            'superadmin-companies-company_uuid-accounts-new',
            'superadmin-companies-company_uuid-accounts-account_uuid-edit',
            'superadmin-companies-company_uuid-license-overview',
            'superadmin-companies-company_uuid-apps',
        ]
    },
    {
        name: 'Invoices',
        href: '/superadmin/invoices',
        icon: 'ph:invoice',
        activeRouteNames: [
            'superadmin-invoices',
            'superadmin-invoices-invoice_uuid',
        ]
    },
    {
        name: 'Coupons',
        href: '/superadmin/coupons',
        icon: 'ic:outline-discount',
        activeRouteNames: [
            'superadmin-coupons',
            'superadmin-coupons-new',
            'superadmin-coupons-couponUuid-edit',
        ]
    },
    {
        name: 'Sales Campaign',
        href: '/superadmin/sales-campaign',
        icon: 'ph:megaphone-simple',
        activeRouteNames: [
            'superadmin-sales-campaign',
            'superadmin-sales-campaign-new',
            'superadmin-sales-campaign-edit-uuid',
        ]
    },
    {
        name: 'Polls',
        href: '/superadmin/polls',
        icon: 'ph:chart-bar-horizontal',
        activeRouteNames: [
            'superadmin-polls',
            'superadmin-polls-new',
            'superadmin-polls-pollUuid',
            'superadmin-polls-pollUuid-edit',
            'superadmin-polls-pollUuid-pollItemUuid',
            'superadmin-polls-pollUuid-new',
            'superadmin-polls-pollUuid-pollItemUuid-edit',
        ]
    },
    {
        name: 'Apps',
        href: '/superadmin/apps',
        icon: 'ic:baseline-apps',
        activeRouteNames: [
            'superadmin-apps',
            'superadmin-apps-new',
            'superadmin-apps-appUuid-edit',
        ]
    },
    {
        name: 'Orders',
        href: '/superadmin/orders',
        icon: 'ph:database',
        activeRouteNames: [
            'superadmin-orders',
        ]
    },
    {
        name: 'Users',
        href: '/superadmin/users',
        icon: 'ph:users-three',
        activeRouteNames: [
            'superadmin-users',
            'superadmin-users-new',
            'superadmin-users-edit-uuid',
        ]
    },
] as any

const sidebarOpen = ref(false)

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    slideOver: {
        isLanguageSwitcherOpen: false
    },
})

onMounted(() => {
    fetchUser()
})

async function fetchUser() {
    state.error = {}
    try {
        const response = await userService.getCurrentUser()
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
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await authService.logout()
        if (response) {
            localStorage.removeItem("_token")
            userStore.resetUser()
            navigateTo('/superadmin')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
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