<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employeeGroups.citizens.assignedCitizens') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('employeeGroups.citizens.assignedCitizens') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    :to="`/settings/employee-groups/${employeeGroupUuid}/edit`">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <div class="mt-8 flex justify-end items-center mb-5 gap-x-2">
                    <FormButton buttonStyle="action" @click="openAssignModal">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('employeeGroups.citizens.assignCitizen') }}
                    </FormButton>
                </div>

                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.citizens"
                            :isLoading="state.isTableLoading">
                            <template #body v-if="!(state.isTableLoading || (state.citizens?.data?.length === 0))">
                                <tr v-for="(citizen, index) in state.citizens?.data" :key="index">
                                    <td width="40%">
                                        <span>{{ citizen?.firstname }}</span>
                                    </td>
                                    <td width="40%">
                                        <span>{{ citizen?.lastname }}</span>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="confirmUnassign(citizen)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('employeeGroups.citizens.table.actions.unassign') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.citizens" @previous="previous" @next="next" />
                </div>
            </div>

            <DialogConfirmation :isModalOpen="state.modal.isUnassignOpen"
                :message="$t('employeeGroups.citizens.confirmation.unassignConfirmation') + '?'"
                @close="state.modal.isUnassignOpen = false" @confirm="unassignCitizen" />

            <Modal size="md" :title="$t('employeeGroups.citizens.assignCitizen')"
                :show="state.modal.isAssignOpen" @close="state.modal.isAssignOpen = false">
                <template #modal-body>
                    <Alert type="danger" :text="state?.assignError?.message"
                        v-if="state.assignError?.message && state.assignError.message.length > 0" />
                    <LoadingSpinner :isActive="state.isAssignLoading">
                        <form @submit.prevent="assignCitizen()">
                            <div class="space-y-1">
                                <p class="text-sm text-gray-600">
                                    {{ $t('employeeGroups.citizens.citizens') }}
                                </p>
                                <FormSelect id="citizen_uuid" :options="state.options.citizens"
                                    v-model="state.formAssign.citizen_uuid" class="w-full" />
                                <FormError :error="v$?.formAssign?.citizen_uuid?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.assignError?.errors?.citizen_uuids?.[0]" />
                            </div>
                            <div class="mt-6">
                                <FormButton type="submit" class="w-full" buttonStyle="primary">
                                    {{ $t('employeeGroups.citizens.assignCitizen') }}
                                </FormButton>
                            </div>
                        </form>
                    </LoadingSpinner>
                </template>
            </Modal>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employeeGroupService } from '@/components/api/user/EmployeeGroupService'
import { citizenService } from '@/components/api/user/CitizenService'
import { useVuelidate } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from 'vue-i18n'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const employeeGroupUuid = router?.currentRoute?.value?.params?.uuid as any
let currentTablePage = 1

const breadcrumbLinks = [
    {
        name: 'employeeGroups.employeeGroups',
        translate: true,
        href: '/settings/employee-groups',
    },
    {
        name: 'employeeGroups.citizens.assignedCitizens',
        translate: true,
        href: `/settings/employee-groups/${employeeGroupUuid}/citizens`,
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'employeeGroups.citizens.table.firstname', isTranslateName: true },
        { name: 'employeeGroups.citizens.table.lastname', isTranslateName: true },
        { name: '' },
    ],
    citizens: [] as any,
    error: {} as Error,
    assignError: {} as Error,
    isTableLoading: false,
    isAssignLoading: false,
    modal: {
        isAssignOpen: false,
        isUnassignOpen: false,
    },
    selectedCitizen: null as any,
    formAssign: {
        citizen_uuid: null as null | string,
    },
    options: {
        citizens: [] as any,
    },
})

const rules = computed(() => ({
    formAssign: {
        citizen_uuid: {
            required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
        },
    },
}))

const v$ = useVuelidate(rules, state)

onMounted(() => {
    fetchAssignedCitizens()
})

async function fetchAssignedCitizens() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await employeeGroupService.getAssignedCitizens(employeeGroupUuid)
        if (response) {
            state.citizens = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchAssignedCitizens()
}

function next() {
    currentTablePage++
    fetchAssignedCitizens()
}

async function openAssignModal() {
    state.assignError = {}
    state.formAssign.citizen_uuid = null
    v$.value.$reset()
    state.modal.isAssignOpen = true
    await fetchAvailableCitizens()
}

async function fetchAvailableCitizens() {
    state.isAssignLoading = true
    try {
        const response = await citizenService.getAllCitizens({})
        if (response?.data) {
            state.options.citizens = response.data.map((citizen: any) => ({
                value: citizen.uuid,
                label: `${citizen.firstname}${citizen.lastname ? ' ' + citizen.lastname : ''}`,
            }))
        }
    } catch (error: any) {
        state.assignError = error
    }
    state.isAssignLoading = false
}

async function assignCitizen() {
    v$.value.$validate()
    if (!v$.value.$error) {
        state.assignError = {}
        state.isAssignLoading = true
        try {
            const params = { citizen_uuids: [state.formAssign.citizen_uuid as string] }
            await employeeGroupService.assignCitizens(employeeGroupUuid, params)
            successAlert(`${t('alert.success')}!`, `${t('employeeGroups.citizens.alert.citizenSuccessfullyAssigned')}.`)
            state.modal.isAssignOpen = false
            fetchAssignedCitizens()
        } catch (error: any) {
            state.assignError = error
        }
        state.isAssignLoading = false
    }
}

function confirmUnassign(citizen: any) {
    state.selectedCitizen = citizen
    state.modal.isUnassignOpen = true
}

async function unassignCitizen() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await employeeGroupService.unassignCitizen(employeeGroupUuid, state.selectedCitizen?.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            successAlert(`${t('alert.success')}!`, `${t('employeeGroups.citizens.alert.citizenSuccessfullyUnassigned')}.`)
            fetchAssignedCitizens()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
