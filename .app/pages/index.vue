<template>
    <div>

        <Head>
            <Title>Login - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <div class="dark:bg-muted-800 flex min-h-screen bg-white">
            <div
                class="bg-muted-100 dark:bg-muted-900 relative hidden w-0 flex-1 items-center justify-center lg:flex lg:w-3/5">
                <div class="mx-auto flex size-full max-w-4xl items-center justify-center">
                    <img class="mx-auto max-w-xl" src="/img/illustrations/station.svg" alt="" width="619" height="594">
                </div>
            </div>
            <div class="relative flex flex-1 flex-col justify-center px-6 py-12 lg:w-2/5 lg:flex-none">
                <div class="dark:bg-muted-800 relative mx-auto w-full max-w-sm bg-white">
                    <div class="flex w-full items-center justify-between mt-6 mb-2">
                        <Logo @click="navigateTo('/')" class="cursor-pointer" />
                        <BaseThemeToggle />
                    </div>
                    <div>
                        <BaseParagraph size="sm" class="text-muted-400 mb-6">
                            Sign in to your account
                        </BaseParagraph>
                    </div>

                    <BaseMessage color="danger" icon v-if="errorMessage" :message="errorMessage" />
                    <form method="POST" action="" @submit.prevent="login" class="mt-6" novalidate>
                        <div class="mt-5">
                            <div>
                                <div class="space-y-4">
                                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="email">
                                        <BaseInput :model-value="field.value" :error="errorMessage"
                                            :disabled="isSubmitting" type="email" icon="ph:envelope"
                                            label="Email address" placeholder="Email address" autocomplete="email"
                                            :classes="{
                                                input: 'h-12',
                                            }" @update:model-value="handleChange" @blur="handleBlur" />
                                    </Field>

                                    <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="password">
                                        <BaseInput :model-value="field.value" :error="errorMessage"
                                            :disabled="isSubmitting" type="password" icon="ph:lock-duotone"
                                            label="Password" placeholder="Password" autocomplete="current-password"
                                            :classes="{
                                                input: 'h-12',
                                            }" @update:model-value="handleChange" @blur="handleBlur" />
                                    </Field>
                                </div>

                                <div class="mt-6 flex items-center justify-between">
                                    <Field v-slot="{ field, handleChange, handleBlur }" name="trustDevice">
                                        <BaseCheckbox :model-value="field.value" :disabled="isSubmitting"
                                            shape="rounded" label="Remember me" color="primary"
                                            @update:model-value="handleChange" @blur="handleBlur" />
                                    </Field>

                                    <div class="text-xs leading-5">
                                        <NuxtLink to="/"
                                            class="text-primary-600 hover:text-primary-500 font-sans font-medium underline-offset-4 transition duration-150 ease-in-out hover:underline">
                                            Forgot your password
                                        </NuxtLink>
                                    </div>
                                </div>

                                <!--Submit-->
                                <div class="mt-6">
                                    <div class="block w-full rounded-md shadow-sm">
                                        <BaseButton :disabled="isSubmitting" :loading="isSubmitting" type="submit"
                                            color="primary" class="!h-11 w-full">
                                            Login
                                        </BaseButton>
                                    </div>
                                </div>
                            </div>

                            <!--No account link-->
                            <p class="text-muted-400 mt-4 flex justify-between font-sans text-xs leading-5">
                                <span>Don't have an account?</span>
                                <NuxtLink to="/"
                                    class="text-primary-600 hover:text-primary-500 font-medium underline-offset-4 transition duration-150 ease-in-out hover:underline">
                                    Register here
                                </NuxtLink>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { authService } from '@/components/api/AuthService'
import { toTypedSchema } from '@vee-validate/zod'
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'
import { useUserStore } from '@/store/user'

definePageMeta({
    layout: 'empty',
    title: 'Login',
})

const userStore = useUserStore()
const runtimeConfig = useRuntimeConfig()

const VALIDATION_TEXT = {
    EMAIL_REQUIRED: 'A valid email is required',
    PASSWORD_REQUIRED: 'Password field is required',
}

const zodSchema = z.object({
    email: z.string().email(VALIDATION_TEXT.EMAIL_REQUIRED),
    password: z.string().min(1, VALIDATION_TEXT.PASSWORD_REQUIRED),
    trustDevice: z.boolean(),
})
type FormInput = z.infer<typeof zodSchema>
const validationSchema = toTypedSchema(zodSchema)
const initialValues = computed<FormInput>(() => ({
    email: '',
    password: '',
    trustDevice: false,
}))

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

let errorMessage = ''

const login = handleSubmit(async (values) => {
    errorMessage = ''
    try {
        const response = await authService.login({
            email: values.email,
            password: values.password,
        })
        if (response) {
            userStore.setUser(response?.data?.user)
            localStorage.setItem("_token", response?.data?.token)
            navigateTo('/dashboard')
        }
    } catch (error: any) {
        errorMessage = error.message
        setFieldError('email', error?.errors?.email)
        setFieldError('password', error?.errors?.password)
        return
    }
})
</script>