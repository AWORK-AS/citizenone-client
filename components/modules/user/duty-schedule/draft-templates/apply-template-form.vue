<template>
    <div>
        <form @submit.prevent="submitForm()" id="formTemplate">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?. message && props.error.message. length > 0" />
            <div class="grid grid-cols-1 gap-y-3">
                <div class="space-y-1">
                    <FormLabel for="year" :label="$t('dutySchedules.draftTemplates.form.year')" />
                    <FormSelectMultiple id="year" :options="years" v-model="state.formTemplate.years" />
                    <FormError :error="v$?. formTemplate?.years?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.years?.[0]" />
                </div>

                <div class="space-y-1">
                    <FormLabel :label="$t('dutySchedules.draftTemplates.form.weekNumber')" />
                    <div class="border rounded-md overflow-hidden">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-primary">
                                <tr>
                                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            @change="toggleAllWeeks"
                                            :checked="allWeeksSelected"
                                            class="peer w-5 h-5 appearance-none border bg-white border-primary rounded-sm mr-2 checked:bg-secondary checked:border-secondary focus:ring-0"
                                        />
                                        <span class="pointer-events-none absolute w-5 h-5 flex items-center justify-center">
                                            <Icon name="ph:check-bold" class="h-4 w-4 text-white" />
                                        </span>
                                    </th>
                                    <th scope="col" class="px-4 py-3 text-left font-medium text-white">
                                        {{ $t('dutySchedules.draftTemplates.form.week') }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr v-for="week in weeks" :key="week.value" class="hover:bg-gray-50">
                                    <td class="px-4 py-3 whitespace-nowrap">
                                        <label class="inline-flex items-center cursor-pointer relative">
                                        <input 
                                            type="checkbox" 
                                            :value="week.value"
                                            v-model="state.formTemplate.weeks"
                                            class="peer w-5 h-5 appearance-none border border-primary rounded-sm checked:bg-secondary checked:border-secondary focus:ring-0 cursor-pointer"
                                        />
                                        <span class="pointer-events-none absolute top-0 left-0 w-5 h-5 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
                                            <Icon name="ph:check-bold" class="h-4 w-4 text-white" />
                                        </span>
                                    </label>
                                    </td>
                                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                        {{ week.label }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <FormError :error="v$?.formTemplate?.weeks?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.weeks?.[0]" />
                </div>

            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md: grid-cols-2 gap-3">
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
    return { value: year, label: year }
}) as Option[]

const state = reactive({
    error:  {} as Error,
    isPageLoading: false,
    formTemplate: {
        weeks: [] as string[],
        years:  [] as string[],
    },    
})

const allWeeksSelected = computed(() => {
    return state.formTemplate.weeks. length === weeks.length
})

function toggleAllWeeks(event:  Event) {
    const checked = (event.target as HTMLInputElement).checked
    if (checked) {
        state.formTemplate. weeks = weeks.map(week => week.value)
    } else {
        state.formTemplate. weeks = []
    }
}

const rules = computed(() => {
    return {
        formTemplate: {
            weeks: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            years: {
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

#formTemplate tbody {
    display: block;
    max-height: 15rem;
    overflow-y:  auto;
}

#formTemplate thead, #formTemplate tbody tr {
    display: table;
    width: 100%;
    table-layout: fixed;
}
table th {
    border-bottom-width: 0;
}
</style>