<template>
    <form @submit.prevent="submitForm()" id="formContact">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <LoadingSpinner :isActive="state.isPageLoading">
            <div class="space-y-3">
                <div class="space-y-1">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="contact_job_title_uuid" :label="$t('citizens.contacts.form.title')" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddContactJobTitleOpen = true">
                            {{ $t('contactJobTitles.addNewContactJobTitle') }}
                        </span>
                    </div>
                    <FormSelect id="contact_job_title_uuid" :options="state.options.contactJobTitles"
                        v-model="state.formContact.contact_job_title_uuid" />
                    <FormError :error="v$?.formContact?.contact_job_title_uuid?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.contact_job_title_uuid?.[0]" />
                </div>
                <div class="space-y-1" v-if="state.formContact.title === 'relatives'">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="relationship" :label="$t('citizens.contacts.form.relationship')" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddNewRelationshipOpen = true">
                            {{ $t('relationships.addNewRelationship') }}
                        </span>
                    </div>
                    <FormSelect id="relationship" :options="state.options.relationships"
                        v-model="state.formContact.relationship" />
                    <FormError :error="v$?.formContact?.relationship?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.relationship_uuid?.[0]" />
                </div>
                <div class="space-y-1"
                    v-if="props.formType === 'create' && state.formContact.title === 'our_contact_person'">
                    <FormLabel for="employees" :label="$t('citizens.contacts.form.employees')" />
                    <FormSelectMultiple id="employees" :options="state.options.employees"
                        v-model="state.formContact.employees" />
                    <FormError :error="v$?.formContact?.employees?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.employees_uuid?.[0]" />
                </div>
                <div class="space-y-1"
                    v-if="props.formType === 'update' && state.formContact.title === 'our_contact_person'">
                    <FormLabel for="employee" :label="$t('citizens.contacts.form.employee')" />
                    <FormSelect id="employee" :options="state.options.employees_without_all_users_option"
                        v-model="state.formContact.employee" />
                    <FormError :error="v$?.formContact?.employee?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.employee_uuid?.[0]" />
                </div>
                <div class="py-5 space-y-8" v-if="state.formContact.title === 'our_contact_person'" id="notifications">
                    <div v-for="(notification, index) in state.formContact.notifications" :key="index" class="relative">
                        <div class="grid grid-cols-1 gap-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8"
                            :class="[
                                !(state.formContact.notifications[index]?.notification_uuid === state.options.notification_types[0]?.value ||
                                    state.formContact.notifications[index]?.notification_uuid === state.options.notification_types[3]?.value) ? 'md:grid-cols-2' : ' md:grid-cols-1'
                            ]">
                            <div class="space-y-1">
                                <p class="text-sm text-gray-600">
                                    {{ $t('citizens.contacts.form.notificationTypes') }}
                                </p>
                                <FormSelect :id="`notification_types_${index}`" :name="`notification_type_${index}`"
                                    :options="state.options.notification_types"
                                    :value="state.formContact.notifications[index].notification_uuid"
                                    @change="(event: any) => state.formContact.notifications[index].notification_uuid = event" />
                            </div>
                            <div class="space-y-1"
                                v-if="!(state.formContact.notifications[index]?.notification_uuid === state.options.notification_types[0]?.value ||
                                    state.formContact.notifications[index]?.notification_uuid === state.options.notification_types[3]?.value)">
                                <p class="text-sm text-gray-600">
                                    {{ $t('citizens.contacts.form.notifications.riskLevel') }}
                                </p>
                                <FormSelect :id="`risk_level_${index}`" :name="`risk_level_${index}`"
                                    :options="state.options.risk_levels"
                                    :value="state.formContact.notifications[index].risk_level_uuid"
                                    @change="(event: any) => state.formContact.notifications[index].risk_level_uuid = event" />
                            </div>
                        </div>
                        <button type="button"
                            class="absolute -top-3 -right-3 bg-red-700 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center"
                            @click="removeNotification(index)" v-if="state.formContact.notifications.length > 1">
                            <Icon name="ph:trash" class="h-4 w-4 text-white" aria-hidden="true" />
                        </button>
                        <button type="button"
                            class="absolute -bottom-4 inset-x-1/2 shadow-md bg-secondary hover:bg-secondary-800 rounded-full w-8 h-8 flex items-center justify-center"
                            @click="addNotification()" v-if="index === state.formContact.notifications.length - 1">
                            <Icon name="ph:plus" class="h-4 w-4 text-white" aria-hidden="true" />
                        </button>
                    </div>
                </div>
                <div class="space-y-1" v-if="state.formContact.title !== 'our_contact_person'">
                    <FormLabel for="companyName" :label="$t('citizens.contacts.form.companyName')" />
                    <FormTextField id="companyName" name="companyName"
                        :placeholder="$t('citizens.contacts.form.companyName')"
                        v-model="state.formContact.company_name" />
                    <FormError :error="v$?.formContact?.company_name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.company_name?.[0]" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3"
                    v-if="state.formContact.title !== 'our_contact_person'">
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
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3"
                    v-if="state.formContact.title !== 'our_contact_person'">
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
                <div class="space-y-1" v-if="state.formContact.title !== 'our_contact_person'">
                    <FormLabel for="street" :label="$t('citizens.contacts.form.street')" />
                    <FormTextField id="street" name="street" :placeholder="$t('citizens.contacts.form.street')"
                        v-model="state.formContact.street" />
                    <FormError :error="v$?.formContact?.street?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.street?.[0]" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3"
                    v-if="state.formContact.title !== 'our_contact_person'">
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
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3"
                    v-if="state.formContact.title !== 'our_contact_person'">
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
                <div class="space-y-1"
                    v-if="userStore.getUser?.has_relative_app && state.formContact.title === 'relatives'">
                    <div class="w-fit flex items-center cursor-pointer"
                        @click="state.formContact.has_system_access = !state.formContact.has_system_access">
                        <FormCheckbox :value="state.formContact.has_system_access" />
                        {{ $t('citizens.contacts.form.allowSystemAccess') }}
                    </div>
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" @click="emit('closeModal')">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" class="w-full">
                        {{ props.formType === 'create' ? $t('save') :
                            $t('update') }}
                    </FormButton>
                </div>
            </div>
            <ModulesUserCitizenContactJobTitleModalNew :isModalOpen="state.modal.isAddContactJobTitleOpen"
                @close="state.modal.isAddContactJobTitleOpen = false"
                @refreshContactJobTitles="fetchAllContactJobTitles" />
            <ModulesUserRelationshipModalNew :isModalOpen="state.modal.isAddNewRelationshipOpen"
                @close="state.modal.isAddNewRelationshipOpen = false" @refreshRelationships="fetchAllRetionships" />
        </LoadingSpinner>
    </form>
</template>

<script setup lang="ts">
import { contactJobTitlesService } from '@/components/api/user/ContactJobTitlesService'
import { relationshipService } from '@/components/api/user/RelationshipService'
import { regionService } from '@/components/api/user/RegionService'
import { municipalityService } from '@/components/api/user/MunicipalityService'
import { cityService } from '@/components/api/user/CityService'
import { userService } from '@/components/api/user/UserService'
import { contactNotificationTypesService } from '@/components/api/user/ContactNotificationTypesService'
import { riskLevelService } from '@/components/api/user/RiskLevelService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'
import { useDepartmentStore } from '@/store/department'
import type { Error } from '@/types'
import { zipLookerService } from '~/components/api/ziplooker/ZipLookerService'

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
const language = useI18n()
const departmentStore = useDepartmentStore()
const userStore = useUserStore() as any

const state = reactive({
    error: {} as Error,
    formContact: {
        id: '',
        uuid: '',
        title: '',
        contact_job_title_uuid: '',
        relationship: '',
        company_name: '',
        employee: '',
        employees: [],
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        street: '',
        region: '',
        municipality: '',
        city: '',
        post_code: '',
        notifications: [{
            notification_uuid: '',
            risk_level_uuid: '',
        }] as any,
        has_system_access: false,
    },
    isPageLoading: false,
    modal: {
        isAddContactJobTitleOpen: false,
        isAddNewRelationshipOpen: false,
    },
    options: {
        cities: [],
        contactJobTitles: [] as any,
        employees: [],
        employees_without_all_users_option: [],
        municipalities: [],
        notification_types: [] as any,
        relationships: [],
        regions: [],
        risk_levels: [],
    }
})

onMounted(() => {
    fetchAllContactJobTitles()
    fetchNotificationTypes()
    fetchRiskLevels()
    fetchRegions()
    fetchMunicipalitiesPerRegion(props.selectedContact?.region?.uuid)
    fetchCities(props.selectedContact?.municipality?.uuid)
    state.formContact = {
        id: props.selectedContact?.id,
        uuid: props.selectedContact?.uuid,
        title: props.selectedContact?.title,
        contact_job_title_uuid: props.selectedContact?.contact_job_title?.uuid,
        relationship: props.selectedContact?.relationship?.uuid,
        company_name: props.selectedContact?.company_name,
        employee: props.selectedContact?.employee?.uuid,
        employees: props.selectedContact?.employees,
        firstname: props.selectedContact?.firstname,
        lastname: props.selectedContact?.lastname,
        email: props.selectedContact?.email,
        phone: props.selectedContact?.phone,
        street: props.selectedContact?.street,
        region: props.selectedContact?.region?.uuid,
        municipality: props.selectedContact?.municipality?.uuid,
        city: props.selectedContact?.city?.uuid,
        post_code: props.selectedContact?.post_code,
        notifications: [],
        has_system_access: props.selectedContact?.has_system_access
    }
    props.selectedContact?.notification_types?.forEach((notification_type: any) => {
        state.formContact.notifications.push({
            notification_uuid: notification_type?.uuid,
            risk_level_uuid: notification_type?.pivot?.risk_level?.uuid,
        })
    })
    if (state.formContact.notifications?.length === 0) {
        state.formContact.notifications = [{
            notification_uuid: '',
            risk_level_uuid: '',
        }]
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
            contact_job_title_uuid: props.selectedContact?.contact_job_title?.uuid,
            relationship: props.selectedContact?.relationship?.uuid,
            company_name: props.selectedContact?.company_name,
            employee: props.selectedContact?.employee?.uuid,
            employees: props.selectedContact?.employees,
            firstname: props.selectedContact?.firstname,
            lastname: props.selectedContact?.lastname,
            email: props.selectedContact?.email,
            phone: props.selectedContact?.phone,
            street: props.selectedContact?.street,
            region: props.selectedContact?.region?.uuid,
            municipality: props.selectedContact?.municipality?.uuid,
            city: props.selectedContact?.city?.uuid,
            post_code: props.selectedContact?.post_code,
            notifications: [],
            has_system_access: props.selectedContact?.has_system_access
        }
        props.selectedContact?.notification_types?.forEach((notification_type: any) => {
            state.formContact.notifications.push({
                notification_uuid: notification_type?.uuid,
                risk_level_uuid: notification_type?.pivot?.risk_level?.uuid,
            })
        })
        if (state.formContact.notifications?.length === 0) {
            state.formContact.notifications = [{
                notification_uuid: '',
                risk_level_uuid: '',
            }]
        }
    }
})

watch(() => state.formContact.contact_job_title_uuid, () => {
    state.error = {}
    state.formContact.title = state.options.contactJobTitles.find((contactJobTitle: any) => contactJobTitle.value === state.formContact.contact_job_title_uuid)?.system_name
    if (state.formContact.title === 'our_contact_person' && props.formType === 'create') {
        fetchAllUsers()
    }
    else if (state.formContact.title === 'our_contact_person' && props.formType === 'update') {
        fetchAllUsersWithoutAllUsersOption()
    }

    if (state.formContact.title === 'relatives') {
        fetchAllRetionships()
    }
})

watch(() => language.locale.value, () => {
    fetchNotificationTypes()
    fetchRiskLevels()
})

watch(() => state.formContact.post_code, async (newPostCode, oldPostCode, onCleanup) => {
    if (!newPostCode || newPostCode.length < 4) return

    let isStale = false
    onCleanup(() => { isStale = true })

    await new Promise(resolve => setTimeout(resolve, 500))
    if (isStale) return

    const data = await zipLookerService.findCityRegionMunicipality(newPostCode)

    if (data && !isStale) {
        const matchedRegion = state.options.regions.find(
            (r: any) => r.label.toLowerCase().includes(data.region.toLowerCase())
        ) as any

        state.formContact.region = matchedRegion?.value
        await changeSelectedRegion(matchedRegion?.value)
        if (isStale) return

        const matchedMuni = state.options.municipalities.find(
            (m: any) => m.label.toLowerCase().includes(data.municipality.toLowerCase())
        ) as any

        state.formContact.municipality = matchedMuni?.value
        await changeSelectedMunicipality(matchedMuni?.value)
        if (isStale) return

        const matchedCity = state.options.cities.find(
            (c: any) => c.label.toLowerCase().includes(data.city.toLowerCase())
        ) as any

        state.formContact.city = matchedCity?.value
    }
})

const rules = computed(() => {
    if (props.formType === 'create') {
        if (state.formContact.title === 'our_contact_person') {
            return {
                formContact: {
                    employees: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                }
            }
        } else {
            return {
                formContact: {
                    contact_job_title_uuid: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    firstname: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                },
            }
        }
    } else {
        if (state.formContact.title === 'our_contact_person') {
            return {
                formContact: {
                    employee: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                }
            }
        } else {
            return {
                formContact: {
                    contact_job_title_uuid: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                    firstname: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                },
            }
        }
    }
})

async function fetchAllUsers() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName
        }
        const response = await userService.getAllUsers(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (user: any) => options.push({
                    value: user?.uuid,
                    label: user?.firstname + " " + (user?.lastname ?? ''),
                })
            )
            state.options.employees = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAllUsersWithoutAllUsersOption() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await userService.getAllUsersWithoutAllUsersOption()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (user: any) => options.push({
                    value: user?.uuid,
                    label: user?.firstname + " " + (user?.lastname ?? ''),
                })
            )
            state.options.employees_without_all_users_option = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAllRetionships() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await relationshipService.getAllRelationships()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (relationsip: any) => options.push({
                    value: relationsip?.uuid,
                    label: relationsip?.name,
                })
            )
            state.options.relationships = options
            state.formContact.relationship = props.selectedContact?.relationship?.uuid ?? ''
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

async function fetchAllContactJobTitles() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {}
        const response = await contactJobTitlesService.getAllContactJobTitles(params)
        if (response?.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item?.uuid,
                    label: language.locale.value === 'en' ? item?.en_title : item?.dk_title,
                    system_name: item?.system_name,
                })
            )
            state.options.contactJobTitles = options
            state.formContact.title = state.options.contactJobTitles.find((contactJobTitle: any) => contactJobTitle.value === props.selectedContact?.contact_job_title?.uuid)?.system_name
            fetchAllRetionships()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchNotificationTypes() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await contactNotificationTypesService.getAllTypes()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.type,
                })
            )
            state.options.notification_types = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchRiskLevels() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await riskLevelService.getAllRiskLevels()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.risk_levels = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
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

async function changeSelectedRegion(regionUuid: string) {
    if (regionUuid) {
        await fetchMunicipalitiesPerRegion(regionUuid)
        return
    }

    state.options.municipalities = []
    state.options.cities = []
    state.formContact.municipality = ''
    state.formContact.city = ''
}

async function changeSelectedMunicipality(municipalityUuid: string) {
    if (municipalityUuid) {
        await fetchCities(municipalityUuid)
        return
    }

    state.options.cities = []
    state.formContact.city = ''
}

function addNotification() {
    state.formContact.notifications.push({
        notification_uuid: '',
        risk_level_uuid: '',
    })
}

function removeNotification(index: number) {
    state.formContact.notifications.splice(index, 1)
}
</script>

<style>
#formContact #notifications .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>