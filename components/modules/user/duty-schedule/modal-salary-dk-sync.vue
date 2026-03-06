<template>
    <div>
        <!-- Salary.dk No Match Tooltip -->
        <Teleport to="body">
            <div v-if="state.noMatchTooltip.visible"
                class="fixed z-[9999] w-64 rounded bg-gray-800 px-3 py-2 text-xs font-normal text-white shadow-lg"
                :style="{ top: state.noMatchTooltip.y + 'px', left: state.noMatchTooltip.x + 'px' }">
                {{ $t('dutySchedules.salaryDk_no_match_info') }}
            </div>
        </Teleport>

        <!-- Salary.dk Modal -->
        <Modal size="lg" :title="$t('dutySchedules.salaryDk_sync')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <p class="text-sm text-gray-500 mb-4">{{ $t('dutySchedules.salaryDk_sync_description') }}</p>

                <!-- Step Progress Indicator -->
                <div class="flex items-center mb-6 px-2">
                    <template v-for="(step, idx) in steps" :key="idx">
                        <div class="flex flex-col items-center">
                            <div :class="[
                                'w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-300',
                                step.status === 'completed' ? 'bg-teal-600' :
                                    step.status === 'current' ? 'border-2 border-teal-600' :
                                        'border-2 border-gray-300'
                            ]">
                                <Icon v-if="step.status === 'completed'" name="ph:check-bold"
                                    class="w-4 h-4 text-white" />
                                <span v-else :class="[
                                    'text-sm font-semibold',
                                    step.status === 'current' ? 'text-teal-600' : 'text-gray-400'
                                ]">{{ idx + 1 }}</span>
                            </div>
                            <span :class="[
                                'text-xs mt-1.5 whitespace-nowrap',
                                step.status === 'completed' ? 'text-teal-600 font-medium' :
                                    step.status === 'current' ? 'text-teal-600 font-medium' :
                                        'text-gray-400'
                            ]">{{ step.label }}</span>
                        </div>
                        <div v-if="idx < steps.length - 1"
                            class="flex-1 h-0.5 mx-3 mt-[-1rem] rounded-full transition-colors duration-300"
                            :class="step.status === 'completed' ? 'bg-teal-600' : 'bg-gray-300'">
                        </div>
                    </template>
                </div>

                <LoadingSpinner :isActive="state.isLoadingModalData || state.isSyncing">

                    <!-- Step 1: Configure -->
                    <div v-if="state.syncStep === 'configure'" class="space-y-5">

                        <!-- Presets -->
                        <div class="space-y-2">
                            <FormLabel :label="$t('dutySchedules.salaryDk_presets')" />
                            <div class="flex items-center gap-2">
                                <select v-model="state.selectedPresetIndex"
                                    @change="state.selectedPresetIndex !== null && applyPreset(state.selectedPresetIndex)"
                                    class="flex-1 rounded border border-gray-300 px-3 py-2 text-sm">
                                    <option :value="null">{{ $t('dutySchedules.salaryDk_no_preset') }}</option>
                                    <option v-for="(preset, idx) in state.savedPresets" :key="idx"
                                        :value="idx">
                                        {{ preset.name }}
                                    </option>
                                </select>
                                <button v-if="state.selectedPresetIndex !== null" type="button"
                                    class="text-red-500 hover:text-red-700"
                                    @click="deletePreset(state.selectedPresetIndex!)">
                                    <Icon name="ph:trash" class="h-4 w-4" />
                                </button>
                            </div>
                            <div class="flex items-center gap-3">
                                <button v-if="!state.showSavePresetInput" type="button"
                                    class="text-xs text-primary hover:underline"
                                    @click="state.showSavePresetInput = true">
                                    {{ $t('dutySchedules.salaryDk_save_preset') }}
                                </button>
                                <button
                                    v-if="state.selectedPresetIndex !== null && !state.showSavePresetInput"
                                    type="button" class="text-xs text-primary hover:underline"
                                    @click="updatePreset(state.selectedPresetIndex!)">
                                    {{ $t('dutySchedules.salaryDk_update_preset') }}
                                </button>
                            </div>
                            <div v-if="state.showSavePresetInput" class="flex items-center gap-2">
                                <input v-model="state.newPresetName" type="text"
                                    :placeholder="$t('dutySchedules.salaryDk_preset_name_placeholder')"
                                    class="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
                                    @keyup.enter="saveCurrentAsPreset" />
                                <FormButton type="button" buttonStyle="primary" class="rounded-md text-xs"
                                    :disabled="!state.newPresetName.trim()"
                                    @click="saveCurrentAsPreset">
                                    {{ $t('save') }}
                                </FormButton>
                                <button type="button" class="text-xs text-gray-400 hover:text-gray-600"
                                    @click="state.showSavePresetInput = false; state.newPresetName = ''">
                                    {{ $t('cancel') }}
                                </button>
                            </div>
                        </div>

                        <!-- Pay Period -->
                        <div class="space-y-1">
                            <FormLabel :label="$t('dutySchedules.salaryDk_pay_period')" />
                            <select v-model="state.selectedPayPeriodType"
                                @change="state.selectedPayPeriodType && applyPayPeriodDateRange(state.selectedPayPeriodType)"
                                class="w-full rounded border border-gray-300 px-3 py-2 text-sm">
                                <option value="">{{ $t('dutySchedules.salaryDk_custom_period') }}</option>
                                <option value="monthly">{{ $t('dutySchedules.salaryDk_period_monthly') }}</option>
                                <option value="weekly">{{ $t('dutySchedules.salaryDk_period_weekly') }}</option>
                                <option value="biweekly">{{ $t('dutySchedules.salaryDk_period_biweekly') }}
                                </option>
                            </select>
                        </div>

                        <!-- Date Range -->
                        <div class="space-y-1">
                            <FormLabel :label="$t('dutySchedules.salaryDk_date_range')" />
                            <div
                                :class="{ 'rounded border border-red-500': state.configureAttempted && !state.syncDateRange?.length }">
                                <FormDateRangeField id="salarydk_date_range" name="salarydk_date_range"
                                    :placeholder="$t('dutySchedules.salaryDk_select_date_range')"
                                    v-model="state.syncDateRange" />
                            </div>
                            <FormError
                                v-if="state.configureAttempted && !state.syncDateRange?.length"
                                :error="$t('dutySchedules.salaryDk_validation_date_range')" />
                        </div>

                        <!-- Employee Selection -->
                        <div class="space-y-2">
                            <FormLabel :label="$t('dutySchedules.salaryDk_select_employees')" />
                            <div v-if="state.scheduleEmployees.length > 0">
                                <div class="flex w-fit cursor-pointer items-center gap-x-2 border-b border-gray-200 pb-2 text-sm font-medium"
                                    @click="toggleSelectAllEmployees">
                                    <div class="relative shrink-0">
                                        <FormCheckbox :value="state.selectAllEmployees" />
                                    </div>
                                    <span>{{ $t('dutySchedules.salaryDk_select_all') }}</span>
                                    <span class="text-gray-400">({{ selectedEmployeeCount }}/{{
                                        matchedEmployeeCount }})</span>
                                </div>

                                <div class="mt-2 max-h-60 space-y-3 overflow-y-auto">
                                    <!-- Matched employees -->
                                    <div class="space-y-1">
                                        <template v-for="(employee, idx) in state.scheduleEmployees"
                                            :key="employee.uuid">
                                            <div v-if="employee.matchedSalaryDkId"
                                                class="flex items-center gap-x-2 text-sm cursor-pointer"
                                                @click="toggleEmployeeSelection(idx)">
                                                <div class="relative shrink-0 pointer-events-none">
                                                    <FormCheckbox :value="employee.selected" />
                                                </div>
                                                <span>{{ employee.firstname }} {{ employee.lastname }}</span>
                                            </div>
                                        </template>
                                    </div>
                                    <!-- Unmatched employees -->
                                    <div
                                        v-if="state.scheduleEmployees.some(e => !e.matchedSalaryDkId)">
                                        <div class="mb-1 flex items-center gap-1 text-xs text-gray-400">
                                            <Icon name="ph:info"
                                                class="h-3.5 w-3.5 shrink-0 cursor-pointer hover:text-gray-600"
                                                @mouseenter="showNoMatchTooltip"
                                                @mouseleave="state.noMatchTooltip.visible = false" />
                                            <span>{{ $t('dutySchedules.salaryDk_no_match') }}</span>
                                        </div>
                                        <div class="space-y-1">
                                            <template
                                                v-for="(employee, idx) in state.scheduleEmployees"
                                                :key="'nm-' + employee.uuid">
                                                <div v-if="!employee.matchedSalaryDkId"
                                                    class="flex items-center gap-x-2 text-sm opacity-50">
                                                    <div class="relative shrink-0 pointer-events-none">
                                                        <FormCheckbox :value="false" :disabled="true" />
                                                    </div>
                                                    <span>{{ employee.firstname }} {{ employee.lastname
                                                        }}</span>
                                                    <span class="text-xs text-red-500">
                                                        {{ $t('dutySchedules.salaryDk_no_match_badge') }}
                                                    </span>
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p v-else class="text-sm text-gray-500">{{
                                $t('dutySchedules.salaryDk_no_employees') }}
                            </p>
                            <FormError
                                v-if="state.configureAttempted && selectedEmployeeCount === 0"
                                :error="$t('dutySchedules.salaryDk_validation_select_employee')" />
                        </div>

                        <!-- Action Buttons -->
                        <div class="mt-4 grid grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                @click="closeModal">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                :class="{ 'opacity-50': selectedEmployeeCount === 0 || !state.syncDateRange?.length }"
                                @click="handleConfigureNext">
                                {{ $t('next') }}
                            </FormButton>
                        </div>
                    </div>

                    <!-- Step 2: Assign Rates -->
                    <div v-else-if="state.syncStep === 'assign-rates'" class="space-y-4">
                        <p class="flex items-center justify-between text-sm text-gray-600">
                            <span>{{ $t('dutySchedules.salaryDk_assign_rates_description') }}</span>
                            <span class="relative group ml-2 cursor-pointer shrink-0">
                                <Icon name="ph:info" class="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                <span
                                    class="absolute right-0 top-6 z-10 hidden group-hover:block w-64 rounded bg-gray-800 px-3 py-2 text-xs text-white shadow-lg">
                                    {{ $t('dutySchedules.salaryDk_assign_rates_info') }}
                                </span>
                            </span>
                        </p>
                        <div class="max-h-96 space-y-3 overflow-y-auto">
                            <div v-for="emp in state.employeeShiftTypes" :key="emp.employeeUuid"
                                class="rounded-md border border-gray-200 p-3">
                                <p class="text-sm font-medium">{{ emp.employeeName }}</p>
                                <div class="mt-2 space-y-2">
                                    <div v-for="st in emp.shiftTypes" :key="st.name"
                                        class="flex items-center gap-x-3 text-sm">
                                        <span class="shrink-0">{{ st.name }}</span>
                                        <span class="text-xs text-gray-400">({{ st.shiftCount }})</span>
                                        <select v-model="st.selectedSalaryTypeId" :class="[
                                            'ml-auto max-w-[220px] rounded border px-2 py-1 text-xs',
                                            state.assignRatesAttempted && !st.selectedSalaryTypeId
                                                ? 'border-red-500 ring-1 ring-red-500'
                                                : 'border-gray-300']">
                                            <option value="" disabled>{{
                                                $t('dutySchedules.salaryDk_select_rate') }}
                                            </option>
                                            <option v-for="salaryType in emp.availableSalaryTypes"
                                                :key="salaryType.id" :value="salaryType.id">
                                                {{ salaryType.title }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Supplement & Deduction Type Assignments -->
                        <div v-if="state.employeeExtraHoursTypes.length > 0" class="mt-4 space-y-3">
                            <p class="text-sm font-medium text-gray-700">
                                {{ $t('dutySchedules.salaryDk_supplement_rates_title') }}
                            </p>
                            <p class="text-xs text-gray-500">
                                {{ $t('dutySchedules.salaryDk_supplement_rates_description') }}
                            </p>
                            <div class="max-h-72 space-y-3 overflow-y-auto">
                                <div v-for="emp in state.employeeExtraHoursTypes"
                                    :key="emp.employeeUuid" class="rounded-md border border-gray-200 p-3">
                                    <p class="text-sm font-medium">{{ emp.employeeName }}</p>
                                    <div class="mt-2 space-y-2">
                                        <div v-for="entry in emp.extraHoursEntries" :key="entry.type"
                                            class="flex items-center gap-x-3 text-sm">
                                            <span class="shrink-0">
                                                <span v-if="entry.type === 'add'"
                                                    class="inline-flex items-center gap-1 text-green-700">
                                                    <Icon name="ph:plus-circle" class="h-4 w-4" />
                                                    {{ $t('dutySchedules.salaryDk_supplement') }}
                                                </span>
                                                <span v-else
                                                    class="inline-flex items-center gap-1 text-red-700">
                                                    <Icon name="ph:minus-circle" class="h-4 w-4" />
                                                    {{ $t('dutySchedules.salaryDk_deduction') }}
                                                </span>
                                            </span>
                                            <span class="text-xs text-gray-400">
                                                ({{ entry.entryCount }}
                                                {{ entry.entryCount === 1
                                                    ? $t('dutySchedules.salaryDk_entry')
                                                    : $t('dutySchedules.salaryDk_entries') }},
                                                {{ entry.totalUnits }}{{
                                                    $t('dutySchedules.salaryDk_hours_let') }})
                                            </span>
                                            <select v-model="entry.selectedSupplementTypeId" :class="[
                                                'ml-auto max-w-[220px] rounded border px-2 py-1 text-xs',
                                                state.assignRatesAttempted && !entry.selectedSupplementTypeId
                                                    ? 'border-red-500 ring-1 ring-red-500'
                                                    : 'border-gray-300']">
                                                <option value="" disabled>
                                                    {{ $t('dutySchedules.salaryDk_select_rate') }}
                                                </option>
                                                <option v-for="sType in emp.availableSupplementTypes"
                                                    :key="sType.id" :value="sType.id">
                                                    {{ sType.title }}
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <FormError v-if="state.assignRatesAttempted && !allTypesAssigned"
                            :error="$t('dutySchedules.salaryDk_validation_assign_rates')" />

                        <div class="mt-4 grid grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                @click="state.syncStep = 'configure'">
                                {{ $t('back') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                :class="{ 'opacity-50': !allTypesAssigned }"
                                @click="handleAssignRatesNext">
                                {{ $t('dutySchedules.salaryDk_review') }}
                            </FormButton>
                        </div>
                    </div>

                    <!-- Step 3: Review -->
                    <div v-else-if="state.syncStep === 'review'" class="space-y-4">
                        <p class="text-sm text-gray-600">
                            {{ $t('dutySchedules.salaryDk_review_description', {
                                count:
                                    state.registrationsPreview.length +
                                    state.supplementRegistrationsPreview.length
                            }) }}
                        </p>
                        <div v-if="state.registrationsPreview.length > 0 || state.supplementRegistrationsPreview.length > 0"
                            class="max-h-96 divide-y divide-gray-200 overflow-y-auto rounded-md border border-gray-200">
                            <div v-for="group in groupedRegistrations" :key="group.salaryDkId">
                                <!-- Employee summary row -->
                                <div class="flex cursor-pointer items-center gap-x-2 px-3 py-2 hover:bg-gray-50"
                                    @click="toggleExpandEmployee(group.salaryDkId)">
                                    <Icon name="ph:caret-right"
                                        :class="['h-4 w-4 shrink-0 transition-transform', state.expandedEmployees.has(group.salaryDkId) ? 'rotate-90' : '']" />
                                    <span class="text-sm font-medium">{{ group.employeeName }}</span>
                                    <span v-if="group.hourRegistrations.length > 0"
                                        class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                        {{ group.hourRegistrations.length }} {{
                                            $t('dutySchedules.salaryDk_shifts') }}
                                    </span>
                                    <span v-if="group.supplementRegistrations.length > 0"
                                        class="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                                        {{ group.supplementRegistrations.length }} {{
                                            $t('dutySchedules.salaryDk_supplements') }}
                                    </span>
                                    <span class="ml-auto text-sm text-gray-500">
                                        <span v-if="group.totalHours > 0">{{ group.totalHours }}{{
                                            $t('dutySchedules.salaryDk_hours_let') }}</span>
                                        <span
                                            v-if="group.totalHours > 0 && (group.totalSupplementUnits > 0 || group.totalDeductionUnits > 0)">
                                            | </span>
                                        <span v-if="group.totalSupplementUnits > 0" class="text-green-600">+{{
                                            group.totalSupplementUnits
                                            }}{{ $t('dutySchedules.salaryDk_hours_let') }}</span>
                                        <span
                                            v-if="group.totalSupplementUnits > 0 && group.totalDeductionUnits > 0">
                                        </span>
                                        <span v-if="group.totalDeductionUnits > 0" class="text-red-600">-{{
                                            group.totalDeductionUnits
                                            }}{{ $t('dutySchedules.salaryDk_hours_let') }}</span>
                                    </span>
                                </div>
                                <!-- Expanded detail rows -->
                                <table
                                    v-if="state.expandedEmployees.has(group.salaryDkId) && (group.hourRegistrations.length > 0 || group.supplementRegistrations.length > 0)"
                                    class="w-full text-sm">
                                    <colgroup>
                                        <col style="width: 25%" />
                                        <col style="width: 25%" />
                                        <col style="width: 35%" />
                                        <col style="width: 15%" />
                                    </colgroup>
                                    <tbody class="divide-y divide-gray-50">
                                        <tr v-for="(reg, i) in group.hourRegistrations" :key="'h-' + i"
                                            class="bg-gray-50/50">
                                            <td class="py-1.5 pl-9 pr-3">{{ reg.date }}</td>
                                            <td class="px-3 py-1.5">{{ reg.shiftTypeName }}</td>
                                            <td class="px-3 py-1.5 text-xs text-gray-500">{{
                                                getTypeName(reg.salaryTypeId) }}
                                            </td>
                                            <td class="px-3 py-1.5 text-right">{{ reg.hours }}{{
                                                $t('dutySchedules.salaryDk_hours_let') }}</td>
                                        </tr>
                                        <tr v-for="(reg, i) in group.supplementRegistrations"
                                            :key="'s-' + i"
                                            :class="reg.type === 'add' ? 'bg-green-50/30' : 'bg-red-50/30'">
                                            <td class="py-1.5 pl-9 pr-3">{{ reg.periodFrom }} - {{
                                                reg.periodTo }}</td>
                                            <td class="px-3 py-1.5">
                                                <span v-if="reg.type === 'add'" class="text-green-700">{{
                                                    $t('dutySchedules.salaryDk_supplement') }}</span>
                                                <span v-else class="text-red-700">{{
                                                    $t('dutySchedules.salaryDk_deduction') }}</span>
                                            </td>
                                            <td class="px-3 py-1.5 text-xs text-gray-500">{{
                                                reg.supplementTypeName }}</td>
                                            <td class="px-3 py-1.5 text-right">{{ reg.units }}{{
                                                $t('dutySchedules.salaryDk_hours_let') }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div v-else class="py-8 text-center text-gray-400">
                            {{ $t('dutySchedules.salaryDk_no_registrations') }}
                        </div>
                        <div class="mt-4 grid grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                @click="state.syncStep = 'assign-rates'">
                                {{ $t('back') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                :disabled="state.registrationsPreview.length === 0 && state.supplementRegistrationsPreview.length === 0"
                                @click="executeSync">
                                {{ $t('dutySchedules.salaryDk_sync') }} ({{
                                    state.registrationsPreview.length +
                                    state.supplementRegistrationsPreview.length }})
                            </FormButton>
                        </div>
                    </div>

                    <!-- Step 4: Result -->
                    <div v-else-if="state.syncStep === 'result'" class="space-y-4 py-4">
                        <!-- Summary -->
                        <div class="text-center">
                            <Icon v-if="state.syncResult?.every((r: any) => r.success)"
                                name="ph:check-circle" class="mx-auto h-12 w-12 text-green-500" />
                            <Icon
                                v-else-if="state.syncResult?.some((r: any) => r.success)"
                                name="ph:warning-circle" class="mx-auto h-12 w-12 text-yellow-500" />
                            <Icon v-else name="ph:x-circle" class="mx-auto h-12 w-12 text-red-500" />
                            <p class="mt-2 text-lg font-medium">
                                {{ state.syncResult?.every((r: any) => r.success)
                                    ? $t('dutySchedules.salaryDk_sync_success')
                                    : state.syncResult?.some((r: any) => r.success)
                                        ? $t('dutySchedules.salaryDk_sync_partial')
                                        : $t('dutySchedules.salaryDk_sync_failed') }}
                            </p>
                        </div>

                        <!-- Per-employee results -->
                        <div class="max-h-60 space-y-2 overflow-y-auto">
                            <div v-for="(result, idx) in state.syncResult" :key="idx" :class="[
                                'flex items-center justify-between rounded-md px-3 py-2 text-sm',
                                result.success ? 'bg-green-50' : 'bg-red-50']">
                                <div class="flex items-center gap-2">
                                    <Icon :name="result.success ? 'ph:check-circle' : 'ph:x-circle'"
                                        :class="result.success ? 'h-4 w-4 text-green-600' : 'h-4 w-4 text-red-600'" />
                                    <span class="font-medium">{{ result.employeeName }}</span>
                                    <span class="text-xs text-gray-500">
                                        ({{ result.count }} {{ result.type === 'hours'
                                            ? $t('dutySchedules.salaryDk_registrations')
                                            : $t('dutySchedules.salaryDk_supplement_registrations') }})
                                    </span>
                                </div>
                                <span v-if="!result.success"
                                    class="relative group ml-2 max-w-[200px] text-xs text-red-600 cursor-pointer">
                                    <span class="block truncate">{{ result.error }}</span>
                                    <span
                                        class="absolute right-0 bottom-full mb-1 z-10 hidden group-hover:block w-72 rounded bg-gray-800 px-3 py-2 text-xs font-normal text-white shadow-lg whitespace-normal">
                                        {{ result.error }}
                                    </span>
                                </span>
                            </div>
                        </div>

                        <FormButton type="button" buttonStyle="primary" class="w-full rounded-md"
                            @click="closeModal">
                            {{ $t('close') }}
                        </FormButton>
                    </div>

                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { salaryDkService } from '@/components/api/user/SalaryDkService'
import { dutyScheduleService } from '@/components/api/user/DutyScheduleService'
import { extraHoursService } from '@/components/api/user/ExtraHoursService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { PropType } from 'vue'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    scheduleEmployees: {
        type: Array as PropType<any[]>,
        required: true,
    },
    departmentName: {
        type: String,
        required: true,
    },
})

const emit = defineEmits(['close'])

const { t, locale } = useI18n()
const { successAlert, errorAlert } = useAlert()

const state = reactive({
    isLoadingModalData: false,
    isSyncing: false,
    syncStep: 'configure' as 'configure' | 'assign-rates' | 'review' | 'result',
    syncDateRange: [] as any,
    scheduleEmployees: [] as Array<{
        uuid: string; firstname: string; lastname: string;
        selected: boolean; matchedSalaryDkId: string | null;
    }>,
    selectAllEmployees: true,
    employeesRaw: [] as any[],
    salaryTypesRaw: [] as any[],
    supplementTypesRaw: [] as any[],
    fetchedScheduleData: [] as any[],
    fetchedExtraHoursData: [] as any[],
    employeeShiftTypes: [] as Array<{
        employeeUuid: string; employeeName: string; salaryDkId: string;
        shiftTypes: Array<{ name: string; shiftCount: number; selectedSalaryTypeId: string }>;
        availableSalaryTypes: Array<{ id: string; title: string }>;
    }>,
    employeeExtraHoursTypes: [] as Array<{
        employeeUuid: string; employeeName: string; salaryDkId: string;
        extraHoursEntries: Array<{
            type: 'add' | 'deduct'; entryCount: number;
            totalUnits: number; selectedSupplementTypeId: string;
        }>;
        availableSupplementTypes: Array<{ id: string; title: string }>;
    }>,
    registrationsPreview: [] as Array<{
        employeeName: string; date: string; shiftTypeName: string;
        hours: number; salaryDkId: string; salaryTypeId: string;
    }>,
    supplementRegistrationsPreview: [] as Array<{
        employeeName: string; periodFrom: string; periodTo: string;
        type: 'add' | 'deduct'; units: number;
        supplementTypeId: string; supplementTypeName: string; salaryDkId: string;
    }>,
    syncResult: null as any,
    expandedEmployees: new Set<string>(),
    configureAttempted: false,
    assignRatesAttempted: false,
    savedPresets: [] as Array<{ name: string; employeeUuids: string[]; payPeriodType: '' | 'monthly' | 'weekly' | 'biweekly' }>,
    selectedPresetIndex: null as number | null,
    newPresetName: '' as string,
    showSavePresetInput: false,
    selectedPayPeriodType: '' as '' | 'monthly' | 'weekly' | 'biweekly',
    noMatchTooltip: { visible: false, x: 0, y: 0 },
})

// --- Computed ---

const stepNumber = computed(() => {
    const map: Record<string, number> = { 'configure': 1, 'assign-rates': 2, 'review': 3, 'result': 4 }
    return map[state.syncStep] || 1
})

const steps = computed(() => {
    const s = [
        { label: t('dutySchedules.salaryDk_step_configure') },
        { label: t('dutySchedules.salaryDk_step_assign_rates') },
        { label: t('dutySchedules.salaryDk_step_review') },
        { label: t('dutySchedules.salaryDk_step_result') },
    ]
    return s.map((item, i) => ({
        ...item,
        status: stepNumber.value === 4 ? 'completed'
            : stepNumber.value > i + 1 ? 'completed'
                : stepNumber.value === i + 1 ? 'current'
                    : 'upcoming'
    }))
})

const selectedEmployeeCount = computed(() =>
    state.scheduleEmployees.filter(e => e.selected).length
)

const matchedEmployeeCount = computed(() =>
    state.scheduleEmployees.filter(e => e.matchedSalaryDkId).length
)

const allTypesAssigned = computed(() => {
    const hourTypesOk = state.employeeShiftTypes.every(emp =>
        emp.shiftTypes.every(st => st.selectedSalaryTypeId)
    )
    const supplementTypesOk = state.employeeExtraHoursTypes.every(emp =>
        emp.extraHoursEntries.every(entry => entry.selectedSupplementTypeId)
    )
    return hourTypesOk && supplementTypesOk
})

function getTypeName(typeId: string): string {
    const salaryType = state.salaryTypesRaw.find((r: any) => String(r.id) === String(typeId))
    return salaryType?.title || ''
}

const groupedRegistrations = computed(() => {
    const groups = new Map<string, {
        salaryDkId: string; employeeName: string;
        hourRegistrations: typeof state.registrationsPreview;
        supplementRegistrations: typeof state.supplementRegistrationsPreview;
        totalHours: number; totalSupplementUnits: number; totalDeductionUnits: number;
    }>()

    for (const reg of state.registrationsPreview) {
        if (!groups.has(reg.salaryDkId)) {
            groups.set(reg.salaryDkId, {
                salaryDkId: reg.salaryDkId, employeeName: reg.employeeName,
                hourRegistrations: [], supplementRegistrations: [],
                totalHours: 0, totalSupplementUnits: 0, totalDeductionUnits: 0,
            })
        }
        const group = groups.get(reg.salaryDkId)!
        group.hourRegistrations.push(reg)
        group.totalHours = Math.round((group.totalHours + reg.hours) * 100) / 100
    }

    for (const reg of state.supplementRegistrationsPreview) {
        if (!groups.has(reg.salaryDkId)) {
            groups.set(reg.salaryDkId, {
                salaryDkId: reg.salaryDkId, employeeName: reg.employeeName,
                hourRegistrations: [], supplementRegistrations: [],
                totalHours: 0, totalSupplementUnits: 0, totalDeductionUnits: 0,
            })
        }
        const group = groups.get(reg.salaryDkId)!
        group.supplementRegistrations.push(reg)
        if (reg.type === 'add') {
            group.totalSupplementUnits = Math.round((group.totalSupplementUnits + reg.units) * 100) / 100
        } else {
            group.totalDeductionUnits = Math.round((group.totalDeductionUnits + reg.units) * 100) / 100
        }
    }

    return Array.from(groups.values())
})

// --- Functions ---

function closeModal() {
    emit('close')
}

function matchEmployee(localEmployee: any, salaryDkEmployees: any[]): string | null {
    for (const sde of salaryDkEmployees) {
        const sdkId = String(sde.id || '')
        const sdkEmail = (sde.email || '').toLowerCase().trim()
        const sdkName = (sde.name || '').toLowerCase().trim()

        if (localEmployee.salary_dk_id && String(localEmployee.salary_dk_id) === sdkId) return sdkId
        const localEmail = (localEmployee.email || '').toLowerCase().trim()
        if (sdkEmail && localEmail && sdkEmail === localEmail) return sdkId
        const localName = `${localEmployee.firstname || ''} ${localEmployee.lastname || ''}`.toLowerCase().trim()
        if (sdkName && localName && sdkName.length > 2 && localName.length > 2 && sdkName === localName) return sdkId
    }
    return null
}

function toggleExpandEmployee(salaryDkId: string) {
    if (state.expandedEmployees.has(salaryDkId)) {
        state.expandedEmployees.delete(salaryDkId)
    } else {
        state.expandedEmployees.add(salaryDkId)
    }
}

function showNoMatchTooltip(event: MouseEvent) {
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    state.noMatchTooltip = {
        visible: true,
        x: rect.left,
        y: rect.bottom + 6,
    }
}

function toggleSelectAllEmployees() {
    state.selectAllEmployees = !state.selectAllEmployees
    state.scheduleEmployees
        .filter(e => e.matchedSalaryDkId)
        .forEach(e => e.selected = state.selectAllEmployees)
}

function toggleEmployeeSelection(index: number) {
    if (!state.scheduleEmployees[index].matchedSalaryDkId) return
    state.scheduleEmployees[index].selected = !state.scheduleEmployees[index].selected
    state.selectAllEmployees = state.scheduleEmployees
        .filter(e => e.matchedSalaryDkId)
        .every(e => e.selected)
}

// --- Preset functions ---

function loadPresets() {
    try {
        const raw = localStorage.getItem('salary_dk_sync_presets')
        state.savedPresets = raw ? JSON.parse(raw) : []
    } catch { state.savedPresets = [] }
}

function savePresetsToStorage() {
    localStorage.setItem('salary_dk_sync_presets', JSON.stringify(state.savedPresets))
}

function saveCurrentAsPreset() {
    if (!state.newPresetName.trim()) return
    const preset = {
        name: state.newPresetName.trim(),
        employeeUuids: state.scheduleEmployees.filter(e => e.selected).map(e => e.uuid),
        payPeriodType: (state.selectedPayPeriodType || '') as '' | 'monthly' | 'weekly' | 'biweekly',
    }
    state.savedPresets.push(preset)
    savePresetsToStorage()
    state.selectedPresetIndex = state.savedPresets.length - 1
    state.newPresetName = ''
    state.showSavePresetInput = false
}

function applyPreset(index: number) {
    const preset = state.savedPresets[index]
    if (!preset) return
    state.selectedPresetIndex = index

    state.scheduleEmployees.forEach(emp => {
        if (emp.matchedSalaryDkId) {
            emp.selected = preset.employeeUuids.includes(emp.uuid)
        }
    })
    state.selectAllEmployees = state.scheduleEmployees
        .filter(e => e.matchedSalaryDkId)
        .every(e => e.selected)

    if (preset.payPeriodType) {
        state.selectedPayPeriodType = preset.payPeriodType
        applyPayPeriodDateRange(preset.payPeriodType)
    }
}

function deletePreset(index: number) {
    state.savedPresets.splice(index, 1)
    savePresetsToStorage()
    if (state.selectedPresetIndex === index) state.selectedPresetIndex = null
    else if (state.selectedPresetIndex !== null && state.selectedPresetIndex > index) state.selectedPresetIndex--
}

function updatePreset(index: number) {
    state.savedPresets[index] = {
        ...state.savedPresets[index],
        employeeUuids: state.scheduleEmployees.filter(e => e.selected).map(e => e.uuid),
        payPeriodType: (state.selectedPayPeriodType || '') as '' | 'monthly' | 'weekly' | 'biweekly',
    }
    savePresetsToStorage()
}

function applyPayPeriodDateRange(type: string) {
    const today = moment()
    let from: moment.Moment
    let to: moment.Moment

    if (type === 'monthly') {
        from = today.clone().startOf('month')
        to = today.clone().endOf('month')
    } else if (type === 'weekly') {
        from = today.clone().startOf('isoWeek')
        to = today.clone().endOf('isoWeek')
    } else if (type === 'biweekly') {
        const weekNum = today.isoWeek()
        const isEvenWeek = weekNum % 2 === 0
        if (isEvenWeek) {
            from = today.clone().subtract(1, 'week').startOf('isoWeek')
            to = today.clone().endOf('isoWeek')
        } else {
            from = today.clone().startOf('isoWeek')
            to = today.clone().add(1, 'week').endOf('isoWeek')
        }
    } else return

    state.syncDateRange = [from.format('YYYY-MM-DD'), to.format('YYYY-MM-DD')]
}

// --- Step handlers ---

function handleConfigureNext() {
    state.configureAttempted = true
    const isValid = selectedEmployeeCount.value > 0 && state.syncDateRange?.length
    if (!isValid) return
    fetchAndBuildShiftTypes()
}

function handleAssignRatesNext() {
    state.assignRatesAttempted = true
    if (!allTypesAssigned.value) return
    buildRegistrationsPreview()
}

async function fetchAndBuildShiftTypes() {
    const dateRange = state.syncDateRange
    if (!dateRange?.length || !dateRange[0] || !dateRange[1]) {
        errorAlert(t('alert.warning'), t('dutySchedules.salaryDk_select_date_range'))
        return
    }

    const selectedEmployees = state.scheduleEmployees.filter(e => e.selected && e.matchedSalaryDkId)
    if (selectedEmployees.length === 0) {
        errorAlert(t('alert.warning'), t('dutySchedules.salaryDk_no_matched_employees'))
        return
    }

    state.isSyncing = true

    try {
        const startDate = dateRange[0]
        const endDate = dateRange[1]

        const weekStarts: string[] = []
        const cursor = moment(startDate).startOf('isoWeek')
        const rangeEnd = moment(endDate)
        while (cursor.isSameOrBefore(rangeEnd)) {
            weekStarts.push(cursor.format('YYYY-MM-DD'))
            cursor.add(1, 'week')
        }

        const selectedEmployeeUuids = new Set(selectedEmployees.map(e => e.uuid))
        const employeeSdkIdMap = new Map(selectedEmployees.map(e => [e.uuid, e.matchedSalaryDkId]))
        const startMoment = moment(startDate)
        const endMoment = moment(endDate)

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
        state.fetchedScheduleData = allScheduleData

        const empShiftMap = new Map<string, { name: string; salaryDkId: string; shiftTypes: Map<string, number> }>()

        for (const empSchedule of allScheduleData) {
            if (!selectedEmployeeUuids.has(empSchedule.uuid)) continue
            const salaryDkId = employeeSdkIdMap.get(empSchedule.uuid)
            if (!salaryDkId) continue

            const empName = `${empSchedule.firstname || ''} ${empSchedule.lastname || ''}`.trim()
            if (!empShiftMap.has(empSchedule.uuid)) {
                empShiftMap.set(empSchedule.uuid, { name: empName, salaryDkId, shiftTypes: new Map() })
            }
            const empData = empShiftMap.get(empSchedule.uuid)!
            const days = Object.values(empSchedule.weeks || {}) as any[]

            for (const day of days) {
                if (!day?.date) continue
                const dateMoment = moment(day.date)
                if (dateMoment.isBefore(startMoment) || dateMoment.isAfter(endMoment)) continue

                for (const shift of (day.shifts || [])) {
                    const from = shift.date_time_start
                    const to = shift.date_time_end
                    if (!from || !to) continue
                    const hours = moment(to).diff(moment(from), 'hours', true)
                    if (hours <= 0) continue

                    const shiftTypeName = locale.value === 'dk'
                        ? (shift.type?.dk_name || shift.type?.en_name || t('dutySchedules.salaryDk_unknown_shift'))
                        : (shift.type?.en_name || shift.type?.dk_name || t('dutySchedules.salaryDk_unknown_shift'))

                    empData.shiftTypes.set(shiftTypeName, (empData.shiftTypes.get(shiftTypeName) || 0) + 1)
                }
            }
        }

        const allSalaryTypeOptions = state.salaryTypesRaw.map((st: any) => ({
            id: String(st.id),
            title: st.title || st.description || `Type ${st.id}`,
        }))

        state.employeeShiftTypes = Array.from(empShiftMap.entries())
            .filter(([_, data]) => data.shiftTypes.size > 0)
            .map(([uuid, data]) => ({
                employeeUuid: uuid,
                employeeName: data.name,
                salaryDkId: data.salaryDkId,
                shiftTypes: Array.from(data.shiftTypes.entries()).map(([name, count]) => ({
                    name,
                    shiftCount: count,
                    selectedSalaryTypeId: allSalaryTypeOptions.length === 1 ? allSalaryTypeOptions[0].id : '',
                })),
                availableSalaryTypes: allSalaryTypeOptions,
            }))

        // Extra hours / supplements
        const extraHoursPromises = selectedEmployees.map(emp =>
            extraHoursService.getExtraHours({
                user_uuid: emp.uuid,
                start_date: startDate,
                end_date: endDate,
                extra_hours_status: 'approved',
                page_length: 500,
            }).catch(() => ({ data: [] }))
        )
        const extraHoursResults = await Promise.all(extraHoursPromises)

        const allExtraHours: any[] = []
        extraHoursResults.forEach((result, index) => {
            const entries = result?.data || []
            if (Array.isArray(entries)) {
                entries.forEach((entry: any) => {
                    allExtraHours.push({
                        ...entry,
                        _localEmployeeUuid: selectedEmployees[index].uuid,
                    })
                })
            }
        })
        state.fetchedExtraHoursData = allExtraHours

        const empExtraMap = new Map<string, {
            name: string; salaryDkId: string;
            addCount: number; addUnits: number; deductCount: number; deductUnits: number;
        }>()

        for (const eh of allExtraHours) {
            const empUuid = eh._localEmployeeUuid || eh.user_uuid
            if (!selectedEmployeeUuids.has(empUuid)) continue
            const emp = selectedEmployees.find(e => e.uuid === empUuid)
            if (!emp) continue

            if (!empExtraMap.has(empUuid)) {
                const empSchedule = allScheduleData.find((s: any) => s.uuid === empUuid)
                const empName = empSchedule
                    ? `${empSchedule.firstname || ''} ${empSchedule.lastname || ''}`.trim()
                    : `${emp.firstname} ${emp.lastname}`.trim()
                empExtraMap.set(empUuid, {
                    name: empName,
                    salaryDkId: emp.matchedSalaryDkId!,
                    addCount: 0, addUnits: 0,
                    deductCount: 0, deductUnits: 0,
                })
            }
            const data = empExtraMap.get(empUuid)!
            if (eh.extra_hours_type === 'add') {
                data.addCount++
                data.addUnits += Number(eh.extra_hours) || 0
            } else if (eh.extra_hours_type === 'deduct') {
                data.deductCount++
                data.deductUnits += Number(eh.extra_hours) || 0
            }
        }

        const allSupplementTypeOptions = state.supplementTypesRaw.map((st: any) => ({
            id: String(st.id),
            title: st.title || st.description || `Type ${st.id}`,
        }))

        state.employeeExtraHoursTypes = Array.from(empExtraMap.entries())
            .filter(([_, data]) => data.addCount > 0 || data.deductCount > 0)
            .map(([uuid, data]) => {
                const entries: Array<{
                    type: 'add' | 'deduct'; entryCount: number;
                    totalUnits: number; selectedSupplementTypeId: string;
                }> = []

                if (data.addCount > 0) {
                    entries.push({
                        type: 'add',
                        entryCount: data.addCount,
                        totalUnits: Math.round(data.addUnits * 100) / 100,
                        selectedSupplementTypeId: allSupplementTypeOptions.length === 1 ? allSupplementTypeOptions[0].id : '',
                    })
                }
                if (data.deductCount > 0) {
                    entries.push({
                        type: 'deduct',
                        entryCount: data.deductCount,
                        totalUnits: Math.round(data.deductUnits * 100) / 100,
                        selectedSupplementTypeId: allSupplementTypeOptions.length === 1 ? allSupplementTypeOptions[0].id : '',
                    })
                }

                return {
                    employeeUuid: uuid,
                    employeeName: data.name,
                    salaryDkId: data.salaryDkId,
                    extraHoursEntries: entries,
                    availableSupplementTypes: allSupplementTypeOptions,
                }
            })

        state.syncStep = 'assign-rates'
        state.assignRatesAttempted = false
    } catch (e: any) {
        errorAlert(t('alert.error'), e?.message || 'Failed to load schedule data')
    } finally {
        state.isSyncing = false
    }
}

function buildRegistrationsPreview() {
    const dateRange = state.syncDateRange
    const startMoment = moment(dateRange[0])
    const endMoment = moment(dateRange[1])
    const periodFrom = moment(dateRange[0]).format('YYYY-MM-DD')
    const periodTo = moment(dateRange[1]).format('YYYY-MM-DD')
    const selectedEmployees = state.scheduleEmployees.filter(e => e.selected && e.matchedSalaryDkId)
    const selectedEmployeeUuids = new Set(selectedEmployees.map(e => e.uuid))
    const employeeSdkIdMap = new Map(selectedEmployees.map(e => [e.uuid, e.matchedSalaryDkId]))

    const typeLookup = new Map<string, string>()
    for (const emp of state.employeeShiftTypes) {
        for (const st of emp.shiftTypes) {
            typeLookup.set(`${emp.salaryDkId}::${st.name}`, st.selectedSalaryTypeId)
        }
    }

    const registrations: typeof state.registrationsPreview = []

    for (const empSchedule of state.fetchedScheduleData) {
        if (!selectedEmployeeUuids.has(empSchedule.uuid)) continue
        const salaryDkId = employeeSdkIdMap.get(empSchedule.uuid)
        if (!salaryDkId) continue

        const empName = `${empSchedule.firstname || ''} ${empSchedule.lastname || ''}`.trim()
        const days = Object.values(empSchedule.weeks || {}) as any[]

        for (const day of days) {
            if (!day?.date) continue
            const dateMoment = moment(day.date)
            if (dateMoment.isBefore(startMoment) || dateMoment.isAfter(endMoment)) continue

            for (const shift of (day.shifts || [])) {
                const from = shift.date_time_start
                const to = shift.date_time_end
                if (!from || !to) continue

                const hours = Math.round(moment(to).diff(moment(from), 'hours', true) * 100) / 100
                if (hours <= 0) continue

                const shiftTypeName = locale.value === 'dk'
                    ? (shift.type?.dk_name || shift.type?.en_name || t('dutySchedules.salaryDk_unknown_shift'))
                    : (shift.type?.en_name || shift.type?.dk_name || t('dutySchedules.salaryDk_unknown_shift'))

                registrations.push({
                    employeeName: empName,
                    date: day.date,
                    shiftTypeName,
                    hours,
                    salaryDkId,
                    salaryTypeId: typeLookup.get(`${salaryDkId}::${shiftTypeName}`) || '',
                })
            }
        }
    }

    state.registrationsPreview = registrations

    // Build supplement registrations preview
    const supplementTypeLookup = new Map<string, { typeId: string; typeName: string }>()
    for (const emp of state.employeeExtraHoursTypes) {
        for (const entry of emp.extraHoursEntries) {
            const typeObj = state.supplementTypesRaw.find(
                (r: any) => String(r.id) === entry.selectedSupplementTypeId
            )
            supplementTypeLookup.set(`${emp.employeeUuid}::${entry.type}`, {
                typeId: entry.selectedSupplementTypeId,
                typeName: typeObj?.title || '',
            })
        }
    }

    const supplementRegs: typeof state.supplementRegistrationsPreview = []
    for (const eh of state.fetchedExtraHoursData) {
        const empUuid = eh._localEmployeeUuid || eh.user_uuid
        if (!selectedEmployeeUuids.has(empUuid)) continue

        const emp = selectedEmployees.find(e => e.uuid === empUuid)
        if (!emp) continue

        const ehDate = moment(eh.date)
        if (ehDate.isBefore(startMoment) || ehDate.isAfter(endMoment)) continue

        const typeInfo = supplementTypeLookup.get(`${empUuid}::${eh.extra_hours_type}`)
        if (!typeInfo) continue

        const empData = state.employeeExtraHoursTypes.find(e => e.employeeUuid === empUuid)

        supplementRegs.push({
            employeeName: empData?.employeeName || `${emp.firstname} ${emp.lastname}`.trim(),
            periodFrom,
            periodTo,
            type: eh.extra_hours_type,
            units: Number(eh.extra_hours) || 0,
            supplementTypeId: typeInfo.typeId,
            supplementTypeName: typeInfo.typeName,
            salaryDkId: emp.matchedSalaryDkId!,
        })
    }
    state.supplementRegistrationsPreview = supplementRegs

    state.syncStep = 'review'
}

function parseError(e: any): string {
    const rawMsg = e?.data?.message || e?.response?._data?.message || e?.message || ''
    let errorMsg = rawMsg
    try {
        const parsed = JSON.parse(rawMsg)
        errorMsg = parsed?.message || rawMsg
    } catch { /* not JSON, use as-is */ }

    if (errorMsg.includes('ALREADY_EXISTS')) return t('dutySchedules.salaryDk_error_already_exists')
    if (errorMsg.includes('INVALID_PERIOD')) return t('dutySchedules.salaryDk_error_invalid_period')
    if (errorMsg.includes('NOT_FOUND') || errorMsg.includes('not found')) return t('dutySchedules.salaryDk_error_employee_not_found')
    return errorMsg || t('dutySchedules.salaryDk_sync_failed')
}

async function executeSync() {
    const hasHourRegs = state.registrationsPreview.length > 0
    const hasSupplementRegs = state.supplementRegistrationsPreview.length > 0
    if (!hasHourRegs && !hasSupplementRegs) return

    state.isSyncing = true

    const results: Array<{ employeeName: string; type: 'hours' | 'supplements'; success: boolean; error?: string; count: number }> = []

    // Group hour registrations by employee for bulk submit
    const hoursByEmployee = new Map<string, { name: string; regs: any[] }>()
    for (const reg of state.registrationsPreview) {
        if (reg.hours <= 0) continue
        if (!hoursByEmployee.has(reg.salaryDkId)) {
            hoursByEmployee.set(reg.salaryDkId, { name: reg.employeeName, regs: [] })
        }
        hoursByEmployee.get(reg.salaryDkId)!.regs.push({
            employeeID: Number(reg.salaryDkId),
            salaryTypeID: Number(reg.salaryTypeId),
            date: reg.date,
            hours: reg.hours,
        })
    }

    // Send all time registrations in a single bulk call
    const allHourRegs = Array.from(hoursByEmployee.values()).flatMap(({ regs }) => regs)
    if (allHourRegs.length > 0) {
        try {
            await salaryDkService.syncTimeRegistrations(allHourRegs)
            for (const [_, { name, regs }] of hoursByEmployee) {
                results.push({ employeeName: name, type: 'hours', success: true, count: regs.length })
            }
        } catch (e: any) {
            for (const [_, { name, regs }] of hoursByEmployee) {
                results.push({ employeeName: name, type: 'hours', success: false, error: parseError(e), count: regs.length })
            }
        }
    }

    // Send supplement registrations one at a time (coarse endpoint is not bulk)
    const supplementsByEmployee = new Map<string, { name: string; regs: any[] }>()
    for (const reg of state.supplementRegistrationsPreview) {
        if (!supplementsByEmployee.has(reg.salaryDkId)) {
            supplementsByEmployee.set(reg.salaryDkId, { name: reg.employeeName, regs: [] })
        }
        supplementsByEmployee.get(reg.salaryDkId)!.regs.push({
            employeeID: Number(reg.salaryDkId),
            salaryTypeID: Number(reg.supplementTypeId),
            periodFrom: reg.periodFrom,
            periodTo: reg.periodTo,
            hours: reg.units,
        })
    }

    for (const [_, { name, regs }] of supplementsByEmployee) {
        let successCount = 0
        let lastError = ''
        for (const reg of regs) {
            try {
                await salaryDkService.syncCoarseTimeRegistration(reg)
                successCount++
            } catch (e: any) {
                lastError = parseError(e)
            }
        }
        if (successCount === regs.length) {
            results.push({ employeeName: name, type: 'supplements', success: true, count: regs.length })
        } else if (successCount > 0) {
            results.push({ employeeName: name, type: 'supplements', success: false, error: `${successCount}/${regs.length} succeeded. ${lastError}`, count: regs.length })
        } else {
            results.push({ employeeName: name, type: 'supplements', success: false, error: lastError, count: regs.length })
        }
    }

    state.syncResult = results
    state.syncStep = 'result'
    state.isSyncing = false

    const successCount = results.filter(r => r.success).reduce((sum, r) => sum + r.count, 0)
    const failCount = results.filter(r => !r.success).reduce((sum, r) => sum + r.count, 0)

    if (failCount === 0) {
        successAlert(`${t('alert.success')}!`, t('dutySchedules.salaryDk_sync_success'))
    } else if (successCount > 0) {
        errorAlert(t('alert.warning'), t('dutySchedules.salaryDk_sync_partial'))
    } else {
        errorAlert(t('alert.error'), t('dutySchedules.salaryDk_sync_failed'))
    }
}

// --- Init on open ---

watch(() => props.isModalOpen, async (isOpen: boolean) => {
    if (!isOpen) return

    state.syncStep = 'configure'
    state.isLoadingModalData = true
    state.syncResult = null
    state.registrationsPreview = []
    state.supplementRegistrationsPreview = []
    state.expandedEmployees.clear()
    state.syncDateRange = []
    state.salaryTypesRaw = []
    state.supplementTypesRaw = []
    state.fetchedScheduleData = []
    state.fetchedExtraHoursData = []
    state.employeeShiftTypes = []
    state.employeeExtraHoursTypes = []
    state.selectedPresetIndex = null
    state.selectedPayPeriodType = ''
    state.newPresetName = ''
    state.showSavePresetInput = false
    state.configureAttempted = false
    state.assignRatesAttempted = false
    loadPresets()

    try {
        const [employeesRes, salaryTypesRes, supplementTypesRes] = await Promise.all([
            salaryDkService.getEmployees(),
            salaryDkService.getSalaryTypes(),
            salaryDkService.getSupplementTypes(),
        ])

        state.employeesRaw = employeesRes?.data || []
        state.salaryTypesRaw = salaryTypesRes?.data || []
        state.supplementTypesRaw = supplementTypesRes?.data || []

        state.scheduleEmployees = props.scheduleEmployees.map((emp: any) => {
            const matchedId = matchEmployee(emp, state.employeesRaw)
            return {
                uuid: emp.uuid,
                firstname: emp.firstname || emp.firstName || '',
                lastname: emp.lastname || emp.lastName || '',
                selected: matchedId !== null,
                matchedSalaryDkId: matchedId,
            }
        })
        state.selectAllEmployees = state.scheduleEmployees
            .filter(e => e.matchedSalaryDkId)
            .every(e => e.selected)

    } catch (e: any) {
        errorAlert(t('alert.error'), e?.message || 'Failed to load Salary.dk data')
    } finally {
        state.isLoadingModalData = false
    }
})
</script>
