<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <div class="block md:hidden">
            <select v-if="state.departments?.data?.length > 0" class="focus:outline-none" @change="selectDepartment">
                <option value="">
                    {{ $t('department.allDepartment') }}
                </option>
                <option v-for="(department, index) in state.departments?.data" :key="index" :value="department.name"
                    :selected="department?.name === departmentStore.getSelectedDepartmentName">
                    {{ department?.name }}
                </option>
            </select>
        </div>
        <div class="hidden md:block">
            <Menu as="div" class="relative inline-block text-left w-34">
                <div>
                    <MenuButton
                        class="inline-flex w-full items-center justify-center gap-x-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        {{ $t('department.department') }}:
                        {{ departmentStore.getSelectedDepartmentName === '' ? $t('department.all') :
                            departmentStore.getSelectedDepartmentName }}
                        <Icon name="heroicons:chevron-down" class="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                    </MenuButton>
                </div>

                <transition enter-active-class="transition ease-out duration-100"
                    enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
                    leave-active-class="transition ease-in duration-75"
                    leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                    <MenuItems
                        class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div class="py-1">
                            <MenuItem v-slot="{ active }">
                            <a :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'cursor-pointer block px-4 py-2 text-sm']"
                                @click="changeDepartment('')">
                                All Department
                            </a>
                            </MenuItem>
                            <MenuItem v-slot="{ active }" v-for="(department, index) in state.departments?.data"
                                :key="index">
                            <a :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'cursor-pointer block px-4 py-2 text-sm']"
                                @click="changeDepartment(department?.name)">
                                {{ department?.name }}
                            </a>
                            </MenuItem>
                        </div>
                    </MenuItems>
                </transition>
            </Menu>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { departmentService } from '@/components/api/DepartmentService'
import { useDepartmentStore } from '@/store/department'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import type { Error } from '@/types'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"

const { t } = useI18n()
const departmentStore = useDepartmentStore()

const state = reactive({
    departments: [] as any,
    error: {} as Error,
    isPageLoading: false,
})

onMounted(() => {
    fetchDepartments()
})

async function fetchDepartments() {
    state.error = {}
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
    departmentStore.setSelectedDepartmentName(event.target.value)
    successAlert(`${t('alert.success')}!`, `${t('department.changedDepartmentTo')} ${event.target.value === '' ? t('department.all').toLowerCase() : event.target.value}.`)
}

function changeDepartment(departmentName: string) {
    departmentStore.setSelectedDepartmentName(departmentName)
    successAlert(`${t('alert.success')}!`, `${t('department.changedDepartmentTo')} ${departmentName === '' ? t('department.all').toLowerCase() : departmentName}.`)
}

function successAlert(title: string, message: string) {
    notify({
        title: title,
        text: message,
        type: 'success',
    })
}
</script>