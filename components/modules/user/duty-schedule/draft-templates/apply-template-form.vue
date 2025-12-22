<template>
    <div>
        <form @submit.prevent="submitForm()" id="formTemplate">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?. message && props.error.message. length > 0" />
            <div class="grid grid-cols-1 gap-y-3">
                <div class="space-y-1">
                    <FormLabel for="week_number" :label="$t('dutySchedules.draftTemplates.form.weekNumber')" />
                    <FormSelectMultiple id="week_number" :options="weeks" v-model="state.formTemplate.week_number" />
                    <FormError :error="v$?.formTemplate?. week_number?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?. week_number?.[0]" />
                </div>

                <div class="space-y-1">
                    <FormLabel for="year" :label="$t('dutySchedules.draftTemplates.form.year')" />
                    <FormSelectMultiple id="year" :options="years" v-model="state.formTemplate.year" />
                    <FormError :error="v$?.formTemplate?.year?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?. error?.errors?.year?.[0]" />
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
        type:  Object,
        required: false,
    },
    formType:  {
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

const weeks = Array.from({ length: 52 }, (_, i) => {
    const week = String(i + 1)
    return { value: week, label: t('dutySchedules.draftTemplates.form.week') + ' ' + week }
}) as Option[]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 20 }, (_, i) => {
    const year = String(currentYear + i)
    return { value: year, label:  year }
}) as Option[]

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formTemplate: {
        week_number: [] as string[],
        year: [] as string[],
    },    
})

const rules = computed(() => {
    return {
        formTemplate:  {
            week_number: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            year: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formTemplate)
    }
}
</script>

<style>
#formTemplate .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>