<template>
    <form @submit.prevent="selectDepartment" id="formDutySchedule">
        <div class="space-y-3">
            <Alert type="danger" :text="props?.error?.message" v-if="props.error?.message && props.error.message.length > 0" />
            
            <div class="space-y-1">
                <FormLabel for="department_uuid" :label="$t('dutySchedules.draft.selectDepartment.form.department')" />
                <FormSelect id="department_uuid" name="department_uuid" :placeholder="$t('dutySchedules.draft.selectDepartment.form.department')" :options="state.options.departments"
                    v-model="state.formDepartment.department_uuid" />
                <FormError :error="v$?.formDepartment?.department_uuid?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.department_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="w-fit flex items-center cursor-pointer select-none"
                    @click="state.formDepartment.do_not_show_again = !state.formDepartment.do_not_show_again">
                    <FormCheckbox :value="state.formDepartment.do_not_show_again" />
                    <div class="flex items-center gap-x-1">
                        <span>{{ $t('dutySchedules.draft.selectDepartment.form.doNotShowAgain') }}</span>
                        <Tooltip position="right" :text="$t('dutySchedules.draft.selectDepartment.form.donNotShowAgainInfo')">
                            <Icon name="ph:question" class="h-5 w-5 text-gray-700" aria-hidden="true" />
                        </Tooltip>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                    {{ $t('dutySchedules.draft.selectDepartment.form.confirm') }}
                </FormButton>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import moment from "moment"
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { departmentService } from '@/components/api/user/DepartmentService'
import { useDepartmentStore } from '@/store/department'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { userService } from "~/components/api/user/UserService"

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
})

const { t } = useI18n()
const emit = defineEmits(['close', 'isPageLoading', 'selectDepartment'])
const departmentStore = useDepartmentStore() as any

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    departments: [] as Array<any>,
    selectedDepartmentUuid: '' as string | null,
    formDepartment: {
        department_uuid: '' as string | null,
        do_not_show_again: false,
    },
    options: {
        departments: [] as Array<any>,
    },
})

onMounted(() => {
    v$.value.$reset()
    fetchAllDepartments()
})

const rules = computed(() => {
    return {
        formDepartment: {
            department_uuid: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
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
            state.formDepartment.department_uuid = ''
            if (!['All departments', 'Alle afdelinger'].includes(departmentStore.getSelectedDepartmentName)) {
                state.formDepartment.department_uuid = departmentStore.getSelectedDepartment?.uuid
            }
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function selectDepartment() {
    v$.value.$validate()
    if (v$.value.$error) {
        return
    }

    const department = state.options.departments?.find((department: any) => department.value === state.formDepartment.department_uuid)

    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            department_uuid: state.formDepartment.department_uuid
        }
        const response = await userService.updateSelectedDepartment(params)
        if (response) {
            emit('selectDepartment', state.formDepartment.department_uuid)
            departmentStore.setSelectedDepartmentName(department?.label)

            if (state.formDepartment.do_not_show_again) {
                const now = moment().format('YYYY-MM-DD')
                localStorage.setItem('schedulesDraftContextHidden', now)
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

</script>