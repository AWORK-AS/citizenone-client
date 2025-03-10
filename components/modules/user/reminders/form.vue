<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="title" :label="$t('reminder.title')" />
                <FormTextField id="title" name="title" :placeholder="$t('reminder.title')"
                    v-model="state.formReminder.title" />
                <FormError :error="v$?.formReminder?.title?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.title?.[0]" />
            </div>
            <div class="space-y-1">
                <p class="text-sm text-gray-600">
                    {{ $t('reminder.dueDate') }}
                </p>
                <FormDateTimeField id="date_time" name="date_time" :placeholder="$t('reminder.dueDate')"
                    v-model="state.formReminder.date_time" />
                <FormError :error="v$?.formReminder?.date_time?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date_time?.[0]" />
            </div>
            <div class="space-y-1">
                <p class="text-sm text-gray-600">
                    {{ $t('reminder.repeat') }}
                </p>
                <FormSelect id="repeat" :options="state.options.repeat" v-model="state.formReminder.repeat" />
            </div>
            <div class="space-y-1">
                <p class="text-sm text-gray-600">
                    {{ $t('reminder.assignees') }}
                </p>
                <FormSelectMultiple id="pages" :options="state.options.employees"
                    v-model="state.formReminder.employee" />
                <FormError :error="v$?.formReminder?.employee?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.employee_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <p class="text-sm text-gray-600">
                    {{ $t('reminder.notes') }}
                </p>
                <ckeditor :editor="editor" v-model="state.formReminder.notes" :config="editorStatusConfig"></ckeditor>
                <FormError :error="v$?.formReminder?.notes?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.notes?.[0]" />
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
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { useDepartmentStore } from '@/store/department'
import { userService } from '@/components/api/user/UserService'
import type { Error } from '@/types'

const departmentStore = useDepartmentStore()

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
const editor = ref(ClassicEditor)
const editorStatusConfig = ref({
    toolbar: ['undo', 'redo', 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote'],
    heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
        ]
    },
    height: 500
})

let currentTablePage = 1

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
    },
    options: {
        repeat: [
            { value: 'never', label: `${t('reminder.never')}` },
            { value: 'daily', label: `${t('reminder.daily')}` },
            { value: 'weekdays', label: `${t('reminder.weekdays')}` },
            { value: 'weekends', label: `${t('reminder.weekends')}` },
            { value: 'weekly', label: `${t('reminder.weekly')}` },
            { value: 'biweekly', label: `${t('reminder.biWeekly')}` },
            { value: 'monthly', label: `${t('reminder.monthly')}` },
            { value: 'every_three_months', label: `${t('reminder.everyThreeMonths')}` },
            { value: 'every_six_months', label: `${t('reminder.everySixMonths')}` },
            { value: 'yearly', label: `${t('reminder.yearly')}` },
        ],
        employees: []
    },
})

onMounted(() => {
    fetchEmployees()
    state.formReminder = {
        title: props.selectedReminder.title,
        date_time: props.selectedReminder.date_time,
        notes: props.selectedReminder.notes,
        repeat: props.selectedReminder.repeat,
        employee: [],
    }
})

watch(() => props.selectedReminder, (newValue: any) => {
    if (newValue != null) {
        state.formReminder = {
            title: newValue?.title,
            date_time: newValue?.date_time,
            notes: newValue?.notes,
            repeat: newValue?.repeat,
            employee: [],
        }
    }
})

async function fetchEmployees() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await userService.getAllUsers()
        if (response) {
            state.options.employees = response
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.firstname + " " + item.lastname,
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
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            date_time: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            employee: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            notes: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formReminder)
    }
}
</script>
