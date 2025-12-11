<template>
  <div>
    <NuxtLayout name="user">
      <Head>
        <Title>
          {{ customPagesStore.getCustomPagesName?.dutySchedules }}
          {{ $t("dutySchedules.draftTemplates.draftTemplates")?.toLowerCase() }}
          -
          {{ runtimeConfig?.public?.appName }}
        </Title>
      </Head>

      <template #breadcrumb>
            <Breadcrumb>
                <template #custom-link>
                    <div class="flex items-center">
                        <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                            aria-hidden="true" />
                        <button @click="navigateTo('/schedules')"
                            class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                            {{ customPagesStore.getCustomPagesName?.dutySchedules }}
                        </button>
                    </div>
                    <div class="flex items-center">
                        <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                            aria-hidden="true" />
                        <button @click="navigateTo('/schedules/draft-templates')"
                            class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                            {{ customPagesStore.getCustomPagesName?.dutySchedules }}
                            <span class="lowercase">
                                {{ $t('dutySchedules.draftTemplates.draftTemplates') }}
                            </span>
                        </button>
                    </div>
                </template>
            </Breadcrumb>
        </template>

        <template #header>{{ $t('dutySchedules.draftTemplates.draftTemplates') }}</template>

        <div>
            <div class="flex-none lg:flex justify-between items-center space-y-3 mb-5">
                <div class="flex items-center gap-x-1">
                    <span>{{ $t('entriesPerPage') }}:</span>
                    <select class="focus:outline-none bg-transparent" @change="changePageLength"
                        id="employeesPageLength">
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="30">30</option>
                        <option value="40">40</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="500">500</option>
                    </select>
                </div>
                <div class="flex flex-wrap items-center gap-3">
                    <MenuButton @click="state.modal.isNewTemplateModalOpen = true">
                        <FormButton buttonStyle="action" class="rounded-lg">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('dutySchedules.draftTemplates.newDraft') }}
                        </FormButton>
                    </MenuButton>
                </div>
            </div>
            
            <div class="space-y-5">
                <TableSearch @search="handleSearch" />

                <div class="table-responsive">
                    <Table
                        :data="state.draftTemplates"
                        :columnHeaders="state.columnHeaders"
                        :isLoading="state.isTableLoading"
                        :noDataMessage="$t('dutySchedules.draftTemplates.table.noDraftTemplates')"
                    >
                        <template #body v-if="!(state.isTableLoading || (state.draftTemplates?.length === 0))">
                            <tr v-for="draftTemplate in state.draftTemplates" :key="draftTemplate.uuid" class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {{ draftTemplate.name }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span v-if="draftTemplate.is_recurring">
                                        {{ $t(recurringMapping[draftTemplate.recurring]) }}
                                    </span>
                                    <span v-else>
                                        {{ $t('dutySchedules.draftTemplates.table.nonRecurring') }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span v-if="draftTemplate.is_recurring">
                                        {{ draftTemplate.recurring_until ? draftTemplate.recurring_until : $t('dutySchedules.draftTemplates.table.noEndDate') }}
                                    </span>
                                </td>
                                <td width="20%">
                                    <div class="flex items-end gap-2">
                                        <Tooltip :text="$t('dutySchedules.draftTemplates.table.actions.view')">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/schedules/draft-templates/${draftTemplate.uuid}/view-details`)">
                                                <Icon name="ph:eye" class="size-4" />
                                            </FormButton>
                                        </Tooltip>

                                        <Tooltip :text="$t('dutySchedules.draftTemplates.table.actions.edit')">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md">
                                                <Icon name="ph:pencil" class="size-4" />
                                            </FormButton>
                                        </Tooltip>

                                        <Tooltip :text="$t('dutySchedules.draftTemplates.table.actions.delete')">
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="navigateTo(`/schedules/draft-templates/${draftTemplate.uuid}/view-details`)">
                                                <Icon name="ph:trash" class="size-4" />
                                            </FormButton>
                                        </Tooltip>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </Table>
                </div>
            </div>
        </div>

        <!-- Additional modals and components can be added here -->
         <ModulesUserDutyScheduleDraftTemplatesModalNewTemplate
            :isModalOpen="state.modal.isNewTemplateModalOpen"
            @refresh-draft-templates="fetchDraftTemplates"
            @close="state.modal.isNewTemplateModalOpen = false"   
        />

    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { draftTemplateService } from '@/components/api/user/DraftTemplateService'
import { useCustomPagesStore } from "@/store/custom-pages";
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig();
const customPagesStore = useCustomPagesStore() as any;
const { t } = useI18n()
const { successAlert } = useAlert()

const recurringMapping: any = {
    'everyday': 'dutySchedules.draftTemplates.recurring.everyday',
    'every_week': 'dutySchedules.draftTemplates.recurring.everyWeek',
    'every_second_week': 'dutySchedules.draftTemplates.recurring.everySecondWeek',
    'every_third_week': 'dutySchedules.draftTemplates.recurring.everyThirdWeek',
    'every_fourth_week': 'dutySchedules.draftTemplates.recurring.everyFourthWeek',
    'every_month': 'dutySchedules.draftTemplates.recurring.everyMonth',
    'custom': 'dutySchedules.draftTemplates.recurring.custom',
}

const state = reactive({
    columnHeaders: [
        { name: 'dutySchedules.draftTemplates.table.name', sorter: true, key: 'name' },
        { name: 'dutySchedules.draftTemplates.table.recurring', sorter: true, key: 'recurring' },
        { name: 'dutySchedules.draftTemplates.table.recurringUntil', sorter: false, key: 'recurring_until' },
        { name: '', sorter: false, key: 'actions' },
    ],
    draftTemplates: [] as any,
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isNewTemplateModalOpen: false,
    },
    selectedDraftTemplate: {} as any,
});

onMounted(() => {
    fetchDraftTemplates()
})

async function fetchDraftTemplates() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await draftTemplateService.getDraftTemplates({})
        if (response?.data) {
            state.draftTemplates = response.data
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isTableLoading = false
    }
}

function handleSearch(searchQuery: string) {
    // Implement search logic here, possibly filtering state.draftTemplates based on searchQuery
    console.log('Search query:', searchQuery)
}

function changePageLength(event: any) {
    const selectedLength = event.target.value
    // Implement logic to change page length and fetch data accordingly
    console.log('Selected page length:', selectedLength)
}
</script>
