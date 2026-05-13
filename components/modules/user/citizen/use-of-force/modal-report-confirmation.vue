<template>
    <div>
        <Modal size="sm" :title="props.title ? props.title : $t('confirmation')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="space-y-3">
                    <p>
                        {{ $t('citizens.useOfForce.confirmation.reportConfirmation') }}?
                    </p>
                    <div class="px-3 text-justify space-y-2">
                        <div class="text-sm">
                            <span>
                                - {{ $t('citizens.useOfForce.confirmation.byClickingYesText') }}.
                            </span>
                        </div>
                        <p class="text-sm">
                            - {{ $t('citizens.useOfForce.confirmation.inAdditionText') }}.
                        </p>
                    </div>
                    <div class="space-y-1">
                        <p class="text-sm text-gray-600">
                            {{ $t('citizens.useOfForce.form.riskLevel.riskLevel') }}
                        </p>
                        <div>
                            <RadioGroup v-model="state.formUseOfForce.risk_level"
                                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                <RadioGroupOption as="template" v-for="(type, index) in state.options.risk_levels"
                                    :key="index" :value="type.value" v-slot="{ active, checked }">
                                    <div
                                        :class="[
                                            active ? 'ring-1 ring-offset-2' : '',
                                            type.title === 'Harmless' && 'ring-primary',
                                            type.title === 'Low Risk' && 'ring-yellow-500',
                                            type.title === 'Moderate Risk' && 'ring-orange-500',
                                            type.title === 'High Risk' && 'ring-red-500',
                                            checked && type.title === 'Harmless' && 'bg-primary text-white ring-0 hover:bg-primary',
                                            checked && type.title === 'Low Risk' && 'bg-yellow-500 text-white ring-0 hover:bg-yellow-500',
                                            checked && type.title === 'Moderate Risk' && 'bg-orange-500 text-white ring-0 hover:bg-orange-500',
                                            checked && type.title === 'High Risk' && 'bg-red-500 text-white ring-0 hover:bg-red-500',
                                            !active && !checked && type.title === 'Harmless' && 'border border-primary ring-inset',
                                            !active && !checked && type.title === 'Low Risk' && 'border border-yellow-500 ring-inset',
                                            !active && !checked && type.title === 'Moderate Risk' && 'border border-orange-500 ring-inset',
                                            !active && !checked && type.title === 'High Risk' && 'border border-red-500 ring-inset',
                                            active && checked ? 'text-white ring-1' : '',
                                            'cursor-pointer flex items-center justify-center rounded-md px-2 py-2 text-xs']">
                                        <span v-if="type.title === 'Harmless'">
                                            {{ $t('citizens.useOfForce.form.riskLevel.category.harmless') }}
                                        </span>
                                        <span v-if="type.title === 'Low Risk'">
                                            {{ $t('citizens.useOfForce.form.riskLevel.category.lowRisk') }}
                                        </span>
                                        <span v-if="type.title === 'Moderate Risk'">
                                            {{ $t('citizens.useOfForce.form.riskLevel.category.moderateRisk') }}
                                        </span>
                                        <span v-if="type.title === 'High Risk'">
                                            {{ $t('citizens.useOfForce.form.riskLevel.category.highRisk') }}
                                        </span>
                                    </div>
                                </RadioGroupOption>
                            </RadioGroup>
                        </div>
                        <FormError :error="v$?.formUseOfForce?.risk_level?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.risk_level?.[0]" />
                    </div>
                </div>
                <div class="mt-5 flex gap-x-3">
                    <FormButton @click="closeModal" class="w-full">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" @click="handleConfirmation" class="w-full">
                        {{ $t('yes') }}
                    </FormButton>
                </div>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    message: {
        type: String,
        required: false,
    },
    title: {
        type: String,
        required: false,
    },
})
const emit = defineEmits(['close', 'submitForm'])
const { t } = useI18n()

const state = reactive({
    formUseOfForce: {
        risk_level: ''
    },
    options: {
        risk_levels: [
            { value: 'harmless', title: 'Harmless' },
            { value: 'low-risk', title: 'Low Risk' },
            { value: 'moderate-risk', title: 'Moderate Risk' },
            { value: 'high-risk', title: 'High Risk' },
        ] as any
    },
})

const rules = computed(() => {
    return {
        formUseOfForce: {
            risk_level: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})
const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

function handleConfirmation() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formUseOfForce)
    }
}
</script>