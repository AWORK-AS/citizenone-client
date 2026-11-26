<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FmkCardSummary } from '@/types/fmk'
import { fmkModificator, fmkText } from '@/utils/fmk'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

/**
 * The card-level markings FMK requires to stand out (GK 3.7, 3.8, 3.8.1,
 * 3.17, 4.1, 7.1). Each notice says what it means and who set it.
 */
const props = defineProps<{ card: FmkCardSummary }>()

const { t } = useI18n()
const { formatDateTimeToReadable } = useDatetimeFormatter()

type Tone = 'danger' | 'warning' | 'info'
interface Notice { key: string, tone: Tone, icon: string, title: string, text?: string }

function by(entry: any): string {
    const m = fmkModificator(entry?.By)
    const who = m.isPatient ? t('fmk.status.byPatient') : [m.who, m.organisation].filter(Boolean).join(', ')
    const when = entry?.DateTime ? formatDateTimeToReadable(fmkText(entry.DateTime) ?? '') : ''
    return [who, when].filter(Boolean).join(' · ')
}

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
        list.push({ key: 'private', tone: 'warning', icon: 'ph:eye-slash', title: t('fmk.status.privateTitle', { count: c.hidden_by_negative_consent }), text: t('fmk.status.privateText') })
    }
    if (c.loose_prescriptions > 0) {
        list.push({ key: 'loose', tone: 'warning', icon: 'ph:receipt', title: t('fmk.status.loosePrescriptions', { count: c.loose_prescriptions }) })
    }
    if (c.ordered_prescriptions_exist) {
        list.push({ key: 'ordered', tone: 'info', icon: 'ph:hourglass-medium', title: t('fmk.status.orderedPrescriptions') })
    }
    if (c.organisation_relations.length > 0) {
        const names = c.organisation_relations.map((r: any) => fmkText(r?.Organisation?.Name)).filter(Boolean).join(', ')
        list.push({ key: 'administration', tone: 'info', icon: 'ph:hand-heart', title: t('fmk.status.administrationTitle'), text: names })
    }
    if (c.dose_dispensing) {
        list.push({ key: 'dose-dispensing', tone: 'info', icon: 'ph:package', title: t('fmk.status.doseDispensing') })
    }

    return list
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
                </p>
            </li>
        </ul>
    </section>
</template>
