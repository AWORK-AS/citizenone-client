<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FmkCardSummary } from '@/types/fmk'
import { fmkRelation } from '@/utils/fmk'
import { useFmkModifier } from '@/composables/useFmkModifier'

/**
 * The card-level markings FMK requires to stand out (GK 3.7, 3.8, 3.8.1,
 * 3.17, 4.1, 7.1). Each notice says what it means and who set it.
 */
const props = defineProps<{ card: FmkCardSummary }>()
const emit = defineEmits<{ showPrivate: [], showLoose: [] }>()

const { t } = useI18n()
const { by, organisationLine } = useFmkModifier()

type Tone = 'danger' | 'warning' | 'info'
interface Notice { key: string, tone: Tone, icon: string, title: string, text?: string, action?: string, event?: 'showPrivate' | 'showLoose' }

const notices = computed<Notice[]>(() => {
    const c = props.card
    const list: Notice[] = []

    if (c.is_invalid) {
        list.push({ key: 'invalid', tone: 'danger', icon: 'ph:warning-octagon', title: t('fmk.status.invalidTitle'), text: t('fmk.status.invalidText') })
    }
    if (c.not_reviewed) {
        list.push({ key: 'not-reviewed', tone: 'warning', icon: 'ph:warning', title: t('fmk.status.notReviewedTitle'), text: `${t('fmk.status.notReviewedText')} ${by(c.not_reviewed)}` })
    }
    if (c.never_reviewed) {
        list.push({ key: 'never-reviewed', tone: 'warning', icon: 'ph:warning', title: t('fmk.status.neverReviewedTitle'), text: t('fmk.status.neverReviewedText') })
    }
    if (c.hidden_by_negative_consent > 0) {
        list.push({ key: 'private', tone: 'warning', icon: 'ph:eye-slash', title: t('fmk.status.privateTitle', { count: c.hidden_by_negative_consent }, c.hidden_by_negative_consent), text: t('fmk.status.privateText'), action: t('fmk.consent.open'), event: 'showPrivate' })
    }
    if (c.loose_prescriptions > 0) {
        list.push({ key: 'loose', tone: 'warning', icon: 'ph:receipt', title: t('fmk.status.loosePrescriptions', { count: c.loose_prescriptions }, c.loose_prescriptions), action: c.loose_prescription_list?.length ? t('fmk.prescription.showLoose') : undefined, event: 'showLoose' })
    }
    if (c.ordered_prescriptions_exist) {
        list.push({ key: 'ordered', tone: 'info', icon: 'ph:hourglass-medium', title: t('fmk.status.orderedPrescriptions') })
    }
    // GK 3.7.1 / 3.17: an admission to hospital stands out; other relations
    // say who else gives the citizen medicine. Each with organisation and who
    // registered it.
    c.organisation_relations.forEach((raw: any, index: number) => {
        const r = fmkRelation(raw)
        const registered = raw?.Created ? t('fmk.status.registeredBy', { by: by(raw.Created) }) : ''
        const text = [organisationLine(raw?.Organisation), registered].filter(Boolean).join(' · ')
        if (r.admitted) {
            list.push({ key: `admitted-${index}`, tone: 'warning', icon: 'ph:hospital', title: t('fmk.status.admittedTitle'), text })
        } else {
            list.push({ key: `relation-${index}`, tone: 'info', icon: 'ph:hand-heart', title: r.type ? t('fmk.status.relationTitle', { type: r.type }) : t('fmk.status.administrationTitle'), text })
        }
    })
    if (c.dose_dispensing) {
        list.push({ key: 'dose-dispensing', tone: 'info', icon: 'ph:package', title: t('fmk.status.doseDispensing') })
    }

    // An admission to hospital is the most important marking after "invalid".
    const admitted = list.filter(n => n.key.startsWith('admitted-'))
    const rest = list.filter(n => !n.key.startsWith('admitted-'))
    const at = rest.findIndex(n => n.key !== 'invalid')
    rest.splice(at < 0 ? rest.length : at, 0, ...admitted)
    return rest
})

const reviewedLine = computed(() => (props.card.reviewed ? by(props.card.reviewed) : null))

const toneClass: Record<Tone, string> = {
    danger: 'border-l-[#dc2626] bg-[#fef2f2] text-[#991b1b]',
    warning: 'border-l-[#f97316] bg-[#fffaf5] text-[#9a3412]',
    info: 'border-l-[#2dbab2] bg-white text-[#1a2332]',
}
const iconClass: Record<Tone, string> = {
    danger: 'text-[#dc2626]',
    warning: 'text-[#c2410c]',
    info: 'text-[#1b6d8a]',
}
</script>

<template>
    <!-- One compact panel instead of a box per marking: every marking FMK
         requires stays visible, but the medicine is no longer pushed down. -->
    <section v-if="notices.length || reviewedLine" :aria-label="$t('fmk.status.label')"
        class="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
        <ul class="divide-y divide-[#e2e8f0]">
            <li v-if="reviewedLine" class="flex items-start gap-3 border-l-4 border-l-[#2dbab2] px-4 py-2.5 text-sm text-[#1a2332]">
                <Icon name="ph:check-circle" class="mt-0.5 size-5 shrink-0 text-[#2dbab2]" aria-hidden="true" />
                <p><span class="font-semibold">{{ $t('fmk.status.reviewed') }}</span> {{ reviewedLine }}</p>
            </li>
            <li v-for="notice in notices" :key="notice.key" role="status"
                class="flex items-start gap-3 border-l-4 px-4 py-2.5" :class="toneClass[notice.tone]">
                <Icon :name="notice.icon" class="mt-0.5 size-5 shrink-0" :class="iconClass[notice.tone]" aria-hidden="true" />
                <p class="min-w-0 text-sm">
                    <span class="font-semibold">{{ notice.title }}</span>
                    <span v-if="notice.text" class="block opacity-90 lg:ml-1.5 lg:inline">{{ notice.text }}</span>
                    <button v-if="notice.action" type="button" @click="notice.event === 'showLoose' ? emit('showLoose') : emit('showPrivate')"
                        class="mt-1.5 inline-flex items-center gap-1.5 rounded-md border border-current/30 bg-white px-2.5 py-1 text-xs font-semibold hover:bg-[#fff7ed] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2] lg:ml-2 lg:mt-0">
                        <Icon name="ph:eye" class="size-3.5" aria-hidden="true" />
                        {{ notice.action }}
                    </button>
                </p>
            </li>
        </ul>
    </section>
</template>
