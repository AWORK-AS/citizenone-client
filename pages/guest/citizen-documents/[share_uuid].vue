<template>

    <Head>
        <Title>{{ $t('guestDocuments.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
    </Head>

    <LoadingSpinner :isActive="state.isPageLoading">
        <div
            class="bg-[#f5fafe] relative overflow-clip flex min-h-screen flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
            <img src="/img/icons/asset-01.svg" alt=""
                class="w-52 md:w-1/5 absolute -top-28 -right-24 opacity-0 transition-opacity duration-500"
                id="animatedAsset01">
            <img src="/img/icons/asset-02.svg" alt=""
                class="w-52 md:w-1/4 absolute -bottom-48 -left-44 opacity-0 transition-opacity duration-500"
                id="animatedAsset02">
            <div class="px-4 md:px-0 sm:mx-auto sm:w-full sm:max-w-3xl relative">
                <Logo class="mx-auto" />
                <button type="button" class="-m-2.5 rounded-full w-8 absolute right-5 top-1.5"
                    :aria-label="$t('guestDocuments.changeLanguage')" @click="state.isLanguageSwitcherOpen = true">
                    <img :src="identifyFlag()" alt="">
                </button>
            </div>

            <div class="mt-10 px-4 sm:px-0 sm:mx-auto sm:w-full" :class="state.session ? 'sm:max-w-3xl' : 'sm:max-w-md'">
                <Alert type="danger" :text="state.error" v-if="state.error" />

                <!-- Locked: ask for the password the sender gave separately. -->
                <div class="mt-5 bg-white shadow-sm rounded-lg" v-if="!state.session">
                    <form class="px-6 py-6 sm:px-10 sm:py-8" @submit.prevent="unlock">
                        <div class="space-y-4">
                            <div class="flex items-center gap-x-3">
                                <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                    <Icon name="ph:lock-simple" class="size-5 text-primary" aria-hidden="true" />
                                </div>
                                <h1 class="font-semibold text-xl">{{ $t('guestDocuments.title') }}</h1>
                            </div>
                            <p class="text-sm text-gray-600">{{ $t('guestDocuments.enterPassword') }}</p>
                            <div class="space-y-1">
                                <FormLabel for="password" :label="$t('guestDocuments.password')" />
                                <FormPasswordField id="password" name="password"
                                    :placeholder="$t('guestDocuments.password')" v-model="state.password" />
                                <FormError :error="state.passwordError" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <FormButton type="submit" buttonStyle="primary" class="w-full">
                                {{ $t('guestDocuments.unlock') }}
                            </FormButton>
                        </div>
                    </form>
                </div>

                <!-- Unlocked: the shared document, or the shared folder to browse. -->
                <div class="mt-5 bg-white shadow-sm rounded-lg" v-else>
                    <div class="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
                        <div class="min-w-0 space-y-1">
                            <h1 class="font-semibold text-xl truncate">{{ state.session.item?.name }}</h1>
                            <p class="text-sm text-gray-600" v-if="state.session.sender">
                                {{ $t('guestDocuments.sharedBy', {
                                    name: state.session.sender,
                                    company: state.session.company ?? '',
                                }) }}
                            </p>
                            <p class="text-xs text-gray-500">
                                {{ $t('guestDocuments.linkExpires', { date: formatExpiry(state.session.link_expires_at) }) }}
                            </p>
                        </div>
                        <FormButton type="button" buttonStyle="cancel" @click="lock()">
                            <Icon name="ph:lock-simple" class="size-4" aria-hidden="true" />
                            {{ $t('guestDocuments.lock') }}
                        </FormButton>
                    </div>

                    <nav v-if="state.path.length > 1" class="flex flex-wrap items-center gap-1 px-5 pt-4 text-sm sm:px-6"
                        :aria-label="$t('guestDocuments.folderPath')">
                        <template v-for="(folder, index) in state.path" :key="folder.uuid">
                            <Icon v-if="index > 0" name="heroicons:chevron-right" class="size-3 text-gray-400" aria-hidden="true" />
                            <button v-if="index < state.path.length - 1" type="button"
                                class="text-primary hover:underline" @click="openFolder(folder.uuid)">
                                {{ folder.name }}
                            </button>
                            <span v-else class="font-medium text-gray-900">{{ folder.name }}</span>
                        </template>
                    </nav>

                    <ul class="divide-y divide-gray-100 px-2 py-2 sm:px-3" v-if="state.items.length">
                        <li v-for="item in state.items" :key="item.uuid"
                            class="flex items-center gap-x-3 rounded-md px-3 py-3 hover:bg-gray-50">
                            <Icon :name="item.type === 'folder' ? 'ph:folder-fill' : 'ph:file-text'"
                                class="size-5 shrink-0" :class="item.type === 'folder' ? 'text-primary' : 'text-gray-500'"
                                aria-hidden="true" />
                            <button type="button" class="min-w-0 flex-1 text-left"
                                @click="item.type === 'folder' ? openFolder(item.uuid) : viewFile(item)">
                                <span class="block truncate text-sm font-medium text-gray-900">{{ item.name }}</span>
                                <span class="block text-xs text-gray-500">
                                    {{ formatDateToReadable(item.document_date ?? item.created_at) }}
                                    <template v-if="item.type === 'file' && item.size"> · {{ formatSize(item.size) }}</template>
                                </span>
                            </button>
                            <div class="flex shrink-0 gap-2" v-if="item.type === 'file'">
                                <Tooltip :text="$t('guestDocuments.view')">
                                    <FormButton :aria-label="$t('guestDocuments.view')" type="button" buttonStyle="primary"
                                        @click="viewFile(item)">
                                        <Icon name="ph:eye" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <Tooltip :text="$t('guestDocuments.download')">
                                    <FormButton :aria-label="$t('guestDocuments.download')" type="button"
                                        buttonStyle="primary" @click="downloadFile(item)">
                                        <Icon name="ph:download-simple" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                            </div>
                            <Icon v-else name="heroicons:chevron-right" class="size-4 shrink-0 text-gray-400" aria-hidden="true" />
                        </li>
                    </ul>
                    <p v-else class="px-6 py-10 text-center text-sm text-gray-500">{{ $t('guestDocuments.empty') }}</p>
                </div>
            </div>
        </div>
        <ModulesUserLanguageSlideOver :isOpen="state.isLanguageSwitcherOpen"
            @close="state.isLanguageSwitcherOpen = false" />
        <ModulesUserDocumentDocsFileModalPreview :isModalOpen="preview.isOpen"
            v-model:selectedDocument="preview.document" :documents="preview.documents"
            :loadFile="loadPreviewFile" :downloadFile="loadDownloadFile" :canDownload="true"
            @close="preview.isOpen = false" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { guestCitizenDocumentService, GuestDocumentError } from '@/components/api/guest/CitizenDocumentService'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { documentFileName } from '@/composables/documentBlobViewer'
import { saveAs } from 'file-saver'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const language = useI18n()
const { t } = useI18n()
const { formatDateToReadable } = useDatetimeFormatter()
const route = useRoute()
const shareUuid = route.params.share_uuid as string

language.locale.value = userStore.getLanguage

const state = reactive({
    error: '',
    passwordError: '',
    password: '',
    isPageLoading: false,
    isLanguageSwitcherOpen: false,
    session: null as any,
    path: [] as any[],
    items: [] as any[],
})

const preview = reactive({
    isOpen: false,
    document: {} as any,
    documents: [] as any[],
})

// The viewer reads a file's type from file_url; a guest gets the stored file
// name in its place, never the storage address.
function asViewerDocument(item: any) {
    return { ...item, file_url: item.file_name ?? item.name }
}

onMounted(() => {
    animateAssets()
})

onBeforeUnmount(() => {
    guestCitizenDocumentService.setToken(null)
})

function locale(): string {
    return String(language.locale.value || 'dk')
}

async function unlock() {
    state.error = ''
    state.passwordError = ''
    if (!state.password) {
        state.passwordError = `${t('validation.thisFieldIsRequired')}.`
        return
    }

    state.isPageLoading = true
    try {
        const response = await guestCitizenDocumentService.authenticate(shareUuid, state.password, locale())
        state.session = response?.data ?? null
        state.password = ''
        await loadContents(null)
    } catch (error: any) {
        showError(error)
    }
    state.isPageLoading = false
}

async function loadContents(folderUuid: string | null) {
    const response = await guestCitizenDocumentService.getContents(shareUuid, folderUuid, locale())
    const data = response?.data ?? {}
    state.path = data.path ?? []
    state.items = data.items ?? []
}

async function openFolder(folderUuid: string) {
    state.error = ''
    state.isPageLoading = true
    try {
        await loadContents(folderUuid)
    } catch (error: any) {
        showError(error)
    }
    state.isPageLoading = false
}

function viewFile(item: any) {
    const files = state.items.filter((entry: any) => entry.type === 'file').map(asViewerDocument)
    preview.documents = files
    preview.document = files.find((file: any) => file.uuid === item.uuid) ?? asViewerDocument(item)
    preview.isOpen = true
}

async function loadPreviewFile(document: any): Promise<Blob | null> {
    try {
        return await guestCitizenDocumentService.viewFile(shareUuid, document?.uuid, locale())
    } catch (error: any) {
        preview.isOpen = false
        showError(error)
        return null
    }
}

async function loadDownloadFile(document: any): Promise<Blob | null> {
    try {
        return await guestCitizenDocumentService.downloadFile(shareUuid, document?.uuid, locale())
    } catch (error: any) {
        preview.isOpen = false
        showError(error)
        return null
    }
}

async function downloadFile(item: any) {
    state.error = ''
    state.isPageLoading = true
    const blob = await loadDownloadFile(item)
    if (blob) {
        saveAs(blob, documentFileName(asViewerDocument(item)))
    }
    state.isPageLoading = false
}

function lock(message = '') {
    guestCitizenDocumentService.setToken(null)
    state.session = null
    state.path = []
    state.items = []
    state.error = message
}

// A 401 once unlocked means the session ran out or the link was revoked:
// back to the password, with the server's reason.
function showError(error: any) {
    const message = error instanceof GuestDocumentError && error.message
        ? error.message
        : t('guestDocuments.somethingWentWrong')

    if (error instanceof GuestDocumentError && error.status === 401 && state.session) {
        lock(message)
        return
    }

    if (error instanceof GuestDocumentError && error.errors?.password?.[0]) {
        state.passwordError = error.errors.password[0]
        return
    }

    state.error = message
}

function formatSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`
    }
    if (bytes < 1024 * 1024) {
        return `${Math.round(bytes / 1024)} KB`
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// In Danish time, the same as the email: the link runs to the end of a day in
// Copenhagen, and a reader elsewhere seeing "05:59 the next day" on the page
// next to "23:59" in the mail would think the two disagree.
function formatExpiry(value: string): string {
    if (!value) {
        return ''
    }
    const locales: Record<string, string> = { dk: 'da-DK', en: 'en-GB', no: 'nb-NO', sv: 'sv-SE' }

    return new Intl.DateTimeFormat(locales[locale()] ?? 'da-DK', {
        timeZone: 'Europe/Copenhagen',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value))
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

    const animatedAsset01 = document.getElementById('animatedAsset01')
    const animatedAsset02 = document.getElementById('animatedAsset02')
    animatedAsset01 && observer.observe(animatedAsset01)
    animatedAsset02 && observer.observe(animatedAsset02)
}

function identifyFlag() {
    const flags: Record<string, string> = {
        en: '/img/icons/flags/united-kingdom.svg',
        dk: '/img/icons/flags/denmark.svg',
        no: '/img/icons/flags/norway.svg',
        sv: '/img/icons/flags/sweden.svg',
    }
    return flags[userStore.getLanguage] ?? '/img/icons/flags/united-kingdom.svg'
}
</script>
