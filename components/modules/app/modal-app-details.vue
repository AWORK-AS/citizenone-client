<template>
    <div>
        <Modal size="sm" :title="props.selectedApp?.name" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="mt-6">
                        <div class="space-y-3">
                            <img :src="props.selectedApp?.image" :alt="props.selectedApp?.name"
                                class="w-full rounded-md max-h-96">
                            <div class="text-muted-400 flex items-center gap-1">
                                <Icon name="material-symbols:receipt" class="size-4" />
                                <div class="font-sans text-sm" v-if="props.selectedApp?.is_one_time_fee">
                                    {{ formatAmount(props.selectedApp?.price) }}
                                    {{ $t('excludeVat') }}
                                </div>
                                <div class="font-sans text-sm" v-else>
                                    {{ formatAmount(props.selectedApp?.monthly_price) }}
                                    <span class="lowercase">/{{ $t('apps.month') }}</span>
                                    <span>
                                        ({{ formatAmount(props.selectedApp?.yearly_price) }}
                                        <span class="lowercase">/{{ $t('apps.year') }}</span>)
                                    </span>
                                    {{ $t('excludeVat') }}
                                </div>
                            </div>
                            <p class="text-muted-800 dark:text-muted-100 font-sans text-sm">
                                {{ props.selectedApp?.description }}
                            </p>
                        </div>
                    </div>
                    <div class="mt-5 flex gap-x-3">
                        <FormButton buttonStyle="primary" @click="state.modal.isContactUsOpen = true"
                            class="w-full rounded-md">
                            {{ $t('apps.contactUs') }}
                        </FormButton>
                        <FormButton type="button"
                            :buttonStyle="props.selectedApp?.user_activated ? 'warning' : 'action'" :class="[
                                props.selectedApp?.user_activated && 'cursor-not-allowed',
                                'w-full'
                            ]" color="primary" @click="!props.selectedApp?.user_activated && confirmTACAcceptance">
                            {{ props.selectedApp?.user_activated ? $t('apps.activated') : $t('apps.activate') }}
                        </FormButton>
                    </div>
                </LoadingSpinner>
                <ModulesAppModalContactUs :isModalOpen="state.modal.isContactUsOpen" :selectedApp="props.selectedApp"
                    @close="state.modal.isContactUsOpen = false" />
                <ModulesAppModalTACConfirmation :isModalOpen="state.modal.isAcceptTACOpen"
                    :selectedApp="props.selectedApp" @close="state.modal.isAcceptTACOpen = false"
                    @confirm="activateApp" />
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { appService } from '@/components/api/AppService'
import type { Error } from '@/types'

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

const emit = defineEmits(['close', 'activateApp'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    modal: {
        isAcceptTACOpen: false,
        isContactUsOpen: false,
    }
})

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

async function navigateToSupport() {
    await navigateTo('https://citizenone.dk/support', {
        external: true,
        open: {
            target: '_blank',
        }
    })
}

function confirmTACAcceptance() {
    state.modal.isAcceptTACOpen = true
}

async function activateApp(frequency: any) {
    closeModal()
    emit('activateApp', frequency)
}
</script>