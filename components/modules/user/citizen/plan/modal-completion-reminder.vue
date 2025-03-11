<template>
    <div>
        <Modal size="sm" :title="$t('reminders.reminder')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <p v-if="language.locale.value === 'en'">
                    There are {{ userStore.getUser?.plans_goals_subgoals_reached_deadline_count }} plans, goals, or
                    subgoals that have already reached their completion date. Click the
                    button below to update the completion date or mark them as complete.
                </p>
                <p v-if="language.locale.value === 'dk'">
                    Der er {{ userStore.getUser?.plans_goals_subgoals_reached_deadline_count }} planer, mål eller
                    delmål, der allerede har nået deres slutdato. Klik på knappen nedenfor for at opdatere slutdatoen
                    eller markere dem som fuldførte.
                </p>
                <div class="mt-6">
                    <div>
                        <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full"
                            @click="navigateTo('/plans-goals-subgoals-completions')">
                            {{ $t('proceed') }}
                        </FormButton>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
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

function closeModal() {
    emit('close')
}
</script>