<template>
    <div>
        <Modal size="sm" :title="props.selectedApp?.name" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="mt-6">
                    <div class="space-y-3">
                        <img :src="props.selectedApp?.image" :alt="props.selectedApp?.name"
                            class="w-full rounded-md max-h-96">
                        <div class="text-muted-400 flex items-center gap-1">
                            <Icon name="material-symbols:receipt" class="size-4" />
                            <p class="font-sans text-sm">
                                {{ formatAmount(props.selectedApp?.price) }}
                                {{ $t('excludeVat') }}
                            </p>
                        </div>
                        <p class="text-muted-800 dark:text-muted-100 font-sans text-sm">
                            {{ props.selectedApp?.description }}
                        </p>
                        <p class="cursor-pointer text-xs text-tertiary hover:text-tertiary/90" @click="navigateToTAC">
                            {{ $t('apps.termsAndConditions') }}
                        </p>
                    </div>
                </div>
                <div class="mt-5 flex gap-x-3">
                    <FormButton buttonStyle="primary" @click="closeModal" class="w-full rounded-md">
                        {{ $t('apps.contactUs') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" @click="closeModal" class="w-full rounded-md">
                        {{ $t('apps.activate') }}
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
    // Convert the number to a string with two decimal places
    let numberStr = parseFloat(amount).toFixed(2)

    // Split the string into integer and decimal parts
    let parts = numberStr.split('.')
    let integerPart = parts[0]
    let decimalPart = parts[1]

    // Add the thousands separators
    let formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

    // Combine the integer part with the decimal part
    return 'DKK ' + formattedIntegerPart + ',' + decimalPart
}

async function navigateToTAC() {
    await navigateTo('https://citizenone.dk/vilkaarogbetingelser/', {
        external: true,
        open: {
            target: '_blank',
        }
    })
}
</script>