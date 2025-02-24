<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('plansandgoals.VUMTemplates.plansTemplate') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('plansandgoals.VUMTemplates.plansTemplate') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/vum-templates">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="mt-8 space-y-3">
                        <div class="flex justify-end items-center mb-5 gap-x-2">
                            <FormButton buttonStyle="action" class="rounded-lg"
                                @click="state.modal.isAddPlanOpen = true">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('plansandgoals.VUMTemplates.newPlan') }}
                            </FormButton>
                        </div>

                        <div class="space-y-5">
                            <div class="bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-4 border-secondary"
                                v-for="(plan, index) in state.plans?.data" :key="index">
                                <div class="flex flex-col md:flex-row md:items-center gap-3 md:gap-10">
                                    <div class="grow space-y-1">
                                        <div class="flex items-center gap-x-2">
                                            <h3 class="text-lg font-semibold">
                                                {{ plan?.name }}
                                            </h3>
                                        </div>
                                        <div class="text-sm">
                                            <div v-html="plan?.description" class="content" />
                                        </div>
                                        <p class="text-sm">
                                            {{ $t('plansandgoals.VUMTemplates.table.plans.completionDate') }}: {{
                                                formatDateToReadable(plan?.completion_date) }}
                                        </p>
                                    </div>
                                    <div>
                                        <div class="flex items-center gap-2 flex-wrap md:flex-nowrap">
                                            <FormButton class="rounded-md" buttonSize="sm" @click="viewPlan(plan)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('plansandgoals.VUMTemplates.table.actions.viewGoals') }}
                                            </FormButton>
                                            <FormButton class="rounded-md" buttonSize="sm" @click="editPlan(plan)">
                                                <Icon name="ph:pencil-duotone" class="size-4" />
                                                {{ $t('plansandgoals.VUMTemplates.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton class="rounded-md" buttonSize="sm"
                                                @click="confirmPlanDeletion(plan)">
                                                <Icon name="heroicons:trash" class="size-4" />
                                                {{ $t('plansandgoals.VUMTemplates.table.actions.delete') }}
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
            <ModulesVumTemplatePlanModalNew :isModalOpen="state.modal.isAddPlanOpen"
                @close="state.modal.isAddPlanOpen = false" @refreshTemplates="fetchPlans" />
            <ModulesVumTemplatePlanModalEdit :isModalOpen="state.modal.isEditPlanOpen"
                :selectedTemplate="state.selectedPlan" @close="closeEditPlanModal" @refreshTemplates="fetchPlans" />
            <DialogConfirmation :isModalOpen="state.modal.isDeletePlanOpen"
                :message="`${$t('plansandgoals.confirmation.deletePlanConfirmation')}?`"
                @close="state.modal.isDeletePlanOpen = false" @confirm="deletePlan" />
            <ModulesVumTemplatePlanGoalSlideOver :isOpen="state.slideOver.isGoalOpen" :selectedPlan="state.selectedPlan"
                @close="state.slideOver.isGoalOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { planTemplateService } from '@/components/api/PlanTemplateService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const templateUuid = router?.currentRoute?.value?.params?.template_uuid
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'plansandgoals.VUMTemplates.templates',
        translate: true,
        href: '/vum-templates',
    },
    {
        name: 'plansandgoals.VUMTemplates.plansTemplate',
        translate: true,
        href: `/vum-templates/${templateUuid}/plans-template`,
    },
]

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
    selectedPlan: {} as any,
    slideOver: {
        isGoalOpen: false
    },
    sortData: {
        sortField: 'id',
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
            template_uuid: templateUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await planTemplateService.getTemplates(params)
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
        sortField: 'id',
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

function viewPlan(plan: any) {
    state.selectedPlan = plan
    state.slideOver.isGoalOpen = true
}

function closeEditPlanModal() {
    state.modal.isEditPlanOpen = false
    state.selectedPlan = {}
}

function confirmPlanDeletion(plan: any) {
    state.selectedPlan = plan
    state.modal.isDeletePlanOpen = true
}

async function deletePlan() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await planTemplateService.deleteTemplate(state.selectedPlan.uuid)
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