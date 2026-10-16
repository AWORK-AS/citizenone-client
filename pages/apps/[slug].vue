<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ app?.name || $t('apps.apps') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ app?.name || $t('apps.apps') }}</template>

            <LoadingSpinner :isActive="state.isLoading">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <Alert type="danger" :text="activation.error?.message"
                    v-if="activation.error?.message && activation.error.message.length > 0" />

                <div id="app-page-checkout" class="mx-auto max-w-sm md:max-w-md"></div>

                <div v-if="app && !activation.isCheckoutOpen" class="space-y-8">
                    <!-- Header: what it is, who makes it, and what it costs. -->
                    <div class="flex flex-wrap items-start gap-6">
                        <div v-if="useIconTile"
                            class="brand-tile flex h-20 w-20 flex-none items-center justify-center rounded-2xl text-white shadow-sm">
                            <Icon :name="appIcon" class="h-10 w-10" />
                        </div>
                        <img v-else-if="app.logo" :src="app.logo" :alt="app.name"
                            class="h-20 w-20 flex-none rounded-2xl border border-gray-200 bg-white object-contain p-2" />

                        <div class="min-w-[15rem] flex-1">
                            <div class="flex flex-wrap items-center gap-2">
                                <h1 class="text-2xl font-semibold text-muted-800">{{ app.name }}</h1>
                                <span v-if="badge" :class="['app-badge', `app-badge-${badge.tone}`]">
                                    {{ badge.key === 'apps.badge.discount' ? $t(badge.key, { percent: price.discountPercent }) : $t(badge.key) }}
                                </span>
                            </div>
                            <p class="mt-2 max-w-2xl text-base text-gray-600">{{ app.tagline || app.description }}</p>
                            <p class="mt-2 text-xs text-gray-500">{{ byline }}</p>
                        </div>

                        <div class="w-full space-y-3 rounded-2xl border border-gray-200 bg-white p-5 md:w-64">
                            <p class="text-xl font-semibold text-muted-800">
                                <template v-if="price.isFree">{{ $t('apps.free') }}</template>
                                <template v-else>
                                    <span v-if="price.hasDiscount" class="mr-1 text-base text-muted-400 line-through">
                                        {{ formatAmount(price.amount) }}
                                    </span>
                                    {{ formatAmount(price.discountedAmount) }}
                                    <span v-if="price.unit" class="text-sm lowercase text-gray-500">/{{ price.unit }}</span>
                                </template>
                            </p>
                            <p v-if="!price.isFree" class="text-xs text-gray-500">{{ $t('excludeVat') }}</p>
                            <p v-for="note in price.notes" :key="note" class="text-xs text-muted-500">{{ note }}</p>

                            <FormButton type="button" buttonStyle="action" class="w-full justify-center"
                                v-if="app.url_field" @click="openPartner(app.url_field)">
                                {{ $t('apps.goToPartner') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" class="w-full justify-center"
                                v-else-if="app.user_activated && destination" @click="navigateTo(destination.path)">
                                {{ destination.open ? $t('apps.openApp') : $t('apps.goToSetup') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="app-order-now" class="w-full justify-center"
                                v-else-if="app.user_activated && app.is_quantifiable" @click="requestActivation(app)">
                                {{ $t('apps.buyMoreLicenses') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="app-activated"
                                class="w-full cursor-not-allowed justify-center" v-else-if="app.user_activated" disabled>
                                {{ $t('apps.activated') }}
                            </FormButton>
                            <Tooltip v-else-if="app.plan_eligible === false" class="w-full [&>div]:w-full" wrap
                                :text="$t('apps.requiresPlanTooltip', { plan: app.required_plan })">
                                <FormButton type="button" buttonStyle="action" class="w-full justify-center"
                                    :aria-label="$t('apps.requiresPlanTooltip', { plan: app.required_plan })"
                                    @click="navigateTo('/subscription')">
                                    {{ $t('apps.upgradeToPlan', { plan: app.required_plan }) }}
                                </FormButton>
                            </Tooltip>
                            <FormButton type="button" buttonStyle="app-order-now" class="w-full justify-center" v-else
                                @click="requestActivation(app)">
                                {{ app.is_one_time_fee ? $t('apps.orderNow') : $t('apps.activate') }}
                            </FormButton>

                            <!-- Free trial. The card is saved through the same checkout a purchase
                                 uses; nothing is charged until the trial ends. -->
                            <div v-if="app.trial_enabled && trial" class="space-y-2 border-t border-gray-100 pt-3">
                                <template v-if="trial.available && isAdmin">
                                    <div v-if="offeredFrequencies.length > 1" role="radiogroup" :aria-label="$t('appTrial.frequency')"
                                        class="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1 text-xs font-semibold">
                                        <button v-for="f in offeredFrequencies" :key="f" type="button" role="radio"
                                            :aria-checked="trialForm.frequency === f"
                                            class="rounded-md px-2 py-1.5 transition-colors"
                                            :class="trialForm.frequency === f ? 'bg-white text-primary shadow-sm' : 'text-gray-600'"
                                            @click="trialForm.frequency = f as 'monthly' | 'yearly'">
                                            {{ f === 'monthly' ? $t('appTrial.monthly') : $t('appTrial.yearly') }}
                                        </button>
                                    </div>
                                    <label v-if="app.is_quantifiable" class="flex items-center justify-between gap-2 text-sm text-gray-600">
                                        {{ $t('appTrial.seats') }}
                                        <input v-model.number="trialForm.seats" type="number" min="1" step="1"
                                            class="w-20 rounded-md border border-gray-300 px-2 py-1 text-right text-sm" />
                                    </label>
                                    <p class="text-xs text-gray-500">{{ finePrint }}</p>
                                    <FormButton type="button" buttonStyle="primary" class="w-full justify-center"
                                        :disabled="activation.isBusy" @click="beginTrial()">
                                        {{ $t('appTrial.tryFree', { days: trialDays }) }}
                                    </FormButton>
                                </template>

                                <div v-else-if="trial.status === 'active' || trial.status === 'converting'" role="status"
                                    class="space-y-1 rounded-lg border border-[#2dbab2] bg-white p-3 text-sm">
                                    <p class="font-semibold text-primary">{{ $t('appTrial.activeTitle') }}</p>
                                    <p class="text-gray-600">{{ $t('appTrial.freeUntil', { date: fmtDate(trial.ends_at) }) }}</p>
                                    <p v-if="trial.first_charge_at" class="text-gray-600">
                                        {{ $t('appTrial.firstCharge', { date: fmtDate(trial.first_charge_at), amount: formatPrice(trial.amount_gross) }) }}
                                    </p>
                                    <FormButton v-if="trial.can_cancel" type="button" buttonStyle="cancel"
                                        class="mt-2 w-full justify-center" @click="confirmCancelOpen = true">
                                        {{ $t('appTrial.cancel') }}
                                    </FormButton>
                                </div>

                                <div v-else-if="trial.status === 'cancelled'" role="status"
                                    class="space-y-1 rounded-lg border border-gray-200 bg-white p-3 text-sm">
                                    <p class="text-gray-700">{{ $t('appTrial.cancelled', { date: fmtDate(trial.ends_at) }) }}</p>
                                    <button v-if="trial.can_cancel !== false && isAdmin" type="button"
                                        class="font-semibold text-primary underline underline-offset-2" @click="undoCancel()">
                                        {{ $t('appTrial.undo') }}
                                    </button>
                                </div>

                                <div v-else-if="trial.status === 'charge_failed'" role="alert"
                                    class="space-y-1 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                                    <p class="font-semibold">{{ $t('appTrial.chargeFailedTitle') }}</p>
                                    <p>{{ $t('appTrial.chargeFailedBody') }}</p>
                                    <button v-if="isAdmin" type="button" class="font-semibold underline underline-offset-2"
                                        @click="navigateTo('/settings/subscription')">
                                        {{ $t('appTrial.chargeFailedLink') }}
                                    </button>
                                </div>
                                <p v-if="trialError" class="text-xs text-red-600">{{ trialError }}</p>
                            </div>
                            <DialogConfirmation :isModalOpen="confirmCancelOpen" :title="$t('appTrial.cancelTitle')"
                                :message="$t('appTrial.cancelBody', { date: fmtDate(trial?.ends_at) })"
                                :confirmLabel="$t('appTrial.cancel')"
                                @close="confirmCancelOpen = false" @confirm="cancelTrial()" />

                            <FormButton type="button" buttonStyle="action" class="w-full justify-center"
                                @click="state.isContactOpen = true">
                                {{ $t('apps.contactUs') }}
                            </FormButton>
                        </div>
                    </div>

                    <!-- The facts a buyer in this sector asks for before anything else. -->
                    <dl class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 md:grid-cols-4 lg:grid-cols-6">
                        <div class="bg-white px-4 py-3" v-for="spec in specs" :key="spec.label">
                            <dt class="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{{ spec.label }}</dt>
                            <dd class="mt-1 text-sm font-semibold text-muted-800">{{ spec.value }}</dd>
                        </div>
                    </dl>

                    <!-- Screenshots -->
                    <section v-if="app.screenshots?.length">
                        <h2 class="mb-3 text-lg font-semibold text-muted-800">{{ $t('apps.howItLooks') }}</h2>
                        <div class="flex gap-4 overflow-x-auto pb-2">
                            <figure v-for="shot in app.screenshots" :key="shot.uuid"
                                class="w-64 flex-none overflow-hidden rounded-xl border border-gray-200 bg-white">
                                <img :src="shot.url" :alt="shot.caption || app.name" class="h-40 w-full object-cover" />
                                <figcaption v-if="shot.caption" class="border-t border-gray-100 px-3 py-2 text-xs text-gray-500">
                                    {{ shot.caption }}
                                </figcaption>
                            </figure>
                        </div>
                    </section>

                    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <section class="rounded-2xl border border-gray-200 bg-white p-6 lg:col-span-2">
                            <h2 class="mb-3 text-lg font-semibold text-muted-800">{{ $t('apps.aboutTheApp') }}</h2>
                            <p class="whitespace-pre-line text-sm leading-relaxed text-gray-600">
                                {{ app.long_description || app.description }}
                            </p>
                        </section>

                        <div class="space-y-6">
                            <section class="rounded-2xl border border-gray-200 bg-white p-6" v-if="app.whats_new">
                                <h2 class="mb-3 text-lg font-semibold text-muted-800">
                                    {{ app.version ? $t('apps.whatsNewIn', { version: app.version }) : $t('apps.whatsNew') }}
                                </h2>
                                <p class="whitespace-pre-line text-sm leading-relaxed text-gray-600">{{ app.whats_new }}</p>
                            </section>

                            <section class="rounded-2xl border border-gray-200 bg-white p-6">
                                <h2 class="mb-3 text-lg font-semibold text-muted-800">{{ $t('apps.priceHeading') }}</h2>
                                <dl class="text-sm">
                                    <div class="flex justify-between border-b border-gray-100 py-2" v-if="!app.is_one_time_fee">
                                        <dt class="text-gray-500">{{ $t('apps.monthly') }}</dt>
                                        <dd class="font-semibold text-muted-800">{{ formatAmount(app.monthly_price) }}</dd>
                                    </div>
                                    <div class="flex justify-between border-b border-gray-100 py-2" v-if="!app.is_one_time_fee">
                                        <dt class="text-gray-500">{{ $t('apps.yearly') }}</dt>
                                        <dd class="font-semibold text-muted-800">{{ formatAmount(app.yearly_price) }}</dd>
                                    </div>
                                    <div class="flex justify-between border-b border-gray-100 py-2" v-if="app.is_one_time_fee">
                                        <dt class="text-gray-500">{{ $t('apps.oneTime') }}</dt>
                                        <dd class="font-semibold text-muted-800">{{ formatAmount(app.price) }}</dd>
                                    </div>
                                    <div class="flex justify-between py-2">
                                        <dt class="text-gray-500">{{ $t('apps.setupFee') }}</dt>
                                        <dd class="font-semibold text-muted-800">{{ formatAmount(app.setup_fee || 0) }}</dd>
                                    </div>
                                </dl>
                            </section>
                        </div>
                    </div>
                </div>

                <div v-else-if="!state.isLoading && !app"
                    class="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
                    <p class="text-sm text-gray-600">{{ $t('apps.notFound') }}</p>
                    <FormButton type="button" buttonStyle="primary" class="mt-4" @click="navigateTo('/apps')">
                        {{ $t('apps.myAppsBrowse') }}
                    </FormButton>
                </div>

                <ModulesUserAppModalContactUs :isModalOpen="state.isContactOpen" :selectedApp="app ?? {}"
                    @close="state.isContactOpen = false" />
                <ModulesUserAppModalTACConfirmation :isModalOpen="activation.isTermsOpen" :selectedApp="activation.selectedApp"
                    @close="activation.isTermsOpen = false" @confirmAppActivation="activate" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { appService } from '@/components/api/user/AppService'
import { useI18n } from 'vue-i18n'
import { appBadgeFor, useAppPrice } from '@/composables/appPrice'
import { useAppActivation } from '@/composables/appActivation'
import { formatPrice } from '@/composables/customerSpecialPrice'
import { userService } from '@/components/api/user/UserService'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { t, locale } = useI18n()
const { appPrice, formatAmount } = useAppPrice()
const { activation, requestActivation, activate, startTrial } = useAppActivation({
    checkoutContainerId: 'app-page-checkout',
    onTrialStarted: async () => { await fetchApp(); await refreshUser(); loadCodyAdoption(true) },
})

const state = reactive({
    app: null as any,
    error: {} as Error,
    isLoading: false,
    isContactOpen: false,
})

const app = computed(() => state.app)
const price = computed(() => appPrice(state.app ?? {}))
const badge = computed(() => appBadgeFor(state.app ?? {}))
const appIcon = computed(() => appIconFor(state.app ?? {}).icon)
const useIconTile = computed(() => appIconFor(state.app ?? {}).useTile)
const destination = computed(() => appDestinationFor(state.app ?? {}))

const breadcrumbLinks = computed(() => [
    { name: 'apps.apps', translate: true, href: '/apps' },
    { name: state.app?.name ?? '', translate: false, href: route.fullPath },
])

const byline = computed(() =>
    [
        state.app?.publisher,
        state.app?.category?.name,
        state.app?.install_count > 0 ? t('apps.usedBy', { count: state.app.install_count }) : null,
    ].filter(Boolean).join(' · ')
)

/**
 * The strip under the header. Only facts that are filled in are shown: an empty
 * "Version -" tells the reader nothing and makes the app look abandoned.
 */
const specs = computed(() => {
    const app = state.app
    if (!app) return []

    return [
        app.version ? { label: t('apps.version'), value: app.version } : null,
        app.released_at ? { label: t('apps.updated'), value: formatDate(app.released_at) } : null,
        app.category?.name ? { label: t('apps.category'), value: app.category.name } : null,
        app.publisher ? { label: t('apps.publisher'), value: app.publisher } : null,
        app.data_location ? { label: t('apps.dataLocation'), value: app.data_location } : null,
        { label: t('apps.billing'), value: app.is_one_time_fee ? t('apps.oneTime') : t('apps.subscription') },
    ].filter(Boolean) as { label: string; value: string }[]
})

function formatDate(value: string) {
    const date = new Date(value)
    if (isNaN(date.getTime())) return value

    return date.toLocaleDateString(locale.value === 'en' ? 'en-GB' : 'da-DK', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

async function openPartner(link: string) {
    if (link) {
        await navigateTo(link, { external: true, open: { target: '_blank' } })
    }
}

const userStore = useUserStore() as any
const isAdmin = computed(() => !!userStore.getUser?.roles?.some((role: any) => role.name === 'Admin'))
const trial = computed(() => state.app?.trial ?? null)
const trialDays = computed(() => Number(trial.value?.days ?? state.app?.trial_days ?? 14))
const quotes = computed(() => trial.value?.quotes ?? {})
// A frequency without a quote cannot be priced, so it is not offered.
const offeredFrequencies = computed(() => (['monthly', 'yearly'] as const).filter(f => !!quotes.value?.[f]))
const trialForm = reactive({ frequency: 'monthly' as 'monthly' | 'yearly', seats: 1 })
const confirmCancelOpen = ref(false)
const trialError = ref('')

watch(trial, (value) => {
    const offered = offeredFrequencies.value
    if (value?.frequency && (!offered.length || offered.includes(value.frequency))) trialForm.frequency = value.frequency
    else if (offered.length && !offered.includes(trialForm.frequency)) trialForm.frequency = offered[0]
}, { immediate: true })

function fmtDate(value: any) {
    if (!value) return ''
    const date = new Date(value)
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString(locale.value === 'en' ? 'en-GB' : 'da-DK', { day: 'numeric', month: 'long', year: 'numeric' })
}

// For a trial that has not started, the end date is today plus the trial length.
const finePrint = computed(() => {
    const end = new Date()
    end.setDate(end.getDate() + trialDays.value)
    const quote = quotes.value?.[trialForm.frequency]
    const amount = quote ? formatPrice(quote.amount_gross) : ''
    return t('appTrial.finePrint', {
        date: fmtDate(end),
        amount,
        period: trialForm.frequency === 'monthly' ? t('appTrial.perMonth') : t('appTrial.perYear'),
        charge: fmtDate(end),
    })
})

async function beginTrial() {
    trialError.value = ''
    await startTrial(state.app, {
        frequency: trialForm.frequency,
        ...(state.app?.is_quantifiable ? { seats: Math.max(1, Number(trialForm.seats) || 1) } : {}),
    })
}

async function runTrialAction(action: () => Promise<any>) {
    trialError.value = ''
    try {
        await action()
        await fetchApp()
        await refreshUser()
        loadCodyAdoption(true)
    } catch (error: any) {
        trialError.value = error?.message || t('appTrial.failed')
    }
}

const cancelTrial = () => runTrialAction(() => appService.cancelTrial(state.app.uuid))
const undoCancel = () => runTrialAction(() => appService.undoCancelTrial(state.app.uuid))

const { load: loadCodyAdoption } = useCodyAdoption()

// A trial can switch an app on (Cody sets has_ai_access on the user), so re-read the user.
async function refreshUser() {
    try {
        const response = await userService.getUser()
        if (response?.data) userStore.setUser(response.data)
    } catch (_) { /* the next request picks it up */ }
}

onMounted(() => {
    fetchApp()
})

async function fetchApp() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await appService.getAppBySlug(String(route.params.slug))
        state.app = response?.data ?? null
    } catch (error: any) {
        state.error = error
        state.app = null
    }
    state.isLoading = false
}
</script>
