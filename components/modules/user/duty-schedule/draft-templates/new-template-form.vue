<template>
    <div>
        <form @submit.prevent="submitForm()" id="formTemplate">
            <div class="grid grid-cols-1 gap-y-3">
                <div class="space-y-1">
                    <FormLabel for="name" :label="$t('dutySchedules.draftTemplates.form.name')" />
                    <FormTextField id="name" name="name" :placeholder="$t('dutySchedules.draftTemplates.form.name')"
                        v-model="state.formTemplate.name" />
                    <FormError :error="v$?.formTemplate?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.name?.[0]" />
                </div>

                <div class="space-y-1">
                    <div class="w-fit flex items-center cursor-pointer" @click="state.formTemplate.recurring.is_recurring = !state.formTemplate.recurring.is_recurring">
                        <FormCheckbox :value="state.formTemplate.recurring.is_recurring" />
                        {{ $t('dutySchedules.draftTemplates.form.isRecurring') }}
                    </div>
                </div>

                <div class="space-y-3" v-if="state.formTemplate.recurring.is_recurring">
                    <div class="space-y-1">
                        <FormLabel for="week_rotations" :label="$t('dutySchedules.draftTemplates.form.weekRotations')" />
                        <FormNumberField id="week_rotations" name="week_rotations" v-model="state.formTemplate.recurring.week_rotations" placeholder="0" @input="validateWeekRotationQuantity" />
                        <FormError :error="v$?.formTemplate?.recurring.week_rotations?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.recurring_uuid?.[0]" />
                    </div>
                </div>

            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="emit('closeModal')">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                        {{ props.formType === 'create' ? $t('save') :
                            $t('update') }}
                    </FormButton>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedDraftTemplate: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])
const { t } = useI18n()

interface Option {
    value: string
    label: string
}

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formTemplate: {
        name: '',
        recurring: {
            is_recurring: false,
            week_rotations: '',
        },
    },    
})

onMounted(() => {
    if (props.formType === 'update') {

        state.formTemplate.name = props.selectedDraftTemplate.name
        state.formTemplate.recurring.is_recurring = props.selectedDraftTemplate.recurring.is_recurring
        state.formTemplate.recurring.week_rotations = props.selectedDraftTemplate.recurring.week_rotations
    }
})

const rules = computed(() => {
    if (state.formTemplate.recurring.is_recurring) {
        return {
            formTemplate: {
                name: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                recurring: {
                    week_rotations: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                },
            },
        }
    } else {
        return {
            formTemplate: {
                name: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                recurring: {},
            },
        }
    }
    
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    console.log(v$.value.$error)
    if (!v$.value.$error) {
        console.log(state.formTemplate)
        emit('submitForm', state.formTemplate)
    }
}

function validateWeekRotationQuantity(event: Event) {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 10)
    state.formTemplate.recurring.week_rotations = input.value
}
</script>

<style>
#formTemplate .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>