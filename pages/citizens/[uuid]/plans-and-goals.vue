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
                        <div class="flex justify-end items-center">
                            <FormButton buttonStyle="action" class="rounded-md"
                                @click="state.modal.isAddPlanOpen = true">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('plansandgoals.newPlan') }}
                            </FormButton>
                        </div>
                        <div class="space-y-5">
                            <div class="mb-2 gap-2 border-b border-tertiary border-dashed pb-5 px-2"
                                v-for="(plan, index) in state.plans?.data" :key="index">
                                <div class="flex items-center gap-x-3">
                                    <div class="grow space-y-1">
                                        <div class="flex items-center gap-x-2">
                                            <div>
                                                <Badge :type="plan?.is_completed ? 'active' : 'primary'">
                                                    <p class="text-xxs">
                                                        {{ plan?.is_completed ? $t('plansandgoals.completed') :
                                                            $t('plansandgoals.inProgress') }}
                                                    </p>
                                                </Badge>
                                            </div>
                                            <h3 class="text-lg font-semibold">
                                                {{ plan?.name }}
                                            </h3>
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
                                        <div class="flex items-center gap-x-2">
                                            <FormButton class="rounded-md" buttonSize="sm" @click="editPlan(plan)">
                                                <Icon name="ph:pencil-duotone" class="size-4" />
                                            </FormButton>
                                            <FormButton class="rounded-md" buttonSize="sm" @click="viewPlan(plan)">
                                                <Icon name="heroicons:chevron-right" class="size-4" />
                                            </FormButton>
                                            <FormButton class="rounded-md" buttonSize="sm"
                                                @click="confirmPlanDeletion(plan)">
                                                <Icon name="heroicons:trash" class="size-4" />
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
            <DialogConfirmation :isModalOpen="state.modal.isDeletePlanOpen"
                :message="`${$t('plansandgoals.confirmation.deleteConfirmation')}?`"
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

function editPlan(journal: any) {
    state.selectedPlan = journal
    state.modal.isEditPlanOpen = true
}

function viewPlan(journal: any) {
    state.selectedPlan = journal
    state.slideOver.isGoalOpen = true
}

function closeEditPlanModal() {
    state.modal.isEditPlanOpen = false
    state.selectedPlan = []
}

function confirmPlanDeletion(journal: any) {
    state.selectedPlan = journal
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
</script>