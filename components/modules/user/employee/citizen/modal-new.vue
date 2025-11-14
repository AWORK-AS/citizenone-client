<template>
    <div>
        <Modal size="md" :title="$t('employees.citizens.assignCitizens')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="assignCitizen()" id="formGroupMember">
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">
                                {{ $t('employees.citizens.citizens') }}
                            </p>
                            <FormSelect id="citizens" :options="state.options.citizens"
                                v-model="state.formAssignCitizen.citizen_uuid" class="w-full" />
                            <FormError :error="v$?.formAssignCitizen?.citizen_uuid?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.citizen_uuid?.[0]" />
                        </div>
                        <div class="mt-6">
                            <FormButton type="submit" class="w-full rounded-md" buttonStyle="primary">
                                {{ $t('employees.citizens.assign') }}
                            </FormButton>
                        </div>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>

</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/user/CitizenService'
import { employeeService } from '@/components/api/user/EmployeeService'
import { useDepartmentStore } from '@/store/department'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const router = useRouter()
const departmentStore = useDepartmentStore()
const { successAlert } = useAlert()
const { t } = useI18n()
const employeeUuid = router?.currentRoute?.value?.params?.employee_uuid

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const state = reactive({
    error: {} as Error,
    isTableLoading: false,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
    isPageLoading: false,
    formAssignCitizen: {
        citizen_uuid: '',
    },
    options: {
        citizens: []
    },
})

const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}

const rules = computed(() => {
    return {
        formAssignCitizen: {
            citizen_uuid: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

watch(() => props.isModalOpen, (isOpen: any) => {
    if (isOpen) {
        state.formAssignCitizen.citizen_uuid = ''
        fetchAvailableCitizens()
    }
})

async function fetchAvailableCitizens() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName,
            user_uuid: employeeUuid,
        }
        const response = await citizenService.getAllAssignee(params)
        if (response) {
            state.options.citizens = response
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.firstname + " " + (item.lastname ? item.lastname : ''),
                })
            )
            state.options.citizens = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function assignCitizen() {
    v$.value.$validate()
    if (!v$.value.$error) {
        state.error = {}
        state.isPageLoading = true
        try {
            const params = {
                citizen_uuid: state.formAssignCitizen.citizen_uuid,
            }
            const response = await employeeService.assignCitizen(employeeUuid, params)
            if (response?.data) {
                successAlert(`${t('alert.success')}!`, `${t('reminders.form.alert.employeeSuccessfullyAssigned')}.`)
                fetchAvailableCitizens()
                closeModal()
                state.formAssignCitizen.citizen_uuid = ''
                v$.value.$reset()
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}
</script>

<style>
#formGroupMember .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>