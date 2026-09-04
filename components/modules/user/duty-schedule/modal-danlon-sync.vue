<template>
    <DialogGeneric
        :isModalOpen="isModalOpen"
        modalTitle=""
        modalSize="2xl"
        @close="handleClose">
        <template #content>
            <div class="p-6">
                <!-- Header -->
                <div class="mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">{{ $t('dutySchedules.danlon_sync') }}</h2>
                    <p class="mt-2 text-sm text-gray-600">{{ $t('dutySchedules.danlon_sync_description') }}</p>
                </div>

                <!-- Step Indicator -->
                <div class="mb-8">
                    <nav class="flex justify-between">
                        <button
                            v-for="(step, index) in steps"
                            :key="step.id"
                            :class="[
                                'flex-1 px-4 py-2 text-sm font-medium border-b-2',
                                state.syncStep === step.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-gray-300 text-gray-500 hover:text-gray-700'
                            ]"
                            @click="canNavigateToStep(step.id) && (state.syncStep = step.id)">
                            <span class="mr-2">{{ index + 1 }}.</span>
                            {{ step.label }}
                        </button>
                    </nav>
                </div>

                <!-- Step 1: Configure -->
                <div v-if="state.syncStep === 'configure'" class="space-y-6">
                    <!-- Date Range -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            {{ $t('dutySchedules.danlon_date_range') }}
                        </label>
                        <FormDateRangeField
                            v-model="state.syncDateRange"
                            :placeholder="$t('dutySchedules.danlon_select_date_range')"
                            class="w-full"
                        />
                    </div>

                    <!-- Pay Period Quick Selects -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            {{ $t('dutySchedules.danlon_pay_period') }}
                        </label>
                        <div class="flex flex-wrap gap-2">
                            <button
                                v-for="period in payPeriodTypes"
                                :key="period.value"
                                :class="[
                                    'px-4 py-2 text-sm font-medium rounded-md border',
                                    state.selectedPayPeriodType === period.value
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                ]"
                                @click="applyPayPeriodDateRange(period.value)">
                                {{ period.label }}
                            </button>
                        </div>
                    </div>

                    <!-- Presets -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            {{ $t('dutySchedules.danlon_presets') }}
                        </label>
                        <div class="flex gap-2">
                            <select
                                v-model="state.selectedPresetIndex"
                                class="flex-1 rounded-md border-gray-300"
                                @change="applyPreset">
                                <option :value="-1">{{ $t('dutySchedules.danlon_no_preset') }}</option>
                                <option
                                    v-for="(preset, index) in state.savedPresets"
                                    :key="index"
                                    :value="index">
                                    {{ preset.name }}
                                </option>
                            </select>
                            <button
                                v-if="state.selectedPresetIndex === -1"
                                :disabled="!canSavePreset"
                                class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                                @click="showSavePresetInput = true">
                                Save
                            </button>
                            <button
                                v-else
                                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                @click="updatePreset">
                                Update
                            </button>
                            <button
                                v-if="state.selectedPresetIndex >= 0"
                                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                                @click="deletePreset">
                                Delete
                            </button>
                        </div>
                        <div v-if="showSavePresetInput" class="mt-2 flex gap-2">
                            <input
                                v-model="state.newPresetName"
                                type="text"
                                :placeholder="$t('dutySchedules.danlon_preset_name_placeholder')"
                                class="flex-1 rounded-md border-gray-300"
                                @keyup.enter="saveCurrentAsPreset"
                            />
                            <button
                                class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                                @click="saveCurrentAsPreset">
                                Save
                            </button>
                            <button
                                class="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
                                @click="showSavePresetInput = false">
                                Cancel
                            </button>
                        </div>
                    </div>

                    <!-- Employee Selection -->
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <label class="block text-sm font-medium text-gray-700">
                                {{ $t('dutySchedules.danlon_select_employees') }}
                            </label>
                            <div class="flex items-center gap-4">
                                <label class="flex items-center text-sm">
                                    <input
                                        v-model="state.showSelectedOnly"
                                        type="checkbox"
                                        class="rounded border-gray-300 mr-2"
                                    />
                                    {{ $t('dutySchedules.danlon_selected_only') }}
                                </label>
                            </div>
                        </div>
                        <input
                            v-model="state.employeeSearchQuery"
                            type="text"
                            :placeholder="$t('dutySchedules.danlon_search_employees')"
                            class="w-full mb-2 rounded-md border-gray-300"
                        />
                        <div class="mb-2">
                            <label class="flex items-center text-sm font-medium">
                                <input
                                    type="checkbox"
                                    :checked="allMatchedSelected"
                                    :indeterminate="someMatchedSelected && !allMatchedSelected"
                                    class="rounded border-gray-300 mr-2"
                                    @change="toggleSelectAll"
                                />
                                {{ $t('dutySchedules.danlon_select_all') }}
                            </label>
                        </div>
                        <div class="border rounded-md max-h-64 overflow-y-auto">
                            <div v-if="filteredEmployees.length === 0" class="p-4 text-center text-gray-500">
                                {{ $t('dutySchedules.danlon_no_employees_found') }}
                            </div>
                            <label
                                v-for="emp in filteredEmployees"
                                :key="emp.uuid"
                                class="flex items-center p-3 hover:bg-gray-50 border-b last:border-b-0">
                                <input
                                    type="checkbox"
                                    v-model="emp.selected"
                                    :disabled="!emp.matchedDanlonId"
                                    class="rounded border-gray-300 mr-3"
                                />
                                <div class="flex-1">
                                    <span class="text-sm font-medium text-gray-900">
                                        {{ emp.firstname }} {{ emp.lastname }}
                                    </span>
                                    <span v-if="emp.email" class="text-xs text-gray-500 ml-2">
                                        {{ emp.email }}
                                    </span>
                                </div>
                                <span
                                    v-if="!emp.matchedDanlonId"
                                    v-tooltip="$t('dutySchedules.danlon_no_match_info')"
                                    class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                                    {{ $t('dutySchedules.danlon_no_match_badge') }}
                                </span>
                            </label>
                        </div>
                    </div>

                    <!-- Navigation -->
                    <div class="flex justify-between pt-4 border-t">
                        <button
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            @click="handleClose">
                            Cancel
                        </button>
                        <button
                            :disabled="!canProceedFromConfigure"
                            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            @click="proceedToAssignRates">
                            Next
                        </button>
                    </div>
                </div>

                <!-- Step 2: Assign Rates -->
                <div v-if="state.syncStep === 'assign-rates'" class="space-y-6">
                    <div>
                        <p class="text-sm text-gray-600 mb-4">{{ $t('dutySchedules.danlon_assign_rates_description') }}</p>
                        <div
                            v-tooltip="$t('dutySchedules.danlon_assign_rates_info')"
                            class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start">
                            <Icon name="ph:info" class="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                            <p class="text-sm text-blue-900">{{ $t('dutySchedules.danlon_assign_rates_info') }}</p>
                        </div>
                    </div>

                    <!-- Shift Types -->
                    <div>
                        <h3 class="text-lg font-medium text-gray-900 mb-3">Shift Types</h3>
                        <div class="space-y-2">
                            <div
                                v-for="empData in state.employeeShiftTypes"
                                :key="empData.employeeUuid"
                                class="border rounded-md p-3">
                                <div class="font-medium text-sm text-gray-700 mb-2">
                                    {{ empData.employeeName }}
                                </div>
                                <div class="space-y-2">
                                    <div
                                        v-for="st in empData.shiftTypes"
                                        :key="st.name"
                                        class="flex items-center gap-3">
                                        <div class="flex-1 text-sm text-gray-900">
                                            {{ st.name }}
                                            <span class="text-xs text-gray-500">
                                                ({{ st.shiftCount }} {{ st.shiftCount === 1 ? 'shift' : 'shifts' }})
                                            </span>
                                        </div>
                                        <select
                                            v-model="st.selectedSalaryTypeId"
                                            :class="[
                                                'w-64 rounded-md',
                                                !st.selectedSalaryTypeId ? 'border-red-300' : 'border-gray-300'
                                            ]">
                                            <option :value="null">{{ $t('dutySchedules.danlon_select_rate') }}</option>
                                            <option
                                                v-for="salType in empData.availableSalaryTypes"
                                                :key="salType.id"
                                                :value="salType.id">
                                                {{ salType.name }} ({{ salType.code }})
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Supplement Types -->
                    <div v-if="state.employeeSupplementTypes.length > 0">
                        <h3 class="text-lg font-medium text-gray-900 mb-3">
                            {{ $t('dutySchedules.danlon_supplement_rates_title') }}
                        </h3>
                        <p class="text-sm text-gray-600 mb-3">{{ $t('dutySchedules.danlon_supplement_rates_description') }}</p>
                        <div class="space-y-2">
                            <div
                                v-for="empData in state.employeeSupplementTypes"
                                :key="empData.employeeUuid"
                                class="border rounded-md p-3">
                                <div class="font-medium text-sm text-gray-700 mb-2">
                                    {{ empData.employeeName }}
                                </div>
                                <div class="space-y-2">
                                    <div
                                        v-for="supp in empData.supplements"
                                        :key="supp.name"
                                        class="flex items-center gap-3">
                                        <div class="flex-1 text-sm text-gray-900">
                                            {{ supp.name }}
                                            <span class="text-xs text-gray-500">
                                                ({{ supp.count }} {{ supp.count === 1 ? $t('dutySchedules.danlon_entry') : $t('dutySchedules.danlon_entries') }})
                                            </span>
                                        </div>
                                        <select
                                            v-model="supp.selectedSupplementTypeId"
                                            :class="[
                                                'w-64 rounded-md',
                                                !supp.selectedSupplementTypeId ? 'border-red-300' : 'border-gray-300'
                                            ]">
                                            <option :value="null">{{ $t('dutySchedules.danlon_select_rate') }}</option>
                                            <option
                                                v-for="suppType in empData.availableSupplementTypes"
                                                :key="suppType.id"
                                                :value="suppType.id">
                                                {{ suppType.name }} ({{ suppType.code }})
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Navigation -->
                    <div class="flex justify-between pt-4 border-t">
                        <button
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            @click="state.syncStep = 'configure'">
                            Back
                        </button>
                        <button
                            :disabled="!allTypesAssigned"
                            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            @click="proceedToReview">
                            Next
                        </button>
                    </div>
                </div>

                <!-- Step 3: Review -->
                <div v-if="state.syncStep === 'review'" class="space-y-6">
                    <div>
                        <p class="text-sm text-gray-600">
                            {{ $t('dutySchedules.danlon_review_description', { count: totalRegistrationsCount }) }}
                        </p>
                    </div>

                    <!-- Employee Groups -->
                    <div class="border rounded-md divide-y max-h-96 overflow-y-auto">
                        <div
                            v-for="group in employeeRegistrationGroups"
                            :key="group.employeeUuid"
                            class="p-4">
                            <div
                                class="flex items-center justify-between cursor-pointer"
                                @click="toggleExpandEmployee(group.employeeUuid)">
                                <div class="flex-1">
                                    <div class="font-medium text-gray-900">{{ group.employeeName }}</div>
                                    <div class="text-sm text-gray-500">
                                        {{ group.shiftCount }} {{ $t('dutySchedules.danlon_shifts') }},
                                        {{ group.supplementCount }} {{ $t('dutySchedules.danlon_supplements') }}
                                    </div>
                                </div>
                                <Icon
                                    :name="state.expandedEmployees.has(group.employeeUuid) ? 'ph:caret-up' : 'ph:caret-down'"
                                    class="h-5 w-5 text-gray-400"
                                />
                            </div>

                            <!-- Expanded Details -->
                            <div v-if="state.expandedEmployees.has(group.employeeUuid)" class="mt-4 space-y-4">
                                <!-- Shift Registrations -->
                                <div v-if="group.shiftRegistrations.length > 0">
                                    <h4 class="text-sm font-medium text-gray-700 mb-2">Shifts</h4>
                                    <table class="min-w-full text-sm">
                                        <thead class="bg-gray-50">
                                            <tr>
                                                <th class="px-3 py-2 text-left">Date</th>
                                                <th class="px-3 py-2 text-left">Type</th>
                                                <th class="px-3 py-2 text-right">Hours</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y">
                                            <tr v-for="(reg, idx) in group.shiftRegistrations" :key="idx">
                                                <td class="px-3 py-2">{{ reg.date }}</td>
                                                <td class="px-3 py-2">{{ reg.shiftTypeName }}</td>
                                                <td class="px-3 py-2 text-right">{{ reg.hours.toFixed(2) }}{{ $t('dutySchedules.danlon_hours_let') }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <!-- Supplement Registrations -->
                                <div v-if="group.supplementRegistrations.length > 0">
                                    <h4 class="text-sm font-medium text-gray-700 mb-2">Supplements</h4>
                                    <table class="min-w-full text-sm">
                                        <thead class="bg-gray-50">
                                            <tr>
                                                <th class="px-3 py-2 text-left">Date</th>
                                                <th class="px-3 py-2 text-left">Type</th>
                                                <th class="px-3 py-2 text-right">Units</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y">
                                            <tr v-for="(reg, idx) in group.supplementRegistrations" :key="idx">
                                                <td class="px-3 py-2">{{ reg.date }}</td>
                                                <td class="px-3 py-2">{{ reg.supplementName }}</td>
                                                <td class="px-3 py-2 text-right">{{ reg.units }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Progress Overlay -->
                    <div v-if="state.isSyncing" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div class="bg-white rounded-lg p-6 max-w-md w-full">
                            <div class="text-center">
                                <Icon name="ph:spinner" class="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                                <p class="text-lg font-medium text-gray-900">{{ state.syncProgress.phase }}</p>
                                <p class="text-sm text-gray-600 mt-2">
                                    {{ state.syncProgress.current }} / {{ state.syncProgress.total }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Navigation -->
                    <div class="flex justify-between pt-4 border-t">
                        <button
                            :disabled="state.isSyncing"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            @click="state.syncStep = 'assign-rates'">
                            Back
                        </button>
                        <button
                            :disabled="state.isSyncing || totalRegistrationsCount === 0"
                            class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                            @click="executeSync">
                            Sync {{ totalRegistrationsCount }} {{ $t('dutySchedules.danlon_registrations') }}
                        </button>
                    </div>
                </div>

                <!-- Step 4: Result -->
                <div v-if="state.syncStep === 'result'" class="space-y-6">
                    <div class="text-center py-8">
                        <Icon
                            :name="overallSuccess ? 'ph:check-circle' : hasPartialSuccess ? 'ph:warning-circle' : 'ph:x-circle'"
                            :class="[
                                'h-16 w-16 mx-auto mb-4',
                                overallSuccess ? 'text-green-600' : hasPartialSuccess ? 'text-yellow-600' : 'text-red-600'
                            ]"
                        />
                        <h3 class="text-lg font-medium text-gray-900">
                            {{ overallSuccess ? $t('dutySchedules.danlon_sync_success') : hasPartialSuccess ? $t('dutySchedules.danlon_sync_partial') : $t('dutySchedules.danlon_sync_failed') }}
                        </h3>
                    </div>

                    <!-- Results List -->
                    <div class="border rounded-md divide-y max-h-96 overflow-y-auto">
                        <div
                            v-for="(result, idx) in state.syncResult"
                            :key="idx"
                            class="p-4 flex items-center gap-3">
                            <Icon
                                :name="result.success ? 'ph:check-circle' : 'ph:x-circle'"
                                :class="[
                                    'h-5 w-5',
                                    result.success ? 'text-green-600' : 'text-red-600'
                                ]"
                            />
                            <div class="flex-1">
                                <div class="font-medium text-sm text-gray-900">{{ result.employeeName }}</div>
                                <div class="text-xs text-gray-500">
                                    {{ result.type }} ({{ result.count }})
                                </div>
                            </div>
                            <div
                                v-if="!result.success && result.error"
                                v-tooltip="result.error"
                                class="text-xs text-red-600 cursor-help">
                                Error
                            </div>
                        </div>
                    </div>

                    <!-- Navigation -->
                    <div class="flex justify-end pt-4 border-t">
                        <button
                            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            @click="handleClose">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </template>
    </DialogGeneric>
</template>

<script setup lang="ts">
import { reactive, computed, watch, onMounted, ref } from 'vue'
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { useAlert } from '@/composables/alert'
import { danlonService } from '@/components/api/user/DanlonService'
import { dutyScheduleService } from '@/components/api/user/DutyScheduleService'
import { extraHoursService } from '@/components/api/user/ExtraHoursService'

const { t, locale } = useI18n()
const { successAlert, errorAlert } = useAlert()

// Helper to parse error messages
function parseError(error: any): string {
    if (typeof error === 'string') return error
    if (error?.message) return error.message
    if (error?.data?.message) return error.data.message
    if (error?.statusMessage) return error.statusMessage
    return t('dutySchedules.danlon_sync_failed')
}

const props = defineProps<{
    isModalOpen: boolean
    scheduleEmployees: any[]
    departmentName: string
}>()

const emit = defineEmits<{
    (e: 'close'): void
}>()

const steps = computed(() => [
    { id: 'configure', label: t('dutySchedules.danlon_step_configure') },
    { id: 'assign-rates', label: t('dutySchedules.danlon_step_assign_rates') },
    { id: 'review', label: t('dutySchedules.danlon_step_review') },
    { id: 'result', label: t('dutySchedules.danlon_step_result') },
])

const payPeriodTypes = computed(() => [
    { value: 'custom', label: t('dutySchedules.danlon_custom_period') },
    { value: 'monthly', label: t('dutySchedules.danlon_period_monthly') },
    { value: 'weekly', label: t('dutySchedules.danlon_period_weekly') },
    { value: 'biweekly', label: t('dutySchedules.danlon_period_biweekly') },
])

const state = reactive({
    syncStep: 'configure' as 'configure' | 'assign-rates' | 'review' | 'result',
    syncDateRange: [] as any[],
    selectedPayPeriodType: 'custom',
    scheduleEmployees: [] as any[],
    employeeSearchQuery: '',
    showSelectedOnly: false,
    danlonEmployees: [] as any[],
    salaryTypesRaw: [] as any[],
    supplementTypesRaw: [] as any[],
    employeeShiftTypes: [] as any[],
    employeeSupplementTypes: [] as any[],
    registrationsPreview: [] as any[],
    supplementRegistrationsPreview: [] as any[],
    expandedEmployees: new Set<string>(),
    savedPresets: [] as any[],
    selectedPresetIndex: -1,
    newPresetName: '',
    isSyncing: false,
    syncProgress: { current: 0, total: 0, phase: '' },
    syncResult: [] as any[],
})

const showSavePresetInput = ref(false)

const filteredEmployees = computed(() => {
    let result = state.scheduleEmployees

    if (state.employeeSearchQuery.trim()) {
        const query = state.employeeSearchQuery.toLowerCase()
        result = result.filter(emp =>
            `${emp.firstname} ${emp.lastname}`.toLowerCase().includes(query) ||
            (emp.email || '').toLowerCase().includes(query)
        )
    }

    if (state.showSelectedOnly) {
        result = result.filter(emp => emp.selected)
    }

    return result
})

const allMatchedSelected = computed(() => {
    const matched = state.scheduleEmployees.filter(e => e.matchedDanlonId)
    return matched.length > 0 && matched.every(e => e.selected)
})

const someMatchedSelected = computed(() => {
    return state.scheduleEmployees.some(e => e.matchedDanlonId && e.selected)
})

const canProceedFromConfigure = computed(() => {
    return state.syncDateRange.length === 2 &&
        state.scheduleEmployees.some(e => e.selected && e.matchedDanlonId)
})

const canSavePreset = computed(() => {
    return state.scheduleEmployees.some(e => e.selected && e.matchedDanlonId)
})

const allTypesAssigned = computed(() => {
    // Check shift types
    for (const empData of state.employeeShiftTypes) {
        for (const st of empData.shiftTypes) {
            if (!st.selectedSalaryTypeId) return false
        }
    }

    // Check supplement types
    for (const empData of state.employeeSupplementTypes) {
        for (const supp of empData.supplements) {
            if (!supp.selectedSupplementTypeId) return false
        }
    }

    return true
})

const totalRegistrationsCount = computed(() => {
    return state.registrationsPreview.length + state.supplementRegistrationsPreview.length
})

const employeeRegistrationGroups = computed(() => {
    const groups: any[] = []
    const employeeMap = new Map<string, any>()

    // Group shift registrations
    for (const reg of state.registrationsPreview) {
        if (!employeeMap.has(reg.danlonEmployeeId)) {
            employeeMap.set(reg.danlonEmployeeId, {
                employeeUuid: reg.employeeUuid,
                employeeName: reg.employeeName,
                shiftRegistrations: [],
                supplementRegistrations: [],
            })
        }
        employeeMap.get(reg.danlonEmployeeId).shiftRegistrations.push(reg)
    }

    // Group supplement registrations
    for (const reg of state.supplementRegistrationsPreview) {
        if (!employeeMap.has(reg.danlonEmployeeId)) {
            employeeMap.set(reg.danlonEmployeeId, {
                employeeUuid: reg.employeeUuid,
                employeeName: reg.employeeName,
                shiftRegistrations: [],
                supplementRegistrations: [],
            })
        }
        employeeMap.get(reg.danlonEmployeeId).supplementRegistrations.push(reg)
    }

    // Convert to array with counts
    for (const [, data] of employeeMap) {
        groups.push({
            ...data,
            shiftCount: data.shiftRegistrations.length,
            supplementCount: data.supplementRegistrations.length,
        })
    }

    return groups
})

const overallSuccess = computed(() => {
    return state.syncResult.length > 0 && state.syncResult.every(r => r.success)
})

const hasPartialSuccess = computed(() => {
    return state.syncResult.some(r => r.success) && state.syncResult.some(r => !r.success)
})

function canNavigateToStep(stepId: string): boolean {
    if (stepId === 'configure') return true
    if (stepId === 'assign-rates') return canProceedFromConfigure.value
    if (stepId === 'review') return allTypesAssigned.value
    if (stepId === 'result') return state.syncStep === 'result'
    return false
}

function toggleSelectAll(event: any) {
    const checked = event.target.checked
    state.scheduleEmployees.forEach(emp => {
        if (emp.matchedDanlonId) {
            emp.selected = checked
        }
    })
}

function applyPayPeriodDateRange(periodType: string) {
    state.selectedPayPeriodType = periodType
    const now = moment()

    if (periodType === 'monthly') {
        state.syncDateRange = [
            now.startOf('month').format('YYYY-MM-DD'),
            now.endOf('month').format('YYYY-MM-DD')
        ]
    } else if (periodType === 'weekly') {
        state.syncDateRange = [
            now.startOf('isoWeek').format('YYYY-MM-DD'),
            now.endOf('isoWeek').format('YYYY-MM-DD')
        ]
    } else if (periodType === 'biweekly') {
        const weekNum = now.isoWeek()
        const isOddWeek = weekNum % 2 === 1
        if (isOddWeek) {
            state.syncDateRange = [
                now.startOf('isoWeek').format('YYYY-MM-DD'),
                now.add(1, 'week').endOf('isoWeek').format('YYYY-MM-DD')
            ]
        } else {
            state.syncDateRange = [
                now.subtract(1, 'week').startOf('isoWeek').format('YYYY-MM-DD'),
                now.add(1, 'week').endOf('isoWeek').format('YYYY-MM-DD')
            ]
        }
    }
}

function loadPresets() {
    const raw = localStorage.getItem('danlon_sync_presets')
    state.savedPresets = raw ? JSON.parse(raw) : []
}

function saveCurrentAsPreset() {
    if (!state.newPresetName.trim()) return

    const preset = {
        name: state.newPresetName.trim(),
        employeeUuids: state.scheduleEmployees.filter(e => e.selected).map(e => e.uuid),
        payPeriodType: state.selectedPayPeriodType
    }
    state.savedPresets.push(preset)
    localStorage.setItem('danlon_sync_presets', JSON.stringify(state.savedPresets))
    state.newPresetName = ''
    showSavePresetInput.value = false
    state.selectedPresetIndex = state.savedPresets.length - 1
}

function applyPreset() {
    if (state.selectedPresetIndex < 0) return

    const preset = state.savedPresets[state.selectedPresetIndex]
    state.scheduleEmployees.forEach(emp => {
        if (emp.matchedDanlonId) {
            emp.selected = preset.employeeUuids.includes(emp.uuid)
        }
    })
    if (preset.payPeriodType) {
        state.selectedPayPeriodType = preset.payPeriodType
        applyPayPeriodDateRange(preset.payPeriodType)
    }
}

function updatePreset() {
    if (state.selectedPresetIndex < 0) return

    const preset = state.savedPresets[state.selectedPresetIndex]
    preset.employeeUuids = state.scheduleEmployees.filter(e => e.selected).map(e => e.uuid)
    preset.payPeriodType = state.selectedPayPeriodType
    localStorage.setItem('danlon_sync_presets', JSON.stringify(state.savedPresets))
}

function deletePreset() {
    if (state.selectedPresetIndex < 0) return

    state.savedPresets.splice(state.selectedPresetIndex, 1)
    localStorage.setItem('danlon_sync_presets', JSON.stringify(state.savedPresets))
    state.selectedPresetIndex = -1
}

function matchEmployee(localEmployee: any, danlonEmployees: any[]): string | null {
    for (const de of danlonEmployees) {
        const danlonId = String(de.id || '')
        const danlonEmail = (de.email || '').toLowerCase().trim()
        const danlonName = (de.name || '').toLowerCase().trim()

        if (localEmployee.danlon_id && String(localEmployee.danlon_id) === danlonId)
            return danlonId

        const localEmail = (localEmployee.email || '').toLowerCase().trim()
        if (danlonEmail && localEmail && danlonEmail === localEmail)
            return danlonId

        const localName = `${localEmployee.firstname || ''} ${localEmployee.lastname || ''}`.toLowerCase().trim()
        if (danlonName && localName && danlonName.length > 2 && localName.length > 2 && danlonName === localName)
            return danlonId
    }
    return null
}

async function proceedToAssignRates() {
    if (!canProceedFromConfigure.value) return

    // Fetch schedule data and build shift types mapping
    const [startDate, endDate] = state.syncDateRange
    const startMoment = moment(startDate)
    const endMoment = moment(endDate)

    const selectedEmployeeUuids = new Set(
        state.scheduleEmployees.filter(e => e.selected && e.matchedDanlonId).map(e => e.uuid)
    )

    // Calculate week starts
    const weekStarts: string[] = []
    const cursor = moment(startDate).startOf('isoWeek')
    while (cursor.isSameOrBefore(endMoment)) {
        weekStarts.push(cursor.format('YYYY-MM-DD'))
        cursor.add(1, 'week')
    }

    // Fetch schedule data
    const allScheduleData: any[] = []
    for (const weekStart of weekStarts) {
        const weekEnd = moment(weekStart).endOf('isoWeek').format('YYYY-MM-DD')
        const response = await dutyScheduleService.getDutySchedules({
            date_start: weekStart,
            date_end: weekEnd,
            department: props.departmentName,
            page_length: 500,
        })
        const employeeSchedules = response?.data || []
        if (Array.isArray(employeeSchedules)) {
            allScheduleData.push(...employeeSchedules)
        }
    }

    // Build shift types map
    const employeeShiftTypesMap = new Map<string, any>()

    for (const empSchedule of allScheduleData) {
        if (!selectedEmployeeUuids.has(empSchedule.uuid)) continue

        const matchedEmployee = state.scheduleEmployees.find(e => e.uuid === empSchedule.uuid)
        if (!matchedEmployee?.matchedDanlonId) continue

        if (!employeeShiftTypesMap.has(empSchedule.uuid)) {
            employeeShiftTypesMap.set(empSchedule.uuid, {
                employeeUuid: empSchedule.uuid,
                employeeName: `${empSchedule.firstname || ''} ${empSchedule.lastname || ''}`.trim(),
                danlonEmployeeId: matchedEmployee.matchedDanlonId,
                shiftTypes: new Map<string, number>(),
            })
        }

        const empData = employeeShiftTypesMap.get(empSchedule.uuid)
        const days = Object.values(empSchedule.weeks || {}) as any[]

        for (const day of days) {
            const dateMoment = moment(day.date)
            if (dateMoment.isBefore(startMoment) || dateMoment.isAfter(endMoment)) continue

            for (const shift of (day.shifts || [])) {
                const shiftTypeName = locale.value === 'dk'
                    ? (shift.type?.dk_name || shift.type?.en_name || t('unknown'))
                    : (shift.type?.en_name || shift.type?.dk_name || t('unknown'))

                const currentCount = empData.shiftTypes.get(shiftTypeName) || 0
                empData.shiftTypes.set(shiftTypeName, currentCount + 1)
            }
        }
    }

    // Convert to array format
    state.employeeShiftTypes = Array.from(employeeShiftTypesMap.values()).map(empData => ({
        ...empData,
        shiftTypes: Array.from(empData.shiftTypes.entries()).map(([name, count]) => ({
            name,
            shiftCount: count,
            selectedSalaryTypeId: null,
        })),
        availableSalaryTypes: state.salaryTypesRaw,
    }))

    // Fetch extra hours (supplements) data
    const employeeSupplementsMap = new Map<string, any>()

    for (const emp of state.scheduleEmployees.filter(e => e.selected && e.matchedDanlonId)) {
        try {
            const response = await extraHoursService.getExtraHours({
                user_uuid: emp.uuid,
                date_start: startDate,
                date_end: endDate,
                status: 'approved',
            })

            const extraHours = response?.data || []
            const supplements = extraHours.filter((eh: any) => eh.extra_hours_type === 'add')

            if (supplements.length > 0) {
                const supplementsMap = new Map<string, number>()

                for (const supp of supplements) {
                    const suppName = locale.value === 'dk'
                        ? (supp.extra_hours_type_meta?.dk_name || supp.extra_hours_type_meta?.en_name || t('unknown'))
                        : (supp.extra_hours_type_meta?.en_name || supp.extra_hours_type_meta?.dk_name || t('unknown'))

                    const currentCount = supplementsMap.get(suppName) || 0
                    supplementsMap.set(suppName, currentCount + 1)
                }

                employeeSupplementsMap.set(emp.uuid, {
                    employeeUuid: emp.uuid,
                    employeeName: `${emp.firstname} ${emp.lastname}`,
                    danlonEmployeeId: emp.matchedDanlonId,
                    supplements: Array.from(supplementsMap.entries()).map(([name, count]) => ({
                        name,
                        count,
                        selectedSupplementTypeId: null,
                    })),
                    availableSupplementTypes: state.supplementTypesRaw,
                })
            }
        } catch (e) {
            console.error('Failed to fetch supplements for employee:', emp.uuid, e)
        }
    }

    state.employeeSupplementTypes = Array.from(employeeSupplementsMap.values())

    state.syncStep = 'assign-rates'
}

async function proceedToReview() {
    if (!allTypesAssigned.value) return

    // Build registrations preview
    const [startDate, endDate] = state.syncDateRange
    const startMoment = moment(startDate)
    const endMoment = moment(endDate)

    const selectedEmployeeUuids = new Set(
        state.scheduleEmployees.filter(e => e.selected && e.matchedDanlonId).map(e => e.uuid)
    )

    // Calculate week starts
    const weekStarts: string[] = []
    const cursor = moment(startDate).startOf('isoWeek')
    while (cursor.isSameOrBefore(endMoment)) {
        weekStarts.push(cursor.format('YYYY-MM-DD'))
        cursor.add(1, 'week')
    }

    // Fetch schedule data again
    const allScheduleData: any[] = []
    for (const weekStart of weekStarts) {
        const weekEnd = moment(weekStart).endOf('isoWeek').format('YYYY-MM-DD')
        const response = await dutyScheduleService.getDutySchedules({
            date_start: weekStart,
            date_end: weekEnd,
            department: props.departmentName,
            page_length: 500,
        })
        const employeeSchedules = response?.data || []
        if (Array.isArray(employeeSchedules)) {
            allScheduleData.push(...employeeSchedules)
        }
    }

    // Build shift registrations
    const registrations: any[] = []

    for (const empSchedule of allScheduleData) {
        if (!selectedEmployeeUuids.has(empSchedule.uuid)) continue

        const matchedEmployee = state.scheduleEmployees.find(e => e.uuid === empSchedule.uuid)
        if (!matchedEmployee?.matchedDanlonId) continue

        const empShiftData = state.employeeShiftTypes.find(e => e.employeeUuid === empSchedule.uuid)
        if (!empShiftData) continue

        const days = Object.values(empSchedule.weeks || {}) as any[]

        for (const day of days) {
            const dateMoment = moment(day.date)
            if (dateMoment.isBefore(startMoment) || dateMoment.isAfter(endMoment)) continue

            for (const shift of (day.shifts || [])) {
                const from = shift.date_time_start
                const to = shift.date_time_end
                const hours = moment(to).diff(moment(from), 'hours', true)

                const shiftTypeName = locale.value === 'dk'
                    ? (shift.type?.dk_name || shift.type?.en_name || t('unknown'))
                    : (shift.type?.en_name || shift.type?.dk_name || t('unknown'))

                const shiftTypeMapping = empShiftData.shiftTypes.find((st: any) => st.name === shiftTypeName)
                if (!shiftTypeMapping?.selectedSalaryTypeId) continue

                registrations.push({
                    employeeUuid: empSchedule.uuid,
                    employeeName: `${empSchedule.firstname || ''} ${empSchedule.lastname || ''}`.trim(),
                    danlonEmployeeId: matchedEmployee.matchedDanlonId,
                    date: day.date,
                    shiftTypeName,
                    hours,
                    salaryTypeId: shiftTypeMapping.selectedSalaryTypeId,
                })
            }
        }
    }

    state.registrationsPreview = registrations

    // Build supplement registrations
    const supplementRegs: any[] = []

    for (const emp of state.scheduleEmployees.filter(e => e.selected && e.matchedDanlonId)) {
        const empSuppData = state.employeeSupplementTypes.find(e => e.employeeUuid === emp.uuid)
        if (!empSuppData) continue

        try {
            const response = await extraHoursService.getExtraHours({
                user_uuid: emp.uuid,
                date_start: startDate,
                date_end: endDate,
                status: 'approved',
            })

            const extraHours = response?.data || []
            const supplements = extraHours.filter((eh: any) => eh.extra_hours_type === 'add')

            for (const supp of supplements) {
                const suppName = locale.value === 'dk'
                    ? (supp.extra_hours_type_meta?.dk_name || supp.extra_hours_type_meta?.en_name || t('unknown'))
                    : (supp.extra_hours_type_meta?.en_name || supp.extra_hours_type_meta?.dk_name || t('unknown'))

                const suppMapping = empSuppData.supplements.find((s: any) => s.name === suppName)
                if (!suppMapping?.selectedSupplementTypeId) continue

                supplementRegs.push({
                    employeeUuid: emp.uuid,
                    employeeName: `${emp.firstname} ${emp.lastname}`,
                    danlonEmployeeId: emp.matchedDanlonId,
                    date: supp.date,
                    supplementName: suppName,
                    units: supp.hours || 1,
                    supplementTypeId: suppMapping.selectedSupplementTypeId,
                })
            }
        } catch (e) {
            console.error('Failed to fetch supplements for employee:', emp.uuid, e)
        }
    }

    state.supplementRegistrationsPreview = supplementRegs

    state.syncStep = 'review'
}

function toggleExpandEmployee(employeeUuid: string) {
    if (state.expandedEmployees.has(employeeUuid)) {
        state.expandedEmployees.delete(employeeUuid)
    } else {
        state.expandedEmployees.add(employeeUuid)
    }
}

async function executeSync() {
    const allRegistrations = []

    // Add hour registrations
    for (const reg of state.registrationsPreview) {
        const salaryType = state.salaryTypesRaw.find(t => t.id === reg.salaryTypeId)
        if (!salaryType) continue

        allRegistrations.push({
            employeeId: reg.danlonEmployeeId,
            code: salaryType.code,
            units: reg.hours,
            rate: 0,
            amount: 0
        })
    }

    // Add supplement registrations
    for (const reg of state.supplementRegistrationsPreview) {
        const suppType = state.supplementTypesRaw.find(t => t.id === reg.supplementTypeId)
        if (!suppType) continue

        allRegistrations.push({
            employeeId: reg.danlonEmployeeId,
            code: suppType.code,
            units: reg.units,
            rate: 0,
            amount: 0
        })
    }

    state.syncProgress = {
        current: 0,
        total: allRegistrations.length,
        phase: t('dutySchedules.danlon_sync_sending')
    }

    state.isSyncing = true

    try {
        const response = await danlonService.syncTimeRegistrations(allRegistrations)

        if (response.success) {
            state.syncResult = [{
                employeeName: 'All employees',
                type: 'hours',
                success: true,
                count: allRegistrations.length
            }]
            successAlert(t('alert.success'), t('dutySchedules.danlon_sync_success'))
        } else {
            const errors = response.errors || []
            state.syncResult = buildResultsFromErrors(errors, allRegistrations)
            errorAlert(t('alert.error'), t('dutySchedules.danlon_sync_failed'))
        }
    } catch (e: any) {
        state.syncResult = [{
            employeeName: 'All employees',
            type: 'hours',
            success: false,
            error: parseError(e),
            count: allRegistrations.length
        }]
        errorAlert(t('alert.error'), t('dutySchedules.danlon_sync_failed'))
    } finally {
        state.syncProgress.current = allRegistrations.length
        state.isSyncing = false
        state.syncStep = 'result'
    }
}

function buildResultsFromErrors(errors: any[], allRegistrations: any[]): any[] {
    if (errors.length === 0) {
        return [{
            employeeName: 'All employees',
            type: 'hours',
            success: true,
            count: allRegistrations.length
        }]
    }

    const results: any[] = []
    const employeeErrors = new Map<string, string[]>()

    for (const err of errors) {
        const empId = err.employeeId || 'unknown'
        if (!employeeErrors.has(empId)) {
            employeeErrors.set(empId, [])
        }
        employeeErrors.get(empId)!.push(err.message || 'Unknown error')
    }

    for (const [empId, msgs] of employeeErrors) {
        const empName = state.scheduleEmployees.find(e => e.matchedDanlonId === empId)
        results.push({
            employeeName: empName ? `${empName.firstname} ${empName.lastname}` : empId,
            type: 'hours',
            success: false,
            error: msgs.join(', '),
            count: allRegistrations.filter(r => r.employeeId === empId).length
        })
    }

    return results
}

function handleClose() {
    // Reset state
    state.syncStep = 'configure'
    state.syncDateRange = []
    state.selectedPayPeriodType = 'custom'
    state.employeeSearchQuery = ''
    state.showSelectedOnly = false
    state.scheduleEmployees = []
    state.employeeShiftTypes = []
    state.employeeSupplementTypes = []
    state.registrationsPreview = []
    state.supplementRegistrationsPreview = []
    state.expandedEmployees.clear()
    state.selectedPresetIndex = -1
    state.newPresetName = ''
    state.isSyncing = false
    state.syncProgress = { current: 0, total: 0, phase: '' }
    state.syncResult = []
    showSavePresetInput.value = false

    emit('close')
}

async function initModal() {
    loadPresets()

    // Fetch Danløn data
    try {
        const [employeesResp, salaryTypesResp, supplementTypesResp] = await Promise.all([
            danlonService.getEmployees(),
            danlonService.getSalaryTypes(),
            danlonService.getSupplementTypes(),
        ])

        state.danlonEmployees = employeesResp?.data || []
        state.salaryTypesRaw = salaryTypesResp?.data || []
        state.supplementTypesRaw = supplementTypesResp?.data || []

        // Match employees
        state.scheduleEmployees = props.scheduleEmployees.map(emp => ({
            ...emp,
            matchedDanlonId: matchEmployee(emp, state.danlonEmployees),
            selected: false,
        }))

        // Auto-select matched employees
        state.scheduleEmployees.forEach(emp => {
            if (emp.matchedDanlonId) {
                emp.selected = true
            }
        })
    } catch (e: any) {
        errorAlert(t('alert.error'), parseError(e))
    }
}

watch(() => props.isModalOpen, (newVal) => {
    if (newVal) {
        initModal()
    }
})

onMounted(() => {
    if (props.isModalOpen) {
        initModal()
    }
})
</script>
