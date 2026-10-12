<template>
    <!--
        "Del CitizenOne" (task #16). The user's own link to the signup page, and the ways to pass
        it on. Every share is logged, so superadmin can see how many have shared, and a company
        that signs up through the link is credited to the user who shared it.
    -->
    <Modal size="xs" :title="$t('platformShare.title')" titleIcon="ph:share-network" titleIconColor="42AED9"
        :show="props.isModalOpen" @close="emit('close')">
        <template #modal-body>
            <LoadingSpinner :isActive="state.isLoading">
                <div class="space-y-5" data-testid="platform-share-modal">
                    <p class="text-sm text-gray-600">{{ $t('platformShare.intro') }}</p>

                    <Alert type="danger" :text="state.error" v-if="state.error" />

                    <div class="space-y-1">
                        <FormLabel for="platform-share-link" :label="$t('platformShare.yourLink')" />
                        <div class="flex items-stretch gap-2">
                            <input id="platform-share-link" ref="linkInputRef" type="text" readonly :value="state.url"
                                class="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#42AED9]"
                                @focus="linkInputRef?.select()" />
                            <FormButton type="button" buttonStyle="primary" class="shrink-0 !w-auto"
                                :disabled="!state.url" data-testid="platform-share-copy" @click="copyLink">
                                <span class="inline-flex items-center gap-1.5 whitespace-nowrap">
                                    <Icon :name="state.copied ? 'ph:check' : 'ph:copy'" class="size-4" />
                                    {{ state.copied ? $t('platformShare.copied') : $t('platformShare.copy') }}
                                </span>
                            </FormButton>
                        </div>
                    </div>

                    <div>
                        <p class="mb-2 text-sm font-medium text-gray-700">{{ $t('platformShare.shareVia') }}</p>
                        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            <button v-for="option in options" :key="option.method" type="button"
                                :data-testid="`platform-share-${option.method}`" :disabled="!state.url"
                                class="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                                @click="option.action">
                                <Icon :name="option.icon" class="size-5" :style="option.color && `color: ${option.color}`" />
                                {{ option.label }}
                            </button>
                        </div>
                    </div>

                    <p v-if="state.shareCount > 0" class="flex items-center gap-1.5 text-xs text-gray-500"
                        data-testid="platform-share-count">
                        <Icon name="ph:heart-fill" class="size-3.5 text-[#42AED9]" />
                        {{ state.shareCount === 1 ? $t('platformShare.thanksOnce') : $t('platformShare.thanks', { count: state.shareCount }) }}
                    </p>
                </div>
            </LoadingSpinner>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { platformShareService } from '@/components/api/user/PlatformShareService'
import { platformShareTargets, type PlatformShareMethod } from '@/utils/platformShare'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close'])
const { t } = useI18n()

const linkInputRef = ref<HTMLInputElement | null>(null)
const state = reactive({
    url: '',
    shareCount: 0,
    copied: false,
    isLoading: true,
    error: '',
})

// The phone's (or browser's) own share sheet covers every app the user has; offered where it exists.
const canShareNatively = ref(false)
// A text message only makes sense on a phone.
const isPhone = ref(false)

const targets = computed(() => platformShareTargets(state.url, t('platformShare.subject'), t('platformShare.message')))

const options = computed(() => [
    canShareNatively.value && { method: 'native', label: t('platformShare.more'), icon: 'ph:share-fat', action: shareNatively },
    { method: 'email', label: t('platformShare.email'), icon: 'ph:envelope-simple', action: () => openTarget('email', targets.value.email, false) },
    isPhone.value && { method: 'sms', label: t('platformShare.sms'), icon: 'ph:chat-circle-text', action: () => openTarget('sms', targets.value.sms, false) },
    { method: 'linkedin', label: 'LinkedIn', icon: 'ph:linkedin-logo-fill', color: '#0A66C2', action: () => openTarget('linkedin', targets.value.linkedin, true) },
    { method: 'facebook', label: 'Facebook', icon: 'ph:facebook-logo-fill', color: '#1877F2', action: () => openTarget('facebook', targets.value.facebook, true) },
].filter(Boolean) as { method: PlatformShareMethod, label: string, icon: string, color?: string, action: () => void }[])

/**
 * Logged without waiting: the share itself must never hang on our API. A failed log costs a
 * count in superadmin, not the user's share.
 */
function record(method: PlatformShareMethod) {
    platformShareService.recordShare({ method })
        .then((response: any) => {
            const count = response?.data?.share_count
            if (typeof count === 'number') state.shareCount = count
        })
        .catch(() => { /* see above */ })
}

async function copyLink() {
    if (!state.url) return
    try {
        await navigator.clipboard.writeText(state.url)
    } catch {
        linkInputRef.value?.select()
        document.execCommand('copy')
    }
    state.copied = true
    setTimeout(() => { state.copied = false }, 2000)
    record('copy')
}

function openTarget(method: PlatformShareMethod, href: string, newWindow: boolean) {
    if (!state.url) return
    if (newWindow) {
        window.open(href, '_blank', 'noopener,noreferrer,width=600,height=640')
    } else {
        window.location.href = href
    }
    record(method)
}

async function shareNatively() {
    if (!state.url) return
    try {
        await navigator.share({ title: t('platformShare.subject'), text: t('platformShare.message'), url: state.url })
        record('native')
    } catch {
        // Closing the share sheet is not a share.
    }
}

async function load() {
    state.isLoading = true
    state.error = ''
    try {
        const response = await platformShareService.getMyLink()
        state.url = response?.data?.url ?? ''
        state.shareCount = response?.data?.share_count ?? 0
    } catch (error: any) {
        state.error = error?.message || t('platformShare.loadFailed')
    }
    state.isLoading = false
}

onMounted(() => {
    canShareNatively.value = typeof navigator !== 'undefined' && typeof navigator.share === 'function'
    isPhone.value = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches === true
    load()
})
</script>
