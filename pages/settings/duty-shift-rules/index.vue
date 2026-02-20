<template>
    <div>
        <NuxtLayout name="user">
            <Head>
                <Title>{{ $t('dutyShiftRules.dutyShiftRules') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>{{ $t('dutyShiftRules.dutyShiftRules') }}</template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="navigateTo('/settings/duty-shift-rules/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('dutyShiftRules.newDutyShiftRule') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.rules"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.rules?.data?.length === 0))">
                                <tr v-for="(rule, index) in state.rules?.data" :key="index">
                                    <td>{{ rule?.name }}</td>
                                    <td>{{ rule?.period_days }}</td>
                                    <td>{{ $t(`dutyShiftRules.form.conditionTypes.${rule?.condition_type}`) }}</td>
                                    <td>
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/duty-shift-rules/${rule.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('dutyShiftRules.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="deleteRuleConfirmation(rule)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('dutyShiftRules.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.rules" @previous="previous" @next="next" />
                </div>
            </div>

            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="$t('dutyShiftRules.table.confirmation.deleteDutyShiftRuleConfirmation') + '?'"
                @close="state.modal.isDeleteOpen = false" @confirm="deleteRule" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { dutyShiftRuleService } from '@/components/api/user/DutyShiftRuleService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

const breadcrumbLinks = [
    { name: 'dutyShiftRules.dutyShiftRules', translate: true, href: '/settings/duty-shift-rules' },
]

const state = reactive({
    rules: [] as any,
    columnHeaders: [
        { name: 'dutyShiftRules.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'dutyShiftRules.table.periodDays', isTranslateName: true, sorter: true, key: 'period_days' },
        { name: 'dutyShiftRules.table.conditionType', isTranslateName: true },
        { name: '' },
    ],
    dataFilter: { search: '' },
    error: {} as Error,
    isTableLoading: false,
    modal: { isDeleteOpen: false },
    selectedRule: {} as any,
    sortData: { sortField: 'id', sortOrder: 'descend' },
})

onMounted(() => fetchRules())

async function fetchRules() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        }
        const response = await dutyShiftRuleService.getRules(params)
        if (response) state.rules = response
    } catch (error: any) { state.error = error }
    state.isTableLoading = false
}

function previous() { currentTablePage--; fetchRules() }
function next() { currentTablePage++; fetchRules() }
function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = { sortField: sortingData.column, sortOrder: sortingData.sort }
    fetchRules()
}
function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchRules()
}
function deleteRuleConfirmation(rule: any) {
    state.selectedRule = rule
    state.modal.isDeleteOpen = true
}
async function deleteRule() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await dutyShiftRuleService.deleteRule(state.selectedRule.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchRules()
            successAlert(`${t('alert.success')}!`, `${t('dutyShiftRules.table.alert.dutyShiftRuleSuccessfullyDeleted')}.`)
        }
    } catch (error: any) { state.error = error }
    state.isTableLoading = false
}
</script>
