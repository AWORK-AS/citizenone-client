<script setup lang="ts">
import { computed, onMounted, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFmkMedicineCard } from '@/composables/useFmkMedicineCard'
import { useFmkLogin } from '@/composables/useFmkLogin'
import { usePermissions } from '@/composables/usePermissions'
import { useAlert } from '@/composables/alert'
import { fMKService } from '@/components/api/user/FMKService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

/**
 * FMK (Fælles Medicinkort) for one citizen. Opening this page is the staff
 * member asking for the current card (GK 1.2), so it is fetched here and on
 * "Hent igen", never in the background. It is clearly marked as FMK (GK 1.1)
 * and shows FMK next to CitizenOne (GK 3.1).
 *
 * FMK is looked up on the staff member's own MitID Erhverv login (via SEB).
 * Coming back from SEB the URL carries ?fmk_login=ok|choose|error.
 */
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { t } = useI18n()
const { formatDateTimeToReadable } = useDatetimeFormatter()

const citizenUuid = route.params.uuid as string
const { card, pending, error, loginRequired, fetchCard } = useFmkMedicineCard(citizenUuid)
const fmkLogin = useFmkLogin()
const router = useRouter()
const { isAtLeast, can } = usePermissions()
const { successAlert, errorAlert } = useAlert()

// Same rule as "Ny medicin" on the medicine page.
const canEdit = computed(() => isAtLeast('Admin') || can('create_citizen_medicine'))
const busyKey = shallowRef<string | null>(null)

/** Takes a drug medication over from FMK, as a draft to finish with a dosage plan. */
async function takeOver(identifier: string) {
    busyKey.value = `fmk-${identifier}`
    try {
        await fMKService.takeOver(citizenUuid, identifier)
        successAlert(`${t('alert.success')}!`, t('fmk.compare.takenOver'))
        await fetchCard()
    } catch (cause: any) {
        errorAlert(`${t('alert.somethingWentWrong')}!`, cause?.message ?? '')
    } finally {
        busyKey.value = null
    }
}

async function acknowledge(identifier: string) {
    busyKey.value = `fmk-${identifier}`
    try {
        await fMKService.acknowledge(citizenUuid, identifier)
        successAlert(`${t('alert.success')}!`, t('fmk.compare.acknowledged'))
        await fetchCard()
    } catch (cause: any) {
        errorAlert(`${t('alert.somethingWentWrong')}!`, cause?.message ?? '')
    } finally {
        busyKey.value = null
    }
}

const loginNotice = shallowRef<{ tone: 'ok' | 'error', text: string } | null>(null)
const choices = computed(() => fmkLogin.session.value?.choices ?? null)
const loggedIn = computed(() => fmkLogin.session.value?.logged_in === true)
const sessionUntil = computed(() => {
    const at = fmkLogin.session.value?.expires_at
    return at ? new Date(at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : ''
})

function login() {
    fmkLogin.login(`/citizens/${citizenUuid}/fmk`)
}

async function chooseRole(key: string) {
    await fmkLogin.chooseRole(key)
    if (loggedIn.value) await fetchCard()
}

async function logout() {
    await fmkLogin.logout()
    card.value = null
    await fetchCard()
}

/** Reads and removes ?fmk_login / ?fmk_error after coming back from SEB. */
function readLoginReturn() {
    const status = route.query.fmk_login as string | undefined
    if (!status) return
    const reason = (route.query.fmk_error as string | undefined) ?? 'login'
    if (status === 'ok') loginNotice.value = { tone: 'ok', text: t('fmk.login.ok') }
    if (status === 'error') {
        const known = ['expired', 'login', 'organisation', 'sts'].includes(reason) ? reason : 'login'
        loginNotice.value = { tone: 'error', text: t(`fmk.login.error.${known}`) }
    }
    router.replace({ query: {} })
}

const breadcrumbLinks = [
    { name: 'fmk.title', translate: true, href: `/citizens/${citizenUuid}/fmk` },
]

const detailsFor = shallowRef<string | null>(null)
const detailsRaw = computed(() => {
    if (!detailsFor.value || !card.value) return null
    const list = card.value.raw?.DrugMedication ?? []
    return list.find((m: any) => String(m?.Identifier) === detailsFor.value) ?? null
})
const detailsTitle = computed(() => {
    const med = card.value?.card.drug_medications.find(m => m.identifier === detailsFor.value)
    return [med?.drug_name, med?.strength].filter(Boolean).join(' ') || t('fmk.title')
})

const fetchedAt = computed(() => (card.value ? formatDateTimeToReadable(card.value.fetched_at) : ''))
const environmentLabel = computed(() => {
    const env = card.value?.environment
    if (env === 'sample') return t('fmk.header.sampleData')
    if (env && env !== 'production') return t('fmk.header.testEnvironment', { environment: env })
    return null
})


async function load() {
    await fmkLogin.refresh()
    // With a role still to choose, the card waits until it is chosen.
    if (!choices.value) await fetchCard()
}

onMounted(() => {
    readLoginReturn()
    load()
})

// Back from SEB while the page is already open (same route, new query).
watch(() => route.query.fmk_login, (status) => {
    if (!status) return
    readLoginReturn()
    load()
})
</script>

<template>
    <div>
        <NuxtLayout name="user">
            <Head>
                <Title>{{ $t('fmk.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <ModulesUserCitizenBreadcrumbTrail />
                    </template>
                </Breadcrumb>
            </template>

            <div class="space-y-5">
                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <!-- GK 1.1: it must be obvious that this is FMK, not CitizenOne's own card. -->
                <header class="rounded-2xl border border-[#e2e8f0] bg-white px-4 py-4 sm:px-6">
                    <div class="flex flex-wrap items-start justify-between gap-4">
                        <div class="min-w-0">
                            <div class="flex flex-wrap items-center gap-2">
                                <span class="rounded-full bg-[#0f4c75] px-2.5 py-0.5 text-[11px] font-semibold text-white" translate="no">FMK</span>
                                <h1 class="text-xl font-light text-[#1a2332]">{{ $t('fmk.title') }}</h1>
                                <span v-if="environmentLabel"
                                    class="rounded-full border border-[#fed7aa] bg-[#fff7ed] px-2 py-0.5 text-[11px] font-semibold text-[#c2410c]">
                                    {{ environmentLabel }}
                                </span>
                            </div>
                            <p class="mt-1 max-w-2xl text-sm text-[#64748b]">{{ $t('fmk.header.intro') }}</p>
                            <p v-if="loggedIn" class="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-[#1a2332]">
                                <Icon name="ph:identification-badge" class="size-4 text-[#2dbab2]" aria-hidden="true" />
                                <span>{{ $t('fmk.login.loggedInAs', { name: fmkLogin.session.value?.name || '' }) }}<template v-if="fmkLogin.session.value?.role_label"> · {{ fmkLogin.session.value.role_label }}</template> · {{ $t('fmk.login.until', { time: sessionUntil }) }}</span>
                                <button type="button" class="font-semibold text-[#0f4c75] hover:text-[#1b6d8a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]" @click="logout">{{ $t('fmk.login.logout') }}</button>
                            </p>
                            <p v-else-if="card && card.environment !== 'sample'" class="mt-2 text-xs text-[#c2410c]">{{ $t('fmk.login.systemCard') }}</p>
                            <p v-if="card" class="mt-2 text-xs text-[#64748b]" aria-live="polite">
                                {{ $t('fmk.header.fetchedAt', { time: fetchedAt }) }}
                                <span v-if="card.card.version"> · {{ $t('fmk.header.version', { version: card.card.version }) }}</span>
                            </p>
                        </div>
                        <div class="flex shrink-0 items-center gap-2">
                            <FormButton buttonStyle="primary" class="rounded-md" :disabled="pending" @click="fetchCard">
                                <Icon :name="pending ? 'ph:spinner' : 'ph:arrows-clockwise'" :class="['size-4', pending && 'motion-safe:animate-spin']" aria-hidden="true" />
                                {{ pending ? $t('fmk.header.fetching') : $t('fmk.header.refresh') }}
                            </FormButton>
                            <a href="https://fmk-online.dk/fmk" target="_blank" rel="noopener"
                                class="inline-flex items-center gap-x-2 rounded-md border-1.5 border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]">
                                <Icon name="ph:arrow-square-out" class="size-4" aria-hidden="true" />
                                {{ $t('citizens.medicineJournals.openFmkOnline') }}
                            </a>
                        </div>
                    </div>
                </header>

                <div v-if="loginNotice" role="status" class="rounded-xl border px-4 py-3 text-sm"
                    :class="loginNotice.tone === 'ok' ? 'border-[#2dbab2]/40 bg-[#f0faf9] text-[#1a2332]' : 'border-[#fecaca] bg-[#fef2f2] text-[#991b1b]'">
                    {{ loginNotice.text }}
                </div>
                <p v-if="fmkLogin.error.value" role="alert" class="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#991b1b]">{{ fmkLogin.error.value }}</p>

                <ModulesUserFmkRolePicker v-if="choices && choices.length" :choices="choices" :pending="fmkLogin.pending.value" @choose="chooseRole" />
                <ModulesUserFmkLoginPanel v-else-if="loginRequired" :pending="fmkLogin.pending.value" @login="login" />

                <!-- GK 3.2 / 18.1: FMK could not be reached; say so, keep the last card visibly stale. -->
                <div v-if="error" role="alert"
                    class="flex items-start gap-3 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#991b1b]">
                    <Icon name="ph:plugs" class="mt-0.5 size-5 shrink-0 text-[#dc2626]" aria-hidden="true" />
                    <div>
                        <p class="font-semibold">{{ $t('fmk.error.title') }}</p>
                        <p class="mt-0.5">{{ error }}</p>
                        <p v-if="card" class="mt-1">{{ $t('fmk.error.showingOlder', { time: fetchedAt }) }}</p>
                    </div>
                </div>

                <div v-if="pending && !card" class="rounded-2xl border border-[#e2e8f0] bg-white px-6 py-16 text-center" role="status">
                    <Icon name="ph:spinner" class="mx-auto size-6 motion-safe:animate-spin text-[#2dbab2]" aria-hidden="true" />
                    <p class="mt-3 text-sm text-[#64748b]">{{ $t('fmk.header.fetching') }}</p>
                </div>

                <template v-if="card">
                    <ModulesUserFmkCardStatus :card="card.card" />
                    <ModulesUserFmkComparisonTable :rows="card.rows" :canEdit="canEdit" :busyKey="busyKey" @details="detailsFor = $event"
                        @takeOver="takeOver" @acknowledge="acknowledge" @openLocal="navigateTo(`/citizens/${citizenUuid}/medicine-journals`)" />
                </template>
            </div>

            <!-- GK 3.5: every field FMK returned for the drug medication. -->
            <Modal :show="detailsFor !== null" :title="detailsTitle" size="xl" @close="detailsFor = null">
                <template #modal-body>
                    <p class="mb-4 text-sm text-[#64748b]">{{ $t('fmk.details.intro') }}</p>
                    <div class="max-h-[65vh] overflow-y-auto pr-2">
                        <ModulesUserFmkFieldTree v-if="detailsRaw" :value="detailsRaw" />
                    </div>
                </template>
            </Modal>
        </NuxtLayout>
    </div>
</template>
