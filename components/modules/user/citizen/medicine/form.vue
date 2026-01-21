<template>
    <div>
        <form @submit.prevent="submitForm()" id="formMedicine">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <div class="grid grid-cols-1 gap-y-3">
                <div class="space-y-1">
                    <div class="w-fit flex cursor-pointer"
                        @click="state.formMedicine.is_active = !state.formMedicine.is_active">
                        <FormCheckbox :value="state.formMedicine.is_active" />
                        <p>{{ $t('citizens.medicineJournals.form.activateMedicine') }}</p>
                    </div>
                </div>
                <div class="space-y-1">
                    <div class="w-fit flex cursor-pointer"
                        @click="state.formMedicine.is_self_administered = !state.formMedicine.is_self_administered">
                        <FormCheckbox :value="state.formMedicine.is_self_administered" />
                        <p>{{ $t('citizens.medicineJournals.form.selfAdminister') }}</p>
                    </div>
                </div>
                <div class="space-y-1">
                    <div class="w-fit flex cursor-pointer"
                        @click="state.formMedicine.is_pn_medicine = !state.formMedicine.is_pn_medicine">
                        <FormCheckbox :value="state.formMedicine.is_pn_medicine" />
                        <p>{{ $t('citizens.medicineJournals.form.pnMedicine') }}</p>
                    </div>
                </div>
                <div class="space-y-1">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="medicine" :label="$t('citizens.medicineJournals.form.medicine')" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddNewMedicineOpen = true">
                            {{ $t('medicines.addNewMedicine') }}
                        </span>
                    </div>
                    <FormSelect id="medicine" :options="state.options.medicines"
                        v-model="state.formMedicine.medicine" />
                    <FormError :error="v$?.formMedicine?.medicine?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.medicine_uuid?.[0]" />
                </div>
                <div class="space-y-1" v-if="!state.formMedicine.is_pn_medicine">
                    <FormLabel for="recurring" :label="$t('citizens.medicineJournals.form.scheduleFrequency')" />
                    <FormSelect id="recurring" :options="state.options.schedule_frequencies?.recurringSchedules"
                        v-model="state.formMedicine.schedule_frequency.recurring" />
                    <FormError :error="v$?.formMedicine?.schedule_frequency?.recurring?.$errors[0]?.$message?.toString()" />
                    <FormError :error="state?.error?.errors?.recurring?.[0]" />
                </div>
                <div class="space-y-1" v-if="!state.formMedicine.is_pn_medicine">
                    <FormLabel for="recurring_until" :label="$t('citizens.medicineJournals.form.scheduleUntil')" />
                    <FormDateField id="recurring_until" name="recurring_until" :placeholder="`${$t('citizens.medicineJournals.form.scheduleUntil')}`"
                        v-model="state.formMedicine.schedule_frequency.recurring_until" />
                    <FormError :error="v$?.formMedicine?.schedule_frequency?.recurring_until?.$errors[0]?.$message.toString()" />
                    <FormError :error="state?.error?.errors?.recurring_until?.[0]" />
                </div>
                <div class="space-y-3" v-if="state.formMedicine.schedule_frequency?.recurring === 'custom'">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="space-y-1">
                            <FormLabel for="frequency" :label="$t('recurring.frequency.frequency')" />
                            <FormSelect id="frequency" :options="state.options.schedule_frequencies?.frequency"
                                v-model="state.formMedicine.schedule_frequency.frequency" />
                            <FormError
                                :error="v$?.formMedicine?.schedule_frequency?.frequency?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.frequency?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="daily_every" :label="`${$t('recurring.every')} (${state.formMedicine.schedule_frequency?.frequency === 'daily' ? $t('recurring.frequency.daily.days') :
                                state.formMedicine.schedule_frequency?.frequency === 'weekly' ? $t('recurring.frequency.weekly.weeks') :
                                    state.formMedicine.schedule_frequency?.frequency === 'monthly' ? $t('recurring.frequency.monthly.months') :
                                        $t('recurring.frequency.yearly.years')
                                })`" />
                            <FormSelect id="daily_every" :options="state.formMedicine.schedule_frequency?.frequency === 'daily' ? state.options.schedule_frequencies?.zeroTo999Days :
                                state.formMedicine.schedule_frequency?.frequency === 'weekly' ? state.options.schedule_frequencies?.zeroTo999Weeks :
                                    state.formMedicine.schedule_frequency?.frequency === 'monthly' ? state.options.schedule_frequencies?.zeroTo999Months :
                                        state.options.schedule_frequencies?.zeroTo999Years"
                                v-model="state.formMedicine.schedule_frequency.every" />
                            <FormError :error="v$?.formMedicine?.schedule_frequency?.every?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.every?.[0]" />
                        </div>
                    </div>
                    <div>
                        <div class="space-y-1" v-if="state.formMedicine.schedule_frequency.frequency === 'weekly'">
                            <FormLabel for="weekly_on" :label="$t('recurring.frequency.weekly.weekOn')" />
                            <FormSelectMultiple id="weekly_on" :options="state.options.schedule_frequencies?.weekOn"
                                v-model="state.formMedicine.schedule_frequency.weekly_on" />
                            <FormError
                                :error="v$?.formMedicine?.schedule_frequency?.weekly_on?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.weekly_on?.[0]" />
                        </div>
                        <div class="space-y-1" v-if="state.formMedicine.schedule_frequency?.frequency === 'monthly'">
                            <div class="flex items-center gap-x-2">
                                <FormSwitch :value="state.formMedicine.schedule_frequency?.monthly_on_the_enabled"
                                    @toggleSwitch="state.formMedicine.schedule_frequency.monthly_on_the_enabled = !state.formMedicine.schedule_frequency?.monthly_on_the_enabled" />
                                <p>
                                    <span v-if="!state.formMedicine.schedule_frequency?.monthly_on_the_enabled">
                                        {{ $t('recurring.frequency.monthly.each') }}
                                        ({{ $t('recurring.frequency.monthly.day') }})
                                    </span>
                                    <span v-else>
                                        {{ $t('recurring.frequency.onThe.onThe') }}
                                    </span>
                                </p>
                            </div>
                            <div class="space-y-1" v-if="!state.formMedicine.schedule_frequency.monthly_on_the_enabled">
                                <FormSelectMultiple id="monthly_each" :options="state.options.schedule_frequencies?.monthlyEach"
                                    v-model="state.formMedicine.schedule_frequency.monthly_each" />
                                <FormError
                                    :error="v$?.formMedicine?.schedule_frequency?.monthly_each?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.monthly_each?.[0]" />
                            </div>
                            <div v-else>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div class="space-y-1">
                                        <FormSelect id="monthly_on_the_sequence"
                                            :options="state.options.schedule_frequencies?.monthlyOnTheSequences"
                                            v-model="state.formMedicine.schedule_frequency.monthly_on_the_sequence" />
                                        <FormError
                                            :error="v$?.formMedicine?.schedule_frequency?.monthly_on_the_sequence?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.monthly_on_the_sequence?.[0]" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormSelect id="monthly_on_the_day"
                                            :options="state.options.schedule_frequencies?.monthlyOnTheDays"
                                            v-model="state.formMedicine.schedule_frequency.monthly_on_the_day" />
                                        <FormError
                                            :error="v$?.formMedicine?.schedule_frequency?.monthly_on_the_day?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.monthly_on_the_day?.[0]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="space-y-3" v-if="state.formMedicine.schedule_frequency?.frequency === 'yearly'">
                            <div class="space-y-1">
                                <FormLabel for="yearly_in_months" :label="$t('recurring.frequency.yearly.yearIn')" />
                                <FormSelectMultiple id="yearly_in_months"
                                    :options="state.options.schedule_frequencies?.yearlyMonths"
                                    v-model="state.formMedicine.schedule_frequency.yearly_in_months" />
                                <FormError
                                    :error="v$?.formMedicine?.schedule_frequency?.yearly_in_months?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.yearly_in_months?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <div class="space-y-1">
                                    <div class="w-fit flex items-center cursor-pointer"
                                        @click="state.formMedicine.schedule_frequency.yearly_on_the_enabled = !state.formMedicine.schedule_frequency?.yearly_on_the_enabled">
                                        <FormCheckbox :value="state.formMedicine.schedule_frequency?.yearly_on_the_enabled" />
                                        {{ $t('recurring.frequency.yearly.onThe') }}
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3"
                                    v-if="state.formMedicine.schedule_frequency?.yearly_on_the_enabled">
                                    <div class="space-y-1">
                                        <FormSelect id="yearly_on_the_sequence"
                                            :options="state.options.schedule_frequencies?.yearlyOnTheSequences"
                                            v-model="state.formMedicine.schedule_frequency.yearly_on_the_sequence" />
                                        <FormError
                                            :error="v$?.formMedicine?.schedule_frequency?.yearly_on_the_sequence?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.yearly_on_the_sequence?.[0]" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormSelect id="yearly_on_the_day"
                                            :options="state.options.schedule_frequencies?.yearlyOnTheDays"
                                            v-model="state.formMedicine.schedule_frequency.yearly_on_the_day" />
                                        <FormError
                                            :error="v$?.formMedicine?.schedule_frequency?.yearly_on_the_day?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.yearly_on_the_day?.[0]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- End Frequency Recurring Fields -->


                <div class="grid grid-cols-1 gap-3" :class="[
                    !state.formMedicine.is_pn_medicine && 'md:grid-cols-2'
                ]">
                    <div class="space-y-1">
                        <!-- <FormLabel for="dosage" :label="$t('citizens.medicineJournals.form.dosageForm')" /> -->
                        <div class="flex justify-between items-center py-0.5">
                            <FormLabel for="dosage" :label="$t('citizens.medicineJournals.form.dosageForm')" />
                            <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                                @click="state.modal.isAddDosageFormOpen = true">
                                {{ $t('dosageForms.addNewDosageForm') }}
                            </span>
                        </div>
                        <FormSelect id="dosage" :options="state.options.dosage_forms"
                            v-model="state.formMedicine.dosage" />
                        <FormError :error="v$?.formMedicine?.dosage?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.dosage_uuid?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="current_stocks" :label="$t('citizens.medicineJournals.form.currentStocks')" />
                        <FormTextField id="current_stocks" name="current_stocks"
                            :placeholder="$t('citizens.medicineJournals.form.currentStocks')"
                            v-model="state.formMedicine.current_stocks" />
                        <FormError :error="v$?.formMedicine?.current_stocks?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.current_stocks?.[0]" />
                    </div>
                </div>
                <div class="space-y-1">
                    <FormLabel for="max_daily_dose" :label="$t('citizens.medicineJournals.form.maxDailyDose')" />
                    <FormTextField id="max_daily_dose" name="max_daily_dose"
                        :placeholder="$t('citizens.medicineJournals.form.maxDailyDose')"
                        v-model="state.formMedicine.max_daily_dose" @input="handleMaxDailyDoseInput" />
                    <FormError :error="v$?.formMedicine?.max_daily_dose?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.max_daily_dose?.[0]" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="strength" :label="$t('citizens.medicineJournals.form.strength')" />
                        <FormTextField id="strength" name="strength"
                            :placeholder="$t('citizens.medicineJournals.form.strength')"
                            v-model="state.formMedicine.strength" />
                        <FormError :error="v$?.formMedicine?.strength?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.strength?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <div class="flex justify-between items-center py-0.5">
                            <FormLabel for="unit" :label="$t('citizens.medicineJournals.form.unit')" />
                            <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                                @click="state.modal.isAddMassUnitOpen = true">
                                {{ $t('massUnits.addNewMassUnit') }}
                            </span>
                        </div>
                        <FormSelect id="unit" :options="state.options.units" v-model="state.formMedicine.unit" />
                        <FormError :error="v$?.formCitizen?.unit?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.mas_unit_uuid?.[0]" />
                    </div>
                </div>
                <div class="space-y-1" v-if="!state.formMedicine.is_pn_medicine">
                    <p class="text-sm text-gray-600">
                        {{ $t('citizens.medicineJournals.form.maxDosagePerTime') }}
                    </p>
                    <div class="space-y-4">
                        <div v-for="(data, index) in state.formMedicine.max_dosage_per_time" :key="index"
                            class="relative ">
                            <div
                                class="grid grid-cols-2 gap-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8">
                                <div class="space-y-1">
                                    <p class="text-sm text-gray-600">
                                        {{ $t('citizens.medicineJournals.form.time') }}
                                    </p>
                                    <FormSelect :options="state.options.time" :value="data?.time"
                                        @change="(event: any) => state.formMedicine.max_dosage_per_time[index].time = event" />
                                </div>
                                <div class="space-y-1">
                                    <p class="text-sm text-gray-600">
                                        {{ $t('citizens.medicineJournals.form.dosage') }}
                                    </p>
                                    <FormTextField :id="`max_daily_dose_${index}`" :name="`max_daily_dose_${index}`"
                                        :placeholder="$t('citizens.medicineJournals.form.dosage')" :value="data?.dosage"
                                        @input="(event: any) => handleDoseInput(event, index)" />
                                </div>
                                <button type="button"
                                    class="absolute -top-3 -right-3 bg-red-700 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center"
                                    @click="removeMaxDosagePerTime(index)"
                                    v-if="state.formMedicine.max_dosage_per_time.length > 1">
                                    <Icon name="ph:trash" class="h-4 w-4 text-white" aria-hidden="true" />
                                </button>
                                <button type="button"
                                    class="absolute -bottom-4 inset-x-1/2 shadow-md bg-secondary hover:bg-secondary-800 rounded-full w-8 h-8 flex items-center justify-center"
                                    @click="addMaxDosagePerTime()"
                                    v-if="index === state.formMedicine.max_dosage_per_time.length - 1">
                                    <Icon name="ph:plus" class="h-4 w-4 text-white" aria-hidden="true" />
                                </button>
                            </div>
                            <FormError :error="props?.error?.errors?.max_dosage_per_time?.[0]" />
                        </div>
                    </div>
                </div>
                <div class="space-y-1">
                    <div class="flex items-center justify-between">
                        <FormLabel for="package_leaflet_link"
                            :label="$t('citizens.medicineJournals.form.packageLeafletLink')" />
                        <div class="flex items-center gap-x-1 text-sm cursor-pointer text-primary hover:text-primary-700"
                            @click="navigateToExternalLink('https://www.indlaegssedler.dk')">
                            <Icon name="ph:link-simple" class="w-4 h-4" aria-hidden="true" />
                            {{ $t('citizens.medicineJournals.form.findLeafletLinksHere') }}
                        </div>
                    </div>
                    <FormTextField id="package_leaflet_link" name="package_leaflet_link"
                        :placeholder="$t('citizens.medicineJournals.form.packageLeafletLink')"
                        v-model="state.formMedicine.package_leaflet_link" />
                    <FormError :error="v$?.formMedicine?.package_leaflet_link?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.package_leaflet_link?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="start_date" :label="$t('citizens.medicineJournals.form.startDate')" />
                    <FormDateField id="start_date" name="start_date"
                        :placeholder="$t('citizens.medicineJournals.form.startDate')"
                        v-model="state.formMedicine.start_date" />
                    <FormError :error="v$?.formMedicine?.start_date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.start_date?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="end_date" :label="$t('citizens.medicineJournals.form.endDate')" />
                    <FormDateField id="end_date" name="end_date"
                        :placeholder="$t('citizens.medicineJournals.form.endDate')"
                        v-model="state.formMedicine.end_date" />
                    <FormError :error="v$?.formMedicine?.end_date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.end_date?.[0]" />
                </div>
                <div class="space-y-1">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="doctor" :label="$t('citizens.medicineJournals.form.doctor')" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddDoctorOpen = true">
                            {{ $t('citizens.doctor.addNewDoctor') }}
                        </span>
                    </div>
                    <FormSelect id="doctor" :options="state.options.doctors" v-model="state.formMedicine.doctor" />
                    <FormError :error="v$?.formCitizen?.doctor?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.doctor_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="treatment_reason" :label="$t('citizens.medicineJournals.form.treatmentReason')" />
                    <FormTextArea id="treatment_reason" name="treatment_reason"
                        :placeholder="`${$t('citizens.medicineJournals.form.treatmentReasonPlaceholder')}?`"
                        v-model="state.formMedicine.treatment_reason" />
                    <FormError :error="v$?.formMedicine?.treatment_reason?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.treatment_reason?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="medication_storage" :label="$t('citizens.medicineJournals.form.medicineStorage')" />
                    <FormTextField id="medication_storage" name="medication_storage"
                        :placeholder="`${$t('citizens.medicineJournals.form.medicineStoragePlaceholder')}?`"
                        v-model="state.formMedicine.medication_storage" />
                    <FormError :error="v$?.formMedicine?.medication_storage?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.medication_storage?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="ingredients" :label="$t('citizens.medicineJournals.form.ingredients')" />
                    <FormTextArea id="ingredients" name="ingredients"
                        :placeholder="`${$t('citizens.medicineJournals.form.ingredientsLabel')}?`"
                        v-model="state.formMedicine.ingredients" />
                    <FormError :error="v$?.formMedicine?.ingredients?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.ingredients?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="description" :label="$t('citizens.medicineJournals.form.otherInformation')" />
                    <FormTextArea id="description" name="description"
                        :placeholder="`${$t('citizens.medicineJournals.form.otherInformationLabel')}?`"
                        v-model="state.formMedicine.description" />
                    <FormError :error="v$?.formMedicine?.description?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.description?.[0]" />
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="emit('closeModal')">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                        {{ props.formType === 'create' ? $t('save') :
                            $t('update') }}
                    </FormButton>
                </div>
            </div>
        </form>
        <ModulesUserMedicineModalNew :isModalOpen="state.modal.isAddNewMedicineOpen"
            @close="state.modal.isAddNewMedicineOpen = false" @refreshMedicines="fetchAllMedicines" />
        <ModulesUserCitizenContactModalNewDoctor :isModalOpen="state.modal.isAddDoctorOpen"
            @close="state.modal.isAddDoctorOpen = false" @refreshCaseworkers="fetchCitizenDoctors"
            v-if="state.modal.isAddDoctorOpen" />
        <ModulesUserDosageFormModalNew :isModalOpen="state.modal.isAddDosageFormOpen"
            @close="state.modal.isAddDosageFormOpen = false" @refreshDosageForms="fetchDosageForms" />
        <ModulesUserMassUnitModalNew :isModalOpen="state.modal.isAddMassUnitOpen"
            @close="state.modal.isAddMassUnitOpen = false" @refreshUnits="fetchAllMassUnits"
            v-if="state.modal.isAddMassUnitOpen" />
    </div>
</template>

<script setup lang="ts">
import { citizenDoctorService } from '@/components/api/user/CitizenDoctorService'
import { dosageFormService } from '@/components/api/user/DosageFormService'
import { massUnitService } from '@/components/api/user/MassUnitService'
import { medicineService } from '@/components/api/user/MedicineService'
import { timeIntervalService } from '@/components/api/user/TimeIntervalService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { euDecimalValidation } from "@/composables/euDecimalValidation"
import type { Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedMedicine: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm', 'isPageLoading', 'error'])
const { t } = useI18n()
const { validateEuropeanDecimal } = euDecimalValidation()
const language = useI18n()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid

const state = reactive({
    error: {} as Error,
    formMedicine: {
        uuid: '',
        is_active: true,
        is_self_administered: true,
        is_pn_medicine: false,
        medicine: '',
        dosage: '',
        current_stocks: '',
        strength: '',
        unit: '',
        max_daily_dose: '',
        max_dosage_per_time: [],
        package_leaflet_link: '',
        start_date: '',
        end_date: '',
        doctor: '',
        treatment_reason: '',
        medication_storage: '',
        ingredients: '',
        description: '',
        schedule_frequency: {
            is_recurring: true,
            recurring: '',
            recurring_until: '',
            frequency: '',
            every: '',
            weekly_on: [],
            monthly_on_the_enabled: false,
            monthly_each: [],
            monthly_on_the_sequence: '',
            monthly_on_the_day: '',
            yearly_in_months: [],
            yearly_on_the_enabled: false,
            yearly_on_the_sequence: '',
            yearly_on_the_day: '',
            is_apply_to_all: false,
        },
    } as any,
    modal: {
        isAddDoctorOpen: false,
        isAddDosageFormOpen: false,
        isAddMassUnitOpen: false,
        isAddNewMedicineOpen: false,
    },
    options: {
        doctors: [],
        dosage_forms: [],
        medicines: [],
        schedule_frequencies: {
            frequency: [
                { value: 'daily', label: `${t('recurring.frequency.daily.daily')}` },
                { value: 'weekly', label: `${t('recurring.frequency.weekly.weekly')}` },
                { value: 'monthly', label: `${t('recurring.frequency.monthly.monthly')}` },
                { value: 'yearly', label: `${t('recurring.frequency.yearly.yearly')}` },
            ],
            monthlyEach: generateMonthlyDaysOptions() as any,
            monthlyOnTheDays: [
                { value: 'monday', label: `${t('recurring.days.monday')}` },
                { value: 'tuesday', label: `${t('recurring.days.tuesday')}` },
                { value: 'wednesday', label: `${t('recurring.days.wednesday')}` },
                { value: 'thursday', label: `${t('recurring.days.thursday')}` },
                { value: 'friday', label: `${t('recurring.days.friday')}` },
                { value: 'saturday', label: `${t('recurring.days.saturday')}` },
                { value: 'sunday', label: `${t('recurring.days.sunday')}` },
                { value: 'weekday', label: `${t('recurring.days.weekday')}` },
                { value: 'weekend_day', label: `${t('recurring.days.weekendDay')}` },
            ],
            monthlyOnTheSequences: [
                { value: 'first', label: `${t('recurring.frequency.onThe.first')}` },
                { value: 'second', label: `${t('recurring.frequency.onThe.second')}` },
                { value: 'third', label: `${t('recurring.frequency.onThe.third')}` },
                { value: 'fourth', label: `${t('recurring.frequency.onThe.fourth')}` },
                { value: 'fifth', label: `${t('recurring.frequency.onThe.fifth')}` },
                { value: 'next_to_last', label: `${t('recurring.frequency.onThe.nextToLast')}` },
                { value: 'last', label: `${t('recurring.frequency.onThe.last')}` },
            ],
            recurringSchedules: [
                { value: 'everyday', label: `${t('citizens.medicineJournals.scheduleFrequencies.everyday')}` },
                { value: 'every_other_day', label: `${t('citizens.medicineJournals.scheduleFrequencies.every2Days')}` },
                { value: 'every_third_day', label: `${t('citizens.medicineJournals.scheduleFrequencies.every3Days')}` },
                { value: 'every_four_days', label: `${t('citizens.medicineJournals.scheduleFrequencies.every4Days')}` },
                { value: 'every_five_days', label: `${t('citizens.medicineJournals.scheduleFrequencies.every5Days')}` },
                { value: 'every_six_days', label: `${t('citizens.medicineJournals.scheduleFrequencies.every6Days')}` },
                { value: 'weekly', label: `${t('citizens.medicineJournals.scheduleFrequencies.weekly')}` },
                { value: 'biweekly', label: `${t('citizens.medicineJournals.scheduleFrequencies.biweekly')}` },
                { value: 'monthly', label: `${t('citizens.medicineJournals.scheduleFrequencies.monthly')}` },
                { value: 'bimonthly', label: `${t('citizens.medicineJournals.scheduleFrequencies.bimonthly')}` },
                { value: 'quarterly', label: `${t('citizens.medicineJournals.scheduleFrequencies.quarterly')}` },
                { value: 'annually', label: `${t('citizens.medicineJournals.scheduleFrequencies.annually')}` },
                { value: 'custom', label: `${t('recurring.custom')}` },
            ],
            weekOn: [
                { value: 'monday', label: `${t('recurring.days.monday')}` },
                { value: 'tuesday', label: `${t('recurring.days.tuesday')}` },
                { value: 'wednesday', label: `${t('recurring.days.wednesday')}` },
                { value: 'thursday', label: `${t('recurring.days.thursday')}` },
                { value: 'friday', label: `${t('recurring.days.friday')}` },
                { value: 'saturday', label: `${t('recurring.days.saturday')}` },
                { value: 'sunday', label: `${t('recurring.days.sunday')}` },
            ],
            yearlyMonths: [
                { value: 'january', label: `${t('recurring.frequency.yearly.january')}` },
                { value: 'february', label: `${t('recurring.frequency.yearly.february')}` },
                { value: 'march', label: `${t('recurring.frequency.yearly.march')}` },
                { value: 'april', label: `${t('recurring.frequency.yearly.april')}` },
                { value: 'may', label: `${t('recurring.frequency.yearly.may')}` },
                { value: 'june', label: `${t('recurring.frequency.yearly.june')}` },
                { value: 'july', label: `${t('recurring.frequency.yearly.july')}` },
                { value: 'august', label: `${t('recurring.frequency.yearly.august')}` },
                { value: 'september', label: `${t('recurring.frequency.yearly.september')}` },
                { value: 'october', label: `${t('recurring.frequency.yearly.october')}` },
                { value: 'november', label: `${t('recurring.frequency.yearly.november')}` },
                { value: 'december', label: `${t('recurring.frequency.yearly.december')}` },
            ],
            yearlyOnTheDays: [
                { value: 'monday', label: `${t('recurring.days.monday')}` },
                { value: 'tuesday', label: `${t('recurring.days.tuesday')}` },
                { value: 'wednesday', label: `${t('recurring.days.wednesday')}` },
                { value: 'thursday', label: `${t('recurring.days.thursday')}` },
                { value: 'friday', label: `${t('recurring.days.friday')}` },
                { value: 'saturday', label: `${t('recurring.days.saturday')}` },
                { value: 'sunday', label: `${t('recurring.days.sunday')}` },
                { value: 'weekday', label: `${t('recurring.days.weekday')}` },
                { value: 'weekend_day', label: `${t('recurring.days.weekendDay')}` },
            ],
            yearlyOnTheSequences: [
                { value: 'first', label: `${t('recurring.frequency.onThe.first')}` },
                { value: 'second', label: `${t('recurring.frequency.onThe.second')}` },
                { value: 'third', label: `${t('recurring.frequency.onThe.third')}` },
                { value: 'fourth', label: `${t('recurring.frequency.onThe.fourth')}` },
                { value: 'fifth', label: `${t('recurring.frequency.onThe.fifth')}` },
                { value: 'next_to_last', label: `${t('recurring.frequency.onThe.nextToLast')}` },
                { value: 'last', label: `${t('recurring.frequency.onThe.last')}` },
            ],
            zeroTo999Days: generateZeroTo999DaysOptions() as any,
            zeroTo999Weeks: generateZeroTo999WeeksOptions() as any,
            zeroTo999Months: generateZeroTo999MonthsOptions() as any,
            zeroTo999Years: generateZeroTo999YearsOptions() as any,
        },
        time: [] as any,
        units: [] as any,
    }
})

onMounted(() => {
    state.formMedicine = {
        uuid: props.selectedMedicine.uuid,
        is_active: props.selectedMedicine?.is_active ? true : false,
        is_self_administered: props.selectedMedicine?.is_self_administered ? true : false,
        is_pn_medicine: props.selectedMedicine?.is_pn_medicine ? true : false,
        medicine: props.selectedMedicine.medicine,
        strength: props.selectedMedicine.strength,
        unit: props.selectedMedicine.unit,
        dosage: props.selectedMedicine.dosage,
        max_dosage_per_time: props?.selectedMedicine?.max_dosage_per_time ?? [],
        max_daily_dose: language.locale.value === 'dk' ? props.selectedMedicine.max_daily_dose?.toString() : props.selectedMedicine.max_daily_dose?.toString(),
        package_leaflet_link: props.selectedMedicine.package_leaflet_link,
        start_date: props.selectedMedicine.start_date,
        end_date: props.selectedMedicine.end_date,
        doctor: props.selectedMedicine.doctor?.uuid?.toString(),
        treatment_reason: props.selectedMedicine.treatment_reason,
        medication_storage: props.selectedMedicine.medication_storage,
        ingredients: props.selectedMedicine.ingredients,
        description: props.selectedMedicine.description,
        current_stocks: props.selectedMedicine.current_stocks?.toString(),
        schedule_frequency: props.selectedMedicine?.schedule_frequency,
    }
    fetchDosageForms()
    fetchAllMedicines()
    fetchCitizenDoctors()
    fetchAllMassUnits()
    fetchTimeIntervals()
    if (props?.selectedMedicine?.max_dosage_per_time === null) {
        addMaxDosagePerTime()
    }
})

const rules = computed(() => {
    if (props.formType === 'create') {
        if (state.formMedicine.is_pn_medicine) {
            return {
                formMedicine: {
                    medicine: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    strength: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    dosage: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    max_dosage_per_time: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    max_daily_dose: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    ingredients: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    description: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    schedule_frequency: {
                        recurring: {
                            required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                        },
                        recurring_until: {
                            required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                        },
                    },
                },
            }
        } else {
            return {
                formMedicine: {
                    medicine: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    strength: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    dosage: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    max_dosage_per_time: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    max_daily_dose: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    ingredients: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    description: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    schedule_frequency: {
                        recurring: {
                            required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                        },
                        recurring_until: {
                            required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                        },
                    },
                },
            }
        }
    } else {
        if (state.formMedicine.is_pn_medicine) {
            return {
                formMedicine: {
                    medicine: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    strength: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    dosage: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    max_dosage_per_time: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    max_daily_dose: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    ingredients: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    description: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                },
            }
        } else {
            return {
                formMedicine: {
                    medicine: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    strength: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    dosage: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    max_dosage_per_time: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    max_daily_dose: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    ingredients: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    description: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    schedule_frequency: {
                        recurring: {
                            required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                        },
                        recurring_until: {
                            required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                        },
                    },
                },
            }
        }
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formMedicine)
    }
}

async function fetchDosageForms() {
    emit('error', {})
    emit('isPageLoading', true)
    try {
        const response = await dosageFormService.getAllDosageForms()
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: language.locale.value === 'en' ? item?.en_name : item?.dk_name,
                })
            )
            state.options.dosage_forms = options
        }
    } catch (error: any) {
        emit('error', error)
    }
    emit('isPageLoading', false)
}

async function fetchAllMedicines() {
    emit('error', {})
    emit('isPageLoading', true)
    try {
        const response = await medicineService.getAllMedicines()
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item?.uuid,
                    label: language.locale.value === 'en' ?
                        item?.en_name + ', ' + item?.ingredients :
                        item?.dk_name + ', ' + item?.ingredients,
                })
            )
            state.options.medicines = options
        }
    } catch (error: any) {
        emit('error', error)
    }
    emit('isPageLoading', false)
}

async function fetchCitizenDoctors() {
    emit('error', {})
    emit('isPageLoading', true)
    try {
        const response = await citizenDoctorService.getAllCitizenDoctors(citizenUuid)
        if (response) {
            let options: any = []
            response.data.forEach(
                (doctor: any) => options.push({
                    value: doctor.uuid,
                    label: doctor.firstname + ' ' + (doctor.lastname ? doctor.lastname : ''),
                })
            )
            state.options.doctors = options
        }
    } catch (error: any) {
        emit('error', error)
    }
    emit('isPageLoading', false)
}

async function fetchAllMassUnits() {
    emit('error', {})
    emit('isPageLoading', true)
    try {
        const response = await massUnitService.getAllMassUnits()
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.units = options
        }
    } catch (error: any) {
        emit('error', error)
    }
    emit('isPageLoading', false)
}

async function fetchTimeIntervals() {
    emit('error', {})
    emit('isPageLoading', true)
    try {
        const response = await timeIntervalService.getAllTimeIntervals()
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item?.time,
                    label: item?.time,
                })
            )
            state.options.time = options
        }
    } catch (error: any) {
        emit('error', error)
    }
    emit('isPageLoading', false)
}

function handleMaxDailyDoseInput(event: Event) {
    const target = event.target as HTMLInputElement
    if (language.locale.value === 'dk') {
        target.value = validateEuropeanDecimal(target.value)
    }
    state.formMedicine.max_daily_dose = target.value
}

function handleDoseInput(event: Event, index: number) {
    const target = event.target as HTMLInputElement
    if (language.locale.value === 'dk') {
        target.value = validateEuropeanDecimal(target.value)
    }
    state.formMedicine.max_dosage_per_time[index].dosage = target.value
}

function addMaxDosagePerTime() {
    state.formMedicine.max_dosage_per_time.push({
        time: '',
        dosage: '',
    })
}

function removeMaxDosagePerTime(index: number) {
    state.formMedicine.max_dosage_per_time.splice(index, 1)
}

async function navigateToExternalLink(link: any) {
    await navigateTo(link, {
        external: true,
        open: {
            target: '_blank',
        }
    })
}

function generateZeroTo999DaysOptions() {
    let options = []
    options.push({ value: String(1), label: String(1) + ` ${t('recurring.frequency.daily.day').toLocaleLowerCase()}` })
    for (let i = 2; i <= 999; i++) {
        options.push({ value: String(i), label: String(i) + ` ${t('recurring.frequency.daily.days').toLocaleLowerCase()}` })
    }
    return options;
}

function generateZeroTo999WeeksOptions() {
    let options = []
    options.push({ value: String(1), label: String(1) + ` ${t('recurring.frequency.weekly.week').toLocaleLowerCase()}` })
    for (let i = 2; i <= 999; i++) {
        options.push({ value: String(i), label: String(i) + ` ${t('recurring.frequency.weekly.weeks').toLocaleLowerCase()}` })
    }
    return options;
}

function generateZeroTo999MonthsOptions() {
    let options = []
    options.push({ value: String(1), label: String(1) + ` ${t('recurring.frequency.monthly.month').toLocaleLowerCase()}` })
    for (let i = 2; i <= 999; i++) {
        options.push({ value: String(i), label: String(i) + ` ${t('recurring.frequency.monthly.months').toLocaleLowerCase()}` })
    }
    return options;
}

function generateZeroTo999YearsOptions() {
    let options = []
    options.push({ value: String(1), label: String(1) + ` ${t('recurring.frequency.yearly.year').toLocaleLowerCase()}` })
    for (let i = 2; i <= 999; i++) {
        options.push({ value: String(i), label: String(i) + ` ${t('recurring.frequency.yearly.years').toLocaleLowerCase()}` })
    }
    return options;
}

function generateMonthlyDaysOptions() {
    let options = []
    for (let i = 1; i <= 31; i++) {
        options.push({ value: String(i), label: String(i) })
    }
    return options;
}
</script>