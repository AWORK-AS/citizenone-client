<template>
    <div>
        <Modal size="md" :title="$t('dutySchedules.copy.copyMultipleWeeksSchedule')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-3">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <Alert type="danger" :text="props?.error?.message"
                            v-if="props.error?.message && props.error.message.length > 0" />
                        <form @submit.prevent="handleCopy()" id="formCopy">
                            <div class="space-y-3">
                                <div class="space-y-1" id="source">
                                    <FormLabel for="weeks_source" :label="$t('dutySchedules.copy.weeksSource')" />
                                    <FormSelectMultiple id="weeks_source" name="weeks_source"
                                        :options="state.options.weeks_sources" v-model="state.formCopy.weeks_source" />
                                    <FormError :error="v$?.formCopy?.weeks_source?.$errors[0]?.$message.toString()" />
                                    <FormError :error="props?.error?.errors?.weeks_source?.[0]" />
                                </div>
                                <div class="space-y-1" id="destination">
                                    <FormLabel for="weeks_destination"
                                        :label="$t('dutySchedules.copy.weeksDestination')" />
                                    <FormSelectMultiple id="weeks_destination" name="weeks_destination"
                                        :options="state.options.weeks_destinations"
                                        v-model="state.formCopy.weeks_destination" />
                                    <FormError
                                        :error="v$?.formCopy?.weeks_destination?.$errors[0]?.$message.toString()" />
                                    <FormError :error="props?.error?.errors?.weeks_destination?.[0]" />
                                </div>
                            </div>
                            <div class="mt-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormButton type="button" buttonStyle="cancel" @click="closeModal" :disabled="state.isPageLoading">
                                        {{ $t('cancel') }}
                                    </FormButton>
                                    <FormButton type="submit" buttonStyle="primary" class="w-full" :disabled="state.isPageLoading">
                                        {{ $t('dutySchedules.copy.copy') }}
                                    </FormButton>
                                </div>
                            </div>
                        </form>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { draftScheduleService } from '@/components/api/user/DraftScheduleService'
import type { Error } from '@/types'
import { useDepartmentStore } from '@/store/department'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const { t } = useI18n()
const { successAlert } = useAlert()
const emit = defineEmits(['close', 'saveShift'])
const departmentStore = useDepartmentStore()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formCopy: {
        weeks_source: [],
        weeks_destination: [],
    },
    options: {
        weeks_sources: [] as any,
        weeks_destinations: [] as any,
    }
})

watch(() => props.isModalOpen, (isModalOpen: Boolean) => {
    state.error = {}
    if (isModalOpen) {
        generateWeekSource()
        generateWeekDestination()
    }
})

watch(() => state.formCopy.weeks_source, (selectedSources) => {
    state.options.weeks_destinations = generateFilteredWeekDestinations(selectedSources)
})

const rules = computed(() => {
    return {
        formCopy: {
            weeks_source: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            weeks_destination: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})
const v$ = useVuelidate(rules, state)

function closeModal() {
    if (state.isPageLoading) return
    emit('close')
}

function generateFilteredWeekDestinations(selectedSources: string[]) {
    const months = [
        t('calendar.month.January'),
        t('calendar.month.February'),
        t('calendar.month.March'),
        t('calendar.month.April'),
        t('calendar.month.May'),
        t('calendar.month.June'),
        t('calendar.month.July'),
        t('calendar.month.August'),
        t('calendar.month.September'),
        t('calendar.month.October'),
        t('calendar.month.November'),
        t('calendar.month.December')
    ]
    const weeks = []

    let startWeek = moment().startOf('isoWeek')
    let endWeek = moment().endOf('year').endOf('isoWeek').add(3, 'months')

    while (startWeek.isBefore(endWeek) || startWeek.isSame(endWeek, 'week')) {
        let weekNumber = startWeek.isoWeek()
        let weekYear = startWeek.year()
        let weekEnd = moment(startWeek).endOf('isoWeek')

        let formattedStart = `${startWeek.format('DD.')} ${months[startWeek.month()]} ${startWeek.format('YYYY')}`
        let formattedEnd = `${weekEnd.format('DD.')} ${months[weekEnd.month()]} ${weekEnd.format('YYYY')}`

        let value = `${weekYear} - ${t('dutySchedules.copy.week')} ${weekNumber}`

        // Exclude weeks already selected in source
        if (!selectedSources.includes(value)) {
            weeks.push({
                value,
                label: `${weekYear} - ${t('dutySchedules.copy.week')} ${weekNumber} (${formattedStart} - ${formattedEnd})`,
            })
        }

        startWeek.add(1, 'week')
    }

    return weeks
}


function generateWeekSource() {
    const months = [
        t('calendar.month.January'),
        t('calendar.month.February'),
        t('calendar.month.March'),
        t('calendar.month.April'),
        t('calendar.month.May'),
        t('calendar.month.June'),
        t('calendar.month.July'),
        t('calendar.month.August'),
        t('calendar.month.September'),
        t('calendar.month.October'),
        t('calendar.month.November'),
        t('calendar.month.December')
    ]
    const weeks = []

    let startWeek = moment().startOf('year').startOf('isoWeek').subtract(3, 'months')
    let endWeek = moment().endOf('year').add(1, 'years').endOf('isoWeek')

    while (startWeek.isBefore(endWeek) || startWeek.isSame(endWeek, 'week')) {
        const weekNumber = startWeek.isoWeek()
        const weekYear = startWeek.isoWeekYear() // <-- FIX
        const weekEnd = moment(startWeek).endOf('isoWeek')

        const formattedStart = `${startWeek.format('DD.')} ${months[startWeek.month()]} ${startWeek.format('YYYY')}`
        const formattedEnd = `${weekEnd.format('DD.')} ${months[weekEnd.month()]} ${weekEnd.format('YYYY')}`

        weeks.push({
            value: `${weekYear} - ${t('dutySchedules.copy.week')} ${weekNumber}`,
            label: `${weekYear} - ${t('dutySchedules.copy.week')} ${weekNumber} (${formattedStart} - ${formattedEnd})`,
        })

        startWeek.add(1, 'week')
    }

    state.options.weeks_sources = weeks
}

function generateWeekDestination() {
    const months = [
        t('calendar.month.January'),
        t('calendar.month.February'),
        t('calendar.month.March'),
        t('calendar.month.April'),
        t('calendar.month.May'),
        t('calendar.month.June'),
        t('calendar.month.July'),
        t('calendar.month.August'),
        t('calendar.month.September'),
        t('calendar.month.October'),
        t('calendar.month.November'),
        t('calendar.month.December')
    ]
    const weeks = []

    let startWeek = moment().startOf('isoWeek')
    let endWeek = moment().endOf('year').add(1, 'years').endOf('isoWeek')

    while (startWeek.isBefore(endWeek) || startWeek.isSame(endWeek, 'week')) {
        const weekNumber = startWeek.isoWeek()
        const weekYear = startWeek.isoWeekYear() // <-- FIX
        const weekEnd = moment(startWeek).endOf('isoWeek')

        const formattedStart = `${startWeek.format('DD.')} ${months[startWeek.month()]} ${startWeek.format('YYYY')}`
        const formattedEnd = `${weekEnd.format('DD.')} ${months[weekEnd.month()]} ${weekEnd.format('YYYY')}`

        weeks.push({
            value: `${weekYear} - ${t('dutySchedules.copy.week')} ${weekNumber}`,
            label: `${weekYear} - ${t('dutySchedules.copy.week')} ${weekNumber} (${formattedStart} - ${formattedEnd})`,
        })

        startWeek.add(1, 'week')
    }

    state.options.weeks_destinations = weeks
}

async function handleCopy() {
    v$.value.$validate()
    if (!v$.value.$error) {
        copyWeeklyDutySchedule()
    }
}

async function copyWeeklyDutySchedule() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName,
            weeks_source: state.formCopy.weeks_source,
            weeks_destination: state.formCopy.weeks_destination,
        }
        const response = await draftScheduleService.copyMultipleWeeklyDraftDutySchedule(params)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.alert.scheduleSuccessfullyCopied')}.`)
            state.isPageLoading = false
            closeModal()
            return
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>

<style>
#formCopy #source .multiselect-dropdown {
    max-height: 8rem !important;
}

#formCopy #destination .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>