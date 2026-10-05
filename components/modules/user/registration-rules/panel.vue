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
                    <dd class="mt-0.5" :class="state.rules.mileage_allowed ? 'text-gray-900' : 'text-red-700'">
                        {{ state.rules.mileage_allowed ? $t('registrationRules.allowed') : $t('registrationRules.notAllowed') }}
                    </dd>
                </div>
                <div>
                    <dt class="text-xs text-gray-500">{{ $t('registrationRules.expenses') }}</dt>
                    <dd class="mt-0.5" :class="state.rules.expenses_allowed ? 'text-gray-900' : 'text-red-700'">
                        {{ state.rules.expenses_allowed ? $t('registrationRules.allowed') : $t('registrationRules.notAllowed') }}
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
                <div class="flex flex-wrap gap-6">
                    <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
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
        </LoadingSpinner>
    </section>
</template>

<script setup lang="ts">
import { registrationRuleService, type RuleTarget } from '@/components/api/user/RegistrationRuleService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { successAlert, errorAlert } = useAlert()

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
    },
    visitTypes: [] as any[],
    draft: {
        allTypes: true,
        typeUuids: [] as string[],
        mileage_allowed: true,
        expenses_allowed: true,
    },
})

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
        mileage_allowed: state.rules.mileage_allowed,
        expenses_allowed: state.rules.expenses_allowed,
    }
    state.editing = true
}

async function save() {
    state.isLoading = true
    try {
        const response = await registrationRuleService.saveRules(props.target, props.uuid, {
            allowed_visit_type_uuids: state.draft.allTypes ? null : [...state.draft.typeUuids],
            mileage_allowed: state.draft.mileage_allowed,
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
