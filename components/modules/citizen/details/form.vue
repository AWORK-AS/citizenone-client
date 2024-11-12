<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-3xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="space-y-1">
                <div class="flex flex-col items-center">
                    <input type="file" ref="image" @change="onFileChange" class="hidden" />
                    <div class="relative cursor-pointer" @click="triggerFileInput">
                        <img :src="avatarUrl" alt="Avatar"
                            class="w-28 h-28 rounded-full object-cover border-2 border-tertiary-25" />
                        <div
                            class="rounded-full absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity">
                            <div class="flex items-center w-full h-full justify-center text-xs">
                                Change Image
                            </div>
                        </div>
                    </div>
                </div>
                <FormError :error="props?.error?.errors?.image?.[0]" class="text-center" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <FormLabel for="firstname" :label="$t('citizens.form.firstname')" />
                    <FormTextField id="firstname" name="firstname" :placeholder="$t('citizens.form.firstname')"
                        v-model="state.formCitizen.firstname" />
                    <FormError :error="v$?.formCitizen?.firstname?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.firstname?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="lastname" :label="$t('citizens.form.lastname')" />
                    <FormTextField id="lastname" name="lastname" :placeholder="$t('citizens.form.lastname')"
                        v-model="state.formCitizen.lastname" />
                    <FormError :error="v$?.formCitizen?.lastname?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.lastname?.[0]" />
                </div>
            </div>
            <div class="space-y-1">
                <FormLabel for="gender" :label="$t('citizens.form.gender')" />
                <FormSelect id="gender" :options="state.options.genders" v-model="state.formCitizen.gender" />
                <FormError :error="v$?.formCitizen?.gender?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.gender?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="email" :label="$t('citizens.form.emailAddress')" />
                <FormTextField id="email" name="email" :placeholder="$t('citizens.form.emailAddress')"
                    v-model="state.formCitizen.email" />
                <FormError :error="v$?.formCitizen?.email?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.email?.[0]" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <FormLabel for="social_security_number" :label="$t('citizens.form.ssn')" />
                    <FormTextField id="social_security_number" name="social_security_number"
                        :placeholder="$t('citizens.form.ssn')" :maxLength="10" v-model="formattedSocialSecurityNumber"
                        @input="updateSocialSecurityNumber" />
                    <FormError :error="v$?.formCitizen?.social_security_number?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.social_security_number?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="birthday" :label="$t('citizens.form.birthday')" />
                    <FormDateField id="birthday" name="birthday" :placeholder="$t('citizens.form.birthday')"
                        v-model="state.formCitizen.birthday" />
                    <FormError :error="v$?.formCitizen?.birthday?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.birthday?.[0]" />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <FormLabel for="phone" :label="$t('citizens.form.phone')" />
                    <FormTextField id="phone" name="phone" :placeholder="$t('citizens.form.phone')"
                        v-model="state.formCitizen.phone" />
                    <FormError :error="v$?.formCitizen?.phone?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.phone?.[0]" />
                </div>
                <div class="space-y-1">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="departments" :label="$t('citizens.form.department')" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddDepartmentOpen = true">
                            {{ $t('departments.addNewDepartment') }}
                        </span>
                    </div>
                    <FormSelectMultiple id="departments" :options="state.options.departments"
                        v-model="state.formCitizen.departments" />
                    <FormError :error="v$?.formCitizen?.departments?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.departments_uuid?.[0]" />
                </div>
            </div>
            <div class="space-y-1">
                <FormLabel for="street" :label="$t('citizens.form.street')" />
                <FormTextField id="street" name="street" :placeholder="$t('citizens.form.street')"
                    v-model="state.formCitizen.street" />
                <FormError :error="v$?.formCitizen?.street?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.street?.[0]" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <FormLabel for="region" :label="$t('citizens.form.region')" />
                    <FormSelect id="region" :options="state.options.regions" v-model="state.formCitizen.region"
                        @change="changeSelectedRegion" />
                    <FormError :error="v$?.formCitizen?.region?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.region_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="municipality" :label="$t('citizens.form.municipality')" />
                    <FormSelect id="municipality" :options="state.options.municipalities"
                        v-model="state.formCitizen.municipality" @change="changeSelectedMunicipality" />
                    <FormError :error="v$?.formCitizen?.municipality?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.municipality_uuid?.[0]" />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <FormLabel for="city" :label="$t('citizens.form.city')" />
                    <FormSelect id="city" :options="state.options.cities" v-model="state.formCitizen.city" />
                    <FormError :error="v$?.formCitizen?.city?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.city_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="post_code" :label="$t('citizens.form.postCode')" />
                    <FormTextField id="post_code" name="post_code" :placeholder="$t('citizens.form.postCode')"
                        v-model="state.formCitizen.post_code" />
                    <FormError :error="v$?.formCitizen?.post_code?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.post_code?.[0]" />
                </div>
            </div>
            <div class="space-y-1">
                <div class="flex justify-between items-center py-0.5">
                    <FormLabel for="diagnosis" :label="$t('citizens.form.diagnosis')" />
                    <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                        @click="state.modal.isAddDiagnosisOpen = true">
                        {{ $t('diagnoses.addNewDiagnosis') }}
                    </span>
                </div>
                <FormSelect id="diagnosis" :options="state.options.diagnoses" v-model="state.formCitizen.diagnosis" />
                <FormError :error="v$?.formCitizen?.diagnosis?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.diagnosis?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="flex justify-between items-center py-0.5">
                    <FormLabel for="addictions" :label="$t('citizens.form.addictions')" />
                    <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                        @click="state.modal.isAddAddictionOpen = true">
                        {{ $t('addictions.addNewAddiction') }}
                    </span>
                </div>
                <FormSelect id="addictions" :options="state.options.addictions"
                    v-model="state.formCitizen.addictions" />
                <FormError :error="v$?.formCitizen?.addictions?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.addictions?.[0]" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <FormLabel for="date_admitted" :label="$t('citizens.form.dateAdmitted')" />
                    <FormDateField id="date_admitted" name="date_admitted"
                        :placeholder="$t('citizens.form.dateAdmitted')" v-model="state.formCitizen.date_admitted" />
                    <FormError :error="v$?.formCitizen?.date_admitted?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.date_admitted?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="date_discharged" :label="$t('citizens.form.dateDischarged')" />
                    <FormDateField id="date_discharged" name="date_discharged"
                        :placeholder="$t('citizens.form.dateDischarged')" v-model="state.formCitizen.date_discharged" />
                    <FormError :error="v$?.formCitizen?.date_discharged?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.date_discharged?.[0]" />
                </div>
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="navigateTo('/citizens')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
        <ModulesDepartmentModalNew :isModalOpen="state.modal.isAddDepartmentOpen"
            @close="state.modal.isAddDepartmentOpen = false" @refreshDepartments="fetchDepartments" />
        <ModulesDiagnosisModalNew :isModalOpen="state.modal.isAddDiagnosisOpen"
            @close="state.modal.isAddDiagnosisOpen = false" @refreshDiagnoses="fetchDiagnoses" />
        <ModulesAddictionModalNew :isModalOpen="state.modal.isAddAddictionOpen"
            @close="state.modal.isAddAddictionOpen = false" @refreshAddictions="fetchAddictions" />
    </form>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { departmentService } from '@/components/api/DepartmentService'
import { diagnosisService } from '@/components/api/DiagnosisService'
import { addictionService } from '@/components/api/AddictionService'
import { regionService } from '@/components/api/RegionService'
import { municipalityService } from '@/components/api/MunicipalityService'
import { cityService } from '@/components/api/CityService'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { t } = useI18n()
const language = useI18n()
const image = ref<HTMLInputElement | null>(null)
const avatarUrl = ref('/img/avatars/user.svg')

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedCitizen: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const state = reactive({
    error: {} as Error,
    formCitizen: {
        image: '',
        firstname: '',
        lastname: '',
        gender: '',
        email: '',
        social_security_number: '',
        birthday: '',
        phone: '',
        departments: [],
        street: '',
        region: '',
        municipality: '',
        city: '',
        post_code: '',
        diagnoses: [],
        addictions: [],
        date_admitted: '',
        date_discharged: '',
    },
    formattedSocialSecurityNumber: '',
    modal: {
        isAddAddictionOpen: false,
        isAddDepartmentOpen: false,
        isAddDiagnosisOpen: false,
    },
    options: {
        addictions: [],
        cities: [],
        departments: [],
        diagnoses: [],
        genders: [
            { value: 'male', label: `${t('gender.male')}`, },
            { value: 'female', label: `${t('gender.female')}`, },
            { value: 'willNotDiscloseThis', label: `${t('gender.willNotDiscloseThis')}`, },
        ],
        municipalities: [],
        regions: [],
    }
})

watch(() => language.locale.value, () => {
    state.options.genders = [
        { value: 'male', label: `${t('gender.male')}`, },
        { value: 'female', label: `${t('gender.female')}`, },
        { value: 'willNotDiscloseThis', label: `${t('gender.willNotDiscloseThis')}`, },
    ]
})

watch(() => props.selectedCitizen, (selectedCitizen: any) => {
    if (selectedCitizen != null) {
        fetchMunicipalities(selectedCitizen.region_uuid)
        fetchCities(selectedCitizen.municipality_uuid)
        if (selectedCitizen.image) {
            avatarUrl.value = selectedCitizen.image
        }
        state.formCitizen = {
            image: selectedCitizen.image,
            firstname: selectedCitizen.firstname,
            lastname: selectedCitizen.lastname,
            gender: selectedCitizen.gender,
            email: selectedCitizen.email,
            social_security_number: selectedCitizen.social_security_number,
            birthday: selectedCitizen.birthday,
            phone: selectedCitizen.phone,
            departments: selectedCitizen.departments,
            street: selectedCitizen.street,
            region: selectedCitizen.region_uuid,
            municipality: selectedCitizen.municipality_uuid,
            city: selectedCitizen.city_uuid,
            post_code: selectedCitizen.post_code,
            diagnoses: selectedCitizen.diagnoses,
            addictions: selectedCitizen.addictions,
            date_admitted: selectedCitizen.date_admitted,
            date_discharged: selectedCitizen.date_discharged,
        }
    }
})

watch(() => state.formCitizen.social_security_number, (ssn) => {
    if (ssn.length === 10) {
        state.formCitizen.social_security_number = ssn.slice(0, 6) + '-' + ssn.slice(6)
    }
})

watch(() => state.formCitizen.social_security_number, (ssn) => {
    // Format social security number with a hyphen after six digits
    if (ssn.length === 10) {
        state.formCitizen.social_security_number = ssn.slice(0, 6) + '-' + ssn.slice(6)
    }

    // Check if the length is at least six digits to derive the birthdate
    if (ssn.length >= 6) {
        const day = ssn.slice(0, 2)
        const month = ssn.slice(2, 4)
        let year = ssn.slice(4, 6)

        // Determine the century (adjust as needed for your specific case)
        const currentYear = new Date().getFullYear() % 100
        year = parseInt(year, 10) <= currentYear ? `20${year}` : `19${year}`

        // Create a valid date string in the format 'YYYY-MM-DD'
        const dateOfBirth = `${year}-${month}-${day}`

        if (isValidDate(year, month, day)) {
            // Update the birthday field if the date is valid
            state.formCitizen.birthday = dateOfBirth
        } else {
            // Handle invalid date case (optional: clear or show error)
            state.formCitizen.birthday = ''
        }
    }
})

onMounted(() => {
    fetchDepartments()
    fetchDiagnoses()
    fetchAddictions()
    fetchRegions()
})

const isValidDate = (y: string, m: string, d: string): boolean => {
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d)) // Month is zero-based
    return date && date.getFullYear() === parseInt(y) && (date.getMonth() + 1) === parseInt(m) && date.getDate() === parseInt(d)
}

async function fetchDepartments() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await departmentService.getAllDepartments()
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.departments = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchDiagnoses() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await diagnosisService.getAllDiagnoses()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.diagnoses = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchAddictions() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await addictionService.getAllAddictions()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.addictions = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchRegions() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await regionService.getAllRegions()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.regions = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchMunicipalities(regionUuid: any) {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {
            region_uuid: regionUuid
        }
        const response = await municipalityService.getAllMunicipalities(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.municipalities = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchCities(municipalityUuid: any) {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {
            municipality_uuid: municipalityUuid
        }
        const response = await cityService.getAllCities(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.cities = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

function changeSelectedRegion(regionUuid: string) {
    fetchMunicipalities(regionUuid)
}

function changeSelectedMunicipality(municipalityUuid: string) {
    fetchCities(municipalityUuid)
}

const rules = computed(() => {
    return {
        formCitizen: {
            firstname: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            lastname: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            gender: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            social_security_number: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            birthday: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            phone: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            street: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            region: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            municipality: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            city: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            post_code: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formCitizen)
    }
}

function triggerFileInput() {
    if (image.value) {
        image.value.click()
    }
}

function onFileChange(event: any) {
    const file = event.target.files[0]
    state.formCitizen.image = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e: any) => {
            avatarUrl.value = e.target.result
        }
        reader.readAsDataURL(file)
    }
}

const formattedSocialSecurityNumber = computed<string>({
    get() {
        const ssn = state.formCitizen.social_security_number
        if (ssn.length === 10) {
            return ssn.slice(0, 6) + '-' + ssn.slice(6)
        }
        return ssn
    },
    set(value: string) {
        state.formCitizen.social_security_number = value.replace(/-/g, '')
    }
})

function updateSocialSecurityNumber(event: Event) {
    const target = event.target as HTMLInputElement
    state.formCitizen.social_security_number = target.value.replace(/-/g, '')
}
</script>