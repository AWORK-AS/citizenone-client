<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('journalFormConfig.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                {{ $t('journalFormConfig.title') }}
                <p class="text-sm font-normal text-gray-900">
                    {{ $t('journalFormConfig.subtitle') }}
                </p>
            </template>

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="mt-8">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <div class="flex items-center gap-x-4 mb-6">
                        <NuxtLink to="/citizens" class="flex items-center hover:cursor-pointer">
                            <Icon name="ph:arrow-left" size="20" class="text-black" />
                        </NuxtLink>
                    </div>

                    <div class="max-w-xl">
                        <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8 space-y-4">
                            <div class="flex items-center gap-x-2">
                                <FormSwitch :value="state.isRiskAssessmentVisible"
                                    @toggleSwitch="state.isRiskAssessmentVisible = !state.isRiskAssessmentVisible" />
                                <p class="text-sm text-gray-700">
                                    {{ $t('journalFormConfig.riskAssessmentToggle') }}
                                </p>
                            </div>
                            <p class="text-xs text-gray-500">
                                {{ $t('journalFormConfig.riskAssessmentDescription') }}
                            </p>

                            <div class="border-t border-gray-100 pt-4 space-y-2">
                                <div class="flex items-center gap-x-2">
                                    <FormSwitch :value="state.isScoreVisible"
                                        @toggleSwitch="state.isScoreVisible = !state.isScoreVisible" />
                                    <p class="text-sm text-gray-700">
                                        {{ $t('journalFormConfig.scoreToggle') }}
                                    </p>
                                </div>
                                <p class="text-xs text-gray-500">
                                    {{ $t('journalFormConfig.scoreDescription') }}
                                </p>
                            </div>

                            <div class="border-t border-gray-100 pt-4 space-y-2">
                                <div class="flex items-center gap-x-2">
                                    <FormSwitch :value="state.isWellbeingRulerVisible"
                                        @toggleSwitch="state.isWellbeingRulerVisible = !state.isWellbeingRulerVisible" />
                                    <p class="text-sm text-gray-700">
                                        {{ $t('journalFormConfig.wellbeingRulerToggle') }}
                                    </p>
                                </div>
                                <p class="text-xs text-gray-500">
                                    {{ $t('journalFormConfig.wellbeingRulerDescription') }}
                                </p>
                            </div>

                            <div class="pt-2">
                                <FormButton type="button" buttonStyle="primary" class="w-full"
                                    @click="submitFormFieldConfig()">
                                    {{ $t('save') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>
                </div>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { formFieldConfigService } from '@/components/api/user/FormFieldConfigService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import { usePermissions } from '@/composables/usePermissions'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const { isAtLeast, can } = usePermissions()

const breadcrumbLinks = [
    {
        name: 'citizens.citizens',
        translate: true,
        href: '/citizens',
    },
    {
        name: 'journalFormConfig.title',
        translate: true,
        href: '/citizens/journal-form-config',
    },
]

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    isRiskAssessmentVisible: true,
    isScoreVisible: true,
    // Off unless switched on: the ruler is an opt-in for the companies that
    // measure wellbeing, not a field every journal form should grow.
    isWellbeingRulerVisible: false,
})

onMounted(() => {
    if (!isAtLeast('Admin') && !can('update_form_field_config')) {
        navigateTo('/citizens')
        return
    }

    fetchFormFieldConfigs()
})

async function fetchFormFieldConfigs() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await formFieldConfigService.getFormConfigs({ entity_type: 'citizen_journal' })
        if (response?.data) {
            const createConfig = response.data.find((config: any) => config.form_type === 'create')
            const editConfig = response.data.find((config: any) => config.form_type === 'edit')
            const value = createConfig?.form_fields?.risk_assessment ?? editConfig?.form_fields?.risk_assessment
            state.isRiskAssessmentVisible = value !== false

            const scoreValue = createConfig?.form_fields?.score ?? editConfig?.form_fields?.score
            state.isScoreVisible = scoreValue !== false

            const rulerValue = createConfig?.form_fields?.wellbeing_ruler ?? editConfig?.form_fields?.wellbeing_ruler
            state.isWellbeingRulerVisible = rulerValue === true
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function submitFormFieldConfig() {
    state.error = {}
    state.isPageLoading = true
    try {
        // The risk assessment section behaves identically in create and edit mode,
        // so both form_type rows are kept in sync with a single toggle.
        await formFieldConfigService.updateFormConfig({
            entity_type: 'citizen_journal',
            form_type: 'create',
            form_fields: {
                risk_assessment: state.isRiskAssessmentVisible,
                score: state.isScoreVisible,
                wellbeing_ruler: state.isWellbeingRulerVisible,
            },
        })
        await formFieldConfigService.updateFormConfig({
            entity_type: 'citizen_journal',
            form_type: 'edit',
            form_fields: {
                risk_assessment: state.isRiskAssessmentVisible,
                score: state.isScoreVisible,
                wellbeing_ruler: state.isWellbeingRulerVisible,
            },
        })
        successAlert(`${t('alert.success')}!`, `${t('journalFormConfig.alert.successfullyUpdated')}.`)
        navigateTo('/citizens')
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
