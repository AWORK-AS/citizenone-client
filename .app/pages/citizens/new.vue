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

                                            <div class="col-span-12">
                                                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                    name="citizen.phone">
                                                    <AddonInputPhone ref="inputPhoneRef" label="Phone"
                                                        icon="lucide:phone" :model-value="field.value"
                                                        :error="errorMessage" country="DK" :disabled="isSubmitting"
                                                        @update:model-value="handleChange" @blur="handleBlur" />
                                                </Field>
                                            </div>

                                            <div class="col-span-12 md:col-span-4">
                                                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                    name="citizen.status">
                                                    <BaseSelect label="Status" icon="ph:heartbeat-duotone"
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

                                            <div class="col-span-12 md:col-span-4">
                                                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                    name="citizen.experience">
                                                    <BaseSelect label="Experience" icon="ph:trophy-duotone"
                                                        :model-value="field.value" :error="errorMessage"
                                                        :disabled="isSubmitting" @update:model-value="handleChange"
                                                        @blur="handleBlur">
                                                        <option value="" hidden />
                                                        <option value="0-5">
                                                            0-5
                                                        </option>
                                                        <option value="5-10">
                                                            5-10
                                                        </option>
                                                        <option value="10-15">
                                                            10-15
                                                        </option>
                                                        <option value="15+">
                                                            15+
                                                        </option>
                                                    </BaseSelect>
                                                </Field>
                                            </div>

                                            <div class="col-span-12 md:col-span-4">
                                                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                    name="citizen.rating">
                                                    <BaseSelect label="Rating" icon="ph:star-duotone"
                                                        :model-value="field.value" :error="errorMessage"
                                                        :disabled="isSubmitting" @update:model-value="handleChange"
                                                        @blur="handleBlur">
                                                        <option value="" hidden />
                                                        <option value="1">
                                                            B+
                                                        </option>
                                                        <option value="2">
                                                            A
                                                        </option>
                                                        <option value="3">
                                                            A+
                                                        </option>
                                                        <option value="4">
                                                            S
                                                        </option>
                                                        <option value="5">
                                                            S+
                                                        </option>
                                                    </BaseSelect>
                                                </Field>
                                            </div>
                                        </div>

                                        <div class="grid grid-cols-12 gap-4">
                                            <div class="col-span-12">
                                                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                    name="citizen.address">
                                                    <BaseInput label="Address / Street" icon="ph:map-pin-duotone"
                                                        placeholder="Ex: App 2 suite g3 santa monica"
                                                        :model-value="field.value" :error="errorMessage"
                                                        :disabled="isSubmitting" @update:model-value="handleChange"
                                                        @blur="handleBlur" />
                                                </Field>
                                            </div>
                                            <div class="col-span-12 sm:col-span-4">
                                                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                    name="citizen.city">
                                                    <BaseInput label="City" icon="ph:buildings-duotone"
                                                        placeholder="Ex: Los Angeles" :model-value="field.value"
                                                        :error="errorMessage" :disabled="isSubmitting" type="text"
                                                        @update:model-value="handleChange" @blur="handleBlur" />
                                                </Field>
                                            </div>
                                            <div class="col-span-12 sm:col-span-4">
                                                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                    name="citizen.state">
                                                    <BaseInput label="State/Province" icon="ph:globe-duotone"
                                                        placeholder="Ex: CA" :model-value="field.value"
                                                        :error="errorMessage" :disabled="isSubmitting" type="text"
                                                        @update:model-value="handleChange" @blur="handleBlur" />
                                                </Field>
                                            </div>
                                            <div class="col-span-12 sm:col-span-4">
                                                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                    name="citizen.zipcode">
                                                    <BaseInput type="text" label="Zip Code"
                                                        icon="ph:paper-plane-tilt-duotone" placeholder="Ex: 912656"
                                                        :model-value="field.value" :error="errorMessage"
                                                        :disabled="isSubmitting" @update:model-value="handleChange"
                                                        @blur="handleBlur" />
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
                                    </TairoFormGroup>

                                    <div class="text-right md:col-span-5">
                                        <div class="-mt-4 inline-flex w-full items-center justify-end gap-2 sm:w-auto">
                                            <BaseButton class="!h-12 w-full sm:w-40">
                                                Cancel
                                            </BaseButton>
                                            <BaseButton type="submit" color="primary" class="!h-12 w-full sm:w-40">
                                                Submit
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
                                <div class="grow">
                                    <BaseHeading as="h3" weight="medium">
                                        Dr. {{ values.citizen?.firstName }}
                                        {{ values.citizen?.lastName }}
                                    </BaseHeading>
                                    <BaseText size="sm" class="text-muted-400">
                                        {{ values.citizen?.city === '' ? 'City' : values.citizen?.city }},
                                        {{
                                            values.citizen?.state === '' ? 'State' : values.citizen?.state
                                        }}
                                    </BaseText>
                                </div>
                                <div class="shrink-0">
                                    <BaseAvatar size="lg" src="/img/avatars/20.svg" />
                                </div>
                            </div>
                            <div>
                                <BaseText size="sm" class="text-muted-400">
                                    {{
                                        values.citizen?.note === ''
                                            ? ''
                                            : values.citizen?.note
                                    }}
                                </BaseText>
                            </div>
                            <div class="divide-muted-200 dark:divide-muted-700 flex w-full items-center divide-x py-6">
                                <div class="xxl:pe-6 flex flex-1 flex-col gap-1 pe-4">
                                    <BaseHeading as="h3" size="sm" weight="medium" lead="none">
                                        {{
                                            values.citizen?.status === null ? 'n/a' : values.citizen?.status
                                        }}
                                    </BaseHeading>
                                    <BaseText size="xs" class="text-muted-400">
                                        Role status
                                    </BaseText>
                                </div>
                                <div class="xxl:px-6 flex flex-1 flex-col gap-1 px-4">
                                    <BaseHeading as="h3" size="sm" weight="medium" lead="none">
                                        {{
                                            values.citizen?.experience === null
                                                ? 'n/a'
                                                : values.citizen?.experience
                                        }}
                                    </BaseHeading>
                                    <BaseText size="xs" class="text-muted-400">
                                        Years of exp.
                                    </BaseText>
                                </div>
                                <div class="xxl:ps-6 flex flex-1 flex-col gap-1 ps-4">
                                    <BaseHeading as="h3" size="sm" weight="medium" lead="none">
                                        Lvl.
                                        {{
                                            values.citizen?.rating === null ? 'n/a' : values.citizen?.rating
                                        }}
                                    </BaseHeading>
                                    <BaseText size="xs" class="text-muted-400">
                                        Global rating
                                    </BaseText>
                                </div>
                            </div>
                            <div>
                                <div class="flex items-end justify-between">
                                    <div class="w-24 text-xs uppercase leading-tight">
                                        Rating
                                    </div>
                                    <div class="text-success-600 font-sans text-xs font-semibold">
                                        {{ currentRatingText }}
                                    </div>
                                </div>
                                <div class="mt-1 flex">
                                    <div class="dark:border-muted-800 h-3 grow border-x border-white" :class="currentRating > 0
                                        ? 'bg-success-600'
                                        : 'bg-muted-200 dark:bg-muted-700'
                                        " />
                                    <div class="dark:border-muted-800 h-3 grow border-x border-white" :class="currentRating >= 2
                                        ? 'bg-success-600'
                                        : 'bg-muted-200 dark:bg-muted-700'
                                        " />
                                    <div class="dark:border-muted-800 h-3 grow border-x border-white" :class="currentRating >= 3
                                        ? 'bg-success-600'
                                        : 'bg-muted-200 dark:bg-muted-700'
                                        " />
                                    <div class="dark:border-muted-800 h-3 grow border-x border-white" :class="currentRating >= 4
                                        ? 'bg-success-600'
                                        : 'bg-muted-200 dark:bg-muted-700'
                                        " />
                                    <div class="dark:border-muted-800 h-3 grow border-x border-white" :class="currentRating === 5
                                        ? 'bg-success-600'
                                        : 'bg-muted-200 dark:bg-muted-700'
                                        " />
                                </div>
                            </div>
                            <div class="text-muted-400 mt-6 flex items-center gap-2">
                                <Icon name="lucide:mail" class="size-4" />
                                <BaseLink v-if="values.citizen?.email" class="block"
                                    :href="`mailto:${values.citizen?.email}`">
                                    <BaseText size="xs">
                                        {{ values.citizen?.email }}
                                    </BaseText>
                                </BaseLink>
                                <BaseText v-else size="xs" class="opacity-50">
                                    Fill up your email
                                </BaseText>
                            </div>
                            <div class="text-muted-400 mt-6 flex items-center gap-2">
                                <Icon name="lucide:phone" class="size-4" />
                                <BaseLink v-if="values.citizen?.phone" class="block"
                                    :href="`tel:${values.citizen?.phone}`">
                                    <BaseText size="xs">
                                        {{ values.citizen?.phone }}
                                    </BaseText>
                                </BaseLink>
                                <BaseText v-else size="xs" class="opacity-50">
                                    Fill up your emergency phone
                                </BaseText>
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
    OPTION_REQUIRED: 'Please select an option',
    ADDRESS_REQUIRED: 'This field is required',
    CITY_REQUIRED: 'This field is required',
    STATE_REQUIRED: 'This field is required',
    ZIPCODE_REQUIRED: 'This field is required',
    STATUS_REQUIRED: 'This field is required',
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
            socialSecurityNumber: z.string().min(1, VALIDATION_TEXT.SSN_REQUIRED),
            email: z.string().min(1, VALIDATION_TEXT.EMAIL_REQUIRED),
            birthday: z.string().min(1, VALIDATION_TEXT.BIRTHDAY_REQUIRED),
            note: z.string().optional(),
            phone: z.string().optional(),
            status: z
                .union([
                    z.literal('intern'),
                    z.literal('resident'),
                    z.literal('titular'),
                ])
                .nullable(),
            experience: z
                .union([
                    z.literal('0-5'),
                    z.literal('5-10'),
                    z.literal('10-15'),
                    z.literal('15+'),
                ])
                .nullable(),
            rating: z
                .union([
                    z.literal('1'),
                    z.literal('2'),
                    z.literal('3'),
                    z.literal('4'),
                    z.literal('5'),
                ])
                .nullable(),
            address: z.string().min(1, VALIDATION_TEXT.ADDRESS_REQUIRED),
            city: z.string().min(1, VALIDATION_TEXT.CITY_REQUIRED),
            state: z.string().min(1, VALIDATION_TEXT.STATE_REQUIRED),
            zipcode: z.string().min(5, VALIDATION_TEXT.ZIPCODE_REQUIRED),
            country: z.string(),
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
        if (!data.citizen.status) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: VALIDATION_TEXT.OPTION_REQUIRED,
                path: ['citizen.status'],
            })
        }
        if (!data.citizen.experience) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: VALIDATION_TEXT.OPTION_REQUIRED,
                path: ['citizen.experience'],
            })
        }
        if (!data.citizen.rating) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: VALIDATION_TEXT.OPTION_REQUIRED,
                path: ['citizen.rating'],
            })
        }

        if (!inputPhoneRef.value?.validation?.valid) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: phoneErrorMessage(inputPhoneRef.value?.validation?.error) || VALIDATION_TEXT.OPTION_REQUIRED,
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
        socialSecurityNumber: '',
        email: '',
        birthday: '',
        note: '',
        status: null,
        experience: null,
        rating: null,
        address: '',
        city: '',
        state: '',
        zipcode: '',
        country: 'United States',
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