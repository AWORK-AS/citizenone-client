<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-1">
            <FormLabel for="name" :label="$t('normPeriod.form.name')" />
            <FormTextField id="name" name="name" :placeholder="$t('normPeriod.form.name')"
                v-model="state.formNormPeriod.name" />
            <FormError :error="v$?.formNormPeriod?.name?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.name?.[0]" />
        </div>
        <div class="space-y-1">
            <FormLabel for="start_month" :label="$t('normPeriod.form.startMonth')" />
            <FormSelect id="start_month"
                :options="state.options.months"
                v-model="state.formNormPeriod.start_month" />
            <FormError :error="v$?.formNormPeriod?.start_month?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.start_month?.[0]" />
        </div>
        <div class="space-y-1">
            <FormLabel for="start_day" :label="$t('normPeriod.form.startDay')" />
            <FormSelect id="start_day"
                :options="state.options.days"
                v-model="state.formNormPeriod.start_day" />
            <FormError :error="v$?.formNormPeriod?.start_day?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.start_day?.[0]" />
        </div>
        <div class="space-y-1">
            <FormLabel for="end_month" :label="$t('normPeriod.form.endMonth')" />
            <FormSelect id="end_month" name="end_month"
                :options="state.options.months"
                v-model="state.formNormPeriod.end_month" />
            <FormError :error="v$?.formNormPeriod?.end_month?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.end_month?.[0]" />
        </div>
        <div class="space-y-1">
            <FormLabel for="end_day" :label="$t('normPeriod.form.endDay')" />
            <FormSelect id="end_day" name="end_day"
                :options="state.options.days"
                v-model="state.formNormPeriod.end_day" />
            <FormError :error="v$?.formNormPeriod?.end_day?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.end_day?.[0]" />
        </div>
        <div class="space-y-1">
            <FormLabel for="department_uuid"
                :label="$t('normPeriod.form.department')" />
            <FormSelectMultiple id="department_uuid" name="department_uuid"
                :placeholder="$t('normPeriod.form.department')"
                :options="state.options.departments" v-model="state.formNormPeriod.department_uuids" />
            <FormError :error="v$?.formNormPeriod?.department_uuids?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.department_uuids?.[0]" />
        </div>
        <div class="space-y-1">
            <FormLabel for="description" :label="$t('normPeriod.form.description')" />
            <FormTextArea id="description" name="description" :placeholder="$t('normPeriod.form.description')"
                v-model="state.formNormPeriod.description" />
            <FormError :error="v$?.formNormPeriod?.description?.$errors[0]?.$message.toString()" />
            <FormError :error="state?.error?.errors?.description?.[0]" />
        </div>
        <div class="mt-6 mb-20">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                    @click="navigateTo('/settings/norm-periods')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { useCustomPagesStore } from '@/store/custom-pages'
import { departmentService } from '@/components/api/user/DepartmentService'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedNormPeriod: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any

const state = reactive({
    error: {} as Error,
    formNormPeriod: {
        name: '',
        start_month: '',
        start_day: '',
        end_month: '',
        end_day: '',
        description: '',
        department_uuids: [] as Array<string>,
        is_active: true
    },
    options: {
        "months": [
            { value: 1, label: t('months.january') },
            { value: 2, label: t('months.february') },
            { value: 3, label: t('months.march') },
            { value: 4, label: t('months.april') },
            { value: 5, label: t('months.may') },
            { value: 6, label: t('months.june') },
            { value: 7, label: t('months.july') },
            { value: 8, label: t('months.august') },
            { value: 9, label: t('months.september') },
            { value: 10, label: t('months.october') },
            { value: 11, label: t('months.november') },
            { value: 12, label: t('months.december') },
        ],
        "days": Array.from({ length: 31 }, (_, i) => ({value: i + 1, label: (i + 1).toString()})),
        departments: [] as Array<any>,
    }
})

onMounted(() => {
    fetchAllDepartments()
})

watch(() => props.selectedNormPeriod, (newValue: any) => {
    if (newValue != null) {
        state.formNormPeriod = {
            name: newValue.name,
            start_month: newValue.start_month,
            start_day: newValue.start_day,
            end_month: newValue.end_month,
            end_day: newValue.end_day,
            description: newValue.description,
            department_uuids: newValue.department_uuids,
            is_active: newValue.is_active
        }
    }
})

const rules = computed(() => {
    return {
        formNormPeriod: {
            name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            start_month: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            start_day: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            end_month: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            end_day: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formNormPeriod)
    }
}

async function fetchAllDepartments() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {}
        const response = await departmentService.getAllDepartments(params)
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.departments = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}
</script>