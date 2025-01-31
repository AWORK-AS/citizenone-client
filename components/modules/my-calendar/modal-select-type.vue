<template>
    <div>
        <Modal size="sm" :title="$t('events.newEvent')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <form @submit.prevent="submitForm()">
                    <div class="space-y-3">
                        <div class="space-y-1">
                            <p class="text-sm">
                                {{ $t('events.pleaseSelectWhomYouWouldLikeToCreateTheEventFor') }}
                            </p>
                            <RadioGroup v-model="state.formSelect.selectedType"
                                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                <RadioGroupOption as="template" v-for="(assessment, index) in state.options.userTypes"
                                    :key="index" :value="assessment.value" v-slot="{ active, checked }">
                                    <div
                                        :class="[
                                            active ? 'ring-1 ring-offset-2' : '',
                                            assessment.title === 'myself' && 'ring-primary',
                                            assessment.title === 'citizens' && 'ring-yellow-500',
                                            assessment.title === 'employees' && 'ring-green-700',
                                            checked && assessment.title === 'myself' && 'bg-primary text-white ring-0 hover:bg-primary',
                                            checked && assessment.title === 'citizens' && 'bg-yellow-500 text-white ring-0 hover:bg-yellow-500',
                                            checked && assessment.title === 'employees' && 'bg-green-700 text-white ring-0 hover:bg-green-700',
                                            !active && !checked && assessment.title === 'myself' && 'border border-primary ring-inset',
                                            !active && !checked && assessment.title === 'citizens' && 'border border-yellow-500 ring-inset',
                                            !active && !checked && assessment.title === 'employees' && 'border border-green-700 ring-inset',
                                            active && checked ? 'text-white ring-1' : '',
                                            'cursor-pointer flex items-center justify-center rounded-md px-2 py-2 text-xs']">
                                        <span v-if="assessment.title === 'myself'">
                                            {{ $t('events.myself') }}
                                        </span>
                                        <span v-if="assessment.title === 'citizens'">
                                            {{ $t('events.citizens') }}
                                        </span>
                                        <span v-if="assessment.title === 'employees'">
                                            {{ $t('events.employees') }}
                                        </span>
                                    </div>
                                </RadioGroupOption>
                            </RadioGroup>
                            <FormError :error="v$?.formSelect?.selectedType?.$errors[0]?.$message.toString()" />
                        </div>
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                                {{ $t('events.proceed') }}
                            </FormButton>
                        </div>
                    </div>
                </form>
                <ModulesMyCalendarMyselfModalNew :isModalOpen="state.modal.isAddEventForMyselfOpen"
                    @close="state.modal.isAddEventForMyselfOpen = false" @refreshSchedules="refreshSchedules" />
                <ModulesMyCalendarCitizenModalNew :isModalOpen="state.modal.isAddEventForCitizenOpen"
                    @close="state.modal.isAddEventForCitizenOpen = false" @refreshSchedules="refreshSchedules" />
                <ModulesMyCalendarEmployeeModalNew :isModalOpen="state.modal.isAddEventForEmployeeOpen"
                    @close="state.modal.isAddEventForEmployeeOpen = false" @refreshSchedules="refreshSchedules" />
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
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshSchedules'])
const { t } = useI18n()

const state = reactive({
    formSelect: {
        selectedType: ''
    },
    modal: {
        isAddEventForCitizenOpen: false,
        isAddEventForEmployeeOpen: false,
        isAddEventForMyselfOpen: false,
    },
    options: {
        userTypes: [
            { value: 'myself', title: 'myself' },
            { value: 'employees', title: 'employees' },
            { value: 'citizens', title: 'citizens' },
        ] as any,
    }
})

const rules = computed(() => {
    return {
        formSelect: {
            selectedType: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        if (state.formSelect.selectedType === 'myself') {
            state.modal.isAddEventForMyselfOpen = true
        } else if (state.formSelect.selectedType === 'citizens') {
            state.modal.isAddEventForCitizenOpen = true
        } else if (state.formSelect.selectedType === 'employees') {
            state.modal.isAddEventForEmployeeOpen = true
        }
    }
}

function closeModal() {
    emit('close')
}

function refreshSchedules() {
    emit('refreshSchedules')
    closeModal()
}
</script>