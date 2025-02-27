<template>
    <div>
        <Modal size="xs" :title="props.title ? props.title : $t('confirmation')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="mx-auto max-w-sm md:max-w-md mt-16 relative" v-if="!props.selectedApp?.is_one_time_fee">
                        <div class="flex justify-center">
                            <fieldset aria-label="Payment frequency">
                                <RadioGroup v-model="state.formApp.frequency"
                                    class="grid grid-cols-2 gap-x-1 rounded-full p-2 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200">
                                    <RadioGroupOption as="template" v-for="option in frequencies" :key="option.value"
                                        :value="option" v-slot="{ checked }">
                                        <div
                                            :class="[checked ? 'bg-tertiary text-white' : 'text-gray-500', 'cursor-pointer rounded-full px-2.5 py-1']">
                                            <span v-if="option.label === 'Monthly'">
                                                {{ $t('apps.form.monthly') }}
                                            </span>
                                            <span v-else-if="option.label === 'Annually'">
                                                {{ $t('apps.form.annually') }}
                                            </span>
                                            <span v-else>
                                                {{ option.label }}
                                            </span>
                                        </div>
                                    </RadioGroupOption>
                                </RadioGroup>
                            </fieldset>
                        </div>
                        <div class="absolute right-11 -top-10 sm:right-16 sm:-top-10 md:right-24 md:-top-11">
                            <div class="relative">
                                <img src="/img/icons/discount-badge.svg" alt="Discount" width="73px">
                                <div class="text-xxs text-center font-semibold text-white absolute top-8 right-5 w-10">
                                    <p class="text-center" :class="language.locale.value === 'dk' && 'ml-1.5'">
                                        {{ $t('subscription.discount.discount') }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="text-muted-400" :class="!props.selectedApp?.is_one_time_fee && 'mt-5'">
                        <div class="font-san" v-if="props.selectedApp?.is_one_time_fee">
                            {{ formatAmount(props.selectedApp?.price) }}
                            {{ $t('excludeVat') }}
                        </div>
                        <div class="font-sans" v-else>
                            <span v-if="state.formApp.frequency.value === 'monthly'">
                                {{ formatAmount(props.selectedApp?.monthly_price) }}
                                <span class="lowercase">/{{ $t('apps.month') }}</span>
                            </span>
                            <span v-else>
                                <span>
                                    {{ formatAmount(props.selectedApp?.yearly_price) }}
                                    <span class="lowercase">/{{ $t('apps.year') }}</span>
                                </span>
                            </span>
                            {{ $t('excludeVat') }}
                        </div>
                    </div>
                    <div class="space-y-1" :class="!props.selectedApp?.is_one_time_fee ? 'mt-5' : 'mt-5'">
                        <div class="w-fit flex items-center cursor-pointer"
                            @click="state.formTAC.agreeToTerms = !state.formTAC.agreeToTerms">
                            <FormCheckbox :value="state.formTAC.agreeToTerms" />
                            <span class="text-sm">
                                {{ $t('apps.iHaveReadAndAcceptThe') }}
                                <span class="cursor-pointer text-tertiary hover:text-tertiary/90"
                                    @click="navigateToTAC">
                                    {{ $t('apps.termsAndConditions') }}
                                </span>
                            </span>
                        </div>
                        <span v-if="state.agreeToTermsValidation" class="text-sm text-red-500">
                            <span>{{ $t('apps.agreetoTAC') }}</span>
                        </span>
                    </div>
                </div>
                <div class="mt-5 flex gap-x-3">
                    <FormButton @click="closeModal" class="w-full rounded-md">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" @click="handleConfirmation" class="w-full rounded-md">
                        {{ $t('confirm') }}
                    </FormButton>
                </div>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useI18n } from "vue-i18n"

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    message: {
        type: String,
        required: false,
    },
    selectedApp: {
        type: Object,
        required: true,
    },
    title: {
        type: String,
        required: false,
    },
})

const emit = defineEmits(['close', 'confirm'])
const { formatAmount } = useAmountFormatter()
const language = useI18n()
const frequencies = [
    { value: 'monthly', label: 'Monthly', priceSuffix: '/month' },
    { value: 'annually', label: 'Annually', priceSuffix: '/year' },
]

const state = reactive({
    agreeToTermsValidation: false,
    formTAC: {
        agreeToTerms: false
    },
    formApp: {
        frequency: frequencies[0]
    }
})

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        state.agreeToTermsValidation = false
        state.formTAC.agreeToTerms = false
    }
})

function closeModal() {
    emit('close')
}

function handleConfirmation() {
    if (!state.formTAC.agreeToTerms) {
        state.agreeToTermsValidation = true
    } else {
        state.agreeToTermsValidation = false
        emit('confirm', state.formApp.frequency)
        emit('close')
    }
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