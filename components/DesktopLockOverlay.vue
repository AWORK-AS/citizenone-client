<template>
    <Transition name="lock-fade">
        <div v-if="isLocked" class="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-md">
            <!-- The window's only handle. On macOS the app runs with
            titleBarStyle "hiddenInset" - there is no system title bar, and the
            only draggable surface is the strip citizenone-desktop asks the
            client to reserve in the layout. This overlay is fixed inset-0, so
            while it is up that strip is underneath it and the window cannot be
            moved at all: locked, and nailed to the desk. So the overlay brings
            its own. -->
            <div class="app-drag-region absolute inset-x-0 top-0 h-9" aria-hidden="true"></div>

            <form @submit.prevent="unlock"
                class="app-no-drag-region w-full max-w-sm bg-white rounded-2xl border border-surface-200 shadow-2xl p-8 mx-4">
                <div class="flex flex-col items-center mb-6">
                    <div class="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-4">
                        {{ initials }}
                    </div>
                    <h2 class="text-lg font-semibold text-gray-900">{{ $t('desktopLock.title') }}</h2>
                    <p class="text-sm text-gray-500 mt-1">{{ userStore.getUser?.firstname }} {{ userStore.getUser?.lastname }}</p>
                    <!-- Said out loud, because a screen asking for a password
                    with nothing else on it reads as "you were logged out" - and
                    then people go looking for what they lost. Nothing was lost:
                    the session is still open behind this. -->
                    <p class="mt-2 text-center text-xs text-gray-400">{{ $t('desktopLock.reason') }}</p>
                </div>
                <template v-if="touchIdAvailable">
                    <button type="button" @click="unlockWithTouchId" :disabled="isPromptingTouchId"
                        class="w-full flex items-center justify-center gap-x-2 rounded-lg border border-surface-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60 mb-4">
                        <Icon name="ph:fingerprint" class="h-5 w-5 text-primary" aria-hidden="true" />
                        {{ isPromptingTouchId ? $t('desktopLock.touchIdPrompting') : $t('desktopLock.unlockWithTouchId') }}
                    </button>
                    <div class="flex items-center gap-x-3 mb-4">
                        <div class="h-px flex-1 bg-surface-200"></div>
                        <span class="text-xs uppercase tracking-wide text-gray-400">{{ $t('desktopLock.or') }}</span>
                        <div class="h-px flex-1 bg-surface-200"></div>
                    </div>
                </template>
                <FormLabel for="lock-password" :label="$t('desktopLock.passwordLabel')" />
                <input id="lock-password" ref="passwordInput" v-model="password" type="password" autofocus
                    class="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm mt-1 mb-2 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
                <p v-if="error" class="text-sm text-red-600 mb-2">{{ error }}</p>
                <button type="submit" :disabled="isVerifying"
                    class="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60 mt-2">
                    {{ isVerifying ? $t('desktopLock.verifying') : $t('desktopLock.unlock') }}
                </button>
            </form>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { authService } from '@/components/api/user/AuthService'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'

const userStore = useUserStore() as any
const { t: $t } = useI18n()
const isLocked = ref(false)
const password = ref('')
const error = ref('')
const isVerifying = ref(false)
const passwordInput = ref<HTMLInputElement | null>(null)
const touchIdAvailable = ref(false)
const isPromptingTouchId = ref(false)

const initials = computed(() => {
    const user = userStore.getUser
    return `${user?.firstname?.[0] ?? ''}${user?.lastname?.[0] ?? ''}`.toUpperCase()
})

let unsubscribe: (() => void) | null = null

onMounted(async () => {
    const bridge = (window as any).citizenOneDesktop
    if (!bridge?.isDesktop) return
    touchIdAvailable.value = !!(await bridge.touchId?.isAvailable())
    unsubscribe = bridge.onLockRequested(() => {
        isLocked.value = true
        password.value = ''
        error.value = ''
        nextTick(() => {
            passwordInput.value?.focus()
            // Prompt immediately, same as the OS's own lock screen - a
            // cancelled/failed prompt just leaves the password field ready.
            if (touchIdAvailable.value) unlockWithTouchId()
        })
    })
})
onUnmounted(() => unsubscribe?.())

async function unlockWithTouchId() {
    if (!touchIdAvailable.value || isPromptingTouchId.value) return
    isPromptingTouchId.value = true
    try {
        const bridge = (window as any).citizenOneDesktop
        const reason = $t('desktopLock.touchIdReason') as unknown as string
        const confirmed = await bridge?.touchId?.prompt(reason)
        if (confirmed) {
            isLocked.value = false
            password.value = ''
            bridge?.notifyUnlocked()
        }
        // A cancelled/failed prompt isn't an error worth showing - the
        // password field is already focused and ready.
    } finally {
        isPromptingTouchId.value = false
    }
}

// Verify-only: reuses the real login endpoint to check the password against
// the signed-in user's own email, but never touches the existing session
// token - a correct password just dismisses the overlay. Not a second login.
async function unlock() {
    error.value = ''
    if (!password.value) return
    isVerifying.value = true
    try {
        const deviceUuid = localStorage.getItem('device_uuid') || ''
        const response: any = await authService.login({
            email: userStore.getUser?.email,
            password: password.value,
            device_uuid: deviceUuid,
        })
        if (response?.data || response?.requires_ip_otp || response?.requires_device_otp) {
            // Any of these confirms the password itself was correct (an OTP
            // step would follow on a real login, but that's not what this is).
            isLocked.value = false
            password.value = ''
            ;(window as any).citizenOneDesktop?.notifyUnlocked()
        } else {
            error.value = $t('desktopLock.wrongPassword') as unknown as string
        }
    } catch (err: any) {
        error.value = err?.message?.message || err?.message || ($t('desktopLock.wrongPassword') as unknown as string)
    }
    isVerifying.value = false
}
</script>
