<template>
    <div>
        <Modal size="xs" :title="$t('dutySchedules.removeSchedule.reason.title')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div v-if="state.step === 'choose'">
                    <p>{{ $t('dutySchedules.removeSchedule.reason.question') }}</p>
                    <div class="mt-5 flex flex-col gap-y-3">
                        <FormButton buttonStyle="primary" class="w-full" @click="emitReason('sick-leave')">
                            {{ $t('dutySchedules.removeSchedule.reason.sick') }}
                        </FormButton>
                        <FormButton buttonStyle="primary" class="w-full" @click="emitReason('vacation-leave')">
                            {{ $t('dutySchedules.removeSchedule.reason.vacation') }}
                        </FormButton>
                        <FormButton class="w-full" @click="state.step = 'reassign'">
                            {{ $t('dutySchedules.removeSchedule.reason.reassign') }}
                        </FormButton>
                        <FormButton class="w-full" @click="confirmDelete">
                            {{ $t('dutySchedules.removeSchedule.reason.delete') }}
                        </FormButton>
                        <FormButton class="w-full" @click="closeModal">
                            {{ $t('cancel') }}
                        </FormButton>
                    </div>
                </div>
                <div v-else>
                    <div class="space-y-1">
                        <FormLabel for="reassign-employee-select" :label="$t('employee')" />
                        <FormSelect id="reassign-employee-select" :options="employeeOptions"
                            v-model="state.selectedEmployeeUuid" />
                    </div>
                    <div class="mt-5 flex gap-x-3">
                        <FormButton class="w-full" @click="state.step = 'choose'">
                            {{ $t('back') }}
                        </FormButton>
                        <FormButton buttonStyle="primary" class="w-full" :disabled="!state.selectedEmployeeUuid"
                            @click="confirmReassign">
                            {{ $t('confirm') }}
                        </FormButton>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    availableEmployees: {
        type: Array,
        default: () => [],
    },
    currentEmployeeUuid: {
        type: String,
        default: null,
    },
})

const emit = defineEmits(['close', 'markAbsence', 'reassign', 'deleteShift'])

const state = reactive({
    step: 'choose' as 'choose' | 'reassign',
    selectedEmployeeUuid: null as string | null,
})

const employeeOptions = computed(() => {
    return (props.availableEmployees as any[])
        .filter((employee: any) => employee?.uuid !== props.currentEmployeeUuid)
        .map((employee: any) => ({
            value: employee.uuid,
            label: `${employee.firstname} ${employee.lastname}`,
        }))
})

watch(() => props.isModalOpen, (isOpen: boolean) => {
    if (isOpen) {
        state.step = 'choose'
        state.selectedEmployeeUuid = null
    }
})

function closeModal() {
    emit('close')
}

function emitReason(reason: string) {
    emit('markAbsence', reason)
    emit('close')
}

function confirmDelete() {
    emit('deleteShift')
    emit('close')
}

function confirmReassign() {
    if (!state.selectedEmployeeUuid) return
    emit('reassign', state.selectedEmployeeUuid)
    emit('close')
}
</script>
