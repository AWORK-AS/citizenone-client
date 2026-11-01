<template>
    <Modal size="sm" :title="$t('meetings.settings.title')" :show="show" @close="emit('close')">
        <template #modal-body>
            <LoadingSpinner :isActive="state.isLoading">
                <form class="space-y-5" @submit.prevent="save">
                    <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

                    <div class="space-y-1.5">
                        <FormLabel for="retention" :label="$t('meetings.settings.retention')" />
                        <select id="retention" v-model.number="state.form.recording_retention_days" :disabled="!state.canManage"
                            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white disabled:bg-gray-50">
                            <option v-for="days in state.choices" :key="days" :value="days">
                                {{ $t('meetings.settings.days', { days }) }}
                            </option>
                        </select>
                        <p class="text-xs text-gray-500">{{ $t('meetings.settings.retentionHint') }}</p>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div class="space-y-1.5">
                            <FormLabel for="travel-km" :label="$t('meetings.settings.travelKm')" />
                            <input id="travel-km" type="number" min="0" max="500" v-model.number="state.form.travel_km_per_meeting" :disabled="!state.canManage"
                                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm disabled:bg-gray-50" />
                        </div>
                        <div class="space-y-1.5">
                            <FormLabel for="travel-minutes" :label="$t('meetings.settings.travelMinutes')" />
                            <input id="travel-minutes" type="number" min="0" max="600" v-model.number="state.form.travel_minutes_per_meeting" :disabled="!state.canManage"
                                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm disabled:bg-gray-50" />
                        </div>
                    </div>
                    <p class="text-xs text-gray-500 -mt-3">{{ $t('meetings.settings.travelHint') }}</p>

                    <div class="space-y-1.5">
                        <FormLabel for="hourly-rate" :label="$t('meetings.settings.hourlyRate')" />
                        <input id="hourly-rate" type="number" min="0" max="5000" v-model.number="state.form.hourly_rate" :disabled="!state.canManage"
                            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm disabled:bg-gray-50" />
                        <p class="text-xs text-gray-500">{{ $t('meetings.settings.hourlyRateHint') }}</p>
                    </div>

                    <p v-if="!state.canManage" class="text-xs text-gray-500">{{ $t('meetings.settings.adminOnly') }}</p>
                    <div v-else class="flex justify-end gap-2">
                        <FormButton type="button" buttonStyle="cancel" @click="emit('close')">{{ $t('cancel') }}</FormButton>
                        <FormButton type="submit" buttonStyle="primary" :disabled="state.isSaving">{{ $t('meetings.form.save') }}</FormButton>
                    </div>
                </form>
            </LoadingSpinner>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { meetingService } from '@/components/api/user/MeetingService'

/**
 * The company's settings for online meetings: how long recordings are kept
 * before they are deleted automatically, and the travel a meeting saves
 * (for the statistics). Everyone can see them; administrators change them.
 */
const props = defineProps<{ show: boolean }>()
const emit = defineEmits(['close', 'saved'])

const state = reactive({
    form: { recording_retention_days: 90, travel_km_per_meeting: 20, travel_minutes_per_meeting: 30, hourly_rate: 350 },
    choices: [30, 90, 180, 365] as number[],
    canManage: false,
    isLoading: false,
    isSaving: false,
    error: {} as any,
})

watch(() => props.show, async (show) => {
    if (!show) return
    state.isLoading = true
    state.error = {}
    try {
        const data = (await meetingService.settings())?.data ?? {}
        state.form = {
            recording_retention_days: data.recording_retention_days,
            travel_km_per_meeting: data.travel_km_per_meeting,
            travel_minutes_per_meeting: data.travel_minutes_per_meeting,
            hourly_rate: data.hourly_rate ?? 350,
        }
        state.choices = data.retention_choices ?? state.choices
        state.canManage = !!data.can_manage
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}, { immediate: true })

async function save() {
    state.isSaving = true
    state.error = {}
    try {
        await meetingService.updateSettings(state.form)
        emit('saved')
        emit('close')
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}
</script>
