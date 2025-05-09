<template>
    <form @submit.prevent="submitForm()" id="formSchedule">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="space-y-1" v-if="props.formType === 'create'">
                <FormLabel for="citizens" :label="$t('events.form.citizens')" />
                <FormSelectMultiple id="citizens" name="citizens" :options="state.options.citizens"
                    v-model="state.formSchedule.citizens" />
                <FormError :error="v$?.formProtocol?.citizens?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.citizens_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="title" :label="$t('events.form.title')" />
                <FormTextField id="title" name="title" :placeholder="$t('events.form.title')"
                    v-model="state.formSchedule.title" />
                <FormError :error="v$?.formSchedule?.title?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.title?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="description" :label="$t('events.form.description')" />
                <FormTextArea id="description" name="description" :placeholder="$t('events.form.description')"
                    v-model="state.formSchedule.description" />
                <FormError :error="v$?.formSchedule?.description?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.description?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="date_time_start" :label="$t('events.form.datetimeStart')" />
                <FormDateTimeField id="date_time_start" name="date_time_start"
                    :placeholder="$t('events.form.datetimeStart')" v-model="state.formSchedule.date_time_start" />
                <FormError :error="v$?.formSchedule?.date_time_start?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date_time_start?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="date_time_end" :label="$t('events.form.dateTimeEnd')" />
                <FormDateTimeField id="date_time_end" name="date_time_end" :placeholder="$t('events.form.dateTimeEnd')"
                    v-model="state.formSchedule.date_time_end" />
                <FormError :error="v$?.formSchedule?.date_time_end?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date_time_end?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="flex justify-between items-center py-0.5">
                    <FormLabel for="unit_uuid" :label="$t('units.unit')" />
                    <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                        @click="state.modal.isAddUnitOpen = true">
                        {{ $t('units.addNewUnit') }}
                    </span>
                </div>
                <FormSelect id="unit_uuid" name="unit_uuid" :options="state.options.units"
                    v-model="state.formSchedule.unit_uuid" />
                <FormError :error="v$?.formSchedule?.unit_uuid?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.unit_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formSchedule.is_private = !state.formSchedule.is_private">
                    <FormCheckbox :value="state.formSchedule.is_private" />
                    {{ $t('events.form.private') }}
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
        <ModulesUserUnitModalNew :isModalOpen="state.modal.isAddUnitOpen" @close="state.modal.isAddUnitOpen = false"
            @refreshUnits="fetchAllUnits" />
    </form>
</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/user/CitizenService'
import { unitService } from '@/components/api/user/UnitService'
import { userService } from '@/components/api/user/UserService'
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
    selectedSchedule: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])
const { t } = useI18n()

interface Option {
    value: string
    label: string
}

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formSchedule: {
        id: '',
        uuid: '',
        citizens: [],
        title: '',
        description: '',
        date_time_start: '',
        date_time_end: '',
        unit_uuid: '',
        is_private: false,
        send_invitation: false,
    },
    modal: {
        isAddUnitOpen: false,
    },
    options: {
        citizens: [] as Option[],
        units: [] as Option[],
        users: [] as Option[]
    }
})

onMounted(() => {
    fetchAllCitizens()
    fetchAllUsers()
    fetchAllUnits()
    state.formSchedule = {
        id: props.selectedSchedule.id,
        uuid: props.selectedSchedule.uuid,
        citizens: props.selectedSchedule.citizens,
        title: props.selectedSchedule.title,
        description: props.selectedSchedule.description,
        date_time_start: props.selectedSchedule.start ? formatDateTimeToYYYYmmddHHmm(props.selectedSchedule.start) : formatDateToYYYYmmddHHmm('', false),
        date_time_end: props.selectedSchedule.end ? formatDateTimeToYYYYmmddHHmm(props.selectedSchedule.end) : formatDateToYYYYmmddHHmm('', true),
        unit_uuid: props.selectedSchedule.unit_uuid,
        is_private: props.selectedSchedule.is_private,
        send_invitation: props.selectedSchedule.send_invitation,
    }
})

const rules = computed(() => {
    return {
        formSchedule: {
            citizens: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            title: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            date_time_start: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            date_time_end: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formSchedule)
    }
}

function formatDateTimeToYYYYmmddHHmm(inputDate: string): string {
    const date = new Date(inputDate)

    // Extract date components
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0') // January is 0
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    // Construct formatted date string without semicolons
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`

    return formattedDate
}

function formatDateToYYYYmmddHHmm(dateString: string, is_end_date_time: boolean = false): string {
    let date: Date

    if (!dateString) {
        // If dateString is null or empty, use today's date
        date = new Date() // Current date and time
    } else {
        date = new Date(dateString)
    }

    if (is_end_date_time) {
        // Set time to 11:59:59.999 PM
        date.setHours(23, 59, 59, 999)
    } else {
        // Default behavior: set time to 00:00:00.000 AM
        date.setHours(0, 0, 0, 0)
    }

    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2) // Months are zero indexed
    const day = ('0' + date.getDate()).slice(-2)
    const hours = ('0' + date.getHours()).slice(-2)
    const minutes = ('0' + date.getMinutes()).slice(-2)

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`

    return formattedDate
}

async function fetchAllCitizens() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await citizenService.getAllCitizens()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (citizen: any) => options.push({
                    value: citizen?.uuid,
                    label: citizen?.firstname + " " + citizen?.lastname,
                })
            )
            state.options.citizens = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

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
            state.options.users = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAllUnits() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await unitService.getAllUnits()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (user: any) => options.push({
                    value: user?.uuid,
                    label: user?.firstname + " " + user?.lastname,
                })
            )
            state.options.units = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>

<style>
#formSchedule .multiselect-dropdown {
    max-height: 6rem !important;
}
</style>