<template>
    <div>
        <Modal size="xs" :title="$t('reminders.checkinReminder')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="space-y-5">
                    <p>
                        {{ $t('reminders.dontForgetToCheckInToday') }}
                    </p>
                    <div class="w-fit flex items-center cursor-pointer mb-4"
                        @click="state.doNotShowAgain = !state.doNotShowAgain">
                        <FormCheckbox :value="state.doNotShowAgain" class="mr-2" />
                        <label class="text-sm cursor-pointer">{{ $t('reminders.doNotShowAgain') }}</label>
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <FormButton buttonStyle="primary" class="w-full" @click="handleCheckIn">
                            {{ $t('reminders.checkIn') }}
                        </FormButton>
                        <p class="w-fit text-sm text-center text-primary cursor-pointer hover:text-primary-700"
                            @click="handleIDontNeedToCheckinNow">
                            {{ $t('reminders.iDontNeedToCheckinNow') }}
                        </p>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

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

function handleCheckIn() {
    const now = moment().format('YYYY-MM-DD')
    localStorage.setItem('checkInReminderHidden', now)
    userStore.setIsCheckInNow(true)
    closeModal()
}

function handleIDontNeedToCheckinNow() {
    if (state.doNotShowAgain) {
        const now = moment().format('YYYY-MM-DD')
        localStorage.setItem('checkInReminderHidden', now)
    }
    closeModal()
}
</script>