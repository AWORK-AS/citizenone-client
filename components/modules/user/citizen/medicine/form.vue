<template>
    <form @submit.prevent="submitForm()" id="formMedicine">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="space-y-1">
                <FormLabel for="image" :label="$t('citizens.medicineJournals.form.image')" />
                <div class="h-36 w-36">
                    <input type="file" ref="image" id="image" @change="onFileChange" class="hidden" />
                    <div class="relative cursor-pointer" @click="triggerFileInput">
                        <img :src="imageUrl" alt="Avatar" class="w-36 h-36 object-cover" v-if="imageUrl" />
                        <Icon name="material-symbols-light:add-photo-alternate-outline" class="w-36 h-36" v-else />
                        <div
                            class="absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity">
                            <div class="flex items-center w-full h-full justify-center text-xs">
                                Change Image
                            </div>
                        </div>
                    </div>
                </div>
                <FormError :error="v$?.formMedicine?.image?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.image?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="w-fit flex cursor-pointer"
                    @click="state.formMedicine.is_pn_medicine = !state.formMedicine.is_pn_medicine">
                    <FormCheckbox :value="state.formMedicine.is_pn_medicine" />
                    <p>{{ $t('citizens.medicineJournals.form.pnMedicine') }}</p>
                </div>
            </div>
            <div class="space-y-1">
                <FormLabel for="medicine" :label="$t('citizens.medicineJournals.form.medicine')" />
                <FormSelect id="medicine" :options="state.options.medicines" v-model="state.formMedicine.medicine" />
                <FormError :error="v$?.formMedicine?.medicine?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.medicine_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="dosage" :label="$t('citizens.medicineJournals.form.dosageForm')" />
                <FormSelect id="dosage" :options="state.options.dosage_form" v-model="state.formMedicine.dosage" />
                <FormError :error="v$?.formMedicine?.dosage?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.dosage_uuid?.[0]" />
            </div>
            <div class="grid grid-cols-1 gap-3" :class="[
                !state.formMedicine.is_pn_medicine && 'md:grid-cols-2'
            ]">
                <div class="space-y-1" v-if="!state.formMedicine.is_pn_medicine">
                    <FormLabel for="schedule_frequency"
                        :label="$t('citizens.medicineJournals.form.scheduleFrequency')" />
                    <FormSelect id="schedule_frequency" name="schedule_frequency"
                        :options="state.options.schedule_frequencies" v-model="state.formMedicine.schedule_frequency" />
                    <FormError :error="v$?.formMedicine?.schedule_frequency?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.schedule_frequency?.[0]" />
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
                    <FormLabel for="max_daily_dose" :label="$t('citizens.medicineJournals.form.maxDailyDose')" />
                    <FormTextField id="max_daily_dose" name="max_daily_dose"
                        :placeholder="$t('citizens.medicineJournals.form.maxDailyDose')"
                        v-model="state.formMedicine.max_daily_dose" @input="handleMaxDailyDoseInput" />
                    <FormError :error="v$?.formMedicine?.max_daily_dose?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.max_daily_dose?.[0]" />
                </div>
            </div>
            <div class="space-y-1">
                <p class="text-sm text-gray-600">
                    {{ $t('citizens.medicineJournals.form.maxDosagePerTime') }}
                </p>
                <div class="space-y-4">
                    <div v-for="(data, index) in state.formMedicine.max_dosage_per_time" :key="index" class="relative ">
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
                <FormLabel for="package_leaflet_link"
                    :label="$t('citizens.medicineJournals.form.packageLeafletLink')" />
                <FormTextField id="package_leaflet_link" name="package_leaflet_link"
                    :placeholder="$t('citizens.medicineJournals.form.packageLeafletLink')"
                    v-model="state.formMedicine.package_leaflet_link" />
                <FormError :error="v$?.formMedicine?.package_leaflet_link?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.package_leaflet_link?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="active_ingredients" :label="$t('citizens.medicineJournals.form.activeIngredients')" />
                <FormTextArea id="active_ingredients" name="active_ingredients"
                    :placeholder="$t('citizens.medicineJournals.form.activeIngredients')"
                    v-model="state.formMedicine.active_ingredients" />
                <FormError :error="v$?.formMedicine?.active_ingredients?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.active_ingredients?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="description" :label="$t('citizens.medicineJournals.form.description')" />
                <FormTextArea id="description" name="description"
                    :placeholder="$t('citizens.medicineJournals.form.description')"
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
</template>

<script setup lang="ts">
import { dosageService } from '@/components/api/user/DosageService'
import { medicineService } from '@/components/api/user/MedicineService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { euDecimalValidation } from "@/composables/euDecimalValidation"

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
const image = ref<HTMLInputElement | null>(null)
let imageUrl = ref(props.selectedMedicine?.image ?? '')

const state = reactive({
    formMedicine: {
        uuid: '',
        image: '',
        is_pn_medicine: false,
        medicine: '',
        dosage: '',
        schedule_frequency: [],
        current_stocks: '',
        strength: '',
        max_daily_dose: '',
        max_dosage_per_time: [],
        package_leaflet_link: '',
        active_ingredients: '',
        description: '',
    } as any,
    options: {
        dosage_form: [],
        medicines: [],
        schedule_frequencies: [
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
        ],
        time: [] as any,
    }
})

onMounted(() => {
    state.formMedicine = {
        uuid: props.selectedMedicine.uuid,
        image: '',
        is_pn_medicine: props.selectedMedicine?.is_pn_medicine ? true : false,
        medicine: props.selectedMedicine.medicine,
        strength: props.selectedMedicine.strength,
        dosage: props.selectedMedicine.dosage,
        max_dosage_per_time: props?.selectedMedicine?.max_dosage_per_time,
        max_daily_dose: language.locale.value === 'dk' ? props.selectedMedicine.max_daily_dose.toString() : props.selectedMedicine.max_daily_dose.toString(),
        package_leaflet_link: props.selectedMedicine.package_leaflet_link,
        active_ingredients: props.selectedMedicine.active_ingredients,
        description: props.selectedMedicine.description,
        schedule_frequency: props.selectedMedicine.schedule_frequency,
        current_stocks: props.selectedMedicine.current_stocks?.toString(),
    }
    fetchDosageForm()
    fetchMedicines()
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
                    active_ingredients: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    description: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    current_stocks: {
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
                    active_ingredients: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    description: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    schedule_frequency: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    current_stocks: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
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
                    active_ingredients: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    description: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    current_stocks: {
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
                    active_ingredients: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    description: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    schedule_frequency: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    current_stocks: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                },
            }
        }
    }
})

const v$ = useVuelidate(rules, state)

function onFileChange(event: any) {
    const file = event.target.files[0]
    state.formMedicine.image = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e: any) => {
            imageUrl.value = e.target.result
        }
        reader.readAsDataURL(file)
    }
    else {
        imageUrl.value = ''
    }
}

function triggerFileInput() {
    if (image.value) {
        image.value.click()
    }
}

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formMedicine)
    }
}

async function fetchDosageForm() {
    emit('error', {})
    emit('isPageLoading', true)
    try {
        const response = await dosageService.getAllDosages()
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.dosage_form = options
        }
    } catch (error: any) {
        emit('error', error)
    }
    emit('isPageLoading', false)
}

async function fetchMedicines() {
    emit('error', {})
    emit('isPageLoading', true)
    try {
        const response = await medicineService.getAllMedicines()
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: language.locale.value === 'en' ? item.en_name : item.dk_name,
                })
            )
            state.options.medicines = options
        }
    } catch (error: any) {
        emit('error', error)
    }
    emit('isPageLoading', false)
}

generateTimeIntervals()

function generateTimeIntervals() {
    const times = []
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            const hourStr = String(hour).padStart(2, '0')
            const minuteStr = String(minute).padStart(2, '0')
            const time = `${hourStr}:${minuteStr}`
            times.push({ value: time, label: time })
        }
    }
    state.options.time = times
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
</script>

<style>
#formMedicine .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>