<template>
    <!-- The citizen's granted hours a week split on the employees: each one's
         hours, what they have booked in the calendar and used, and what is not
         yet given to anyone. Only when the company uses hours a week. -->
    <section v-if="state.week?.enabled" class="mt-4 rounded-xl ring-1 ring-gray-200 p-4"
        aria-labelledby="distribution-heading">
        <div class="flex flex-wrap items-center gap-2">
            <Icon name="ph:users-three" class="size-5 text-tertiary" aria-hidden="true" />
            <h3 id="distribution-heading" class="font-semibold text-gray-900">
                {{ $t('citizens.interventionHours.distribution.title', { week: state.week.week_number }) }}
            </h3>
            <div class="ml-auto flex items-center gap-1">
                <button type="button" class="rounded-md p-1 text-gray-500 hover:bg-gray-100"
                    :aria-label="$t('citizens.interventionHours.distribution.previousWeek')" @click="moveWeek(-1)">
                    <Icon name="ph:caret-left" class="size-4" aria-hidden="true" />
                </button>
                <span class="text-xs text-gray-500 tabular-nums">
                    {{ formatDateToReadable(state.week.week_start) }} - {{ formatDateToReadable(state.week.week_end) }}
                </span>
                <button type="button" class="rounded-md p-1 text-gray-500 hover:bg-gray-100"
                    :aria-label="$t('citizens.interventionHours.distribution.nextWeek')" @click="moveWeek(1)">
                    <Icon name="ph:caret-right" class="size-4" aria-hidden="true" />
                </button>
            </div>
        </div>

        <p class="mt-2 text-sm tabular-nums" :class="{
            'text-red-600': status === 'over',
            'text-green-700': status === 'done',
            'text-gray-600': status !== 'over' && status !== 'done',
        }">
            <template v-if="state.week.granted_hours !== null">
                {{ $t('citizens.interventionHours.distribution.summary', {
                    granted: hours(state.week.granted_hours),
                    distributed: hours(state.week.distributed_hours),
                }) }}
                <span class="font-medium">{{ statusText }}</span>
            </template>
            <template v-else>
                {{ $t('citizens.interventionHours.distribution.noGrant', { distributed: hours(state.week.distributed_hours) }) }}
            </template>
        </p>

        <Alert v-if="state.error?.message" type="danger" class="mt-2" :text="state.error.message" />

        <div class="mt-3 overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead>
                    <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
                        <th class="py-2 pr-3 font-medium">{{ $t('citizens.interventionHours.distribution.employee') }}</th>
                        <th class="py-2 pr-3 font-medium">{{ $t('citizens.interventionHours.distribution.given') }}</th>
                        <th class="py-2 pr-3 font-medium">{{ $t('citizens.interventionHours.distribution.booked') }}</th>
                        <th class="py-2 pr-3 font-medium">{{ $t('citizens.interventionHours.distribution.notBooked') }}</th>
                        <th class="py-2 pr-3 font-medium">{{ $t('citizens.interventionHours.distribution.used') }}</th>
                        <th class="py-2 font-medium">{{ $t('citizens.interventionHours.distribution.left') }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="row in state.week.employees" :key="row.user_uuid">
                        <td class="py-2 pr-3 text-gray-800">{{ [row.firstname, row.lastname].filter(Boolean).join(' ') }}</td>
                        <td class="py-2 pr-3 tabular-nums">
                            <form v-if="canEdit" class="flex items-center gap-1" @submit.prevent="saveHours(row.user_uuid)">
                                <input v-model="state.drafts[row.user_uuid]" inputmode="decimal"
                                    class="w-16 rounded-md border-0 px-2 py-1 text-sm tabular-nums ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary"
                                    :aria-label="$t('citizens.interventionHours.distribution.givenFor', { name: row.firstname })"
                                    @blur="saveHours(row.user_uuid)" />
                                <span class="text-xs text-gray-500">t</span>
                            </form>
                            <span v-else>{{ row.weekly_hours !== null ? `${hours(row.weekly_hours)} t` : '-' }}</span>
                        </td>
                        <td class="py-2 pr-3 tabular-nums">{{ hours(row.planned_hours) }} t</td>
                        <td class="py-2 pr-3 tabular-nums" :class="{ 'text-red-600': (row.unplanned_hours ?? 0) < 0 }">
                            {{ row.unplanned_hours !== null ? `${hours(row.unplanned_hours)} t` : '-' }}
                        </td>
                        <td class="py-2 pr-3 tabular-nums">{{ hours(row.used_hours) }} t</td>
                        <td class="py-2 tabular-nums" :class="{ 'text-red-600': (row.remaining_hours ?? 0) < 0 }">
                            {{ row.remaining_hours !== null ? `${hours(row.remaining_hours)} t` : '-' }}
                        </td>
                    </tr>
                    <tr v-if="!state.week.employees.length">
                        <td colspan="6" class="py-3 text-sm text-gray-500">{{ $t('citizens.interventionHours.distribution.empty') }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Give hours to an employee not yet on the citizen: assigns them too. -->
        <form v-if="canEdit && employeeOptions.length" class="mt-3 flex flex-wrap items-end gap-2" @submit.prevent="addEmployee">
            <div class="min-w-[14rem] flex-1 space-y-1">
                <FormLabel for="distribution_employee" :label="$t('citizens.interventionHours.distribution.addEmployee')" />
                <FormSelect id="distribution_employee" :options="employeeOptions" v-model="state.newEmployee" />
            </div>
            <div class="w-28 space-y-1">
                <FormLabel for="distribution_hours" :label="$t('citizens.interventionHours.distribution.hoursAWeek')" />
                <FormTextField id="distribution_hours" name="distribution_hours" inputmode="decimal" v-model="state.newHours" />
            </div>
            <FormButton type="submit" buttonStyle="action" :disabled="!state.newEmployee || state.isSaving">
                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                {{ $t('citizens.interventionHours.distribution.add') }}
            </FormButton>
        </form>
    </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { interventionHoursService } from '@/components/api/user/InterventionHoursService'
import { employeeService } from '@/components/api/user/EmployeeService'
import { distributionStatus, formatWeekHours, parseWeeklyHours, shiftWeekDate } from '@/composables/citizenWeeklyHours'
import { usePermissions } from '@/composables/usePermissions'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import moment from 'moment'

type DistributionRow = {
    user_uuid: string
    firstname: string | null
    lastname: string | null
    weekly_hours: number | null
    planned_hours: number
    unplanned_hours: number | null
    used_hours: number
    remaining_hours: number | null
}

const props = defineProps({
    citizenUuid: {
        type: String,
        required: true,
    },
})
const { t, locale } = useI18n()
const { isAtLeast, can } = usePermissions()
const { formatDateToReadable } = useDatetimeFormatter()

// Giving out hours makes the employee a contact on the citizen: the same gate.
const canEdit = computed(() => isAtLeast('Admin') || can('create_citizen_contact'))

const state = reactive({
    date: moment().format('YYYY-MM-DD'),
    week: null as null | {
        enabled: boolean, week_number: number, week_start: string, week_end: string,
        granted_hours: number | null, distributed_hours: number, undistributed_hours: number | null,
        employees: DistributionRow[],
    },
    drafts: {} as Record<string, string>,
    employees: [] as { value: string, label: string }[],
    newEmployee: '' as string,
    newHours: '' as string,
    isSaving: false,
    error: {} as any,
})

const hours = (value: number) => formatWeekHours(value, locale.value)
const status = computed(() => distributionStatus(state.week?.undistributed_hours))
const statusText = computed(() => {
    const rest = state.week?.undistributed_hours ?? 0
    if (status.value === 'over') return t('citizens.interventionHours.distribution.over', { hours: hours(Math.abs(rest)) })
    if (status.value === 'done') return t('citizens.interventionHours.distribution.done')

    return t('citizens.interventionHours.distribution.open', { hours: hours(rest) })
})
const employeeOptions = computed(() => {
    const onCitizen = new Set((state.week?.employees ?? []).map(row => row.user_uuid))

    return state.employees.filter(option => !onCitizen.has(option.value))
})

async function load() {
    state.error = {}
    try {
        const response = await interventionHoursService.getDistribution(props.citizenUuid, { date: state.date })
        state.week = response?.data ?? null
        state.drafts = Object.fromEntries((state.week?.employees ?? [])
            .map(row => [row.user_uuid, row.weekly_hours !== null ? hours(row.weekly_hours) : '']))
    } catch (error: any) {
        state.error = error
    }
}

async function loadEmployees() {
    if (!canEdit.value || state.employees.length) return
    try {
        const response = await employeeService.getEmployees({})
        state.employees = (response?.data ?? []).map((item: any) => ({
            value: item.uuid,
            label: `${item.firstname}${item.lastname ? ' ' + item.lastname : ''}`,
        }))
    } catch (error: any) {
        state.error = error
    }
}

function moveWeek(weeks: number) {
    state.date = shiftWeekDate(state.date, weeks)
    load()
}

async function assign(userUuid: string, weeklyHours: number | null) {
    state.isSaving = true
    state.error = {}
    try {
        await employeeService.assignCitizen(userUuid, { citizen_uuid: props.citizenUuid, weekly_hours: weeklyHours })
        await load()
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

async function saveHours(userUuid: string) {
    const row = state.week?.employees.find(entry => entry.user_uuid === userUuid)
    const value = parseWeeklyHours(state.drafts[userUuid])
    if (!row || value === row.weekly_hours) return
    if (value !== null && (value < 0 || value > 168)) {
        state.error = { message: t('employees.citizens.weeklyHoursInvalid') }
        return
    }
    await assign(userUuid, value)
}

async function addEmployee() {
    const value = parseWeeklyHours(state.newHours)
    if (value !== null && (value < 0 || value > 168)) {
        state.error = { message: t('employees.citizens.weeklyHoursInvalid') }
        return
    }
    await assign(state.newEmployee, value)
    state.newEmployee = ''
    state.newHours = ''
}

onMounted(() => {
    load()
    loadEmployees()
})

defineExpose({ load })
</script>
