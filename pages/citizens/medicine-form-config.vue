<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('formFieldConfig.medicineTitle') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                {{ $t('formFieldConfig.medicineTitle') }}
                <p class="text-sm font-normal text-gray-900">
                    {{ $t('formFieldConfig.medicineSubtitle') }}
                </p>
            </template>

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="mt-8">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <!-- Create / Edit tabs -->
                    <div class="flex items-center gap-x-4 mb-6">
                        <NuxtLink to="/citizens" class="flex items-center hover:cursor-pointer">
                            <Icon name="ph:arrow-left" size="20" class="text-black" />
                        </NuxtLink>
                        <button type="button"
                            :class="[state.activeFormType === 'create' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700', 'px-4 py-2 rounded-md text-sm font-medium']"
                            @click="state.activeFormType = 'create'">
                            {{ $t('formFieldConfig.createForm') }}
                        </button>
                        <button type="button"
                            :class="[state.activeFormType === 'edit' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700', 'px-4 py-2 rounded-md text-sm font-medium']"
                            @click="state.activeFormType = 'edit'">
                            {{ $t('formFieldConfig.editForm') }}
                        </button>
                    </div>

                    <!-- Sidebar + Preview layout -->
                    <div class="flex gap-x-6">
                        <!-- Toggle Sidebar -->
                        <div class="w-72 shrink-0">
                            <div class="sticky top-6 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6">
                                <h3 class="text-sm font-semibold text-gray-900 mb-4">
                                    {{ $t('formFieldConfig.fieldVisibility') }}
                                </h3>
                                <div class="space-y-3">
                                    <div class="flex items-center gap-x-2" v-for="field in medicineFormFields"
                                        :key="field.key">
                                        <FormSwitch
                                            :value="state.medicineFormConfig[state.activeFormType][field.key]"
                                            @toggleSwitch="state.medicineFormConfig[state.activeFormType][field.key] = !state.medicineFormConfig[state.activeFormType][field.key]" />
                                        <p class="text-sm text-gray-700">{{ $t(field.label) }}</p>
                                    </div>
                                </div>
                                <div class="mt-6">
                                    <FormButton type="button" buttonStyle="primary" class="w-full"
                                        @click="submitFormFieldConfig()">
                                        {{ $t('save') }}
                                    </FormButton>
                                </div>
                            </div>
                        </div>

                        <!-- Form Preview -->
                        <div class="grow min-w-0">
                            <div class="pointer-events-none select-none">
                                <div class="pb-10 mb-10 border-b border-gray-900/10">
                                    <div
                                        class="space-y-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8">
                                        <!-- Always visible: medicine selection & schedule -->
                                        <div class="space-y-1">
                                            <FormLabel :label="$t('citizens.medicineJournals.form.medicine')" />
                                            <div
                                                class="w-full px-4 h-11 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                                                <span class="text-gray-400 text-sm">{{
                                                    $t('citizens.medicineJournals.form.medicine') }}</span>
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div class="space-y-1">
                                                <FormLabel :label="$t('citizens.medicineJournals.form.startDate')" />
                                                <input type="text" disabled
                                                    :placeholder="$t('citizens.medicineJournals.form.startDate')"
                                                    class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                            </div>
                                            <div class="space-y-1">
                                                <FormLabel :label="$t('citizens.medicineJournals.form.endDate')" />
                                                <input type="text" disabled
                                                    :placeholder="$t('citizens.medicineJournals.form.endDate')"
                                                    class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                            </div>
                                        </div>

                                        <!-- === Configurable fields below === -->

                                        <div class="space-y-1" v-if="isFieldVisible('is_self_administered')">
                                            <div class="flex items-center gap-x-2 opacity-50">
                                                <FormSwitch :value="false" />
                                                <p class="text-sm">{{
                                                    $t('citizens.medicineJournals.form.selfAdminister') }}</p>
                                            </div>
                                        </div>
                                        <div class="space-y-1" v-if="isFieldVisible('is_pn_medicine')">
                                            <div class="flex items-center gap-x-2 opacity-50">
                                                <FormSwitch :value="false" />
                                                <p class="text-sm">{{ $t('citizens.medicineJournals.form.pnMedicine')
                                                }}</p>
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div class="space-y-1" v-if="isFieldVisible('dosage')">
                                                <FormLabel
                                                    :label="$t('citizens.medicineJournals.form.dosageForm')" />
                                                <div
                                                    class="w-full px-4 h-11 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                                                    <span class="text-gray-400 text-sm">{{
                                                        $t('citizens.medicineJournals.form.dosageForm') }}</span>
                                                </div>
                                            </div>
                                            <div class="space-y-1" v-if="isFieldVisible('current_stocks')">
                                                <FormLabel
                                                    :label="$t('citizens.medicineJournals.form.currentStocks')" />
                                                <input type="text" disabled
                                                    :placeholder="$t('citizens.medicineJournals.form.currentStocks')"
                                                    class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                            </div>
                                        </div>
                                        <div class="space-y-1" v-if="isFieldVisible('max_dose_per_administration')">
                                            <FormLabel
                                                :label="$t('citizens.medicineJournals.form.maximumDosePerAdministration')" />
                                            <input type="text" disabled
                                                :placeholder="$t('citizens.medicineJournals.form.maximumDosePerAdministration')"
                                                class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                        </div>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div class="space-y-1" v-if="isFieldVisible('strength')">
                                                <FormLabel :label="$t('citizens.medicineJournals.form.strength')" />
                                                <input type="text" disabled
                                                    :placeholder="$t('citizens.medicineJournals.form.strength')"
                                                    class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                            </div>
                                            <div class="space-y-1" v-if="isFieldVisible('mass_unit')">
                                                <FormLabel :label="$t('citizens.medicineJournals.form.unit')" />
                                                <div
                                                    class="w-full px-4 h-11 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                                                    <span class="text-gray-400 text-sm">{{
                                                        $t('citizens.medicineJournals.form.unit') }}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="space-y-1" v-if="isFieldVisible('package_leaflet_link')">
                                            <FormLabel
                                                :label="$t('citizens.medicineJournals.form.packageLeafletLink')" />
                                            <input type="text" disabled
                                                :placeholder="$t('citizens.medicineJournals.form.packageLeafletLink')"
                                                class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                        </div>
                                        <div class="space-y-1" v-if="isFieldVisible('doctor')">
                                            <FormLabel :label="$t('citizens.medicineJournals.form.doctor')" />
                                            <div
                                                class="w-full px-4 h-11 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                                                <span class="text-gray-400 text-sm">{{
                                                    $t('citizens.medicineJournals.form.doctor') }}</span>
                                            </div>
                                        </div>
                                        <div class="space-y-1" v-if="isFieldVisible('treatment_reason')">
                                            <FormLabel
                                                :label="$t('citizens.medicineJournals.form.treatmentReason')" />
                                            <textarea disabled
                                                :placeholder="$t('citizens.medicineJournals.form.treatmentReason')"
                                                rows="2"
                                                class="appearance-none block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm"></textarea>
                                        </div>
                                        <div class="space-y-1" v-if="isFieldVisible('has_consent')">
                                            <div class="flex items-center gap-x-2 opacity-50">
                                                <FormSwitch :value="false" />
                                                <p class="text-sm">{{
                                                    $t('citizens.medicineJournals.form.consentToPrescribe') }}</p>
                                            </div>
                                        </div>
                                        <div class="space-y-1" v-if="isFieldVisible('prescribed_by')">
                                            <FormLabel
                                                :label="$t('citizens.medicineJournals.form.whoPrescribed')" />
                                            <input type="text" disabled
                                                :placeholder="$t('citizens.medicineJournals.form.whoPrescribed')"
                                                class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                        </div>
                                        <div class="space-y-1" v-if="isFieldVisible('medication_storage')">
                                            <FormLabel
                                                :label="$t('citizens.medicineJournals.form.medicineStorage')" />
                                            <input type="text" disabled
                                                :placeholder="$t('citizens.medicineJournals.form.medicineStorage')"
                                                class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                        </div>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3"
                                            v-if="isFieldVisible('date_opened') || isFieldVisible('shelf_life_days')">
                                            <div class="space-y-1" v-if="isFieldVisible('date_opened')">
                                                <FormLabel
                                                    :label="$t('citizens.medicineJournals.form.dateOpened')" />
                                                <input type="text" disabled
                                                    :placeholder="$t('citizens.medicineJournals.form.dateOpened')"
                                                    class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                            </div>
                                            <div class="space-y-1" v-if="isFieldVisible('shelf_life_days')">
                                                <FormLabel
                                                    :label="$t('citizens.medicineJournals.form.shelfLifeDays')" />
                                                <input type="text" disabled
                                                    :placeholder="$t('citizens.medicineJournals.form.shelfLifeDays')"
                                                    class="appearance-none block w-full px-4 h-11 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm" />
                                            </div>
                                        </div>
                                        <div class="space-y-1" v-if="isFieldVisible('ingredients')">
                                            <FormLabel :label="$t('citizens.medicineJournals.form.ingredients')" />
                                            <textarea disabled
                                                :placeholder="$t('citizens.medicineJournals.form.ingredients')"
                                                rows="2"
                                                class="appearance-none block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-400 rounded-md bg-gray-50 sm:text-sm"></textarea>
                                        </div>
                                    </div>
                                </div>
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
        name: 'formFieldConfig.medicineTitle',
        translate: true,
        href: '/citizens/medicine-form-config',
    },
]

const defaultFields = () => ({
    is_self_administered: true,
    dosage: true,
    current_stocks: true,
    max_dose_per_administration: true,
    strength: true,
    ingredients: true,
    package_leaflet_link: true,
    doctor: true,
    treatment_reason: true,
    prescribed_by: true,
    medication_storage: true,
    date_opened: true,
    shelf_life_days: true,
    has_consent: true,
    is_pn_medicine: true,
    mass_unit: true,
})

const medicineFormFields = [
    { key: 'is_self_administered', label: 'citizens.medicineJournals.form.selfAdminister' },
    { key: 'is_pn_medicine', label: 'citizens.medicineJournals.form.pnMedicine' },
    { key: 'dosage', label: 'citizens.medicineJournals.form.dosageForm' },
    { key: 'current_stocks', label: 'citizens.medicineJournals.form.currentStocks' },
    { key: 'max_dose_per_administration', label: 'citizens.medicineJournals.form.maximumDosePerAdministration' },
    { key: 'strength', label: 'citizens.medicineJournals.form.strength' },
    { key: 'mass_unit', label: 'citizens.medicineJournals.form.unit' },
    { key: 'package_leaflet_link', label: 'citizens.medicineJournals.form.packageLeafletLink' },
    { key: 'doctor', label: 'citizens.medicineJournals.form.doctor' },
    { key: 'treatment_reason', label: 'citizens.medicineJournals.form.treatmentReason' },
    { key: 'has_consent', label: 'citizens.medicineJournals.form.consentToPrescribe' },
    { key: 'prescribed_by', label: 'citizens.medicineJournals.form.whoPrescribed' },
    { key: 'medication_storage', label: 'citizens.medicineJournals.form.medicineStorage' },
    { key: 'date_opened', label: 'citizens.medicineJournals.form.dateOpened' },
    { key: 'shelf_life_days', label: 'citizens.medicineJournals.form.shelfLifeDays' },
    { key: 'ingredients', label: 'citizens.medicineJournals.form.ingredients' },
]

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    activeFormType: 'create' as 'create' | 'edit',
    medicineFormConfig: {
        create: defaultFields(),
        edit: defaultFields(),
    } as Record<string, Record<string, boolean>>,
})

function isFieldVisible(fieldKey: string): boolean {
    return state.medicineFormConfig[state.activeFormType][fieldKey] !== false
}

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
        const response = await formFieldConfigService.getFormConfigs({ entity_type: 'citizen_medicine' })
        if (response?.data) {
            response.data.forEach((config: any) => {
                if (config.form_type === 'create' || config.form_type === 'edit') {
                    const fields = defaultFields()
                    if (config.form_fields) {
                        Object.keys(config.form_fields).forEach((key: string) => {
                            if (key in fields) {
                                (fields as any)[key] = config.form_fields[key]
                            }
                        })
                    }
                    state.medicineFormConfig[config.form_type] = fields
                }
            })
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
        await formFieldConfigService.updateFormConfig({
            entity_type: 'citizen_medicine',
            form_type: state.activeFormType,
            form_fields: state.medicineFormConfig[state.activeFormType],
        })
        successAlert(`${t('alert.success')}!`, `${t('formFieldConfig.alert.successfullyUpdated')}.`)
        navigateTo('/citizens')
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
