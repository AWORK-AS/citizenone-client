<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <!-- Mobile sidebar -->
        <TransitionRoot as="template" :show="sidebarOpen">
            <Dialog as="div" class="relative z-50 lg:hidden" @close="sidebarOpen = false">
                <TransitionChild as="template" enter="transition-opacity ease-linear duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="transition-opacity ease-linear duration-300" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-[#205E77]/80" />
                </TransitionChild>
                <div class="fixed inset-0 flex">
                    <TransitionChild as="template" enter="transition ease-in-out duration-300 transform" enter-from="-translate-x-full" enter-to="translate-x-0" leave="transition ease-in-out duration-300 transform" leave-from="translate-x-0" leave-to="-translate-x-full">
                        <DialogPanel class="relative mr-16 flex w-full max-w-xs flex-1">
                            <div class="flex grow flex-col overflow-y-auto co-sidebar px-4 pb-4">
                                <SidebarContent :navigation="groupedNav" :route="$route" @navigate="nav => { navigateTo(nav); sidebarOpen = false }" :user="userStore.getUser" @logout="logout" />
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </TransitionRoot>

        <!-- Desktop sidebar -->
        <div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
            <div class="flex grow flex-col overflow-y-auto co-sidebar pb-4">
                <!-- Logo -->
                <div class="px-5 py-5 cursor-pointer" @click="navigateTo('/superadmin/dashboard')">
                    <LogoWhite />
                    <p class="text-[10px] text-white/35 font-medium tracking-[0.1em] uppercase mt-1.5">Super admin panel</p>
                </div>

                <nav class="flex flex-1 flex-col px-3 mt-1 overflow-y-auto">
                    <!-- OVERSIGT -->
                    <div class="mb-1">
                        <p class="co-nav-group-label">Oversigt</p>
                        <div v-for="item in groupedNav.oversigt" :key="item.href" @click="navigateTo(item.href)"
                            class="co-nav-item" :class="isActive(item) ? 'co-nav-active' : 'co-nav-inactive'">
                            <Icon :name="item.icon" class="w-4 h-4 shrink-0" />
                            <span>{{ item.label }}</span>
                        </div>
                    </div>

                    <!-- ØKONOMI -->
                    <div class="mb-1">
                        <p class="co-nav-group-label">Økonomi</p>
                        <div v-for="item in groupedNav.okonomi" :key="item.href" @click="navigateTo(item.href)"
                            class="co-nav-item" :class="isActive(item) ? 'co-nav-active' : 'co-nav-inactive'">
                            <Icon :name="item.icon" class="w-4 h-4 shrink-0" />
                            <span>{{ item.label }}</span>
                        </div>
                    </div>

                    <!-- PLATFORM -->
                    <div class="mb-1">
                        <p class="co-nav-group-label">Platform</p>
                        <div v-for="item in groupedNav.platform" :key="item.href" @click="navigateTo(item.href)"
                            class="co-nav-item" :class="isActive(item) ? 'co-nav-active' : 'co-nav-inactive'">
                            <Icon :name="item.icon" class="w-4 h-4 shrink-0" />
                            <span>{{ item.label }}</span>
                        </div>
                    </div>
                </nav>

                <!-- User footer -->
                <div class="px-3 mt-auto">
                    <div class="co-user-footer">
                        <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {{ userInitials }}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-[13px] font-semibold text-white truncate">{{ userStore.getUser?.firstname }} {{ userStore.getUser?.lastname }}</p>
                            <p class="text-[11px] text-white/50 flex items-center gap-1">
                                <span class="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                                Super Admin
                            </p>
                        </div>
                        <Menu as="div" class="relative">
                            <MenuButton class="text-white/50 hover:text-white transition-colors p-1">
                                <Icon name="heroicons:chevron-up-down-20-solid" class="w-4 h-4" />
                            </MenuButton>
                            <transition enter-active-class="transition ease-out duration-100" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
                                <MenuItems class="absolute bottom-full right-0 mb-2 w-48 rounded-xl bg-white shadow-lg ring-1 ring-black/5 py-1 focus:outline-none">
                                    <MenuItem>
                                        <div class="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2" @click="selectLanguage">
                                            <img :src="identifyFlag()" class="w-4 h-4" />
                                            {{ $t('navbar.switchLanguage') }}
                                        </div>
                                    </MenuItem>
                                    <MenuItem>
                                        <div class="px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-2" @click="logout">
                                            <Icon name="ph:sign-out" class="w-4 h-4" />
                                            {{ $t('navbar.logout') }}
                                        </div>
                                    </MenuItem>
                                </MenuItems>
                            </transition>
                        </Menu>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main content -->
        <div class="lg:pl-64 bg-[#F5F6F8] min-h-screen">
            <!-- Top bar -->
            <div class="sticky top-0 z-40 flex h-14 items-center gap-x-3 border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
                <!-- Mobile hamburger -->
                <button type="button" class="-m-2.5 p-2.5 text-gray-700 lg:hidden" @click="sidebarOpen = true">
                    <Icon name="heroicons:bars-3" class="h-6 w-6" />
                </button>

                <!-- Breadcrumb -->
                <div class="flex items-center gap-x-2 text-sm text-gray-500 flex-1">
                    <span class="font-medium text-gray-400">Superadmin</span>
                    <Icon name="ph:caret-right" class="w-3 h-3 text-gray-300" />
                    <span class="font-semibold text-gray-700">
                        <slot name="header">Dashboard</slot>
                    </span>
                </div>

                <!-- Right side -->
                <div class="flex items-center gap-x-3">
                    <!-- User menu -->
                    <Menu as="div" class="relative">
                        <MenuButton class="-m-1.5 flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
                            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                {{ userInitials }}
                            </div>
                            <span class="hidden lg:block text-sm font-medium text-gray-700">
                                {{ userStore.getUser?.firstname }} {{ userStore.getUser?.lastname }}
                            </span>
                            <Icon name="heroicons:chevron-down-20-solid" class="w-4 h-4 text-gray-500" />
                        </MenuButton>
                        <transition enter-active-class="transition ease-out duration-100" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
                            <MenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-gray-900/5 py-1 focus:outline-none">
                                <MenuItem>
                                    <div class="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2" @click="selectLanguage">
                                        <img :src="identifyFlag()" class="w-4 h-4" />
                                        {{ $t('navbar.switchLanguage') }}
                                    </div>
                                </MenuItem>
                                <MenuItem>
                                    <div class="px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-2" @click="logout">
                                        <Icon name="ph:sign-out" class="w-4 h-4" />
                                        {{ $t('navbar.logout') }}
                                    </div>
                                </MenuItem>
                            </MenuItems>
                        </transition>
                    </Menu>
                </div>
            </div>

            <!-- Page content -->
            <main class="py-8">
                <div class="px-4 sm:px-6 lg:px-8">
                    <div class="mt-0">
                        <slot />
                    </div>
                </div>
            </main>
        </div>

        <ModulesSuperadminLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen" @close="state.slideOver.isLanguageSwitcherOpen = false" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, Menu, MenuButton, MenuItem, MenuItems, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { authService } from '@/components/api/superadmin/AuthService'
import { userService } from '@/components/api/superadmin/UserService'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const userStore = useUserStore() as any
const language = useI18n()
const route = useRoute()

const sidebarOpen = ref(false)
const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    slideOver: { isLanguageSwitcherOpen: false },
})

// ── Navigation groups matching Obiyen structure ──────────────────────────
const groupedNav = {
    oversigt: [
        { name: 'Dashboard', label: 'Instrumentbræt', href: '/superadmin/dashboard', icon: 'material-symbols:dashboard', routes: ['superadmin-dashboard'] },
        { name: 'Companies', label: 'Virksomheder', href: '/superadmin/companies', icon: 'ph:buildings', routes: ['superadmin-companies','superadmin-companies-new','superadmin-companies-company_uuid-edit','superadmin-companies-company_uuid-accounts','superadmin-companies-company_uuid-accounts-new','superadmin-companies-company_uuid-accounts-account_uuid-edit','superadmin-companies-company_uuid-invoices','superadmin-companies-company_uuid-license-overview','superadmin-companies-company_uuid-apps','superadmin-companies-company_uuid-overview'] },
        { name: 'Users', label: 'Brugere', href: '/superadmin/users', icon: 'ph:users-three', routes: ['superadmin-users','superadmin-users-new','superadmin-users-edit-uuid'] },
    ],
    okonomi: [
        { name: 'Finance', label: 'Økonomi', href: '/superadmin/finance', icon: 'ph:chart-line-up', routes: ['superadmin-finance'] },
        { name: 'Invoices', label: 'Fakturaer', href: '/superadmin/invoices', icon: 'ph:invoice', routes: ['superadmin-invoices','superadmin-invoices-invoice_uuid'] },
        { name: 'Orders', label: 'Ordrer', href: '/superadmin/orders', icon: 'ph:database', routes: ['superadmin-orders'] },
    ],
    platform: [
                { name: 'Licenses', label: 'Licenser', href: '/superadmin/licenses', icon: 'ph:key', routes: ['superadmin-licenses'] },
                { name: 'Products', label: 'Produkter', href: '/superadmin/products', icon: 'ph:storefront', routes: ['superadmin-products'] },
        { name: 'Apps', label: 'Apps', href: '/superadmin/apps', icon: 'ic:baseline-apps', routes: ['superadmin-apps','superadmin-apps-new','superadmin-apps-appUuid-edit'] },
                { name: 'ClientRoles', label: 'Roller & Rettigheder', href: '/superadmin/client-roles', icon: 'ph:shield-check', routes: ['superadmin-client-roles'] },
        { name: 'Sales Campaign', label: 'Salgskampagner', href: '/superadmin/sales-campaign', icon: 'ph:megaphone-simple', routes: ['superadmin-sales-campaign','superadmin-sales-campaign-new','superadmin-sales-campaign-edit-uuid'] },
        { name: 'Cancellations', label: 'Opsigelser', href: '/superadmin/compliance/cancellations', icon: 'ph:x-circle', routes: ['superadmin-compliance-cancellations'] },
        { name: 'Polls', label: 'Afstemninger', href: '/superadmin/polls', icon: 'ph:chart-bar-horizontal', routes: ['superadmin-polls','superadmin-polls-new','superadmin-polls-pollUuid','superadmin-polls-pollUuid-edit'] },
        { name: 'Coupons', label: 'Kuponer', href: '/superadmin/coupons', icon: 'ic:outline-discount', routes: ['superadmin-coupons','superadmin-coupons-new','superadmin-coupons-couponUuid-edit'] },
    ],
}

function isActive(item: any) {
    return item.routes?.includes(route.name as string) || route.path.startsWith(item.href + '/')
}

const userInitials = computed(() => {
    const f = userStore.getUser?.firstname || ''
    const l = userStore.getUser?.lastname || ''
    return ((f[0] || '') + (l[0] || '')).toUpperCase() || 'SA'
})

onMounted(() => { fetchUser() })

async function fetchUser() {
    try {
        const response = await userService.getCurrentUser()
        if (response?.data) {
            userStore.setUser(response.data)
            userStore.setLanguage(response.data?.language?.code)
            language.locale.value = response.data?.language?.code
        }
    } catch (error: any) { state.error = error }
}

const viewAsRoles = [
    { key: 'admin',    label: 'Administrator', color: '#205E77' },
    { key: 'business', label: 'Forretning',    color: '#42AED9' },
    { key: 'end_user', label: 'Slutbruger',    color: '#2E9E33' },
]
const viewAsRole = ref<string|null>(null)

function toggleViewAs(key: string) {
    viewAsRole.value = viewAsRole.value === key ? null : key
    const globalViewAs = useState<string|null>('viewAsRole', () => null)
    globalViewAs.value = viewAsRole.value
}

async function logout() {
    state.isPageLoading = true
    try {
        const response = await authService.logout()
        if (response) {
            localStorage.removeItem('_token')
            userStore.resetUser()
            navigateTo('/superadmin')
        }
    } catch (error: any) { state.error = error }
    state.isPageLoading = false
}

function selectLanguage() { state.slideOver.isLanguageSwitcherOpen = true }

function identifyFlag() {
    const lang = userStore.getLanguage
    return lang === 'en' ? '/img/icons/flags/united-kingdom.svg' : '/img/icons/flags/denmark.svg'
}
</script>

<style scoped>
.co-sidebar {
    background: linear-gradient(180deg, #1a5068 0%, #154055 100%);
    border-right: 1px solid rgba(255,255,255,0.06);
}
.co-nav-group-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    padding: 12px 8px 4px;
}
.co-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 8px;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    margin-bottom: 1px;
}
.co-nav-active {
    background: rgba(255,255,255,0.12);
    color: #ffffff;
    box-shadow: inset 2px 0 0 #42AED9;
}
.co-nav-inactive {
    color: rgba(255,255,255,0.60);
}
.co-nav-inactive:hover {
    background: rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.90);
}
.co-user-footer {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 8px;
    border-top: 1px solid rgba(255,255,255,0.08);
    margin-top: 8px;
}
</style>
