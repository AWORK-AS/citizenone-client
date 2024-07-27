<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-3 pb-6">
            <div class="space-y-1">
                <FormLabel for="title" :label="$t('schedules.form.title')" />
                <FormTextField id="title" name="title" :placeholder="$t('schedules.form.title')"
                    v-model="state.formSchedule.title" :disabled="true" />
                <FormError :error="v$?.formSchedule?.title?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.title?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="description" :label="$t('schedules.form.description')" />
                <FormTextArea id="description" name="description" :placeholder="$t('schedules.form.description')"
                    v-model="state.formSchedule.description" :disabled="true" />
                <FormError :error="v$?.formSchedule?.description?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.description?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="date_time_start" :label="$t('schedules.form.datetimeStart')" />
                <FormDateTimeField id="date_time_start" name="date_time_start"
                    :placeholder="$t('schedules.form.datetimeStart')" v-model="state.formSchedule.date_time_start"
                    :disabled="true" />
                <FormError :error="v$?.formSchedule?.date_time_start?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date_time_start?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="date_time_end" :label="$t('schedules.form.dateTimeEnd')" />
                <FormDateTimeField id="date_time_end" name="date_time_end"
                    :placeholder="$t('schedules.form.dateTimeEnd')" v-model="state.formSchedule.date_time_end"
                    :disabled="true" />
                <FormError :error="v$?.formSchedule?.date_time_end?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date_time_end?.[0]" />
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
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
        title: '',
        description: '',
        date_time_start: '',
        date_time_end: '',
        is_private: false,
        citizens_uuid: [],
        users_uuid: [],
    },
    options: {
        citizens: [] as Option[],
        users: [] as Option[]
    }
})

onMounted(() => {
    state.formSchedule = {
        id: props.selectedSchedule.id,
        uuid: props.selectedSchedule.uuid,
        title: props.selectedSchedule.title,
        description: props.selectedSchedule.description,
        date_time_start: props.selectedSchedule.start ? formatDateTimeToYYYYmmddHHmm(props.selectedSchedule.start) : formatDateToYYYYmmddHHmm('', false),
        date_time_end: props.selectedSchedule.end ? formatDateTimeToYYYYmmddHHmm(props.selectedSchedule.end) : formatDateToYYYYmmddHHmm('', true),
        is_private: props.selectedSchedule.is_private,
        citizens_uuid: props.selectedSchedule.citizens_uuid,
        users_uuid: props.selectedSchedule.users_uuid,
    }
})

const rules = computed(() => {
    return {
        formSchedule: {
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
</script>
