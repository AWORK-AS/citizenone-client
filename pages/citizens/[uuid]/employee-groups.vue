<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.employeeGroups') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('citizens.tabs.employeeGroups') }}</template>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <div>
                    <div class="mt-8 flex justify-end items-center mb-5 gap-x-2">
                        <FormButton buttonStyle="action" @click="openAssignModal">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('citizens.employeeGroups.assignGroup') }}
                        </FormButton>
                    </div>
                </div>

                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.groups"
                            :isLoading="state.isTableLoading">
                            <template #body v-if="!(state.isTableLoading || (state.groups?.data?.length === 0))">
                                <tr v-for="(group, index) in state.groups?.data" :key="index">
                                    <td width="80%">
                                        <span>{{ group?.name }}</span>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="confirmUnassign(group)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('citizens.employeeGroups.table.actions.unassign') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.groups" @previous="previous" @next="next" />
                </div>

                <DialogConfirmation :isModalOpen="state.modal.isUnassignOpen"
                    :message="$t('citizens.employeeGroups.confirmation.unassignConfirmation') + '?'"
                    @close="state.modal.isUnassignOpen = false" @confirm="unassignGroup" />

                <Modal size="md" :title="$t('citizens.employeeGroups.assignGroup')"
                    :show="state.modal.isAssignOpen" @close="state.modal.isAssignOpen = false">
                    <template #modal-body>
                        <Alert type="danger" :text="state?.assignError?.message"
                            v-if="state.assignError?.message && state.assignError.message.length > 0" />
                        <LoadingSpinner :isActive="state.isAssignLoading">
                            <form @submit.prevent="assignGroup()">
                                <div class="space-y-1">
                                    <p class="text-sm text-gray-600">
                                        {{ $t('citizens.employeeGroups.employeeGroups') }}
                                    </p>
                                    <FormSelect id="group_uuid" :options="state.options.groups"
                                        v-model="state.formAssign.group_uuid" class="w-full" />
                                    <FormError :error="v$?.formAssign?.group_uuid?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.assignError?.errors?.group_uuids?.[0]" />
                                </div>
                                <div class="mt-6">
                                    <FormButton type="submit" class="w-full" buttonStyle="primary">
                                        {{ $t('citizens.employeeGroups.assignGroup') }}
                                    </FormButton>
                                </div>
                            </form>
                        </LoadingSpinner>
                    </template>
                </Modal>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenEmployeeGroupService } from '@/components/api/user/CitizenEmployeeGroupService'
import { employeeGroupService } from '@/components/api/user/EmployeeGroupService'
import { useVuelidate } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from 'vue-i18n'
import { useAlert } from '@/composables/alert'
import { useCustomPagesStore } from '@/store/custom-pages'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
let currentTablePage = 1

const breadcrumbLinks = [
    {
        name: 'citizens.tabs.employeeGroups',
        translate: true,
        href: `/citizens/${citizenUuid}/employee-groups`,
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'citizens.employeeGroups.table.name', isTranslateName: true },
        { name: '' },
    ],
    groups: [] as any,
    error: {} as Error,
    assignError: {} as Error,
    isTableLoading: false,
    isAssignLoading: false,
    modal: {
        isAssignOpen: false,
        isUnassignOpen: false,
    },
    selectedGroup: null as any,
    formAssign: {
        group_uuid: null as null | string,
    },
    options: {
        groups: [] as any,
    },
})

const rules = computed(() => ({
    formAssign: {
        group_uuid: {
            required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
        },
    },
}))

const v$ = useVuelidate(rules, state)

onMounted(() => {
    fetchAssignedGroups()
})

async function fetchAssignedGroups() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await citizenEmployeeGroupService.getAssignedGroups(citizenUuid)
        if (response) {
            state.groups = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchAssignedGroups()
}

function next() {
    currentTablePage++
    fetchAssignedGroups()
}

async function openAssignModal() {
    state.assignError = {}
    state.formAssign.group_uuid = null
    v$.value.$reset()
    state.modal.isAssignOpen = true
    await fetchAvailableGroups()
}

async function fetchAvailableGroups() {
    state.isAssignLoading = true
    try {
        const response = await employeeGroupService.getEmployeeGroups({})
        if (response?.data) {
            state.options.groups = response.data.map((group: any) => ({
                value: group.uuid,
                label: group.name,
            }))
        }
    } catch (error: any) {
        state.assignError = error
    }
    state.isAssignLoading = false
}

async function assignGroup() {
    v$.value.$validate()
    if (!v$.value.$error) {
        state.assignError = {}
        state.isAssignLoading = true
        try {
            const params = { group_uuids: [state.formAssign.group_uuid as string] }
            await citizenEmployeeGroupService.assignGroups(citizenUuid, params)
            successAlert(`${t('alert.success')}!`, `${t('citizens.employeeGroups.alert.groupSuccessfullyAssigned')}.`)
            state.modal.isAssignOpen = false
            fetchAssignedGroups()
        } catch (error: any) {
            state.assignError = error
        }
        state.isAssignLoading = false
    }
}

function confirmUnassign(group: any) {
    state.selectedGroup = group
    state.modal.isUnassignOpen = true
}

async function unassignGroup() {
    state.error = {}
    state.isTableLoading = true
    try {
        await citizenEmployeeGroupService.unassignGroup(citizenUuid, state.selectedGroup?.uuid)
        successAlert(`${t('alert.success')}!`, `${t('citizens.employeeGroups.alert.groupSuccessfullyUnassigned')}.`)
        fetchAssignedGroups()
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
