<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizenRelations.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('citizenRelations.title') }}</template>

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

                <div class="mt-8 flex justify-end items-center mb-5 gap-x-2">
                    <FormButton buttonStyle="action" @click="state.modal.isAddRelationOpen = true"
                        v-if="isAtLeast('Admin') || can('create_citizen') || can('create')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('citizenRelations.new') }}
                    </FormButton>
                </div>

                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.relations"
                            :isLoading="state.isTableLoading">
                            <template #body v-if="!(state.isTableLoading || (state.relations?.data?.length === 0))">
                                <tr v-for="(relation, index) in state.relations?.data" :key="index"
                                    :data-uuid="relation.uuid">
                                    <td width="50%">
                                        <span>{{ otherCitizen(relation)?.firstname }}</span>
                                        <span>&nbsp;{{ otherCitizen(relation)?.lastname }}</span>
                                    </td>
                                    <td width="35%">
                                        <Badge type="primary" class="w-fit" v-if="relation?.relationship">
                                            <p class="text-xxs px-2">{{ relation?.relationship?.name }}</p>
                                        </Badge>
                                        <span v-else class="text-gray-400">—</span>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="deleteRelationConfirmation(relation)"
                                                v-if="isAtLeast('Admin') || can('delete_citizen') || can('delete')">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('citizenRelations.action') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                        <p v-if="!state.isTableLoading && state.relations?.data?.length === 0"
                            class="text-sm text-gray-400 text-center py-6">
                            {{ $t('citizenRelations.empty') }}
                        </p>
                    </div>
                </div>

                <ModulesUserCitizenRelationModalNew :isModalOpen="state.modal.isAddRelationOpen"
                    :citizenUuid="citizenUuid" :citizenOptions="state.citizenOptions"
                    :relationshipOptions="state.relationshipOptions"
                    @close="state.modal.isAddRelationOpen = false" @refreshRelations="fetchRelations" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteRelationOpen"
                    :message="$t('citizenRelations.deleteConfirmation') + '?'"
                    @close="state.modal.isDeleteRelationOpen = false" @confirm="deleteRelation" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenRelationService } from '@/components/api/user/CitizenRelationService'
import { citizenService } from '@/components/api/user/CitizenService'
import { relationshipService } from '@/components/api/user/RelationshipService'
import { useI18n } from 'vue-i18n'
import { useAlert } from '@/composables/alert'
import { useCustomPagesStore } from '@/store/custom-pages'
import { usePermissions } from '@/composables/usePermissions'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
const { isAtLeast, can } = usePermissions()

const breadcrumbLinks = [
    {
        name: 'citizenRelations.title',
        translate: true,
        href: `/citizens/${citizenUuid}/relations`,
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'citizenRelations.name', isTranslateName: true },
        { name: 'citizenRelations.relationshipType', isTranslateName: true },
        { name: '' },
    ],
    relations: { data: [] } as any,
    citizenOptions: [] as any,
    relationshipOptions: [] as any,
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isAddRelationOpen: false,
        isDeleteRelationOpen: false,
    },
    selectedRelation: null as any,
})

// A relation is symmetric and stored once, so the "other" citizen is whichever
// side isn't the one whose page we're on.
function otherCitizen(relation: any) {
    return relation?.citizen?.uuid === citizenUuid ? relation?.related_citizen : relation?.citizen
}

onMounted(() => {
    fetchRelations()
    fetchCitizenOptions()
    fetchRelationshipOptions()
})

async function fetchRelations() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await citizenRelationService.getRelations({ citizen_uuid: citizenUuid })
        if (response) {
            state.relations = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function fetchCitizenOptions() {
    try {
        const response = await citizenService.getAllCitizens({})
        if (response?.data) {
            state.citizenOptions = response.data.map((citizen: any) => ({
                value: citizen?.uuid,
                label: `${citizen?.firstname} ${citizen?.lastname}`,
            }))
        }
    } catch {
        // optional — leave empty on failure
    }
}

async function fetchRelationshipOptions() {
    try {
        const response = await relationshipService.getAllRelationships()
        if (response?.data) {
            state.relationshipOptions = response.data.map((relationship: any) => ({
                value: relationship?.uuid,
                label: relationship?.name,
            }))
        }
    } catch {
        // optional — relationship type is not required
    }
}

function deleteRelationConfirmation(relation: any) {
    state.selectedRelation = relation
    state.modal.isDeleteRelationOpen = true
}

async function deleteRelation() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await citizenRelationService.deleteRelation(state.selectedRelation.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            state.modal.isDeleteRelationOpen = false
            fetchRelations()
            successAlert(`${t('alert.success')}!`, `${t('citizenRelations.deleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
