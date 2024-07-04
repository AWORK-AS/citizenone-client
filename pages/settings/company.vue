<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('settings.settings') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('settings.settings') }}</template>

            <ModulesSettingsTab />

            <LoadingSpinner :isActive="state.isPageLoading">
                <form @submit.prevent="submitForm()" class="mt-6 max-w-3xl">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error && state.error.length > 0 || state.error?.message" />
                    <div class="grid grid-cols-1 gap-3">
                        <div class="space-y-1">
                            <FormLabel for="name" :label="$t('settings.company.form.companyName')" />
                            <FormTextField id="name" name="name" :placeholder="$t('settings.company.form.companyName')"
                                v-model="state.formCompany.name" />
                            <FormError :error="v$?.formCompany?.name?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.name?.[0]" />
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="cvr" :label="$t('settings.company.form.cvr')" />
                                <FormTextField id="cvr" name="cvr" :placeholder="$t('settings.company.form.cvr')"
                                    v-model="state.formCompany.cvr" />
                                <FormError :error="v$?.formCompany?.cvr?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.cvr?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="website" :label="$t('settings.company.form.website')" />
                                <FormTextField id="website" name="website"
                                    :placeholder="$t('settings.company.form.website')"
                                    v-model="state.formCompany.website" />
                                <FormError :error="v$?.formCompany?.website?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.website?.[0]" />
                            </div>
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="street" :label="$t('citizens.form.street')" />
                            <FormTextField id="street" name="street" :placeholder="$t('citizens.form.street')"
                                v-model="state.formCompany.street" />
                            <FormError :error="v$?.formCompany?.street?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.street?.[0]" />
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="region" :label="$t('citizens.form.region')" />
                                <FormSelect id="region" :options="state.options.regions"
                                    v-model="state.formCompany.region" @change="changeSelectedRegion" />
                                <FormError :error="v$?.formCompany?.region?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.region_id?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="municipality" :label="$t('citizens.form.municipality')" />
                                <FormSelect id="municipality" :options="state.options.municipalities"
                                    v-model="state.formCompany.municipality" @change="changeSelectedMunicipality" />
                                <FormError :error="v$?.formCompany?.municipality?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.municipality_id?.[0]" />
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="city" :label="$t('citizens.form.city')" />
                                <FormSelect id="city" :options="state.options.cities"
                                    v-model="state.formCompany.city" />
                                <FormError :error="v$?.formCompany?.city?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.city_id?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="post_code" :label="$t('citizens.form.postCode')" />
                                <FormTextField id="post_code" name="post_code"
                                    :placeholder="$t('citizens.form.postCode')" v-model="state.formCompany.post_code" />
                                <FormError :error="v$?.formCompany?.post_code?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.post_code?.[0]" />
                            </div>
                        </div>
                    </div>
                    <div class="mt-6">
                        <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                            {{ $t('save') }}
                        </FormButton>
                    </div>
                </form>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { userService } from "@/components/api/UserService";
import { regionService } from '@/components/api/RegionService'
import { municipalityService } from '@/components/api/MunicipalityService'
import { cityService } from '@/components/api/CityService'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const { t } = useI18n()

const state = reactive({
    error: [],
    formCompany: {
        name: '',
        cvr: '',
        website: '',
        street: '',
        region: '',
        municipality: '',
        city: '',
        post_code: '',
    },
    isPageLoading: false,
    options: {
        cities: [],
        municipalities: [],
        regions: [],
    }
})

const rules = computed(() => {
    return {
        formCompany: {
            name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            cvr: {
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

onMounted(() => {
    fetchRegions()
})

watch(() => userStore.getUser, (newValue: any) => {
    if (newValue != null) {
        state.formCompany = {
            name: newValue?.company?.name,
            cvr: newValue?.company?.cvr,
            website: newValue?.company?.website,
            street: newValue?.company?.company_address?.street,
            region: newValue?.company?.company_address?.region_id,
            municipality: newValue?.company?.company_address?.municipality_id,
            city: newValue?.company?.company_address?.city_id,
            post_code: newValue?.company?.company_address?.post_code,
        }
        fetchMunicipalities(newValue?.company?.company_address?.region_id)
        fetchCities(newValue?.company?.company_address?.municipality_id)
    }
})

async function fetchRegions() {
    state.isPageLoading = true
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
    state.isPageLoading = false
}

async function fetchMunicipalities(regionId: any) {
    state.isPageLoading = true
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
    state.isPageLoading = false
}

async function fetchCities(municipalityId: any) {
    state.isPageLoading = true
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
    state.isPageLoading = false
}

function changeSelectedRegion(regionId: number) {
    fetchMunicipalities(regionId)
}

function changeSelectedMunicipality(municipalityId: number) {
    fetchCities(municipalityId)
}

const v$ = useVuelidate(rules, state)

async function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        state.error = []
        state.isPageLoading = true
        try {
            const params = {
                name: state.formCompany.name,
                cvr: state.formCompany.cvr,
                website: state.formCompany.website,
                street: state.formCompany.street,
                region_id: state.formCompany.region,
                municipality_id: state.formCompany.municipality,
                city_id: state.formCompany.city,
                post_code: state.formCompany.post_code,
            }
            const response = await userService.updateCompany(params)
            if (response.data) {
                successAlert(`${t('alert.success')}!`, `${t('settings.company.form.alert.successfullyUpdated')}.`)
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