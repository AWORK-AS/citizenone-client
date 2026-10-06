<template>
    <Tooltip v-if="notice.tone !== 'none'" :text="tooltip" position="top" wrap>
        <span class="co-badge" :class="toneClass">
            <Icon :name="notice.tone === 'ok' ? 'ph:calendar-check' : 'ph:bell-ringing'" class="w-3 h-3" aria-hidden="true" />
            {{ label }}
        </span>
    </Tooltip>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { noticeStatus } from '@/composables/agreements'

const props = defineProps({
    deadline: { type: String, default: null },
    autoRenews: { type: Boolean, default: true },
})

const { t } = useI18n()
const { formatDateToReadable } = useDatetimeFormatter()

const notice = computed(() => noticeStatus(props.deadline))

const label = computed(() => {
    const date = props.deadline ? formatDateToReadable(props.deadline) : ''
    if (notice.value.tone === 'passed') return t('superadmin.agreements.notice.passed', { date })
    if (notice.value.tone === 'soon') return t('superadmin.agreements.notice.soon', { days: notice.value.days })
    return t('superadmin.agreements.notice.deadline', { date })
})

const tooltip = computed(() => {
    const key = notice.value.tone === 'passed'
        ? (props.autoRenews ? 'passedRenews' : 'passedEnds')
        : 'help'
    return t(`superadmin.agreements.notice.${key}`, { date: props.deadline ? formatDateToReadable(props.deadline) : '' })
})

const toneClass = computed(() => ({
    'co-badge-red': notice.value.tone === 'passed',
    'bg-[#FEF3C7] text-[#B45309]': notice.value.tone === 'soon',
    'co-badge-gray': notice.value.tone === 'ok',
}))
</script>
