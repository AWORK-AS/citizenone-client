<template>
    <Modal size="xl" :title="$t('dutySchedules.danlon_sync')" :show="isModalOpen" @close="handleClose">
        <template #modal-body>
            <div>
                <p class="mt-2 text-sm text-gray-600 mb-6">{{ $t('dutySchedules.danlon_sync_description') }}</p>

                <!-- Step Progress Indicator -->
                <div class="flex items-center mb-6 px-2">
                    <template v-for="(step, idx) in steps" :key="idx">
                        <div class="flex flex-col items-center">
                            <div
                                :class="[
                                    'w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-300',
                                    step.status === 'completed' ? 'bg-primary' :
                                        step.status === 'current' ? 'border-2 border-primary' :
                                            'border-2 border-gray-300'
                                ]">
                                <Icon v-if="step.status === 'completed'" name="ph:check-bold" class="w-4 h-4 text-white" />
                                <span
                                    v-else
                                    :class="[
                                        'text-sm font-semibold',
                                        step.status === 'current' ? 'text-primary' : 'text-gray-400'
                                    ]">{{ idx + 1 }}</span>
                            </div>
                            <span
                                :class="[
                                    'text-xs mt-1.5 whitespace-nowrap',
                                    step.status === 'completed' ? 'text-primary font-medium' :
                                        step.status === 'current' ? 'text-primary font-medium' :
                                            'text-gray-400'
                                ]">{{ step.label }}</span>
                        </div>
                        <div
                            v-if="idx < steps.length - 1"
                            class="flex-1 h-0.5 mx-3 mt-[-1rem] rounded-full transition-colors duration-300"
                            :class="step.status === 'completed' ? 'bg-primary' : 'bg-gray-300'">
                        </div>
                    </template>
                </div>

                <LoadingSpinner :isActive="state.isLoadingModalData">

                    <!-- Step 1: Configure -->
                    <div v-if="state.syncStep === 'configure'" class="space-y-6">
                        <!-- Presets -->
                        <div class="space-y-2">
                            <FormLabel :label="$t('dutySchedules.danlon_presets')" />
                            <div class="flex items-center gap-2">
                                <select
                                    v-model="state.selectedPresetIndex"
                                    class="flex-1 rounded-md border-gray-300 text-sm"
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
                                    v-if="state.selectedPresetIndex >= 0"
                                    type="button"
                                    class="text-red-500 hover:text-red-700"
                                    @click="deletePreset">
                                    <Icon name="ph:trash" class="h-4 w-4" />
                                </button>
                            </div>
                            <div class="flex items-center gap-3">
                                <button
                                    v-if="state.selectedPresetIndex === -1 && !state.showSavePresetInput"
                                    type="button"
                                    :disabled="!canSavePreset"
                                    class="text-xs text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                    @click="state.showSavePresetInput = true">
                                    {{ $t('dutySchedules.danlon_save_preset') }}
                                </button>
                                <button
                                    v-if="state.selectedPresetIndex >= 0 && !state.showSavePresetInput"
                                    type="button"
                                    class="text-xs text-primary hover:underline"
                                    @click="updatePreset">
                                    {{ $t('dutySchedules.danlon_update_preset') }}
                                </button>
                            </div>
                            <div v-if="state.showSavePresetInput" class="flex items-center gap-2">
                                <input
                                    v-model="state.newPresetName"
                                    type="text"
                                    :placeholder="$t('dutySchedules.danlon_preset_name_placeholder')"
                                    class="flex-1 rounded-md border-gray-300 text-sm"
                                    @keyup.enter="saveCurrentAsPreset"
                                />
                                <FormButton
                                    type="button"
                                    buttonStyle="primary"
                                    class="rounded-md text-xs"
                                    :disabled="!state.newPresetName.trim()"
                                    @click="saveCurrentAsPreset">
                                    {{ $t('save') }}
                                </FormButton>
                                <button
                                    type="button"
                                    class="text-xs text-gray-400 hover:text-gray-600"
                                    @click="state.showSavePresetInput = false; state.newPresetName = ''">
                                    {{ $t('cancel') }}
                                </button>
                            </div>
                        </div>

                        <!-- Pay Period Quick Selects -->
                        <div class="space-y-1">
                            <FormLabel :label="$t('dutySchedules.danlon_pay_period')" />
                            <div class="flex flex-wrap gap-2">
                                <FormButton
                                    v-for="period in payPeriodTypes"
                                    :key="period.value"
                                    type="button"
                                    :buttonStyle="state.selectedPayPeriodType === period.value ? 'primary' : 'secondary'"
                                    class="rounded-md text-xs"
                                    @click="applyPayPeriodDateRange(period.value)">
                                    {{ period.label }}
                                </FormButton>
                            </div>
                        </div>

                        <!-- Date Range -->
                        <div class="space-y-1">
                            <FormLabel :label="$t('dutySchedules.danlon_date_range')" />
                            <div :class="{ 'rounded border border-red-500': state.configureAttempted && state.syncDateRange.length !== 2 }">
                                <FormDateRangeField
                                    v-model="state.syncDateRange"
                                    :placeholder="$t('dutySchedules.danlon_select_date_range')"
                                    class="w-full"
                                />
                            </div>
                            <FormError
                                v-if="state.configureAttempted && state.syncDateRange.length !== 2"
                                :error="$t('dutySchedules.danlon_validation_date_range')" />
                        </div>

                        <!-- Employee Selection -->
                        <div class="space-y-2">
                            <div class="flex justify-between items-center">
                                <FormLabel :label="$t('dutySchedules.danlon_select_employees')" />
                                <span class="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                                    {{ selectedEmployeeCount }} / {{ matchedEmployeeCount }}
                                </span>
                            </div>

                            <!-- Search & filters -->
                            <div class="flex items-center gap-2">
                                <div class="relative flex-1">
                                    <Icon name="ph:magnifying-glass" class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        v-model="state.employeeSearchQuery"
                                        type="text"
                                        :placeholder="$t('dutySchedules.danlon_search_employees')"
                                        class="w-full rounded-md border-gray-300 py-1.5 pl-8 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <button
                                    type="button"
                                    @click="state.showSelectedOnly = !state.showSelectedOnly"
                                    :class="state.showSelectedOnly ? 'bg-primary-50 text-primary-700 border-primary-300' : 'bg-white text-gray-500 border-gray-300'"
                                    class="shrink-0 rounded border px-2 py-1.5 text-xs font-medium transition-colors hover:bg-primary-50">
                                    {{ $t('dutySchedules.danlon_selected_only') }}
                                </button>
                            </div>

                            <!-- Select all -->
                            <div
                                class="flex w-fit cursor-pointer items-center gap-x-2 border-b border-gray-200 pb-2 text-sm font-medium"
                                @click="toggleSelectAll">
                                <div class="relative shrink-0">
                                    <FormCheckbox :value="allMatchedSelected" />
                                </div>
                                <span>{{ $t('dutySchedules.danlon_select_all') }}</span>
                            </div>

                            <div class="mt-2 max-h-64 space-y-1 overflow-y-auto rounded-md border p-2">
                                <p v-if="filteredEmployees.length === 0" class="py-4 text-center text-sm text-gray-400">
                                    {{ $t('dutySchedules.danlon_no_employees_found') }}
                                </p>
                                <div
                                    v-for="emp in filteredEmployees"
                                    :key="emp.uuid"
                                    class="flex items-center gap-x-2 rounded px-1 py-2 text-sm hover:bg-gray-50"
                                    :class="emp.matchedDanlonId ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'"
                                    @click="emp.matchedDanlonId && (emp.selected = !emp.selected)">
                                    <div class="relative shrink-0 pointer-events-none">
                                        <FormCheckbox :value="emp.selected" :disabled="!emp.matchedDanlonId" />
                                    </div>
                                    <div class="flex-1">
                                        <span class="font-medium text-gray-900">{{ emp.firstname }} {{ emp.lastname }}</span>
                                        <span v-if="emp.email" class="text-xs text-gray-500 ml-2">{{ emp.email }}</span>
                                    </div>
                                    <span
                                        v-if="!emp.matchedDanlonId"
                                        class="relative group shrink-0 cursor-help px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                                        {{ $t('dutySchedules.danlon_no_match_badge') }}
                                        <span
                                            class="absolute right-0 top-full mt-1 z-10 hidden w-56 whitespace-normal rounded bg-gray-800 px-3 py-2 text-xs font-normal normal-case text-white shadow-lg group-hover:block">
                                            {{ $t('dutySchedules.danlon_no_match_info') }}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Navigation -->
                        <div class="grid grid-cols-2 gap-3 pt-4 border-t">
                            <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="handleClose">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" class="rounded-md" @click="handleConfigureNext">
                                {{ $t('next') }}
                            </FormButton>
                        </div>
                    </div>

                    <!-- Step 2: Assign Rates -->
                    <div v-else-if="state.syncStep === 'assign-rates'" class="space-y-6">
                        <p class="flex items-center justify-between text-sm text-gray-600">
                            <span>{{ $t('dutySchedules.danlon_assign_rates_description') }}</span>
                            <span class="relative group ml-2 shrink-0 cursor-pointer">
                                <Icon name="ph:info" class="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                <span class="absolute right-0 top-6 z-10 hidden w-64 rounded bg-gray-800 px-3 py-2 text-xs text-white shadow-lg group-hover:block">
                                    {{ $t('dutySchedules.danlon_assign_rates_info') }}
                                </span>
                            </span>
                        </p>

                        <!-- Shift Types -->
                        <div>
                            <p class="mb-2 text-sm font-medium text-gray-700">{{ $t('dutySchedules.danlon_shifts') }}</p>
                            <div class="max-h-72 space-y-2 overflow-y-auto">
                                <div
                                    v-for="empData in state.employeeShiftTypes"
                                    :key="empData.employeeUuid"
                                    class="rounded-md border border-gray-200 p-3">
                                    <p class="text-sm font-medium">{{ empData.employeeName }}</p>
                                    <div class="mt-2 space-y-2">
                                        <div
                                            v-for="st in empData.shiftTypes"
                                            :key="st.name"
                                            class="flex items-center gap-x-3 text-sm">
                                            <span class="flex-1">
                                                {{ st.name }}
                                                <span class="text-xs text-gray-400">
                                                    ({{ st.shiftCount }} {{ st.shiftCount === 1 ? $t('dutySchedules.danlon_entry') : $t('dutySchedules.danlon_entries') }})
                                                </span>
                                            </span>
                                            <select
                                                v-model="st.selectedSalaryTypeId"
                                                :class="[
                                                    'w-56 rounded-md text-xs',
                                                    state.assignRatesAttempted && !st.selectedSalaryTypeId
                                                        ? 'border-red-500 ring-1 ring-red-500'
                                                        : 'border-gray-300'
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
                            <p class="mb-1 text-sm font-medium text-gray-700">
                                {{ $t('dutySchedules.danlon_supplement_rates_title') }}
                            </p>
                            <p class="mb-2 text-xs text-gray-500">{{ $t('dutySchedules.danlon_supplement_rates_description') }}</p>
                            <div class="max-h-72 space-y-2 overflow-y-auto">
                                <div
                                    v-for="empData in state.employeeSupplementTypes"
                                    :key="empData.employeeUuid"
                                    class="rounded-md border border-gray-200 p-3">
                                    <p class="text-sm font-medium">{{ empData.employeeName }}</p>
                                    <div class="mt-2 space-y-2">
                                        <div
                                            v-for="supp in empData.supplements"
                                            :key="supp.name"
                                            class="flex items-center gap-x-3 text-sm">
                                            <span class="flex-1">
                                                {{ supp.name }}
                                                <span class="text-xs text-gray-400">
                                                    ({{ supp.count }} {{ supp.count === 1 ? $t('dutySchedules.danlon_entry') : $t('dutySchedules.danlon_entries') }})
                                                </span>
                                            </span>
                                            <select
                                                v-model="supp.selectedSupplementTypeId"
                                                :class="[
                                                    'w-56 rounded-md text-xs',
                                                    state.assignRatesAttempted && !supp.selectedSupplementTypeId
                                                        ? 'border-red-500 ring-1 ring-red-500'
                                                        : 'border-gray-300'
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

                        <FormError
                            v-if="state.assignRatesAttempted && !allTypesAssigned"
                            :error="$t('dutySchedules.danlon_validation_assign_rates')" />

                        <!-- Navigation -->
                        <div class="grid grid-cols-2 gap-3 pt-4 border-t">
                            <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="state.syncStep = 'configure'">
                                {{ $t('back') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" class="rounded-md" @click="handleAssignRatesNext">
                                {{ $t('dutySchedules.danlon_review') }}
                            </FormButton>
                        </div>
                    </div>

                    <!-- Step 3: Review -->
                    <div v-else-if="state.syncStep === 'review'" class="relative space-y-6">
                        <p class="text-sm text-gray-600">
                            {{ $t('dutySchedules.danlon_review_description', { count: totalRegistrationsCount }) }}
                        </p>

                        <!-- Employee Groups -->
                        <div v-if="employeeRegistrationGroups.length > 0" class="border rounded-md divide-y max-h-96 overflow-y-auto">
                            <div
                                v-for="group in employeeRegistrationGroups"
                                :key="group.employeeUuid"
                                class="p-4">
                                <div
                                    class="flex items-center gap-x-2 cursor-pointer"
                                    @click="toggleExpandEmployee(group.employeeUuid)">
                                    <Icon
                                        name="ph:caret-right"
                                        :class="['h-4 w-4 shrink-0 transition-transform', state.expandedEmployees.has(group.employeeUuid) ? 'rotate-90' : '']"
                                    />
                                    <span class="text-sm font-medium text-gray-900">{{ group.employeeName }}</span>
                                    <span v-if="group.shiftCount > 0" class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                        {{ group.shiftCount }} {{ $t('dutySchedules.danlon_shifts') }}
                                    </span>
                                    <span v-if="group.supplementCount > 0" class="rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-700">
                                        {{ group.supplementCount }} {{ $t('dutySchedules.danlon_supplements') }}
                                    </span>
                                </div>

                                <!-- Expanded Details -->
                                <div v-if="state.expandedEmployees.has(group.employeeUuid)" class="mt-4 space-y-4 pl-6">
                                    <!-- Shift Registrations -->
                                    <table v-if="group.shiftRegistrations.length > 0" class="min-w-full text-sm">
                                        <thead class="bg-gray-50">
                                            <tr>
                                                <th class="px-3 py-2 text-left">{{ $t('dutySchedules.danlon_date_range') }}</th>
                                                <th class="px-3 py-2 text-left">{{ $t('dutySchedules.danlon_shifts') }}</th>
                                                <th class="px-3 py-2 text-right">{{ $t('dutySchedules.danlon_hours_let') }}</th>
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

                                    <!-- Supplement Registrations -->
                                    <table v-if="group.supplementRegistrations.length > 0" class="min-w-full text-sm">
                                        <thead class="bg-gray-50">
                                            <tr>
                                                <th class="px-3 py-2 text-left">{{ $t('dutySchedules.danlon_date_range') }}</th>
                                                <th class="px-3 py-2 text-left">{{ $t('dutySchedules.danlon_supplements') }}</th>
                                                <th class="px-3 py-2 text-right">{{ $t('dutySchedules.danlon_registrations') }}</th>
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
                        <div v-else class="py-8 text-center text-gray-400">
                            {{ $t('dutySchedules.danlon_no_registrations') }}
                        </div>

                        <!-- Navigation -->
                        <div class="grid grid-cols-2 gap-3 pt-4 border-t">
                            <FormButton
                                type="button"
                                buttonStyle="cancel"
                                class="rounded-md"
                                :disabled="state.isSyncing"
                                @click="state.syncStep = 'assign-rates'">
                                {{ $t('back') }}
                            </FormButton>
                            <FormButton
                                type="button"
                                buttonStyle="primary"
                                class="rounded-md"
                                :disabled="state.isSyncing || totalRegistrationsCount === 0"
                                @click="executeSync">
                                {{ $t('dutySchedules.danlon_sync') }} ({{ totalRegistrationsCount }})
                            </FormButton>
                        </div>

                        <!-- Sync progress overlay -->
                        <div
                            v-if="state.isSyncing"
                            class="absolute inset-0 z-10 flex flex-col items-center justify-center space-y-4 rounded-lg bg-white/90">
                            <p class="text-sm font-medium text-gray-700">{{ state.syncProgress.phase }}</p>
                            <div class="h-3 w-64 rounded-full bg-gray-200">
                                <div
                                    class="h-3 rounded-full bg-primary transition-all duration-300"
                                    :style="{ width: danlonSyncProgressPercent + '%' }">
                                </div>
                            </div>
                            <p class="text-xs text-gray-500">{{ state.syncProgress.current }} / {{ state.syncProgress.total }}</p>
                        </div>
                    </div>

                    <!-- Step 4: Result -->
                    <div v-else-if="state.syncStep === 'result'" class="space-y-4 py-4">
                        <div class="text-center">
                            <Icon
                                :name="overallSuccess ? 'ph:check-circle' : hasPartialSuccess ? 'ph:warning-circle' : 'ph:x-circle'"
                                :class="[
                                    'mx-auto h-12 w-12',
                                    overallSuccess ? 'text-green-500' : hasPartialSuccess ? 'text-yellow-500' : 'text-red-500'
                                ]"
                            />
                            <p class="mt-2 text-lg font-medium">
                                {{ overallSuccess ? $t('dutySchedules.danlon_sync_success') : hasPartialSuccess ? $t('dutySchedules.danlon_sync_partial') : $t('dutySchedules.danlon_sync_failed') }}
                            </p>
                        </div>

                        <!-- Results List -->
                        <div class="max-h-60 space-y-2 overflow-y-auto">
                            <div
                                v-for="(result, idx) in state.syncResult"
                                :key="idx"
                                :class="['flex items-center justify-between rounded-md px-3 py-2 text-sm', result.success ? 'bg-green-50' : 'bg-red-50']">
                                <div class="flex items-center gap-2">
                                    <Icon
                                        :name="result.success ? 'ph:check-circle' : 'ph:x-circle'"
                                        :class="result.success ? 'h-4 w-4 text-green-600' : 'h-4 w-4 text-red-600'"
                                    />
                                    <span class="font-medium">{{ result.employeeName }}</span>
                                    <span class="text-xs text-gray-500">
                                        ({{ result.count }} {{ result.type === 'supplements' ? $t('dutySchedules.danlon_supplement_registrations') : $t('dutySchedules.danlon_registrations') }})
                                    </span>
                                </div>
                                <span
                                    v-if="!result.success && result.error"
                                    class="relative group ml-2 max-w-[200px] cursor-pointer text-xs text-red-600">
                                    <span class="block truncate">{{ result.error }}</span>
                                    <span class="absolute right-0 top-full z-10 mt-1 hidden w-72 whitespace-normal rounded bg-gray-800 px-3 py-2 text-xs font-normal text-white shadow-lg group-hover:block">
                                        {{ result.error }}
                                    </span>
                                </span>
                            </div>
                        </div>

                        <FormButton type="button" buttonStyle="primary" class="w-full rounded-md" @click="handleClose">
                            {{ $t('close') }}
                        </FormButton>
                    </div>

                </LoadingSpinner>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { reactive, computed, watch, onMounted } from 'vue'
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

const payPeriodTypes = computed(() => [
    { value: 'custom', label: t('dutySchedules.danlon_custom_period') },
    { value: 'monthly', label: t('dutySchedules.danlon_period_monthly') },
    { value: 'weekly', label: t('dutySchedules.danlon_period_weekly') },
    { value: 'biweekly', label: t('dutySchedules.danlon_period_biweekly') },
])

const state = reactive({
    syncStep: 'configure' as 'configure' | 'assign-rates' | 'review' | 'result',
    isLoadingModalData: false,
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
    showSavePresetInput: false,
    configureAttempted: false,
    assignRatesAttempted: false,
    isSyncing: false,
    syncProgress: { current: 0, total: 0, phase: '' },
    syncResult: [] as any[],
})

// --- Computed ---

const stepNumber = computed(() => {
    const map: Record<string, number> = { 'configure': 1, 'assign-rates': 2, 'review': 3, 'result': 4 }
    return map[state.syncStep] || 1
})

const steps = computed(() => {
    const s = [
        { label: t('dutySchedules.danlon_step_configure') },
        { label: t('dutySchedules.danlon_step_assign_rates') },
        { label: t('dutySchedules.danlon_step_review') },
        { label: t('dutySchedules.danlon_step_result') },
    ]
    return s.map((item, i) => ({
        ...item,
        status: stepNumber.value === 4 ? 'completed'
            : stepNumber.value > i + 1 ? 'completed'
                : stepNumber.value === i + 1 ? 'current'
                    : 'upcoming'
    }))
})

const danlonSyncProgressPercent = computed(() => {
    if (state.syncProgress.total === 0) return 0
    return Math.round((state.syncProgress.current / state.syncProgress.total) * 100)
})

const selectedEmployeeCount = computed(() => state.scheduleEmployees.filter(e => e.selected).length)

const matchedEmployeeCount = computed(() => state.scheduleEmployees.filter(e => e.matchedDanlonId).length)

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

function toggleSelectAll() {
    const shouldSelect = !allMatchedSelected.value
    state.scheduleEmployees.forEach(emp => {
        if (emp.matchedDanlonId) {
            emp.selected = shouldSelect
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
    state.showSavePresetInput = false
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

function handleConfigureNext() {
    state.configureAttempted = true
    if (!canProceedFromConfigure.value) return
    proceedToAssignRates()
}

function handleAssignRatesNext() {
    state.assignRatesAttempted = true
    if (!allTypesAssigned.value) return
    proceedToReview()
}

async function proceedToAssignRates() {
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

    state.isLoadingModalData = true

    try {
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

        state.assignRatesAttempted = false
        state.syncStep = 'assign-rates'
    } finally {
        state.isLoadingModalData = false
    }
}

async function proceedToReview() {
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

    state.isLoadingModalData = true

    try {
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
    } finally {
        state.isLoadingModalData = false
    }
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

    // Simulate progress while the bulk sync request is in flight, so the bar
    // doesn't just sit at 0% for the whole call.
    let simulatedProgress = 0
    const maxSimulated = Math.floor(allRegistrations.length * 0.9)
    const progressInterval = setInterval(() => {
        if (simulatedProgress < maxSimulated) {
            simulatedProgress++
            state.syncProgress.current = simulatedProgress
        }
    }, 200)

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
        clearInterval(progressInterval)
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
    state.showSavePresetInput = false
    state.configureAttempted = false
    state.assignRatesAttempted = false
    state.isSyncing = false
    state.syncProgress = { current: 0, total: 0, phase: '' }
    state.syncResult = []

    emit('close')
}

async function initModal() {
    loadPresets()

    state.isLoadingModalData = true

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
    } finally {
        state.isLoadingModalData = false
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
