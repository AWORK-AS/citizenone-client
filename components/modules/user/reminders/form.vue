<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="title" :label="$t('reminders.form.title')" />
                <FormTextField id="title" name="title" :placeholder="$t('reminders.form.title')"
                    v-model="state.formReminder.title" />
                <FormError :error="v$?.formReminder?.title?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.title?.[0]" />
            </div>
            <div class="space-y-1">
                <p class="text-sm text-gray-600">
                    {{ $t('reminders.form.dueDate') }}
                </p>
                <FormDateTimeField id="date_time" name="date_time" :placeholder="$t('reminders.form.dueDate')"
                    v-model="state.formReminder.date_time" />
                <FormError :error="v$?.formReminder?.date_time?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date_time?.[0]" />
            </div>
            <div class="space-y-1">
                <p class="text-sm text-gray-600">
                    {{ $t('reminders.form.repeat.repeat') }}
                </p>
                <FormSelect id="repeat" :options="state.options.repeat" v-model="state.formReminder.repeat" />
            </div>
            <div class="space-y-1">
                <p class="text-sm text-gray-600">
                    {{ $t('reminders.assignees') }}
                </p>
                <FormSelectMultiple id="pages" :options="state.options.employees"
                    v-model="state.formReminder.employee" />
                <FormError :error="v$?.formReminder?.employee?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.employee_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <p class="text-sm text-gray-600">
                    {{ $t('reminders.notes') }}
                </p>
                <ckeditor :editor="editor" v-model="state.formReminder.notes" :config="editorStatusConfig"></ckeditor>
                <FormError :error="v$?.formReminder?.notes?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.notes?.[0]" />
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
    </form>
</template>

<script setup lang="ts">
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { userService } from '@/components/api/user/UserService'
import type { Error } from '@/types'
import { useDepartmentStore } from '@/store/department'
import { useUserStore } from '@/store/user'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedReminder: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])
const { t } = useI18n()
const departmentStore = useDepartmentStore()
const userStore = useUserStore() as any
const editor = ref(ClassicEditor)
const editorStatusConfig = ref({
    toolbar: ['undo', 'redo', 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote'],
    heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
            { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
            { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
            { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' },
        ]
    },
    height: 500
}) as any

const state = reactive({
    error: {} as Error,
    isTableLoading: false,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
    formReminder: {
        title: '',
        date_time: '',
        notes: '',
        repeat: '',
        employee: []
    } as any,
    options: {
        repeat: [
            { value: 'never', label: `${t('reminders.form.repeat.never')}` },
            { value: 'daily', label: `${t('reminders.form.repeat.daily')}` },
            { value: 'weekdays', label: `${t('reminders.form.repeat.weekdays')}` },
            { value: 'weekends', label: `${t('reminders.form.repeat.weekends')}` },
            { value: 'weekly', label: `${t('reminders.form.repeat.weekly')}` },
            { value: 'biweekly', label: `${t('reminders.form.repeat.biWeekly')}` },
            { value: 'monthly', label: `${t('reminders.form.repeat.monthly')}` },
            { value: 'every_three_months', label: `${t('reminders.form.repeat.everyThreeMonths')}` },
            { value: 'every_six_months', label: `${t('reminders.form.repeat.everySixMonths')}` },
            { value: 'yearly', label: `${t('reminders.form.repeat.yearly')}` },
        ],
        employees: []
    },
})

onMounted(() => {
    fetchAllEmployees()
    state.formReminder = {
        title: props.selectedReminder.title,
        date_time: props.selectedReminder.date_time,
        notes: props.selectedReminder.notes,
        repeat: props.selectedReminder.repeat,
        employee: [],
    }
    props.selectedReminder?.reminder_users?.forEach((reminderUser: any) => {
        state.formReminder.employee.push(reminderUser?.user?.uuid)
    })
})

async function fetchAllEmployees() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName
        }
        const response = await userService.getAllUsers(params)
        if (response) {
            state.options.employees = response
            let options: any = []
            response.data?.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.firstname + " " + (item.lastname ? item.lastname : ''),
                })
            )
            state.options.employees = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

const rules = computed(() => {
    return {
        formReminder: {
            title: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            date_time: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            employee: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            notes: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        const currentUserUuid = userStore.getUser?.uuid
        if (currentUserUuid && !state.formReminder.employee.includes(currentUserUuid)) {
            state.formReminder.employee = [...state.formReminder.employee, currentUserUuid]
        }
        emit('submitForm', state.formReminder)
    }
}
</script>
