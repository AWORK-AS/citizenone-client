<template>
    <div>
        <Modal size="lg" :title="$t('citizens.caseWorker.newCaseWorker')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()" id="formContact">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <LoadingSpinner :isActive="state.isPageLoading">
                            <div class="space-y-3">
                                <div class="space-y-1">
                                    <FormLabel for="companyName" :label="$t('citizens.contacts.form.companyName')" />
                                    <FormTextField id="companyName" name="companyName"
                                        :placeholder="$t('citizens.contacts.form.companyName')"
                                        v-model="state.formContact.company_name" />
                                    <FormError
                                        :error="v$?.formContact?.company_name?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.company_name?.[0]" />
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div class="space-y-1">
                                        <FormLabel for="firstname" :label="$t('citizens.contacts.form.firstname')" />
                                        <FormTextField id="firstname" name="firstname"
                                            :placeholder="$t('citizens.contacts.form.firstname')"
                                            v-model="state.formContact.firstname" />
                                        <FormError
                                            :error="v$?.formContact?.firstname?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.firstname?.[0]" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel for="lastname" :label="$t('citizens.contacts.form.lastname')" />
                                        <FormTextField id="lastname" name="lastname"
                                            :placeholder="$t('citizens.contacts.form.lastname')"
                                            v-model="state.formContact.lastname" />
                                        <FormError
                                            :error="v$?.formContact?.lastname?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.lastname?.[0]" />
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div class="space-y-1">
                                        <FormLabel for="email" :label="$t('citizens.contacts.form.email')" />
                                        <FormTextField id="email" name="email"
                                            :placeholder="$t('citizens.contacts.form.email')"
                                            v-model="state.formContact.email" />
                                        <FormError :error="v$?.formContact?.email?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.email?.[0]" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel for="phone" :label="$t('citizens.contacts.form.phone')" />
                                        <FormTextField id="phone" name="phone"
                                            :placeholder="$t('citizens.contacts.form.phone')"
                                            v-model="state.formContact.phone" />
                                        <FormError :error="v$?.formContact?.phone?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.phone?.[0]" />
                                    </div>
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="street" :label="$t('citizens.contacts.form.street')" />
                                    <FormTextField id="street" name="street"
                                        :placeholder="$t('citizens.contacts.form.street')"
                                        v-model="state.formContact.street" />
                                    <FormError :error="v$?.formContact?.street?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.street?.[0]" />
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div class="space-y-1">
                                        <FormLabel for="region" :label="$t('citizens.contacts.form.region')" />
                                        <FormSelect id="region" :options="state.options.regions"
                                            v-model="state.formContact.region" @change="changeSelectedRegion" />
                                        <FormError :error="v$?.formContact?.region?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.region_uuid?.[0]" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel for="municipality"
                                            :label="$t('citizens.contacts.form.municipality')" />
                                        <FormSelect id="municipality" :options="state.options.municipalities"
                                            v-model="state.formContact.municipality"
                                            @change="changeSelectedMunicipality" />
                                        <FormError
                                            :error="v$?.formContact?.municipality?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.municipality_uuid?.[0]" />
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div class="space-y-1">
                                        <FormLabel for="city" :label="$t('citizens.contacts.form.city')" />
                                        <FormSelect id="city" :options="state.options.cities"
                                            v-model="state.formContact.city" />
                                        <FormError :error="v$?.formContact?.city?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.city_uuid?.[0]" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel for="post_code" :label="$t('citizens.contacts.form.postCode')" />
                                        <FormTextField id="post_code" name="post_code"
                                            :placeholder="$t('citizens.form.postCode')"
                                            v-model="state.formContact.post_code" />
                                        <FormError
                                            :error="v$?.formContact?.post_code?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.post_code?.[0]" />
                                    </div>
                                </div>
                            </div>
                            <div class="mt-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormButton type="button" buttonStyle="cancel" @click="closeModal()">
                                        {{ $t('cancel') }}
                                    </FormButton>
                                    <FormButton type="submit" buttonStyle="primary" class="w-full">
                                        {{ $t('save') }}
                                    </FormButton>
                                </div>
                            </div>
                        </LoadingSpinner>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { citizenContactService } from '@/components/api/user/CitizenContactService'
import { regionService } from '@/components/api/user/RegionService'
import { municipalityService } from '@/components/api/user/MunicipalityService'
import { cityService } from '@/components/api/user/CityService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const emit = defineEmits(['close', 'refreshCaseworkers'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formContact: {
        uuid: '',
        company_name: '',
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
    options: {
        cities: [],
        municipalities: [],
        regions: [],
    },
})

function closeModal() {
    emit('close')
}

function refreshCaseworkers() {
    emit('refreshCaseworkers')
}

onMounted(() => {
    fetchRegions()
    fetchMunicipalitiesPerRegion()
    fetchCities()
})

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

async function fetchMunicipalitiesPerRegion(regionUuid: any = null) {
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

async function fetchCities(municipalityUuid: any = null) {
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

const rules = computed(() => {
    return {
        formContact: {
            firstname: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        saveContact()
    }
}

async function saveContact() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            title: 'case_manager',
            company_name: state.formContact.company_name,
            firstname: state.formContact.firstname,
            lastname: state.formContact.lastname,
            email: state.formContact.email,
            phone: state.formContact.phone,
            street: state.formContact.street,
            region_uuid: state.formContact.region,
            municipality_uuid: state.formContact.municipality,
            city_uuid: state.formContact.city,
            post_code: state.formContact.post_code,
        }
        const response = await citizenContactService.saveContact(params)
        if (response?.data) {
            refreshCaseworkers()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.caseWorker.alert.newCaseWorkerSuccessfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>