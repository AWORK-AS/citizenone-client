<template>
    <div>
        <form @submit.prevent="submitForm()" id="formTemplate">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <div class="grid grid-cols-1 gap-y-3">
                <div class="space-y-1">
                    <FormLabel for="year" :label="$t('dutySchedules.draftTemplates.form.year')" />
                    <FormSelectMultiple id="year" :options="years" v-model="state.formTemplate.years" />
                    <FormError :error="v$?.formTemplate?.years?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.years?.[0]" />
                </div>

                <div class="space-y-1">
                    <FormLabel :label="$t('dutySchedules.draftTemplates.form.weekNumber')" />
                    <div class="border rounded-md overflow-hidden">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-primary">
                                <tr>
                                    <th scope="col"
                                        class="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider inline-flex items-center cursor-pointer">
                                        <input type="checkbox" @change="toggleAllWeeks" :checked="allWeeksSelected"
                                            class="peer w-5 h-5 appearance-none border bg-white border-primary rounded-sm mr-2 checked: bg-secondary checked:border-secondary focus:ring-0 cursor-pointer" />
                                        <span
                                            class="pointer-events-none absolute w-5 h-5 flex items-center justify-center">
                                            <Icon name="ph:check-bold" class="h-4 w-4 text-white" />
                                        </span>
                                    </th>
                                    <th scope="col" class="px-4 py-3 text-left font-medium text-white">
                                        {{ $t('dutySchedules.draftTemplates.draftTemplates') }}
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
                                            <input type="checkbox" :value="week.value"
                                                v-model="state.formTemplate.weeks"
                                                @change="handleWeekChange(week.value, $event)"
                                                class="peer w-5 h-5 appearance-none border border-primary rounded-sm checked:bg-secondary checked:border-secondary focus: ring-0 cursor-pointer" />
                                            <span
                                                class="pointer-events-none absolute top-0 left-0 w-5 h-5 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
                                                <Icon name="ph:check-bold" class="h-4 w-4 text-white" />
                                            </span>
                                        </label>
                                    </td>
                                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                        <div class="flex items-center justify-between">
                                            <div v-if="getTemplatesForWeek(week.value).length > 0"
                                                class="flex gap-1 flex-wrap">
                                                <span v-for="template in getTemplatesForWeek(week.value)"
                                                    :key="template.id"
                                                    class="px-2 py-0.5 text-xs rounded-full bg-tertiary text-white"
                                                    :title="template.name">
                                                    {{ template.name }}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                        <div class="flex items-center justify-between">
                                            <span>{{ week.label }}</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <FormError :error="v$?.formTemplate?.weeks?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.weeks?.[0]" />
                </div>

                <div v-if="isNonRecurring" class="space-y-3 pt-3 border-t border-gray-100">
                    <div class="flex items-center gap-3">
                        <label class="inline-flex items-center cursor-pointer relative">
                            <input type="checkbox" v-model="state.formTemplate.copy"
                                class="peer w-5 h-5 appearance-none border border-primary rounded-sm checked:bg-secondary checked:border-secondary focus:ring-0 cursor-pointer" />
                            <span
                                class="pointer-events-none absolute top-0 left-0 w-5 h-5 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
                                <Icon name="ph:check-bold" class="h-4 w-4 text-white" />
                            </span>
                        </label>
                        <span class="text-sm font-medium text-gray-700">{{ $t('dutySchedules.draftTemplates.form.copyToConsecutiveWeeks') }}</span>
                    </div>
                    <div v-if="state.formTemplate.copy" class="space-y-1">
                        <FormLabel for="number_of_weeks" :label="$t('dutySchedules.draftTemplates.form.numberOfWeeks')" />
                        <FormNumberField id="number_of_weeks" name="number_of_weeks"
                            :placeholder="$t('dutySchedules.draftTemplates.form.numberOfWeeks')"
                            :min="2"
                            v-model="state.formTemplate.number_of_weeks" />
                        <FormError :error="v$?.formTemplate?.number_of_weeks?.$errors[0]?.$message.toString()" />
                    </div>
                </div>

            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" @click="emit('closeModal')">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" class="w-full">
                        {{ props.formType === 'create' ? $t('save') : $t('update') }}
                    </FormButton>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers, minValue } from '@vuelidate/validators'
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
    selectedTemplates: {
        type: Array,
        required: false,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])
const { t } = useI18n()

interface Option {
    value: string
    label: string
}

interface Template {
    id: number
    uuid: string
    name: string
    is_recurring: boolean
    recurring_until: string | null
    week_rotations: number
    departments?: any[]
}

interface WeekTemplateMap {
    [weekNumber: string]: Template[]
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
    error: {} as Error,
    isPageLoading: false,
    formTemplate: {
        weeks: [] as string[],
        years: [] as string[],
        copy: false,
        number_of_weeks: '2',
    },
    weekTemplateMap: {} as WeekTemplateMap,
})

const allWeeksSelected = computed(() => {
    return state.formTemplate.weeks.length === weeks.length
})

const isNonRecurring = computed(() => {
    const templates = (props.selectedTemplates && props.selectedTemplates.length > 0)
        ? props.selectedTemplates.map((t: any) => t._custom?.value || t)
        : [props.selectedDraftTemplate]
    return templates.every((t: any) => !t?.is_recurring)
})

function toggleAllWeeks(event: Event) {
    const checked = (event.target as HTMLInputElement).checked

    if (checked) {
        // Get templates - prioritize selectedTemplates array if available
        const templates = (props.selectedTemplates && props.selectedTemplates.length > 0)
            ? props.selectedTemplates.map((t: any) => {
                // Handle if template is wrapped in _custom. value (from your sample data)
                return t._custom?.value || t
            })
            : [props.selectedDraftTemplate]

        // Select all weeks
        state.formTemplate.weeks = weeks.map(week => week.value)

        // Clear weekTemplateMap
        state.weekTemplateMap = {}

        const currentYear = new Date().getFullYear()
        const selectedYear = state.formTemplate.years[0]
            ? parseInt(state.formTemplate.years[0])
            : currentYear

        // For each template, calculate coverage starting from week 1
        templates.forEach((template: any) => {
            const weekRotations = template?.week_rotations || 1
            const recurringUntil = template?.recurring_until
            const startWeek = 1 // Starting from week 1

            let coveredWeeks: number[] = []

            if (recurringUntil) {
                // Calculate weeks until recurring_until date
                const recurringDate = new Date(recurringUntil)
                const recurringWeek = getWeekNumber(recurringDate)

                // If recurring_until is in the same year
                if (recurringDate.getFullYear() === selectedYear) {
                    for (let i = startWeek; i <= Math.min(recurringWeek, 52); i++) {
                        coveredWeeks.push(i)
                    }
                } else if (recurringDate.getFullYear() > selectedYear) {
                    // If recurring_until is in a future year, select all weeks from start to end of year
                    for (let i = startWeek; i <= 52; i++) {
                        coveredWeeks.push(i)
                    }
                } else {
                    // If recurring_until is in the past, just select based on week_rotations
                    for (let i = 0; i < weekRotations; i++) {
                        const targetWeek = startWeek + i
                        if (targetWeek <= 52) {
                            coveredWeeks.push(targetWeek)
                        }
                    }
                }
            } else {
                // Just use week_rotations
                for (let i = 0; i < weekRotations; i++) {
                    const targetWeek = startWeek + i
                    if (targetWeek <= 52) {
                        coveredWeeks.push(targetWeek)
                    }
                }
            }

            // Add template to each covered week
            coveredWeeks.forEach(weekNum => {
                const weekStr = String(weekNum)
                if (!state.weekTemplateMap[weekStr]) {
                    state.weekTemplateMap[weekStr] = []
                }

                const exists = state.weekTemplateMap[weekStr].some((t: any) => t.id === template.id)
                if (!exists) {
                    state.weekTemplateMap[weekStr].push(template)
                }
            })
        })
    } else {
        state.formTemplate.weeks = []
        state.weekTemplateMap = {}
    }
}

function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
    return weekNum
}

function calculateTemplateCoverage(
    template: Template,
    startWeek: number,
    selectedYear: number
): number[] {
    const coveredWeeks: number[] = []
    const weekRotations = template.week_rotations || 1
    const recurringUntil = template.recurring_until

    if (recurringUntil) {
        const recurringDate = new Date(recurringUntil)
        const recurringWeek = getWeekNumber(recurringDate)
        const recurringYear = recurringDate.getFullYear()

        if (recurringYear === selectedYear) {
            for (let i = startWeek; i <= Math.min(recurringWeek, 52); i++) {
                coveredWeeks.push(i)
            }
        } else if (recurringYear > selectedYear) {
            for (let i = startWeek; i <= 52; i++) {
                coveredWeeks.push(i)
            }
        } else {
            for (let i = 0; i < weekRotations; i++) {
                const targetWeek = startWeek + i
                if (targetWeek <= 52) {
                    coveredWeeks.push(targetWeek)
                }
            }
        }
    } else {
        for (let i = 0; i < weekRotations; i++) {
            const targetWeek = startWeek + i
            if (targetWeek <= 52) {
                coveredWeeks.push(targetWeek)
            }
        }
    }

    return coveredWeeks
}

// Update the week-template mapping
function updateWeekTemplateMap(weekNumber: number, templates: Template[]) {
    const currentYear = new Date().getFullYear()
    const selectedYear = state.formTemplate.years[0]
        ? parseInt(state.formTemplate.years[0])
        : currentYear

    const allCoveredWeeks = new Set<number>()

    templates.forEach(template => {
        const coveredWeeks = calculateTemplateCoverage(template, weekNumber, selectedYear)
        coveredWeeks.forEach(week => allCoveredWeeks.add(week))
    })

    allCoveredWeeks.forEach(week => {
        const weekStr = String(week)
        if (!state.weekTemplateMap[weekStr]) {
            state.weekTemplateMap[weekStr] = []
        }

        templates.forEach(template => {
            const coveredByThisTemplate = calculateTemplateCoverage(template, weekNumber, selectedYear)
            if (coveredByThisTemplate.includes(week)) {
                const exists = state.weekTemplateMap[weekStr].some(t => t.id === template.id)
                if (!exists) {
                    state.weekTemplateMap[weekStr].push(template)
                }
            }
        })
    })
}

// Remove template from week mapping when unchecking
function removeFromWeekTemplateMap(weekNumber: number, templates: Template[]) {
    const currentYear = new Date().getFullYear()
    const selectedYear = state.formTemplate.years[0]
        ? parseInt(state.formTemplate.years[0])
        : currentYear

    templates.forEach(template => {
        const coveredWeeks = calculateTemplateCoverage(template, weekNumber, selectedYear)
        coveredWeeks.forEach(week => {
            const weekStr = String(week)
            if (state.weekTemplateMap[weekStr]) {
                state.weekTemplateMap[weekStr] = state.weekTemplateMap[weekStr].filter(
                    t => t.id !== template.id
                )
                if (state.weekTemplateMap[weekStr].length === 0) {
                    delete state.weekTemplateMap[weekStr]
                }
            }
        })
    })
}

function handleWeekChange(weekValue: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked
    const weekNumber = parseInt(weekValue)

    const templates = (props.selectedTemplates && props.selectedTemplates.length > 0)
        ? props.selectedTemplates.map((t: any) => {
            return t._custom?.value || t
        })
        : [props.selectedDraftTemplate]

    nextTick(() => {
        if (checked) {
            const allWeeksToSelect = new Set<number>()

            templates.forEach((template: Template) => {
                const currentYear = new Date().getFullYear()
                const selectedYear = state.formTemplate.years[0]
                    ? parseInt(state.formTemplate.years[0])
                    : currentYear

                const coveredWeeks = calculateTemplateCoverage(template, weekNumber, selectedYear)
                coveredWeeks.forEach(week => allWeeksToSelect.add(week))
            })

            const weeksToSelect = Array.from(allWeeksToSelect).map(w => String(w))

            updateWeekTemplateMap(weekNumber, templates)

            const newWeeks = [...new Set([...state.formTemplate.weeks, ...weeksToSelect])]
            state.formTemplate.weeks = newWeeks.sort((a, b) => parseInt(a) - parseInt(b))
        } else {
            removeFromWeekTemplateMap(weekNumber, templates)

            state.formTemplate.weeks = state.formTemplate.weeks.filter(w => w !== weekValue)

            const coveredByOtherSelections = new Set<string>()
            state.formTemplate.weeks.forEach(week => {
                if (state.weekTemplateMap[week] && state.weekTemplateMap[week].length > 0) {
                    coveredByOtherSelections.add(week)
                }
            })

            state.formTemplate.weeks = state.formTemplate.weeks.filter(w =>
                coveredByOtherSelections.has(w)
            )
        }
    })
}

function getTemplatesForWeek(weekNumber: string): Template[] {
    return state.weekTemplateMap[weekNumber] || []
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
            ...(state.formTemplate.copy ? {
                number_of_weeks: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    minValue: helpers.withMessage(`${t('validation.minValue', { min: 2 })}.`, minValue(2)),
                },
            } : {}),
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', {
            ...state.formTemplate,
            copy: state.formTemplate.copy || null,
            number_of_weeks: state.formTemplate.copy ? Number(state.formTemplate.number_of_weeks) : null,
            weekTemplateMap: state.weekTemplateMap
        })
    }
}
</script>

<style>
#formTemplate .multiselect-dropdown {
    max-height: 5rem ! important;
}

#formTemplate tbody {
    display: block;
    max-height: 15rem;
    overflow-y: auto;
}

#formTemplate thead,
#formTemplate tbody tr {
    display: table;
    width: 100%;
    table-layout: fixed;
}

table th {
    border-bottom-width: 0;
}
</style>