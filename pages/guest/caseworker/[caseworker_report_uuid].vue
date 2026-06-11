<template>

    <Head>
        <Title>{{ $t('guestPortal.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
    </Head>

    <LoadingSpinner :isActive="isPageLoading">
        <div class="bg-[#f5fafe] relative overflow-clip min-h-screen">
            <img src="/img/icons/asset-01.svg" alt=""
                class="w-52 md:w-1/5 absolute -top-28 -right-24 opacity-0 transition-opacity duration-500"
                id="animatedAsset01" />
            <img src="/img/icons/asset-02.svg" alt=""
                class="w-52 md:w-1/4 absolute -bottom-48 -left-44 opacity-0 transition-opacity duration-500"
                id="animatedAsset02" />

            <div class="px-4 md:px-0 sm:mx-auto sm:w-full sm:max-w-5xl relative pt-10">
                <!-- Top bar -->
                <div class="flex items-center justify-between gap-4">
                    <Logo @click="navigateTo('/')" class="max-w-[180px]" />
                    <button type="button" class="rounded-full w-8"
                        @click="state.slideOver.isLanguageSwitcherOpen = true">
                        <img :src="identifyFlag()" alt="flag" />
                    </button>
                </div>

                <div class="mt-10">
                    <!-- ── Login form ── -->
                    <div v-if="!state.isAuthenticated" class="mx-auto max-w-xl">
                        <div class="bg-white ring-1 ring-gray-200 rounded-2xl p-8 shadow-sm">
                            <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />
                            <div class="space-y-2">
                                <h1 class="text-2xl font-semibold text-gray-900">
                                    {{ $t('guestPortal.title') }}
                                </h1>
                                <p class="text-sm text-gray-600">
                                    {{ $t('guestPortal.loginInstruction') }}
                                </p>
                            </div>
                            <form class="mt-6 space-y-4" @submit.prevent="unlockPortal">
                                <div class="space-y-1">
                                    <FormLabel for="password" :label="$t('guestPortal.password')" />
                                    <FormPasswordField id="password" name="password"
                                        :placeholder="$t('guestPortal.password')" v-model="state.form.password" />
                                </div>
                                <FormButton type="submit" buttonStyle="primary" class="w-full">
                                    {{ $t('guestPortal.unlockAccess') }}
                                </FormButton>
                            </form>
                        </div>
                    </div>

                    <!-- ── Authenticated portal ── -->
                    <div v-else class="space-y-6">
                        <!-- Dashboard header -->
                        <div class="grid gap-4 lg:grid-cols-3">
                            <div class="bg-white ring-1 ring-gray-200 rounded-2xl p-6 shadow-sm lg:col-span-full">
                                <div class="flex items-start justify-between gap-4">
                                    <div>
                                        <p class="text-xs uppercase tracking-wide text-primary font-semibold">
                                            {{ $t('guestPortal.sharedAccess') }}
                                        </p>
                                        <h1 class="mt-2 text-3xl font-semibold text-gray-900">
                                            {{
                                                state.dashboard?.config?.company
                                                    ?.name ||
                                                $t('guestPortal.title')
                                            }}
                                        </h1>
                                        <p class="mt-2 text-sm text-gray-600 max-w-2xl">
                                            {{
                                                state.dashboard?.config
                                                    ?.description ||
                                                $t('guestPortal.dashboardSubtitle')
                                            }}
                                        </p>
                                    </div>
                                    <FormButton type="button" buttonStyle="outline" size="sm" @click="logoutPortal">
                                        {{ $t('guestPortal.logout') }}
                                    </FormButton>
                                </div>
                                <div class="mt-6 grid gap-3 sm:grid-cols-3">
                                    <div class="rounded-xl border border-gray-200 p-4 bg-gray-50">
                                        <p class="text-xs uppercase text-gray-500">
                                            {{ $t('guestPortal.folders') }}
                                        </p>
                                        <p class="mt-2 text-2xl font-semibold text-gray-900">
                                            {{ state.folders.length }}
                                        </p>
                                    </div>
                                    <div class="rounded-xl border border-gray-200 p-4 bg-gray-50">
                                        <p class="text-xs uppercase text-gray-500">
                                            {{ $t('guestPortal.reports') }}
                                        </p>
                                        <p class="mt-2 text-2xl font-semibold text-gray-900">
                                            {{ state.reports.length }}
                                        </p>
                                    </div>
                                    <div class="rounded-xl border border-gray-200 p-4 bg-gray-50">
                                        <p class="text-xs uppercase text-gray-500">
                                            {{ $t('guestPortal.messages') }}
                                        </p>
                                        <p class="mt-2 text-2xl font-semibold text-gray-900">
                                            {{ state.messages.length }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tab nav -->
                        <TabsLocal v-model="state.activeTab" :tabs="[
                            {
                                key: 'reports',
                                label: $t('guestPortal.reports'),
                                icon: 'ph:files',
                                count:
                                    state.folders.length +
                                    state.reports.length,
                            },
                            {
                                key: 'messages',
                                label: $t('guestPortal.messages'),
                                icon: 'ph:chat-circle-dots',
                                count: state.messages.length,
                            },
                        ]" />

                        <!-- Reports tab -->
                        <div v-show="state.activeTab === 'reports'">
                            <ModulesGuestCaseworkerReportsTab :folders="state.folders" :reports="state.reports"
                                :caseworkerUuid="sharedCaseworkerUuid" @refresh="loadPortalData"
                                @refreshReports="fetchReports" />
                        </div>

                        <!-- Messages tab -->
                        <div v-show="state.activeTab === 'messages'">
                            <ModulesGuestCaseworkerMessagesTab :messages="state.messages"
                                :caseworkerUuid="sharedCaseworkerUuid" :headerName="chatHeaderName" :companyName="state.dashboard?.config?.company?.name || ''
                                    " @refresh="fetchMessages" @messageSent="fetchMessages" />
                        </div>
                    </div>
                </div>
            </div>

            <ModulesUserLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen"
                @close="state.slideOver.isLanguageSwitcherOpen = false" />
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { caseworkerService } from "@/components/api/guest/CaseworkerService"
import { useAlert } from "@/composables/alert"
import { useUserStore } from "@/store/user"
import { useI18n } from "vue-i18n"
import pusher from "@/services/pusher"

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const { successAlert } = useAlert()
const route = useRoute()
const sharedCaseworkerUuid = route.params.caseworker_report_uuid as string
const pageTitle = "Caseworker portal"

const state = reactive({
    error: null as any,
    isPageLoading: false,
    isAuthenticated: false,
    activeTab: "reports" as "reports" | "messages",
    dashboard: null as any,
    folders: [] as any[],
    reports: [] as any[],
    messages: [] as any[],
    form: {
        password: ""
    },
    slideOver: {
        isLanguageSwitcherOpen: false
    },
})

const isPageLoading = computed(() => state.isPageLoading)

const chatHeaderName = computed(() => {
    const config = state.dashboard?.config
    const name = `${config?.firstname ?? ""} ${config?.lastname ?? ""}`.trim()
    return name || config?.company?.name || "Caseworker"
})

const language = useI18n()
language.locale.value = userStore.getLanguage

onMounted(async () => {
    animateAssets()
    await initializePortal()
})

onUnmounted(() => unsubscribeFromChatChannel())

async function initializePortal() {
    if (!localStorage.getItem("_token")) return
    try {
        await caseworkerService.verifyCaseworker(sharedCaseworkerUuid)
        await loadPortalData()
        state.isAuthenticated = true
    } catch {
        localStorage.removeItem("_token")
        state.isAuthenticated = false
    }
}

async function unlockPortal() {
    state.error = null
    state.isPageLoading = true
    try {
        const params = {
            password: state.form.password,
        }
        const response = await caseworkerService.authenticateCaseworker(sharedCaseworkerUuid, params)
        if (response) {
            localStorage.setItem("_token", response.token)
            state.form.password = ""
            await loadPortalData()
            state.isAuthenticated = true
            successAlert(language.t("guestPortal.unlockedAlertTitle"), language.t("guestPortal.unlockedAlertBody"))
        }
    } catch (error: any) {
        state.error = { message: error?.message || language.t("guestPortal.couldNotUnlockBody") }
    }
    state.isPageLoading = false
}

async function logoutPortal() {
    unsubscribeFromChatChannel()
    try {
        await caseworkerService.logout(sharedCaseworkerUuid)
    } catch {
        /* ignore */
    }
    localStorage.removeItem("_token")
    state.isAuthenticated = false
    state.dashboard = null
    state.folders = []
    state.reports = []
    state.messages = []
}

async function loadPortalData() {
    await Promise.all([
        fetchDashboard(),
        fetchFolders(),
        fetchReports(),
        fetchMessages(),
    ])
}

async function fetchDashboard() {
    const response = await caseworkerService.getDashboard(sharedCaseworkerUuid)
    state.dashboard = response?.data ?? response
    subscribeToChatChannel()
}

async function fetchFolders() {
    const response = await caseworkerService.getFolders(sharedCaseworkerUuid)
    state.folders = response?.data ?? response ?? []
}

async function fetchReports() {
    const response = await caseworkerService.getReports(sharedCaseworkerUuid)
    state.reports = response?.data ?? response ?? []
}

async function fetchMessages() {
    const response = await caseworkerService.getMessages(sharedCaseworkerUuid)
    state.messages = response?.data ?? response ?? []
}

let pusherChannel: ReturnType<typeof pusher.subscribe> | null = null

function subscribeToChatChannel() {
    const chatUuid = state.dashboard?.chat_uuid
    if (!chatUuid || pusherChannel) return

    pusherChannel = pusher.subscribe(`citizenone.${chatUuid}`)
    pusherChannel.bind("chat-message", (payload: any) => {
        const message = payload?.data ?? payload
        const alreadyExists = state.messages.some(
            (m: any) => m.id === message?.id || m.uuid === message?.uuid,
        )
        if (!alreadyExists) {
            state.messages.push(message)
        }
    })
}

function unsubscribeFromChatChannel() {
    if (pusherChannel) {
        pusherChannel.unbind_all()
        pusher.unsubscribe(pusherChannel.name)
        pusherChannel = null
    }
}

function identifyFlag(): string {
    const flags: Record<string, string> = {
        en: "/img/icons/flags/united-kingdom.svg",
        dk: "/img/icons/flags/denmark.svg",
        no: "/img/icons/flags/norway.svg",
        sv: "/img/icons/flags/sweden.svg",
    }
    return (
        flags[userStore.getLanguage] ?? "/img/icons/flags/united-kingdom.svg"
    )
}

function animateAssets() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            entry.target.classList.toggle(
                "animate-fade-in",
                entry.isIntersecting,
            )
        })
    })
    const el1 = document.getElementById("animatedAsset01")
    const el2 = document.getElementById("animatedAsset02")
    if (el1) observer.observe(el1)
    if (el2) observer.observe(el2)
}
</script>
