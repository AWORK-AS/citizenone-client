<template>
    <div>

        <Head>
            <Title>Edit citizen - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <LoadingSpinner :isActive="state.isPageLoading">
            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" class="text-black h-6 w-6 dark:text-white" />
                    <span>Back</span>
                </NuxtLink>
                <div class="space-y-3">
                    <BaseMessage color="danger" icon v-if="state.error" :message="state.error?.message" />
                    <BaseMessage color="danger" icon v-if="errorMessage" :message="errorMessage" />
                    <form action="" method="POST" class="grid grid-cols-12 gap-6" @submit.prevent="onSubmit">
                        <div class="ltablet:col-span-8 col-span-12 lg:col-span-8">
                            <BaseCard rounded="sm" class="p-4 md:p-8">
                                <div class="grid grid-cols-1 gap-4 gap-y-2 text-sm lg:grid-cols-12">
                                    <div class="col-span-12 space-y-10">
                                        <TairoFormGroup label="Citizen's Information"
                                            sublabel="Register new citizen. Ensure accurate and complete citizen details are entered.">
                                            <div class="grid grid-cols-12 gap-4">
                                                <div class="col-span-12">
                                                    <div
                                                        class="relative mb-5 flex flex-col items-center justify-center gap-4">
                                                        <BaseFullscreenDropfile icon="ph:image-duotone"
                                                            :filter-file-dropped="(file: any) => file.type.startsWith('image')"
                                                            @drop="(value: any) => { inputFile = value }" />
                                                        <BaseInputFileHeadless v-slot="{ open, remove, preview, files }"
                                                            v-model="inputFile" accept="image/*">
                                                            <div class="relative size-28">
                                                                <img v-if="files?.length && files.item(0)"
                                                                    :src="preview(files.item(0)!).value"
                                                                    alt="Upload preview"
                                                                    class="bg-muted-200 dark:bg-muted-700/60 size-28 rounded-full object-cover object-center">
                                                                <img v-else :src="state.citizenAvatar"
                                                                    alt="Upload preview"
                                                                    class="bg-muted-200 dark:bg-muted-700/60 size-28 rounded-full object-cover object-center">
                                                                <div v-if="files?.length && files.item(0)"
                                                                    class="absolute bottom-1 end-1 z-20">
                                                                    <BaseButtonIcon size="sm" rounded="full"
                                                                        data-tooltip="Remove image" class="scale-90"
                                                                        @click="remove(files.item(0)!)">
                                                                        <Icon name="lucide:x" class="size-4" />
                                                                    </BaseButtonIcon>
                                                                </div>
                                                                <div v-else class="absolute bottom-1 end-1 z-20">
                                                                    <div class="relative" data-tooltip="Upload image">
                                                                        <BaseButtonIcon size="sm" rounded="full"
                                                                            @click="open">
                                                                            <Icon name="lucide:plus" class="size-4" />
                                                                        </BaseButtonIcon>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </BaseInputFileHeadless>
                                                        <div v-if="fileError"
                                                            class="text-danger-600 inline-block font-sans text-[.8rem]">
                                                            {{ fileError }}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="col-span-12 md:col-span-6">
                                                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                        name="citizen.firstname">
                                                        <BaseInput label="First name" icon="ph:user-duotone"
                                                            placeholder="Ex: John" :model-value="field.value"
                                                            :error="errorMessage" :disabled="isSubmitting" type="text"
                                                            @update:model-value="handleChange" @blur="handleBlur" />
                                                    </Field>
                                                </div>

                                                <div class="col-span-12 md:col-span-6">
                                                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                        name="citizen.lastname">
                                                        <BaseInput label="Last name" icon="ph:user-duotone"
                                                            placeholder="Ex: Doe" :model-value="field.value"
                                                            :error="errorMessage" :disabled="isSubmitting" type="text"
                                                            @update:model-value="handleChange" @blur="handleBlur" />
                                                    </Field>
                                                </div>

                                                <div class="col-span-12 md:col-span-6">
                                                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                        name="citizen.email">
                                                        <BaseInput label="Email Address" icon="ph:envelope-duotone"
                                                            placeholder="Ex: johndoe@gmail.com"
                                                            :model-value="field.value" :error="errorMessage"
                                                            :disabled="isSubmitting" type="email"
                                                            @update:model-value="handleChange" @blur="handleBlur" />
                                                    </Field>
                                                </div>

                                                <div class="col-span-12 md:col-span-6">
                                                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                        name="citizen.socialSecurityNumber">
                                                        <BaseInput label="Social security number"
                                                            icon="ph:credit-card-light" placeholder="010119001234"
                                                            :model-value="field.value" :error="errorMessage"
                                                            :disabled="isSubmitting" type="text"
                                                            @update:model-value="handleChange" @blur="handleBlur" />
                                                    </Field>
                                                </div>

                                                <div class="col-span-12 md:col-span-6">
                                                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                        name="citizen.birthday">
                                                        <BaseInput label="Birthday" icon="ph:calendar"
                                                            :model-value="field.value" :error="errorMessage"
                                                            :disabled="isSubmitting" type="date"
                                                            @update:model-value="handleChange" @blur="handleBlur" />
                                                    </Field>
                                                </div>

                                                <div class="col-span-12 md:col-span-6">
                                                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                        name="citizen.phone">
                                                        <AddonInputPhone ref="inputPhoneRef" label="Phone"
                                                            icon="lucide:phone" :model-value="field.value"
                                                            :error="errorMessage" country="DK" :disabled="isSubmitting"
                                                            @update:model-value="handleChange" @blur="handleBlur" />
                                                    </Field>
                                                </div>

                                                <div class="col-span-12 grid grid-cols-12 gap-4">
                                                    <div class="col-span-12">
                                                        <div class="col-span-12">
                                                            <Field
                                                                v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                                name="citizen.address">
                                                                <BaseInput label="Address" icon="ph:map-pin-duotone"
                                                                    placeholder="Ex: App 2 suite g3 santa monica"
                                                                    :model-value="field.value" :error="errorMessage"
                                                                    :disabled="isSubmitting"
                                                                    @update:model-value="handleChange"
                                                                    @blur="handleBlur" />
                                                            </Field>
                                                        </div>
                                                    </div>

                                                    <div class="col-span-12 sm:col-span-6">
                                                        <Field
                                                            v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                            name="citizen.region">
                                                            <BaseSelect label="Region" icon="ph:globe"
                                                                :model-value="field.value" :error="errorMessage"
                                                                :disabled="isSubmitting"
                                                                @update:model-value="handleChange" @blur="handleBlur"
                                                                @change="changeSelectedRegion">
                                                                <option value="" hidden></option>
                                                                <option v-for="region in state.regions?.data"
                                                                    :value="region?.id.toString()">
                                                                    {{ region.name }}
                                                                </option>
                                                            </BaseSelect>
                                                        </Field>
                                                    </div>

                                                    <div class="col-span-12 sm:col-span-6">
                                                        <Field
                                                            v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                            name="citizen.municipality">
                                                            <BaseSelect label="Municipality" icon="ph:globe"
                                                                :model-value="field.value" :error="errorMessage"
                                                                :disabled="isSubmitting"
                                                                @update:model-value="handleChange" @blur="handleBlur"
                                                                @change="changeSelectedMunicipality">
                                                                <option value="" hidden></option>
                                                                <option
                                                                    v-for="municipality in state.municipalities?.data"
                                                                    :value="municipality?.id.toString()">
                                                                    {{ municipality.name }}
                                                                </option>
                                                            </BaseSelect>
                                                        </Field>
                                                    </div>

                                                    <div class="col-span-12 sm:col-span-6">
                                                        <Field
                                                            v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                            name="citizen.city">
                                                            <BaseSelect label="City" icon="ph:globe"
                                                                :model-value="field.value" :error="errorMessage"
                                                                :disabled="isSubmitting"
                                                                @update:model-value="handleChange" @blur="handleBlur"
                                                                @change="changeSelectedCity">
                                                                <option value="" hidden></option>
                                                                <option v-for="city in state.cities?.data"
                                                                    :value="city?.id.toString()">
                                                                    {{ city.name }}
                                                                </option>
                                                            </BaseSelect>
                                                        </Field>
                                                    </div>

                                                    <div class="col-span-12 sm:col-span-6">
                                                        <Field
                                                            v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                            name="citizen.postcode">
                                                            <BaseInput type="text" label="Post Code"
                                                                icon="ph:paper-plane-tilt-duotone"
                                                                placeholder="Ex: 912656" :model-value="field.value"
                                                                :error="errorMessage" :disabled="isSubmitting"
                                                                @update:model-value="handleChange" @blur="handleBlur"
                                                                :maxlength="10" />
                                                        </Field>
                                                    </div>
                                                </div>

                                                <div class="col-span-12">
                                                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                        name="citizen.note">
                                                        <BaseTextarea label="Note" placeholder="" rows="4"
                                                            :model-value="field.value" :error="errorMessage"
                                                            :disabled="isSubmitting" @update:model-value="handleChange"
                                                            @blur="handleBlur" />
                                                    </Field>
                                                </div>
                                            </div>
                                        </TairoFormGroup>

                                        <div class="text-right md:col-span-5">
                                            <div
                                                class="-mt-4 inline-flex w-full items-center justify-end gap-2 sm:w-auto">
                                                <BaseButton class="!h-12 w-full sm:w-40" :disabled="isSubmitting"
                                                    :loading="isSubmitting" @click="navigateTo('/citizens')">
                                                    Cancel
                                                </BaseButton>
                                                <BaseButton type="submit" color="primary" class="!h-12 w-full sm:w-40"
                                                    :disabled="isSubmitting" :loading="isSubmitting">
                                                    Update Citizen
                                                </BaseButton>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </BaseCard>
                        </div>
                    </form>
                </div>
            </div>
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useFieldError, useForm } from 'vee-validate'
import { z } from 'zod'
import { AddonInputPhone } from '#components'
import { regionService } from '@/components/api/RegionService'
import { municipalityService } from '@/components/api/MunicipalityService'
import { cityService } from '@/components/api/CityService'
import { citizenService } from '@/components/api/CitizenService'

definePageMeta({
    layout: 'user',
    title: 'Edit citizen',
})

const runtimeConfig = useRuntimeConfig()
const toaster = useToaster()
const route = useRoute()
const citizenUuid = route.params.slug
let errorMessage = ''

const state = reactive({
    citizenAvatar: '/img/avatars/user.svg',
    cities: [],
    error: null,
    isPageLoading: false,
    municipalities: [],
    regions: [],
    selectedCitizen: null,
    selectedRegion: null,
    selectedMunicipality: null,
    selectedCity: null
})

function changeSelectedRegion(event: any) {
    state.selectedRegion = event.target.value
    fetchMunicipalities(state.selectedRegion)
}

function changeSelectedMunicipality(event: any) {
    state.selectedMunicipality = event.target.value
    fetchCities(state.selectedMunicipality)
}

function changeSelectedCity(event: any) {
    state.selectedCity = event.target.value
}

onMounted(() => {
    fetchSelectedCitizen()
    fetchRegions()
})

async function fetchSelectedCitizen() {
    state.isPageLoading = true
    try {
        const response = await citizenService.getCitizen(citizenUuid)
        if (response) {
            state.selectedCitizen = response
            fetchMunicipalities(response?.data?.address?.region_id)
            fetchCities(response?.data?.address?.municipality_id)
            if (response?.data?.image) {
                state.citizenAvatar = response?.data?.image
            }
            setFieldValue('citizen.firstname', response?.data?.firstname ?? '')
            setFieldValue('citizen.lastname', response?.data?.lastname ?? '')
            setFieldValue('citizen.email', response?.data?.email ?? '')
            setFieldValue('citizen.socialSecurityNumber', response?.data?.social_security_number ?? '')
            setFieldValue('citizen.birthday', response?.data?.birthday ?? '')
            setFieldValue('citizen.phone', response?.data?.phone ?? '')
            setFieldValue('citizen.address', response?.data?.address?.street ?? '')
            setFieldValue('citizen.region', response?.data?.address?.region_id.toString() ?? '')
            setFieldValue('citizen.municipality', response?.data?.address?.municipality_id.toString() ?? '')
            setFieldValue('citizen.city', response?.data?.address?.city_id.toString() ?? '')
            setFieldValue('citizen.postcode', response?.data?.address?.post_code ?? '')
            setFieldValue('citizen.note', response?.data?.address?.post_code ?? '')
        }
    } catch (error: any) {
        errorMessage = error.message
    }
    state.isPageLoading = false
}

async function fetchRegions() {
    state.isPageLoading = true
    try {
        const response = await regionService.getAllRegions()
        if (response) {
            state.regions = response
        }
    } catch (error: any) {
        errorMessage = error.message
    }
    state.isPageLoading = false
}

async function fetchMunicipalities(regionId: any) {
    state.isPageLoading = true
    try {
        const params = {
            region_id: regionId
        }
        const response = await municipalityService.getAllMunicipalities(params)
        if (response) {
            state.municipalities = response
        }
    } catch (error: any) {
        errorMessage = error.message
    }
    state.isPageLoading = false
}

async function fetchCities(municipalityId: any) {
    state.isPageLoading = true
    try {
        const params = {
            municipality_id: municipalityId
        }
        const response = await cityService.getAllCities(params)
        if (response) {
            state.cities = response
        }
    } catch (error: any) {
        errorMessage = error.message
    }
    state.isPageLoading = false
}

// This is the object that will contain the validation messages
const TWO_MB = 2000000
const VALIDATION_TEXT = {
    FIRSTNAME_REQUIRED: 'This field is required',
    LASTNAME_REQUIRED: 'This field is required',
    EMAIL_REQUIRED: 'This field is required',
    SSN_REQUIRED: 'This field is required',
    BIRTHDAY_REQUIRED: 'This field is required',
    PHONE_REQUIRED: 'Please select an option',
    ADDRESS_REQUIRED: 'This field is required',
    REGION_REQUIRED: 'This field is required',
    MUNICIPALITY_REQUIRED: 'This field is required',
    CITY_REQUIRED: 'This field is required',
    POSTCODE_REQUIRED: 'This field is required',
    AVATAR_TOO_BIG: `Image size must be less than 2MB`,
}

const inputPhoneRef = ref<InstanceType<typeof AddonInputPhone>>()

function phoneErrorMessage(code?: string) {
    switch (code) {
        case 'INVALID_COUNTRY':
            return 'Please select a country'
        case 'NO_POSSIBLE_COUNTRIES':
            return 'No possible countries for this phone number'
        case 'PHONE_NUMBER_NOT_POSSIBLE':
            return 'This phone number is not valid for the selected country'
        case 'NOT_A_NUMBER':
        case 'TOO_SHORT':
        case 'TOO_LONG':
        default:
            return 'Please enter a valid phone number'
    }
}

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
const zodSchema = z
    .object({
        avatar: z.custom<File>(v => v instanceof File).nullable(),
        citizen: z.object({
            firstname: z.string().min(1, VALIDATION_TEXT.FIRSTNAME_REQUIRED),
            lastname: z.string().min(1, VALIDATION_TEXT.LASTNAME_REQUIRED),
            email: z.string().min(1, VALIDATION_TEXT.EMAIL_REQUIRED),
            socialSecurityNumber: z.string().min(1, VALIDATION_TEXT.SSN_REQUIRED),
            birthday: z.string().min(1, VALIDATION_TEXT.BIRTHDAY_REQUIRED),
            phone: z.string().min(1, VALIDATION_TEXT.PHONE_REQUIRED),
            address: z.string().min(1, VALIDATION_TEXT.ADDRESS_REQUIRED),
            region: z.string().min(1, VALIDATION_TEXT.REGION_REQUIRED),
            municipality: z.string().min(1, VALIDATION_TEXT.MUNICIPALITY_REQUIRED),
            city: z.string().min(1, VALIDATION_TEXT.CITY_REQUIRED),
            postcode: z.string().min(1, VALIDATION_TEXT.POSTCODE_REQUIRED),
            note: z.string().optional(),
        }),
    })
    .superRefine((data, ctx) => {
        // This is a custom validation function that will be called
        // before the form is submitted
        if (data.avatar && data.avatar.size > TWO_MB) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: VALIDATION_TEXT.AVATAR_TOO_BIG,
                path: ['avatar'],
            })
        }

        if (!inputPhoneRef.value?.validation?.valid) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: phoneErrorMessage(inputPhoneRef.value?.validation?.error) || VALIDATION_TEXT.PHONE_REQUIRED,
                path: ['citizen.phone'],
            })
        }
    })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = {
    avatar: null,
    citizen: {
        firstname: '',
        lastname: '',
        email: '',
        socialSecurityNumber: '',
        birthday: '',
        phone: '',
        address: '',
        region: '',
        municipality: '',
        city: '',
        postcode: '',
        note: '',
    },
} satisfies FormInput

const {
    handleSubmit,
    isSubmitting,
    setFieldError,
    meta,
    values,
    errors,
    resetForm,
    setFieldValue,
    setErrors,
} = useForm({
    validationSchema,
    initialValues,
})

// BaseInputFileHeadless gives us a listfile input, but we need to
// extract the file from the list and set it to the form
const inputFile = ref<FileList | null>()
const fileError = useFieldError('avatar')
watch(inputFile, (value) => {
    const file = value?.item(0) || null
    setFieldValue('avatar', file)
})

// This is where you would send the form data to the server
const onSubmit = handleSubmit(async (values) => {
    errorMessage = ''
    try {
        isSubmitting.value = true
        let formData = new FormData()
        formData.append('image', values.avatar)
        formData.append('firstname', values.citizen.firstname)
        formData.append('lastname', values.citizen.lastname)
        formData.append('email', values.citizen.email)
        formData.append('social_security_number', values.citizen.socialSecurityNumber)
        formData.append('birthday', values.citizen.birthday)
        formData.append('phone', values.citizen.phone)
        formData.append('street', values.citizen.address)
        formData.append('region_id', values.citizen.region)
        formData.append('municipality_id', values.citizen.municipality)
        formData.append('city_id', values.citizen.city)
        formData.append('post_code', values.citizen.postcode)
        formData.append('note', values.citizen.note)
        const response = await citizenService.updateCitizen(citizenUuid, formData)
        if (response.data) {
            toaster.clearAll()
            toaster.show({
                title: 'Success',
                message: 'Citizen successfully updated.',
                color: 'success',
                icon: 'ph:check',
                closable: true,
            })
            isSubmitting.value = false
        }
    } catch (error: any) {
        errorMessage = error.message
        isSubmitting.value = false
        setFieldError('citizen.firstname', error?.errors?.firstname)
        setFieldError('citizen.lastname', error?.errors?.lastname)
        setFieldError('citizen.email', error?.errors?.email)
        setFieldError('citizen.socialSecurityNumber', error?.errors?.social_security_number)
        setFieldError('citizen.birthday', error?.errors?.birthday)
        setFieldError('citizen.phone', error?.errors?.phone)
        setFieldError('citizen.address', error?.errors?.street)
        setFieldError('citizen.region', error?.errors?.region_id)
        setFieldError('citizen.municipality', error?.errors?.municipality_id)
        setFieldError('citizen.city', error?.errors?.city_id)
        setFieldError('citizen.postcode', error?.errors?.post_code)
        setFieldError('citizen.note', error?.errors?.note)
        return
    }
})
</script>