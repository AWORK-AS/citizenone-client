<template>
    <Head>
        <Title>{{ $t('signup.complete.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
        <Meta name="robots" content="noindex" />
    </Head>

    <LoadingSpinner :isActive="state.isLoading">
        <div class="min-h-screen bg-white">
            <div class="w-full max-w-md mx-auto pt-16 px-5 pb-12">
                <Logo class="w-40" @click="navigateTo('/')" />

                <div v-if="state.done" class="mt-10" data-testid="signup-pending">
                    <div class="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-25 text-primary">
                        <Icon name="ph:hourglass-medium" class="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h1 class="mt-4 font-bold text-2xl md:text-3xl">{{ $t('signup.pending.title') }}</h1>
                    <p class="mt-2 text-sm text-gray-600">{{ $t('signup.pending.body', { email: state.doneEmail }) }}</p>
                    <p v-if="state.identity?.draft_tool" class="mt-3 text-sm text-gray-600" data-testid="signup-draft-saved">
                        {{ $t('signup.pending.draftSaved') }}
                    </p>
                </div>

                <div v-else-if="state.expired" class="mt-10" data-testid="signup-expired">
                    <h1 class="font-bold text-2xl">{{ $t('signup.complete.expiredTitle') }}</h1>
                    <p class="mt-2 text-sm text-gray-600">{{ state.error || $t('signup.complete.expiredBody') }}</p>
                    <FormButton type="button" buttonStyle="primary" class="mt-6 w-full" @click="navigateTo('/signup')">
                        {{ $t('signup.complete.startAgain') }}
                    </FormButton>
                </div>

                <form v-else-if="state.identity" class="mt-10 space-y-4" @submit.prevent="submit">
                    <h1 class="font-bold text-2xl md:text-3xl text-gray-900">{{ $t('signup.complete.heading') }}</h1>
                    <p class="text-sm text-gray-600">
                        {{ $t('signup.complete.signedInAs', { email: state.identity.email }) }}
                    </p>
                    <Alert type="danger" :text="state.error" v-if="state.error" />

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <FormLabel for="firstname" :label="$t('register.form.firstname')" />
                            <FormTextField id="firstname" name="firstname" :placeholder="$t('register.form.firstnamePlaceholder')"
                                v-model="state.form.firstname" />
                            <FormError :error="fieldError('firstname')" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="lastname" :label="$t('register.form.lastname')" />
                            <FormTextField id="lastname" name="lastname" :placeholder="$t('register.form.lastnamePlaceholder')"
                                v-model="state.form.lastname" />
                            <FormError :error="fieldError('lastname')" />
                        </div>
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="company_name" :label="$t('register.form.companyLabel')" />
                        <FormTextField id="company_name" name="company_name" :placeholder="$t('register.form.companyPlaceholder')"
                            v-model="state.form.name" />
                        <FormError :error="fieldError('name')" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="industry" :label="$t('register.form.industry')" />
                        <FormSelect id="industry" :options="state.industries" v-model="state.form.industry_uuid" />
                        <FormError :error="fieldError('industry_uuid')" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="phone" :label="$t('register.form.phoneOptional')" />
                        <FormTextField id="phone" name="phone" type="tel" :placeholder="$t('register.form.phonePlaceholder')"
                            v-model="state.form.phone" />
                        <FormError :error="fieldError('phone')" />
                    </div>
                    <FormButton type="submit" buttonStyle="primary" class="w-full" :disabled="!canSubmit">
                        {{ $t('signup.complete.submit') }}
                    </FormButton>
                </form>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { authService } from '@/components/api/user/AuthService'
import { industryService } from '@/components/api/user/IndustryService'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const language = useI18n()
const userStore = useUserStore()
language.locale.value = userStore.getLanguage

const signupCode = typeof route.query.signup === 'string' ? route.query.signup : ''

const state = reactive({
    isLoading: true,
    expired: false,
    done: false,
    doneEmail: '',
    error: '',
    errors: {} as Record<string, string[]>,
    identity: null as null | { email: string; firstname: string; lastname: string; provider: string; draft_tool: string | null },
    industries: [] as { value: string; label: string }[],
    form: { firstname: '', lastname: '', name: '', industry_uuid: '', phone: '' },
})

const canSubmit = computed(() => !!(state.form.firstname.trim() && state.form.lastname.trim()
    && state.form.name.trim() && state.form.industry_uuid))

function fieldError(field: string) {
    return state.errors?.[field]?.[0]
}

onMounted(async () => {
    if (!signupCode) {
        state.expired = true
        state.isLoading = false
        return
    }
    try {
        const [identity, industries] = await Promise.all([
            authService.getSignup(signupCode),
            industryService.getAllIndustries(),
        ])
        state.identity = identity.data
        state.form.firstname = identity.data?.firstname ?? ''
        state.form.lastname = identity.data?.lastname ?? ''
        state.industries = (industries.data ?? []).map((industry: any) => ({
            value: industry.uuid,
            label: language.locale.value === 'en' ? industry.en_name : industry.dk_name,
        }))
    } catch (error: any) {
        state.expired = true
        state.error = error?.message ?? ''
    }
    state.isLoading = false
})

async function submit() {
    if (!canSubmit.value) return
    state.error = ''
    state.errors = {}
    state.isLoading = true
    try {
        const response = await authService.completeSignup({
            signup: signupCode,
            firstname: state.form.firstname.trim(),
            lastname: state.form.lastname.trim(),
            name: state.form.name.trim(),
            industry_uuid: state.form.industry_uuid,
            ...(state.form.phone.trim() ? { phone: state.form.phone.trim() } : {}),
        })
        state.doneEmail = response?.data?.email ?? state.identity?.email ?? ''
        state.done = true
    } catch (error: any) {
        state.errors = error?.errors ?? {}
        state.error = error?.message ?? ''
    }
    state.isLoading = false
}
</script>
