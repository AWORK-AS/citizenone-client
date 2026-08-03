<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('settings.tabs.wageSupplementRules') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('settings.tabs.wageSupplementRules') }}</template>

            <ModulesUserSettingsTab />

            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8 max-w-3xl">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <p class="text-sm text-gray-500 mb-4">
                    {{ $t('wageSupplementRules.form.explanation') }}
                </p>

                <div class="flex justify-end mb-4">
                    <FormButton type="button" buttonStyle="action" @click="addRule">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('wageSupplementRules.form.addRule') }}
                    </FormButton>
                </div>

                <p v-if="!state.isLoading && state.rules.length === 0" class="text-sm text-gray-400">
                    {{ $t('wageSupplementRules.form.empty') }}
                </p>

                <div class="space-y-4">
                    <div v-for="(rule, index) in state.rules" :key="rule.uuid ?? `new-${index}`"
                        class="border border-gray-200 rounded-xl p-4 space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium text-gray-700">
                                {{ $t('wageSupplementRules.form.ruleTitle') }} {{ index + 1 }}
                            </span>
                            <button type="button" @click="removeRule(index)" class="text-red-500 hover:text-red-700">
                                <Icon name="ph:trash" size="18" />
                            </button>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel :label="$t('wageSupplementRules.form.name')" />
                                <FormTextField :id="`rule_name_${index}`" :name="`rule_name_${index}`"
                                    :placeholder="$t('wageSupplementRules.form.namePlaceholder')"
                                    v-model="rule.name" />
                                <span v-if="state.ruleErrors[index]?.name" class="text-xs text-red-500">
                                    {{ state.ruleErrors[index].name }}
                                </span>
                            </div>
                            <div class="space-y-1">
                                <FormLabel :label="$t('wageSupplementRules.form.priority')" />
                                <FormNumberField :id="`rule_priority_${index}`" :name="`rule_priority_${index}`" :min="0" v-model="rule.priority" />
                                <p class="text-xs text-gray-400">{{ $t('wageSupplementRules.form.priorityHint') }}</p>
                            </div>
                        </div>

                        <div class="space-y-1">
                            <div class="flex items-center justify-between">
                                <p class="text-sm text-gray-500">{{ $t('wageSupplementRules.form.timeInterval') }}</p>
                                <button v-if="rule.time_from || rule.time_to" type="button"
                                    @click="rule.time_from = ''; rule.time_to = ''"
                                    class="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                                    <Icon name="ph:x" size="12" />
                                    {{ $t('clear') }}
                                </button>
                            </div>
                            <div class="flex items-center gap-3">
                                <div class="flex-1 space-y-1">
                                    <FormLabel :label="$t('wageSupplementRules.form.timeFrom')" />
                                    <FormTimeField :id="`rule_time_from_${index}`" :name="`rule_time_from_${index}`" v-model:value="rule.time_from" />
                                </div>
                                <div class="flex-1 space-y-1">
                                    <FormLabel :label="$t('wageSupplementRules.form.timeTo')" />
                                    <FormTimeField :id="`rule_time_to_${index}`" :name="`rule_time_to_${index}`" v-model:value="rule.time_to" />
                                </div>
                            </div>
                            <p class="text-xs text-gray-400">{{ $t('wageSupplementRules.form.allDayHint') }}</p>
                        </div>

                        <div class="space-y-1">
                            <p class="text-sm text-gray-500">{{ $t('wageSupplementRules.form.daysOfWeek') }}</p>
                            <div class="flex gap-1 flex-wrap">
                                <button v-for="day in daysOfWeekOptions" :key="day.value" type="button"
                                    @click="toggleDayOfWeek(rule, day.value)"
                                    :class="[
                                        'px-2 py-1 text-xs rounded-full border transition-colors',
                                        (rule.days_of_week ?? []).includes(day.value)
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                                    ]">
                                    {{ day.label }}
                                </button>
                            </div>
                            <p class="text-xs text-gray-400">{{ $t('wageSupplementRules.form.daysOfWeekHint') }}</p>
                        </div>

                        <div class="flex items-center cursor-pointer" @click="rule.applies_to_holidays = !rule.applies_to_holidays">
                            <FormCheckbox :value="rule.applies_to_holidays" />
                            <span class="ml-1 text-sm">{{ $t('wageSupplementRules.form.appliesToHolidays') }}</span>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                            <div class="space-y-1">
                                <FormLabel :label="$t('wageSupplementRules.form.supplementPercentage')" />
                                <FormNumberField :id="`rule_supplement_${index}`" :name="`rule_supplement_${index}`" :min="0" :max="100"
                                    v-model="rule.supplement_percentage" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel :label="$t('wageSupplementRules.form.compTimePercentage')" />
                                <FormNumberField :id="`rule_comp_${index}`" :name="`rule_comp_${index}`" :min="0" :max="100"
                                    v-model="rule.comp_time_percentage" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel :label="$t('wageSupplementRules.form.paidPercentage')" />
                                <FormNumberField :id="`rule_paid_${index}`" :name="`rule_paid_${index}`" :min="0" :max="100"
                                    v-model="rule.paid_percentage" />
                            </div>
                        </div>
                        <span v-if="state.ruleErrors[index]?.supplement_percentage" class="text-xs text-red-500">
                            {{ state.ruleErrors[index].supplement_percentage }}
                        </span>

                        <div class="flex items-center justify-between pt-2">
                            <div class="flex items-center cursor-pointer" @click="rule.is_active = !rule.is_active">
                                <FormCheckbox :value="rule.is_active" />
                                <span class="ml-1 text-sm">{{ $t('wageSupplementRules.form.isActive') }}</span>
                            </div>
                            <FormButton type="button" buttonStyle="primary" :disabled="state.isSaving"
                                @click="saveRule(index)">
                                {{ rule.uuid ? $t('update') : $t('save') }}
                            </FormButton>
                        </div>
                    </div>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { wageSupplementRuleService } from '@/components/api/user/WageSupplementRuleService'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any

watch(() => userStore.getUser, (user: any) => {
    if (user?.uuid && user?.is_extended_duty_schedule_active === false) navigateTo('/apps')
}, { immediate: true })

const breadcrumbLinks = [
    {
        name: 'settings.tabs.wageSupplementRules',
        translate: true,
        href: '/settings/wage-supplement-rules',
    },
]

const state = reactive({
    error: {} as Error,
    isLoading: false,
    isSaving: false,
    rules: [] as any[],
    ruleErrors: [] as any[],
})

const daysOfWeekOptions = computed(() => [
    { value: 0, label: t('recurring.days.sunday').slice(0, 3) },
    { value: 1, label: t('recurring.days.monday').slice(0, 3) },
    { value: 2, label: t('recurring.days.tuesday').slice(0, 3) },
    { value: 3, label: t('recurring.days.wednesday').slice(0, 3) },
    { value: 4, label: t('recurring.days.thursday').slice(0, 3) },
    { value: 5, label: t('recurring.days.friday').slice(0, 3) },
    { value: 6, label: t('recurring.days.saturday').slice(0, 3) },
])

onMounted(() => {
    fetchRules()
})

async function fetchRules() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await wageSupplementRuleService.getRules()
        state.rules = (response?.data ?? []).map((rule: any) => ({ ...rule }))
        state.ruleErrors = state.rules.map(() => ({}))
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function addRule() {
    state.rules.push({
        name: '',
        time_from: '',
        time_to: '',
        days_of_week: [],
        applies_to_holidays: false,
        supplement_percentage: '',
        comp_time_percentage: '',
        paid_percentage: '',
        priority: state.rules.length,
        is_active: true,
    })
    state.ruleErrors.push({})
}

async function removeRule(index: number) {
    const rule = state.rules[index]
    if (!rule.uuid) {
        state.rules.splice(index, 1)
        state.ruleErrors.splice(index, 1)
        return
    }
    try {
        await wageSupplementRuleService.deleteRule(rule.uuid)
        state.rules.splice(index, 1)
        state.ruleErrors.splice(index, 1)
        successAlert(`${t('alert.success')}!`, `${t('wageSupplementRules.alert.ruleSuccessfullyDeleted')}.`)
    } catch (error: any) {
        state.error = error
    }
}

function toggleDayOfWeek(rule: any, day: number) {
    if (!rule.days_of_week) rule.days_of_week = []
    const idx = rule.days_of_week.indexOf(day)
    if (idx === -1) {
        rule.days_of_week.push(day)
    } else {
        rule.days_of_week.splice(idx, 1)
    }
}

function validateRule(rule: any, index: number): boolean {
    const errors: any = {}
    let valid = true

    if (!rule.name) {
        errors.name = `${t('validation.thisFieldIsRequired')}.`
        valid = false
    }

    const comp = Number(rule.comp_time_percentage) || 0
    const paid = Number(rule.paid_percentage) || 0
    const supplement = Number(rule.supplement_percentage) || 0
    if (Math.round((comp + paid) * 100) / 100 > Math.round(supplement * 100) / 100) {
        errors.supplement_percentage = `${t('wageSupplementRules.form.supplementExceededError')}.`
        valid = false
    }

    state.ruleErrors[index] = errors
    return valid
}

async function saveRule(index: number) {
    const rule = state.rules[index]
    if (!validateRule(rule, index)) return

    state.error = {}
    state.isSaving = true
    try {
        const params = {
            name: rule.name,
            time_from: rule.time_from ? rule.time_from.substring(0, 5) : null,
            time_to: rule.time_to ? rule.time_to.substring(0, 5) : null,
            days_of_week: rule.days_of_week?.length > 0 ? rule.days_of_week : null,
            applies_to_holidays: rule.applies_to_holidays ?? false,
            supplement_percentage: Number(rule.supplement_percentage) || 0,
            comp_time_percentage: Number(rule.comp_time_percentage) || 0,
            paid_percentage: Number(rule.paid_percentage) || 0,
            priority: Number(rule.priority) || 0,
            is_active: rule.is_active ?? true,
        }

        const response = rule.uuid
            ? await wageSupplementRuleService.updateRule(rule.uuid, params)
            : await wageSupplementRuleService.saveRule(params)

        if (response?.data) {
            state.rules[index] = { ...response.data }
            successAlert(`${t('alert.success')}!`, `${t('wageSupplementRules.alert.ruleSuccessfullySaved')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}
</script>
