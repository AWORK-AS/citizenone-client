<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFmkMedicineCard } from '@/composables/useFmkMedicineCard'
import { useFmkLogin } from '@/composables/useFmkLogin'
import { usePermissions } from '@/composables/usePermissions'
import { useAlert } from '@/composables/alert'
import { fMKService } from '@/components/api/user/FMKService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useFmkModifier } from '@/composables/useFmkModifier'
import { fmkText } from '@/utils/fmk'

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
const { card, pending, error, loginRequired, includeWithdrawn, fetchCard, toggleWithdrawn } = useFmkMedicineCard(citizenUuid)
const fmkLogin = useFmkLogin()
const router = useRouter()
const { isAtLeast, can } = usePermissions()
const { successAlert, errorAlert } = useAlert()

// Same rule as "Ny medicin" on the medicine page.
const canEdit = computed(() => isAtLeast('Admin') || can('create_citizen_medicine'))
const busyKey = shallowRef<string | null>(null)
// The row that just changed glows briefly, so the eye finds it after the refetch.
const flashKey = shallowRef<string | null>(null)
let flashTimer: ReturnType<typeof setTimeout> | undefined
function flash(key: string) {
    clearTimeout(flashTimer)
    flashKey.value = key
    flashTimer = setTimeout(() => { flashKey.value = null }, 1800)
}
onBeforeUnmount(() => clearTimeout(flashTimer))
const showIntro = shallowRef(false)

// GK 4.3: privacy-marked medication, only with a stated reason.
const consentOpen = shallowRef(false)
// GK 3.1.6 / 6.1: loose prescriptions (not tied to a drug medication).
const looseOpen = shallowRef(false)
// GK 7.3: the dose dispensing card, fetched when opened.
const doseDispensingOpen = shallowRef(false)
async function showPrivate(reason: 'consent' | 'emergency') {
    await fetchCard(reason)
    if (!error.value) consentOpen.value = false
}

/** "Ret i CitizenOne" / "Udfyld doseringsplan": straight to that medicine's edit dialog. */
function openLocal(medicineUuid: string | null) {
    navigateTo({ path: `/citizens/${citizenUuid}/medicine-journals`, query: medicineUuid ? { edit: medicineUuid } : {} })
}

/** Takes a drug medication over from FMK, as a draft to finish with a dosage plan. */
async function takeOver(identifier: string) {
    busyKey.value = `fmk-${identifier}`
    try {
        await fMKService.takeOver(citizenUuid, identifier)
        await fetchCard(card.value?.negative_consent ?? undefined)
        flash(`fmk-${identifier}`)
        successAlert(`${t('alert.success')}!`, t('fmk.compare.takenOver'))
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
        await fetchCard(card.value?.negative_consent ?? undefined)
        flash(`fmk-${identifier}`)
        successAlert(`${t('alert.success')}!`, t('fmk.compare.acknowledged'))
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
const detailsMedication = computed(() => card.value?.card.drug_medications.find(m => m.identifier === detailsFor.value) ?? null)
const detailsTitle = computed(() => {
    const med = card.value?.card.drug_medications.find(m => m.identifier === detailsFor.value)
    return [med?.drug_name, med?.strength].filter(Boolean).join(' ') || t('fmk.title')
})

const { by: modifiedBy } = useFmkModifier()

/** GK 3.5.1-3.5.3: the citizen as FMK knows them, so staff see it is the right card. */
const fmkPatient = computed(() => {
    const person = (card.value?.card.patient as any)?.Person
    if (!person) return null
    const name = [fmkText(person.Name?.GivenName), fmkText(person.Name?.Surname)].filter(Boolean).join(' ')
    const cpr = fmkText(person.PersonIdentifier)
    return { name, cpr: cpr && cpr.length === 10 ? `${cpr.slice(0, 6)}-${cpr.slice(6)}` : cpr }
})
/** GK 3.5.5-3.5.10: who last changed the card. */
const lastChanged = computed(() => (card.value?.card.modified ? modifiedBy(card.value.card.modified) : null))

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
                        <div class="min-w-0 flex-1 basis-80">
                            <div class="flex flex-wrap items-center gap-2">
                                <span class="rounded-full bg-[#0f4c75] px-2.5 py-0.5 text-[11px] font-semibold text-white" translate="no">FMK</span>
                                <h1 class="text-xl font-light text-[#1a2332]">{{ $t('fmk.title') }}</h1>
                                <button type="button" :aria-expanded="showIntro" aria-controls="fmk-intro" :aria-label="$t('fmk.header.about')" :title="$t('fmk.header.about')"
                                    class="rounded-full text-[#64748b] hover:text-[#0f4c75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]"
                                    @click="showIntro = !showIntro">
                                    <Icon :name="showIntro ? 'ph:info-fill' : 'ph:info'" class="size-5" aria-hidden="true" />
                                </button>
                                <span v-if="environmentLabel"
                                    class="rounded-full border border-[#fed7aa] bg-[#fff7ed] px-2 py-0.5 text-[11px] font-semibold text-[#c2410c]">
                                    {{ environmentLabel }}
                                </span>
                            </div>
                            <p v-if="card" class="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-[#64748b]" aria-live="polite">
                                <Icon name="ph:clock-counter-clockwise" class="size-3.5" aria-hidden="true" />
                                {{ $t('fmk.header.fetchedAt', { time: fetchedAt }) }}
                                <span v-if="card.card.version">· {{ $t('fmk.header.version', { version: card.card.version }) }}</span>
                            </p>
                            <p v-if="card && fmkPatient" class="mt-1 flex items-center gap-x-1.5 text-xs text-[#64748b]">
                                <Icon name="ph:user" class="size-3.5 shrink-0" aria-hidden="true" />
                                <span>{{ $t('fmk.header.patient', { name: fmkPatient.name }) }}<template v-if="fmkPatient.cpr"> · <span translate="no">{{ fmkPatient.cpr }}</span></template></span>
                            </p>
                            <p v-if="card && lastChanged" class="mt-1 flex items-start gap-x-1.5 text-xs text-[#64748b]">
                                <Icon name="ph:pencil-simple-line" class="mt-px size-3.5 shrink-0" aria-hidden="true" />
                                <span>{{ $t('fmk.header.lastChanged', { by: lastChanged }) }}</span>
                            </p>
                            <p v-if="showIntro" id="fmk-intro" class="mt-2 max-w-2xl rounded-lg bg-[#f8fafc] px-3 py-2 text-sm text-[#64748b]">{{ $t('fmk.header.intro') }}</p>
                            <p v-if="loggedIn" class="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-[#1a2332]">
                                <Icon name="ph:identification-badge" class="size-4 text-[#2dbab2]" aria-hidden="true" />
                                <span>{{ $t('fmk.login.loggedInAs', { name: fmkLogin.session.value?.name || '' }) }}<template v-if="fmkLogin.session.value?.role_label"> · {{ fmkLogin.session.value.role_label }}</template> · {{ $t('fmk.login.until', { time: sessionUntil }) }}</span>
                                <button type="button" class="font-semibold text-[#0f4c75] hover:text-[#1b6d8a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]" @click="logout">{{ $t('fmk.login.logout') }}</button>
                            </p>
                            <p v-else-if="card && card.environment !== 'sample'" class="mt-2 text-xs text-[#c2410c]">{{ $t('fmk.login.systemCard') }}</p>
                        </div>
                        <div class="flex shrink-0 items-center gap-2">
                            <FormButton buttonStyle="primary" class="rounded-md" :disabled="pending" @click="fetchCard()">
                                <Icon :name="pending ? 'ph:spinner' : 'ph:arrows-clockwise'" :class="['size-4', pending && 'motion-safe:animate-spin']" aria-hidden="true" />
                                {{ pending ? $t('fmk.header.fetching') : $t('fmk.header.refresh') }}
                            </FormButton>
                            <!-- Changes to FMK itself are made in FMK-online, so it stays a quiet link. -->
                            <a href="https://fmk-online.dk/fmk" target="_blank" rel="noopener" :title="$t('fmk.header.fmkOnlineHint')"
                                class="inline-flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-semibold text-[#0f4c75] hover:text-[#1b6d8a] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]">
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

                <!-- Loading: the shape of the table, so nothing jumps when it arrives. -->
                <div v-if="pending && !card" class="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white" role="status">
                    <span class="sr-only">{{ $t('fmk.header.fetching') }}</span>
                    <div class="flex items-center gap-3 border-b border-[#e2e8f0] px-6 py-4 motion-safe:animate-pulse" aria-hidden="true">
                        <span class="size-11 rounded-full bg-[#e2e8f0]" />
                        <div class="space-y-2">
                            <span class="block h-4 w-48 rounded bg-[#e2e8f0]" />
                            <span class="block h-3 w-72 rounded bg-[#f1f5f9]" />
                        </div>
                    </div>
                    <div v-for="n in 3" :key="n" class="grid grid-cols-[44%_12%_44%] gap-0 border-b border-[#f1f5f9] px-6 py-5 motion-safe:animate-pulse" aria-hidden="true">
                        <div class="space-y-2 pr-6">
                            <span class="block h-4 w-3/5 rounded bg-[#e2e8f0]" />
                            <span class="block h-3 w-2/5 rounded bg-[#f1f5f9]" />
                            <span class="block h-3 w-1/3 rounded bg-[#f1f5f9]" />
                        </div>
                        <span class="mx-auto block h-10 w-14 rounded-xl bg-[#f1f5f9]" />
                        <div class="space-y-2 pl-6">
                            <span class="block h-4 w-1/2 rounded bg-[#e2e8f0]" />
                            <span class="block h-3 w-1/3 rounded bg-[#f1f5f9]" />
                        </div>
                    </div>
                    <p class="flex items-center justify-center gap-2 px-6 py-3 text-xs text-[#64748b]" aria-hidden="true">
                        <Icon name="ph:spinner" class="size-4 motion-safe:animate-spin text-[#2dbab2]" />
                        {{ $t('fmk.header.fetching') }}
                    </p>
                </div>

                <template v-if="card">
                    <p v-if="card.negative_consent" role="status"
                        class="flex items-start gap-3 rounded-xl border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-sm text-[#9a3412]">
                        <Icon name="ph:eye" class="mt-0.5 size-5 shrink-0 text-[#c2410c]" aria-hidden="true" />
                        <span>{{ $t(`fmk.consent.shown.${card.negative_consent}`) }}</span>
                    </p>
                    <ModulesUserFmkCardStatus :card="card.card" @showPrivate="consentOpen = true" @showLoose="looseOpen = true" @showDoseDispensing="doseDispensingOpen = true" />
                    <ModulesUserFmkComparisonTable :rows="card.rows" :canEdit="canEdit" :busyKey="busyKey" :flashKey="flashKey" :includeWithdrawn="includeWithdrawn" :withdrawnPending="pending" @toggleWithdrawn="toggleWithdrawn" @details="detailsFor = $event"
                        @takeOver="takeOver" @acknowledge="acknowledge" @openLocal="openLocal" />
                </template>
            </div>

            <Modal :show="looseOpen" :title="$t('fmk.prescription.looseTitle')" size="xl" @close="looseOpen = false">
                <template #modal-body>
                    <p class="mb-4 text-sm text-[#64748b]">{{ $t('fmk.prescription.looseIntro') }}</p>
                    <div class="max-h-[65vh] overflow-y-auto pr-2">
                        <ModulesUserFmkPrescriptionList v-if="card" :prescriptions="card.card.loose_prescription_list ?? []" />
                    </div>
                </template>
            </Modal>

            <ModulesUserFmkDoseDispensingCard :show="doseDispensingOpen" :citizenUuid="citizenUuid" @close="doseDispensingOpen = false" />

            <ModulesUserFmkNegativeConsentDialog :show="consentOpen" :pending="pending" @close="consentOpen = false" @confirm="showPrivate" />

            <!-- GK 3.5: every field FMK returned for the drug medication. -->
            <Modal :show="detailsFor !== null" :title="detailsTitle" size="xl" @close="detailsFor = null">
                <template #modal-body>
                    <p class="mb-4 text-sm text-[#64748b]">{{ $t('fmk.details.intro') }}</p>
                    <div class="max-h-[65vh] overflow-y-auto pr-2">
                        <ModulesUserFmkDetailsView v-if="detailsMedication" :medication="detailsMedication" :raw="detailsRaw" />
                    </div>
                </template>
            </Modal>
        </NuxtLayout>
    </div>
</template>
