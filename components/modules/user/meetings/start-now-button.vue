<template>
    <Tooltip v-if="enabled" :text="label" :position="tooltipPosition">
        <button type="button" :aria-label="label" :disabled="state.busy"
            class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-surface-100 hover:text-primary transition-colors disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            @click="start">
            <Icon :name="state.busy ? 'ph:spinner' : 'ph:video-camera'" class="w-5 h-5" :class="state.busy && 'animate-spin'" aria-hidden="true" />
        </button>
    </Tooltip>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { meetingService } from '@/components/api/user/MeetingService'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'

/**
 * One click to an online meeting right now with this colleague or citizen:
 * the meeting is created, they are invited by email, and the user lands in
 * the pre-join. Shown only where the company has CitizenOne Online Meetings.
 */
const props = withDefaults(defineProps<{
    userUuid?: string
    citizenUuid?: string
    tooltipPosition?: string
}>(), { tooltipPosition: 'bottom' })

const { t } = useI18n()
const userStore = useUserStore() as any
const state = reactive({ busy: false })

const enabled = computed(() => !!userStore.getUser?.company?.meetings_enabled && !!(props.userUuid || props.citizenUuid))
const label = computed(() => t('meetings.startNowWith'))

async function start() {
    state.busy = true
    try {
        const response = await meetingService.startNow({
            ...(props.userUuid && { user_uuid: props.userUuid }),
            ...(props.citizenUuid && { citizen_uuid: props.citizenUuid }),
        })
        if (response?.data?.uuid) navigateTo(`/meetings/${response.data.uuid}?join=1`)
    } catch (error: any) {
        useAlert().errorAlert(t('alert.warning'), error?.message ?? '')
    }
    state.busy = false
}
</script>
