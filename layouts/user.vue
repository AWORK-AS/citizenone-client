<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <!-- Live mileage-trip tracking banner: fixed-position, survives navigation -->
        <ModulesUserMileageLogTrackingBanner />

        <!-- Global Search -->
        <ModulesUserNavbarGlobalSearch ref="globalSearch" />

        <!-- Desktop only: re-authentication lock after idle/screen-lock -->
        <DesktopLockOverlay />

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
                            <div
                                class="flex grow flex-col overflow-y-auto bg-gradient-to-b from-sidebar to-sidebar-dark">
                                <div class="flex items-center h-16 px-5">
                                    <span @click="navigateTo('/overview')" class="cursor-pointer">
                                        <Logo />
                                    </span>
                                </div>
                                <nav class="flex flex-1 flex-col px-3 mt-2">
                                    <ul role="list" class="flex flex-1 flex-col gap-y-1">
                                        <li v-for="group in navigationGroups" :key="group.key" class="mt-3 first:mt-0">
                                            <button type="button" @click="toggleGroup(group.key)"
                                                class="sidebar-section-label flex w-full items-center gap-1"
                                                :aria-expanded="groupIsOpen(group)">
                                                <Icon name="ph:caret-down"
                                                    :class="['h-3 w-3 shrink-0 transition-transform', groupIsOpen(group) ? '' : '-rotate-90']"
                                                    aria-hidden="true" />
                                                <span>{{ $t(group.label) }}</span>
                                            </button>
                                            <ul role="list" v-show="groupIsOpen(group)" class="space-y-0.5">
                                                <li v-for="item in group.items" :key="item.name">
                                                    <div @click="openNavItem(item); sidebarOpen = false"
                                                        :class="[item.activeRouteNames.includes($route.name) ? 'sidebar-item sidebar-item-active' : 'sidebar-item sidebar-item-inactive']">
                                                        <img v-if="item.image" :src="item.image" :alt="item.name"
                                                            class="h-5 w-5 shrink-0" />
                                                        <Icon v-else :name="item.icon" class="h-5 w-5 shrink-0"
                                                            aria-hidden="true" />
                                                        <span>{{ getNavItemLabel(item) }}</span>
                                                        <Icon v-if="item.external" name="ph:arrow-square-out"
                                                            class="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden="true" />
                                                    </div>
                                                </li>
                                            </ul>
                                        </li>
                                        <li class="mt-auto pb-4 space-y-2">
                                            <div v-for="item in footerNavigation" :key="item.name"
                                                @click="openNavItem(item); sidebarOpen = false"
                                                :class="[item.activeRouteNames.includes($route.name) ? 'sidebar-item sidebar-item-active' : 'sidebar-item sidebar-item-inactive']">
                                                <Icon :name="item.icon" class="h-5 w-5 shrink-0" aria-hidden="true" />
                                                <span>{{ getNavItemLabel(item) }}</span>
                                            </div>
                                            <ModulesUserTimeRegistrationCheckInOut
                                                v-if="userStore.getUser?.checkin_enabled" />
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

        <!-- Desktop sidebar: collapsible (web only) -->
        <div v-if="!isDesktopApp" class="hidden lg:fixed lg:inset-y-0 lg:z-[55] lg:flex lg:flex-col lg:w-[17rem] pointer-events-none">
            <div class="flex grow flex-col overflow-y-auto overflow-x-hidden bg-gradient-to-b from-sidebar to-sidebar-dark shadow-sidebar transition-all duration-300 ease-in-out pointer-events-auto"
                :class="sidebarExpanded ? 'w-[17rem]' : 'w-[4.5rem]'">
                <!-- Logo + Pin -->
                <div class="flex items-center h-16 flex-shrink-0 px-4 justify-between">
                    <span @click="navigateTo('/overview')" class="cursor-pointer flex items-center gap-x-2.5 min-w-0">
                        <span class="ml-1.5 flex-none inline-flex w-7 h-7 items-center justify-center">
                            <img src="/img/icons/asset-app.png" alt="CitizenOne" class="h-7 w-7 object-contain" />
                        </span>
                        <span
                            :class="['whitespace-nowrap overflow-hidden transition-all duration-200 delay-75 text-primary font-semibold text-lg', sidebarExpanded ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0']">
                            CitizenOne™
                        </span>
                    </span>
                    <button @click="toggleSidebarPin"
                        :class="['flex items-center p-1.5 rounded-md transition-all duration-200 delay-75', sidebarExpanded ? 'opacity-100 pointer-events-auto text-blue-300/60 hover:text-white hover:bg-white/10' : 'opacity-0 pointer-events-none']"
                        :aria-label="sidebarPinned ? $t('sidebar.unpinSidebar') : $t('sidebar.pinSidebar')"
                        :title="sidebarPinned ? $t('sidebar.unpinSidebar') : $t('sidebar.pinSidebar')">
                        <Icon :name="sidebarPinned ? 'ph:push-pin-fill' : 'ph:push-pin'" class="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>

                <!-- Nav items -->
                <nav class="flex flex-1 flex-col px-3 mt-1 custom-scrollbar">
                    <ul role="list" class="flex flex-1 flex-col gap-y-1">
                        <li v-for="group in navigationGroups" :key="group.key" class="mt-3 first:mt-0">
                            <!-- Collapsed rail has no room for a heading, so the groups are
                                 separated by a hairline instead. The first group needs neither. -->
                            <button v-if="sidebarExpanded" type="button" @click="toggleGroup(group.key)"
                                class="sidebar-section-label flex w-full items-center gap-1 hover:text-blue-200 transition-colors"
                                :aria-expanded="groupIsOpen(group)">
                                <Icon name="ph:caret-down"
                                    :class="['h-3 w-3 shrink-0 transition-transform', groupIsOpen(group) ? '' : '-rotate-90']"
                                    aria-hidden="true" />
                                <span>{{ $t(group.label) }}</span>
                            </button>
                            <div v-else-if="group.key !== navigationGroups[0]?.key" class="mx-3 my-2 border-t border-current opacity-10" />
                            <ul role="list" v-show="!sidebarExpanded || groupIsOpen(group)" class="space-y-0.5">
                                <li v-for="item in group.items" :key="item.name">
                                    <div @click="openNavItem(item)"
                                        :class="item.activeRouteNames.includes($route.name) ? 'sidebar-item sidebar-item-active' : 'sidebar-item sidebar-item-inactive'"
                                        :data-tour="item.name === 'Citizens' ? 'sidebar-citizens' : null"
                                        :title="!sidebarExpanded ? getNavItemLabel(item) : ''">
                                        <img v-if="item.image" :src="item.image" :alt="item.name"
                                            class="h-5 w-5 shrink-0" />
                                        <Icon v-else :name="item.icon" class="h-5 w-5 shrink-0" aria-hidden="true" />
                                        <span
                                            :class="['whitespace-nowrap transition-all duration-200 delay-75 overflow-hidden', sidebarExpanded ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0']">
                                            {{ getNavItemLabel(item) }}
                                        </span>
                                        <Icon v-if="item.external && sidebarExpanded" name="ph:arrow-square-out"
                                            class="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden="true" />
                                    </div>
                                </li>
                            </ul>
                        </li>

                        <li class="mt-auto pb-4 space-y-2">
                            <!-- Onboarding and other one-off entries sit below the daily work,
                                 not among it. -->
                            <div v-for="item in footerNavigation" :key="item.name" @click="openNavItem(item)"
                                :class="item.activeRouteNames.includes($route.name) ? 'sidebar-item sidebar-item-active' : 'sidebar-item sidebar-item-inactive'"
                                :title="!sidebarExpanded ? getNavItemLabel(item) : ''">
                                <Icon :name="item.icon" class="h-5 w-5 shrink-0" aria-hidden="true" />
                                <span
                                    :class="['whitespace-nowrap transition-all duration-200 delay-75 overflow-hidden', sidebarExpanded ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0']">
                                    {{ getNavItemLabel(item) }}
                                </span>
                            </div>
                            <ModulesUserTimeRegistrationCheckInOut v-if="userStore.getUser?.checkin_enabled" />
                            <div v-show="sidebarExpanded">
                                <ModulesUserSidebarCompanyId />
                            </div>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>

        <!-- Desktop app shell: icon rail + context panel (Electron only).
             Replaces the single wide web sidebar with two narrower fixed
             panels - a rail with one icon per group, and a list of that
             group's items - so the primary nav stops eating the width a
             real app window can give to the workspace instead. -->
        <div v-else class="hidden lg:fixed lg:inset-y-0 lg:z-[55] lg:flex">
            <div class="flex flex-col items-center w-[4.5rem] bg-white border-r border-[#e8eaef] py-3">
                <!-- macOS hiddenInset title bar (see citizenone-desktop's main.ts):
                     the traffic lights float at the window's true top-left corner,
                     which is exactly this rail's top strip (the rail is the same
                     ~72px width the three lights need). Reserves that space so
                     they don't sit on top of the logo below, and doubles as the
                     window's drag handle - there's no separate system title bar
                     to drag from any more. -->
                <div v-if="isMacDesktopApp" class="app-drag-region w-full h-9 shrink-0" aria-hidden="true" />
                <span @click="navigateTo('/overview')" title="CitizenOne™"
                    class="cursor-pointer flex items-center justify-center w-11 h-11 mb-2 shrink-0">
                    <img src="/img/icons/asset-app.png" alt="CitizenOne" class="h-7 w-7 object-contain" />
                </span>
                <nav role="tablist" aria-orientation="vertical" aria-label="Navigation"
                    class="flex flex-col items-center gap-1 overflow-y-auto custom-scrollbar">
                    <button v-for="group in navigationGroups" :key="group.key" type="button" role="tab"
                        :id="`nav-tab-${group.key}`" :aria-controls="`nav-panel-${group.key}`"
                        @click="activeGroupKey = group.key" :title="$t(group.label)"
                        :aria-label="$t(group.label)" :aria-selected="activeContextGroup?.key === group.key"
                        :class="['flex items-center justify-center w-11 h-11 rounded-xl transition-colors shrink-0',
                            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                            activeContextGroup?.key === group.key
                                ? 'bg-[#eff6ff] text-primary'
                                : 'text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#0f1a2e]']">
                        <Icon :name="group.icon" class="h-5 w-5" aria-hidden="true" />
                    </button>
                </nav>
                <div class="mt-auto flex flex-col items-center gap-2 pt-2 shrink-0">
                    <ModulesUserTimeRegistrationCheckInOut v-if="userStore.getUser?.checkin_enabled" />
                </div>
            </div>
            <div class="flex flex-col w-[14rem] bg-white border-r border-[#e8eaef] overflow-y-auto custom-scrollbar"
                role="tabpanel" :id="`nav-panel-${activeContextGroup?.key}`" :aria-labelledby="`nav-tab-${activeContextGroup?.key}`">
                <div class="h-16 flex items-center px-4 shrink-0">
                    <span class="text-primary font-semibold text-lg truncate">
                        {{ activeContextGroup ? $t(activeContextGroup.label) : 'CitizenOne™' }}
                    </span>
                </div>
                <nav class="flex-1 px-3">
                    <ul role="list" class="space-y-0.5">
                        <li v-for="item in activeContextGroup?.items || []" :key="item.name">
                            <div @click="openNavItem(item)"
                                :class="item.activeRouteNames.includes($route.name) ? 'sidebar-item sidebar-item-active' : 'sidebar-item sidebar-item-inactive'"
                                :data-tour="item.name === 'Citizens' ? 'sidebar-citizens' : null">
                                <img v-if="item.image" :src="item.image" :alt="item.name" class="h-5 w-5 shrink-0" />
                                <Icon v-else :name="item.icon" class="h-5 w-5 shrink-0" aria-hidden="true" />
                                <span class="whitespace-nowrap overflow-hidden">{{ getNavItemLabel(item) }}</span>
                                <Icon v-if="item.external" name="ph:arrow-square-out"
                                    class="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden="true" />
                            </div>
                        </li>
                    </ul>
                </nav>
                <div class="px-3 pb-4 space-y-2 shrink-0">
                    <div v-for="item in footerNavigation" :key="item.name" @click="openNavItem(item)"
                        :class="item.activeRouteNames.includes($route.name) ? 'sidebar-item sidebar-item-active' : 'sidebar-item sidebar-item-inactive'">
                        <Icon :name="item.icon" class="h-5 w-5 shrink-0" aria-hidden="true" />
                        <span>{{ getNavItemLabel(item) }}</span>
                    </div>
                    <ModulesUserSidebarCompanyId />
                </div>
            </div>
        </div>

        <!-- Main content.
             No padding for the assistant panel: it is `fixed`, so it already floats
             over the page, and padding the content as well shoved every page
             sideways whenever it was opened (Birketoften 31/8).
             Desktop: this div becomes the one scrolling surface (h-screen +
             overflow-y-auto) instead of letting the whole document/window
             scroll - a real app window's chrome (rail, topbar) should never
             move, only its content pane. Web keeps min-h-screen unchanged. -->
        <div class="bg-surface-50 transition-all duration-300 ease-in-out" :class="[
            isDesktopApp ? 'h-screen overflow-y-auto' : 'min-h-screen',
            isDesktopApp ? 'lg:pl-[18.5rem]' : (sidebarExpanded ? 'lg:pl-[17rem]' : 'lg:pl-[4.5rem]')
        ]">
            <!-- Impersonation Banner -->
            <div v-if="isImpersonating" ref="bannerRef"
                class="sticky top-0 z-[60] bg-amber-500 text-white px-6 py-2.5 flex items-center justify-between gap-x-4">
                <div class="flex items-center gap-x-2 min-w-0">
                    <Icon name="ph:user-switch" class="h-5 w-5 shrink-0" />
                    <span class="text-sm font-semibold truncate">{{ $t('navbar.impersonating') }}: {{
                        userStore.getUser?.firstname }} {{
                            userStore.getUser?.lastname }}</span>
                </div>
                <button @click="stopImpersonation"
                    class="flex items-center gap-x-1.5 text-sm font-semibold bg-amber-600 hover:bg-amber-700 px-3 py-1 rounded-md transition-colors shrink-0">
                    <Icon name="ph:arrow-u-up-left" class="h-4 w-4" />
                    {{ $t('navbar.stopImpersonation') }}
                </button>
            </div>
            <!-- Navbar -->
            <div ref="navbarRef"
                class="sticky top-[var(--sticky-banner-height,0px)] z-50 flex h-16 shrink-0 items-center gap-x-3 bg-white/95 backdrop-blur-md border-b border-surface-200 px-4 sm:px-6 lg:px-6">
                <button type="button" class="-m-2.5 p-2.5 text-slate-500 lg:hidden" :aria-label="$t('menu')" @click="sidebarOpen = true">
                    <Icon name="heroicons:bars-3" class="h-6 w-6" aria-hidden="true" />
                </button>
                <div class="h-6 w-px bg-slate-200 lg:hidden" aria-hidden="true" />

                <div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                    <div
                        class="flex-1 flex flex-col justify-center gap-x-2 md:flex-row md:items-center md:justify-start relative z-[45]">
                        <div
                            class="hidden md:flex flex-col justify-center gap-x-2 xl:flex-row xl:items-center xl:justify-start">
                            <div>
                                <ModulesUserCompanySelection />
                            </div>
                            <div>
                                <ModulesUserDepartmentSelection />
                            </div>
                        </div>
                        <div>
                            <ModulesUserNavbarAiAssistant class="hidden xl:block" />
                        </div>
                        <div>
                            <ModulesUserNavbarSubscribeButton
                                v-if="state.showSubscribeButton && userStore.getUser?.user_subscription === null"
                                class="hidden md:block" />
                        </div>
                    </div>
                    <div class="flex items-center gap-x-1 lg:gap-x-2">
                        <!-- Command palette (⌘K) -->
                        <div class="hidden sm:block relative">
                            <Tooltip :text="$t('commandPalette.hint')" position="bottom" :wrap="true">
                                <button :aria-label="$t('commandPalette.hint')" type="button" @click="openCommandPalette()"
                                    class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white/70 px-2.5 py-1.5 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors">
                                    <Icon name="ph:magnifying-glass" class="h-4 w-4" aria-hidden="true" />
                                    <kbd
                                        class="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium leading-none">⌘K</kbd>
                                </button>
                            </Tooltip>
                            <!-- One-time "did you know?" discovery hint -->
                            <transition enter-active-class="transition ease-out duration-200"
                                enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0"
                                leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100"
                                leave-to-class="opacity-0">
                                <div v-if="showCmdkHint && !showCmdkTip"
                                    class="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl bg-primary text-white shadow-xl ring-1 ring-black/5">
                                    <div class="absolute -top-1.5 right-4 h-3 w-3 rotate-45 bg-primary"></div>
                                    <div class="relative flex items-start gap-2.5 px-3.5 py-3">
                                        <Icon name="ph:lightbulb" class="mt-0.5 size-4 shrink-0 text-amber-300" />
                                        <div class="min-w-0">
                                            <p class="text-sm font-semibold">{{ $t('commandPalette.didYouKnowTitle') }}
                                            </p>
                                            <p class="mt-0.5 text-xs text-white/90">{{
                                                $t('commandPalette.didYouKnowBody') }}</p>
                                            <button type="button" @click="dismissCmdkHint" :aria-label="$t('close')"
                                                class="mt-2 rounded-md bg-white/15 px-2.5 py-1 text-xs font-medium hover:bg-white/25 transition-colors">
                                                {{ $t('commandPalette.didYouKnowDismiss') }}
                                            </button>
                                        </div>
                                        <button type="button" @click="dismissCmdkHint" :aria-label="$t('close')"
                                            class="shrink-0 text-white/60 hover:text-white">
                                            <Icon name="ph:x" class="size-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </transition>
                        </div>
                        <button type="button" @click="openCommandPalette()"
                            class="sm:hidden w-9 h-9 rounded-full flex items-center justify-center text-primary hover:text-primary-700 hover:bg-surface-100 transition-colors"
                            :aria-label="$t('commandPalette.placeholder')" :title="$t('commandPalette.placeholder')">
                            <Icon name="ph:magnifying-glass" class="h-5 w-5" aria-hidden="true" />
                        </button>

                        <!-- AI (mobile) -->
                        <div class="xl:hidden">
                            <FormButton buttonStyle="AI" buttonSize="xs" class="px-0 md:px-4"
                                @click="userStore.getUser?.has_ai_access ? assistantStore.toggle() : navigateTo('/apps')">
                                <Icon name="ph:sparkle" class="h-6 w-6 md:w-5 md:h-5" aria-hidden="true" />
                                <p class="text-sm font-semibold hidden lg:block">{{ $t('assistants.askAI') }}</p>
                            </FormButton>
                        </div>

                        <!-- Own ChatGPT Integration -->
                        <!-- TODO: restore v-if="userStore.getUser?.has_own_chatgpt_access" once backend adds flag -->
                        <ModulesUserNavbarOwnChatGpt />

                        <!-- Notification Bell -->
                        <div data-tour="notification-area" class="flex items-center">
                            <ModulesUserNavbarNotificationBell />
                        </div>

                        <!-- Journal Notifications -->
                        <button type="button"
                            class="relative w-9 h-9 rounded-full flex items-center justify-center text-primary hover:text-primary-700 hover:bg-surface-100 transition-colors"
                            @click="navigateTo('/journal-notifications')"
                            v-if="userStore.getUser?.unread_notification_count > 0">
                            <Icon name="ph:note" class="h-5 w-5" aria-hidden="true" />
                            <Badge type="notification"
                                class="w-4.5 h-4.5 flex items-center justify-center absolute -top-0.5 -right-0.5 text-[10px]">
                                {{ userStore.getUser?.unread_notification_count ?? 0 }}
                            </Badge>
                        </button>

                        <!-- Unread Messages -->
                        <button type="button"
                            class="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-surface-100 transition-colors"
                            @click="navigateTo('/messages')" v-if="userStore.getUser?.unread_messages_count > 0">
                            <Icon name="ph:chat-circle" class="h-5 w-5" aria-hidden="true" />
                            <Badge type="notification"
                                class="w-4.5 h-4.5 flex items-center justify-center absolute -top-0.5 -right-0.5 text-[10px]">
                                {{ userStore.getUser?.unread_messages_count ?? 0 }}
                            </Badge>
                        </button>

                        <!-- Settings behind the page currently open -->
                        <ModulesUserNavbarPageSettings />

                        <!-- Bulletin board, release notes and support -->
                        <ModulesUserNavbarHelpMenu
                            :unreadNewsCount="!userStore.getUser?.is_read_news ? userStore?.getUnreadNewsCount : 0"
                            @openNews="navigateToNews()" @openSupport="openSupport" />

                        <div class="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200" aria-hidden="true" />

                        <!-- User menu -->
                        <Menu as="div" class="relative">
                            <MenuButton
                                class="flex items-center gap-x-2 p-1 rounded-lg hover:bg-surface-100 transition-colors">
                                <div class="relative">
                                    <div
                                        class="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold ring-2 ring-white shadow-sm overflow-hidden">
                                        <img v-if="userStore.getUser?.profile_image"
                                            :src="userStore.getUser?.profile_image" alt="User"
                                            class="h-full w-full object-cover" />
                                        <span v-else>{{ (userStore.getUser?.firstname?.[0] || '') +
                                            (userStore.getUser?.lastname?.[0] || '') }}</span>
                                    </div>
                                    <div
                                        :class="[userStore.getUser?.is_online ? 'bg-emerald-500' : 'bg-slate-400', 'w-2.5 h-2.5 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-white']" />
                                </div>
                                <span class="hidden xl:flex xl:items-center">
                                    <span class="text-sm font-medium text-slate-700">{{ userStore.getUser?.firstname }}
                                        {{ userStore.getUser?.lastname }}</span>
                                    <Icon name="heroicons:chevron-down-20-solid" class="ml-1.5 h-4 w-4 text-slate-400"
                                        aria-hidden="true" />
                                </span>
                            </MenuButton>
                            <transition enter-active-class="transition ease-out duration-150"
                                enter-from-class="transform opacity-0 scale-95 -translate-y-1"
                                enter-to-class="transform opacity-100 scale-100 translate-y-0"
                                leave-active-class="transition ease-in duration-100"
                                leave-from-class="transform opacity-100 scale-100"
                                leave-to-class="transform opacity-0 scale-95">
                                <MenuItems
                                    class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-white py-1.5 shadow-dropdown ring-1 ring-slate-900/5 focus:outline-none">
                                    <div class="px-3 py-2.5 border-b border-surface-100">
                                        <p class="text-sm font-semibold text-slate-900">
                                            {{ userStore.getUser?.firstname }} {{ userStore.getUser?.lastname }}
                                        </p>
                                        <p class="text-xs text-slate-500 mt-0.5">
                                            {{ userStore.getUser?.email }}
                                        </p>
                                    </div>
                                    <MenuItem>
                                        <div class="cursor-pointer flex items-center gap-x-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-surface-50 transition-colors"
                                            @click="selectLanguage"><img :src="identifyFlag()" alt="flag"
                                                class="w-4 h-4">{{
                                                    $t('navbar.switchLanguage') }}</div>
                                    </MenuItem>
                                    <MenuItem>
                                        <div @click="navigateTo('/settings/profile')"
                                            class="cursor-pointer flex items-center gap-x-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-surface-50 transition-colors">
                                            <Icon name="ph:gear" class="h-4 w-4 text-slate-400" />{{
                                                $t('navbar.settings')
                                            }}
                                        </div>
                                    </MenuItem>
                                    <MenuItem>
                                        <div @click="navigateTo('/employees')"
                                            class="cursor-pointer flex items-center gap-x-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-surface-50 transition-colors">
                                            <Icon name="ph:users-three" class="h-4 w-4 text-slate-400" />{{
                                                $t('navbar.colleagues') }}
                                        </div>
                                    </MenuItem>
                                    <MenuItem>
                                        <div @click="navigateTo('/apps')"
                                            class="cursor-pointer flex items-center gap-x-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-surface-50 transition-colors">
                                            <Icon name="ic:baseline-apps" class="h-4 w-4 text-slate-400" />{{
                                                $t('navbar.apps') }}
                                        </div>
                                    </MenuItem>
                                    <MenuItem v-if="userStore.getUser?.has_invoice_app">
                                        <div @click="navigateTo('/invoicing')"
                                            class="cursor-pointer flex items-center gap-x-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-surface-50 transition-colors">
                                            <Icon name="ph:receipt" class="h-4 w-4 text-slate-400" />{{
                                                $t('navbar.invoices') }}
                                        </div>
                                    </MenuItem>
                                    <MenuItem>
                                        <div @click="navigateTo('/reminders')"
                                            class="cursor-pointer flex items-center gap-x-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-surface-50 transition-colors">
                                            <Icon name="ph:note-pencil" class="h-4 w-4 text-slate-400" />{{
                                                $t('navbar.reminders') }}
                                        </div>
                                    </MenuItem>
                                    <MenuItem>
                                        <div @click="navigateTo('/forms')"
                                            class="cursor-pointer flex items-center gap-x-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-surface-50 transition-colors">
                                            <Icon name="ph:list-numbers" class="h-4 w-4 text-slate-400" />{{
                                                $t('navbar.forms') }}
                                        </div>
                                    </MenuItem>
                                    <MenuItem v-if="userStore.getUser?.is_surveys_active">
                                        <div @click="navigateTo('/surveys')"
                                            class="cursor-pointer flex items-center gap-x-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-surface-50 transition-colors">
                                            <Icon name="ph:clipboard-text" class="h-4 w-4 text-slate-400" />{{
                                                $t('navbar.surveys') }}
                                        </div>
                                    </MenuItem>
                                    <MenuItem>
                                        <div @click="navigateTo('/procedures')"
                                            class="cursor-pointer flex items-center gap-x-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-surface-50 transition-colors">
                                            <Icon name="ph:list-checks" class="h-4 w-4 text-slate-400" />{{
                                                $t('navbar.procedures') }}
                                        </div>
                                    </MenuItem>
                                    <div class="border-t border-surface-100 mt-1 pt-1">
                                        <MenuItem>
                                            <div @click="logout()"
                                                class="cursor-pointer flex items-center gap-x-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                                <Icon name="ph:sign-out" class="h-4 w-4" />{{ $t('navbar.logout') }}
                                            </div>
                                        </MenuItem>
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
                    <!-- Storage is nearly or completely full. Sits in the content flow rather than
                         above the navbar so it never disturbs the measured sticky offsets. -->
                    <ModulesUserStorageQuotaNotice />

                    <!-- Subscription payment outstanding. Renders a blocking wall for an
                         admin (who can fix it) and a plain notice for everyone else. -->
                    <ModulesUserBillingPaymentWall />

                    <!-- On the schedules pages this toolbar carries the date navigation, so it pins
                         beneath the navbar - otherwise you have to scroll back to the top of a long
                         employee grid just to step one week forward. The negative margins absorb
                         <main>'s own padding so the resting layout is unchanged, while the pinned
                         bar still covers the full strip below the navbar with no seam. -->
                    <div ref="toolbarRef" class="flex items-center justify-between flex-wrap gap-3"
                        :class="isSchedulesPage && 'sticky top-[var(--sticky-header-offset,4rem)] z-40 -mx-4 sm:-mx-6 lg:-mx-6 px-4 sm:px-6 lg:px-6 -mt-6 lg:-mt-8 pt-6 lg:pt-8 pb-3 bg-surface-50 border-b border-surface-200'">
                        <slot name="breadcrumb"></slot>
                        <slot name="guided-tour"></slot>
                    </div>
                    <div class="mt-3 flex justify-between items-center">
                        <h1 class="text-xl lg:text-2xl text-slate-900 font-semibold tracking-tight">
                            <slot name="header"></slot>
                        </h1>
                        <slot name="new-feature"></slot>
                        <slot name="settings"></slot>
                    </div>
                    <div class="mt-2" v-if="$slots['sub-header']">
                        <h3 class="text-base text-slate-500">
                            <slot name="sub-header"></slot>
                        </h3>
                    </div>
                    <div class="mt-4">
                        <slot />
                    </div>
                </div>
            </main>
        </div>

        <!-- All modals -->
        <ModulesUserReminderCheckIn :isModalOpen="state.modal.isCheckinReminderOpen"
            @close="state.modal.isCheckinReminderOpen = false" />
        <ModulesUserSettings2faGoogleModalRequire2fa :isModalOpen="state.modal.is2faRequiredOpen"
            @close="state.modal.is2faRequiredOpen = false" />
        <ModulesUserCitizenPlanModalCompletionReminder
            :isModalOpen="state.modal.isPlanGoalSubgoalCompletionReminderOpen" @close="closeCompletionReminder" />
        <ModulesUserLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen"
            @close="state.slideOver.isLanguageSwitcherOpen = false" />
        <ModulesUserSupportSlideOver :isOpen="state.slideOver.isSupportOpen"
            @close="state.slideOver.isSupportOpen = false" />
        <ModulesUserAppTourGuide v-if="state.activeAppTour" :appKey="state.activeAppTour" @close="closeAppTour" />
        <ModulesUserNotificationsMissedMedicineToast />
        <ModulesUserGuidedTourModalWelcome v-if="state.modal.isGuidedTourWelcomeOpen"
            :isModalOpen="state.modal.isGuidedTourWelcomeOpen" :isGuidedTour="true"
            @close="state.modal.isGuidedTourWelcomeOpen = false" @next="handleNextGuidedTour" />
        <CommandPalette :commands="commandPaletteItems" />
        <ShortcutsHelp />
        <ModulesUserGuidedTourModalDailyOverview v-if="state.modal.isGuidedTourDailyOverviewOpen"
            :isModalOpen="state.modal.isGuidedTourDailyOverviewOpen" :isGuidedTour="true"
            @close="state.modal.isGuidedTourDailyOverviewOpen = false" @back="handleBackGuidedTour"
            @next="handleNextGuidedTour" />
        <ModulesUserGuidedTourModalCitizens v-if="state.modal.isGuidedTourCitizensOverviewOpen"
            :isModalOpen="state.modal.isGuidedTourCitizensOverviewOpen" :isGuidedTour="true"
            @close="state.modal.isGuidedTourCitizensOverviewOpen = false" @back="handleBackGuidedTour"
            @next="handleNextGuidedTour" />
        <ModulesUserGuidedTourModalCalendar v-if="state.modal.isGuidedTourCalendarOpen"
            :isModalOpen="state.modal.isGuidedTourCalendarOpen" :isGuidedTour="true"
            @close="state.modal.isGuidedTourCalendarOpen = false" @back="handleBackGuidedTour"
            @next="handleNextGuidedTour" />
        <ModulesUserGuidedTourModalDutySchedule v-if="state.modal.isGuidedTourDutyScheduleOpen"
            :isModalOpen="state.modal.isGuidedTourDutyScheduleOpen" :isGuidedTour="true"
            @close="state.modal.isGuidedTourDutyScheduleOpen = false" @back="handleBackGuidedTour"
            @next="handleNextGuidedTour" />
        <ModulesUserGuidedTourModalEmployees v-if="state.modal.isGuidedTourEmployeesOpen"
            :isModalOpen="state.modal.isGuidedTourEmployeesOpen" :isGuidedTour="true"
            @close="state.modal.isGuidedTourEmployeesOpen = false" @back="handleBackGuidedTour"
            @next="handleNextGuidedTour" />
        <ModulesUserGuidedTourModalEnd v-if="state.modal.isGuidedTourEndOpen"
            :isModalOpen="state.modal.isGuidedTourEndOpen" :isGuidedTour="true"
            @close="state.modal.isGuidedTourEndOpen = false" @back="handleBackGuidedTour"
            @next="handleNextGuidedTour" />
        <!-- Rendered once here rather than inside the navbar button, so the panel
        survives navigation and the content area can make room for it. -->
        <ModulesUserAssistantPanel v-if="userStore.getUser?.has_ai_access" />
        <ModulesUserOwnChatGptSyncProgressBar />

        <!-- One-time ⌘K discovery tip -->
        <Transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-200"
            leave-from-class="opacity-100" leave-to-class="opacity-0 translate-y-2">
            <div v-if="showCmdkTip"
                class="fixed bottom-5 right-5 z-[60] w-72 rounded-xl border border-surface-200 bg-white p-4 shadow-xl">
                <div class="flex items-start gap-x-3">
                    <div
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon name="ph:lightbulb" class="h-5 w-5" />
                    </div>
                    <div class="min-w-0">
                        <p class="text-sm font-semibold text-slate-900">{{ $t('cmdkTip.title') }}</p>
                        <p class="mt-0.5 text-xs text-slate-500">
                            {{ $t('cmdkTip.body') }}
                            <kbd
                                class="rounded border border-slate-200 bg-surface-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">{{
                                    searchShortcut }}</kbd>
                        </p>
                        <div class="mt-3 flex items-center gap-x-2">
                            <button type="button" @click="tryCmdkTip"
                                class="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 transition-colors">
                                {{ $t('cmdkTip.try') }}
                            </button>
                            <button type="button" @click="dismissCmdkTip"
                                class="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-surface-100 transition-colors">
                                {{ $t('cmdkTip.gotIt') }}
                            </button>
                        </div>
                    </div>
                    <button type="button" @click="dismissCmdkTip"
                        class="ml-auto -mr-1 -mt-1 rounded p-1 text-slate-400 hover:bg-surface-100 transition-colors" :aria-label="$t('close')">
                        <Icon name="heroicons:x-mark" class="h-4 w-4" />
                    </button>
                </div>
            </div>
        </Transition>

        <!-- Global undo snackbar (teleported + high z so it stays above modals) -->
        <Teleport to="body">
            <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 translate-y-2"
                enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100" leave-to-class="opacity-0 translate-y-2">
                <div v-if="undoVisible"
                    class="fixed bottom-5 left-1/2 -translate-x-1/2 z-[120] flex items-center gap-x-3 rounded-xl bg-slate-900 pl-4 pr-2 py-2.5 text-white shadow-xl">
                    <span class="text-sm">{{ undoMessage }}</span>
                    <button type="button" @click="undo"
                        class="text-sm font-semibold text-secondary hover:text-white transition-colors">
                        {{ $t('undo.action') }}
                    </button>
                    <button type="button" @click="dismissUndo"
                        class="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors">
                        <Icon name="heroicons:x-mark" class="h-4 w-4" />
                    </button>
                </div>
            </Transition>
        </Teleport>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import moment from 'moment'
import { Dialog, DialogPanel, Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { authService } from '@/components/api/user/AuthService'
import { userService } from '@/components/api/user/UserService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useCustomSidebarLinksStore } from '@/store/custom-sidebar-links'
import { useAssistantStore } from '@/store/assistant'
import { useDepartmentStore } from '@/store/department'
import { useUserStore } from '@/store/user'
import { useCitizenStore } from '@/store/citizen'
import { useEmployeeStore } from '@/store/employee'
import { useI18n } from "vue-i18n"
import { usePermissions } from '@/composables/usePermissions'
import { useAppTours } from '@/composables/useAppTours'
import type { Error } from '@/types'

const departmentStore = useDepartmentStore()
const userStore = useUserStore() as any
const citizenStore = useCitizenStore()
const employeeStore = useEmployeeStore()
const customPagesStore = useCustomPagesStore() as any
const customSidebarLinksStore = useCustomSidebarLinksStore()
const assistantStore = useAssistantStore()
const { isAtLeast, can } = usePermissions()
const language = useI18n()
const { citizensLabel } = useTerminology()
const { industryHasFeature } = useIndustryFeatures()
const router = useRouter()
const route = useRoute()
const isSchedulesPage = computed(() => route.path.startsWith('/schedules'))
const routeName = router?.currentRoute?.value?.name

const navigation = shallowRef<any[]>([])

// The sidebar is a flat list of up to ~15 entries at very different altitudes,
// which makes it hard to scan. Each nav item carries a `group`; these render as
// labelled sections in a fixed order, and empty ones are dropped so a company
// with few modules never sees a heading over nothing. `footer` entries (only
// onboarding today) sit at the bottom, away from the daily work.
const NAV_GROUPS = [
    { key: 'daily', label: 'sidebar.groups.daily', icon: 'ph:house' },
    { key: 'documentation', label: 'sidebar.groups.documentation', icon: 'ph:notebook' },
    { key: 'organisation', label: 'sidebar.groups.organisation', icon: 'ph:buildings' },
    { key: 'shortcuts', label: 'sidebar.groups.shortcuts', icon: 'ph:star' },
]

const navigationGroups = computed(() =>
    NAV_GROUPS
        .map((group) => ({
            ...group,
            items: navigation.value.filter((item: any) => (item.group || 'daily') === group.key),
        }))
        .filter((group) => group.items.length > 0))

const footerNavigation = computed(() => navigation.value.filter((item: any) => item.group === 'footer'))

// Desktop shell only (see isDesktopApp): which group's items the context panel
// currently shows. Defaults to whichever group contains the active route, so
// landing on e.g. a documentation page opens with that panel already showing.
const activeGroupKey = ref<string | null>(null)
const activeContextGroup = computed(() => {
    if (activeGroupKey.value) {
        const explicit = navigationGroups.value.find((group) => group.key === activeGroupKey.value)
        if (explicit) return explicit
    }
    const forCurrentRoute = navigationGroups.value.find((group) =>
        group.items.some((item: any) => item.activeRouteNames?.includes(route.name as string)))
    return forCurrentRoute || navigationGroups.value[0] || null
})

// Collapsible sections. A hover-out menu was the other option and is the worse
// one here: it is harder to hit, it does not survive a touch screen, and it
// buries the entries one level deeper than they already are. Collapsing puts
// the choice with the person instead - a nurse folds away documentation, a
// manager folds away daily work - and the sections stay visible either way.
//
// The choice is a per-browser convenience rather than a setting worth a column,
// so it lives where the palette hint lives.
const COLLAPSED_GROUPS_KEY = 'co_sidebar_collapsed_groups'
const collapsedGroups = ref<string[]>([])

onMounted(() => {
    if (typeof localStorage === 'undefined') return
    try {
        const stored = JSON.parse(localStorage.getItem(COLLAPSED_GROUPS_KEY) || '[]')
        if (Array.isArray(stored)) collapsedGroups.value = stored.filter((key) => typeof key === 'string')
    } catch {
        // A browser that will not hand back what it stored is not a reason to
        // render no sidebar; every section simply starts open.
    }
})

function toggleGroup(key: string) {
    collapsedGroups.value = collapsedGroups.value.includes(key)
        ? collapsedGroups.value.filter((entry) => entry !== key)
        : [...collapsedGroups.value, key]
    try {
        localStorage.setItem(COLLAPSED_GROUPS_KEY, JSON.stringify(collapsedGroups.value))
    } catch {
        // Private windows and blocked site data: the fold still works for this
        // visit, it just is not remembered.
    }
}

/**
 * A folded section still opens when the page you are on lives inside it, so the
 * sidebar never hides where you actually are.
 */
function groupIsOpen(group: any): boolean {
    if (!collapsedGroups.value.includes(group.key)) return true
    return group.items.some((item: any) => item.activeRouteNames?.includes(route.name as string))
}


// "Get started" (sidebar) is the same /discover journey as the "Discover" tab -
// per Allan's feedback, once onboarding is fully done it should disappear from
// the sidebar too, not just the tab, so it doesn't look like something's still
// outstanding. Re-generate the sidebar the moment this flips so it can vanish
// immediately if the user finishes the last step while still on /discover,
// without needing a full navigation/reload first.
const { completed: discoverCompleted } = useDiscoverDone()
watch(discoverCompleted, () => {
    if (userStore.getUser) generateSidebarLinks(userStore.getUser)
})

const isImpersonating = ref(!!localStorage.getItem('_original_token'))
const globalSearch = ref<any>(null)

// Each sticky strip has to know the exact height of the ones above it. Those heights are
// not constants - the navbar is h-16 plus a 1px border, the impersonation banner only
// exists sometimes, and the schedules toolbar wraps to two or three rows depending on
// viewport width. Measuring them and publishing the result as CSS vars is the only way
// these stay flush; every hardcoded pixel value here was wrong by at least a border width.
const bannerRef = ref<HTMLElement | null>(null)
const navbarRef = ref<HTMLElement | null>(null)
const toolbarRef = ref<HTMLElement | null>(null)
let stickyObserver: ResizeObserver | null = null

function publishStickyOffsets() {
    if (typeof document === 'undefined') return
    // getBoundingClientRect, not offsetHeight: the latter rounds to whole pixels and a
    // fractional height then leaves a hairline gap under the pinned element.
    const heightOf = (el: HTMLElement | null) => el?.getBoundingClientRect().height ?? 0
    const bannerHeight = isImpersonating.value ? heightOf(bannerRef.value) : 0
    const headerOffset = bannerHeight + heightOf(navbarRef.value)
    const toolbarHeight = isSchedulesPage.value ? heightOf(toolbarRef.value) : 0

    const root = document.documentElement.style
    root.setProperty('--sticky-banner-height', `${bannerHeight}px`)
    root.setProperty('--sticky-header-offset', `${headerOffset}px`)
    root.setProperty('--sticky-toolbar-offset', `${headerOffset + toolbarHeight}px`)
}

function observeStickyElements() {
    if (typeof ResizeObserver === 'undefined') return
    stickyObserver?.disconnect()
    stickyObserver = new ResizeObserver(publishStickyOffsets)
    for (const el of [bannerRef.value, navbarRef.value, toolbarRef.value]) {
        if (el) stickyObserver.observe(el)
    }
}

onMounted(() => {
    publishStickyOffsets()
    observeStickyElements()
})

onBeforeUnmount(() => {
    stickyObserver?.disconnect()
    stickyObserver = null
    const root = document.documentElement.style
    root.removeProperty('--sticky-banner-height')
    root.removeProperty('--sticky-header-offset')
    root.removeProperty('--sticky-toolbar-offset')
})

// nextTick so the toolbar is measured after it has re-rendered with (or without) its
// sticky classes, not on the previous route's layout. The banner is v-if'd, so its
// element identity changes and the observer has to be re-attached.
watch([isSchedulesPage, isImpersonating], async () => {
    await nextTick()
    publishStickyOffsets()
    observeStickyElements()
})

// Keyboard hint for the global search button (⌘K on mac, Ctrl K elsewhere)
const { visible: undoVisible, message: undoMessage, undo, dismiss: dismissUndo } = useUndo()

const showCmdkTip = ref(false)
const CMDK_TIP_KEY = 'hasSeenCmdkTip'

function dismissCmdkTip() {
    showCmdkTip.value = false
    if (typeof localStorage !== 'undefined') localStorage.setItem(CMDK_TIP_KEY, 'true')
}
function tryCmdkTip() {
    dismissCmdkTip()
    globalSearch.value?.open()
}

// The tip is `fixed bottom-5 right-5`, so on a busy or narrow screen it can
// land on top of real, unrelated controls (the Ask AI input, an alert's
// action button, a list row) and silently absorb the click meant for them
// for its whole 12s/until-dismissed lifetime - including clicks that land ON
// the tip only because it happens to cover the control underneath. Dismiss on
// any click that isn't one of the tip's own two buttons (which already
// dismiss themselves via their own handlers), so at most one click is ever
// lost to it and the covered control is reachable immediately after.
function dismissCmdkTipIfClickOutside(event: PointerEvent) {
    if (!showCmdkTip.value) return
    const target = event.target as HTMLElement | null
    if (target?.closest('button')) return
    dismissCmdkTip()
}

const searchShortcut = computed(() => {
    const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)
    return isMac ? '⌘K' : 'Ctrl K'
})

const sidebarOpen = ref(false)
const sidebarPinned = ref(localStorage.getItem('sidebarPinned') !== 'false')
const sidebarHovered = ref(false)

// The hover-to-expand/collapse sidebar below is a web space-saving trick for
// a browser window; a real app window has room, so Desktop gets a fixed,
// always-expanded sidebar instead. Web is unaffected.
const isDesktopApp = useIsDesktopApp()
// Only macOS gets a hiddenInset title bar today (see citizenone-desktop's
// main.ts) - Windows/Linux still get a normal system title bar, so the
// navbar there needs no reserved space or drag region.
const isMacDesktopApp = isDesktopApp && useDesktopPlatform() === 'darwin'

const sidebarExpanded = computed(() => isDesktopApp || sidebarPinned.value || sidebarHovered.value)

// Desktop only: mirror unread counts onto the Dock badge, and surface a
// native OS notification for a genuinely new message/notification arriving
// while the window isn't focused - the in-app badges above already cover
// the focused case. Compares against the previous value rather than firing
// on every poll, since the count itself doesn't tell us what's new.
if (isDesktopApp) {
    let previousMessages = userStore.getUser?.unread_messages_count ?? 0
    let previousNotifications = userStore.getUser?.unread_notification_count ?? 0

    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission()
    }

    watch(() => [userStore.getUser?.unread_messages_count, userStore.getUser?.unread_notification_count], ([messages, notifications]) => {
        const total = (messages ?? 0) + (notifications ?? 0)
        ;(window as any).citizenOneDesktop?.setBadgeCount(total)

        if (document.hidden || !document.hasFocus()) {
            if ((messages ?? 0) > previousMessages) {
                new Notification(language.t('desktopNotifications.newMessage'), {
                    body: language.t('desktopNotifications.newMessageBody'),
                })
            } else if ((notifications ?? 0) > previousNotifications) {
                new Notification(language.t('desktopNotifications.newNotification'), {
                    body: language.t('desktopNotifications.newNotificationBody'),
                })
            }
        }

        previousMessages = messages ?? 0
        previousNotifications = notifications ?? 0
    })
}

// Use global mousemove on raw clientX — immune to DOM event propagation issues
// caused by CSS transitions triggering spurious mouseleave events on the sidebar
function handleGlobalMouseMove(e: MouseEvent) {
    if (sidebarPinned.value) return
    if (!sidebarHovered.value) {
        // Collapsed: only expand when hovering over the collapsed strip (4.5rem = 72px)
        if (e.clientX <= 72) sidebarHovered.value = true
    } else {
        // Expanded: only collapse when cursor leaves the full expanded sidebar (17rem = 272px)
        if (e.clientX > 272) sidebarHovered.value = false
    }
}
function handleMouseLeaveWindow() {
    if (!sidebarPinned.value) sidebarHovered.value = false
}
onMounted(() => {
    // sidebarExpanded is already permanently true on Desktop; these listeners
    // would just track a hover state nothing ever reads.
    if (isDesktopApp) {
        // Belt-and-suspenders: the main-content div above is the one scrolling
        // surface on Desktop (h-screen + overflow-y-auto); locking the actual
        // document/window here rules out the whole-window scroll/rubber-band
        // bounce a real app window shouldn't have, even if some page's own
        // markup pushes past the viewport height.
        document.documentElement.style.overflow = 'hidden'
        document.body.style.overflow = 'hidden'
        return
    }
    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseleave', handleMouseLeaveWindow)
})
onUnmounted(() => {
    if (isDesktopApp) return
    document.removeEventListener('mousemove', handleGlobalMouseMove)
    document.removeEventListener('mouseleave', handleMouseLeaveWindow)
})
function toggleSidebarPin() { sidebarPinned.value = !sidebarPinned.value; localStorage.setItem('sidebarPinned', String(sidebarPinned.value)) }

onMounted(() => {
    fetchUser()
    fetchCustomSidebarLinks()
    animateAssets()
    // Show the ⌘K discovery tip once, shortly after the app settles.
    if (typeof localStorage !== 'undefined' && !localStorage.getItem(CMDK_TIP_KEY)) {
        setTimeout(() => { showCmdkTip.value = true }, 3000)
    }
    document.addEventListener('pointerdown', dismissCmdkTipIfClickOutside, true)
})
onUnmounted(() => {
    document.removeEventListener('pointerdown', dismissCmdkTipIfClickOutside, true)
})

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    isSidebarLoading: true,
    modal: {
        is2faRequiredOpen: false,
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
    activeAppTour: '' as string,
    slideOver: { isLanguageSwitcherOpen: false, isSupportOpen: false },
})

// immediate: true because userStore.getUser is routinely already populated
// by the time this watcher registers - the login page sets it before
// navigating here, and a page reload restores it from persisted storage
// before this layout mounts. Without immediate, the watcher only fires on a
// transition it observes itself, which never happens in either case, and
// generateSidebarLinks() never runs - leaving the sidebar permanently empty.
watch(() => userStore.getUser, (user: any) => {
    if (user) { setCustomPageNames(); state.showSubscribeButton = true; generateSidebarLinks(user) }
    if (user?.company?.is_2fa_enabled && !user?.is_google_2fa_enabled) { state.modal.is2faRequiredOpen = true }
}, { immediate: true })

watch(() => userStore.getUser?.company?.onboarding_preferences?.modules?.vagtplan, () => {
    const user = userStore.getUser
    if (user) generateSidebarLinks(user)
})

watch(() => language.locale.value, (newLanguage: any) => {
    setCustomPageNames()
    if (newLanguage === 'en' && departmentStore.getSelectedDepartmentName === 'Alle afdelinger') departmentStore.setSelectedDepartmentName('All departments')
    else if (newLanguage === 'dk' && departmentStore.getSelectedDepartmentName === 'All departments') departmentStore.setSelectedDepartmentName('Alle afdelinger')
})

function getNavItemLabel(item: any) {
    const t = language.t
    if (item.rawLabel) return item.name
    if (item.name === 'Overview') return t('sidebar.overview')
    if (item.name === 'Discover') return t('sidebar.discover')
    // The store already holds the resolved word - see setCustomPageNames.
    if (item.name === 'Citizens') return customPagesStore.getCustomPagesName?.citizens || t('sidebar.citizens')
    if (item.name === 'Invoicing') return t('sidebar.invoicing')
    if (item.name === 'DentalOverview') return t('sidebar.dentalOverview')
    if (item.name === 'DentalRecalls') return t('sidebar.dentalRecalls')
    if (item.name === 'Calendar') return t('sidebar.calendar')
    if (item.name === 'Duty schedules') return customPagesStore.getCustomPagesName?.dutySchedules || t('sidebar.dutySchedules')
    if (item.name === 'My availability') return t('sidebar.myAvailability')
    if (item.name === 'My shift evaluations') return t('sidebar.myShiftEvaluations')
    if (item.name === 'Messages') return t('sidebar.messages')
    if (item.name === 'Procedures') return t('sidebar.procedures') || 'Procedurer'
    if (item.name === 'Protocols') return t('sidebar.protocols')
    if (item.name === 'Reports') return t('sidebar.reports')
    if (item.name === 'Plans And Goals Export') return t('sidebar.plansAndGoalsExport')
    if (item.name === 'Report Templates') return t('sidebar.reportTemplates')
    if (item.name === 'Documents') return t('sidebar.documents')
    if (item.name === 'Mail') return t('sidebar.mail')
    if (item.name === 'Leads') return t('sidebar.leads')
    if (item.name === 'Bullet Board') return t('sidebar.bulletBoard')
    // The string is a terminology link now, so it already carries the
    // company's own word, capitalised for a menu entry.
    if (item.name === 'Journal Notes') return t('sidebar.journalNotes')
    if (item.name === 'Forms') return t('sidebar.forms')
    if (item.name === 'Billing') return language.t('employment.billing.billing')
    if (item.name === 'Revenue report') return language.t('employment.revenue.report')
    if (item.name === 'Management & Economy') return language.t('managementEconomy.title')
    if (item.name === 'Economy') return language.t('economy.title')
    if (item.name === 'Inquiries') return language.t('inquiries.inquiries')
    if (item.name === 'Tasks') return language.t('taskBoards.title')
    if (item.name === 'Staff workload') return language.t('staffWorkloadReport.title')
    return item.name
}

// Global command palette (⌘K): sidebar navigation + any commands the current
// page contributes via useCommandPalette().
const { pageCommands, open: openCommandPalette } = useCommandPalette()
const { allItems: settingsCatalog } = useSettingsCatalog()
const isAdmin = computed(() => userStore.getUser?.roles?.some((role: any) => role.name === 'Admin'))
const commandPaletteItems = computed(() => {
    const _user = userStore.getUser // recompute when sidebar links rebuild
    const _locale = language.locale.value // recompute when labels change
    const nav = (navigation.value || []).map((item: any) => ({
        id: 'nav-' + item.href,
        group: language.t('commandPalette.navigate'),
        icon: item.icon,
        label: getNavItemLabel(item),
        run: () => navigateTo(item.href),
    }))

    // The settings were unreachable by search: the palette was built from the
    // sidebar, and the sidebar has one entry for some fifty settings pages. So
    // the only way to a setting was already knowing its name and where the
    // catalog keeps it. They stay out of the resting list and appear as soon as
    // anything is typed, findable by the page they configure as well as by
    // their own name.
    const settings = isAdmin.value
        ? settingsCatalog.value.map((entry: any) => {
            const label = entry.isTranslateName ? language.t(entry.name) : entry.name
            const pages = routeKeysForSettingsHref(entry.href)
                .map((key) => (navigation.value || []).find((item: any) => item.activeRouteNames?.includes(key)))
                .map((item: any) => item ? getNavItemLabel(item) : '')
            return {
                id: 'settings-' + entry.href,
                group: language.t('commandPalette.settings'),
                icon: 'ph:sliders-horizontal',
                label,
                keywords: [label, ...pages, ...routeKeysForSettingsHref(entry.href)].join(' '),
                onlyWhenSearching: true,
                run: () => navigateTo(entry.href),
            }
        })
        : []

    return [...pageCommands.value, ...nav, ...settings]
})

// One-time "did you know?" hint pointing at the ⌘K button.
const showCmdkHint = ref(false)
let cmdkHintTimer: any
const CMDK_HINT_KEY = 'co_cmdk_hint_seen'
function dismissCmdkHint() {
    showCmdkHint.value = false
    clearTimeout(cmdkHintTimer)
}
onMounted(() => {
    if (typeof localStorage === 'undefined' || localStorage.getItem(CMDK_HINT_KEY) === '1') return
    cmdkHintTimer = setTimeout(() => {
        showCmdkHint.value = true
        localStorage.setItem(CMDK_HINT_KEY, '1') // show at most once per browser
        cmdkHintTimer = setTimeout(() => { showCmdkHint.value = false }, 12000)
    }, 2500)
})
onUnmounted(() => clearTimeout(cmdkHintTimer))

async function fetchCustomSidebarLinks() {
    await customSidebarLinksStore.fetchLinks()
}

// Custom links can be created/edited/deleted from the settings pages while this
// layout stays mounted (SPA navigation) - re-render the sidebar whenever the
// shared store changes, not just on this layout's own initial fetch.
watch(() => customSidebarLinksStore.links, () => {
    if (userStore.getUser) generateSidebarLinks(userStore.getUser)
})

function openNavItem(item: any) {
    if (item?.external) {
        window.open(item.href, '_blank', 'noopener')
        return
    }
    navigateTo(item.href)
}

function generateSidebarLinks(user: any) {
    const nav: any[] = []
    try {
    const userHasSecuredMailAccess = user?.has_mail_access
    const userHasLeadsActive = user?.company?.is_leads_active
    // Company-level module enablement: no list (empty) = every module on (default).
    const companyModulePages = user?.company?.module_pages
    const companyHasModule = (name: string) => !Array.isArray(companyModulePages) || companyModulePages.length === 0 || companyModulePages.includes(name)
    const userHasPageAttendanceAccess = companyHasModule("Attendance") && user?.pages?.some((page: any) => page.name === "Attendance")
    nav.push({
        name: 'Overview',
        href: '/overview',
        icon: 'material-symbols:dashboard',
        group: 'daily',
        // My day and Statistics no longer have their own sidebar entries -
        // they're reachable via the tab row on these pages - so Overview
        // stays highlighted as active while on any of them.
        activeRouteNames: [
            'overview',
            'my-day',
            'statistics',
            'overview-google-drive',
        ]
    })
    if (isAtLeast('Admin') && !discoverCompleted.value) {
        // Onboarding, not daily work: rendered in the sidebar footer.
        nav.push({
            name: 'Discover',
            href: '/discover',
            icon: 'ph:compass',
            group: 'footer',
            activeRouteNames: [
                'discover',
            ]
        })
    }
    // The recall list only exists for dental clinics, the same rule the tabs
    // and the API use.
    if (industryHasFeature('clinicOverview')) {
        nav.push({
            name: 'DentalOverview',
            href: '/dental-overview',
            icon: 'ph:chart-pie-slice',
            activeRouteNames: ['dental-overview'],
        })
        nav.push({
            name: 'DentalRecalls',
            href: '/dental-recalls',
            icon: 'ph:calendar-check',
            activeRouteNames: ['dental-recalls'],
        })
    }
    nav.push({
        name: 'Citizens',
        href: '/citizens',
        icon: 'heroicons:user-group',
        group: 'daily',
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
            'citizens-uuid-reports',
            'citizens-uuid-tooth-chart',
            'citizens-uuid-price-estimates',
            'citizens-uuid-invoices',
        ]
    })
    if (companyHasModule("Calendar")) {
        nav.push({
            name: 'Calendar',
            href: '/calendar',
            icon: 'ph:calendar-blank',
            group: 'daily',
            activeRouteNames: [
                'calendar',
                'calendar-appointments',
                'calendar-appointments-settings',
            ]
        })
    }
    const vagtplanEnabled = user?.company?.onboarding_preferences?.modules?.vagtplan !== false
    if (companyHasModule("Duty Schedule") && user.pages?.find((page: any) => page.name === "Duty Schedule") && vagtplanEnabled) {
        nav.push({
            name: 'Duty schedules',
            href: '/schedules',
            icon: 'ph:calendar-dots',
            group: 'daily',
            activeRouteNames: [
                'schedules',
                'schedules-draft'
            ]
        })
        if (user?.is_extended_duty_schedule_active) {
            nav.push({
                name: 'My availability',
                href: '/my-availability',
                icon: 'ph:calendar-check',
                group: 'daily',
                activeRouteNames: [
                    'my-availability'
                ]
            })
            nav.push({
                name: 'My shift evaluations',
                href: '/my-shift-evaluations',
                icon: 'ph:star',
                group: 'daily',
                activeRouteNames: [
                    'my-shift-evaluations'
                ]
            })
        }
    }
    nav.push({
        name: 'Messages',
        href: '/messages',
        icon: 'ph:chat-circle',
        group: 'daily',
        activeRouteNames: [
            'messages',
            'messages-chat_uuid'
        ]
    })
    if (userHasSecuredMailAccess) {
        nav.push({ name: 'Mail', href: '/mail/inbox', icon: 'ph:envelope-open', group: 'daily', activeRouteNames: ['mail'] })
    }

    nav.push({ name: 'Journal Notes', href: '/journal-notes', icon: 'ph:note-pencil', group: 'documentation', activeRouteNames: ['journal-notes'] })

    if (companyHasModule("Documents")) {
        nav.push({ name: 'Documents', href: '/drive', icon: 'ph:folder', group: 'documentation', activeRouteNames: ['drive'] })
    }

    if (userHasPageAttendanceAccess) {
        nav.push({ name: 'Protocols', href: '/protocols', icon: 'ic:outline-shield', group: 'documentation', activeRouteNames: ['protocols', 'protocols-new', 'protocols-uuid'] })
    }

    if (user?.company?.industry?.system_name === 'employment_services') {
        nav.push({
            name: 'Reports',
            href: '/reports',
            icon: 'ph:file-text',
            group: 'documentation',
            activeRouteNames: [
                'reports',
                'reports-new',
                'reports-uuid-view-details',
                'reports-uuid-edit',
            ]
        })
    }

    if (isAtLeast('Admin') && user?.pages?.some((page: any) => page.name === 'Staff workload')) {
        nav.push({ name: 'Staff workload', href: '/reports/staff-workload', icon: 'ph:chart-bar', group: 'documentation', activeRouteNames: ['reports-staff-workload'] })
    }

    // The board announces things to the whole house, so it gets a megaphone
    // rather than yet another sheet-of-paper icon next to notes and documents.
    nav.push({ name: 'Bullet Board', href: '/news', icon: 'ph:megaphone', group: 'organisation', activeRouteNames: ['news', 'news-new', 'news-edit-uuid'] })

    if (user?.company?.inquiry_pipeline_enabled && companyHasModule('Inquiries') && user?.pages?.some((page: any) => page.name === 'Inquiries')) {
        nav.push({ name: 'Inquiries', href: '/inquiries', icon: 'ph:funnel', group: 'organisation', activeRouteNames: ['inquiries'] })
    }

    // Task boards hold the work that belongs to nobody's citizen record, so they
    // sit with the other organisation-wide pages rather than under a citizen.
    if (user?.company?.tasks_workflow_enabled) {
        nav.push({ name: 'Tasks', href: '/tasks', icon: 'ph:kanban', group: 'organisation', activeRouteNames: ['tasks'] })
    }

    if (userHasLeadsActive) {
        nav.push({ name: 'Leads', href: '/leads', icon: 'ph:nuclear-plant-duotone', group: 'organisation', activeRouteNames: ['leads'] })
    }

    // Report templates had no way in at all: not in the sidebar, and the command
    // palette is built from the sidebar, so search could not find them either.
    // Shown only to whoever may actually manage them - everyone else reaches a
    // template through "Create report" on the citizen and never needs the page.
    // Care plans are a module rather than a page - the follow-up bell and the
    // journal score live inside the citizen screen - so nothing in the industry
    // page set could reach this export. A dental clinic, which the industry
    // defaults switch care plans off for, still met it in the menu.
    const hasCarePlans = user?.company?.onboarding_preferences?.modules?.carePlans !== false
    if (hasCarePlans && (isAtLeast('Admin') || can('save_and_download_citizen_plan'))) {
        nav.push({
            name: 'Plans And Goals Export',
            href: '/reports/plans-and-goals-export',
            icon: 'ph:download-simple',
            group: 'documentation',
            activeRouteNames: ['reports-plans-and-goals-export'],
        })
    }

    if (isAtLeast('Admin') || can('manage_status_reports')) {
        nav.push({
            name: 'Forms',
            href: '/forms',
            icon: 'ph:clipboard-text',
            group: 'documentation',
            activeRouteNames: [
                'forms',
                'forms-new',
                'forms-form_uuid-edit',
            ]
        })
    }

    // One economy area rather than three addresses nobody could tell apart:
    // how it is going, what was earned, and what has to be invoiced.
    const hasEconomyOverview = user?.pages?.some((page: any) => page.name === 'Management & Economy')
    const hasEmploymentEconomy = companyHasModule('Billing') || companyHasModule('Revenue report')

    if (hasEconomyOverview || hasEmploymentEconomy) {
        nav.push({
            name: 'Economy',
            href: '/economy',
            icon: 'ph:chart-line-up',
            group: 'organisation',
            activeRouteNames: ['economy', 'management-economy', 'reports-employment-revenue', 'billing-employment'],
        })
    }

    // Invoicing sits with Economy rather than in daily work. It is money, it is the
    // same people, and it was landing above Citizens in the daily group only because
    // it carried no group at all. The module is switched on per company from the app
    // store.
    if (user?.has_invoice_app) {
        nav.push({
            name: 'Invoicing',
            href: '/invoicing',
            icon: 'ph:receipt',
            group: 'organisation',
            activeRouteNames: ['invoicing', 'settings-services'],
        })
    }

    // Removed from the sidebar (declutter, per stakeholder feedback) - the app
    // store is still reachable for every role via the profile dropdown menu.

    // Was rendered straight into the desktop template, which left it out of the
    // mobile sidebar entirely; as a nav item it now appears in both.
    if (user?.industry === 'Social welfare services' && user?.role === 'Admin' && companyHasModule('Findsocialetilbud')) {
        nav.push({
            name: 'FindSocialeTilbud.dk',
            href: '/findsocialetilbud.dk',
            image: '/img/findsocialetilbud-icon.png',
            group: 'shortcuts',
            rawLabel: true,
            activeRouteNames: ['findsocialetilbud.dk'],
        })
    }

    customSidebarLinksStore.links.forEach((link: any) => {
        nav.push({
            name: link.label,
            href: link.url,
            icon: link.icon || 'ph:link',
            group: 'shortcuts',
            activeRouteNames: [],
            external: true,
            rawLabel: true,
        })
    })
    } catch (error) {
        // Whatever throws here used to silently zero the whole sidebar, since
        // navigation.value was only ever assigned once, at the very end, from
        // a local array built by a ~250-line function with no error handling.
        // Logging (and keeping whatever was pushed before the throw) turns a
        // silent, hard-to-diagnose "empty sidebar" into a visible, debuggable one.
        console.error('generateSidebarLinks failed partway through', error)
    }

    navigation.value = nav
    state.isSidebarLoading = false
}

function setCustomPageNames() {
    const sl = language.locale.value
    const cp = (p: string) => userStore.getUser?.custom_pages?.find((i: any) => i.page_type === p)
    const n = (p: any) => sl === 'en' ? p?.en_name : p?.dk_name
    customPagesStore.setAddictionsNaming(n(cp('addictions')))
    // Resolved here rather than at each of the seventy places that read it: a
    // breadcrumb, a tab and a page heading all named the person, and all of them
    // read the seeded standard word instead of the company's own term - so a
    // dental clinic said Patienter in the menu and Borgere in the crumb above it.
    // "Was this renamed" is judged against the seed's own language (English or
    // Danish, `custom_pages`'s only two columns); what to show once it is judged
    // to be untouched is still this viewer's own word - see citizensLabel().
    customPagesStore.setCitizensNaming(
        citizensLabel(n(cp('citizens')), citizenSeedStandard(sl === 'en' ? 'en' : 'dk'), language.t('sidebar.citizens'))
    )
    customPagesStore.setDepartmentNaming(n(cp('department')))
    customPagesStore.setDutySchedulesNaming(n(cp('duty_schedules')))
    customPagesStore.setRiskAssessmentNaming(n(cp('risk_assessment')))
    customPagesStore.setGiveMedicineNaming(n(cp('give_medicine')))
    customPagesStore.setRoomsNaming(n(cp('rooms')))
    customPagesStore.setShelterNaming(n(cp('shelter')))
    customPagesStore.setCrisisCenterNaming(n(cp('crisis_center')))
    customPagesStore.setCompletedByNaming(n(cp('completed_by')))
    customPagesStore.setDateOfInquiryNaming(n(cp('date_of_inquiry')))
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
            // Plan/goal completion and check-in reminders are surfaced in the
            // notification bell (see NotificationBell) instead of blocking modals.
            guidedUserTourModalVisibility()
            maybeRedirectToDiscover(response?.data)
        }
    } catch (error: any) { state.error = error }
}

// New companies (admin, no onboarding preferences set yet) land on Discover
// once per session; once they save "what do you need" they land on the dashboard.
function maybeRedirectToDiscover(user: any) {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('discover_landing_done')) return
    const prefs = user?.company?.onboarding_preferences
    const isFresh = !prefs || (typeof prefs === 'object' && Object.keys(prefs).length === 0)
    if (isAtLeast('Admin') && isFresh && routeName === 'overview') {
        sessionStorage.setItem('discover_landing_done', '1')
        navigateTo('/discover')
    }
}

function plansGoalsSubgoalsCompletionReminderModalVisibility(response: any) {
    const lastHidden = localStorage.getItem('plansGoalsSubgoalsReminderHidden'); const today = moment().format('YYYY-MM-DD')
    if (lastHidden !== today && response?.data?.plans_goals_subgoals_reached_deadline_count > 0 && routeName !== 'plans-goals-subgoals-completions') state.modal.isPlanGoalSubgoalCompletionReminderOpen = true
}

function guidedUserTourModalVisibility() { if (userStore.getUser?.is_first_login) state.modal.isGuidedTourWelcomeOpen = true }

// Post-purchase app tours: the app store's success pages link to the app's
// setup route with ?tour=<generic_name>; any registered tour opens here.
const { getTour } = useAppTours()

watch(() => router.currentRoute.value.query?.tour, (tourKey: any) => {
    state.activeAppTour = tourKey && getTour(String(tourKey)) ? String(tourKey) : ''
}, { immediate: true })

function closeAppTour() {
    state.activeAppTour = ''
    const query = { ...router.currentRoute.value.query }
    delete query.tour
    router.replace({ query })
}

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
            clearSessionToken()
            localStorage.removeItem("rememberMe")
            // A plain logout should end any impersonation state along with the
            // session too, not just leave it for the next login on this browser
            // to inherit.
            localStorage.removeItem("_original_token")
            // Defense-in-depth (Phase 1 security): these fields aren't persisted
            // to localStorage any more (see store/citizen.js, store/employee.js),
            // but ssr:false navigateTo() below is a client-side route change, not
            // a reload - the in-memory store instances survive it. Clearing them
            // here stops the previous user's data lingering in memory into the
            // next login on the same tab (e.g. a shared/kiosk machine).
            userStore.resetUser()
            userStore.resetIsLoggedIn()
            citizenStore.setSelectedCitizen({})
            employeeStore.setSelectedEmployee({})
            departmentStore.resetSelectedDepartment()
            departmentStore.resetSelectedDepartmentColor()
            departmentStore.resetSelectedDepartmentName()
            // So the Obiyen chat bubble starts hidden again on next login, even
            // within the same tab (logout navigates client-side, so the plugin's
            // one-time boot logic doesn't get a chance to re-run and hide it).
            useObiyenChat().resetOnLogout()
            navigateTo('/')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function stopImpersonation() {
    state.isPageLoading = true
    try {
        const response = await userService.stopImpersonation()
        const restoredToken = response?.superadmin_token || localStorage.getItem('_original_token')
        if (restoredToken) {
            localStorage.setItem('_token', restoredToken)
        }
    } catch (error: any) {
        // The impersonation token may already be gone server-side; fall back to
        // the superadmin token we stashed client-side so the admin isn't stuck.
        const originalToken = localStorage.getItem('_original_token')
        if (originalToken) {
            localStorage.setItem('_token', originalToken)
        }
    }
    localStorage.removeItem('_original_token')
    isImpersonating.value = false
    navigateTo('/superadmin/companies')
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
    const flags: Record<string, string> = {
        en: '/img/icons/flags/united-kingdom.svg',
        dk: '/img/icons/flags/denmark.svg',
        no: '/img/icons/flags/norway.svg',
        sv: '/img/icons/flags/sweden.svg',
    }
    return flags[selectedLanguage] ?? '/img/icons/flags/united-kingdom.svg'
}

async function navigateToNews() {
    navigateTo('/statistics#news')
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
