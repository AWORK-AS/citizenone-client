<template>
    <div class="relative" ref="triggerRef" @mouseover="showTooltip" @mouseleave="scheduleHide">
        <slot />
        <Teleport to="body">
            <div v-if="visible" ref="tooltipRef" class="fixed z-[9999] p-4 bg-white rounded shadow-lg tooltip"
                :class="arrowClass" :style="tooltipStyle" @mouseenter="cancelHide" @mouseleave="scheduleHide">
                <div class="flex justify-between">
                    <div class="flex items-center gap-x-2">
                        <img :src="props.selectedEmployee?.profile_image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${getDisplayName(props.selectedEmployee).firstName + ' ' + getDisplayName(props.selectedEmployee).lastName}`"
                            :class="[
                                props.selectedEmployee?.shift_threshold === 'high' && 'border-green-700',
                                props.selectedEmployee?.shift_threshold === 'moderate' && 'border-yellow-500',
                                props.selectedEmployee?.shift_threshold === 'low' && 'border-red-600',
                                'h-10 w-10 rounded-full bg-gray-50 object-cover border-2'
                            ]" />
                        <p class="text-gray-900 text-sm font-medium">
                            {{ getDisplayName(props.selectedEmployee).firstName }}
                            {{ getDisplayName(props.selectedEmployee).lastName }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-1">
                        <Tooltip position="right" :text="$t('dutySchedules.extraHours.extraHours')"
                            v-if="isAdmin(userStore.getUser?.role) || userStore.getUser?.uuid === props.selectedEmployee?.uuid">
                            <button
                                class="bg-gray-200 w-6 h-6 text-sm text-gray-600 rounded-sm hover:bg-gray-400 hover:text-gray-200 flex items-center justify-center"
                                @click="viewExtraHours()">
                                <Icon name="mdi:clock-outline" class="h-3 w-3" aria-hidden="true" />
                            </button>
                        </Tooltip>
                        <Tooltip position="right" :text="$t('dutySchedules.leaveRequests.leaveRequests')"
                            v-if="isAdmin(userStore.getUser?.role) || (!isAdmin(userStore.getUser?.role) && userStore.getUser?.uuid === employee?.uuid)">
                            <button
                                class="bg-gray-200 w-6 h-6 text-sm text-gray-600 rounded-sm hover:bg-gray-400 hover:text-gray-200 flex items-center justify-center"
                                @click="viewLeaveRequests()">
                                <Icon name="mdi:wallet-travel" class="h-3 w-3" aria-hidden="true" />
                            </button>
                        </Tooltip>
                    </div>
                </div>
                <div class="ml-12 text-gray-800">
                    <p class="text-xxs">
                        {{ props.selectedEmployee?.employee_detail?.job?.title }}
                    </p>
                    <div class="text-xxs flex flex-wrap max-w-72">
                        {{ $t('departments.departments') }}:
                        <span v-for="(department, departmentIndex) in props.selectedEmployee?.departments"
                            :key="departmentIndex">
                            {{ department?.name }}<span
                                v-if="departmentIndex < props.selectedEmployee.departments.length - 1">,
                            </span><span v-else>.</span>
                        </span>
                    </div>

                    <div class="flex items-center gap-1 cursor-pointer" @click="viewAnnualNormHoursInfo()">
                        <p class="text-xxs">
                            {{ $t('dutySchedules.annualNormHours') }}:
                            {{ props.selectedEmployee?.annual_norm_hours ?? 0 }}
                        </p>
                        <Icon name="ph:question" class="h-3.5 w-3.5" aria-hidden="true" />
                    </div>

                    <div class="flex items-center gap-1 cursor-pointer" @click="viewAnnualNormHoursInfo()">
                        <p class="text-xxs">
                            {{ $t('dutySchedules.weeklyNormHours') }}:
                            {{ (Math.round(Number(props.selectedEmployee?.annual_norm_hours) / 52)) ?? 0 }}
                        </p>
                        <Icon name="ph:question" class="h-3.5 w-3.5" aria-hidden="true" />
                    </div>

                    <p class="text-xxs">
                        {{ $t('dutySchedules.totalHours') }}:
                        {{ props.selectedEmployee?.total_hours ?? 0 }}
                    </p>

                    <p :class="[
                        props.selectedEmployee?.average_weekly_work_time?.severity === 'info' ? 'text-green-700' :
                            props.selectedEmployee?.average_weekly_work_time?.severity === 'warning' ? 'text-amber-700' :
                                'text-red-700',
                        'text-xxs'
                    ]">
                        {{ $t('dutySchedules.averageWeeklyHours.averageWeeklyHours') }}:
                        {{ props.selectedEmployee?.average_weekly_work_time?.average_weekly_hours }}
                    </p>
                    <p :class="[
                        parseFloat(props.selectedEmployee?.log_data.total_time_account_earned_hours?.replace(',', '.')) > 0 ? 'text-green-700' : 'text-red-700',
                        'text-xxs'
                    ]">
                        {{ $t('dutySchedules.earnedWorkHours') }}:
                        {{ props.selectedEmployee?.log_data.total_time_account_earned_hours }}
                    </p>
                    <p :class="[
                        parseFloat(props.selectedEmployee?.extra_hours?.replace(',', '.')) > 0 ? 'text-green-700' : 'text-red-700',
                        'text-xxs'
                    ]">
                        {{ $t('dutySchedules.extraHours.extraHours') }}:
                        {{ props.selectedEmployee?.extra_hours }}
                    </p>

                    <div class="p-0 m-0 text-xxs text-primary cursor-pointer hover:text-primary-700"
                        @click="navigateTo(`/calendar?employee_uuid=${props.selectedEmployee?.uuid}`)">
                        {{ $t('dutySchedules.viewCalendar') }}
                    </div>
                </div>
                <div class="text-xs grid grid-cols-7">
                    <div class="col-span-3 space-y-2" />
                    <div class="col-span-2 flex gap-2 flex-col items-end">
                        <p class="text-xxs py-2 pr-2 text-gray-900">
                            {{ $t('dutySchedules.week') }}
                        </p>
                    </div>
                    <div class="col-span-2 flex gap-2 flex-col items-end border-l-0.5 border-gray-200">
                        <p class="text-xxs py-2 pr-2 text-gray-900">
                            {{ $t('dutySchedules.yearToDate') }}
                        </p>
                    </div>
                </div>
                <div class="text-xs grid grid-cols-7">
                    <div class="col-span-3">
                        <div v-for="(time, timeIndex) in props.selectedEmployee?.hours" :key="timeIndex" :class="[
                            timeIndex % 2 ? 'bg-white' : 'bg-gray-100',
                            'py-1 text-gray-900'
                        ]">
                            <div class="pl-3">
                                <Tooltip
                                    :text="language.locale.value === 'en' ? time?.shift?.en_name : time?.shift?.dk_name">
                                    <div class="flex items-center gap-x-1">
                                        <div>
                                            <div :class="`w-2 h-2 rounded-sm`"
                                                :style="{ background: time?.shift?.color }" />
                                        </div>
                                        <div class="truncate w-36">
                                            {{ language.locale.value === 'en' ?
                                                time?.shift?.en_name :
                                                time?.shift?.dk_name
                                            }}
                                        </div>
                                    </div>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                    <div class="col-span-2">
                        <div v-for="(time, timeIndex) in props.selectedEmployee?.hours" :key="timeIndex" :class="[
                            timeIndex % 2 ? 'bg-white' : 'bg-gray-100',
                            'text-gray-900'
                        ]">
                            <div class="text-right py-1 pr-2">
                                {{ time?.weekly_hours }}
                            </div>
                        </div>
                    </div>
                    <div class="col-span-2 border-l-0.5 border-gray-200">
                        <div v-for="(time, timeIndex) in props.selectedEmployee?.hours" :key="timeIndex" :class="[
                            timeIndex % 2 ? 'bg-white' : 'bg-gray-100',
                            'text-gray-900'
                        ]">
                            <div class="text-right py-1 pr-2">
                                {{ time?.yearly_hours }}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="text-xs">
                    <div class="px-3 col-span-7 space-y-2 mt-4 border-t-0.5 border-gray-200 pt-3">
                        <div :class="[
                            'text-primary',
                            'flex items-center gap-1 w-fit cursor-pointer'
                        ]" @click="openGraphModal()">
                            <Icon name="ph:chart-bar-bold" class="h-3 w-3" aria-hidden="true" />
                            {{ $t('dutySchedules.normHours.compensatoryHoursGraph') }}
                        </div>
                    </div>
                    <div class="px-3 col-span-7 space-y-2 mt-1">
                        <div :class="[
                            props.selectedEmployee?.total_norm_hours?.compensatory_hours > 0 ? 'text-green-700' : 'text-red-700',
                            'flex items-center gap-1 w-fit cursor-pointer'
                        ]" @click="viewCompensatoryHours()">
                            <Icon name="ph:clock" class="h-3 w-3" aria-hidden="true" />
                            {{ $t('dutySchedules.normHours.compensatoryHours') }}:
                            {{ formatNumber(language.locale.value,
                                props.selectedEmployee?.total_norm_hours?.compensatory_hours) ?? 0 }}
                        </div>
                    </div>
                    <div class="px-3 col-span-7 space-y-2 mt-1">
                        <div :class="[
                            props.selectedEmployee?.total_norm_hours?.available_vacation_hours > 0 ? 'text-green-700' : 'text-red-700',
                            'flex items-center gap-1 w-fit cursor-pointer'
                        ]" @click="viewAvailableVacationHours()">
                            <Icon name="ph:clock" class="h-3 w-3" aria-hidden="true" />
                            {{ $t('dutySchedules.normHours.availableVacationHours') }}:
                            {{ formatNumber(language.locale.value,
                                props.selectedEmployee?.total_norm_hours?.available_vacation_hours || 0) }}
                        </div>
                    </div>
                </div>
            </div>
            <ModulesUserDutyScheduleExtraHoursModalView :isModalOpen="state.modal.isManageExtraHoursOpen"
                :selectedEmployee="props.selectedEmployee" @close="state.modal.isManageExtraHoursOpen = false"
                @refreshDutySchedules="fetchDutySchedules()" />
            <ModulesUserDutyScheduleLeaveRequestsModalView :isModalOpen="state.modal.isManageLeaveRequestsOpen"
                :selectedEmployee="props.selectedEmployee" @close="state.modal.isManageLeaveRequestsOpen = false"
                @refreshDutySchedules="fetchDutySchedules()" />
            <ModulesUserDutyScheduleNormHoursModalInfo :isModalOpen="state.modal.isAnnualNormHoursInfoOpen"
                @close="state.modal.isAnnualNormHoursInfoOpen = false" />
            <ModulesUserDutyScheduleNormHoursModalGraph :isModalOpen="state.modal.isGraphOpen"
                :selectedEmployee="props.selectedEmployee" @close="state.modal.isGraphOpen = false" />
            <ModulesUserDutyScheduleNormHoursModalCompensatoryHours :isModalOpen="state.modal.isCompensatoryHoursOpen"
                :selectedEmployee="props.selectedEmployee" @close="state.modal.isCompensatoryHoursOpen = false" />
            <ModulesUserDutyScheduleNormHoursModalVacationHours :isModalOpen="state.modal.isVacationHoursOpen"
                :selectedEmployee="props.selectedEmployee" @close="state.modal.isVacationHoursOpen = false" />
        </Teleport>
    </div>
</template>

<script setup>
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'
import { useNumberFormatter } from '@/composables/numberFormatter'

const props = defineProps({
    position: {
        type: String,
        default: 'top',
    },
    selectedEmployee: {
        type: Object,
        required: true,
    },
})

const language = useI18n()
const userStore = useUserStore()
const visible = ref(false)
const triggerRef = ref(null)
const tooltipRef = ref(null)
const tooltipStyle = ref({})
const computedPosition = ref(props.position)
let hideTimer = null
const { formatNumber } = useNumberFormatter()

const state = reactive({
    modal: {
        isAnnualNormHoursInfoOpen: false,
        isCompensatoryHoursOpen: false,
        isGraphOpen: false,
        isManageExtraHoursOpen: false,
        isManageLeaveRequestsOpen: false,
        isVacationHoursOpen: false,
    }
})

const showTooltip = () => {
    cancelHide()
    visible.value = true
    nextTick(() => positionTooltip())
}

const scheduleHide = () => {
    hideTimer = setTimeout(() => {
        visible.value = false
    }, 100)
}

const cancelHide = () => {
    clearTimeout(hideTimer)
}

function positionTooltip() {
    if (!triggerRef.value || !tooltipRef.value) return

    const trigger = triggerRef.value.getBoundingClientRect()
    const tip = tooltipRef.value.getBoundingClientRect()
    const gap = 8
    const vw = window.innerWidth
    const vh = window.innerHeight

    // ── 1. Resolve the best side, flipping when the preferred side has no room ──
    let side = props.position

    if (side === 'top' && trigger.top - tip.height - gap < 0) side = 'bottom'
    if (side === 'bottom' && trigger.bottom + tip.height + gap > vh) side = 'top'
    if (side === 'left' && trigger.left - tip.width - gap < 0) side = 'right'
    if (side === 'right' && trigger.right + tip.width + gap > vw) side = 'left'

    // Last-resort: if the flipped side still doesn't fit, keep whichever has more room
    if (side === 'top' && trigger.top - tip.height - gap < 0)
        side = trigger.top > vh - trigger.bottom ? 'top' : 'bottom'
    if (side === 'bottom' && trigger.bottom + tip.height + gap > vh)
        side = trigger.top > vh - trigger.bottom ? 'top' : 'bottom'

    computedPosition.value = side

    // ── 2. Calculate the ideal (unclamped) top-left corner position ──
    let top, left

    switch (side) {
        case 'top':
            top = trigger.top - tip.height - gap
            left = trigger.left + trigger.width / 2 - tip.width / 2
            break
        case 'bottom':
            top = trigger.bottom + gap
            left = trigger.left + trigger.width / 2 - tip.width / 2
            break
        case 'left':
            top = trigger.top + trigger.height / 2 - tip.height / 2
            left = trigger.left - tip.width - gap
            break
        case 'right':
            top = trigger.top + trigger.height / 2 - tip.height / 2
            left = trigger.right + gap
            break
    }

    // ── 3. Clamp so the tooltip never escapes the viewport ──
    const margin = 8
    left = Math.max(margin, Math.min(left, vw - tip.width - margin))
    top = Math.max(margin, Math.min(top, vh - tip.height - margin))

    tooltipStyle.value = { top: `${top}px`, left: `${left}px` }
}

// Arrow reflects the actual resolved side, not just props.position
const arrowClass = computed(() => ({
    'tooltip-arrow-top': computedPosition.value === 'top',
    'tooltip-arrow-bottom': computedPosition.value === 'bottom',
    'tooltip-arrow-left': computedPosition.value === 'left',
    'tooltip-arrow-right': computedPosition.value === 'right',
}))

onUnmounted(() => cancelHide())

function getDisplayName(employee) {
    return {
        firstName: employee?.firstname || employee?.firstName || '',
        lastName: employee?.lastname || employee?.lastName || '',
    }
}

function isAdmin(role) {
    return role && role === 'Admin'
}

function viewExtraHours() {
    visible.value = false
    state.modal.isManageExtraHoursOpen = true
}

function viewLeaveRequests() {
    visible.value = false
    state.modal.isManageLeaveRequestsOpen = true
}

function viewAnnualNormHoursInfo() {
    visible.value = false
    state.modal.isAnnualNormHoursInfoOpen = true
}

function openGraphModal() {
    visible.value = false
    state.modal.isGraphOpen = true
}

function viewCompensatoryHours() {
    visible.value = false
    state.modal.isCompensatoryHoursOpen = true
}

function viewAvailableVacationHours() {
    visible.value = false
    state.modal.isVacationHoursOpen = true
}
</script>

<style scoped>
.tooltip::after {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
}

.tooltip-arrow-top::after {
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 4px 4px 0 4px;
    border-color: #ffffff transparent transparent transparent;
}

.tooltip-arrow-bottom::after {
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 0 4px 4px 4px;
    border-color: transparent transparent #ffffff transparent;
}

.tooltip-arrow-left::after {
    right: -4px;
    top: 50%;
    transform: translateY(-50%);
    border-width: 4px 0 4px 4px;
    border-color: transparent transparent transparent #ffffff;
}

.tooltip-arrow-right::after {
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
    border-width: 4px 4px 4px 0;
    border-color: transparent #ffffff transparent transparent;
}
</style>