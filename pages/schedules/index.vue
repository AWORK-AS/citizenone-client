<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>

                    {{ customPagesStore.getCustomPagesName?.dutySchedules }}
                    -
                    {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb>
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/schedules')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.dutySchedules }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #guided-tour>
                <div class="flex flex-wrap items-center gap-3">
                    <button @click="state.modal.isShowAllShiftTypes = !state.modal.isShowAllShiftTypes"
                        class="text-primary text-sm hover:text-primary-700">
                        {{ $t('dutySchedules.showTheDistributionOfShiftTypes') }}
                    </button>
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/schedules/draft')"
                        v-if="isAdmin(userStore.getUser?.role)">
                        <Icon name="ph:note" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('dutySchedules.draft.pageTitle') }}
                    </FormButton>
                    <FormButton buttonStyle="action" class="rounded-lg" @click="state.modal.isDownloadOpen = true">
                        <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('dutySchedules.download.download') }}
                    </FormButton>
                    <FormButton v-if="state.isZenegyConnected"
                        class="rounded-lg !bg-green-700 !border-green-700 !text-white hover:!bg-green-800"
                        @click="openZenegySyncModal">
                        <Icon name="ph:arrows-clockwise" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('dutySchedules.zenegy_sync') }}
                    </FormButton>
                    <Tooltip :text="$t('dutySchedules.shareDutySchedule.shareDutySchedule')"
                        @click="state.modal.isViewSharedDutyScheduleOpen = true">
                        <Icon name="ph:share-fat" class="size-6 cursor-pointer text-gray-700" aria-hidden="true" />
                    </Tooltip>
                    <Tooltip :text="$t('dutySchedules.activityLogs')" @click="openDutySchedulesActivityLogs()">
                        <Icon name="ph:clock-counter-clockwise" class="size-6 cursor-pointer text-gray-700"
                            aria-hidden="true" />
                    </Tooltip>
                    <Tooltip :text="$t('guidedTour')" @click="openGuidedTour()">
                        <Icon name="ph:question" class="size-6 cursor-pointer text-gray-700" aria-hidden="true" />
                    </Tooltip>
                </div>
            </template>

            <!-- <div class="flex items-center gap-x-3">
                <FormButton :buttonStyle="state.calendarView === 'default' ? 'primary' : ''"
                    @click="setCalendarView('default')" class="rounded-md">
                    {{ $t('calendar.view.defaultView') }}
                </FormButton>
                <FormButton :buttonStyle="state.calendarView === 'week' ? 'primary' : ''"
                    @click="setCalendarView('week')" class="rounded-md">
                    {{ $t('calendar.view.weekView') }}
                </FormButton>
                <FormButton :buttonStyle="state.calendarView === 'month' ? 'primary' : ''"
                    @click="setCalendarView('month')" class="rounded-md">
                    {{ $t('calendar.view.monthView') }}
                </FormButton>
            </div> -->

            <div class="-mt-4 space-y-5">
                <ModulesUserDutyScheduleWeekView ref="weekViewRef" v-if="state.calendarView === 'week'"
                    @setDutyScheduleCurrentDate="setDutyScheduleCurrentDate"
                    @setDutyScheduleCurrentFilter="setDutyScheduleCurrentFilter" />
                <ModulesUserDutyScheduleMonthView v-if="state.calendarView === 'month'"
                    @setDutyScheduleCurrentDate="setDutyScheduleCurrentDate"
                    @setDutyScheduleCurrentFilter="setDutyScheduleCurrentFilter" />
            </div>

            <ModulesUserDutyScheduleModalShiftTypes :isModalOpen="state.modal.isShowAllShiftTypes"
                @close="state.modal.isShowAllShiftTypes = false" />
            <ModulesUserDutyScheduleModalDownload :isModalOpen="state.modal.isDownloadOpen"
                :selectedDate="state.selectedDate" :filter="state.filter" @close="state.modal.isDownloadOpen = false" />
            <ModulesUserDutyScheduleActivityLogsModalHistory :isModalOpen="state.modal.isActivityLogsOpen"
                @close="state.modal.isActivityLogsOpen = false" />
            <ModulesUserDutyScheduleShareModalView :isModalOpen="state.modal.isViewSharedDutyScheduleOpen"
                @close="state.modal.isViewSharedDutyScheduleOpen = false" />
            <ModulesUserGuidedTourModalDutySchedule v-if="state.modal.isGuidedTourDutyScheduleOpen"
                :isModalOpen="state.modal.isGuidedTourDutyScheduleOpen" :isGuidedTour="false"
                @close="state.modal.isGuidedTourDutyScheduleOpen = false" />

            <Teleport to="body">
                <div v-if="state.noMatchTooltip.visible"
                    class="fixed z-[9999] w-64 rounded bg-gray-800 px-3 py-2 text-xs font-normal text-white shadow-lg"
                    :style="{ top: state.noMatchTooltip.y + 'px', left: state.noMatchTooltip.x + 'px' }">
                    {{ $t('dutySchedules.zenegy_no_match_info') }}
                </div>
            </Teleport>
            <!-- Zenegy Modal -->
            <Modal size="lg" :title="$t('dutySchedules.zenegy_sync')" :show="state.modal.isZenegySyncOpen"
                @close="state.modal.isZenegySyncOpen = false">
                <template #modal-body>
                    <p class="text-sm text-gray-500 mb-4">{{ $t('dutySchedules.zenegy_sync_description') }}</p>

                    <!-- Step Progress Indicator -->
                    <div class="flex items-center mb-6 px-2">
                        <template v-for="(step, idx) in zenegySteps" :key="idx">
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
                            <div v-if="idx < zenegySteps.length - 1"
                                class="flex-1 h-0.5 mx-3 mt-[-1rem] rounded-full transition-colors duration-300"
                                :class="step.status === 'completed' ? 'bg-teal-600' : 'bg-gray-300'">
                            </div>
                        </template>
                    </div>

                    <LoadingSpinner :isActive="state.isLoadingModalData || state.isSyncing">

                        <!-- Step 1: Configure -->
                        <div v-if="state.syncStep === 'configure'" class="space-y-5">

                            <!-- Department filter -->
                            <div class="space-y-2">
                                <FormLabel :label="$t('dutySchedules.zenegy_department')" />
                                <select v-model="state.selectedZenegyDepartment" @change="onZenegyDepartmentChange"
                                    class="w-full rounded border border-gray-300 px-3 py-2 text-sm">
                                    <option v-for="dept in state.zenegyDepartments" :key="dept.uuid || dept.name"
                                        :value="dept.name">
                                        {{ dept.name }}
                                    </option>
                                </select>
                            </div>

                            <!-- Presets -->
                            <div class="space-y-2">
                                <FormLabel :label="$t('dutySchedules.zenegy_presets')" />
                                <div class="flex items-center gap-2">
                                    <select v-model="state.selectedPresetIndex"
                                        @change="state.selectedPresetIndex !== null && applyPreset(state.selectedPresetIndex)"
                                        class="flex-1 rounded border border-gray-300 px-3 py-2 text-sm">
                                        <option :value="null">{{ $t('dutySchedules.zenegy_no_preset') }}</option>
                                        <option v-for="(preset, idx) in state.savedPresets" :key="idx" :value="idx">
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
                                        {{ $t('dutySchedules.zenegy_save_preset') }}
                                    </button>
                                    <button v-if="state.selectedPresetIndex !== null && !state.showSavePresetInput"
                                        type="button" class="text-xs text-primary hover:underline"
                                        @click="updatePreset(state.selectedPresetIndex!)">
                                        {{ $t('dutySchedules.zenegy_update_preset') }}
                                    </button>
                                </div>
                                <div v-if="state.showSavePresetInput" class="flex items-center gap-2">
                                    <input v-model="state.newPresetName" type="text"
                                        :placeholder="$t('dutySchedules.zenegy_preset_name_placeholder')"
                                        class="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
                                        @keyup.enter="saveCurrentAsPreset" />
                                    <FormButton type="button" buttonStyle="primary" class="rounded-md text-xs"
                                        :disabled="!state.newPresetName.trim()" @click="saveCurrentAsPreset">
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
                                <FormLabel :label="$t('dutySchedules.zenegy_pay_period')" />
                                <select v-model="state.selectedPayPeriodType"
                                    @change="state.selectedPayPeriodType && applyPayPeriodDateRange(state.selectedPayPeriodType)"
                                    class="w-full rounded border border-gray-300 px-3 py-2 text-sm">
                                    <option value="">{{ $t('dutySchedules.zenegy_custom_period') }}</option>
                                    <option value="monthly">{{ $t('dutySchedules.zenegy_period_monthly') }}</option>
                                    <option value="weekly">{{ $t('dutySchedules.zenegy_period_weekly') }}</option>
                                    <option value="biweekly">{{ $t('dutySchedules.zenegy_period_biweekly') }}</option>
                                </select>
                            </div>

                            <!-- Date Range -->
                            <div class="space-y-1">
                                <FormLabel :label="$t('dutySchedules.zenegy_date_range')" />
                                <div
                                    :class="{ 'rounded border border-red-500': state.configureAttempted && !state.syncDateRange?.length }">
                                    <FormDateRangeField id="zenegy_date_range" name="zenegy_date_range"
                                        :placeholder="$t('dutySchedules.zenegy_select_date_range')"
                                        v-model="state.syncDateRange" />
                                </div>
                                <FormError v-if="state.configureAttempted && !state.syncDateRange?.length"
                                    :error="$t('dutySchedules.zenegy_validation_date_range')" />
                            </div>

                            <!-- Employee Selection (grouped by pay period) -->
                            <div class="space-y-2">
                                <FormLabel :label="$t('dutySchedules.zenegy_select_employees')" />
                                <div v-if="state.scheduleEmployees.length > 0">
                                    <div class="flex w-fit cursor-pointer items-center gap-x-2 border-b border-gray-200 pb-2 text-sm font-medium"
                                        @click="toggleSelectAllEmployees">
                                        <div class="relative shrink-0">
                                            <FormCheckbox :value="state.selectAllEmployees" />
                                        </div>
                                        <span>{{ $t('dutySchedules.zenegy_select_all') }}</span>
                                        <span class="text-gray-400">({{ selectedEmployeeCount }}/{{
                                            matchedEmployeeCount }})</span>
                                    </div>

                                    <!-- Mixed period warning -->
                                    <div v-if="selectedEmployeesHaveMixedPeriods"
                                        class="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                                        {{ $t('dutySchedules.zenegy_error_mixed_periods') }}
                                    </div>

                                    <div class="mt-2 max-h-60 space-y-3 overflow-y-auto">
                                        <div v-for="[period, employees] in employeesGroupedByPeriod" :key="period">
                                            <!-- Period group header -->
                                            <div v-if="period >= 0"
                                                class="mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                {{ getPayPeriodLabel(period) }}
                                            </div>
                                            <div v-else class="mb-1 flex items-center gap-1 text-xs text-gray-400">
                                                <Icon name="ph:info"
                                                    class="h-3.5 w-3.5 shrink-0 cursor-pointer hover:text-gray-600"
                                                    @mouseenter="showNoMatchTooltip"
                                                    @mouseleave="state.noMatchTooltip.visible = false" />
                                                <span>{{ $t('dutySchedules.zenegy_no_match') }}</span>
                                            </div>
                                            <div class="space-y-1">
                                                <div v-for="{ employee, originalIndex } in employees"
                                                    :key="employee.uuid"
                                                    :class="['flex items-center gap-x-2 text-sm', employee.matchedZenegyUserUid ? 'cursor-pointer' : 'opacity-50']"
                                                    @click="employee.matchedZenegyUserUid && toggleEmployeeSelection(originalIndex)">
                                                    <div class="relative shrink-0 pointer-events-none">
                                                        <FormCheckbox :value="employee.selected"
                                                            :disabled="!employee.matchedZenegyUserUid" />
                                                    </div>
                                                    <span>{{ employee.firstname }} {{ employee.lastname }}</span>
                                                    <span v-if="!employee.matchedZenegyUserUid"
                                                        class="text-xs text-red-500">
                                                        {{ $t('dutySchedules.zenegy_no_match_badge') }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p v-else class="text-sm text-gray-500">{{ $t('dutySchedules.zenegy_no_employees') }}
                                </p>
                                <FormError v-if="state.configureAttempted && selectedEmployeeCount === 0"
                                    :error="$t('dutySchedules.zenegy_validation_select_employee')" />
                            </div>

                            <!-- Action Buttons -->
                            <div class="mt-4 grid grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                    @click="state.modal.isZenegySyncOpen = false">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                    :class="{ 'opacity-50': selectedEmployeeCount === 0 || !state.syncDateRange?.length || selectedEmployeesHaveMixedPeriods }"
                                    @click="handleConfigureNext">
                                    {{ $t('next') }}
                                </FormButton>
                            </div>
                        </div>

                        <!-- Step 2: Assign Rates -->
                        <div v-else-if="state.syncStep === 'assign-rates'" class="space-y-4">
                            <p class="flex items-center justify-between text-sm text-gray-600">
                                <span>{{ $t('dutySchedules.zenegy_assign_rates_description') }}</span>
                                <span class="relative group ml-2 cursor-pointer shrink-0">
                                    <Icon name="ph:info" class="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                    <span
                                        class="absolute right-0 top-6 z-10 hidden group-hover:block w-64 rounded bg-gray-800 px-3 py-2 text-xs text-white shadow-lg">
                                        {{ $t('dutySchedules.zenegy_assign_rates_info') }}
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
                                            <select v-model="st.selectedRateUid" :class="['ml-auto max-w-[220px] rounded border px-2 py-1 text-xs',
                                                state.assignRatesAttempted && !st.selectedRateUid
                                                    ? 'border-red-500 ring-1 ring-red-500'
                                                    : 'border-gray-300']">
                                                <option value="" disabled>{{ $t('dutySchedules.zenegy_select_rate') }}
                                                </option>
                                                <option v-for="rate in emp.availableRates" :key="rate.uid"
                                                    :value="rate.uid">
                                                    {{ rate.name }}
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Supplement & Deduction Rate Assignments -->
                            <div v-if="state.employeeExtraHoursTypes.length > 0" class="mt-4 space-y-3">
                                <p class="text-sm font-medium text-gray-700">
                                    {{ $t('dutySchedules.zenegy_supplement_rates_title') }}
                                </p>
                                <p class="text-xs text-gray-500">
                                    {{ $t('dutySchedules.zenegy_supplement_rates_description') }}
                                </p>
                                <div class="max-h-72 space-y-3 overflow-y-auto">
                                    <div v-for="emp in state.employeeExtraHoursTypes" :key="emp.employeeUuid"
                                        class="rounded-md border border-gray-200 p-3">
                                        <p class="text-sm font-medium">{{ emp.employeeName }}</p>
                                        <div class="mt-2 space-y-2">
                                            <div v-for="entry in emp.extraHoursEntries" :key="entry.type"
                                                class="flex items-center gap-x-3 text-sm">
                                                <span class="shrink-0">
                                                    <span v-if="entry.type === 'add'"
                                                        class="inline-flex items-center gap-1 text-green-700">
                                                        <Icon name="ph:plus-circle" class="h-4 w-4" />
                                                        {{ $t('dutySchedules.zenegy_supplement') }}
                                                    </span>
                                                    <span v-else class="inline-flex items-center gap-1 text-red-700">
                                                        <Icon name="ph:minus-circle" class="h-4 w-4" />
                                                        {{ $t('dutySchedules.zenegy_deduction') }}
                                                    </span>
                                                </span>
                                                <span class="text-xs text-gray-400">
                                                    ({{ entry.entryCount }}
                                                    {{ entry.entryCount === 1
                                                        ? $t('dutySchedules.zenegy_entry')
                                                        : $t('dutySchedules.zenegy_entries') }},
                                                    {{ entry.totalUnits }}{{ $t('dutySchedules.zenegy_hours_let') }})
                                                </span>
                                                <select v-model="entry.selectedSupplementRateUid" :class="['ml-auto max-w-[220px] rounded border px-2 py-1 text-xs',
                                                    state.assignRatesAttempted && !entry.selectedSupplementRateUid
                                                        ? 'border-red-500 ring-1 ring-red-500'
                                                        : 'border-gray-300']">
                                                    <option value="" disabled>
                                                        {{ $t('dutySchedules.zenegy_select_rate') }}
                                                    </option>
                                                    <option v-for="rate in emp.availableSupplementRates" :key="rate.uid"
                                                        :value="rate.uid">
                                                        {{ rate.name }}
                                                    </option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <FormError v-if="state.assignRatesAttempted && !allShiftTypesAssigned"
                                :error="$t('dutySchedules.zenegy_validation_assign_rates')" />

                            <div class="mt-4 grid grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                    @click="state.syncStep = 'configure'">
                                    {{ $t('back') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                    :class="{ 'opacity-50': !allShiftTypesAssigned }" @click="handleAssignRatesNext">
                                    {{ $t('dutySchedules.zenegy_review') }}
                                </FormButton>
                            </div>
                        </div>

                        <!-- Step 3: Review -->
                        <div v-else-if="state.syncStep === 'review'" class="space-y-4">
                            <p class="text-sm text-gray-600">
                                {{ $t('dutySchedules.zenegy_review_description', {
                                    count:
                                        state.registrationsPreview.length + state.supplementRegistrationsPreview.length
                                }) }}
                            </p>
                            <div v-if="state.registrationsPreview.length > 0 || state.supplementRegistrationsPreview.length > 0"
                                class="max-h-96 divide-y divide-gray-200 overflow-y-auto rounded-md border border-gray-200">
                                <div v-for="group in groupedRegistrations" :key="group.userUid">
                                    <!-- Employee summary row -->
                                    <div class="flex cursor-pointer items-center gap-x-2 px-3 py-2 hover:bg-gray-50"
                                        @click="toggleExpandEmployee(group.userUid)">
                                        <Icon name="ph:caret-right"
                                            :class="['h-4 w-4 shrink-0 transition-transform', state.expandedEmployees.has(group.userUid) ? 'rotate-90' : '']" />
                                        <span class="text-sm font-medium">{{ group.employeeName }}</span>
                                        <span v-if="group.hourRegistrations.length > 0"
                                            class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                            {{ group.hourRegistrations.length }} {{ $t('dutySchedules.zenegy_shifts') }}
                                        </span>
                                        <span v-if="group.supplementRegistrations.length > 0"
                                            class="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                                            {{ group.supplementRegistrations.length }} {{
                                                $t('dutySchedules.zenegy_supplements') }}
                                        </span>
                                        <span class="ml-auto text-sm text-gray-500">
                                            <span v-if="group.totalHours > 0">{{ group.totalHours }}{{
                                                $t('dutySchedules.zenegy_hours_let') }}</span>
                                            <span
                                                v-if="group.totalHours > 0 && (group.totalSupplementUnits > 0 || group.totalDeductionUnits > 0)">
                                                | </span>
                                            <span v-if="group.totalSupplementUnits > 0" class="text-green-600">+{{
                                                group.totalSupplementUnits }}{{ $t('dutySchedules.zenegy_hours_let')
                                                }}</span>
                                            <span
                                                v-if="group.totalSupplementUnits > 0 && group.totalDeductionUnits > 0">
                                            </span>
                                            <span v-if="group.totalDeductionUnits > 0" class="text-red-600">-{{
                                                group.totalDeductionUnits }}{{ $t('dutySchedules.zenegy_hours_let')
                                                }}</span>
                                        </span>
                                    </div>
                                    <!-- Expanded detail rows (combined table) -->
                                    <table
                                        v-if="state.expandedEmployees.has(group.userUid) && (group.hourRegistrations.length > 0 || group.supplementRegistrations.length > 0)"
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
                                                    getRateName(reg.hourPaymentRateUid) }}
                                                </td>
                                                <td class="px-3 py-1.5 text-right">{{ reg.hours }}{{
                                                    $t('dutySchedules.zenegy_hours_let') }}</td>
                                            </tr>
                                            <tr v-for="(reg, i) in group.supplementRegistrations" :key="'s-' + i"
                                                :class="reg.type === 'add' ? 'bg-green-50/30' : 'bg-red-50/30'">
                                                <td class="py-1.5 pl-9 pr-3">{{ reg.date }}</td>
                                                <td class="px-3 py-1.5">
                                                    <span v-if="reg.type === 'add'" class="text-green-700">{{
                                                        $t('dutySchedules.zenegy_supplement') }}</span>
                                                    <span v-else class="text-red-700">{{
                                                        $t('dutySchedules.zenegy_deduction') }}</span>
                                                </td>
                                                <td class="px-3 py-1.5 text-xs text-gray-500">{{ reg.rateName }}</td>
                                                <td class="px-3 py-1.5 text-right">{{ reg.units }}{{
                                                    $t('dutySchedules.zenegy_hours_let') }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div v-else class="py-8 text-center text-gray-400">
                                {{ $t('dutySchedules.zenegy_no_registrations') }}
                            </div>
                            <div class="mt-4 grid grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                    @click="state.syncStep = 'assign-rates'">
                                    {{ $t('back') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                    :disabled="state.registrationsPreview.length === 0 && state.supplementRegistrationsPreview.length === 0"
                                    @click="executeSyncToZenegy">
                                    {{ $t('dutySchedules.zenegy_sync') }} ({{ state.registrationsPreview.length +
                                        state.supplementRegistrationsPreview.length }})
                                </FormButton>
                            </div>
                        </div>

                        <!-- Step 4: Result -->
                        <div v-else-if="state.syncStep === 'result'" class="space-y-4 py-4">
                            <!-- Summary -->
                            <div class="text-center">
                                <Icon v-if="state.syncResult?.every((r: any) => r.success)" name="ph:check-circle"
                                    class="mx-auto h-12 w-12 text-green-500" />
                                <Icon v-else-if="state.syncResult?.some((r: any) => r.success)" name="ph:warning-circle"
                                    class="mx-auto h-12 w-12 text-yellow-500" />
                                <Icon v-else name="ph:x-circle" class="mx-auto h-12 w-12 text-red-500" />
                                <p class="mt-2 text-lg font-medium">
                                    {{state.syncResult?.every((r: any) => r.success)
                                        ? $t('dutySchedules.zenegy_sync_success')
                                        : state.syncResult?.some((r: any) => r.success)
                                            ? $t('dutySchedules.zenegy_sync_partial')
                                            : $t('dutySchedules.zenegy_sync_failed')}}
                                </p>
                            </div>

                            <!-- Per-employee results -->
                            <div class="max-h-60 space-y-2 overflow-y-auto">
                                <div v-for="(result, idx) in state.syncResult" :key="idx" :class="['flex items-center justify-between rounded-md px-3 py-2 text-sm',
                                    result.success ? 'bg-green-50' : 'bg-red-50']">
                                    <div class="flex items-center gap-2">
                                        <Icon :name="result.success ? 'ph:check-circle' : 'ph:x-circle'"
                                            :class="result.success ? 'h-4 w-4 text-green-600' : 'h-4 w-4 text-red-600'" />
                                        <span class="font-medium">{{ result.employeeName }}</span>
                                        <span class="text-xs text-gray-500">
                                            ({{ result.count }} {{ result.type === 'hours'
                                                ? $t('dutySchedules.zenegy_registrations')
                                                : $t('dutySchedules.zenegy_supplement_registrations') }})
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
                                @click="state.modal.isZenegySyncOpen = false">
                                {{ $t('close') }}
                            </FormButton>
                        </div>

                    </LoadingSpinner>
                </template>
            </Modal>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useUserStore } from '@/store/user'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useDepartmentStore } from '@/store/department'
// import { zenegyService } from '@/components/api/user/ZenegyService'
import { dutyScheduleService } from '@/components/api/user/DutyScheduleService'
import { extraHoursService } from '@/components/api/user/ExtraHoursService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const customPagesStore = useCustomPagesStore() as any
const userStore = useUserStore() as any
const departmentStore = useDepartmentStore() as any
const { successAlert, errorAlert } = useAlert()
const { t, locale } = useI18n()
const weekViewRef = ref()

const state = reactive({
    calendarView: 'week',
    isSyncing: false,
    isZenegyConnected: false,
    isLoadingModalData: false,
    filter: {
        department_uuids: [],
        employment_status: [],
        employee_uuids: [],
    },
    modal: {
        isActivityLogsOpen: false,
        isDownloadOpen: false,
        isGuidedTourDutyScheduleOpen: false,
        isViewSharedDutyScheduleOpen: false,
        isShowAllShiftTypes: false,
        isZenegySyncOpen: false,
    },
    selectedDate: moment().format('YYYY-MM-DD'),
    syncStep: 'configure' as 'configure' | 'assign-rates' | 'review' | 'result',
    syncDateRange: [] as any,
    scheduleEmployees: [] as Array<{
        uuid: string; firstname: string; lastname: string;
        selected: boolean; matchedZenegyUserUid: string | null;
        matchedZenegyEmployeeUid: string | null;
        salaryPayoutPeriod: number;
    }>,
    selectAllEmployees: true,
    zenegyEmployeesRaw: [] as any[],
    zenegyRatesRaw: [] as any[],
    sharedRates: [] as Array<{ uid: string; name: string }>,
    fetchedScheduleData: [] as any[],
    employeeShiftTypes: [] as Array<{
        employeeUuid: string; employeeName: string; userUid: string;
        shiftTypes: Array<{
            name: string; shiftCount: number; selectedRateUid: string;
        }>;
        availableRates: Array<{ uid: string; name: string }>;
    }>,
    registrationsPreview: [] as Array<{
        employeeName: string; date: string; shiftTypeName: string;
        from: string; to: string; hours: number;
        userUid: string; hourPaymentRateUid: string;
    }>,
    zenegySupplementRatesRaw: [] as any[],
    fetchedExtraHoursData: [] as any[],
    employeeExtraHoursTypes: [] as Array<{
        employeeUuid: string; employeeName: string;
        zenegyUserUid: string; zenegyEmployeeUid: string;
        extraHoursEntries: Array<{
            type: 'add' | 'deduct';
            entryCount: number;
            totalUnits: number;
            selectedSupplementRateUid: string;
        }>;
        availableSupplementRates: Array<{ uid: string; name: string }>;
        availableDeductionRates: Array<{ uid: string; name: string }>;
    }>,
    supplementRegistrationsPreview: [] as Array<{
        employeeName: string; date: string; type: 'add' | 'deduct';
        units: number; rateUid: string; rateName: string; rate: number;
        zenegyEmployeeUid: string; zenegyUserUid: string; note: string;
    }>,
    syncResult: null as any,
    expandedEmployees: new Set<string>(),
    configureAttempted: false,
    assignRatesAttempted: false,
    savedPresets: [] as Array<{ name: string; employeeUuids: string[]; payPeriodType: 'monthly' | 'weekly' | 'biweekly' }>,
    selectedPresetIndex: null as number | null,
    newPresetName: '' as string,
    showSavePresetInput: false,
    selectedPayPeriodType: '' as '' | 'monthly' | 'weekly' | 'biweekly',
    zenegyDepartments: [] as any[],
    selectedZenegyDepartment: '' as string,
    allZenegyEmployees: [] as any[],
    noMatchTooltip: { visible: false, x: 0, y: 0 },
})

const zenegyStepNumber = computed(() => {
    const map: Record<string, number> = { 'configure': 1, 'assign-rates': 2, 'review': 3, 'result': 4 }
    return map[state.syncStep] || 1
})

const zenegySteps = computed(() => {
    const steps = [
        { label: t('dutySchedules.zenegy_step_configure') },
        { label: t('dutySchedules.zenegy_step_assign_rates') },
        { label: t('dutySchedules.zenegy_step_review') },
        { label: t('dutySchedules.zenegy_step_result') },
    ]
    return steps.map((s, i) => ({
        ...s,
        status: zenegyStepNumber.value === 4 ? 'completed'
            : zenegyStepNumber.value > i + 1 ? 'completed'
                : zenegyStepNumber.value === i + 1 ? 'current'
                    : 'upcoming'
    }))
})

const selectedEmployeeCount = computed(() =>
    state.scheduleEmployees.filter(e => e.selected).length
)

const matchedEmployeeCount = computed(() =>
    state.scheduleEmployees.filter(e => e.matchedZenegyUserUid).length
)

function getPayPeriodLabel(period: number): string {
    const labels: Record<number, string> = {
        0: t('dutySchedules.zenegy_period_not_set'),
        1: t('dutySchedules.zenegy_period_weekly'),
        2: t('dutySchedules.zenegy_period_biweekly'),
        4: t('dutySchedules.zenegy_period_monthly'),
    }
    return labels[period] || t('dutySchedules.zenegy_period_unknown', { code: period })
}

const employeesGroupedByPeriod = computed(() => {
    const groups = new Map<number, Array<{ employee: typeof state.scheduleEmployees[0]; originalIndex: number }>>()
    state.scheduleEmployees.forEach((emp, index) => {
        const period = emp.matchedZenegyUserUid ? emp.salaryPayoutPeriod : -1
        if (!groups.has(period)) groups.set(period, [])
        groups.get(period)!.push({ employee: emp, originalIndex: index })
    })
    return Array.from(groups.entries()).sort((a, b) => {
        if (a[0] === -1) return 1
        if (b[0] === -1) return -1
        return a[0] - b[0]
    })
})

const selectedEmployeesHaveMixedPeriods = computed(() => {
    const selected = state.scheduleEmployees.filter(e => e.selected && e.matchedZenegyUserUid)
    if (selected.length <= 1) return false
    const periods = new Set(selected.map(e => e.salaryPayoutPeriod))
    return periods.size > 1
})

const allShiftTypesAssigned = computed(() => {
    const hourRatesOk = state.employeeShiftTypes.every(emp =>
        emp.shiftTypes.every(st => st.selectedRateUid)
    )
    const supplementRatesOk = state.employeeExtraHoursTypes.every(emp =>
        emp.extraHoursEntries.every(entry => entry.selectedSupplementRateUid)
    )
    return hourRatesOk && supplementRatesOk
})

function getRateName(rateUid: string): string {
    const rate = state.zenegyRatesRaw.find((r: any) => (r.uid || r.id) === rateUid)
    if (!rate) return ''
    return `${rate.name} - ${rate.paymentPerRate} kr/t`
}

const groupedRegistrations = computed(() => {
    const groups = new Map<string, {
        userUid: string; employeeName: string;
        hourRegistrations: typeof state.registrationsPreview;
        supplementRegistrations: typeof state.supplementRegistrationsPreview;
        totalHours: number; totalSupplementUnits: number; totalDeductionUnits: number;
    }>()

    for (const reg of state.registrationsPreview) {
        if (!groups.has(reg.userUid)) {
            groups.set(reg.userUid, {
                userUid: reg.userUid, employeeName: reg.employeeName,
                hourRegistrations: [], supplementRegistrations: [],
                totalHours: 0, totalSupplementUnits: 0, totalDeductionUnits: 0,
            })
        }
        const group = groups.get(reg.userUid)!
        group.hourRegistrations.push(reg)
        group.totalHours = Math.round((group.totalHours + reg.hours) * 100) / 100
    }

    for (const reg of state.supplementRegistrationsPreview) {
        if (!groups.has(reg.zenegyUserUid)) {
            groups.set(reg.zenegyUserUid, {
                userUid: reg.zenegyUserUid, employeeName: reg.employeeName,
                hourRegistrations: [], supplementRegistrations: [],
                totalHours: 0, totalSupplementUnits: 0, totalDeductionUnits: 0,
            })
        }
        const group = groups.get(reg.zenegyUserUid)!
        group.supplementRegistrations.push(reg)
        if (reg.type === 'add') {
            group.totalSupplementUnits = Math.round((group.totalSupplementUnits + reg.units) * 100) / 100
        } else {
            group.totalDeductionUnits = Math.round((group.totalDeductionUnits + reg.units) * 100) / 100
        }
    }

    return Array.from(groups.values())
})

function toggleExpandEmployee(userUid: string) {
    if (state.expandedEmployees.has(userUid)) {
        state.expandedEmployees.delete(userUid)
    } else {
        state.expandedEmployees.add(userUid)
    }
}

onMounted(async () => {
    // try {
    //     const status = await zenegyService.getZenegyStatus()
    //     state.isZenegyConnected = status?.connected || false
    // } catch {
    //     state.isZenegyConnected = false
    // }
})

function setCalendarView(view: any) {
    state.calendarView = view
}

function openDutySchedulesActivityLogs() {
    state.modal.isActivityLogsOpen = true
}

function openGuidedTour() {
    state.modal.isGuidedTourDutyScheduleOpen = true
}

function isAdmin(role: any) {
    return role && role === 'Admin'
}

function setDutyScheduleCurrentDate(selectedDate: any) {
    state.selectedDate = selectedDate
}

function setDutyScheduleCurrentFilter(filter: any) {
    state.filter.department_uuids = filter.department_uuids
    state.filter.employment_status = filter.employment_status
    state.filter.employee_uuids = filter.employee_uuids
}

// --- Zenegy Sync Logic ---

function matchEmployeeToZenegy(localEmployee: any, zenegyEmployees: any[]): { zenegyUserUid: string; zenegyEmployeeUid: string; salaryPayoutPeriod: number } | null {
    for (const ze of zenegyEmployees) {
        const zenegyUid = ze.uid || ''
        const zenegyId = String(ze.id || '')
        const zenegyUserUid = ze.user?.uid || ze.uid || ''
        const zenegyEmployeeUid = ze.uid || ''
        const salaryPayoutPeriod = ze.salaryPayoutPeriod || 0
        const zenegyEmail = (ze.contactEmail || ze.user?.email || '').toLowerCase().trim()
        const zenegyName = (ze.name || '').toLowerCase().trim()

        const result = { zenegyUserUid, zenegyEmployeeUid, salaryPayoutPeriod }


        if (localEmployee.zenegy_uid && String(localEmployee.zenegy_uid) === zenegyUid) {
            return result
        }
        if (localEmployee.zenegy_id && String(localEmployee.zenegy_id) === zenegyId) {
            return result
        }
        if (localEmployee.employee_id && String(localEmployee.employee_id) === zenegyId) {
            return result
        }
        const localEmail = (localEmployee.email || '').toLowerCase().trim()
        if (zenegyEmail && localEmail && zenegyEmail === localEmail) {
            return result
        }
        const localName = `${localEmployee.firstname || ''} ${localEmployee.lastname || ''}`.toLowerCase().trim()
        if (zenegyName && localName && zenegyName.length > 2 && localName.length > 2 && zenegyName === localName) {
            return result
        }
    }
    return null
}

async function openZenegySyncModal() {
    // state.modal.isZenegySyncOpen = true
    // state.syncStep = 'configure'
    // state.isLoadingModalData = true
    // state.syncResult = null
    // state.registrationsPreview = []
    // state.expandedEmployees.clear()
    // state.syncDateRange = []
    // state.zenegyRatesRaw = []
    // state.sharedRates = []
    // state.fetchedScheduleData = []
    // state.employeeShiftTypes = []
    // state.zenegySupplementRatesRaw = []
    // state.fetchedExtraHoursData = []
    // state.employeeExtraHoursTypes = []
    // state.supplementRegistrationsPreview = []
    // state.selectedPresetIndex = null
    // state.selectedPayPeriodType = ''
    // state.newPresetName = ''
    // state.showSavePresetInput = false
    // state.configureAttempted = false
    // state.assignRatesAttempted = false
    // loadPresets()

    // try {
    //     const [zenegyEmployeesRes, zenegyRatesRes, zenegySupplementRatesRes, departmentsRes] = await Promise.all([
    //         zenegyService.getEmployees(),
    //         zenegyService.getRates(),
    //         zenegyService.getSupplementRates(),
    //         departmentService.getAllDepartments({}),
    //     ])

    //     state.zenegyDepartments = departmentsRes?.data || []
    //     state.selectedZenegyDepartment = departmentStore.getSelectedDepartmentName || ''

    //     state.allZenegyEmployees = zenegyEmployeesRes?.employees?.data || zenegyEmployeesRes?.data || []
    //     state.zenegyEmployeesRaw = state.selectedZenegyDepartment
    //         ? state.allZenegyEmployees.filter((emp: any) => emp.department?.name === state.selectedZenegyDepartment)
    //         : state.allZenegyEmployees

    //     const ratesData = zenegyRatesRes?.rates?.value?.data || zenegyRatesRes?.rates?.data || zenegyRatesRes?.data || []
    //     state.zenegyRatesRaw = Array.isArray(ratesData) ? ratesData : []

    //     state.sharedRates = state.zenegyRatesRaw
    //         .filter((r: any) => !r.limitUserAccess && r.paymentPerRate > 0)
    //         .map((r: any) => ({
    //             uid: r.uid || r.id || '',
    //             name: `${r.name}${r.number ? ` (${r.number})` : ''} - ${r.paymentPerRate} kr/t`,
    //         }))
    //     const supplementRatesData = zenegySupplementRatesRes?.rates || zenegySupplementRatesRes?.data || []
    //     state.zenegySupplementRatesRaw = Array.isArray(supplementRatesData) ? supplementRatesData : []

    //     const scheduleEmployees = weekViewRef.value?.getScheduleEmployees() || []
    //     state.scheduleEmployees = scheduleEmployees.map((emp: any) => {
    //         const matched = matchEmployeeToZenegy(emp, state.zenegyEmployeesRaw)
    //         return {
    //             uuid: emp.uuid,
    //             firstname: emp.firstname || emp.firstName || '',
    //             lastname: emp.lastname || emp.lastName || '',
    //             selected: matched !== null,
    //             matchedZenegyUserUid: matched?.zenegyUserUid || null,
    //             matchedZenegyEmployeeUid: matched?.zenegyEmployeeUid || null,
    //             salaryPayoutPeriod: matched?.salaryPayoutPeriod || 0,
    //         }
    //     })
    //     state.selectAllEmployees = state.scheduleEmployees
    //         .filter(e => e.matchedZenegyUserUid)
    //         .every(e => e.selected)

    // } catch (e: any) {
    //     errorAlert(t('alert.error'), e?.message || 'Failed to load Zenegy data')
    // } finally {
    //     state.isLoadingModalData = false
    // }
}

function showNoMatchTooltip(event: MouseEvent) {
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    state.noMatchTooltip = {
        visible: true,
        x: rect.left,
        y: rect.bottom + 6,
    }
}

function onZenegyDepartmentChange() {
    state.zenegyEmployeesRaw = state.selectedZenegyDepartment
        ? state.allZenegyEmployees.filter((emp: any) => emp.department?.name === state.selectedZenegyDepartment)
        : state.allZenegyEmployees

    const scheduleEmployees = weekViewRef.value?.getScheduleEmployees() || []
    state.scheduleEmployees = scheduleEmployees.map((emp: any) => {
        const matched = matchEmployeeToZenegy(emp, state.zenegyEmployeesRaw)
        return {
            uuid: emp.uuid,
            firstname: emp.firstname || emp.firstName || '',
            lastname: emp.lastname || emp.lastName || '',
            selected: matched !== null,
            matchedZenegyUserUid: matched?.zenegyUserUid || null,
            matchedZenegyEmployeeUid: matched?.zenegyEmployeeUid || null,
            salaryPayoutPeriod: matched?.salaryPayoutPeriod || 0,
        }
    })
    state.selectAllEmployees = state.scheduleEmployees
        .filter(e => e.matchedZenegyUserUid).every(e => e.selected)
}

function toggleSelectAllEmployees() {
    state.selectAllEmployees = !state.selectAllEmployees
    state.scheduleEmployees
        .filter(e => e.matchedZenegyUserUid)
        .forEach(e => e.selected = state.selectAllEmployees)
}

function toggleEmployeeSelection(index: number) {
    if (!state.scheduleEmployees[index].matchedZenegyUserUid) return
    state.scheduleEmployees[index].selected = !state.scheduleEmployees[index].selected
    state.selectAllEmployees = state.scheduleEmployees
        .filter(e => e.matchedZenegyUserUid)
        .every(e => e.selected)
}

// --- Preset functions ---
function loadPresets() {
    try {
        const raw = localStorage.getItem('zenegy_sync_presets')
        state.savedPresets = raw ? JSON.parse(raw) : []
    } catch { state.savedPresets = [] }
}

function savePresetsToStorage() {
    localStorage.setItem('zenegy_sync_presets', JSON.stringify(state.savedPresets))
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
        if (emp.matchedZenegyUserUid) {
            emp.selected = preset.employeeUuids.includes(emp.uuid)
        }
    })
    state.selectAllEmployees = state.scheduleEmployees
        .filter(e => e.matchedZenegyUserUid)
        .every(e => e.selected)

    autoDetectAndApplyPayPeriod()
}

const zenegyPeriodToType: Record<number, string> = { 1: 'weekly', 2: 'biweekly', 4: 'monthly' }

function autoDetectAndApplyPayPeriod() {
    const selected = state.scheduleEmployees.filter(e => e.selected && e.matchedZenegyUserUid)
    if (selected.length === 0) return

    const periods = new Set(selected.map(e => e.salaryPayoutPeriod).filter(p => p > 0))
    if (periods.size === 1) {
        const period = [...periods][0]
        const periodType = zenegyPeriodToType[period] || ''
        state.selectedPayPeriodType = periodType as any
        if (periodType) applyPayPeriodDateRange(periodType)
    } else {
        state.selectedPayPeriodType = ''
    }
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

function handleConfigureNext() {
    state.configureAttempted = true
    const isValid = selectedEmployeeCount.value > 0 && state.syncDateRange?.length && !selectedEmployeesHaveMixedPeriods.value
    if (!isValid) return
    fetchAndBuildShiftTypes()
}

function handleAssignRatesNext() {
    state.assignRatesAttempted = true
    if (!allShiftTypesAssigned.value) return
    buildRegistrationsPreview()
}

async function fetchAndBuildShiftTypes() {
    const dateRange = state.syncDateRange
    if (!dateRange?.length || !dateRange[0] || !dateRange[1]) {
        errorAlert(t('alert.warning'), t('dutySchedules.zenegy_select_date_range'))
        return
    }

    const selectedEmployees = state.scheduleEmployees.filter(e => e.selected && e.matchedZenegyUserUid)
    if (selectedEmployees.length === 0) {
        errorAlert(t('alert.warning'), t('dutySchedules.zenegy_no_matched_employees'))
        return
    }

    if (selectedEmployeesHaveMixedPeriods.value) {
        errorAlert(t('alert.warning'), t('dutySchedules.zenegy_error_mixed_periods'))
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
        const employeeUidMap = new Map(selectedEmployees.map(e => [e.uuid, e.matchedZenegyUserUid]))
        const startMoment = moment(startDate)
        const endMoment = moment(endDate)

        const allScheduleData: any[] = []
        for (const weekStart of weekStarts) {
            const weekEnd = moment(weekStart).endOf('isoWeek').format('YYYY-MM-DD')
            const response = await dutyScheduleService.getDutySchedules({
                date_start: weekStart,
                date_end: weekEnd,
                department: departmentStore.getSelectedDepartmentName,
                page_length: 500,
            })
            const employeeSchedules = response?.data || []
            if (Array.isArray(employeeSchedules)) {
                allScheduleData.push(...employeeSchedules)
            }
        }
        state.fetchedScheduleData = allScheduleData

        const empShiftMap = new Map<string, { name: string; userUid: string; shiftTypes: Map<string, number> }>()

        for (const empSchedule of allScheduleData) {
            if (!selectedEmployeeUuids.has(empSchedule.uuid)) continue
            const userUid = employeeUidMap.get(empSchedule.uuid)
            if (!userUid) continue

            const empName = `${empSchedule.firstname || ''} ${empSchedule.lastname || ''}`.trim()
            if (!empShiftMap.has(empSchedule.uuid)) {
                empShiftMap.set(empSchedule.uuid, { name: empName, userUid, shiftTypes: new Map() })
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
                        ? (shift.type?.dk_name || shift.type?.en_name || t('dutySchedules.zenegy_unknown_shift'))
                        : (shift.type?.en_name || shift.type?.dk_name || t('dutySchedules.zenegy_unknown_shift'))

                    empData.shiftTypes.set(shiftTypeName, (empData.shiftTypes.get(shiftTypeName) || 0) + 1)
                }
            }
        }

        state.employeeShiftTypes = Array.from(empShiftMap.entries())
            .filter(([_, data]) => data.shiftTypes.size > 0)
            .map(([uuid, data]) => {
                const personalRates = state.zenegyRatesRaw
                    .filter((r: any) => r.limitUserAccess && r.paymentPerRate > 0
                        && r.allowedUsers?.some((u: any) => u.uid === data.userUid))
                    .map((r: any) => ({
                        uid: r.uid || r.id || '',
                        name: `${r.name}${r.number ? ` (${r.number})` : ''} - ${r.paymentPerRate} kr/t`,
                    }))

                const availableRates = [...personalRates, ...state.sharedRates]

                const autoRateUid = personalRates.length === 1 ? personalRates[0].uid : ''

                return {
                    employeeUuid: uuid,
                    employeeName: data.name,
                    userUid: data.userUid,
                    shiftTypes: Array.from(data.shiftTypes.entries()).map(([name, count]) => ({
                        name,
                        shiftCount: count,
                        selectedRateUid: autoRateUid,
                    })),
                    availableRates,
                }
            })

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
            name: string; zenegyUserUid: string; zenegyEmployeeUid: string;
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
                    zenegyUserUid: emp.matchedZenegyUserUid!,
                    zenegyEmployeeUid: emp.matchedZenegyEmployeeUid!,
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

        const allSupplementRateOptions = state.zenegySupplementRatesRaw
            .map((r: any) => ({ uid: r.uid, rateValue: Number(r.paymentPerRate || r.rate || 0), name: `${r.name}${r.number ? ` (${r.number})` : ''} - ${Number(r.paymentPerRate || r.rate || 0).toLocaleString('da-DK')} kr` }))
            .sort((a, b) => a.rateValue - b.rateValue)

        state.employeeExtraHoursTypes = Array.from(empExtraMap.entries())
            .filter(([_, data]) => data.addCount > 0 || data.deductCount > 0)
            .map(([uuid, data]) => {
                const entries: Array<{
                    type: 'add' | 'deduct'; entryCount: number;
                    totalUnits: number; selectedSupplementRateUid: string;
                }> = []

                if (data.addCount > 0) {
                    entries.push({
                        type: 'add',
                        entryCount: data.addCount,
                        totalUnits: Math.round(data.addUnits * 100) / 100,
                        selectedSupplementRateUid: allSupplementRateOptions.length === 1 ? allSupplementRateOptions[0].uid : '',
                    })
                }
                if (data.deductCount > 0) {
                    entries.push({
                        type: 'deduct',
                        entryCount: data.deductCount,
                        totalUnits: Math.round(data.deductUnits * 100) / 100,
                        selectedSupplementRateUid: allSupplementRateOptions.length === 1 ? allSupplementRateOptions[0].uid : '',
                    })
                }

                return {
                    employeeUuid: uuid,
                    employeeName: data.name,
                    zenegyUserUid: data.zenegyUserUid,
                    zenegyEmployeeUid: data.zenegyEmployeeUid,
                    extraHoursEntries: entries,
                    availableSupplementRates: allSupplementRateOptions,
                    availableDeductionRates: allSupplementRateOptions,
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
    const selectedEmployees = state.scheduleEmployees.filter(e => e.selected && e.matchedZenegyUserUid)
    const selectedEmployeeUuids = new Set(selectedEmployees.map(e => e.uuid))
    const employeeUidMap = new Map(selectedEmployees.map(e => [e.uuid, e.matchedZenegyUserUid]))

    const rateLookup = new Map<string, string>()
    for (const emp of state.employeeShiftTypes) {
        for (const st of emp.shiftTypes) {
            rateLookup.set(`${emp.userUid}::${st.name}`, st.selectedRateUid)
        }
    }

    const registrations: typeof state.registrationsPreview = []

    for (const empSchedule of state.fetchedScheduleData) {
        if (!selectedEmployeeUuids.has(empSchedule.uuid)) continue
        const userUid = employeeUidMap.get(empSchedule.uuid)
        if (!userUid) continue

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
                    ? (shift.type?.dk_name || shift.type?.en_name || t('dutySchedules.zenegy_unknown_shift'))
                    : (shift.type?.en_name || shift.type?.dk_name || t('dutySchedules.zenegy_unknown_shift'))

                registrations.push({
                    employeeName: empName,
                    date: day.date,
                    shiftTypeName,
                    from,
                    to,
                    hours,
                    userUid,
                    hourPaymentRateUid: rateLookup.get(`${userUid}::${shiftTypeName}`) || '',
                })
            }
        }
    }

    state.registrationsPreview = registrations

    const supplementRateLookup = new Map<string, { rateUid: string; rateName: string; rate: number }>()
    for (const emp of state.employeeExtraHoursTypes) {
        for (const entry of emp.extraHoursEntries) {
            const rateObj = state.zenegySupplementRatesRaw.find(
                (r: any) => r.uid === entry.selectedSupplementRateUid
            )
            supplementRateLookup.set(`${emp.employeeUuid}::${entry.type}`, {
                rateUid: entry.selectedSupplementRateUid,
                rateName: rateObj?.name || '',
                rate: rateObj?.rate || 0,
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

        const rateInfo = supplementRateLookup.get(`${empUuid}::${eh.extra_hours_type}`)
        if (!rateInfo) continue

        const empData = state.employeeExtraHoursTypes.find(e => e.employeeUuid === empUuid)

        supplementRegs.push({
            employeeName: empData?.employeeName || `${emp.firstname} ${emp.lastname}`.trim(),
            date: eh.date,
            type: eh.extra_hours_type,
            units: Number(eh.extra_hours) || 0,
            rateUid: rateInfo.rateUid,
            rateName: rateInfo.rateName,
            rate: rateInfo.rate,
            zenegyEmployeeUid: emp.matchedZenegyEmployeeUid!,
            zenegyUserUid: emp.matchedZenegyUserUid!,
            note: eh.note || '',
        })
    }
    state.supplementRegistrationsPreview = supplementRegs

    state.syncStep = 'review'
}

function parseZenegyError(e: any): string {
    const rawMsg = e?.data?.message || e?.response?._data?.message || e?.message || ''
    let errorMsg = rawMsg
    try {
        const parsed = JSON.parse(rawMsg)
        errorMsg = parsed?.message || rawMsg
    } catch { /* not JSON, use as-is */ }

    if (errorMsg.includes('RATE_FORBIDDEN_ACCESS')) return t('dutySchedules.zenegy_error_rate_forbidden')
    if (errorMsg.includes('REGISTRATION_INVALID_PERIOD_RANGE')) return t('dutySchedules.zenegy_error_invalid_period')
    if (errorMsg.includes('REGISTRATION_ALREADY_EXISTS')) return t('dutySchedules.zenegy_error_already_exists')
    if (errorMsg.includes('REGISTRATION_CONFLICTED_EXISTING_REGISTRATION_IN_PERIOD')) return t('dutySchedules.zenegy_error_conflict_period')
    if (errorMsg.includes('USER_NOT_FOUND')) return t('dutySchedules.zenegy_error_user_not_found')
    if (errorMsg.includes("doesn't meet the requirements for this rate")) return t('dutySchedules.zenegy_error_rate_requirements')
    if (errorMsg.includes('Amount cannot be overriden')) return t('dutySchedules.zenegy_error_rate_override')
    return errorMsg || t('dutySchedules.zenegy_sync_failed')
}

async function executeSyncToZenegy() {
    // const hasHourRegs = state.registrationsPreview.length > 0
    // const hasSupplementRegs = state.supplementRegistrationsPreview.length > 0
    // if (!hasHourRegs && !hasSupplementRegs) return

    // state.isSyncing = true

    // const dateRange = state.syncDateRange
    // const periodFrom = moment(dateRange[0]).startOf('day').format('YYYY-MM-DDTHH:mm:ss')
    // const periodTo = moment(dateRange[1]).endOf('day').format('YYYY-MM-DDTHH:mm:ss')

    // const hoursByEmployee = new Map<string, { name: string; regs: any[] }>()
    // for (const reg of state.registrationsPreview) {
    //     if (reg.hours <= 0) continue
    //     if (!hoursByEmployee.has(reg.userUid)) {
    //         hoursByEmployee.set(reg.userUid, { name: reg.employeeName, regs: [] })
    //     }
    //     hoursByEmployee.get(reg.userUid)!.regs.push({
    //         userUid: reg.userUid,
    //         date: reg.date,
    //         from: moment(reg.from).format('YYYY-MM-DDTHH:mm:ss'),
    //         to: moment(reg.to).format('YYYY-MM-DDTHH:mm:ss'),
    //         hours: reg.hours,
    //         hourPaymentRateUid: reg.hourPaymentRateUid,
    //         periodFrom,
    //         periodTo,
    //     })
    // }

    // const supplementsByEmployee = new Map<string, { name: string; regs: any[] }>()
    // for (const reg of state.supplementRegistrationsPreview) {
    //     const rateObj = state.zenegySupplementRatesRaw.find((r: any) => r.uid === reg.rateUid)
    //     const registration: any = {
    //         rateUid: reg.rateUid,
    //         date: moment(reg.date).format('YYYY-MM-DDTHH:mm:ss'),
    //         units: reg.units,
    //         status: 1,
    //         description: reg.note || '',
    //     }
    //     if (rateObj?.overrideName) registration.name = reg.rateName
    //     if (rateObj?.overrideRate) registration.rate = reg.rate

    //     const key = reg.zenegyEmployeeUid
    //     if (!supplementsByEmployee.has(key)) {
    //         supplementsByEmployee.set(key, { name: reg.employeeName, regs: [] })
    //     }
    //     supplementsByEmployee.get(key)!.regs.push({ employeeUid: reg.zenegyEmployeeUid, registration })
    // }

    // const results: Array<{ employeeName: string; type: 'hours' | 'supplements'; success: boolean; error?: string; count: number }> = []

    // for (const [userUid, { name, regs }] of hoursByEmployee) {
    //     try {
    //         await zenegyService.syncRegistrations(regs)
    //         results.push({ employeeName: name, type: 'hours', success: true, count: regs.length })
    //     } catch (e: any) {
    //         results.push({ employeeName: name, type: 'hours', success: false, error: parseZenegyError(e), count: regs.length })
    //     }
    // }

    // for (const [empUid, { name, regs }] of supplementsByEmployee) {
    //     try {
    //         await zenegyService.syncSupplementRegistrations(regs)
    //         results.push({ employeeName: name, type: 'supplements', success: true, count: regs.length })
    //     } catch (e: any) {
    //         results.push({ employeeName: name, type: 'supplements', success: false, error: parseZenegyError(e), count: regs.length })
    //     }
    // }

    // state.syncResult = results
    // state.syncStep = 'result'
    // state.isSyncing = false

    // const successCount = results.filter(r => r.success).reduce((sum, r) => sum + r.count, 0)
    // const failCount = results.filter(r => !r.success).reduce((sum, r) => sum + r.count, 0)

    // if (failCount === 0) {
    //     successAlert(`${t('alert.success')}!`, t('dutySchedules.zenegy_sync_success'))
    // } else if (successCount > 0) {
    //     errorAlert(t('alert.warning'), t('dutySchedules.zenegy_sync_partial'))
    // } else {
    //     errorAlert(t('alert.error'), t('dutySchedules.zenegy_sync_failed'))
    // }
}
</script>
