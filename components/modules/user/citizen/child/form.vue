<template>
    <form @submit.prevent="submitForm()" id="formChild">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <LoadingSpinner :isActive="state.isPageLoading">
            <div class="space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="firstname" :label="$t('children.form.firstname')" />
                        <FormTextField id="firstname" name="firstname" :placeholder="$t('children.form.firstname')"
                            v-model="state.formChild.firstname" />
                        <FormError :error="v$?.formChild?.firstname?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.firstname?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="lastname" :label="$t('children.form.lastname')" />
                        <FormTextField id="lastname" name="lastname" :placeholder="$t('children.form.lastname')"
                            v-model="state.formChild.lastname" />
                        <FormError :error="v$?.formChild?.lastname?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.lastname?.[0]" />
                    </div>
                </div>
                <div class="space-y-1">
                    <FormLabel for="gender" :label="$t('children.form.gender')" />
                    <FormSelect id="gender" :options="state.options.genders" v-model="state.formChild.gender" />
                    <FormError :error="v$?.formChild?.gender?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.gender?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="email" :label="$t('children.form.emailAddress')" />
                    <FormTextField id="email" name="email" :placeholder="$t('children.form.emailAddress')"
                        v-model="state.formChild.email" />
                    <FormError :error="v$?.formChild?.email?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.email?.[0]" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="social_security_number" :label="$t('children.form.cprNumber')" />
                        <FormTextField id="social_security_number" name="social_security_number"
                            :placeholder="$t('children.form.cprNumber')" :maxLength="10"
                            v-model="formattedSocialSecurityNumber" @input="updateSocialSecurityNumber" />
                        <FormError :error="v$?.formChild?.social_security_number?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.social_security_number?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="birthday" :label="$t('children.form.birthday')" />
                        <FormDateField id="birthday" name="birthday" :placeholder="$t('children.form.birthday')"
                            v-model="state.formChild.birthday" />
                        <FormError :error="v$?.formChild?.birthday?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.birthday?.[0]" />
                    </div>
                </div>
                <div class="space-y-1">
                    <FormLabel for="phone" :label="$t('children.form.phone')" />
                    <FormTextField id="phone" name="phone" :placeholder="$t('children.form.phone')"
                        v-model="state.formChild.phone" />
                    <FormError :error="v$?.formChild?.phone?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.phone?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="street" :label="$t('children.form.street')" />
                    <FormTextField id="street" name="street" :placeholder="$t('children.form.street')"
                        v-model="state.formChild.street" />
                    <FormError :error="v$?.formChild?.street?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.street?.[0]" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="region_uuid" :label="$t('children.form.region')" />
                        <FormSelect id="region_uuid" :options="state.options.regions"
                            v-model="state.formChild.region_uuid" @change="changeSelectedRegion" />
                        <FormError :error="v$?.formChild?.region_uuid?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.region_uuid?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="municipality_uuid" :label="$t('children.form.municipality')" />
                        <FormSelect id="municipality_uuid" :options="state.options.municipalitiesPerRegion"
                            v-model="state.formChild.municipality_uuid" />
                        <FormError :error="v$?.formChild?.municipality_uuid?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.municipality_uuid?.[0]" />
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="city" :label="$t('children.form.city')" />
                        <FormTextField id="city" name="city" :placeholder="$t('children.form.city')"
                            v-model="state.formChild.city" />
                        <FormError :error="v$?.formChild?.city?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.city?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="post_code" :label="$t('children.form.postCode')" />
                        <FormTextField id="post_code" name="post_code" :placeholder="$t('children.form.postCode')"
                            v-model="state.formChild.post_code" />
                        <FormError :error="v$?.formChild?.post_code?.$errors[0]?.$message.toString()" />
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
import { regionService } from '@/components/api/user/RegionService'
import { municipalityService } from '@/components/api/user/MunicipalityService'
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
    selectedChild: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])
const { t } = useI18n()
const language = useI18n()

const state = reactive({
    error: {} as Error,
    formChild: {
        firstname: '',
        lastname: '',
        gender: '',
        email: '',
        social_security_number: '',
        birthday: '',
        phone: '',
        street: '',
        region_uuid: '',
        municipality_uuid: '',
        city: '',
        post_code: '',
    },
    isPageLoading: false,
    options: {
        genders: [
            { value: 'male', label: `${t('gender.male')}`, },
            { value: 'female', label: `${t('gender.female')}`, },
            { value: 'non_binary', label: `${t('gender.nonbinary')}`, },
            { value: 'will_not_disclose', label: `${t('gender.willNotDisclose')}`, },
        ],
        municipalities: [],
        municipalitiesPerRegion: [],
        regions: [],
    }
})

watch(() => language.locale.value, () => {
    state.options.genders = [
        { value: 'male', label: `${t('gender.male')}`, },
        { value: 'female', label: `${t('gender.female')}`, },
        { value: 'non_binary', label: `${t('gender.nonbinary')}`, },
        { value: 'will_not_disclose', label: `${t('gender.willNotDisclose')}`, },
    ]
})

watch(() => state.formChild.social_security_number, (ssn) => {
    if (ssn?.length === 10) {
        state.formChild.social_security_number = ssn.slice(0, 6) + '-' + ssn.slice(6)
    }
})

watch(() => state.formChild.social_security_number, (ssn) => {
    // Format social security number with a hyphen after six digits
    if (ssn?.length === 10) {
        state.formChild.social_security_number = ssn.slice(0, 6) + '-' + ssn.slice(6)
    }

    // Check if the length is at least six digits to derive the birthdate
    if (ssn?.length >= 6) {
        const day = ssn.slice(0, 2)
        const month = ssn.slice(2, 4)
        let year = ssn.slice(4, 6)

        // Determine the century (adjust as needed for your specific case)
        const currentYear = new Date().getFullYear() % 100
        year = parseInt(year, 10) <= currentYear ? `20${year}` : `19${year}`

        // Create a valid date string in the format 'YYYY-MM-DD'
        const dateOfBirth = `${year}-${month}-${day}`

        if (isValidDate(year, month, day)) {
            // Update the birthday field if the date is valid
            if (!state.formChild.birthday) {
                state.formChild.birthday = dateOfBirth
            }
        } else {
            // Handle invalid date case (optional: clear or show error)
            state.formChild.birthday = ''
        }
    }
})

onMounted(() => {
    fetchRegions()
    fetchMunicipalities()
    fetchMunicipalitiesPerRegion(props.selectedChild?.region?.uuid)
    state.formChild = {
        firstname: props.selectedChild?.firstname,
        lastname: props.selectedChild?.lastname,
        gender: props.selectedChild?.gender,
        email: props.selectedChild?.email,
        social_security_number: props.selectedChild?.social_security_number,
        birthday: props.selectedChild?.birthday,
        phone: props.selectedChild?.phone,
        street: props.selectedChild?.street,
        region_uuid: props.selectedChild?.region?.uuid,
        municipality_uuid: props.selectedChild?.municipality?.uuid,
        city: props.selectedChild?.city,
        post_code: props.selectedChild?.post_code,
    }
})

const isValidDate = (y: string, m: string, d: string): boolean => {
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d)) // Month is zero-based
    return date && date.getFullYear() === parseInt(y) && (date.getMonth() + 1) === parseInt(m) && date.getDate() === parseInt(d)
}

const formattedSocialSecurityNumber = computed<string>({
    get() {
        const ssn = state.formChild.social_security_number
        if (ssn?.length === 10) {
            return ssn.slice(0, 6) + '-' + ssn.slice(6)
        }
        return ssn
    },
    set(value: string) {
        state.formChild.social_security_number = value.replace(/-/g, '')
    }
})

function updateSocialSecurityNumber(event: Event) {
    const target = event.target as HTMLInputElement
    state.formChild.social_security_number = target.value?.replace(/-/g, '')
}

function changeSelectedRegion(regionUuid: string) {
    if (regionUuid) {
        fetchMunicipalitiesPerRegion(regionUuid)
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

async function fetchMunicipalities() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await municipalityService.getAllMunicipalities()
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
            state.options.municipalitiesPerRegion = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

const rules = computed(() => {
    return {
        formChild: {
            firstname: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formChild)
    }
}
</script>

<style>
#formChild .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>