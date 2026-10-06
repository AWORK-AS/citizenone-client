<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('whistleblower.settings.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('whistleblower.settings.title') }}</template>

            <div class="mt-8 max-w-3xl space-y-6">
                <p class="text-sm text-slate-600">{{ $t('whistleblower.settings.intro') }}</p>

                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

                <LoadingSpinner :isActive="state.isLoading">
                    <div class="space-y-6">
                        <div class="card card-body space-y-5">
                            <div class="flex items-start gap-x-3">
                                <FormSwitch :value="state.enabled" @toggleSwitch="state.enabled = !state.enabled" />
                                <div>
                                    <p class="text-sm font-medium text-slate-900">{{ $t('whistleblower.settings.enable') }}</p>
                                    <p class="text-xs text-slate-500">{{ $t('whistleblower.settings.enableHelp') }}</p>
                                </div>
                            </div>

                            <div>
                                <FormLabel :label="$t('whistleblower.settings.handlers')" />
                                <FormSelectMultiple :options="state.candidateOptions" v-model="state.handlerUuids"
                                    :loading="state.isLoading" />
                                <p class="mt-1 text-xs text-slate-500">{{ $t('whistleblower.settings.handlersHelp') }}</p>
                                <FormError :error="state.error?.errors?.handler_uuids?.[0]" />
                            </div>

                            <div class="flex justify-end">
                                <FormButton buttonStyle="primary" :disabled="state.isSaving" @click="save">
                                    {{ $t('save') }}
                                </FormButton>
                            </div>
                        </div>

                        <!-- The link, once it exists and is switched on -->
                        <div v-if="state.saved.enabled && state.saved.token" class="card card-body space-y-3">
                            <div>
                                <p class="text-sm font-medium text-slate-900">{{ $t('whistleblower.settings.link') }}</p>
                                <p class="text-xs text-slate-500">{{ $t('whistleblower.settings.linkHelp') }}</p>
                            </div>
                            <div class="flex gap-x-2">
                                <input :value="link" readonly :aria-label="$t('whistleblower.settings.link')"
                                    class="min-w-0 flex-1 rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-slate-700" />
                                <FormButton buttonStyle="action" @click="copyLink">
                                    <Icon :name="state.copied ? 'ph:check' : 'ph:copy'" class="h-4 w-4" aria-hidden="true" />
                                    {{ state.copied ? $t('whistleblower.settings.copied') : $t('whistleblower.settings.copy') }}
                                </FormButton>
                            </div>
                            <div class="flex items-start gap-x-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                <Icon name="ph:warning" class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                                <p>
                                    {{ $t('whistleblower.settings.regenerateHelp') }}
                                    <button type="button" class="font-semibold underline hover:no-underline"
                                        @click="state.isRegenerateOpen = true">
                                        {{ $t('whistleblower.settings.regenerate') }}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>

            <DialogConfirmation :isModalOpen="state.isRegenerateOpen"
                :message="$t('whistleblower.settings.regenerateConfirmation') + '?'"
                @close="state.isRegenerateOpen = false" @confirm="regenerate" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { whistleblowerService } from '@/components/api/user/WhistleblowerService'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

definePageMeta({ middleware: 'require-admin' })

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()

const breadcrumbLinks = [
    { name: 'whistleblower.settings.title', translate: true, href: '/settings/whistleblower' },
]

const state = reactive({
    isLoading: true,
    isSaving: false,
    isRegenerateOpen: false,
    copied: false,
    error: {} as any,
    enabled: false,
    handlerUuids: [] as string[],
    // Who can be chosen: the company's Admins, as the API lists them.
    candidateOptions: [] as any[],
    // What the server has, as opposed to the unsaved form above.
    saved: { enabled: false, token: null as string | null },
})

const link = computed(() => `${runtimeConfig.public.appBaseURL}/whistleblower/${state.saved.token}`)

onMounted(fetchSettings)

function apply(settings: any) {
    state.enabled = !!settings?.enabled
    state.handlerUuids = (settings?.handlers ?? []).map((handler: any) => handler.uuid)
    state.candidateOptions = (settings?.candidates ?? []).map((person: any) => ({ value: person.uuid, label: person.name }))
    state.saved = { enabled: !!settings?.enabled, token: settings?.token ?? null }

    // Keep the sidebar in step without a reload: the "Report anonymously"
    // entry, and the inbox entry if this admin just added or removed themselves.
    const user = userStore.getUser
    if (user?.company) {
        userStore.setUser({
            ...user,
            is_whistleblower_handler: state.handlerUuids.includes(user.uuid),
            company: { ...user.company, whistleblower_enabled: state.saved.enabled, whistleblower_token: state.saved.enabled ? state.saved.token : null },
        })
    }
}

async function fetchSettings() {
    state.isLoading = true
    try {
        const response = await whistleblowerService.getSettings()
        apply(response?.data)
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}


async function save() {
    state.error = {}
    state.isSaving = true
    try {
        const response = await whistleblowerService.saveSettings({
            enabled: state.enabled,
            handler_uuids: state.handlerUuids,
        })
        if (response?.data) {
            apply(response.data)
            successAlert(`${t('alert.success')}!`, `${t('whistleblower.settings.saved')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

async function regenerate() {
    state.isRegenerateOpen = false
    state.error = {}
    try {
        const response = await whistleblowerService.regenerateLink()
        if (response?.data) {
            apply(response.data)
            successAlert(`${t('alert.success')}!`, `${t('whistleblower.settings.regenerated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
}

async function copyLink() {
    try {
        await navigator.clipboard.writeText(link.value)
        state.copied = true
        setTimeout(() => { state.copied = false }, 2000)
    } catch {
        // Clipboard blocked: the link is selectable in the field.
    }
}
</script>
