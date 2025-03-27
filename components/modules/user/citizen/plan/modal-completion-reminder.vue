<template>
    <div>
        <Modal size="sm" :title="$t('reminders.reminder')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="space-y-3">
                    <p v-if="language.locale.value === 'en'">
                        There are {{ userStore.getUser?.plans_goals_subgoals_reached_deadline_count }} plans, goals, or
                        subgoals that have already reached their completion date. Click the
                        button below to update the completion date or mark them as complete.
                    </p>
                    <p v-if="language.locale.value === 'dk'">
                        Der er {{ userStore.getUser?.plans_goals_subgoals_reached_deadline_count }} planer, mål eller
                        delmål, der allerede har nået deres slutdato. Klik på knappen nedenfor for at opdatere
                        slutdatoen
                        eller markere dem som fuldførte.
                    </p>
                    <div class="w-fit flex items-center cursor-pointer mb-4"
                        @click="state.doNotShowAgain = !state.doNotShowAgain">
                        <FormCheckbox :value="state.doNotShowAgain" class="mr-2" />
                        <label class="cursor-pointer">{{ $t('reminders.doNotShowAgain') }}</label>
                    </div>
                </div>
                <div class="mt-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="handleCancel()">
                            {{ $t('cancel') }}
                        </FormButton>
                        <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full"
                            @click="handleProceed()">
                            {{ $t('proceed') }}
                        </FormButton>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import moment from "moment"
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'

const userStore = useUserStore() as any
const language = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close'])

const state = reactive({
    doNotShowAgain: false
})

function closeModal() {
    emit('close', state.doNotShowAgain)
}

function handleCancel() {
    if (state.doNotShowAgain) {
        const now = moment().format('YYYY-MM-DD')
        localStorage.setItem('plansGoalsSubgoalsReminderHidden', now)
    }
    emit('close', state.doNotShowAgain)
}

function handleProceed() {
    if (state.doNotShowAgain) {
        const now = moment().format('YYYY-MM-DD')
        localStorage.setItem('plansGoalsSubgoalsReminderHidden', now)
    }
    navigateTo('/plans-goals-subgoals-completions')
}
</script>