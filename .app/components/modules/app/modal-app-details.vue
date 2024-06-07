<template>
    <TairoModal :open="props.isModalOpen" size="md" @close="closeModal">
        <template #header>
            <div class="flex w-full items-center justify-between p-4 md:p-6">
                <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
                    {{ props.selectedApp?.name }}
                </h3>

                <BaseButtonClose @click="closeModal" />
            </div>
        </template>

        <div class="p-4 md:p-6">
            <div class="space-y-3">
                <img :src="props.selectedApp?.image" :alt="props.selectedApp?.name" class="w-full rounded-md max-h-96">
                <div class="text-muted-400 flex items-center gap-1">
                    <Icon name="material-symbols:receipt" class="size-4" />
                    <p class="font-sans text-sm">
                        {{ formatAmount(props.selectedApp?.price) }}
                    </p>
                </div>
                <p class="text-muted-800 dark:text-muted-100 font-sans text-sm">
                    {{ props.selectedApp?.description }}
                </p>
            </div>
        </div>

        <template #footer>
            <div class="p-4 md:p-6">
                <div class="flex gap-x-2">
                    <BaseButton>
                        Contact Us
                    </BaseButton>

                    <BaseButton color="primary" variant="solid">
                        Activate
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
    selectedApp: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}

function formatAmount(amount: any) {
    return 'DKK' + numberWithCommas(parseFloat(amount).toFixed(2))
}

function numberWithCommas(number: string) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
</script>