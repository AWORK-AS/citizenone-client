<template>
    <div>

        <Head>
            <Title>Edit employee - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <LoadingSpinner :isActive="state.isPageLoading">
            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/employees">
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
                                        <TairoFormGroup label="Employee Details" sublabel="">
                                            <div class="grid grid-cols-12 gap-4">
                                                <div class="col-span-12 md:col-span-6">
                                                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                        name="employee.firstname">
                                                        <BaseInput label="First name" icon="ph:user-duotone"
                                                            placeholder="Ex: John" :model-value="field.value"
                                                            :error="errorMessage" :disabled="isSubmitting" type="text"
                                                            @update:model-value="handleChange" @blur="handleBlur" />
                                                    </Field>
                                                </div>

                                                <div class="col-span-12 md:col-span-6">
                                                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                        name="employee.lastname">
                                                        <BaseInput label="Last name" icon="ph:user-duotone"
                                                            placeholder="Ex: Doe" :model-value="field.value"
                                                            :error="errorMessage" :disabled="isSubmitting" type="text"
                                                            @update:model-value="handleChange" @blur="handleBlur" />
                                                    </Field>
                                                </div>

                                                <div class="col-span-12 md:col-span-6">
                                                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                        name="employee.email">
                                                        <BaseInput label="Email Address" icon="ph:envelope-duotone"
                                                            placeholder="Ex: johndoe@gmail.com"
                                                            :model-value="field.value" :error="errorMessage"
                                                            :disabled="isSubmitting" type="email"
                                                            @update:model-value="handleChange" @blur="handleBlur" />
                                                    </Field>
                                                </div>

                                                <div class="col-span-12 md:col-span-6">
                                                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                        name="employee.phone">
                                                        <AddonInputPhone ref="inputPhoneRef" label="Phone"
                                                            icon="lucide:phone" :model-value="field.value"
                                                            :error="errorMessage" country="DK" :disabled="isSubmitting"
                                                            @update:model-value="handleChange" @blur="handleBlur" />
                                                    </Field>
                                                </div>

                                                <div class="col-span-12 md:col-span-6">
                                                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                        name="employee.birthday">
                                                        <BaseInput label="Birthday" icon="ph:calendar"
                                                            :model-value="field.value" :error="errorMessage"
                                                            :disabled="isSubmitting" type="date"
                                                            @update:model-value="handleChange" @blur="handleBlur" />
                                                    </Field>
                                                </div>

                                                <div class="col-span-12 md:col-span-6">
                                                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                        name="employee.role">
                                                        <BaseSelect label="Role" icon="ph:user"
                                                            :model-value="field.value" :error="errorMessage"
                                                            :disabled="isSubmitting" @update:model-value="handleChange"
                                                            @blur="handleBlur" rounded="md">
                                                            <option value="">Select an option</option>
                                                            <option value="Admin">Admin</option>
                                                            <option value="User">User</option>
                                                        </BaseSelect>
                                                    </Field>
                                                </div>

                                                <div class="col-span-12 grid grid-cols-12 gap-4">
                                                    <div class="col-span-12">
                                                        <div class="col-span-12">
                                                            <Field
                                                                v-slot="{ field, errorMessage, handleChange, handleBlur }"
                                                                name="employee.address">
                                                                <BaseInput label="Address" icon="ph:map-pin-duotone"
                                                                    placeholder="Ex: App 2 suite g3 santa monica"
                                                                    :model-value="field.value" :error="errorMessage"
                                                                    :disabled="isSubmitting"
                                                                    @update:model-value="handleChange"
                                                                    @blur="handleBlur" />
                                                            </Field>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </TairoFormGroup>

                                        <div class="text-right md:col-span-5">
                                            <div
                                                class="-mt-4 inline-flex w-full items-center justify-end gap-2 sm:w-auto">
                                                <BaseButton class="!h-12 w-full sm:w-40" :disabled="isSubmitting"
                                                    :loading="isSubmitting" @click="navigateTo('/employees')">
                                                    Cancel
                                                </BaseButton>
                                                <BaseButton type="submit" color="primary" class="!h-12 w-full sm:w-40"
                                                    :disabled="isSubmitting" :loading="isSubmitting">
                                                    Update Employee
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
import { employeeService } from '@/components/api/EmployeeService'

definePageMeta({
    layout: 'user',
    title: 'Edit employee',
})

const runtimeConfig = useRuntimeConfig()
const toaster = useToaster()
const route = useRoute()
const employeeUuid = route.params.slug
let errorMessage = ''

const state = reactive({
    error: null,
    isPageLoading: false,
})

onMounted(() => {
    fetchSelectedEmployee()
})

async function fetchSelectedEmployee() {
    state.isPageLoading = true
    try {
        const response = await employeeService.getEmployee(employeeUuid)
        if (response) {
            setFieldValue('employee.firstname', response?.data?.firstname ?? '')
            setFieldValue('employee.lastname', response?.data?.lastname ?? '')
            setFieldValue('employee.email', response?.data?.email ?? '')
            setFieldValue('employee.phone', response?.data?.phone ?? '')
            setFieldValue('employee.birthday', response?.data?.birthday ?? '')
            setFieldValue('employee.address', response?.data?.address ?? '')
            setFieldValue('employee.role', response?.data?.roles?.[0]?.name ?? '')
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
    BIRTHDAY_REQUIRED: 'This field is required',
    PHONE_REQUIRED: 'Please select an option',
    ROLE_REQUIRED: 'Please select an option',
    ADDRESS_REQUIRED: 'This field is required',
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
        employee: z.object({
            firstname: z.string().min(1, VALIDATION_TEXT.FIRSTNAME_REQUIRED),
            lastname: z.string().min(1, VALIDATION_TEXT.LASTNAME_REQUIRED),
            email: z.string().min(1, VALIDATION_TEXT.EMAIL_REQUIRED),
            phone: z.string().min(1, VALIDATION_TEXT.PHONE_REQUIRED),
            birthday: z.string().min(1, VALIDATION_TEXT.BIRTHDAY_REQUIRED),
            role: z.string().min(1, VALIDATION_TEXT.ROLE_REQUIRED),
            address: z.string().min(1, VALIDATION_TEXT.ADDRESS_REQUIRED),
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
                path: ['employee.phone'],
            })
        }
    })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
type FormInput = z.infer<typeof zodSchema>

const validationSchema = toTypedSchema(zodSchema)
const initialValues = {
    avatar: null,
    employee: {
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        birthday: '',
        role: '',
        address: '',
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
        const params = {
            firstname: values.employee.firstname,
            lastname: values.employee.lastname,
            email: values.employee.email,
            phone: values.employee.phone,
            birthday: values.employee.birthday,
            role: values.employee.role,
            address: values.employee.address,
        }
        const response = await employeeService.updateEmployee(employeeUuid, params)
        if (response.data) {
            toaster.clearAll()
            toaster.show({
                title: 'Success',
                message: 'Employee successfully updated.',
                color: 'success',
                icon: 'ph:check',
                closable: true,
            })
            isSubmitting.value = false
            resetForm()
            navigateTo('/employees')
        }
    } catch (error: any) {
        errorMessage = error.message
        isSubmitting.value = false
        setFieldError('employee.firstname', error?.errors?.firstname)
        setFieldError('employee.lastname', error?.errors?.lastname)
        setFieldError('employee.email', error?.errors?.email)
        setFieldError('employee.phone', error?.errors?.phone)
        setFieldError('employee.birthday', error?.errors?.birthday)
        setFieldError('employee.role', error?.errors?.role)
        setFieldError('employee.address', error?.errors?.street)
        return
    }
})
</script>