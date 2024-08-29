<template>
    <div>
        <Modal size="xs" :title="$t('dutySchedules.newSchedule')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="saveShift()" class="overflow-x-hidden overflow-y-auto">
                        <div class="space-y-1">
                            <FormLabel for="shift_type" label="Shift Type" />
                            <FormSelect id="shift_type" name="shift_type" :options="state.options.shifts"
                                v-model="state.formShift.shift_type" />
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                                    Create
                                </FormButton>
                            </div>
                        </div>
                    </form>
                </LoadingSpinner>
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
})
const emit = defineEmits(['close', 'saveShift'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formShift: {
        shift_type: '',
    },
    options: {
        shifts: [
            { value: 'regular shift', label: 'Regular shift' },
            { value: 'night shift', label: 'Night shift' },
            { value: 'vacation leave', label: 'Vacation leave' },
            { value: 'sick leave', label: 'Sick leave' },
        ]
    }
})

watch(() => props.isModalOpen, () => {
    state.error = {}
    state.formShift.shift_type = ''
})

function closeModal() {
    emit('close')
}

async function saveShift() {
    closeModal()
    emit('saveShift', state.formShift)
}
</script>