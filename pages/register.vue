<template>

    <Head>
        <Title>Register - {{ runtimeConfig?.public?.appName }}</Title>
    </Head>

    <LoadingSpinner :isActive="state.isPageLoading">
        <div class="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div class="sm:mx-auto sm:w-full sm:max-w-md">
                <Logo @click="navigateTo('/')" class="mx-auto" />
            </div>

            <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-3xl">
                <div class="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
                    <form class="mt-5 space-y-3" method="POST" @submit.prevent="register">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error && state.error.length > 0 || state.error?.message" />
                        <h3 class="font-medium">
                            {{ $t('register.form.register') }}
                        </h3>
                        <div class="space-y-1">
                            <FormLabel for="country" :label="$t('register.form.country')" />
                            <FormSelect id="country" :options="state.options.countries"
                                v-model="state.formRegister.country" @change="changeSelectedRegion" />
                            <FormError :error="v$?.formRegister?.country?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.country_id?.[0]" />
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="firstname" :label="$t('register.form.firstname')" />
                                <FormTextField id="firstname" name="firstname"
                                    :placeholder="$t('register.form.firstname')"
                                    v-model="state.formRegister.firstname" />
                                <FormError :error="v$?.formRegister?.firstname?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.firstname?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="lastname" :label="$t('register.form.lastname')" />
                                <FormTextField id="lastname" name="lastname" :placeholder="$t('register.form.lastname')"
                                    v-model="state.formRegister.lastname" />
                                <FormError :error="v$?.formRegister?.lastname?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.lastname?.[0]" />
                            </div>
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="email" :label="$t('register.form.emailAddress')" />
                            <FormTextField id="email" name="email" :placeholder="$t('register.form.emailAddress')"
                                v-model="state.formRegister.email" />
                            <FormError :error="v$?.formRegister?.email?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.email?.[0]" />
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="password" :label="$t('register.form.password')" />
                                <FormPasswordField id="password" name="password"
                                    :placeholder="$t('register.form.password')" v-model="state.formRegister.password" />
                                <FormError :error="v$?.formRegister?.password?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.password?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="confirm_password" :label="$t('register.form.confirmPassword')" />
                                <FormPasswordField id="confirm_password" name="confirm_password"
                                    :placeholder="$t('register.form.confirmPassword')"
                                    v-model="state.formRegister.confirm_password" />
                                <FormError
                                    :error="v$?.formRegister?.confirm_password?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.confirm_password?.[0]" />
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="phone" :label="$t('register.form.phone')" />
                                <FormTextField id="phone" name="phone" :placeholder="$t('register.form.phone')"
                                    v-model="state.formRegister.phone" />
                                <FormError :error="v$?.formRegister?.phone?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.phone?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="birthday" :label="$t('register.form.birthday')" />
                                <FormDateField id="birthday" name="birthday" :placeholder="$t('register.form.birthday')"
                                    v-model="state.formRegister.birthday" />
                                <FormError :error="v$?.formRegister?.birthday?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.birthday?.[0]" />
                            </div>
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="street" :label="$t('register.form.street')" />
                            <FormTextField id="street" name="street" :placeholder="$t('register.form.street')"
                                v-model="state.formRegister.street" />
                            <FormError :error="v$?.formRegister?.street?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.street?.[0]" />
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="region" :label="$t('register.form.region')" />
                                <FormSelect id="region" :options="state.options.regions"
                                    v-model="state.formRegister.region" @change="changeSelectedRegion" />
                                <FormError :error="v$?.formRegister?.region?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.region_id?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="municipality" :label="$t('register.form.municipality')" />
                                <FormSelect id="municipality" :options="state.options.municipalities"
                                    v-model="state.formRegister.municipality" @change="changeSelectedMunicipality" />
                                <FormError :error="v$?.formRegister?.municipality?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.municipality_id?.[0]" />
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="city" :label="$t('register.form.city')" />
                                <FormSelect id="city" :options="state.options.cities"
                                    v-model="state.formRegister.city" />
                                <FormError :error="v$?.formRegister?.city?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.city_id?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="post_code" :label="$t('register.form.postCode')" />
                                <FormTextField id="post_code" name="post_code"
                                    :placeholder="$t('register.form.postCode')"
                                    v-model="state.formRegister.post_code" />
                                <FormError :error="v$?.formRegister?.post_code?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.post_code?.[0]" />
                            </div>
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="company_name" :label="$t('register.form.companyName')" />
                            <FormTextField id="company_name" name="company_name"
                                :placeholder="$t('register.form.companyName')"
                                v-model="state.formRegister.company_name" />
                            <FormError :error="v$?.formRegister?.company_name?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.company_name?.[0]" />
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="company_cvr" :label="$t('register.form.companyCVR')" />
                                <FormTextField id="company_cvr" name="company_cvr"
                                    :placeholder="$t('register.form.companyCVR')"
                                    v-model="state.formRegister.company_cvr" />
                                <FormError :error="v$?.formRegister?.company_cvr?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.company_cvr?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="company_website" :label="$t('register.form.companyWebsite')" />
                                <FormTextField id="company_website" name="company_website"
                                    :placeholder="$t('register.form.companyWebsite')"
                                    v-model="state.formRegister.company_website" />
                                <FormError
                                    :error="v$?.formRegister?.company_website?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.company_website?.[0]" />
                            </div>
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="company_address" :label="$t('register.form.companyAddress')" />
                            <FormTextField id="company_address" name="company_address"
                                :placeholder="$t('register.form.companyAddress')"
                                v-model="state.formRegister.company_address" />
                            <FormError :error="v$?.formRegister?.company_address?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.company_address?.[0]" />
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="company_region" :label="$t('register.form.companyRegion')" />
                                <FormSelect id="company_region" :options="state.options.regions"
                                    v-model="state.formRegister.company_region" @change="changeSelectedCompanyRegion" />
                                <FormError :error="v$?.formRegister?.company_region?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.company_region_id?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="company_municipality"
                                    :label="$t('register.form.companyMunicipality')" />
                                <FormSelect id="company_municipality" :options="state.options.companyMunicipalities"
                                    v-model="state.formRegister.company_municipality"
                                    @change="changeSelectedCompanyMunicipality" />
                                <FormError
                                    :error="v$?.formRegister?.company_municipality?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.company_municipality_id?.[0]" />
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="company_city" :label="$t('register.form.companyCity')" />
                                <FormSelect id="company_city" :options="state.options.companyCities"
                                    v-model="state.formRegister.company_city" />
                                <FormError :error="v$?.formRegister?.company_city?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.company_city_id?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="company_post_code" :label="$t('register.form.companyPostCode')" />
                                <FormTextField id="company_post_code" name="company_post_code"
                                    :placeholder="$t('register.form.companyPostCode')"
                                    v-model="state.formRegister.company_post_code" />
                                <FormError
                                    :error="v$?.formRegister?.company_post_code?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.company_post_code?.[0]" />
                            </div>
                        </div>
                        <div class="space-y-1">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <input id="iAcceptTAA" name="iAcceptTAA" type="checkbox"
                                        class="w-5 h-5 accent-primary cursor-pointer focus:ring-transparent" />
                                    <label for="iAcceptTAA"
                                        class="ml-3 block text-sm leading-6 text-gray-700 cursor-pointer">
                                        {{ $t('register.form.iAcceptTAA') }}
                                    </label>
                                </div>
                            </div>
                            <span
                                v-if="!v$?.formRegister?.agreeToTerms?.required && v$?.formRegister?.agreeToTerms?.$error">
                                You must agree to the terms and conditions
                            </span>
                        </div>
                        <div>
                            <FormButton type="submit" buttonStyle="primary" class="w-full">
                                {{ $t('register.form.register') }}
                            </FormButton>
                        </div>
                        <p class="text-center text-sm leading-6 text-gray-500 cursor-pointer" @click="navigateTo('/')">
                            {{ $t('register.form.alreadyHaveAnAcoount') }}?
                            {{ ' ' }}
                            <a class="text-primary hover:text-primary-800 cursor-pointer">
                                {{ $t('register.form.loginHere') }}
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { authService } from '@/components/api/AuthService'
import { geolocationService } from '@/components/api/GeolocationService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers, minLength, sameAs } from '@vuelidate/validators'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const language = useI18n()
const { t } = useI18n()

// Set language
language.locale.value = userStore.getLanguage

const state = reactive({
    error: [],
    formRegister: {
        country: '',
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirm_password: '',
        phone: '',
        birthday: '',
        street: '',
        region: '',
        municipality: '',
        city: '',
        post_code: '',
        company_name: '',
        company_cvr: '',
        company_website: '',
        company_address: '',
        company_region: '',
        company_municipality: '',
        company_city: '',
        company_post_code: '',
        agreeToTerms: false
    },
    isPageLoading: false,
    options: {
        companyCities: [],
        companyMunicipalities: [],
        cities: [],
        countries: [],
        municipalities: [],
        regions: [],
    }
})

const rules = computed(() => {
    return {
        formRegister: {
            country: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            firstname: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            lastname: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            email: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            password: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                minLength: helpers.withMessage(`${t('alert.resetPassword.required8Characters')}.`, minLength(8))
            },
            confirm_password: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                sameAsPassword: helpers.withMessage(`${t('alert.resetPassword.confirmPasswordNotTheSame')}.`, sameAs(state.formRegister.password)),
            },
            phone: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            birthday: {
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
            company_name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            company_cvr: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            company_website: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            company_address: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            company_region: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            company_municipality: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            company_city: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            company_post_code: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            agreeToTerms: { required },
        }
    }
})
const v$ = useVuelidate(rules, state)

onMounted(() => {
    fetchCountries()
    fetchRegions()
})

async function fetchCountries() {
    state.isPageLoading = true
    try {
        const response = await geolocationService.getAllCountries()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.id,
                    label: item.name,
                })
            )
            state.options.countries = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchRegions() {
    state.isPageLoading = true
    try {
        const response = await geolocationService.getAllRegions()
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
    state.isPageLoading = false
}

async function fetchMunicipalities(regionId: any) {
    state.isPageLoading = true
    try {
        const params = {
            region_id: regionId
        }
        const response = await geolocationService.getAllMunicipalities(params)
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
    state.isPageLoading = false
}

async function fetchCompanyMunicipalities(regionId: any) {
    state.isPageLoading = true
    try {
        const params = {
            region_id: regionId
        }
        const response = await geolocationService.getAllMunicipalities(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.id,
                    label: item.name,
                })
            )
            state.options.companyMunicipalities = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchCities(municipalityId: any) {
    state.isPageLoading = true
    try {
        const params = {
            municipality_id: municipalityId
        }
        const response = await geolocationService.getAllCities(params)
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
    state.isPageLoading = false
}

async function fetchCompanyCities(municipalityId: any) {
    state.isPageLoading = true
    try {
        const params = {
            municipality_id: municipalityId
        }
        const response = await geolocationService.getAllCities(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.id,
                    label: item.name,
                })
            )
            state.options.companyCities = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function changeSelectedRegion(regionId: number) {
    fetchMunicipalities(regionId)
}

function changeSelectedMunicipality(municipalityId: number) {
    fetchCities(municipalityId)
}

function changeSelectedCompanyRegion(regionId: number) {
    fetchCompanyMunicipalities(regionId)
}

function changeSelectedCompanyMunicipality(municipalityId: number) {
    fetchCompanyCities(municipalityId)
}

async function register() {
    state.error = []
    v$.value.$validate()
    if (!v$.value.$error) {
        state.isPageLoading = true
        try {
            const params = {
                country_id: state.formRegister.country,
                firstname: state.formRegister.firstname,
                lastname: state.formRegister.lastname,
                email: state.formRegister.email,
                password: state.formRegister.password,
                phone: state.formRegister.phone,
                birthday: state.formRegister.birthday,
                street: state.formRegister.street,
                region_id: state.formRegister.region,
                municipality_id: state.formRegister.municipality,
                city_id: state.formRegister.city,
                post_code: state.formRegister.post_code,
                company_name: state.formRegister.company_name,
                company_cvr: state.formRegister.company_cvr,
                company_website: state.formRegister.company_website,
                company_street: state.formRegister.company_address,
                company_region_id: state.formRegister.company_region,
                company_municipality_id: state.formRegister.company_municipality,
                company_city_id: state.formRegister.company_city,
                company_post_code: state.formRegister.company_post_code,
            }
            const response = await authService.register(params)
            if (response.data) {
                successAlert(`${t('alert.success')}!`, `${t('alert.accountSuccessfullyCreated')}.`)
                navigateTo('/')
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}

function successAlert(title: string, message: string) {
    notify({
        title: title,
        text: message,
        type: 'success',
    })
}
</script>