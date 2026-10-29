<template>
    <Head>
        <Title>{{ $t('signup.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
        <Meta name="robots" content="noindex" />
    </Head>

    <LoadingSpinner :isActive="state.isLoading">
        <div class="min-h-screen bg-white">
            <div class="w-full max-w-md mx-auto pt-16 px-5 pb-12">
                <Logo class="w-40" @click="navigateTo('/')" />

                <h1 class="mt-10 font-bold text-2xl md:text-3xl text-gray-900">{{ $t('signup.title') }}</h1>
                <p class="mt-2 text-sm text-gray-600">{{ $t('signup.subtitle') }}</p>

                <div class="mt-6" v-if="state.error">
                    <Alert type="danger" :text="state.error" data-testid="signup-error" />
                </div>

                <div v-if="state.step === 'choose'" class="mt-6 space-y-3">
                    <a :href="socialUrl('apple')" data-testid="signup-apple"
                        class="flex min-h-11 w-full items-center justify-center gap-x-3 rounded-lg border border-black bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-900">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M16.37 1.43c0 1.14-.46 2.22-1.2 3.01-.8.86-2.1 1.52-3.17 1.43-.14-1.1.41-2.25 1.12-3 .8-.85 2.18-1.48 3.25-1.44ZM20.5 17.3c-.55 1.27-.81 1.84-1.52 2.96-.99 1.57-2.39 3.52-4.12 3.54-1.54.02-1.94-1-4.03-.99-2.09.01-2.53 1.01-4.07.99-1.73-.02-3.05-1.78-4.04-3.35C-.27 16.1-.56 10.9 1.15 8.27c1.21-1.87 3.12-2.96 4.92-2.96 1.83 0 2.98 1.01 4.49 1.01 1.47 0 2.36-1.01 4.48-1.01 1.6 0 3.3.87 4.51 2.38-3.96 2.17-3.32 7.82.95 9.61Z" />
                        </svg>
                        {{ $t('signup.continueWithApple') }}
                    </a>
                    <a :href="socialUrl('google')" data-testid="signup-google"
                        class="flex min-h-11 w-full items-center justify-center gap-x-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50">
                        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65Z" />
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19Z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
                        </svg>
                        {{ $t('signup.continueWithGoogle') }}
                    </a>
                    <FormButton type="button" buttonStyle="secondary" class="w-full !min-h-11" data-testid="signup-email"
                        @click="state.step = 'email'">
                        <template #icon-left>
                            <Icon name="ph:envelope-simple" class="size-[18px]" aria-hidden="true" />
                        </template>
                        {{ $t('signup.continueWithEmail') }}
                    </FormButton>
                </div>

                <form v-else-if="state.step === 'email'" class="mt-6 space-y-4" @submit.prevent="sendCode">
                    <div class="space-y-1">
                        <FormLabel for="signup-email-field" :label="$t('signup.emailLabel')" />
                        <FormTextField id="signup-email-field" name="email" type="email"
                            :placeholder="$t('signup.emailPlaceholder')" v-model="state.email" />
                    </div>
                    <FormButton type="submit" buttonStyle="primary" class="w-full" :disabled="!state.email">
                        {{ $t('signup.sendCode') }}
                    </FormButton>
                    <button type="button" class="text-sm text-gray-600 hover:text-gray-900" @click="back">
                        {{ $t('signup.back') }}
                    </button>
                </form>

                <form v-else class="mt-6 space-y-4" @submit.prevent="verifyCode">
                    <p class="text-sm text-gray-600">{{ $t('signup.codeSent', { email: state.email }) }}</p>
                    <div class="space-y-1">
                        <FormLabel for="signup-otp" :label="$t('signup.codeLabel')" />
                        <FormTextField id="signup-otp" name="otp" :maxLength="6" placeholder="123456"
                            v-model="state.otp" />
                    </div>
                    <FormButton type="submit" buttonStyle="primary" class="w-full" :disabled="state.otp.length !== 6">
                        {{ $t('signup.verify') }}
                    </FormButton>
                    <div class="flex justify-between text-sm">
                        <button type="button" class="text-gray-600 hover:text-gray-900" @click="state.step = 'email'; state.otp = ''">
                            {{ $t('signup.changeEmail') }}
                        </button>
                        <button type="button" class="font-medium text-primary hover:underline" @click="sendCode">
                            {{ $t('signup.resendCode') }}
                        </button>
                    </div>
                </form>

                <p class="mt-8 text-center text-sm text-gray-500">
                    {{ $t('signup.haveAccount') }}
                    <NuxtLink to="/" class="font-semibold text-primary hover:text-primary-800">
                        {{ $t('signup.signIn') }}
                    </NuxtLink>
                </p>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { authService } from '@/components/api/user/AuthService'
import { signupPassthrough, socialRedirectUrl } from '@/composables/signupQuery'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const passthrough = signupPassthrough(route.query)

const state = reactive({
    step: (route.query.method === 'email' ? 'email' : 'choose') as 'choose' | 'email' | 'code',
    email: '',
    otp: '',
    error: '',
    isLoading: false,
})

// A refused provider login comes back here as ?error=<translated message>.
if (typeof route.query.error === 'string') state.error = route.query.error

function socialUrl(provider: 'google' | 'apple') {
    return socialRedirectUrl(String(runtimeConfig.public.apiBaseURL ?? ''), provider, passthrough)
}

function back() {
    state.step = 'choose'
    state.error = ''
}

async function sendCode() {
    state.error = ''
    state.isLoading = true
    try {
        await authService.signupEmail({ email: state.email.trim(), ...passthrough })
        state.otp = ''
        state.step = 'code'
    } catch (error: any) {
        state.error = error?.errors?.email?.[0] ?? error?.message ?? ''
    }
    state.isLoading = false
}

async function verifyCode() {
    state.error = ''
    state.isLoading = true
    try {
        const response = await authService.signupEmailVerify(state.email.trim(), state.otp)
        const ssoCode = response?.data?.sso_code
        const signup = response?.data?.signup
        if (ssoCode) {
            // Existing user: the same one-time-code exchange the SSO login runs on the front page.
            await navigateTo({ path: '/', query: { sso_code: ssoCode } }, { replace: true })
            return
        }
        if (signup) {
            await navigateTo({ path: '/signup/complete', query: { signup } })
            return
        }
    } catch (error: any) {
        state.error = error?.message ?? ''
    }
    state.isLoading = false
}
</script>
