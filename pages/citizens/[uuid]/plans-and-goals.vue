<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.plansAndGoals') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('citizens.tabs.plansAndGoals') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesCitizenDetailsHeader />
                <ModulesCitizenJournalTabs />

                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-3">
                        <div class="flex justify-end items-center mb-5 gap-x-2">
                            <FormButton buttonStyle="" class="rounded-lg bg-white"
                                @click="state.modal.isAddPlanOpen = true">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('plansandgoals.newPlan') }}
                            </FormButton>
                            <FormButton buttonStyle="action" class="rounded-lg" @click="downloadPlansAndGoals">
                                <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('plansandgoals.download') }}
                            </FormButton>
                        </div>

                        <div class="space-y-5">
                            <div class="mb-2 gap-2 border-b border-tertiary border-dashed pb-5 px-2"
                                v-for="(plan, index) in state.plans?.data" :key="index">
                                <div class="flex flex-col md:flex-row md:items-center gap-3">
                                    <div class="grow space-y-1">
                                        <div class="flex items-center gap-x-2">
                                            <div>
                                                <Badge :type="plan?.is_completed ? 'active' : 'primary'">
                                                    <p class="text-xxs truncate">
                                                        {{ plan?.is_completed ? $t('plansandgoals.completed') :
                                                            $t('plansandgoals.inProgress') }}
                                                    </p>
                                                </Badge>
                                            </div>
                                            <h3 class="text-lg font-semibold">
                                                {{ plan?.name }}
                                            </h3>
                                        </div>
                                        <div>
                                            {{ plan?.description }}
                                        </div>
                                        <p class="text-sm">
                                            <span v-if="plan?.is_completed">
                                                {{ $t('plansandgoals.dateCompleted') }}: {{
                                                    formatDateToReadable(plan?.date_completed) }}
                                            </span>
                                            <span v-else>
                                                {{ $t('plansandgoals.completionDate') }}: {{
                                                    formatDateToReadable(plan?.completion_date) }}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <div class="flex items-center gap-3 flex-wrap md:flex-nowrap">
                                            <FormButton class="rounded-md" buttonSize="sm" @click="editPlan(plan)">
                                                <Icon name="ph:pencil-duotone" class="size-4" />
                                                {{ $t('plansandgoals.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton class="rounded-md" buttonSize="sm" @click="viewPlan(plan)">
                                                <Icon name="heroicons:chevron-right" class="size-4" />
                                                {{ $t('plansandgoals.table.actions.view') }}
                                            </FormButton>
                                            <FormButton class="rounded-md" buttonSize="sm" @click="viewStatuses(plan)">
                                                <Icon name="ph:check-square-offset" class="size-4" />
                                                {{ $t('plansandgoals.table.actions.statuses') }}
                                            </FormButton>
                                            <FormButton class="rounded-md" buttonSize="sm"
                                                @click="confirmPlanDeletion(plan)">
                                                <Icon name="heroicons:trash" class="size-4" />
                                                {{ $t('plansandgoals.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-if="state.plans?.data?.length === 0">
                                <p class="text-center">
                                    {{ $t('theresNoDataAvailableToDisplay') }}.
                                </p>
                            </div>
                            <Pagination :data="state.plans" @previous="previous" @next="next" />
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
            <ModulesCitizenPlanModalNew :isModalOpen="state.modal.isAddPlanOpen"
                @close="state.modal.isAddPlanOpen = false" @refreshPlans="fetchPlans" />
            <ModulesCitizenPlanModalEdit :isModalOpen="state.modal.isEditPlanOpen" :selectedPlan="state.selectedPlan"
                @close="closeEditPlanModal" @refreshPlans="fetchPlans" />
            <ModulesCitizenPlanStatusModalStatuses :isModalOpen="state.modal.isStatusesOpen"
                :selectedData="state.selectedPlan" @close="closeStatusesModal" @refreshData="fetchPlans" />
            <DialogConfirmation :isModalOpen="state.modal.isDeletePlanOpen"
                :message="`${$t('plansandgoals.confirmation.deletePlanConfirmation')}?`"
                @close="state.modal.isDeletePlanOpen = false" @confirm="deletePlan" />
            <ModulesCitizenPlanGoalSlideOver :isOpen="state.slideOver.isGoalOpen" :selectedPlan="state.selectedPlan"
                @close="state.slideOver.isGoalOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { planService } from '@/components/api/PlanService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'
import { saveAs } from 'file-saver'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
let currentTablePage = 1

const state = reactive({
    dataFilter: [],
    error: {} as Error,
    isPageLoading: false,
    modal: {
        isAddPlanOpen: false,
        isDeletePlanOpen: false,
        isEditPlanOpen: false,
        isStatusesOpen: false,
    },
    plans: [] as any,
    selectedPlan: [] as any,
    slideOver: {
        isGoalOpen: false
    },
    sortData: {
        sortField: 'completion_date',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchPlans()
})

async function fetchPlans() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await planService.getPlans(params)
        if (response) {
            state.plans = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function resetFilter() {
    currentTablePage = 1
    state.dataFilter = []
    state.sortData = {
        sortField: 'date',
        sortOrder: 'descend',
    }
    fetchPlans()
}

function previous() {
    currentTablePage--
    fetchPlans()
}

function next() {
    currentTablePage++
    fetchPlans()
}

function editPlan(plan: any) {
    state.selectedPlan = plan
    state.modal.isEditPlanOpen = true
}

function viewStatuses(plan: any) {
    state.selectedPlan = plan
    state.modal.isStatusesOpen = true
}

function viewPlan(plan: any) {
    state.selectedPlan = plan
    state.slideOver.isGoalOpen = true
}

function closeEditPlanModal() {
    state.modal.isEditPlanOpen = false
    state.selectedPlan = []
}

function closeStatusesModal() {
    state.modal.isStatusesOpen = false
    state.selectedPlan = []
}

function confirmPlanDeletion(plan: any) {
    state.selectedPlan = plan
    state.modal.isDeletePlanOpen = true
}

async function deletePlan() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await planService.deletePlan(state.selectedPlan.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            if (state.plans?.data?.length === 1) {
                resetFilter()
            } else {
                fetchPlans()
            }
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.alert.planSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function downloadPlansAndGoals() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid
        }
        const response = await planService.downloadPlansAndGoals(params)
        if (response) {
            if (response) {
                saveAs(response, 'Plans-and-goals' + '-' + citizenUuid)
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>