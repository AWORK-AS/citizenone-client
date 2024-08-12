<template>
    <div>
        <Modal size="xs" :title="$t('reminder.checkinReminder')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="space-y-5">
                    <p>
                        {{ $t('reminder.dontForgetToCheckInToday') }}
                    </p>
                    <div class="w-fit flex items-center cursor-pointer mb-4"
                        @click="state.doNotShowAgain = !state.doNotShowAgain">
                        <FormCheckbox :value="state.doNotShowAgain" class="mr-2" />
                        <label class="text-sm cursor-pointer">{{ $t('reminder.doNotShowAgain') }}</label>
                    </div>
                    <FormButton buttonStyle="primary" @click="handleOkButton" class="w-full rounded-md">
                        {{ $t('reminder.ok') }}
                    </FormButton>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'

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
    emit('close')
}

function handleOkButton() {
    if (state.doNotShowAgain) {
        const now = moment().format('YYYY-MM-DD')
        localStorage.setItem('checkInReminderHidden', now)
    }
    closeModal()
}
</script>