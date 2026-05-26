<template>
    <Head>
        <Title>
            {{ pageTitle }} - {{ runtimeConfig?.public?.appName }}
        </Title>
    </Head>

    <LoadingSpinner :isActive="isPageLoading">
        <div class="bg-[#f5fafe] relative overflow-clip min-h-screen">
            <img src="/img/icons/asset-01.svg" alt="Image failed to load"
                class="w-52 md:w-1/5 absolute -top-28 -right-24 opacity-0 transition-opacity duration-500"
                id="animatedAsset01">
            <img src="/img/icons/asset-02.svg" alt="Image failed to load"
                class="w-52 md:w-1/4 absolute -bottom-48 -left-44 opacity-0 transition-opacity duration-500"
                id="animatedAsset02">

            <div class="px-4 md:px-0 sm:mx-auto sm:w-full sm:max-w-5xl relative pt-10">
                <div class="flex items-center justify-between gap-4">
                    <Logo @click="navigateTo('/')" class="max-w-[180px]" />
                    <button type="button" class="rounded-full w-8" @click="selectLanguage">
                        <img :src="identifyFlag()" alt="flag">
                    </button>
                </div>

                <div class="mt-10">
                    <Alert type="danger" :text="state?.error?.message" v-if="state.error?.message" />

                    <div v-if="!state.isAuthenticated" class="mx-auto max-w-xl">
                        <div class="bg-white ring-1 ring-gray-200 rounded-2xl p-8 shadow-sm">
                            <div class="space-y-2">
                                <h1 class="text-2xl font-semibold text-gray-900">Caseworker portal</h1>
                                <p class="text-sm text-gray-600">
                                    Enter the password from the share link to open the caseworker portal.
                                </p>
                            </div>

                            <form class="mt-6 space-y-4" @submit.prevent="unlockPortal">
                                <div class="space-y-1">
                                    <FormLabel for="password" label="Password" />
                                    <FormTextField id="password" name="password" placeholder="Password"
                                        v-model="state.form.password" />
                                </div>

                                <FormButton type="submit" buttonStyle="primary" class="w-full">
                                    Unlock access
                                </FormButton>
                            </form>
                        </div>
                    </div>

                    <div v-else class="space-y-6">
                        <div class="grid gap-4 lg:grid-cols-3">
                            <div class="bg-white ring-1 ring-gray-200 rounded-2xl p-6 shadow-sm lg:col-span-2">
                                <div class="flex items-start justify-between gap-4">
                                    <div>
                                        <p class="text-xs uppercase tracking-wide text-primary font-semibold">
                                            Shared access
                                        </p>
                                        <h1 class="mt-2 text-3xl font-semibold text-gray-900">
                                            {{ state.dashboard?.config?.company?.name || 'Caseworker portal' }}
                                        </h1>
                                        <p class="mt-2 text-sm text-gray-600 max-w-2xl">
                                            {{ state.dashboard?.config?.description || 'View shared folders, reports and messages for this caseworker link.' }}
                                        </p>
                                    </div>
                                    <FormButton type="button" buttonStyle="outline" size="sm" @click="logoutPortal">
                                        Logout
                                    </FormButton>
                                </div>

                                <div class="mt-6 grid gap-3 sm:grid-cols-3">
                                    <div class="rounded-xl border border-gray-200 p-4 bg-gray-50">
                                        <p class="text-xs uppercase text-gray-500">Folders</p>
                                        <p class="mt-2 text-2xl font-semibold text-gray-900">{{ state.folders?.length || 0 }}</p>
                                    </div>
                                    <div class="rounded-xl border border-gray-200 p-4 bg-gray-50">
                                        <p class="text-xs uppercase text-gray-500">Reports</p>
                                        <p class="mt-2 text-2xl font-semibold text-gray-900">{{ state.reports?.length || 0 }}</p>
                                    </div>
                                    <div class="rounded-xl border border-gray-200 p-4 bg-gray-50">
                                        <p class="text-xs uppercase text-gray-500">Messages</p>
                                        <p class="mt-2 text-2xl font-semibold text-gray-900">{{ state.messages?.length || 0 }}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="bg-white ring-1 ring-gray-200 rounded-2xl p-6 shadow-sm">
                                <p class="text-xs uppercase tracking-wide text-gray-500">Access</p>
                                <p class="mt-2 text-lg font-semibold text-gray-900">
                                    {{ state.dashboard?.config?.permission || 'view' }}
                                </p>
                                <p class="mt-3 text-sm text-gray-600">
                                    Share link: <span class="font-medium break-all">{{ sharedCaseworkerUuid }}</span>
                                </p>
                                <p class="mt-3 text-sm text-gray-600">
                                    Expiry: {{ formatDateTime(state.dashboard?.share_link?.expires_at) }}
                                </p>
                            </div>
                        </div>

                        <div class="grid gap-6 xl:grid-cols-2">
                            <section class="bg-white ring-1 ring-gray-200 rounded-2xl p-6 shadow-sm">
                                <div class="flex items-center justify-between gap-3">
                                    <div>
                                        <h2 class="text-lg font-semibold text-gray-900">Shared folders</h2>
                                        <p class="text-sm text-gray-600">Select a folder to view its contents.</p>
                                    </div>
                                    <FormButton type="button" buttonStyle="outline" size="sm" @click="loadPortalData">
                                        Refresh
                                    </FormButton>
                                </div>

                                <div class="mt-5 grid gap-3">
                                    <button v-for="folder in state.folders" :key="folder.uuid || folder.id" type="button"
                                        class="text-left rounded-xl border border-gray-200 p-4 hover:border-primary hover:bg-primary/5 transition"
                                        :class="state.selectedFolder?.id === folder.id ? 'border-primary bg-primary/5' : ''"
                                        @click="openFolder(folder)">
                                        <div class="flex items-center justify-between gap-3">
                                            <div>
                                                <p class="font-semibold text-gray-900">{{ folder.name }}</p>
                                                <p class="text-xs text-gray-500">{{ folder.files?.length || 0 }} files</p>
                                            </div>
                                            <Icon name="heroicons:folder" class="h-5 w-5 text-primary" />
                                        </div>
                                    </button>
                                    <p v-if="!state.folders?.length" class="text-sm text-gray-600">
                                        No folders have been shared for this link.
                                    </p>
                                </div>

                                <div v-if="state.folderContents?.length" class="mt-6 border-t pt-5">
                                    <h3 class="font-semibold text-gray-900 mb-3">
                                        {{ state.selectedFolder?.name }} contents
                                    </h3>
                                    <div class="space-y-2">
                                        <div v-for="item in state.folderContents" :key="item.uuid || item.id"
                                            class="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3">
                                            <div>
                                                <p class="font-medium text-gray-900">{{ item.name }}</p>
                                                <p class="text-xs text-gray-500">{{ item.type }}</p>
                                            </div>
                                            <FormButton type="button" buttonStyle="outline" size="sm"
                                                @click="downloadItem(item)">
                                                Download
                                            </FormButton>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section class="bg-white ring-1 ring-gray-200 rounded-2xl p-6 shadow-sm">
                                <div class="flex items-center justify-between gap-3">
                                    <div>
                                        <h2 class="text-lg font-semibold text-gray-900">Shared reports</h2>
                                        <p class="text-sm text-gray-600">Files available through this share link.</p>
                                    </div>
                                    <FormButton type="button" buttonStyle="outline" size="sm" @click="fetchReports">
                                        Refresh
                                    </FormButton>
                                </div>

                                <div class="mt-5 space-y-3">
                                    <div v-for="report in state.reports" :key="report.uuid || report.id"
                                        class="rounded-xl border border-gray-200 p-4">
                                        <div class="flex items-start justify-between gap-3">
                                            <div>
                                                <p class="font-semibold text-gray-900">{{ report.name }}</p>
                                                <p class="text-xs text-gray-500">{{ report.file_url || 'No file URL' }}</p>
                                            </div>
                                            <FormButton type="button" buttonStyle="outline" size="sm"
                                                @click="downloadItem(report)">
                                                Download
                                            </FormButton>
                                        </div>
                                    </div>
                                    <p v-if="!state.reports?.length" class="text-sm text-gray-600">
                                        No reports were shared for this link.
                                    </p>
                                </div>
                            </section>
                        </div>

                        <section class="bg-white ring-1 ring-gray-200 rounded-2xl p-6 shadow-sm">
                            <div class="flex items-center justify-between gap-3">
                                <div>
                                    <h2 class="text-lg font-semibold text-gray-900">Messages</h2>
                                    <p class="text-sm text-gray-600">Send a message to the caseworker chat.</p>
                                </div>
                                <FormButton type="button" buttonStyle="outline" size="sm" @click="fetchMessages">
                                    Refresh
                                </FormButton>
                            </div>

                            <div class="mt-5 grid gap-6 lg:grid-cols-2">
                                <div class="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                                    <div v-for="message in state.messages" :key="message.uuid || message.id"
                                        class="rounded-xl border border-gray-200 p-4">
                                        <div class="flex items-center justify-between gap-3">
                                            <p class="font-semibold text-gray-900">{{ senderDisplayName(message) || 'System' }}</p>
                                            <p class="text-xs text-gray-500">{{ formatDateTime(message.created_at) }}</p>
                                        </div>
                                        <p class="mt-2 text-sm text-gray-700 whitespace-pre-line">{{ message.message }}</p>
                                    </div>
                                    <p v-if="!state.messages?.length" class="text-sm text-gray-600">
                                        No messages yet.
                                    </p>
                                </div>

                                <form class="space-y-4" @submit.prevent="sendMessage">
                                    <div class="space-y-1">
                                        <FormLabel for="message" label="Message" />
                                        <textarea id="message" v-model="state.form.message"
                                            class="min-h-[180px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                                            placeholder="Write a message"></textarea>
                                    </div>

                                    <FormButton type="submit" buttonStyle="primary" class="w-full">
                                        Send message
                                    </FormButton>
                                </form>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <ModulesUserLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen"
                @close="state.slideOver.isLanguageSwitcherOpen = false" />
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { caseworkerService } from '@/components/api/guest/CaseworkerService'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const { successAlert, errorAlert } = useAlert()
const router = useRouter()
const route = useRoute()
const sharedCaseworkerUuid = route.params.caseworker_report_uuid as string
const pageTitle = 'Caseworker portal'

const state = reactive({
    error: null as any,
    isPageLoading: false,
    isAuthenticated: false,
    dashboard: null as any,
    folders: [] as any[],
    folderContents: [] as any[],
    reports: [] as any[],
    messages: [] as any[],
    selectedFolder: null as any,
    form: {
        password: '',
        message: '',
    },
    slideOver: {
        isLanguageSwitcherOpen: false,
    },
})

const isPageLoading = computed(() => state?.isPageLoading ?? false)

const language = useI18n()
language.locale.value = userStore.getLanguage

onMounted(async () => {
    animateAssets()
    await initializePortal()
})

async function initializePortal() {
    const token = localStorage.getItem('_token')
    if (!token) {
        return
    }

    try {
        await caseworkerService.verifyCaseworker(sharedCaseworkerUuid)
        state.isAuthenticated = true
        await loadPortalData()
    } catch {
        localStorage.removeItem('_token')
    }
}

async function unlockPortal() {
    state.error = null
    state.isPageLoading = true

    try {
        const response = await caseworkerService.authenticateCaseworker(sharedCaseworkerUuid, {
            password: state.form.password,
        })

        localStorage.setItem('_token', response.token)
        state.isAuthenticated = true
        state.form.password = ''
        await loadPortalData()
        successAlert('Unlocked', 'Caseworker portal opened successfully')
    } catch (error: any) {
        state.error = error
        errorAlert('Fejl', error?.message || 'Could not unlock the portal')
    }

    state.isPageLoading = false
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

function senderDisplayName(message: any) {
    if (!message) return ''
    const sender = message.sender || {}
    const senderType = message.sender_type || ''
    if (senderType.includes('CaseworkerLicenseConfig') || senderType.toLowerCase().includes('caseworker')) {
        return sender.name || `${sender.firstname ?? ''} ${sender.lastname ?? ''}`.trim()
    }
    return `${sender.firstname ?? ''} ${sender.lastname ?? ''}`.trim() || sender.name || ''
}

async function openFolder(folder: any) {
    state.selectedFolder = folder
    const response = await caseworkerService.getFolderContents(sharedCaseworkerUuid, folder.uuid || folder.id)
    state.folderContents = response?.data ?? response ?? []
}

async function sendMessage() {
    if (!state.form.message.trim()) {
        return
    }

    state.isPageLoading = true
    try {
        await caseworkerService.sendMessage(sharedCaseworkerUuid, {
            message: state.form.message,
        })
        state.form.message = ''
        await fetchMessages()
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function downloadItem(item: any) {
    try {
        const fileUuid = item.uuid || item.file_uuid || item.id
        const blob = await caseworkerService.downloadFile(sharedCaseworkerUuid, fileUuid)
        const url = window.URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = item.name || 'download'
        anchor.click()
        window.URL.revokeObjectURL(url)
    } catch (error: any) {
        state.error = error
    }
}

async function logoutPortal() {
    try {
        await caseworkerService.logout(sharedCaseworkerUuid)
    } catch {
        // Ignore logout errors and clear local access anyway.
    }

    localStorage.removeItem('_token')
    state.isAuthenticated = false
    state.dashboard = null
    state.folders = []
    state.folderContents = []
    state.reports = []
    state.messages = []
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

    const animatedAsset01 = document.getElementById('animatedAsset01') as any
    const animatedAsset02 = document.getElementById('animatedAsset02') as any
    if (animatedAsset01) observer.observe(animatedAsset01)
    if (animatedAsset02) observer.observe(animatedAsset02)
}

function formatDateTime(value: any) {
    if (!value) return 'N/A'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
}
</script>