<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-3xl" id="dutyShiftRuleForm">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />

        <div class="space-y-4">
            <div class="space-y-1">
                <FormLabel for="name" :label="$t('dutyShiftRules.form.dutyShiftRuleName')" />
                <FormTextField id="name" name="name" placeholder="" v-model="state.formDutyShiftRule.name" />
                <FormError :error="v$?.formDutyShiftRule?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="flex items-center gap-1.5">
                    <FormLabel for="condition_type" :label="$t('dutyShiftRules.form.conditionType')" />
                    <Icon name="ph:question" class="h-4 w-4 text-gray-400 cursor-pointer"
                        @click.stop="state.modal.isModalConditionTypeInfoOpen = true" />
                </div>
                <FormSelect id="condition_type" :options="conditionTypeOptions"
                    v-model="state.formDutyShiftRule.condition_type" />
                <FormError :error="v$?.formDutyShiftRule?.condition_type?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.condition_type?.[0]" />
            </div>
            <div class="space-y-1" v-if="state.formDutyShiftRule.condition_type === 'count'">
                <FormLabel for="condition_threshold" :label="$t('dutyShiftRules.form.threshold')" />
                <FormTextField id="condition_threshold" name="condition_threshold" type="number" min="1" placeholder=""
                    v-model="state.formDutyShiftRule.condition_threshold" />
                <FormError :error="v$?.formDutyShiftRule?.condition_threshold?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.condition_threshold?.[0]" />
            </div>
            <div class="space-y-1" v-if="state.formDutyShiftRule.condition_type === 'consecutive'">
                <FormLabel for="condition_threshold" :label="$t('dutyShiftRules.form.consecutiveDays')" />
                <FormTextField id="condition_threshold" name="condition_threshold" type="number" min="1" placeholder=""
                    v-model="state.formDutyShiftRule.condition_threshold" />
                <FormError :error="v$?.formDutyShiftRule?.condition_threshold?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.condition_threshold?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="shift_type_uuids" :label="$t('dutyShiftRules.form.shiftTypes')" />
                <FormSelectMultiple id="shift_type_uuids" :options="state.shiftOptions"
                    v-model="state.formDutyShiftRule.shift_type_uuids" />
                <FormError :error="v$?.formDutyShiftRule?.shift_type_uuids?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.shift_type_uuids?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="recipient_type" :label="$t('dutyShiftRules.form.recipientType')" />
                <FormSelect id="recipient_type" :options="state.recipientTypeOptions" v-model="state.recipientType" />
                <FormError :error="v$?.recipientType?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.recipient_type?.[0]" />
            </div>
            <div class="space-y-1" v-if="state.recipientType === 'role'">
                <FormLabel for="role_names" :label="$t('dutyShiftRules.form.roles')" />
                <FormSelectMultiple id="role_names" :options="state.roleOptions" v-model="state.roleNames" />
                <FormError :error="props?.error?.errors?.role_names?.[0]" />
            </div>
            <div class="space-y-1" v-if="state.recipientType === 'user'">
                <FormLabel for="user_uuids" :label="$t('dutyShiftRules.form.users')" />
                <FormSelectMultiple id="user_uuids" :options="state.userOptions" v-model="state.userUuids" />
                <FormError :error="props?.error?.errors?.user_uuids?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="flex items-center gap-1.5">
                    <FormLabel for="period_days" :label="$t('dutyShiftRules.form.periodDays')" />
                    <Icon name="ph:question" class="h-4 w-4 text-gray-400 cursor-pointer"
                        @click.stop="state.modal.isModalPeriodInfoOpen = true" />
                </div>
                <FormTextField id="period_days" name="period_days" type="number" min="1" placeholder="e.g. 30"
                    v-model="state.formDutyShiftRule.period_days" />
                <FormError :error="v$?.formDutyShiftRule?.period_days?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.period_days?.[0]" />
            </div>
            <div class="space-y-2">
                <div class="w-fit flex items-center gap-2 cursor-pointer" @click="toggleAnchorDate">
                    <FormCheckbox :value="state.showAnchorDate" />
                    <span class="text-sm font-medium text-gray-700 select-none">{{
                        $t('dutyShiftRules.form.addAnchorDate') }}</span>
                </div>
                <div v-if="state.showAnchorDate" class="space-y-1">
                    <FormLabel for="anchor_date" :label="$t('dutyShiftRules.form.anchorDate')" />
                    <FormDateField id="anchor_date" name="anchor_date" placeholder=""
                        v-model="state.formDutyShiftRule.anchor_date" />
                    <FormError :error="props?.error?.errors?.anchor_date?.[0]" />
                </div>
                <div v-if="windowPreview"
                    class="flex items-center gap-2 rounded-md bg-primary/5 border border-primary/20 px-3 py-2">
                    <Icon name="ph:calendar-blank" class="h-4 w-4 text-primary flex-shrink-0" />
                    <p class="text-xs text-primary">
                        {{ $t('dutyShiftRules.form.evaluatingShiftsFrom') }}
                        <span class="font-semibold">{{ windowPreview.start }}</span>
                        {{ $t('dutyShiftRules.form.to') }}
                        <span class="font-semibold">{{ windowPreview.end }}</span>
                    </p>
                </div>
            </div>
            <div class="w-fit flex items-center gap-2 cursor-pointer"
                @click="state.formDutyShiftRule.is_active = !state.formDutyShiftRule.is_active">
                <FormCheckbox :value="state.formDutyShiftRule.is_active" />
                <span class="text-sm font-medium text-gray-700 select-none">{{ $t('dutyShiftRules.form.active')
                    }}</span>
            </div>
            <div class="space-y-5">
                <div class="flex items-center gap-1.5">
                    <FormLabel :label="$t('dutyShiftRules.form.scopeConditions')" />
                    <Icon name="ph:question" class="h-4 w-4 text-gray-400 cursor-pointer"
                        @click.stop="state.modal.isModalScopeConditionsInfoOpen = true" />
                </div>

                <div v-if="state.formDutyShiftRule.scope_conditions.length === 0" class="text-sm text-gray-400 italic">
                    {{ $t('dutyShiftRules.form.noScopeConditions') }}
                </div>

                <div v-for="(condition, index) in state.formDutyShiftRule.scope_conditions" :key="index"
                    class="grid grid-cols-[1fr_9rem_1fr_auto] gap-2 items-center">
                    <FormSelect :id="`scope_type_${index}`" :options="state.scopeTypeOptions"
                        :modelValue="condition.type"
                        @update:modelValue="(val: string) => { condition.type = val; condition.value_id = '' }" />
                    <FormSelect :id="`scope_operator_${index}`" :options="state.scopeOperatorOptions"
                        v-model="condition.operator" />
                    <FormSelect :id="`scope_value_${index}`" :options="getScopeValueOptions(condition.type)"
                        v-model="condition.value_id" />
                    <button type="button" class="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        @click="removeScopeCondition(index)">
                        <Icon name="ph:x" class="h-4 w-4" />
                    </button>
                </div>

                <button type="button" class="text-sm text-secondary flex items-center gap-1 hover:underline"
                    @click="addScopeCondition()">
                    <Icon name="ph:plus" class="h-4 w-4" />
                    {{ $t('dutyShiftRules.form.addScopeCondition') }}
                </button>
            </div>
        </div>

        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="navigateTo('/settings/duty-shift-rules')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary">
                    {{ props.formType === 'create' ? $t('save') : $t('update') }}
                </FormButton>
            </div>
        </div>
        <ModulesUserDutyShiftRuleModalPeriodInfo :isModalOpen="state.modal.isModalPeriodInfoOpen"
            @close="state.modal.isModalPeriodInfoOpen = false" />
        <ModulesUserDutyShiftRuleModalConditionTypeInfo :isModalOpen="state.modal.isModalConditionTypeInfoOpen"
            @close="state.modal.isModalConditionTypeInfoOpen = false" />
        <ModulesUserDutyShiftRuleModalScopeConditionsInfo :isModalOpen="state.modal.isModalScopeConditionsInfoOpen"
            @close="state.modal.isModalScopeConditionsInfoOpen = false" />
    </form>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import moment from 'moment'
import type { Error } from '@/types'
import { shiftService } from '@/components/api/user/ShiftService'
import { roleService } from '@/components/api/user/RoleService'
import { userService } from '@/components/api/user/UserService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { jobTitleService } from '@/components/api/user/JobTitleService'

interface ScopeCondition {
    type: string
    operator: string
    value_id: string
}

interface Recipient {
    type: string
    value: string
}

const props = defineProps({
    error: { type: Object, required: false },
    formType: { type: String, required: true },
    selectedRule: { type: Object, required: false },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])
const { t } = useI18n()

const conditionTypeOptions = computed(() => [
    { value: 'count', label: t('dutyShiftRules.form.conditionTypes.count') },
    { value: 'consecutive', label: t('dutyShiftRules.form.conditionTypes.consecutive') },
])

const state = reactive({
    recipientTypeOptions: [
        { value: 'role', label: t('dutyShiftRules.form.recipientTypes.role') },
        { value: 'user', label: t('dutyShiftRules.form.recipientTypes.user') },
    ],
    scopeTypeOptions: [
        { value: 'department', label: t('dutyShiftRules.form.scopeConditionTypes.department') },
        { value: 'job_title', label: t('dutyShiftRules.form.scopeConditionTypes.job_title') },
        { value: 'employee', label: t('dutyShiftRules.form.scopeConditionTypes.employee') },
    ],
    scopeOperatorOptions: [
        { value: 'and', label: t('dutyShiftRules.form.scopeOperators.and') },
        { value: 'or', label: t('dutyShiftRules.form.scopeOperators.or') },
    ],
    recipientType: null as string | null,
    showAnchorDate: false,
    roleNames: [] as string[],
    userUuids: [] as string[],
    formDutyShiftRule: {
        name: '',
        period_days: '' as string,
        anchor_date: '' as string,
        condition_type: null as string | null,
        condition_threshold: '' as string,
        shift_type_uuids: [] as string[],
        recipients: [] as Recipient[],
        scope_conditions: [{ type: '', operator: 'and', value_id: '' }] as ScopeCondition[],
        is_active: true,
    },
    modal: {
        isModalPeriodInfoOpen: false,
        isModalConditionTypeInfoOpen: false,
        isModalScopeConditionsInfoOpen: false,
    },
    shiftOptions: [] as any[],
    roleOptions: [] as any[],
    userOptions: [] as any[],
    departmentOptions: [] as any[],
    jobTitleOptions: [] as any[],
    employeeOptions: [] as any[],
    error: {} as Error,
})

watch(
    [() => state.recipientType, () => state.roleNames, () => state.userUuids],
    () => {
        if (state.recipientType === 'role') {
            state.formDutyShiftRule.recipients = state.roleNames.map(name => ({ type: 'role', value: String(name) }))
        } else if (state.recipientType === 'user') {
            state.formDutyShiftRule.recipients = state.userUuids.map(uuid => ({ type: 'user', value: uuid }))
        } else {
            state.formDutyShiftRule.recipients = []
        }
    },
)

onMounted(() => {
    fetchAllShifts()
    fetchAllRoles()
    fetchAllUsers()
    fetchAllDepartments()
    fetchAllJobTitles()
})

watch(() => props.selectedRule, (newValue: any) => {
    if (newValue != null) {
        const recipients = newValue.recipients ?? []
        const roleNames = recipients.filter((r: any) => r.recipient_type === 'role').map((r: any) => r.recipient_value)
        const userUuids = recipients.filter((r: any) => r.recipient_type === 'user').map((r: any) => r.recipient_value)

        state.recipientType = roleNames.length > 0 ? 'role' : (userUuids.length > 0 ? 'user' : null)
        state.roleNames = roleNames
        state.userUuids = userUuids
        state.showAnchorDate = !!(newValue.anchor_date)

        state.formDutyShiftRule = {
            name: newValue.name ?? '',
            period_days: newValue.period_days?.toString() ?? '',
            anchor_date: newValue.anchor_date ?? '',
            condition_type: newValue.condition_type ?? null,
            condition_threshold: newValue.condition_threshold?.toString() ?? '',
            shift_type_uuids: newValue.shift_types?.map((st: any) => st.uuid) ?? [],
            recipients: recipients.map((r: any) => ({ type: r.recipient_type, value: r.recipient_value })),
            scope_conditions: newValue.scope_conditions?.length ? newValue.scope_conditions.map((sc: any) => ({ type: sc.type, operator: sc.operator, value_id: sc.value_id })) : [{ type: '', operator: 'and', value_id: '' }],
            is_active: newValue.is_active ?? true,
        }
    }
})

const rules = computed(() => ({
    formDutyShiftRule: {
        name: { required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required) },
        period_days: { required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required) },
        condition_type: { required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required) },
        condition_threshold: (state.formDutyShiftRule.condition_type === 'count' || state.formDutyShiftRule.condition_type === 'consecutive')
            ? { required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required) }
            : {},
        shift_type_uuids: { required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required) },
    },
    recipientType: { required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required) },
}))

const v$ = useVuelidate(rules, state)

const windowPreview = computed(() => {
    const days = Number(state.formDutyShiftRule.period_days)
    if (!days || days < 1) return null
    const anchor = state.formDutyShiftRule.anchor_date
        ? moment(state.formDutyShiftRule.anchor_date)
        : moment()
    return {
        start: anchor.clone().subtract(days, 'days').format('DD MMM YYYY'),
        end: anchor.format('DD MMM YYYY'),
    }
})

function getScopeValueOptions(type: string) {
    if (type === 'department') return state.departmentOptions
    if (type === 'job_title') return state.jobTitleOptions
    if (type === 'employee') return state.employeeOptions
    return []
}

function toggleAnchorDate() {
    state.showAnchorDate = !state.showAnchorDate
    if (!state.showAnchorDate) {
        state.formDutyShiftRule.anchor_date = ''
    }
}

function addScopeCondition() {
    state.formDutyShiftRule.scope_conditions.push({ type: '', operator: 'and', value_id: '' })
}

function removeScopeCondition(index: number) {
    state.formDutyShiftRule.scope_conditions.splice(index, 1)
}

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formDutyShiftRule)
    }
}

async function fetchAllShifts() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {}
        const response = await shiftService.getAllShifts(params)
        if (response) {
            let options: any = []
            response.data.forEach((item: any) => {
                options.push({ value: item.uuid, label: item.en_name })
            })
            state.shiftOptions = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchAllRoles() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {}
        const response = await roleService.getAllRoles()
        if (response) {
            let options: any = []
            response.data.forEach((item: any) => {
                options.push({ value: item.id, label: item.name })
            })
            state.roleOptions = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchAllUsers() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await userService.getAllUsersWithoutAllUsersOption()
        if (response) {
            let userOptions: any = []
            let employeeOptions: any = []
            response.data.forEach((item: any) => {
                const label = `${item.firstname} ${item.lastname ?? ''}`.trim()
                userOptions.push({ value: item.uuid, label })
                employeeOptions.push({ value: item.id, label })
            })
            state.userOptions = userOptions
            state.employeeOptions = employeeOptions
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchAllDepartments() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {}
        const response = await departmentService.getAllDepartments(params)
        if (response) {
            let options: any = []
            response.data.forEach((item: any) => {
                if (item.id != null) {
                    options.push({ value: item.id, label: item.name })
                }
            })
            state.departmentOptions = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchAllJobTitles() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {}
        const response = await jobTitleService.getAllJobTitles()
        if (response) {
            let options: any = []
            response.data.forEach((item: any) => {
                options.push({ value: item.id, label: item.title })
            })
            state.jobTitleOptions = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}
</script>

<style>
#dutyShiftRuleForm .multiselect-dropdown {
    max-height: 4.8rem !important;
}
</style>
