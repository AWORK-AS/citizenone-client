<script setup lang="ts">
import { computed, onMounted, reactive, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { fMKService } from '@/components/api/user/FMKService'
import { useAlert } from '@/composables/alert'

/**
 * FMK app settings: how the care provider is identified towards Fælles
 * Medicinkort, who FMK can contact about the citizens' medication, and the
 * default FMK role for staff. Admins only (the API refuses others).
 */
const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const { successAlert } = useAlert()

const breadcrumbLinks = [{ name: 'settings.fmk.title', translate: true, href: '/settings/fmk' }]

interface Settings {
    organisation_id_type: 'cvr' | 'sor' | 'ynumber'
    organisation_id: string | null
    organisation_name: string | null
    contact_phone: string | null
    contact_email: string | null
    default_requested_role: string | null
    require_mitid_cvr_match: boolean
    effective: { organisation_name: string, organisation_id: string, requested_role: string }
    company: { name: string, cvr: string | null }
    app_active: boolean
    role_options: string[]
}

const loaded = shallowRef<Settings | null>(null)
const form = reactive({
    organisation_id_type: 'cvr' as Settings['organisation_id_type'],
    organisation_id: '',
    organisation_name: '',
    contact_phone: '',
    contact_email: '',
    default_requested_role: '',
    require_mitid_cvr_match: true,
})
const loading = shallowRef(false)
const saving = shallowRef(false)
const error = shallowRef<string | null>(null)
const fieldErrors = shallowRef<Record<string, string[]>>({})

const typeOptions = computed(() => [
    { value: 'cvr', label: t('settings.fmk.idTypes.cvr') },
    { value: 'sor', label: t('settings.fmk.idTypes.sor') },
    { value: 'ynumber', label: t('settings.fmk.idTypes.ynumber') },
])
const roleOptions = computed(() => (loaded.value?.role_options ?? []).map(r => ({ value: r, label: r })))
const idRequired = computed(() => form.organisation_id_type !== 'cvr')

function fill(s: Settings) {
    loaded.value = s
    form.organisation_id_type = s.organisation_id_type
    form.organisation_id = s.organisation_id ?? ''
    form.organisation_name = s.organisation_name ?? ''
    form.contact_phone = s.contact_phone ?? ''
    form.contact_email = s.contact_email ?? ''
    form.default_requested_role = s.default_requested_role ?? ''
    form.require_mitid_cvr_match = s.require_mitid_cvr_match
}

async function load() {
    loading.value = true
    error.value = null
    try {
        const response = await fMKService.getSettings()
        fill((response?.data ?? response) as Settings)
    } catch (cause: any) {
        error.value = cause?.message ?? String(cause)
    } finally {
        loading.value = false
    }
}

async function save() {
    saving.value = true
    error.value = null
    fieldErrors.value = {}
    try {
        const response = await fMKService.saveSettings({ ...form })
        fill((response?.data ?? response) as Settings)
        successAlert(`${t('alert.success')}!`, t('settings.fmk.saved'))
    } catch (cause: any) {
        fieldErrors.value = cause?.errors ?? {}
        error.value = cause?.message ?? String(cause)
    } finally {
        saving.value = false
    }
}

onMounted(load)
</script>

<template>
    <div>
        <NuxtLayout name="user">
            <Head>
                <Title>{{ $t('settings.fmk.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>{{ $t('settings.fmk.title') }}</template>

            <LoadingSpinner :isActive="loading">
                <div class="mt-8 max-w-3xl space-y-5">
                    <p class="text-sm text-[#64748b]">{{ $t('settings.fmk.subtitle') }}</p>
                    <Alert v-if="error" type="danger" :text="error" />

                    <div v-if="loaded && !loaded.app_active"
                        class="rounded-xl border border-dashed border-[#e2e8f0] bg-[#f8fafc] p-8 text-center">
                        <Icon name="ph:lock-key" class="mx-auto size-6 text-[#0f4c75]" aria-hidden="true" />
                        <p class="mt-3 text-sm text-[#64748b]">{{ $t('settings.fmk.notPurchased') }}</p>
                        <FormButton buttonStyle="primary" class="mx-auto mt-4" @click="navigateTo('/apps')">
                            <Icon name="ph:storefront" class="size-4" aria-hidden="true" />
                            {{ $t('settings.fmk.goToApps') }}
                        </FormButton>
                    </div>

                    <form v-else-if="loaded" class="space-y-5" @submit.prevent="save">
                        <!-- How FMK sees us -->
                        <section class="space-y-4 rounded-xl border border-[#e2e8f0] bg-white p-5">
                            <div>
                                <h2 class="font-semibold text-[#1a2332]">{{ $t('settings.fmk.organisationTitle') }}</h2>
                                <p class="mt-1 text-sm text-[#64748b]">{{ $t('settings.fmk.organisationHint') }}</p>
                            </div>
                            <div class="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <FormLabel for="fmk-id-type" :label="$t('settings.fmk.idType')" />
                                    <FormSelect id="fmk-id-type" v-model="form.organisation_id_type" :options="typeOptions" :canClear="false" :canDeselect="false" />
                                </div>
                                <div>
                                    <FormLabel for="fmk-id" :label="idRequired ? $t('settings.fmk.idRequired') : $t('settings.fmk.idOptional')" />
                                    <FormTextField id="fmk-id" name="fmk-id" v-model="form.organisation_id" :maxLength="50"
                                        :placeholder="form.organisation_id_type === 'cvr' && loaded.company.cvr ? loaded.company.cvr : $t('settings.fmk.idPlaceholder')" />
                                    <FormError v-if="fieldErrors.organisation_id" :error="fieldErrors.organisation_id[0]" />
                                </div>
                                <div class="sm:col-span-2">
                                    <FormLabel for="fmk-name" :label="$t('settings.fmk.name')" />
                                    <FormTextField id="fmk-name" name="fmk-name" v-model="form.organisation_name" :maxLength="200" :placeholder="loaded.company.name" />
                                </div>
                            </div>
                        </section>

                        <!-- GK 12.2: who FMK users can call about the citizens' medication -->
                        <section class="space-y-4 rounded-xl border border-[#e2e8f0] bg-white p-5">
                            <div>
                                <h2 class="font-semibold text-[#1a2332]">{{ $t('settings.fmk.contactTitle') }}</h2>
                                <p class="mt-1 text-sm text-[#64748b]">{{ $t('settings.fmk.contactHint') }}</p>
                            </div>
                            <div class="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <FormLabel for="fmk-phone" :label="$t('settings.fmk.phone')" />
                                    <FormTextField id="fmk-phone" name="tel" v-model="form.contact_phone" :maxLength="30" :placeholder="$t('settings.fmk.phonePlaceholder')" />
                                </div>
                                <div>
                                    <FormLabel for="fmk-email" :label="$t('settings.fmk.email')" />
                                    <FormTextField id="fmk-email" name="email" v-model="form.contact_email" :maxLength="150" :placeholder="$t('settings.fmk.emailPlaceholder')" />
                                    <FormError v-if="fieldErrors.contact_email" :error="fieldErrors.contact_email[0]" />
                                </div>
                            </div>
                        </section>

                        <!-- Staff -->
                        <section class="space-y-4 rounded-xl border border-[#e2e8f0] bg-white p-5">
                            <div>
                                <h2 class="font-semibold text-[#1a2332]">{{ $t('settings.fmk.staffTitle') }}</h2>
                                <p class="mt-1 text-sm text-[#64748b]">{{ $t('settings.fmk.staffHint') }}</p>
                            </div>
                            <div class="sm:w-1/2">
                                <FormLabel for="fmk-role" :label="$t('settings.fmk.defaultRole')" />
                                <FormSelect id="fmk-role" v-model="form.default_requested_role" :options="roleOptions" :placeholder="loaded.effective.requested_role" />
                            </div>
                            <div class="flex items-start gap-3">
                                <FormSwitch :value="form.require_mitid_cvr_match" :label="$t('settings.fmk.cvrMatch')"
                                    @toggleSwitch="form.require_mitid_cvr_match = !form.require_mitid_cvr_match" />
                                <div>
                                    <p class="text-sm text-[#1a2332]">{{ $t('settings.fmk.cvrMatch') }}</p>
                                    <p class="text-xs text-[#64748b]">{{ $t('settings.fmk.cvrMatchHint') }}</p>
                                </div>
                            </div>
                        </section>

                        <!-- What FMK will actually be sent -->
                        <section class="rounded-xl border border-[#e2e8f0] bg-[#f0faf9] p-5 text-sm" aria-live="polite">
                            <h2 class="font-semibold text-[#1a2332]">{{ $t('settings.fmk.effectiveTitle') }}</h2>
                            <p v-if="!loaded.effective.organisation_id" role="alert"
                                class="mt-2 rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-3 py-2 text-[#c2410c]">
                                {{ $t('settings.fmk.idMissing') }}
                            </p>
                            <dl class="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-[auto_1fr]">
                                <dt class="text-[#64748b]">{{ $t('settings.fmk.name') }}</dt>
                                <dd class="text-[#1a2332]">{{ loaded.effective.organisation_name }}</dd>
                                <dt class="text-[#64748b]">{{ $t(`settings.fmk.idTypes.${loaded.organisation_id_type}`) }}</dt>
                                <dd class="text-[#1a2332]" translate="no">{{ loaded.effective.organisation_id || '–' }}</dd>
                                <dt class="text-[#64748b]">{{ $t('settings.fmk.defaultRole') }}</dt>
                                <dd class="text-[#1a2332]">{{ loaded.effective.requested_role }}</dd>
                            </dl>
                        </section>

                        <div class="flex justify-end">
                            <FormButton buttonStyle="primary" :disabled="saving" @click="save">
                                <Icon v-if="saving" name="ph:spinner" class="size-4 motion-safe:animate-spin" aria-hidden="true" />
                                {{ $t('settings.fmk.save') }}
                            </FormButton>
                        </div>
                    </form>

                    <!-- Who may use FMK (one licence per staff member). Kept outside the
                         v-if/v-else-if chain above. -->
                    <ModulesUserFmkLicencePanel v-if="loaded && loaded.app_active" />
                </div>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>
