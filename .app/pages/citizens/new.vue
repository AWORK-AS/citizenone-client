<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <div>
            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                <Icon name="ph:arrow-left" class="text-black h-6 w-6 dark:text-white" />
                <span>Back</span>
            </NuxtLink>
            <div class="space-y-3">
                <form action="" method="POST" class="grid grid-cols-12 gap-6" @submit.prevent="onSubmit">
                    <div class="ltablet:col-span-8 col-span-12 lg:col-span-8">
                        <BaseCard rounded="sm" class="p-4 md:p-8">
                            <div class="grid grid-cols-1 gap-4 gap-y-2 text-sm lg:grid-cols-12">
                                <div class="col-span-12 space-y-10">
                                    <TairoFormGroup label="Citizen's Information"
                                        sublabel="Register new citizen. Ensure accurate and complete citizen details are entered.">
                                        <div class="grid grid-cols-12 gap-4">
                                            <div class="col-span-12 md:col-span-6">
                                                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                    name="citizen.firstName">
                                                    <BaseInput label="First name" icon="ph:user-duotone"
                                                        placeholder="Ex: John" :model-value="field.value"
                                                        :error="errorMessage" :disabled="isSubmitting" type="text"
                                                        @update:model-value="handleChange" @blur="handleBlur" />
                                                </Field>
                                            </div>

                                            <div class="col-span-12 md:col-span-6">
                                                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                    name="citizen.lastName">
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
                                                        placeholder="Ex: johndoe@gmail.com" :model-value="field.value"
                                                        :error="errorMessage" :disabled="isSubmitting" type="email"
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
                                                                @update:model-value="handleChange" @blur="handleBlur" />
                                                        </Field>
                                                    </div>
                                                </div>

                                                <div class="col-span-12 sm:col-span-6">
                                                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                        name="citizen.region">
                                                        <BaseSelect label="Region" icon="ph:globe"
                                                            :model-value="field.value" :error="errorMessage"
                                                            :disabled="isSubmitting" @update:model-value="handleChange"
                                                            @blur="handleBlur">
                                                            <option value="" hidden />
                                                            <option value="intern">
                                                                Intern
                                                            </option>
                                                            <option value="resident">
                                                                Resident
                                                            </option>
                                                            <option value="titular">
                                                                Titular
                                                            </option>
                                                        </BaseSelect>
                                                    </Field>
                                                </div>

                                                <div class="col-span-12 sm:col-span-6">
                                                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                        name="citizen.municipality">
                                                        <BaseSelect label="Municipality" icon="ph:globe"
                                                            :model-value="field.value" :error="errorMessage"
                                                            :disabled="isSubmitting" @update:model-value="handleChange"
                                                            @blur="handleBlur">
                                                            <option value="" hidden />
                                                            <option value="intern">
                                                                Intern
                                                            </option>
                                                            <option value="resident">
                                                                Resident
                                                            </option>
                                                            <option value="titular">
                                                                Titular
                                                            </option>
                                                        </BaseSelect>
                                                    </Field>
                                                </div>

                                                <div class="col-span-12 sm:col-span-6">
                                                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                        name="citizen.city">
                                                        <BaseSelect label="City" icon="ph:globe"
                                                            :model-value="field.value" :error="errorMessage"
                                                            :disabled="isSubmitting" @update:model-value="handleChange"
                                                            @blur="handleBlur">
                                                            <option value="" hidden />
                                                            <option value="intern">
                                                                Intern
                                                            </option>
                                                            <option value="resident">
                                                                Resident
                                                            </option>
                                                            <option value="titular">
                                                                Titular
                                                            </option>
                                                        </BaseSelect>
                                                    </Field>
                                                </div>

                                                <div class="col-span-12 sm:col-span-6">
                                                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                        name="citizen.postcode">
                                                        <BaseInput type="text" label="Post Code"
                                                            icon="ph:paper-plane-tilt-duotone" placeholder="Ex: 912656"
                                                            :model-value="field.value" :error="errorMessage"
                                                            :disabled="isSubmitting" @update:model-value="handleChange"
                                                            @blur="handleBlur" :maxlength="10" />
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
                                        <div class="-mt-4 inline-flex w-full items-center justify-end gap-2 sm:w-auto">
                                            <BaseButton class="!h-12 w-full sm:w-40" @click="navigateTo('/citizens')">
                                                Cancel
                                            </BaseButton>
                                            <BaseButton type="submit" color="primary" class="!h-12 w-full sm:w-40">
                                                Save Citizen
                                            </BaseButton>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </BaseCard>
                    </div>
                    <div class="ltablet:col-span-4 col-span-12 lg:col-span-4">
                        <BaseCard class="ptablet:p-8 p-6 lg:p-8">
                            <BaseText size="xs" weight="medium"
                                class="text-muted-400 mb-6 block uppercase tracking-wider">
                                Record preview
                            </BaseText>
                            <div class="mb-4 flex">
                                <div class="grow space-y-1">
                                    <div>
                                        <BaseHeading as="h3" weight="medium">
                                            {{ values.citizen?.firstName }} {{ values.citizen?.lastName }}
                                        </BaseHeading>
                                    </div>
                                    <div class="text-muted-400 flex items-center gap-2">
                                        <Icon name="lucide:mail" class="size-4" />
                                        <BaseText size="xs" v-if="values.citizen?.email">
                                            {{ values.citizen?.email }}
                                        </BaseText>
                                        <BaseText v-else size="xs" class="opacity-50">
                                            Fill up email
                                        </BaseText>
                                    </div>
                                    <div class="text-muted-400 flex items-center gap-2">
                                        <Icon name="ph:credit-card-light" class="size-4" />
                                        <BaseText size="xs" v-if="values.citizen?.socialSecurityNumber">
                                            {{ values.citizen?.socialSecurityNumber }}
                                        </BaseText>
                                        <BaseText v-else size="xs" class="opacity-50">
                                            Fill up social security number
                                        </BaseText>
                                    </div>
                                    <div class="text-muted-400 flex items-center gap-2">
                                        <Icon name="lucide:calendar" class="size-4" />
                                        <BaseText size="xs" v-if="values.citizen?.birthday">
                                            {{ values.citizen?.birthday }}
                                        </BaseText>
                                        <BaseText v-else size="xs" class="opacity-50">
                                            Fill up birthday
                                        </BaseText>
                                    </div>
                                    <div class="text-muted-400 flex items-center gap-2">
                                        <Icon name="lucide:phone" class="size-4" />
                                        <BaseText size="xs" v-if="values.citizen?.phone">
                                            {{ values.citizen?.phone }}
                                        </BaseText>
                                        <BaseText v-else size="xs" class="opacity-50">
                                            Fill up phone number
                                        </BaseText>
                                    </div>
                                </div>
                                <div class="shrink-0">
                                    <BaseAvatar size="lg" src="/img/avatars/user.svg" />
                                </div>
                            </div>
                            <div class="divide-muted-200 dark:divide-muted-700 flex w-full items-center divide-x py-1">
                                <div class="xxl:pe-6 flex flex-1 flex-col gap-1 pe-4">
                                    <div class="w-24 text-xs uppercase leading-tight">
                                        Address
                                    </div>
                                    <BaseText size="sm" class="text-muted-400">
                                        {{ values.citizen?.address }} {{ values.citizen?.region }}
                                        {{ values.citizen?.municipality }} {{ values.citizen?.city }}
                                        {{ values.citizen?.postcode }}
                                    </BaseText>
                                </div>
                            </div>
                            <div class="divide-muted-200 dark:divide-muted-700 flex w-full items-center divide-x py-3">
                                <div class="xxl:pe-6 flex flex-1 flex-col gap-1 pe-4">
                                    <div class="w-24 text-xs uppercase leading-tight">
                                        Note
                                    </div>
                                    <BaseText size="sm" class="text-muted-400">
                                        {{ values.citizen?.note }}
                                    </BaseText>
                                </div>
                            </div>
                        </BaseCard>
                    </div>
                </form>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useFieldError, useForm } from 'vee-validate'
import { z } from 'zod'
import { AddonInputPhone } from '#components'
import { citizenService } from '@/components/api/CitizenService'

definePageMeta({
    layout: 'user',
    title: 'New citizen',
})

const state = reactive({
    error: null,
    isPageLoading: false,
})

const dates = ref({
    start: new Date(),
    end: new Date(),
})

const masks = ref({
    input: 'YYYY-MM-DD',
})

// This is the object that will contain the validation messages
const ONE_MB = 1000000
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
    AVATAR_TOO_BIG: `Avatar size must be less than 1MB`,
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
            firstName: z.string().min(1, VALIDATION_TEXT.FIRSTNAME_REQUIRED),
            lastName: z.string().min(1, VALIDATION_TEXT.LASTNAME_REQUIRED),
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
        if (data.avatar && data.avatar.size > ONE_MB) {
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
        firstName: '',
        lastName: '',
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

const success = ref(false)
const fieldsWithErrors = computed(() => Object.keys(errors.value).length)

// BaseInputFileHeadless gives us a listfile input, but we need to
// extract the file from the list and set it to the form
const inputFile = ref<FileList | null>()
const fileError = useFieldError('avatar')
watch(inputFile, (value) => {
    const file = value?.item(0) || null
    setFieldValue('avatar', file)
})

// Ask the user for confirmation before leaving the page if the form has unsaved changes
onBeforeRouteLeave(() => {
    if (meta.value.dirty) {
        return confirm('You have unsaved changes. Are you sure you want to leave?')
    }
})

const toaster = useToaster()

// This is where you would send the form data to the server
const onSubmit = handleSubmit(
    async (values) => {
        success.value = false

        // here you have access to the validated form values
        console.log('citizen-create-success', values)

        try {
            toaster.clearAll()
            toaster.show({
                title: 'Success',
                message: `Citizen has been added!`,
                color: 'success',
                icon: 'ph:check',
                closable: true,
            })
        }
        catch (error: any) {
            // this will set the error on the form
            if (error.message === 'Fake backend validation error') {

                document.documentElement.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                })

                toaster.clearAll()
                toaster.show({
                    title: 'Oops!',
                    message: 'Please review the errors in the form',
                    color: 'danger',
                    icon: 'lucide:alert-triangle',
                    closable: true,
                })
            }
            return
        }

        resetForm()

        document.documentElement.scrollTo({
            top: 0,
            behavior: 'smooth',
        })

        success.value = true
        setTimeout(() => {
            success.value = false
        }, 3000)
    },
    (error) => {
        // this callback is optional and called only if the form has errors
        success.value = false

        // here you have access to the error
        console.log('citizen-create-error', error)

        // you can use it to scroll to the first error
        document.documentElement.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    },
)

const currentRating = computed(() => {
    if (values.citizen?.rating === undefined || values.citizen?.rating === null)
        return 0
    return parseInt(values.citizen?.rating)
})

const currentRatingText = computed(() => {
    switch (currentRating.value) {
        case 1:
            return 'Standard'
        case 2:
            return 'Good'
        case 3:
            return 'Advanced'
        case 4:
            return 'Expert'
        case 5:
            return 'Top 3%'
        default:
            return 'n/a'
    }
})
</script>