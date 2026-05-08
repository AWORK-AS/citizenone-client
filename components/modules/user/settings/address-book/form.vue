<template>
    <div class="mt-6 max-w-xl space-y-4">
        <Alert type="danger" :text="props.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />

        <div class="space-y-1">
            <FormLabel for="contact_job_title_uuid" :label="$t('addressBook.form.contactJobTitle')" />
            <FormSelect id="contact_job_title_uuid" :options="state.options.contactJobTitles"
                v-model="form.contact_job_title_uuid" />
            <FormError :error="v$.contact_job_title_uuid.$errors[0]?.$message?.toString()" />
            <FormError :error="props.error?.errors?.contact_job_title_uuid?.[0]" />
        </div>

        <div class="space-y-1">
            <FormLabel for="company_name" :label="$t('addressBook.form.companyName')" />
            <FormTextField id="company_name" name="company_name"
                :placeholder="$t('addressBook.form.companyName')"
                v-model="form.company_name" />
            <FormError :error="props.error?.errors?.company_name?.[0]" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="space-y-1">
                <FormLabel for="firstname" :label="$t('addressBook.form.firstname')" />
                <FormTextField id="firstname" name="firstname"
                    :placeholder="$t('addressBook.form.firstname')"
                    v-model="form.firstname" />
                <FormError :error="v$.firstname.$errors[0]?.$message?.toString()" />
                <FormError :error="props.error?.errors?.firstname?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="lastname" :label="$t('addressBook.form.lastname')" />
                <FormTextField id="lastname" name="lastname"
                    :placeholder="$t('addressBook.form.lastname')"
                    v-model="form.lastname" />
                <FormError :error="props.error?.errors?.lastname?.[0]" />
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="space-y-1">
                <FormLabel for="email" :label="$t('addressBook.form.email')" />
                <FormTextField id="email" name="email"
                    :placeholder="$t('addressBook.form.email')"
                    v-model="form.email" />
                <FormError :error="props.error?.errors?.email?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="phone" :label="$t('addressBook.form.phone')" />
                <FormTextField id="phone" name="phone"
                    :placeholder="$t('addressBook.form.phone')"
                    v-model="form.phone" />
                <FormError :error="props.error?.errors?.phone?.[0]" />
            </div>
        </div>

        <div class="space-y-1">
            <FormLabel for="street" :label="$t('addressBook.form.street')" />
            <FormTextField id="street" name="street"
                :placeholder="$t('addressBook.form.street')"
                v-model="form.street" />
            <FormError :error="props.error?.errors?.street?.[0]" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="space-y-1">
                <FormLabel for="region" :label="$t('addressBook.form.region')" />
                <FormSelect id="region" :options="state.options.regions"
                    v-model="form.region_uuid" @change="onRegionChange" />
                <FormError :error="props.error?.errors?.region_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="municipality" :label="$t('addressBook.form.municipality')" />
                <FormSelect id="municipality" :options="state.options.municipalities"
                    v-model="form.municipality_uuid" @change="onMunicipalityChange" />
                <FormError :error="props.error?.errors?.municipality_uuid?.[0]" />
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="space-y-1">
                <FormLabel for="city" :label="$t('addressBook.form.city')" />
                <FormSelect id="city" :options="state.options.cities" v-model="form.city_uuid" />
                <FormError :error="props.error?.errors?.city_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="post_code" :label="$t('addressBook.form.postCode')" />
                <FormTextField id="post_code" name="post_code"
                    :placeholder="$t('addressBook.form.postCode')"
                    v-model="form.post_code" />
                <FormError :error="props.error?.errors?.post_code?.[0]" />
            </div>
        </div>

        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormButton buttonStyle="cancel" type="button" @click="emit('closeModal')">
                {{ $t('cancel') }}
            </FormButton>
            <FormButton buttonStyle="primary" type="button" @click="submit">
                {{ props.formType === 'create' ? $t('save') : $t('update') }}
            </FormButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { contactJobTitlesService } from '@/components/api/user/ContactJobTitlesService'
import { regionService } from '@/components/api/user/RegionService'
import { municipalityService } from '@/components/api/user/MunicipalityService'
import { cityService } from '@/components/api/user/CityService'
import { useVuelidate } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const language = useI18n()
const { t } = useI18n()

const props = defineProps({
    formType: {
        type: String as () => 'create' | 'update',
        required: true,
    },
    selectedContact: {
        type: Object,
        default: () => ({}),
    },
    error: {
        type: Object as () => Error,
        default: () => ({}),
    },
})

const emit = defineEmits(['closeModal', 'submitForm'])

const form = reactive({
    contact_job_title_uuid: props.selectedContact?.contact_job_title?.uuid ?? '',
    firstname: props.selectedContact?.firstname ?? '',
    lastname: props.selectedContact?.lastname ?? '',
    email: props.selectedContact?.email ?? '',
    phone: props.selectedContact?.phone ?? '',
    street: props.selectedContact?.street ?? '',
    post_code: props.selectedContact?.post_code ?? '',
    company_name: props.selectedContact?.company_name ?? '',
    region_uuid: props.selectedContact?.region?.uuid ?? '',
    municipality_uuid: props.selectedContact?.municipality?.uuid ?? '',
    city_uuid: props.selectedContact?.city?.uuid ?? '',
})

const state = reactive({
    options: {
        contactJobTitles: [] as any[],
        regions: [] as any[],
        municipalities: [] as any[],
        cities: [] as any[],
    },
})

watch(() => props.selectedContact, async (newValue: any) => {
    if (!newValue?.uuid) return

    form.contact_job_title_uuid = newValue?.contact_job_title?.uuid ?? ''
    form.firstname = newValue?.firstname ?? ''
    form.lastname = newValue?.lastname ?? ''
    form.email = newValue?.email ?? ''
    form.phone = newValue?.phone ?? ''
    form.street = newValue?.street ?? ''
    form.post_code = newValue?.post_code ?? ''
    form.company_name = newValue?.company_name ?? ''
    form.region_uuid = newValue?.region?.uuid ?? ''

    if (form.region_uuid) {
        await fetchMunicipalities(form.region_uuid)
        form.municipality_uuid = newValue?.municipality?.uuid ?? ''

        if (form.municipality_uuid) {
            await fetchCities(form.municipality_uuid)
            form.city_uuid = newValue?.city?.uuid ?? ''
        }
    }
})

onMounted(async () => {
    await Promise.all([fetchContactJobTitles(), fetchRegions()])
    if (form.region_uuid) await fetchMunicipalities(form.region_uuid)
    if (form.municipality_uuid) await fetchCities(form.municipality_uuid)
})

async function fetchContactJobTitles() {
    try {
        const response = await contactJobTitlesService.getAllContactJobTitles({})
        if (response?.data) {
            state.options.contactJobTitles = response.data.map((item: any) => ({
                value: item.uuid,
                label: language.locale.value === 'en' ? item.en_title : item.dk_title,
            }))
        }
    } catch {}
}

async function fetchRegions() {
    try {
        const response = await regionService.getAllRegions()
        if (response?.data) {
            state.options.regions = response.data.map((item: any) => ({
                value: item.uuid,
                label: item.name,
            }))
        }
    } catch {}
}

async function fetchMunicipalities(regionUuid: string) {
    try {
        const response = await municipalityService.getAllMunicipalitiesPerRegion({ region_uuid: regionUuid })
        if (response?.data) {
            state.options.municipalities = response.data.map((item: any) => ({
                value: item.uuid,
                label: item.name,
            }))
        }
    } catch {}
}

async function fetchCities(municipalityUuid: string) {
    try {
        const response = await cityService.getAllCities({ municipality_uuid: municipalityUuid })
        if (response?.data) {
            state.options.cities = response.data.map((item: any) => ({
                value: item.uuid,
                label: item.name,
            }))
        }
    } catch {}
}

function onRegionChange(regionUuid: string) {
    form.municipality_uuid = ''
    form.city_uuid = ''
    state.options.municipalities = []
    state.options.cities = []
    if (regionUuid) fetchMunicipalities(regionUuid)
}

function onMunicipalityChange(municipalityUuid: string) {
    form.city_uuid = ''
    state.options.cities = []
    if (municipalityUuid) fetchCities(municipalityUuid)
}

const rules = computed(() => ({
    contact_job_title_uuid: {
        required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
    },
    firstname: {
        required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
    },
}))

const v$ = useVuelidate(rules, form)

function submit() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', { ...form })
    }
}
</script>
