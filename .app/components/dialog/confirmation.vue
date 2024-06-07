<template>
    <TairoModal :open="isModalOpen" size="sm" @close="closeModal">
        <div class="mt-6 p-4 md:p-6">
            <div class="mx-auto w-full max-w-xs space-y-2">
                <h3 class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white">
                    {{ props.title }}
                </h3>

                <p class="font-alt text-muted-500 dark:text-muted-400 text-sm leading-5">
                    {{ props.message }}
                </p>
            </div>
        </div>

        <template #footer>
            <div class="p-4 md:p-6">
                <div class="flex gap-x-2">
                    <BaseButton @click="closeModal">
                        Cancel
                    </BaseButton>

                    <BaseButton color="primary" variant="solid" @click="confirm">
                        Confirm
                    </BaseButton>
                </div>
            </div>
        </template>
    </TairoModal>
</template>

<script setup lang="ts">
const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
})

const emit = defineEmits(['close', 'confirm'])

function closeModal() {
    emit('close')
}

function confirm() {
    emit('confirm')
}
</script>