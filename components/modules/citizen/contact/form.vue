<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <LoadingSpinner :isActive="state.isPageLoading">
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="title" :label="$t('citizens.contacts.form.title')" />
                    <FormSelect id="title" :options="state.options.titles" v-model="state.formContact.title" />
                    <FormError :error="v$?.formContact?.title?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.title?.[0]" />
                </div>
                <div class="space-y-1" v-if="state.formContact.title === 'our_contact_person'">
                    <FormLabel for="employees" :label="$t('citizens.contacts.form.employees')" />
                    <FormSelectMultiple id="employees" :options="state.options.employees"
                        v-model="state.formContact.employees" />
                    <FormError :error="v$?.formContact?.employees?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.employees_uuid?.[0]" />
                </div>
                <div class="space-y-1" v-if="state.formContact.title === 'our_contact_person'">
                    <div class="w-fit flex cursor-pointer"
                        @click="state.formContact.is_mailable = !state.formContact.is_mailable">
                        <FormCheckbox :value="state.formContact.is_mailable" />
                        <div>
                            <p>{{ $t('citizens.contacts.form.canReceiveEmails') }}</p>
                            <ul class="list-disc pl-4">
                                <li>{{ $t('citizens.contacts.form.nursingAreas') }}</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="firstname" :label="$t('citizens.contacts.form.firstname')" />
                        <FormTextField id="firstname" name="firstname"
                            :placeholder="$t('citizens.contacts.form.firstname')"
                            v-model="state.formContact.firstname" />
                        <FormError :error="v$?.formContact?.firstname?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.firstname?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="lastname" :label="$t('citizens.contacts.form.lastname')" />
                        <FormTextField id="lastname" name="lastname"
                            :placeholder="$t('citizens.contacts.form.lastname')" v-model="state.formContact.lastname" />
                        <FormError :error="v$?.formContact?.lastname?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.lastname?.[0]" />
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="email" :label="$t('citizens.contacts.form.email')" />
                        <FormTextField id="email" name="email" :placeholder="$t('citizens.contacts.form.email')"
                            v-model="state.formContact.email" />
                        <FormError :error="v$?.formContact?.email?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.email?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="phone" :label="$t('citizens.contacts.form.phone')" />
                        <FormTextField id="phone" name="phone" :placeholder="$t('citizens.contacts.form.phone')"
                            v-model="state.formContact.phone" />
                        <FormError :error="v$?.formContact?.phone?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.phone?.[0]" />
                    </div>
                </div>
                <div class="space-y-1">
                    <FormLabel for="street" :label="$t('citizens.contacts.form.street')" />
                    <FormTextField id="street" name="street" :placeholder="$t('citizens.contacts.form.street')"
                        v-model="state.formContact.street" />
                    <FormError :error="v$?.formContact?.street?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.street?.[0]" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="region" :label="$t('citizens.contacts.form.region')" />
                        <FormSelect id="region" :options="state.options.regions" v-model="state.formContact.region"
                            @change="changeSelectedRegion" />
                        <FormError :error="v$?.formContact?.region?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.region_uuid?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="municipality" :label="$t('citizens.contacts.form.municipality')" />
                        <FormSelect id="municipality" :options="state.options.municipalities"
                            v-model="state.formContact.municipality" @change="changeSelectedMunicipality" />
                        <FormError :error="v$?.formContact?.municipality?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.municipality_uuid?.[0]" />
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="city" :label="$t('citizens.contacts.form.city')" />
                        <FormSelect id="city" :options="state.options.cities" v-model="state.formContact.city" />
                        <FormError :error="v$?.formContact?.city?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.city_uuid?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="post_code" :label="$t('citizens.contacts.form.postCode')" />
                        <FormTextField id="post_code" name="post_code" :placeholder="$t('citizens.form.postCode')"
                            v-model="state.formContact.post_code" />
                        <FormError :error="v$?.formContact?.post_code?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.post_code?.[0]" />
                    </div>
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
        </LoadingSpinner>
    </form>
</template>

<script setup lang="ts">
import { regionService } from '@/components/api/RegionService'
import { municipalityService } from '@/components/api/MunicipalityService'
import { cityService } from '@/components/api/CityService'
import { userService } from '@/components/api/UserService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedContact: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formContact: {
        id: '',
        uuid: '',
        title: '',
        employees: [],
        is_mailable: false,
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        street: '',
        region: '',
        municipality: '',
        city: '',
        post_code: '',
    },
    isPageLoading: false,
    options: {
        cities: [],
        employees: [],
        municipalities: [],
        regions: [],
        titles: [
            { value: 'case_manager', label: `${t('citizens.contacts.titles.caseManager')}` },
            { value: 'dentist', label: `${t('citizens.contacts.titles.dentist')}` },
            { value: 'doctor', label: `${t('citizens.contacts.titles.doctor')}` },
            { value: 'external_contact', label: `${t('citizens.contacts.titles.externalContact')}` },
            { value: 'our_contact_person', label: `${t('citizens.contacts.titles.ourContactPerson')}` },
            { value: 'relatives', label: `${t('citizens.contacts.titles.relatives')}` },
        ]
    }
})

onMounted(() => {
    fetchRegions()
    fetchMunicipalitiesPerRegion(props.selectedContact?.region?.uuid)
    fetchCities(props.selectedContact?.municipality?.uuid)
    state.formContact = {
        id: props.selectedContact?.id,
        uuid: props.selectedContact?.uuid,
        title: props.selectedContact?.title,
        employees: props.selectedContact?.employees,
        is_mailable: props.selectedContact?.is_mailable,
        firstname: props.selectedContact?.firstname,
        lastname: props.selectedContact?.lastname,
        email: props.selectedContact?.email,
        phone: props.selectedContact?.phone,
        street: props.selectedContact?.street,
        region: props.selectedContact?.region?.uuid,
        municipality: props.selectedContact?.municipality?.uuid,
        city: props.selectedContact?.city?.uuid,
        post_code: props.selectedContact?.post_code,
    }
})

watch(() => props.selectedContact, (newValue: any) => {
    fetchMunicipalitiesPerRegion(props.selectedContact?.region?.uuid)
    fetchCities(props.selectedContact?.municipality?.uuid)
    if (newValue != null) {
        state.formContact = {
            id: props.selectedContact?.id,
            uuid: props.selectedContact?.uuid,
            title: props.selectedContact?.title,
            employees: props.selectedContact?.employees,
            is_mailable: props.selectedContact?.is_mailable,
            firstname: props.selectedContact?.firstname,
            lastname: props.selectedContact?.lastname,
            email: props.selectedContact?.email,
            phone: props.selectedContact?.phone,
            street: props.selectedContact?.street,
            region: props.selectedContact?.region?.uuid,
            municipality: props.selectedContact?.municipality?.uuid,
            city: props.selectedContact?.city?.uuid,
            post_code: props.selectedContact?.post_code,
        }
    }
})

watch(() => state.formContact.title, (newValue: any) => {
    if (newValue === 'our_contact_person') {
        fetchAllUsers()
    }
})

const rules = computed(() => {
    return {
        formContact: {
            title: {
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
            phone: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            // street: {
            //     required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            // },
            // region: {
            //     required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            // },
            // municipality: {
            //     required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            // },
            // city: {
            //     required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            // },
            // post_code: {
            //     required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            // },
        },
    }
})

async function fetchAllUsers() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await userService.getAllUsers()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (user: any) => options.push({
                    value: user?.uuid,
                    label: user?.firstname + " " + user?.lastname,
                })
            )
            state.options.employees = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        if (!state.formContact.region) {
            state.formContact.municipality = ''
            state.formContact.city = ''
        }
        if (!state.formContact.municipality) {
            state.formContact.city = ''
        }
        emit('submitForm', state.formContact)
    }
}

async function fetchRegions() {
    state.error = {}
    state.isPageLoading = true
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
    state.isPageLoading = false
}

async function fetchMunicipalitiesPerRegion(regionUuid: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            region_uuid: regionUuid
        }
        const response = await municipalityService.getAllMunicipalitiesPerRegion(params)
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
    state.isPageLoading = false
}

async function fetchCities(municipalityUuid: any) {
    state.error = {}
    state.isPageLoading = true
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
    state.isPageLoading = false
}

function changeSelectedRegion(regionUuid: string) {
    if (regionUuid) {
        fetchMunicipalitiesPerRegion(regionUuid)
    }
}

function changeSelectedMunicipality(municipalityUuid: string) {
    if (municipalityUuid) {
        fetchCities(municipalityUuid)
    }
}
</script>