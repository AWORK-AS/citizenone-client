<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <select v-if="state.departments?.data?.length > 0" class="focus:outline-none" @change="selectDepartment">
            <option value="" hidden>Select Department</option>
            <option v-for="(department, index) in state.departments?.data" :key="index" :value="department.uuid"
                :selected="department?.uuid === departmentStore.getSelectedDepartmentUuid">
                {{ department.name }}
            </option>
        </select>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { departmentService } from '@/components/api/DepartmentService'
import { useDepartmentStore } from '@/store/department'

const departmentStore = useDepartmentStore()

const state = reactive({
    departments: [],
    error: [],
    isPageLoading: false,
})

onMounted(() => {
    fetchDepartments()
})

async function fetchDepartments() {
    try {
        const response = await departmentService.getAllDepartments()
        if (response) {
            state.departments = response
        }
    } catch (error: any) {
        state.error = error
    }
}

function selectDepartment(event: any) {
    departmentStore.setSelectedDepartmentUuid(event.target.value)
}
</script>