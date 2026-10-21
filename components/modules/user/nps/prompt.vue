<template>
    <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 translate-y-3"
        enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <section v-if="visible" role="dialog" aria-modal="false" aria-labelledby="nps-title"
            class="fixed inset-x-3 bottom-3 z-40 rounded-2xl bg-white p-5 shadow-modal ring-1 ring-black/5 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[26rem]">
            <button type="button" :aria-label="$t('close')" @click="close"
                class="absolute top-3 right-3 rounded-md p-1 text-gray-400 hover:text-gray-600">
                <Icon name="ph:x" class="size-4" aria-hidden="true" />
            </button>

            <!-- 1. Spørgsmålet -->
            <template v-if="step === 'ask'">
                <h2 id="nps-title" class="pr-6 text-base font-semibold text-gray-900">{{ $t('nps.question') }}</h2>
                <div class="mt-4 grid grid-cols-11 gap-1" role="radiogroup" :aria-label="$t('nps.question')">
                    <button v-for="n in NPS_SCALE" :key="n" type="button" role="radio" :aria-checked="score === n"
                        @click="pick(n)"
                        class="rounded-md py-2 text-sm font-medium ring-1 transition-colors"
                        :class="score === n ? 'bg-primary text-white ring-primary' : 'bg-white text-gray-800 ring-gray-200 hover:ring-primary'">
                        {{ n }}
                    </button>
                </div>
                <div class="mt-1.5 flex justify-between text-xs text-gray-500">
                    <span>{{ $t('nps.unlikely') }}</span>
                    <span>{{ $t('nps.likely') }}</span>
                </div>
                <div class="mt-4 flex justify-end">
                    <button type="button" class="text-sm text-gray-500 hover:text-gray-700" @click="notNow">{{ $t('nps.notNow') }}</button>
                </div>
            </template>

            <!-- 2. Valgfri kommentar -->
            <template v-else-if="step === 'comment'">
                <h2 id="nps-title" class="pr-6 text-base font-semibold text-gray-900">
                    {{ band === 'detractor' ? $t('nps.commentDetractor') : $t('nps.comment') }}
                </h2>
                <label for="nps-comment" class="sr-only">{{ $t('nps.commentLabel') }}</label>
                <textarea id="nps-comment" v-model="comment" rows="3" maxlength="2000"
                    class="mt-3 w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-primary focus:outline-none"
                    :placeholder="$t('nps.commentPlaceholder')" />
                <p v-if="error" class="mt-2 text-sm text-red-600" role="alert">{{ error }}</p>
                <div class="mt-3 flex items-center justify-between gap-3">
                    <button type="button" class="text-sm text-gray-500 hover:text-gray-700" @click="step = 'ask'">{{ $t('nps.back') }}</button>
                    <button type="button" :disabled="sending" @click="send"
                        class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60">
                        {{ $t('nps.send') }}
                    </button>
                </div>
            </template>

            <!-- 3. Tak, og den samme invitation til alle -->
            <template v-else>
                <h2 id="nps-title" class="pr-6 text-base font-semibold text-gray-900">{{ $t('nps.thanks') }}</h2>
                <p v-if="band === 'detractor'" class="mt-2 text-sm text-gray-600">{{ $t('nps.thanksDetractor') }}</p>
                <p class="mt-2 text-sm text-gray-600">{{ $t('nps.reviewInvite') }}</p>
                <div class="mt-4 flex items-center justify-between gap-3">
                    <button type="button" class="text-sm text-gray-500 hover:text-gray-700" @click="close">{{ $t('close') }}</button>
                    <a :href="reviewUrl" target="_blank" rel="noopener" @click="reviewClicked"
                        class="inline-flex items-center gap-1.5 rounded-lg bg-secondary-25 px-4 py-2 text-sm font-semibold text-primary ring-1 ring-secondary-200 hover:bg-white">
                        {{ $t('nps.reviewCta') }}
                        <Icon name="ph:arrow-square-out" class="size-4" aria-hidden="true" />
                    </a>
                </div>
                <!--
                    A 9-10 has just said they would recommend us; this is the means to. After the
                    review invitation, which stays the same for every score.
                -->
                <div v-if="referralOffer && isPromoter(score)" class="mt-4 space-y-2 border-t border-gray-100 pt-4" data-testid="nps-referral">
                    <p class="text-sm font-semibold text-gray-900">{{ $t('referralProgram.npsTitle') }}</p>
                    <p class="text-sm text-gray-600">{{ $t('referralProgram.npsBody') }}</p>
                    <div class="flex items-stretch gap-2">
                        <label for="nps-referral-link" class="sr-only">{{ $t('platformShare.yourLink') }}</label>
                        <input id="nps-referral-link" type="text" readonly :value="referralOffer.url"
                            class="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 outline-none focus:border-primary"
                            @focus="($event.target as HTMLInputElement).select()" />
                        <button type="button" @click="copyReferralLink" data-testid="nps-referral-copy"
                            class="inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-primary ring-1 ring-secondary-200 hover:bg-secondary-25">
                            <Icon :name="referralCopied ? 'ph:check' : 'ph:copy'" class="size-4" aria-hidden="true" />
                            {{ referralCopied ? $t('referralProgram.copied') : $t('referralProgram.copy') }}
                        </button>
                    </div>
                    <ModulesUserPlatformShareReferralTerms :offer="referralOffer" />
                </div>
            </template>
        </section>
    </transition>
</template>

<script setup lang="ts">
// "Hvor sandsynligt er det, at du vil anbefale CitizenOne til en kollega?"
//
// The backend decides who is asked and when (App\Service\NpsService: admins of a company that
// has used the product for real for a month, at most twice a year). This card only asks, takes
// the answer, and offers everyone the same invitation to review us on Trustpilot. Offering it
// only to the happy ones would be review gating, which Trustpilot forbids.
import { npsService } from '@/components/api/user/NpsService'
import { NPS_SCALE, mayShowNpsPrompt, npsBand } from '@/composables/npsPrompt'
import { isPromoter, referralOfferFrom, type ReferralOffer } from '@/composables/referralProgram'
import { platformShareService } from '@/components/api/user/PlatformShareService'
import { useI18n } from 'vue-i18n'

/** Not the moment somebody logs in: give the screen a while to be about their work first. */
const DELAY_MS = 20_000

const { t } = useI18n()
const route = useRoute()

const show = ref(false)
const step = ref<'ask' | 'comment' | 'thanks'>('ask')
const score = ref<number | null>(null)
const comment = ref('')
const sending = ref(false)
const error = ref('')
const reviewUrl = ref('')
const answerUuid = ref<string | null>(null)
const referralOffer = ref<ReferralOffer | null>(null)
const referralCopied = ref(false)

const band = computed(() => (score.value === null ? null : npsBand(score.value)))
const impersonating = typeof localStorage !== 'undefined' && !!localStorage.getItem('_original_token')
const visible = computed(() => mayShowNpsPrompt({ show: show.value, impersonating, path: route.path }))

let timer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
    if (impersonating) return
    timer = setTimeout(async () => {
        try {
            const res = await npsService.prompt()
            reviewUrl.value = res?.data?.review_url ?? ''
            show.value = res?.data?.show === true && !!reviewUrl.value
        } catch (e) { /* an older backend has no NPS: show nothing */ }
    }, DELAY_MS)
})

onBeforeUnmount(() => { if (timer) clearTimeout(timer) })

function pick(n: number): void {
    score.value = n
    step.value = 'comment'
}

async function send(): Promise<void> {
    if (score.value === null) return
    sending.value = true
    error.value = ''
    try {
        const res = await npsService.answer({ score: score.value, comment: comment.value.trim() || null })
        answerUuid.value = res?.data?.uuid ?? null
        reviewUrl.value = res?.data?.review_url || reviewUrl.value
        referralOffer.value = referralOfferFrom(res?.data?.referral)
        step.value = 'thanks'
    } catch (e: any) {
        error.value = e?.message ?? t('nps.error')
    }
    sending.value = false
}

async function notNow(): Promise<void> {
    show.value = false
    try { await npsService.dismiss() } catch (e) { /* closing is what matters */ }
}

/** Closing with ✕ before answering counts as "not now", so it is not asked again tomorrow. */
function close(): void {
    if (step.value === 'thanks') {
        show.value = false
        return
    }
    notNow()
}

async function copyReferralLink(): Promise<void> {
    if (!referralOffer.value) return
    try {
        await navigator.clipboard.writeText(referralOffer.value.url)
        referralCopied.value = true
        setTimeout(() => { referralCopied.value = false }, 2000)
        // Counted like any other share of the link, so superadmin sees it.
        platformShareService.recordShare({ method: 'copy' }).catch(() => {})
    } catch { /* the field stays selectable for a manual copy */ }
}

function reviewClicked(): void {
    if (answerUuid.value) npsService.reviewClicked(answerUuid.value).catch(() => {})
    show.value = false
}
</script>
