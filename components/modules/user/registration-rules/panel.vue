<template>
    <section class="rounded-lg border border-gray-200 bg-white px-4 py-4">
        <div class="flex items-start justify-between gap-3">
            <div>
                <h3 class="text-sm font-semibold text-gray-900">{{ $t('registrationRules.title') }}</h3>
                <p class="mt-0.5 max-w-xl text-xs text-gray-500">
                    {{ props.target === 'inquiry' ? $t('registrationRules.inquiryHint') : $t('registrationRules.citizenHint') }}
                </p>
            </div>
            <Tooltip v-if="props.canEdit && !state.editing" :text="$t('registrationRules.edit')">
                <FormButton type="button" buttonStyle="action" :aria-label="$t('registrationRules.edit')"
                    @click="startEdit">
                    <Icon name="ph:pencil-simple" class="size-4" />
                </FormButton>
            </Tooltip>
        </div>

        <LoadingSpinner :isActive="state.isLoading">
            <!-- Read-only: what a consultant may register here. -->
            <dl v-if="!state.editing" class="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                <div>
                    <dt class="text-xs text-gray-500">{{ $t('registrationRules.visitTypes') }}</dt>
                    <dd class="mt-0.5 text-gray-900">
                        {{ state.rules.restricts_visit_types
                            ? state.rules.allowed_visit_types.map((type: any) => type.name).join(', ') || $t('registrationRules.noVisitTypes')
                            : $t('registrationRules.allVisitTypes') }}
                    </dd>
                </div>
                <div>
                    <dt class="text-xs text-gray-500">{{ $t('registrationRules.mileage') }}</dt>
                    <dd class="mt-0.5" :class="caseMileage ? 'text-gray-900' : 'text-red-700'">
                        {{ caseMileage ? $t('registrationRules.allowed') : $t('registrationRules.notAllowed') }}
                    </dd>
                    <!-- With the company switch on, a case nobody set by hand follows the transport grant. -->
                    <dd v-if="followsTransport" class="mt-0.5 text-xs text-gray-500">
                        {{ state.rules.transport_granted ? $t('registrationRules.followsTransportGranted') : $t('registrationRules.followsTransportNotGranted') }}
                    </dd>
                </div>
                <div>
                    <dt class="text-xs text-gray-500">{{ $t('registrationRules.expenses') }}</dt>
                    <dd class="mt-0.5" :class="caseExpenses ? 'text-gray-900' : 'text-red-700'">
                        {{ caseExpenses ? $t('registrationRules.allowed') : $t('registrationRules.notAllowed') }}
                    </dd>
                </div>
            </dl>

            <div v-else class="mt-3 space-y-4">
                <div>
                    <p class="text-xs font-semibold text-gray-700">{{ $t('registrationRules.visitTypes') }}</p>
                    <label class="mt-1.5 flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input type="checkbox" class="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                            v-model="state.draft.allTypes" />
                        {{ $t('registrationRules.allVisitTypes') }}
                    </label>
                    <div v-if="!state.draft.allTypes" class="mt-1.5 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
                        <label v-for="type in state.visitTypes" :key="type.uuid"
                            class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                            <input type="checkbox" class="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                                :value="type.uuid" v-model="state.draft.typeUuids" />
                            {{ type.name }}
                        </label>
                        <p v-if="!state.visitTypes.length" class="text-xs text-gray-400">
                            {{ $t('registrationRules.catalogueEmpty') }}
                            <NuxtLink to="/settings/visit-types" class="font-semibold text-primary hover:underline">
                                {{ $t('visitTypes.title') }}
                            </NuxtLink>
                        </p>
                    </div>
                </div>
                <div v-if="state.rules.requires_transport">
                    <label for="registration-rules-mileage" class="text-xs font-semibold text-gray-700">
                        {{ $t('registrationRules.mileage') }}
                    </label>
                    <select id="registration-rules-mileage" v-model="state.draft.mileageChoice"
                        class="mt-1.5 block h-10 w-full max-w-sm rounded-lg border border-gray-200 px-3 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-primary">
                        <option value="transport">
                            {{ state.rules.transport_granted ? $t('registrationRules.followTransportGranted') : $t('registrationRules.followTransportNotGranted') }}
                        </option>
                        <option value="yes">{{ $t('registrationRules.allowed') }}</option>
                        <option value="no">{{ $t('registrationRules.notAllowed') }}</option>
                    </select>
                </div>
                <div class="flex flex-wrap gap-6">
                    <label v-if="!state.rules.requires_transport" class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input type="checkbox" class="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                            v-model="state.draft.mileage_allowed" />
                        {{ $t('registrationRules.mileageAllowed') }}
                    </label>
                    <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input type="checkbox" class="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                            v-model="state.draft.expenses_allowed" />
                        {{ $t('registrationRules.expensesAllowed') }}
                    </label>
                </div>
                <div class="flex items-center gap-2">
                    <FormButton type="button" buttonStyle="cancel" @click="state.editing = false">
                        {{ $t('cancel') }}
                    </FormButton>
                    <Tooltip :text="$t('registrationRules.saveHint')">
                        <FormButton type="button" buttonStyle="primary" @click="save">
                            {{ $t('save') }}
                        </FormButton>
                    </Tooltip>
                </div>
            </div>

            <!-- Each consultant's own rule on the case: it overrides the case for them. -->
            <div v-if="props.canEdit" class="mt-5 border-t border-gray-100 pt-4">
                <p class="text-xs font-semibold text-gray-700">{{ $t('registrationRules.consultants.title') }}</p>
                <p class="mt-0.5 max-w-xl text-xs text-gray-500">{{ $t('registrationRules.consultants.hint') }}</p>
                <p v-if="!consultants.length" class="mt-2 text-xs text-gray-400">
                    {{ $t('registrationRules.consultants.empty') }}
                </p>
                <ul class="mt-2 divide-y divide-gray-100">
                    <li v-for="consultant in consultants" :key="consultant.user_uuid" class="py-2.5"
                        :data-consultant="consultant.user_uuid">
                        <div class="flex flex-wrap items-start justify-between gap-3">
                            <div class="min-w-0">
                                <p class="text-sm font-semibold text-gray-900">
                                    {{ `${consultant.firstname ?? ''} ${consultant.lastname ?? ''}`.trim() }}
                                    <span v-if="consultant.is_archived" class="ml-1 text-[11px] font-normal text-gray-400">
                                        {{ $t('registrationRules.consultants.archived') }}
                                    </span>
                                </p>
                                <p class="mt-0.5 text-xs text-gray-600">{{ consultantSummary(consultant) }}</p>
                                <p v-if="consultant.km_this_month !== null && consultant.km_this_month !== undefined"
                                    class="mt-0.5 text-[11px] text-gray-400">
                                    {{ $t('registrationRules.consultants.thisMonth', {
                                        km: formatNumber(consultant.km_this_month),
                                        amount: formatNumber(consultant.expenses_this_month ?? 0),
                                    }) }}
                                </p>
                            </div>
                            <div v-if="state.editingUser !== consultant.user_uuid && canEditUser(consultant)" class="flex items-center gap-2">
                                <FormButton type="button" buttonStyle="action" @click="startUserEdit(consultant)">
                                    {{ consultant.rule ? $t('registrationRules.consultants.change') : $t('registrationRules.consultants.set') }}
                                </FormButton>
                            </div>
                        </div>
                        <div v-if="state.editingUser === consultant.user_uuid" class="mt-3 space-y-3 rounded-lg bg-gray-50 p-3">
                            <ModulesUserRegistrationRulesUserRuleFields v-model="state.userDraft"
                                :idPrefix="`user-rule-${consultant.user_uuid}`" />
                            <div class="flex flex-wrap items-center gap-2">
                                <FormButton type="button" buttonStyle="cancel" @click="state.editingUser = null">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton v-if="consultant.rule" type="button" buttonStyle="cancel" @click="removeUserRule(consultant)">
                                    {{ $t('registrationRules.consultants.remove') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="primary" @click="saveUserRule(consultant)">
                                    {{ $t('save') }}
                                </FormButton>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </LoadingSpinner>
    </section>
</template>

<script setup lang="ts">
import {
    registrationRuleService,
    fromUserRuleDraft,
    toUserRuleDraft,
    type RuleTarget,
    type UserRuleDraft,
} from '@/components/api/user/RegistrationRuleService'
import { useAlert } from '@/composables/alert'
import { usePermissions } from '@/composables/usePermissions'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const { successAlert, errorAlert } = useAlert()
const { isAtLeast } = usePermissions()
const userStore = useUserStore() as any

const props = defineProps({
    target: {
        type: String as PropType<RuleTarget>,
        required: true,
    },
    uuid: {
        type: String,
        required: true,
    },
    canEdit: {
        type: Boolean,
        default: false,
    },
})

const state = reactive({
    isLoading: false,
    editing: false,
    rules: {
        restricts_visit_types: false,
        allowed_visit_types: [] as any[],
        mileage_allowed: true,
        expenses_allowed: true,
        // Added with the per-consultant rules; an older backend leaves them
        // out, and the panel then reads the keys above as before.
        case_mileage_allowed: undefined as boolean | undefined,
        case_expenses_allowed: undefined as boolean | undefined,
        requires_transport: false,
        mileage_follows_transport: false,
        transport_granted: false,
        consultants: [] as any[],
    } as any,
    visitTypes: [] as any[],
    draft: {
        allTypes: true,
        typeUuids: [] as string[],
        mileage_allowed: true,
        mileageChoice: 'transport' as 'transport' | 'yes' | 'no',
        expenses_allowed: true,
    },
    editingUser: null as string | null,
    userDraft: toUserRuleDraft(null) as UserRuleDraft,
})

// The case's own rule, before any consultant's.
const caseMileage = computed(() => state.rules.case_mileage_allowed ?? state.rules.mileage_allowed)
const caseExpenses = computed(() => state.rules.case_expenses_allowed ?? state.rules.expenses_allowed)
const followsTransport = computed(() => state.rules.requires_transport === true && state.rules.mileage_follows_transport === true)
const consultants = computed(() => Array.isArray(state.rules.consultants) ? state.rules.consultants : [])

function formatNumber(value: number) {
    return new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'da-DK', { maximumFractionDigits: 2 }).format(Number(value) || 0)
}

function yesNo(value: boolean) {
    return value ? t('registrationRules.allowed') : t('registrationRules.notAllowed')
}

// "Mileage: allowed (own rule) · max 200 km a month · Expenses: …"
function consultantSummary(consultant: any) {
    const rule = consultant.rule
    const parts = [
        `${t('registrationRules.mileage')}: ${yesNo(consultant.mileage_allowed)}${rule?.mileage_allowed != null ? ` (${t('registrationRules.consultants.own')})` : ''}`,
    ]
    if (rule?.mileage_monthly_km_limit != null) {
        parts.push(t('registrationRules.consultants.kmLimitShort', { km: formatNumber(rule.mileage_monthly_km_limit) }))
    }
    parts.push(`${t('registrationRules.expenses')}: ${yesNo(consultant.expenses_allowed)}${rule?.expenses_allowed != null ? ` (${t('registrationRules.consultants.own')})` : ''}`)
    if (rule?.expenses_monthly_amount_limit != null) {
        parts.push(t('registrationRules.consultants.amountLimitShort', { amount: formatNumber(rule.expenses_monthly_amount_limit) }))
    }

    return parts.join(' · ')
}

// The server refuses one's own rule below Admin (a limit you can lift
// yourself is no limit), so the button isn't offered.
function canEditUser(consultant: any) {
    return isAtLeast('Admin') || consultant.user_uuid !== userStore.getUser?.uuid
}

function startUserEdit(consultant: any) {
    state.userDraft = toUserRuleDraft(consultant.rule)
    state.editingUser = consultant.user_uuid
}

async function saveUserRule(consultant: any) {
    state.isLoading = true
    try {
        const response = await registrationRuleService.saveUserRule(props.target, props.uuid, consultant.user_uuid,
            fromUserRuleDraft(state.userDraft))
        if (response?.data) state.rules = response.data
        state.editingUser = null
        successAlert(`${t('alert.success')}!`, `${t('registrationRules.saved')}.`)
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('registrationRules.saveFailed'))
    }
    state.isLoading = false
}

async function removeUserRule(consultant: any) {
    state.isLoading = true
    try {
        const response = await registrationRuleService.deleteUserRule(props.target, props.uuid, consultant.user_uuid)
        if (response?.data) state.rules = response.data
        state.editingUser = null
        successAlert(`${t('alert.success')}!`, `${t('registrationRules.saved')}.`)
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('registrationRules.saveFailed'))
    }
    state.isLoading = false
}

async function load() {
    state.isLoading = true
    try {
        const response = await registrationRuleService.getRules(props.target, props.uuid)
        if (response?.data) state.rules = response.data
    } catch (_) {
        // Without rules everything is allowed; the read-only view says so.
    }
    state.isLoading = false
}

async function startEdit() {
    try {
        const response = await registrationRuleService.getVisitTypes(true)
        state.visitTypes = response?.data ?? []
    } catch (_) {
        state.visitTypes = []
    }
    state.draft = {
        allTypes: !state.rules.restricts_visit_types,
        typeUuids: state.rules.allowed_visit_types.map((type: any) => type.uuid),
        mileage_allowed: caseMileage.value,
        mileageChoice: followsTransport.value ? 'transport' : (caseMileage.value ? 'yes' : 'no'),
        expenses_allowed: caseExpenses.value,
    }
    state.editing = true
}

async function save() {
    state.isLoading = true
    try {
        // With the company switch on, mileage is one of three: follow the
        // transport grant, or a choice by hand either way.
        const mileage = state.rules.requires_transport
            ? {
                mileage_allowed: state.draft.mileageChoice === 'transport' ? !!state.rules.transport_granted : state.draft.mileageChoice === 'yes',
                mileage_follows_transport: state.draft.mileageChoice === 'transport',
            }
            : { mileage_allowed: state.draft.mileage_allowed }
        const response = await registrationRuleService.saveRules(props.target, props.uuid, {
            allowed_visit_type_uuids: state.draft.allTypes ? null : [...state.draft.typeUuids],
            ...mileage,
            expenses_allowed: state.draft.expenses_allowed,
        })
        if (response?.data) state.rules = response.data
        state.editing = false
        successAlert(`${t('alert.success')}!`, `${t('registrationRules.saved')}.`)
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('registrationRules.saveFailed'))
    }
    state.isLoading = false
}

onMounted(load)
watch(() => props.uuid, load)
</script>
