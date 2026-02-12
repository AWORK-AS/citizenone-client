<template>
    <div>
        <Modal size="4xl" :title="`${$t('dutySchedules.normHours.compensatoryHoursGraph')} (${props.selectedEmployee.firstname} ${props.selectedEmployee.lastname})`" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div>
                    <ModulesUserDutyScheduleNormHoursCompensatoryGraph :selectedEmployee="props.selectedEmployee" />
                </div>
                <div class="mt-5 flex justify-end">
                    <FormButton buttonStyle="cancel" @click="closeModal" class="rounded-md">
                        {{ $t('close') }}
                    </FormButton>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedEmployee: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}
</script>