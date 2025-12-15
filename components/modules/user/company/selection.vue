<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <p class="text-sm md:text-base font-medium truncate max-w-24 md:max-w-fit"
            v-if="state.companies?.data?.length === 1">
            {{ userStore.getUser?.company?.name }}
        </p>
        <div class="block md:hidden" v-if="state.companies?.data?.length > 1">
            <select class="w-24 sm:w-fit focus:outline-none" @change="selectCompany" id="selectCompany">
                <option v-for="(data, index) in state.companies?.data" :key="index"
                    :value="JSON.stringify(data?.company)"
                    :selected="data?.company?.uuid === companyStore.getSelectedCompany?.uuid">
                    {{ data?.company?.name }}
                </option>
            </select>
        </div>
        <div class="hidden md:block" v-if="state.companies?.data?.length > 1">
            <Menu as="div" class="relative inline-block text-left w-34">
                <div>
                    <MenuButton
                        class="inline-flex w-full items-center justify-center gap-x-2 rounded-md bg-primary px-5 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-inset ring-primary hover:bg-primary-600">
                        {{ $t('company.company') }}:
                        {{ Object.keys(companyStore.getSelectedCompany).length === 0 ?
                            state.companies?.data?.[0]?.company?.name
                            :
                            companyStore.getSelectedCompany?.name }}
                        <Icon name="heroicons:chevron-down" class="-mr-1 h-5 w-5 text-white" aria-hidden="true" />
                    </MenuButton>
                </div>

                <transition enter-active-class="transition ease-out duration-100"
                    enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
                    leave-active-class="transition ease-in duration-75"
                    leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                    <MenuItems
                        class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-96 overflow-y-auto">
                        <div class="py-1">
                            <MenuItem v-slot="{ active }" v-for="(data, index) in state.companies?.data" :key="index">
                            <a :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'cursor-pointer block px-4 py-2 text-sm']"
                                @click="changeCompany(data?.company)">
                                {{ data?.company?.name }}
                            </a>
                            </MenuItem>
                        </div>
                    </MenuItems>
                </transition>
            </Menu>
            <ModulesUserCompanyModalSwitchAnnouncement :isModalOpen="state.modal.isSwitchAnnouncementModalOpen"
                @close="state.modal.isSwitchAnnouncementModalOpen = false" />
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { companyService } from '@/components/api/user/CompanyService'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import type { Error } from '@/types'
import { useCitizenStore } from '@/store/citizen'
import { useEmployeeStore } from '@/store/employee'
import { useCompanyStore } from '@/store/company'
import { useUserStore } from '@/store/user'

const citizenStore = useCitizenStore() as any
const employeeStore = useEmployeeStore() as any
const companyStore = useCompanyStore() as any
const userStore = useUserStore() as any

const state = reactive({
    companies: [] as any,
    error: {} as Error,
    isPageLoading: false,
    modal: {
        isSwitchAnnouncementModalOpen: false,
    },
})

onMounted(() => {
    fetchCompanies()
})

async function fetchCompanies() {
    state.error = {}
    try {
        const response = await companyService.getAllCompanies()
        if (response) {
            state.companies = response
        }
    } catch (error: any) {
        state.error = error
    }
}

function selectCompany(event: any) {
    citizenStore.setCurrentPageNumber(1)
    employeeStore.setCurrentPageNumber(1)
    companyStore.setSelectedCompany(JSON.parse(event.target.value))
    state.modal.isSwitchAnnouncementModalOpen = true
}

function changeCompany(company: any) {
    citizenStore.setCurrentPageNumber(1)
    employeeStore.setCurrentPageNumber(1)
    companyStore.setSelectedCompany(company)
    state.modal.isSwitchAnnouncementModalOpen = true
}
</script>