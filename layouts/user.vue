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
                                    <span @click="navigateTo('/daily-overview')">
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
                                                        <span v-if="item.name === 'Daily overview'">
                                                            {{ $t('sidebar.dailyOverview') }}
                                                        </span>
                                                        <span v-if="item.name === 'Citizens'">
                                                            {{ customPagesStore.getCustomPagesName?.citizens }}
                                                        </span>
                                                        <span v-if="item.name === 'Calendar'">
                                                            {{ $t('sidebar.calendar') }}
                                                        </span>
                                                        <span v-if="item.name === 'Duty schedules'">
                                                            {{ customPagesStore.getCustomPagesName?.dutySchedules }}
                                                        </span>
                                                        <span v-if="item.name === 'Procedures'">
                                                            {{ $t('sidebar.procedures') }}
                                                        </span>
                                                        <span v-if="item.name === 'Protocols'">
                                                            {{ $t('sidebar.protocols') }}
                                                        </span>
                                                        <span v-if="item.name === 'Documents'">
                                                            {{ $t('sidebar.documents') }}
                                                        </span>
                                                        <span v-if="item.name === 'Bullet Board'">
                                                            {{ $t('sidebar.bulletBoard') }}
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
                                                <li>
                                                    <div @click="navigateTo('/findsocialetilbud.dk')"
                                                        :class="[['findsocialetilbud.dk'].includes($route.name as string) ? 'text-secondary-25' : 'text-secondary-100 hover:text-secondary-25', 'group flex gap-x-2.5 rounded-md p-2 text-sm leading-6 font-semibold']">
                                                        <img src="/img/findsocialetilbud-icon.png"
                                                            alt="FindSocialeTilbud.dk" class="h-5 w-5 shrink-0" />
                                                        FindSocialeTilbud.dk
                                                    </div>
                                                </li>
                                            </ul>
                                        </li>
                                        <li class="mt-auto space-y-2">
                                            <ModulesUserTimeRegistrationCheckInOut />
                                            <ModulesUserSidebarSubscribeButton
                                                v-if="state.showSubscribeButton && userStore.getUser?.user_subscription === null" />
                                            <ModulesUserSidebarCompanyId />
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
            <div class="overflow-clip relative flex grow flex-col gap-y-5 bg-primary px-6 pb-4 shadow-right">

                <img src="/img/icons/asset-02.svg" alt="Image failed to load"
                    class="z-10 w-screen absolute -bottom-32 -left-32 opacity-25">

                <div class="z-20 mt-5">
                    <span @click="navigateTo('/daily-overview')">
                        <LogoWhite />
                    </span>
                </div>
                <nav class="z-20 flex flex-1 flex-col mt-3">
                    <ul role="list" class="flex flex-1 flex-col gap-y-7">
                        <li>
                            <ul role="list" class="-mx-2 space-y-1">
                                <li v-for="item in navigation" :key="item.name">
                                    <div v-if="!item.children" @click="navigateTo(item.href)"
                                        :class="[item.activeRouteNames.includes($route.name) ? 'text-secondary-25' : 'text-secondary-100 hover:text-secondary-25', 'group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold cursor-pointer']">
                                        <Icon :name="item.icon" class="h-6 w-6 shrink-0" aria-hidden="true" />
                                        <span v-if="item.name === 'Daily overview'">
                                            {{ $t('sidebar.dailyOverview') }}
                                        </span>
                                        <span v-if="item.name === 'Citizens'">
                                            {{ customPagesStore.getCustomPagesName?.citizens }}
                                        </span>
                                        <span v-if="item.name === 'Calendar'">
                                            {{ $t('sidebar.calendar') }}
                                        </span>
                                        <span v-if="item.name === 'Duty schedules'">
                                            {{ customPagesStore.getCustomPagesName?.dutySchedules }}
                                        </span>
                                        <span v-if="item.name === 'Procedures'">
                                            {{ $t('sidebar.procedures') }}
                                        </span>
                                        <span v-if="item.name === 'Protocols'">
                                            {{ $t('sidebar.protocols') }}
                                        </span>
                                        <span v-if="item.name === 'Documents'">
                                            {{ $t('sidebar.documents') }}
                                        </span>
                                        <span v-if="item.name === 'Bullet Board'">
                                            {{ $t('sidebar.bulletBoard') }}
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
                                <li>
                                    <div @click="navigateTo('/findsocialetilbud.dk')" :class="[
                                        ['findsocialetilbud.dk'].includes($route.name as string)
                                            ? 'text-secondary-25'
                                            : 'text-secondary-100 hover:text-secondary-25',
                                        userStore.getInTutorial && routeName === 'findsocialetilbud.dk'
                                        && 'border-4 border-white bg-primary-700',
                                        'group flex gap-x-2.5 rounded-md p-3 text-sm leading-6 font-semibold cursor-pointer'
                                    ]">
                                        <img src="/img/findsocialetilbud-icon.png" alt="FindSocialeTilbud.dk"
                                            class="h-6 w-6 shrink-0" />
                                        FindSocialeTilbud.dk
                                    </div>
                                </li>
                            </ul>
                        </li>
                        <li class="mt-auto space-y-2">
                            <ModulesUserTimeRegistrationCheckInOut />
                            <ModulesUserSidebarCompanyId />
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
                        <p class="text-sm md:text-base font-medium truncate max-w-24 md:max-w-fit">
                            {{ userStore.getUser?.company?.name }}
                        </p>
                        <div class="text-xs">
                            <ModulesUserDepartmentSelection />
                        </div>
                    </div>
                    <div class="flex items-center gap-x-1 lg:gap-x-3">
                        <ModulesUserNavbarSubscribeButton
                            v-if="state.showSubscribeButton && userStore.getUser?.user_subscription === null"
                            class="hidden md:block" />
                        <button type="button" class="mr-4 p-2.5 relative text-primary hover:text-primary-700"
                            @click="navigateTo('/journal-notifications')">
                            <Icon name="ph:bell" class="h-6 w-6 absolute top-0 left-0" aria-hidden="true" />
                            <Badge type="notification" class="w-fit absolute -top-4 left-4">
                                {{ userStore.getUser?.unread_notification_count ?? 0 }}
                            </Badge>
                        </button>

                        <button type="button" class="mr-4 p-2.5 relative text-primary hover:text-primary-700"
                            @click="navigateTo('/messages')">
                            <Icon name="ph:chat-circle" class="h-6 w-6 absolute top-0 left-0" aria-hidden="true" />
                            <Badge type="notification" class="w-fit absolute -top-4 left-4">
                                {{ userStore.getUser?.unread_messages_count ?? 0 }}
                            </Badge>
                        </button>

                        <!-- Separator -->
                        <div class="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10" aria-hidden="true" />

                        <button type="button"
                            class="-m-2.5 p-2.5 flex items-center gap-x-2 text-sm text-primary hover:text-primary-700"
                            @click="openSupport">
                            <Icon name="material-symbols:support" class="ml-2 h-8 w-8 md:w-6 md:h-6"
                                aria-hidden="true" />
                            <span class="hidden md:block">Support</span>
                        </button>

                        <!-- Separator -->
                        <div class="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10" aria-hidden="true" />
                        <Menu as="div" class="relative">
                            <MenuButton class="-m-1.5 flex items-center p-1.5">
                                <span class="sr-only">Open user menu</span>
                                <img class="h-8 w-8 rounded-full bg-gray-50 object-cover"
                                    :src="userStore.getUser?.profile_image ? userStore.getUser?.profile_image : '/img/avatars/user.svg'"
                                    alt="User" />
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
                                    <div @click="navigateTo('/settings/profile')"
                                        class="cursor-pointer bg-gray-50 block px-3 py-3 text-sm leading-6 text-gray-900 hover:bg-gray-100">
                                        <div class="flex items-center gap-x-3">
                                            <Icon name="ph:gear" class="h-5 w-5" aria-hidden="true" />
                                            {{ $t('navbar.settings') }}
                                        </div>
                                    </div>
                                    </MenuItem>
                                    <MenuItem>
                                    <div @click="navigateTo('/employees')"
                                        class="cursor-pointer bg-gray-50 block px-3 py-3 text-sm leading-6 text-gray-900 hover:bg-gray-100">
                                        <div class="flex items-center gap-x-3">
                                            <Icon name="ph:users-three" class="h-5 w-5" aria-hidden="true" />
                                            {{ $t('navbar.colleagues') }}
                                        </div>
                                    </div>
                                    </MenuItem>
                                    <MenuItem>
                                    <div @click="navigateTo('/apps')"
                                        class="cursor-pointer bg-gray-50 block px-3 py-3 text-sm leading-6 text-gray-900 hover:bg-gray-100">
                                        <div class="flex items-center gap-x-3">
                                            <Icon name="ic:baseline-apps" class="h-5 w-5" aria-hidden="true" />
                                            {{ $t('navbar.apps') }}
                                        </div>
                                    </div>
                                    </MenuItem>
                                    <MenuItem>
                                    <div @click="navigateTo('/reminders')"
                                        class="cursor-pointer bg-gray-50 block px-3 py-3 text-sm leading-6 text-gray-900 hover:bg-gray-100">
                                        <div class="flex items-center gap-x-3">
                                            <Icon name="ph:note-pencil" class="h-5 w-5" aria-hidden="true" />
                                            {{ $t('navbar.reminders') }}
                                        </div>
                                    </div>
                                    </MenuItem>
                                    <MenuItem>
                                    <div @click="navigateTo('/forms')"
                                        class="cursor-pointer bg-gray-50 block px-3 py-3 text-sm leading-6 text-gray-900 hover:bg-gray-100">
                                        <div class="flex items-center gap-x-3">
                                            <Icon name="ph:list-numbers" class="h-5 w-5" aria-hidden="true" />
                                            {{ $t('navbar.forms') }}
                                        </div>
                                    </div>
                                    </MenuItem>
                                    <MenuItem>
                                    <div @click="navigateTo('/procedures')"
                                        class="cursor-pointer bg-gray-50 block px-3 py-3 text-sm leading-6 text-gray-900 hover:bg-gray-100">
                                        <div class="flex items-center gap-x-3">
                                            <Icon name="ph:list-checks" class="h-5 w-5" aria-hidden="true" />
                                            {{ $t('navbar.procedures') }}
                                        </div>
                                    </div>
                                    </MenuItem>
                                    <MenuItem>
                                    <div @click="state.modal.isContactUsOpen = true"
                                        class="cursor-pointer bg-gray-50 block px-3 py-3 text-sm leading-6 text-gray-900 hover:bg-gray-100">
                                        <div class="flex items-center gap-x-3">
                                            <Icon name="ph:shooting-star" class="h-5 w-5" aria-hidden="true" />
                                            {{ $t('navbar.newWishes') }}
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

            <div class="relative overflow-clip">
                <img src="/img/icons/asset-01.svg" alt="Image failed to load"
                    class="w-52 md:w-1/4 absolute -top-28 -right-24 opacity-0 transition-opacity duration-500"
                    id="animatedImage">
                <main class="py-10 relative">
                    <div class="px-4 sm:px-6 lg:px-8">
                        <div>
                            <slot name="breadcrumb"></slot>
                        </div>
                        <div class="mt-4">
                            <h1 class="text-2xl text-primary font-bold">
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
        </div>
        <ModulesUserReminderCheckIn :isModalOpen="state.modal.isCheckinReminderOpen"
            @close="state.modal.isCheckinReminderOpen = false" />
        <ModulesUserLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen"
            @close="state.slideOver.isLanguageSwitcherOpen = false" />
        <ModulesUserSupportSlideOver :isOpen="state.slideOver.isSupportOpen"
            @close="state.slideOver.isSupportOpen = false" />
        <ModulesUserWishListModalContactUs :isModalOpen="state.modal.isContactUsOpen"
            @close="state.modal.isContactUsOpen = false" v-if="state.modal.isContactUsOpen" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import moment from 'moment'

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
import { useCustomPagesStore } from '@/store/custom-pages'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const userStore = useUserStore() as any
const customPagesStore = useCustomPagesStore() as any
const language = useI18n()
const router = useRouter()
const routeName = router?.currentRoute?.value?.name

const navigation = [
    {
        name: 'Daily overview',
        href: '/daily-overview',
        icon: 'material-symbols:dashboard',
        activeRouteNames: [
            'daily-overview',
        ]
    },
    {
        name: 'Citizens',
        href: '/citizens',
        icon: 'heroicons:user-group',
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
            'citizens-uuid-calendar',
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
        name: 'Duty schedules',
        href: '/schedules',
        icon: 'ph:calendar-dots',
        activeRouteNames: [
            'schedules',
            'schedules-draft'
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
        name: 'Documents',
        href: '/drive',
        icon: 'ph:folder',
        activeRouteNames: [
            'drive'
        ]
    },
    {
        name: 'Bullet Board',
        href: '/news',
        icon: 'ph:newspaper',
        activeRouteNames: [
            'news',
            'news-new',
            'news-edit-uuid',
        ]
    },
] as any

const sidebarOpen = ref(false)

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    modal: {
        isCheckinReminderOpen: false,
        isContactUsOpen: false,
    },
    showSubscribeButton: false,
    slideOver: {
        isLanguageSwitcherOpen: false,
        isSupportOpen: false
    },
})

onMounted(() => {
    fetchUser()
    animateAssets()
})

watch(() => userStore.getUser, (user: any) => {
    if (user) {
        setCustomPageNames()
        state.showSubscribeButton = true
    }
})

watch(() => language.locale.value, () => {
    setCustomPageNames()
})

function setCustomPageNames() {
    const selectedLanguage = language.locale.value
    const customPageCitizens = customPage('citizens')
    const customPageDutySchedules = customPage('duty_schedules')
    const customPageRiskAssessment = customPage('risk_assessment')
    const customNameGiveMedicine = customPage('give_medicine')
    const citizensName = selectedLanguage === 'en' ? customPageCitizens?.en_name : customPageCitizens?.dk_name
    const dutySchedulesName = selectedLanguage === 'en' ? customPageDutySchedules?.en_name : customPageDutySchedules?.dk_name
    const riskAssessmentName = selectedLanguage === 'en' ? customPageRiskAssessment?.en_name : customPageRiskAssessment?.dk_name
    const giveMedicineName = selectedLanguage === 'en' ? customNameGiveMedicine?.en_name : customNameGiveMedicine?.dk_name
    customPagesStore.setCitizensNaming(citizensName)
    customPagesStore.setDutySchedulesNaming(dutySchedulesName)
    customPagesStore.setRiskAssessmentNaming(riskAssessmentName)
    customPagesStore.setGiveMedicineNaming(giveMedicineName)
}

function customPage(page: String) {
    return userStore.getUser?.custom_pages?.find((item: any) => item.page_type ===
        page)
}

function animateAssets() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in')
            } else {
                entry.target.classList.remove('animate-fade-in')
            }
        })
    })

    const image = document.getElementById('animatedImage') as any
    observer.observe(image)
}

async function fetchUser() {
    state.error = {}
    try {
        const response = await userService.getUser()
        if (response?.data) {
            userStore.setUser(response?.data)
            userStore.setLanguage(response?.data?.language?.code)
            language.locale.value = response?.data?.language?.code
            checkInReminderModalVisibility(response)
        }
    } catch (error: any) {
        state.error = error
    }
}

function checkInReminderModalVisibility(response: any) {
    const lastHidden = localStorage.getItem('checkInReminderHidden')
    const today = moment().format('YYYY-MM-DD')
    const checkinEnabled = response?.data?.checkin_enabled ?? false

    if (lastHidden !== today && checkinEnabled) {
        userStore.resetIsCheckInNow()
        if (localStorage.getItem('isFirstTime') !== null) {
            state.modal.isCheckinReminderOpen = true
        }
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