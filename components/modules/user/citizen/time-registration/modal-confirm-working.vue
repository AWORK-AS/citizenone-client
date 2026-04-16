<template>
    <div>
        <Modal size="sm" :title="$t('citizens.timeRegistration.confirmWorking.title')" :show="props.isModalOpen"
            @close="handleNo">
            <template #modal-body>
                <div class="space-y-4">
                    <!-- Icon and message -->
                    <div class="flex flex-col items-center text-center">
                        <div
                            class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                            <Icon name="ph:clock" class="w-8 h-8 text-green-600" />
                        </div>
                        <h3 class="text-lg font-semibold mb-2">
                            {{ $t('citizens.timeRegistration.confirmWorking.question') }}
                        </h3>
                        <p class="text-sm text-gray-600 mb-2">
                            {{ props.citizenName }}
                        </p>
                        <div class="mt-3 flex items-center gap-2 text-xs text-gray-500">
                            <Icon name="ph:timer" class="w-4 h-4" />
                            <span>{{ $t('citizens.timeRegistration.confirmWorking.workingFor') }}: {{
                                props.workingMinutes }} {{ $t('minutes') }}</span>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="grid grid-cols-2 gap-3 mt-6">
                        <FormButton buttonStyle="cancel" @click="handleNo">
                            {{ $t('citizens.timeRegistration.no') }}
                        </FormButton>
                        <FormButton buttonStyle="primary" @click="handleYes">
                            {{ $t('citizens.timeRegistration.yes') }}
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
    citizenName: {
        type: String,
        default: '',
    },
    workingMinutes: {
        type: Number,
        default: 0,
    },
})

const emit = defineEmits(['confirmed', 'dismissed', 'close'])

function handleYes() {
    emit('confirmed')
    emit('close')
}

function handleNo() {
    emit('dismissed')
    emit('close')
}
</script>