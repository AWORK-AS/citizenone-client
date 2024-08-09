<template>
    <div>
        <Modal size="xs" :title="$t('reminder.checkinReminder')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="space-y-5">
                    <p>
                        {{ $t('reminder.dontForgetToCheckInToday') }}
                    </p>
                    <div class="flex items-center mb-4">
                        <FormCheckbox v-model="doNotShowAgain" class="mr-2" />
                        <label class="text-sm">{{ $t('reminder.doNotShowAgain') }}</label>
                    </div>
                    <FormButton buttonStyle="primary" @click="closeModal" class="w-full rounded-md">
                        {{ $t('reminder.ok') }}
                    </FormButton>
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
})

const doNotShowAgain = ref(false)
const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}
</script>