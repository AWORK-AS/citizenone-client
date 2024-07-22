<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-3xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error && props.error.length > 0 || props.error?.message" />
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
                        <FormLabel for="department" :label="$t('citizens.form.department')" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="navigateTo('/departments/new')">
                            Add New Department
                        </span>
                    </div>
                    <FormSelectMultiple id="department" :options="state.options.departments"
                        v-model="state.formCitizen.department" />
                    <FormError :error="v$?.formCitizen?.department?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.department_id?.[0]" />
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
                    <FormError :error="props?.error?.errors?.region_id?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="municipality" :label="$t('citizens.form.municipality')" />
                    <FormSelect id="municipality" :options="state.options.municipalities"
                        v-model="state.formCitizen.municipality" @change="changeSelectedMunicipality" />
                    <FormError :error="v$?.formCitizen?.municipality?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.municipality_id?.[0]" />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <FormLabel for="city" :label="$t('citizens.form.city')" />
                    <FormSelect id="city" :options="state.options.cities" v-model="state.formCitizen.city" />
                    <FormError :error="v$?.formCitizen?.city?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.city_id?.[0]" />
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
                <FormLabel for="diagnosis" :label="$t('citizens.form.diagnosis')" />
                <FormTextArea id="diagnosis" name="diagnosis" :placeholder="$t('citizens.form.diagnosis')"
                    v-model="state.formCitizen.diagnosis" />
                <FormError :error="v$?.formCitizen?.diagnosis?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.diagnosis?.[0]" />
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
    </form>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { departmentService } from '@/components/api/DepartmentService'
import { regionService } from '@/components/api/RegionService'
import { municipalityService } from '@/components/api/MunicipalityService'
import { cityService } from '@/components/api/CityService'
import { useI18n } from "vue-i18n"

const { t } = useI18n()
const image = ref(null)
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
    error: [],
    formCitizen: {
        image: '',
        firstname: '',
        lastname: '',
        email: '',
        social_security_number: '',
        birthday: '',
        phone: '',
        department: [],
        street: '',
        region: '',
        municipality: '',
        city: '',
        post_code: '',
        diagnosis: '',
    },
    formattedSocialSecurityNumber: '',
    options: {
        cities: [],
        departments: [],
        municipalities: [],
        regions: [],
    }
})

watch(() => props.selectedCitizen, (newValue: any) => {
    if (newValue != null) {
        fetchMunicipalities(newValue.region_id)
        fetchCities(newValue.municipality_id)
        if (newValue.image) {
            avatarUrl.value = newValue.image
        }
        state.formCitizen = {
            image: newValue.image,
            firstname: newValue.firstname,
            lastname: newValue.lastname,
            email: newValue.email,
            social_security_number: newValue.social_security_number,
            birthday: newValue.birthday,
            phone: newValue.phone,
            department: newValue.department,
            street: newValue.street,
            region: newValue.region_id,
            municipality: newValue.municipality_id,
            city: newValue.city_id,
            post_code: newValue.post_code,
            diagnosis: newValue.diagnosis,
        }
    }
})

onMounted(() => {
    fetchDepartments()
    fetchRegions()
})

async function fetchDepartments() {
    try {
        const response = await departmentService.getAllDepartments()
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.id,
                    label: item.name,
                })
            )
            state.options.departments = options
        }
    } catch (error: any) {
        state.error = error
    }
}

async function fetchRegions() {
    emit('isPageLoading', true)
    try {
        const response = await regionService.getAllRegions()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.id,
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

async function fetchMunicipalities(regionId: any) {
    emit('isPageLoading', true)
    try {
        const params = {
            region_id: regionId
        }
        const response = await municipalityService.getAllMunicipalities(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.id,
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

async function fetchCities(municipalityId: any) {
    emit('isPageLoading', true)
    try {
        const params = {
            municipality_id: municipalityId
        }
        const response = await cityService.getAllCities(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.id,
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

function changeSelectedRegion(regionId: number) {
    fetchMunicipalities(regionId)
}

function changeSelectedMunicipality(municipalityId: number) {
    fetchCities(municipalityId)
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
            email: {
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
    image.value.click()
}

function onFileChange() {
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

watch(() => state.formCitizen.social_security_number, (newValue) => {
    if (newValue.length === 10) {
        state.formCitizen.social_security_number = newValue.slice(0, 6) + '-' + newValue.slice(6)
    }
})
</script>