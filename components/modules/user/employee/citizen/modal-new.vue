<template>
    <div>
        <Modal size="md" :title="$t('employees.citizens.assignCitizens')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <LoadingSpinner :isActive="state.isLoading">
                    <form @submit.prevent="assignCitizen()" id="formGroupMember">
                        <div class="flex items-end space-x-2 pb-16">
                            <div class="flex-1">
                                <p class="text-sm text-gray-600">
                                    {{ $t('employees.citizens.citizens') }}
                                </p>
                                <FormSelect id="pages" :options="state.options.citizens" v-model="state.citizen_uuid"
                                    class="w-full" />
                            </div>
                        </div>
                        <FormButton type="submit" class="w-full rounded-md" buttonStyle="primary">
                            {{ $t('employees.citizens.assign') }}
                        </FormButton>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>

</template>

<script setup lang="ts">
import { watch, reactive } from 'vue'
import { citizenService } from '@/components/api/user/CitizenService'
import { employeeService } from '@/components/api/user/EmployeeService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useDepartmentStore } from '@/store/department'

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

let currentTablePage = 1

const state = reactive({
    error: {} as Error,
    isTableLoading: false,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
    isLoading: false,
    citizen_uuid: '',
    options: {
        citizens: []
    },
})

const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, (isOpen: any) => {
    if (isOpen) {
        fetchCitizens()
    }
})

async function fetchCitizens() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await citizenService.getAllAssignee()
        if (response) {
            state.options.citizens = response
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.firstname + " " + item.lastname,
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
    state.error = {}
    state.isPageLoading = true
    const params = {
        citizen_uuid: state.citizen_uuid
    }
    try {
        const response = await employeeService.assignCitizen(employeeUuid, params)
        if (response?.data) {
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('reminder.form.alert.employeeSuccessfullyAssigned')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>