<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error && props.error.length > 0 || props.error?.message" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="space-y-1">
                <FormLabel for="title" :label="$t('dutySchedules.form.title')" />
                <FormTextField id="title" name="title" :placeholder="$t('dutySchedules.form.title')"
                    v-model="state.formSchedule.title" />
                <FormError :error="v$?.formSchedule?.title?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.title?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="description" :label="$t('dutySchedules.form.description')" />
                <FormTextArea id="description" name="description" :placeholder="$t('dutySchedules.form.description')"
                    v-model="state.formSchedule.description" />
                <FormError :error="v$?.formSchedule?.description?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.description?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="date_time_start" :label="$t('dutySchedules.form.datetimeStart')" />
                <FormDateTimeField id="date_time_start" name="date_time_start"
                    :placeholder="$t('dutySchedules.form.datetimeStart')"
                    v-model="state.formSchedule.date_time_start" />
                <FormError :error="v$?.formSchedule?.date_time_start?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date_time_start?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="date_time_end" :label="$t('dutySchedules.form.dateTimeEnd')" />
                <FormDateTimeField id="date_time_end" name="date_time_end"
                    :placeholder="$t('dutySchedules.form.dateTimeEnd')" v-model="state.formSchedule.date_time_end" />
                <FormError :error="v$?.formSchedule?.date_time_end?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date_time_end?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formSchedule.is_private = !state.formSchedule.is_private">
                    <FormCheckbox :value="state.formSchedule.is_private" />
                    {{ $t('dutySchedules.form.private') }}
                </div>
            </div>
            <div class="space-y-1">
                <FormLabel for="user_uuid" :label="$t('dutySchedules.form.users')" />
                <FormSelect id="user_uuid" name="user_uuid" :options="state.options.citizenUsers"
                    v-model="state.formSchedule.user_uuid" />
                <FormError :error="v$?.formSchedule?.user_uuid?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.user_uuid?.[0]" />
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
    </form>
</template>

<script setup lang="ts">
import { userService } from '@/components/api/UserService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"

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
const emit = defineEmits(['closeModal', 'isPageLoading', 'submitForm'])

const { t } = useI18n()

interface Option {
    value: string
    label: string
}

const state = reactive({
    error: [],
    isPageLoading: false,
    formSchedule: {
        id: '',
        uuid: '',
        title: '',
        description: '',
        date_time_start: '',
        date_time_end: '',
        is_private: false,
        user_uuid: [],
    },
    options: {
        citizenUsers: [] as Option[]
    }
})

onMounted(() => {
    fetchAllUsers()
    state.formSchedule = {
        id: props.selectedSchedule.id,
        uuid: props.selectedSchedule.uuid,
        title: props.selectedSchedule.title,
        description: props.selectedSchedule.description,
        date_time_start: props.selectedSchedule.start ? formatDateTimeToYYYYmmddHHmm(props.selectedSchedule.start) : formatDateToYYYYmmddHHmm('', false),
        date_time_end: props.selectedSchedule.end ? formatDateTimeToYYYYmmddHHmm(props.selectedSchedule.end) : formatDateToYYYYmmddHHmm('', true),
        is_private: props.selectedSchedule.is_private,
        user_uuid: props.selectedSchedule.user_uuid,
    }
    console.log('test', state.formSchedule)
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
            user_uuid: {
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

async function fetchAllUsers() {
    state.error = []
    emit('isPageLoading', true)
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
            state.options.citizenUsers = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}
</script>
