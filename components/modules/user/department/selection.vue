<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <div class="block md:hidden" v-if="state.departments?.data?.length > 0">
            <select class="focus:outline-none" @change="selectDepartment" id="selectDepartment">
                <option v-for="(department, index) in state.departments?.data" :key="index" :value="department.name"
                    :selected="department?.name === departmentStore.getSelectedDepartmentName">
                    {{ department?.name }}
                </option>
            </select>
        </div>
        <div class="hidden md:block" v-if="state.departments?.data?.length > 0">
            <Menu as="div" class="relative inline-block text-left w-34">
                <div>
                    <MenuButton
                        class="inline-flex w-full items-center justify-center gap-x-2 rounded-md bg-primary px-5 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-inset ring-primary hover:bg-primary-600">
                        {{ $t('department.department') }}:
                        {{ departmentStore.getSelectedDepartmentName === '' ? state.departments?.data?.[0]?.name :
                            departmentStore.getSelectedDepartmentName }}
                        <Icon name="heroicons:chevron-down" class="-mr-1 h-5 w-5 text-white" aria-hidden="true" />
                    </MenuButton>
                </div>

                <transition enter-active-class="transition ease-out duration-100"
                    enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
                    leave-active-class="transition ease-in duration-75"
                    leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                    <MenuItems
                        class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div class="py-1">
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
import { departmentService } from '@/components/api/user/DepartmentService'
import { useDepartmentStore } from '@/store/department'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import type { Error } from '@/types'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"

const { t } = useI18n()
const { successAlert } = useAlert()
const language = useI18n()
const departmentStore = useDepartmentStore()

const state = reactive({
    departments: [] as any,
    error: {} as Error,
    isPageLoading: false,
})

onMounted(() => {
    fetchDepartments()
})

watch(() => language.locale.value, (newLanguage: any) => {
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
    successAlert(`${t('alert.success')}!`, `${t('department.changedDepartmentTo')} ${event.target.value === '' ? t('department.all')?.toLowerCase() : event.target.value}.`)
}

function changeDepartment(departmentName: string) {
    departmentStore.setSelectedDepartmentName(departmentName)
    successAlert(`${t('alert.success')}!`, `${t('department.changedDepartmentTo')} ${departmentName === '' ? t('department.all')?.toLowerCase() : departmentName}.`)
}
</script>