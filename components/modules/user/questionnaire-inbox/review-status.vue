<template>
    <div :class="['flex flex-col gap-y-1', props.align === 'end' ? 'items-end text-right' : 'items-start']">
        <span :class="['text-xs font-medium rounded-full px-3 py-1 whitespace-nowrap', style.classes]">
            {{ $t(`questionnaireInbox.status.${style.key}`) }}
        </span>
        <p v-if="reviewerLine" class="text-xs text-gray-500">{{ reviewerLine }}</p>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { reviewStatusStyle } from '@/composables/questionnaireInbox'

// The review state of a returned questionnaire: To review, Approved or Declined, and for a handled one
// who did it (or that it was handled before the inbox existed).
const props = defineProps({
    status: {
        type: String,
        required: true,
    },
    review: {
        type: Object,
        required: false,
        default: null,
    },
    align: {
        type: String,
        required: false,
        default: 'start',
    },
})

const { t } = useI18n()

const style = computed(() => reviewStatusStyle(props.status))

const reviewerLine = computed(() => {
    if (props.status === 'to_review' || !props.review) return ''
    if (props.review.handled_before_inbox) return t('questionnaireInbox.handledBeforeInbox')
    if (!props.review.by?.name) return ''

    const date = props.review.at ? moment(props.review.at).format('DD-MM-YYYY') : ''
    const by = t('questionnaireInbox.reviewedBy', { name: props.review.by.name })

    return date ? `${by} · ${date}` : by
})
</script>
