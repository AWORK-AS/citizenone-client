<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <!-- Search Overlay -->
        <Teleport to="body">
            <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0"
                enter-to-class="opacity-100" leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100" leave-to-class="opacity-0">
                <div v-if="state.isSearchOpen" class="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm"
                    @click="state.isSearchOpen = false">
                    <div class="flex items-start justify-center pt-[15vh]" @click.stop>
                        <div class="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-surface-200 overflow-hidden">
                            <div class="flex items-center gap-3 px-5 py-4 border-b border-surface-100">
                                <Icon name="heroicons:magnifying-glass" class="h-5 w-5 text-slate-400 shrink-0" />
                                <input ref="searchInput" v-model="state.searchQuery" type="text"
                                    placeholder="Søg på borgere, journaler, medicin og mere..."
                                    class="flex-1 text-base text-slate-700 placeholder-slate-400 outline-none bg-transparent"
                                    @keyup.enter="executeSearch" />
                                <button @click="state.isSearchOpen = false" class="p-1 rounded-md hover:bg-surface-100 text-slate-400 hover:text-slate-600 transition-colors">
                                    <Icon name="heroicons:x-mark" class="h-5 w-5" />
                                </button>
                            </div>
                            <div class="max-h-80 overflow-y-auto">
                                <div class="px-5 py-6 text-center text-sm text-slate-400" v-if="!state.searchQuery">
                                    Skriv for at søge på tværs af borgere, journaler, medicin og mere...
                                </div>
                                <div class="px-5 py-6 text-center text-sm text-slate-400" v-else-if="state.isSearching">
                                    Søger efter "{{ state.searchQuery }}"...
                                </div>
                                <div class="px-5 py-6 text-center text-sm text-slate-400" v-else>
                                    Ingen resultater fundet for "{{ state.searchQuery }}"
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- Mobile sidebar -->
        <TransitionRoot as="template" :show="sidebarOpen">
            <Dialog as="div" class="relative z-50 lg:hidden" @close="sidebarOpen = false">
                <TransitionChild as="template" enter="transition-opacity ease-linear duration-300"
                    enter-from="opacity-0" enter-to="opacity-100" leave="transition-opacity ease-linear duration-300"
                    leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
                </TransitionChild>
                <div class="fixed inset-0 flex">
                    <TransitionChild as="template" enter="transition ease-in-out duration-300 transform"
                        enter-from="-translate-x-full" enter-to="translate-x-0"
                        leave="transition ease-in-out duration-300 transform" leave-from="translate-x-0"
                        leave-to="-translate-x-full">
                        <DialogPanel class="relative mr-16 flex w-full max-w-[17rem] flex-1">
                            <TransitionChild as="template" enter="ease-in-out duration-300" enter-from="opacity-0"
                                enter-to="opacity-100" leave="ease-in-out duration-300" leave-from="opacity-100"
                                leave-to="opacity-0">
                                <div class="absolute left-full top-0 flex w-16 justify-center pt-5">
                                    <button type="button" class="-m-2.5 p-2.5" @click="sidebarOpen = false">
                                        <Icon name="heroicons:x-mark" class="h-6 w-6 text-white" aria-hidden="true" />
                                    </button>
                                </div>
                            </TransitionChild>
                            <div class="flex grow flex-col overflow-y-auto bg-gradient-to-b from-sidebar to-sidebar-dark">
                                <div class="flex items-center h-16 px-5">
                                    <span @click="navigateTo('/overview')" class="cursor-pointer">
                                        <LogoWhite />
                                    </span>
                                </div>
                                <nav class="flex flex-1 flex-col px-3 mt-2">
                                    <ul role="list" class="flex flex-1 flex-col gap-y-1">
                                        <li>
                                            <ul role="list" class="space-y-0.5">
                                                <li v-for="item in navigation" :key="item.name">
                                                    <div @click="navigateTo(item.href); sidebarOpen = false"
                                                        :class="[item.activeRouteNames.includes($route.name) ? 'sidebar-item sidebar-item-active' : 'sidebar-item sidebar-item-inactive']">
                                                        <Icon :name="item.icon" class="h-5 w-5 shrink-0" aria-hidden="true" />
                                                        <span>{{ getNavItemLabel(item) }}</span>
                                                    </div>
                                                </li>
                                            </ul>
                                        </li>
                                        <li class="mt-auto pb-4 space-y-2">
                                            <ModulesUserTimeRegistrationCheckInOut v-if="userStore.getUser?.checkin_enabled" />
                                            <ModulesUserSidebarSubscribeButton v-if="state.showSubscribeButton && userStore.getUser?.user_subscription === null" />
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

        <!-- Desktop sidebar: collapsible -->
        <div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300 ease-in-out"
            :class="sidebarExpanded ? 'lg:w-[17rem]' : 'lg:w-[4.5rem]'"
            @mouseenter="handleSidebarHover(true)"
            @mouseleave="handleSidebarHover(false)">
            <div class="flex grow flex-col overflow-y-auto overflow-x-hidden bg-gradient-to-b from-sidebar to-sidebar-dark shadow-sidebar">
                <!-- Logo + Pin -->
                <div :class="['flex items-center justify-between h-16 flex-shrink-0', sidebarExpanded ? 'px-4' : 'px-5']">
                    <span @click="navigateTo('/overview')" class="cursor-pointer flex items-center gap-x-2.5 overflow-hidden">
                        <img src="/favicon.ico" alt="CitizenOne" class="w-8 h-8 shrink-0 rounded" />
                        <span v-show="sidebarExpanded" class="text-white font-semibold text-base whitespace-nowrap">
                            CitizenOne<sup class="text-[8px]">™</sup>
                        </span>
                    </span>
                    <button v-show="sidebarExpanded" @click="toggleSidebarPin"
                        class="p-1.5 rounded-md text-blue-300/60 hover:text-white hover:bg-white/10 transition-colors"
                        :title="sidebarPinned ? 'Frigør sidebar' : 'Fastgør sidebar'">
                        <Icon :name="sidebarPinned ? 'ph:push-pin-fill' : 'ph:push-pin'" class="h-4 w-4" />
                    </button>
                </div>

                <!-- Nav items -->
                <nav class="flex flex-1 flex-col px-3 mt-1 custom-scrollbar">
                    <ul role="list" class="flex flex-1 flex-col gap-y-1">
                        <li>
                            <ul role="list" class="space-y-0.5">
                                <li v-for="item in navigation" :key="item.name">
                                    <div @click="navigateTo(item.href)"
                                        :class="[
                                            item.activeRouteNames.includes($route.name) ? 'sidebar-item sidebar-item-active' : 'sidebar-item sidebar-item-inactive',
                                            !sidebarExpanded && 'justify-center px-2'
                                        ]"
                                        :title="!sidebarExpanded ? getNavItemLabel(item) : ''">
                                        <Icon :name="item.icon" class="h-5 w-5 shrink-0" aria-hidden="true" />
                                        <span v-show="sidebarExpanded" class="whitespace-nowrap">{{ getNavItemLabel(item) }}</span>
                                    </div>
                                </li>
                                <li v-if="!state.isSidebarLoading && userStore.getUser?.industry === 'Social welfare services' && userStore.getUser?.role === 'Admin'">
                                    <div @click="navigateTo('/findsocialetilbud.dk')"
                                        :class="[
                                            ['findsocialetilbud.dk'].includes($route.name as string) ? 'sidebar-item sidebar-item-active' : 'sidebar-item sidebar-item-inactive',
                                            !sidebarExpanded && 'justify-center px-2'
                                        ]"
                                        :title="!sidebarExpanded ? 'FindSocialeTilbud.dk' : ''">
                                        <img src="/img/findsocialetilbud-icon.png" alt="FindSocialeTilbud.dk" class="h-5 w-5 shrink-0" />
                                        <span v-show="sidebarExpanded" class="whitespace-nowrap">FindSocialeTilbud.dk</span>
                                    </div>
                                </li>
                            </ul>
                        </li>

                        <li class="mt-auto pb-4 space-y-2">
                            <ModulesUserTimeRegistrationCheckInOut v-if="userStore.getUser?.checkin_enabled" />
                            <div v-show="sidebarExpanded">
                                <ModulesUserSidebarCompanyId />
                            </div>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>

        <!-- Main content -->
        <div class="bg-surface-50 min-h-screen transition-all duration-300 ease-in-out"
            :class="sidebarExpanded ? 'lg:pl-[17rem]' : 'lg:pl-[4.5rem]'">
            <!-- Navbar -->
            <div class="sticky top-0 z-[51] flex h-16 shrink-0 items-center gap-x-3 bg-white/95 backdrop-blur-md border-b border-surface-200 px-4 sm:px-6 lg:px-6">
                <button type="button" class="-m-2.5 p-2.5 text-slate-500 lg:hidden" @click="sidebarOpen = true">
                    <Icon name="heroicons:bars-3" class="h-6 w-6" aria-hidden="true" />
                </button>
                <div class="h-6 w-px bg-slate-200 lg:hidden" aria-hidden="true" />

                <div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                    <div class="flex-1 flex flex-col justify-center gap-x-2 md:flex-row md:items-center md:justify-start relative z-[45]">
                        <div class="flex flex-col justify-center gap-x-2 xl:flex-row xl:items-center xl:justify-start">
                            <div><ModulesUserCompanySelection /></div>
                            <div><ModulesUserDepartmentSelection /></div>
                        </div>
                        <div><ModulesUserNavbarAiAssistant class="hidden xl:block" /></div>
                        <div>
                            <ModulesUserNavbarSubscribeButton
                                v-if="state.showSubscribeButton && userStore.getUser?.user_subscription === null"
                                class="hidden md:block" />
                        </div>
                    </div>
                    <div class="flex items-center gap-x-1 lg:gap-x-2">
                        <!-- AI (mobile) -->
                        <div class="xl:hidden">
                            <FormButton buttonStyle="AI" buttonSize="xs" class="px-0 md:px-4"
                                @click="userStore.getUser?.has_ai_access ? state.modal.isAIAssistantOpen = true : navigateTo('/apps')">
                                <Icon name="ic:round-accessibility" class="h-6 w-6 md:w-5 md:h-5" aria-hidden="true" />
                                <p class="text-sm font-semibold hidden lg:block">{{ $t('assistants.askAI') }}</p>
                            </FormButton>
                        </div>

                        <!-- News / Megaphone -->
                        <button type="button" class="relative flex items-center gap-x-1 text-sm text-primary hover:text-primary-700 p-2 rounded-lg hover:bg-surface-100 transition-colors"
                            @click="navigateToNews()">
                            <Icon name="ph:megaphone" class="h-5 w-5" aria-hidden="true" />
                            <Badge type="notification" class="w-4.5 h-4.5 flex items-center justify-center absolute -top-0.5 -right-0.5 text-[10px]"
                                v-if="!userStore.getUser?.is_read_news">
                                {{ userStore?.getUnreadNewsCount }}
                            </Badge>
                        </button>

                        <ModulesUserNavbarNewUpdates @fetchUser="fetchUser" />

                        <!-- Notification Bell -->
                        <ModulesUserNavbarNotificationBell />

                        <!-- Journal Notifications -->
                        <button type="button" class="p-2 relative rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100 transition-colors"
                            @click="navigateTo('/journal-notifications')"
                            v-if="userStore.getUser?.unread_notification_count > 0">
                            <Icon name="ph:note" class="h-5 w-5" aria-hidden="true" />
                            <Badge type="notification" class="w-4.5 h-4.5 flex items-center justify-center absolute -top-0.5 -right-0.5 text-[10px]">
                                {{ userStore.getUser?.unread_notification_count ?? 0 }}
                            </Badge>
                        </button>

                        <!-- Unread Messages -->
                        <button type="button" class="p-2 relative rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100 transition-colors"
                            @click="navigateTo('/messages')" v-if="userStore.getUser?.unread_messages_count > 0">
                            <Icon name="ph:chat-circle" class="h-5 w-5" aria-hidden="true" />
                            <Badge type="notification" class="w-4.5 h-4.5 flex items-center justify-center absolute -top-0.5 -right-0.5 text-[10px]">
                                {{ userStore.getUser?.unread_messages_count ?? 0 }}
                            </Badge>
                        </button>

                        <div class="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200" aria-hidden="true" />

                        <!-- Search -->
                        <button type="button" @click="openSearch"
                            class="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100 transition-colors">
                            <Icon name="heroicons:magnifying-glass" class="h-5 w-5" aria-hidden="true" />
                        </button>


                        <div class="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200" aria-hidden="true" />

                        <!-- Support -->
                        <button type="button" class="flex items-center gap-x-1 text-sm text-primary hover:text-primary-700 p-2 rounded-lg hover:bg-surface-100 transition-colors"
                            @click="openSupport">
                            <Icon name="material-symbols:support" class="h-5 w-5" aria-hidden="true" />
                            <span class="text-xs font-semibold hidden lg:block">{{ $t('support.support') }}</span>
                        </button>

                        <div class="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200" aria-hidden="true" />

                        <!-- User menu -->
                        <Menu as="div" class="relative">
                            <MenuButton class="flex items-center gap-x-2 p-1 rounded-lg hover:bg-surface-100 transition-colors">
                                <div class="relative">
                                    <div class="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold ring-2 ring-white shadow-sm overflow-hidden">
                                        <img v-if="userStore.getUser?.profile_image" :src="userStore.getUser?.profile_image" alt="User" class="h-full w-full object-cover" />
                                        <span v-else>{{ (userStore.getUser?.firstname?.[0] || '') + (userStore.getUser?.lastname?.[0] || '') }}</span>
                                    </div>
                                    <div :class="[userStore.getUser?.is_online ? 'bg-emerald-500' : 'bg-slate-400', 'w-2.5 h-2.5 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-white']" />
                                </div>
                                <span class="hidden xl:flex xl:items-center">
                                    <span class="text-sm font-medium text-slate-700">{{ userStore.getUser?.firstname }} {{ userStore.getUser?.lastname }}</span>
                                    <Icon name="heroicons:chevron-down-20-solid" class="ml-1.5 h-4 w-4 text-slate-400" aria-hidden="true" />
                                </span>
                            </MenuButton>
                            <transition enter-active-class="transition ease-out duration-150"
                                enter-from-class="transform opacity-0 scale-95 -translate-y-1"
                                enter-to-class="transform opacity-100 scale-100 translate-y-0"
                                leave-active-class="transition ease-in duration-100"
                                leave-from-class="transform opacity-100 scale-100"
                                leave-to-class="transform opacity-0 scale-95">
                                <MenuItems class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-white py-1.5 shadow-dropdown ring-1 ring-slate-900/5 focus:outline-none">
                                    <div class="px-3 py-2.5 border-b border-surface-100">
                                        <p class="text-sm font-semibold text-slate-900">{{ userStore.getUser?.firstname }} {{ userStore.getUser?.lastname }}</p>
                                        <p class="text-xs text-slate-500 mt-0.5">{{ userStore.getUser?.email }}</p>
                                    </div>
                                    <MenuItem><div class="cursor-pointer flex items-center gap-x-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-surface-50 transition-colors" @click="selectLanguage"><img :src="identifyFlag()" alt="flag" class="w-4 h-4">{{ $t('navbar.switchLanguage') }}</div></MenuItem>
                                    <MenuItem><div @click="navigateTo('/settings/profile')" class="cursor-pointer flex items-center gap-x-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-surface-50 transition-colors"><Icon name="ph:gear" class="h-4 w-4 text-slate-400" />{{ $t('navbar.settings') }}</div></MenuItem>
                                    <MenuItem><div @click="navigateTo('/employees')" class="cursor-pointer flex items-center gap-x-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-surface-50 transition-colors"><Icon name="ph:users-three" class="h-4 w-4 text-slate-400" />{{ $t('navbar.colleagues') }}</div></MenuItem>
                                    <MenuItem><div @click="navigateTo('/apps')" class="cursor-pointer flex items-center gap-x-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-surface-50 transition-colors"><Icon name="ic:baseline-apps" class="h-4 w-4 text-slate-400" />{{ $t('navbar.apps') }}</div></MenuItem>
                                    <MenuItem v-if="userStore.getUser?.has_invoice_app"><div @click="navigateTo('/invoices')" class="cursor-pointer flex items-center gap-x-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-surface-50 transition-colors"><Icon name="ph:receipt" class="h-4 w-4 text-slate-400" />{{ $t('navbar.invoices') }}</div></MenuItem>
                                    <MenuItem><div @click="navigateTo('/reminders')" class="cursor-pointer flex items-center gap-x-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-surface-50 transition-colors"><Icon name="ph:note-pencil" class="h-4 w-4 text-slate-400" />{{ $t('navbar.reminders') }}</div></MenuItem>
                                    <MenuItem><div @click="navigateTo('/forms')" class="cursor-pointer flex items-center gap-x-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-surface-50 transition-colors"><Icon name="ph:list-numbers" class="h-4 w-4 text-slate-400" />{{ $t('navbar.forms') }}</div></MenuItem>
                                    <MenuItem><div @click="navigateTo('/procedures')" class="cursor-pointer flex items-center gap-x-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-surface-50 transition-colors"><Icon name="ph:list-checks" class="h-4 w-4 text-slate-400" />{{ $t('navbar.procedures') }}</div></MenuItem>
                                    <div class="border-t border-surface-100 mt-1 pt-1">
                                        <MenuItem><div @click="logout()" class="cursor-pointer flex items-center gap-x-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"><Icon name="ph:sign-out" class="h-4 w-4" />{{ $t('navbar.logout') }}</div></MenuItem>
                                    </div>
                                </MenuItems>
                            </transition>
                        </Menu>
                    </div>
                </div>
            </div>

            <!-- Page content -->
            <main class="py-6 lg:py-8">
                <div class="px-4 sm:px-6 lg:px-6">
                    <div class="flex items-center justify-between flex-wrap gap-3">
                        <slot name="breadcrumb"></slot>
                        <slot name="guided-tour"></slot>
                    </div>
                    <div class="mt-3 flex justify-between items-center">
                        <h1 class="text-xl lg:text-2xl text-slate-900 font-semibold tracking-tight"><slot name="header"></slot></h1>
                        <slot name="new-feature"></slot>
                        <slot name="settings"></slot>
                    </div>
                    <div class="mt-2" v-if="$slots['sub-header']"><h3 class="text-base text-slate-500"><slot name="sub-header"></slot></h3></div>
                    <div class="mt-4"><slot /></div>
                </div>
            </main>
        </div>

        <!-- All modals -->
        <ModulesUserReminderCheckIn :isModalOpen="state.modal.isCheckinReminderOpen" @close="state.modal.isCheckinReminderOpen = false" />
        <ModulesUserSettings2faGoogleModalRequire2fa :isModalOpen="state.modal.is2faRequiredOpen" @close="state.modal.is2faRequiredOpen = false" />
        <ModulesUserCitizenPlanModalCompletionReminder :isModalOpen="state.modal.isPlanGoalSubgoalCompletionReminderOpen" @close="closeCompletionReminder" />
        <ModulesUserLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen" @close="state.slideOver.isLanguageSwitcherOpen = false" />
        <ModulesUserSupportSlideOver :isOpen="state.slideOver.isSupportOpen" @close="state.slideOver.isSupportOpen = false" />
        <ModulesUserGuidedTourModalWelcome v-if="state.modal.isGuidedTourWelcomeOpen" :isModalOpen="state.modal.isGuidedTourWelcomeOpen" :isGuidedTour="true" @close="state.modal.isGuidedTourWelcomeOpen = false" @next="handleNextGuidedTour" />
        <ModulesUserGuidedTourModalDailyOverview v-if="state.modal.isGuidedTourDailyOverviewOpen" :isModalOpen="state.modal.isGuidedTourDailyOverviewOpen" :isGuidedTour="true" @close="state.modal.isGuidedTourDailyOverviewOpen = false" @back="handleBackGuidedTour" @next="handleNextGuidedTour" />
        <ModulesUserGuidedTourModalCitizens v-if="state.modal.isGuidedTourCitizensOverviewOpen" :isModalOpen="state.modal.isGuidedTourCitizensOverviewOpen" :isGuidedTour="true" @close="state.modal.isGuidedTourCitizensOverviewOpen = false" @back="handleBackGuidedTour" @next="handleNextGuidedTour" />
        <ModulesUserGuidedTourModalCalendar v-if="state.modal.isGuidedTourCalendarOpen" :isModalOpen="state.modal.isGuidedTourCalendarOpen" :isGuidedTour="true" @close="state.modal.isGuidedTourCalendarOpen = false" @back="handleBackGuidedTour" @next="handleNextGuidedTour" />
        <ModulesUserGuidedTourModalDutySchedule v-if="state.modal.isGuidedTourDutyScheduleOpen" :isModalOpen="state.modal.isGuidedTourDutyScheduleOpen" :isGuidedTour="true" @close="state.modal.isGuidedTourDutyScheduleOpen = false" @back="handleBackGuidedTour" @next="handleNextGuidedTour" />
        <ModulesUserGuidedTourModalEmployees v-if="state.modal.isGuidedTourEmployeesOpen" :isModalOpen="state.modal.isGuidedTourEmployeesOpen" :isGuidedTour="true" @close="state.modal.isGuidedTourEmployeesOpen = false" @back="handleBackGuidedTour" @next="handleNextGuidedTour" />
        <ModulesUserGuidedTourModalEnd v-if="state.modal.isGuidedTourEndOpen" :isModalOpen="state.modal.isGuidedTourEndOpen" :isGuidedTour="true" @close="state.modal.isGuidedTourEndOpen = false" @back="handleBackGuidedTour" @next="handleNextGuidedTour" />
        <ModulesUserAssistantModalAssistant :isModalOpen="state.modal.isAIAssistantOpen" @close="state.modal.isAIAssistantOpen = false" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import moment from 'moment'
import { Dialog, DialogPanel, Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { authService } from '@/components/api/user/AuthService'
import { userService } from '@/components/api/user/UserService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useDepartmentStore } from '@/store/department'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const departmentStore = useDepartmentStore()
const userStore = useUserStore() as any
const customPagesStore = useCustomPagesStore() as any
const language = useI18n()
const router = useRouter()
const route = useRoute()
const isSchedulesPage = computed(() => route.path.startsWith('/schedules'))
const routeName = router?.currentRoute?.value?.name
const searchInput = ref<HTMLInputElement | null>(null)

let navigation = [] as any

const sidebarOpen = ref(false)
const sidebarPinned = ref(localStorage.getItem('sidebarPinned') !== 'false')
const sidebarHovered = ref(false)
const sidebarExpanded = computed(() => sidebarPinned.value || sidebarHovered.value)

function handleSidebarHover(hovering: boolean) { sidebarHovered.value = hovering }
function toggleSidebarPin() { sidebarPinned.value = !sidebarPinned.value; localStorage.setItem('sidebarPinned', String(sidebarPinned.value)) }

function openSearch() {
    state.isSearchOpen = true; state.searchQuery = ''; state.isSearching = false
    nextTick(() => { searchInput.value?.focus() })
}

function executeSearch() {
    if (state.searchQuery.trim()) { state.isSearching = true }
}

onMounted(() => {
    fetchUser()
    animateAssets()
    const handler = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSearch() }
        if (e.key === 'Escape' && state.isSearchOpen) { state.isSearchOpen = false }
    }
    window.addEventListener('keydown', handler)
    onUnmounted(() => window.removeEventListener('keydown', handler))
})

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    isSidebarLoading: true,
    isSearchOpen: false,
    isSearching: false,
    searchQuery: '',
    modal: {
        is2faRequiredOpen: false,
        isAIAssistantOpen: false,
        isCheckinReminderOpen: false,
        isGuidedTourCalendarOpen: false,
        isGuidedTourCitizensOverviewOpen: false,
        isGuidedTourDailyOverviewOpen: false,
        isGuidedTourDutyScheduleOpen: false,
        isGuidedTourEmployeesOpen: false,
        isGuidedTourEndOpen: false,
        isGuidedTourWelcomeOpen: false,
        isPlanGoalSubgoalCompletionReminderOpen: false,
    },
    showSubscribeButton: false,
    slideOver: { isLanguageSwitcherOpen: false, isSupportOpen: false },
})

watch(() => userStore.getUser, (user: any) => {
    if (user) { setCustomPageNames(); state.showSubscribeButton = true; generateSidebarLinks(user) }
    if (user?.company?.is_2fa_enabled && !user?.is_google_2fa_enabled) { state.modal.is2faRequiredOpen = true }
})

watch(() => language.locale.value, (newLanguage: any) => {
    setCustomPageNames()
    if (newLanguage === 'en' && departmentStore.getSelectedDepartmentName === 'Alle afdelinger') departmentStore.setSelectedDepartmentName('All departments')
    else if (newLanguage === 'dk' && departmentStore.getSelectedDepartmentName === 'All departments') departmentStore.setSelectedDepartmentName('Alle afdelinger')
})

function getNavItemLabel(item: any) {
    const t = language.t
    if (item.name === 'Overview') return t('sidebar.overview')
    if (item.name === 'Citizens') return customPagesStore.getCustomPagesName?.citizens || t('sidebar.citizens')
    if (item.name === 'Calendar') return t('sidebar.calendar')
    if (item.name === 'Duty schedules') return customPagesStore.getCustomPagesName?.dutySchedules || t('sidebar.dutySchedules')
    if (item.name === 'Messages') return t('sidebar.messages')
    if (item.name === 'Procedures') return t('sidebar.procedures') || 'Procedurer'
    if (item.name === 'Protocols') return t('sidebar.protocols')
    if (item.name === 'Documents') return t('sidebar.documents')
    if (item.name === 'Mail') return t('sidebar.mail')
    if (item.name === 'Leads') return t('sidebar.leads')
    if (item.name === 'Bullet Board') return t('sidebar.bulletBoard')
    return item.name
}

function generateSidebarLinks(user: any) {
    navigation = []
    const userHasSecuredMailAccess = user?.has_mail_access
    const userHasLeadsActive = user?.company?.is_leads_active
    const userHasPageAttendanceAccess = user?.pages?.some((page: any) => page.name === "Attendance")
    navigation.push({
        name: 'Overview',
        href: '/overview',
        icon: 'material-symbols:dashboard',
        activeRouteNames: [
            'overview',
        ]
    })
    navigation.push({
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
            'citizens-uuid-nursing-areas',
            'citizens-uuid-documents',
            'citizens-uuid-documents-document_uuid',
            'citizens-uuid-attendance',
            'citizens-uuid-attendance-citizen_protocol_uuid',
            'citizens-uuid-calendar',
            'citizens-uuid-wallets',
            'citizens-uuid-wallets-wallet_uuid',
            'citizens-uuid-contacts',
        ]
    })
    navigation.push({
        name: 'Calendar',
        href: '/calendar',
        icon: 'ph:calendar-blank',
        activeRouteNames: [
            'calendar',
            'calendar-appointments',
            'calendar-appointments-settings',
        ]
    })
    if (user.pages?.find((page: any) => page.name === "Duty Schedule")) {
        navigation.push({
            name: 'Duty schedules',
            href: '/schedules',
            icon: 'ph:calendar-dots',
            activeRouteNames: [
                'schedules',
                'schedules-draft'
            ]
        })
    }
    navigation.push({
        name: 'Messages',
        href: '/messages',
        icon: 'ph:chat-circle',
        activeRouteNames: [
            'messages',
            'messages-chat_uuid'
        ]
    })
    if (userHasPageAttendanceAccess) {
        navigation.push({ name: 'Protocols', href: '/protocols', icon: 'ic:outline-shield', activeRouteNames: ['protocols', 'protocols-new', 'protocols-uuid'] })
    }

    navigation.push({ name: 'Documents', href: '/drive', icon: 'ph:folder', activeRouteNames: ['drive'] })

    if (userHasSecuredMailAccess) {
        navigation.push({ name: 'Mail', href: '/mail/inbox', icon: 'ph:envelope-open', activeRouteNames: ['mail'] })
    }

    if (userHasLeadsActive) {
        navigation.push({ name: 'Leads', href: '/leads', icon: 'ph:nuclear-plant-duotone', activeRouteNames: ['leads'] })
    }

    navigation.push({ name: 'Bullet Board', href: '/news', icon: 'ph:newspaper', activeRouteNames: ['news', 'news-new', 'news-edit-uuid'] })

    state.isSidebarLoading = false
}

function setCustomPageNames() {
    const sl = language.locale.value
    const cp = (p: string) => userStore.getUser?.custom_pages?.find((i: any) => i.page_type === p)
    const n = (p: any) => sl === 'en' ? p?.en_name : p?.dk_name
    customPagesStore.setAddictionsNaming(n(cp('addictions')))
    customPagesStore.setCitizensNaming(n(cp('citizens')))
    customPagesStore.setDepartmentNaming(n(cp('department')))
    customPagesStore.setDutySchedulesNaming(n(cp('duty_schedules')))
    customPagesStore.setRiskAssessmentNaming(n(cp('risk_assessment')))
    customPagesStore.setGiveMedicineNaming(n(cp('give_medicine')))
}

function animateAssets() {
    const image = document.getElementById('animatedImage') as any
    if (image) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('animate-fade-in'); else entry.target.classList.remove('animate-fade-in') })
        })
        observer.observe(image)
    }
}

async function fetchUser() {
    state.error = {}
    try {
        const response = await userService.getUser()
        if (response?.data) {
            userStore.setUser(response?.data)
            userStore.setLanguage(response?.data?.language?.code)
            language.locale.value = response?.data?.language?.code
            plansGoalsSubgoalsCompletionReminderModalVisibility(response)
            checkInReminderModalVisibility(response)
            guidedUserTourModalVisibility()

        }
    } catch (error: any) { state.error = error }
}

function plansGoalsSubgoalsCompletionReminderModalVisibility(response: any) {
    const lastHidden = localStorage.getItem('plansGoalsSubgoalsReminderHidden'); const today = moment().format('YYYY-MM-DD')
    if (lastHidden !== today && response?.data?.plans_goals_subgoals_reached_deadline_count > 0 && routeName !== 'plans-goals-subgoals-completions') state.modal.isPlanGoalSubgoalCompletionReminderOpen = true
}

function guidedUserTourModalVisibility() { if (userStore.getUser?.is_first_login) state.modal.isGuidedTourWelcomeOpen = true }

function checkInReminderModalVisibility(response: any) {
    const lastHidden = localStorage.getItem('checkInReminderHidden'); const today = moment().format('YYYY-MM-DD')
    if (lastHidden !== today && response?.data?.checkin_enabled) { userStore.resetIsCheckInNow(); state.modal.isCheckinReminderOpen = true }
}

function closeCompletionReminder(doNotShowAgain: boolean) { if (doNotShowAgain) localStorage.setItem('plansGoalsSubgoalsReminderHidden', moment().format('YYYY-MM-DD')); state.modal.isPlanGoalSubgoalCompletionReminderOpen = false }

function handleBackGuidedTour(back: any) {
    if (back === 'welcome') { state.modal.isGuidedTourDailyOverviewOpen = false; state.modal.isGuidedTourWelcomeOpen = true }
    if (back === 'overview') { state.modal.isGuidedTourCitizensOverviewOpen = false; state.modal.isGuidedTourDailyOverviewOpen = true }
    if (back === 'citizens-overview') { state.modal.isGuidedTourCalendarOpen = false; state.modal.isGuidedTourCitizensOverviewOpen = true }
    if (back === 'calendar') { state.modal.isGuidedTourDutyScheduleOpen = false; state.modal.isGuidedTourCalendarOpen = true }
    if (back === 'duty-schedule') { state.modal.isGuidedTourEmployeesOpen = false; state.modal.isGuidedTourDutyScheduleOpen = true }
    if (back === 'employees') { state.modal.isGuidedTourEndOpen = false; state.modal.isGuidedTourEmployeesOpen = true }
}

function handleNextGuidedTour(next: any) {
    if (next === 'overview') { state.modal.isGuidedTourWelcomeOpen = false; state.modal.isGuidedTourDailyOverviewOpen = true }
    if (next === 'citizens-overview') { state.modal.isGuidedTourDailyOverviewOpen = false; state.modal.isGuidedTourCitizensOverviewOpen = true }
    if (next === 'calendar') { state.modal.isGuidedTourCitizensOverviewOpen = false; state.modal.isGuidedTourCalendarOpen = true }
    if (next === 'duty-schedule') { state.modal.isGuidedTourCalendarOpen = false; state.modal.isGuidedTourDutyScheduleOpen = true }
    if (next === 'employees') { state.modal.isGuidedTourDutyScheduleOpen = false; state.modal.isGuidedTourEmployeesOpen = true }
    if (next === 'end') { state.modal.isGuidedTourEmployeesOpen = false; state.modal.isGuidedTourEndOpen = true }
}

async function logout() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await authService.logout()
        if (response) {
            localStorage.removeItem("_token")
            localStorage.removeItem("remember_me")
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
        return '/img/icons/flags/united-kingdom.svg'
    } else {
        if (selectedLanguage === 'dk') {
            return '/img/icons/flags/denmark.svg'
        }
    }
}

async function navigateToNews() {
    navigateTo('/overview#news')
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await userService.readNews()
        if (response) {
            localStorage.setItem('hasSeenNews-02-20-2026', 'true')
            fetchUser()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
