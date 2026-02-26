<template>
    <div>
        <form @submit.prevent="submitForm()" id="formTemplate">
            <div class="grid grid-cols-1 gap-y-3">
                <div class="space-y-1">
                    <FormLabel for="name" :label="$t('dutySchedules.draftTemplates.form.name')" />
                    <FormTextField id="name" name="name" :placeholder="$t('dutySchedules.draftTemplates.form.name')"
                        v-model="state.formTemplate.name" />
                    <FormError :error="v$?.formTemplate?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.name?.[0]" />
                </div>

                <div class="space-y-1">
                    <FormLabel for="department_uuid"
                        :label="customPagesStore.getCustomPagesName?.department ?? $t('dutySchedules.draft.selectDepartment.form.department')" />
                    <FormSelectMultiple id="department_uuid" name="department_uuid"
                        :placeholder="customPagesStore.getCustomPagesName?.department ?? $t('dutySchedules.draft.selectDepartment.form.department')"
                        :options="state.options.departments" v-model="state.formTemplate.department_uuid" />
                    <FormError :error="v$?.formTemplate?.department_uuid?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.department_uuid?.[0]" />
                </div>

                <div class="space-y-1">
                    <div class="w-fit flex items-center cursor-pointer"
                        @click="state.formTemplate.is_admin_only = !state.formTemplate.is_admin_only">
                        <FormCheckbox :value="state.formTemplate.is_admin_only" />
                        {{ $t('dutySchedules.draftTemplates.form.adminsOnly') }}
                    </div>
                </div>

                <div class="space-y-1">
                    <div class="w-fit flex items-center cursor-pointer"
                        @click="state.formTemplate.recurring.is_recurring = !state.formTemplate.recurring.is_recurring">
                        <FormCheckbox :value="state.formTemplate.recurring.is_recurring" />
                        {{ $t('dutySchedules.draftTemplates.form.isRecurring') }}
                    </div>
                </div>

                <div class="space-y-3" v-if="state.formTemplate.recurring.is_recurring">
                    <div class="space-y-1">
                        <FormLabel for="week_rotations"
                            :label="$t('dutySchedules.draftTemplates.form.weekRotations')" />
                        <FormNumberField id="week_rotations" name="week_rotations"
                            v-model="state.formTemplate.recurring.week_rotations" placeholder="0"
                            @input="validateWeekRotationQuantity" />
                        <FormError
                            :error="v$?.formTemplate?.recurring.week_rotations?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.recurring_uuid?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="recurring_until"
                            :label="$t('dutySchedules.draftTemplates.form.recurringUntil')" />
                        <FormDateField id="recurring_until" name="recurring_until"
                            :placeholder="`${$t('recurring.until')}`"
                            v-model="state.formTemplate.recurring.recurring_until" />
                        <FormError
                            :error="v$?.formTemplate.recurring.recurring_until?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.recurring_until?.[0]" />
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
        </form>
    </div>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useDepartmentStore } from '@/store/department'
import { useUserStore } from '@/store/user'
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
    selectedDraftTemplate: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm', 'isLoading'])
const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any
const departmentStore = useDepartmentStore() as any
const userStore = useUserStore() as any

interface Option {
    value: string
    label: string
}

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formTemplate: {
        name: '',
        is_admin_only: false,
        department_uuid: [] as Array<any>,
        recurring: {
            is_recurring: false,
            week_rotations: '',
            recurring_until: ''

        },
    },
    options: {
        departments: [] as Array<any>,
    },
})

onMounted(() => {
    fetchAllDepartments()

    if (props.formType === 'update') {
        state.formTemplate.name = props.selectedDraftTemplate.name
        state.formTemplate.department_uuid = [...props.selectedDraftTemplate.department_uuid]
        state.formTemplate.is_admin_only = props.selectedDraftTemplate.is_admin_only
        state.formTemplate.recurring.is_recurring = props.selectedDraftTemplate.recurring.is_recurring
        state.formTemplate.recurring.week_rotations = props.selectedDraftTemplate.recurring.week_rotations,
            state.formTemplate.recurring.recurring_until = props.selectedDraftTemplate.recurring.recurring_until
    }
})

watch(() => state.formTemplate.department_uuid, (uuids: any) => {
    if (uuids.includes('all-departments') && uuids.length > 1) {
        state.formTemplate.department_uuid = ['all-departments']
    }
})

const rules = computed(() => {
    if (state.formTemplate.recurring.is_recurring) {
        return {
            formTemplate: {
                name: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                recurring: {
                    week_rotations: {
                        required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                    },
                },
            },
        }
    } else {
        return {
            formTemplate: {
                name: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                recurring: {},
            },
        }
    }

})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formTemplate)
    }
}

function validateWeekRotationQuantity(event: Event) {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 10)
    state.formTemplate.recurring.week_rotations = input.value
}

async function fetchAllDepartments() {
    state.error = {}
    emit('isLoading', true)
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
            if (props.formType === 'create') {
                state.formTemplate.department_uuid = []
                if (!['All departments', 'Alle afdelinger'].includes(departmentStore.getSelectedDepartmentName)) {
                    state.formTemplate.department_uuid = [departmentStore.getSelectedDepartment?.uuid]
                }
            }
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isLoading', false)
}
</script>

<style>
#formTemplate .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>