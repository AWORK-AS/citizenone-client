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
            <FormLabel for="date_start" :label="$t('normPeriod.form.dateStart')" />
            <FormDateField id="date_start" name="date_start" :placeholder="$t('normPeriod.form.dateStart')"
                v-model="state.formNormPeriod.date_start" />
            <FormError :error="v$?.formNormPeriod?.date_start?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.date_start?.[0]" />
        </div>
        <div class="space-y-1">
            <FormLabel for="date_end" :label="$t('normPeriod.form.dateEnd')" />
            <FormDateField id="date_end" name="date_end" :placeholder="$t('normPeriod.form.dateEnd')"
                v-model="state.formNormPeriod.date_end" />
            <FormError :error="v$?.formNormPeriod?.date_end?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.date_end?.[0]" />
        </div>
        <div class="space-y-1">
            <FormLabel for="department_uuid" :label="$t('normPeriod.form.department')" />
            <FormSelectMultiple id="department_uuid" name="department_uuid"
                :placeholder="$t('normPeriod.form.department')" :options="state.options.departments"
                v-model="state.formNormPeriod.department_uuids" />
            <FormError :error="v$?.formNormPeriod?.department_uuids?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.department_uuids?.[0]" />
        </div>
        <div class="space-y-3 my-2" v-if="state.formNormPeriod.department_uuids.length">
            <div class="w-fit flex items-center cursor-pointer"
                @click="state.formNormPeriod.update_all_users = !state.formNormPeriod.update_all_users">
                <FormCheckbox id="update_all_users" :value="state.formNormPeriod.update_all_users" />
                {{ $t('normPeriod.form.overrideNormPeriods') }}
                <Icon name="ph:question" class="h-4 w-4 ml-1" aria-hidden="true"
                    @click.stop="state.modal.isOverrideModalOpen = true" />
            </div>
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
                <FormButton type="button" buttonStyle="cancel" @click="navigateTo('/settings/norm-periods')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>

        <ModulesUserNormPeriodModalNormPeriodOverride :isModalOpen="state.modal.isOverrideModalOpen"
            @close="state.modal.isOverrideModalOpen = false" />
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
        date_start: '',
        date_end: '',
        description: '',
        department_uuids: [] as Array<string>,
        is_active: true,
        update_all_users: false,
    },
    modal: {
        isOverrideModalOpen: false,
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
        "days": Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: (i + 1).toString() })),
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
            date_start: newValue.date_start,
            date_end: newValue.date_end,
            description: newValue.description,
            department_uuids: newValue.department_uuids,
            is_active: newValue.is_active,
            update_all_users: state.formNormPeriod.update_all_users,
        }
    }
})

const rules = computed(() => {
    return {
        formNormPeriod: {
            name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            date_start: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            date_end: {
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
                (item: any) => {
                    if (item.id != null) {
                        options.push({
                            value: item.uuid,
                            label: item.name,
                        })
                    }
                }
            )
            state.options.departments = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}
</script>