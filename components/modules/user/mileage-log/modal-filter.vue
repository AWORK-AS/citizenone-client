<template>
    <div>
        <Modal size="sm" :title="$t('filter')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()" id="mileageLogFilterForm">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-3">
                            <div class="space-y-1" v-if="props.type === 'all'">
                                <FormLabel for="department_uuids" :label="$t('mileageLog.filter.departments')" />
                                <FormSelectMultiple id="department_uuids" :options="state.options.departments"
                                    v-model="state.formFilter.department_uuids" />
                            </div>
                            <div class="space-y-1" v-if="props.type === 'all'">
                                <FormLabel for="employee_uuids" :label="$t('mileageLog.filter.employees')" />
                                <FormSelectMultiple id="employee_uuids" :options="state.options.employees"
                                    v-model="state.formFilter.employee_uuids" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="citizen_link" :label="$t('mileageLog.filter.citizenLink')" />
                                <FormSelect id="citizen_link" :options="state.options.citizenLink"
                                    v-model="state.formFilter.citizen_link" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="date_range" :label="$t('mileageLog.filter.filterDate')" />
                                <FormDateRangeField name="date_range" :placeholder="t('mileageLog.filter.filterDate')"
                                    v-model="state.formFilter.date_range" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" @click="closeModal()">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary">
                                    {{ $t('filter') }}
                                </FormButton>
                            </div>
                        </div>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { userService } from '@/components/api/user/UserService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    type: {
        type: String,
        default: 'self',
    },
})
const { t } = useI18n()
const emit = defineEmits(['close', 'setFilter'])

const state = reactive({
    error: {} as Error,
    formFilter: {
        department_uuids: [],
        employee_uuids: [],
        citizen_link: '',
        date_range: [] as any,
    },
    isPageLoading: false,
    options: {
        departments: [],
        employees: [],
        citizenLink: [
            { value: '', label: t('mileageLog.filter.allTrips') },
            { value: 'linked', label: t('mileageLog.filter.linkedToCitizen') },
            { value: 'unlinked', label: t('mileageLog.filter.notLinked') },
        ],
    }
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen && props.type === 'all') {
        fetchAllDepartments()
        fetchAllUsers()
    }
})

function closeModal() {
    emit('close')
}

async function fetchAllDepartments() {
    state.isPageLoading = true
    try {
        const response = await departmentService.getAllDepartments({})
        if (response) {
            state.options.departments = response.data.map((item: any) => ({ value: item.uuid, label: item.name }))
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAllUsers() {
    state.isPageLoading = true
    try {
        const response = await userService.getAllUsers({})
        if (response.data) {
            state.options.employees = response.data.map((user: any) => ({ value: user?.uuid, label: user?.firstname + " " + (user?.lastname ?? '') }))
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function submitForm() {
    emit('setFilter', state.formFilter)
    closeModal()
}
</script>
