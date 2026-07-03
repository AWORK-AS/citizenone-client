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
                    <FormButton buttonStyle="action" @click="state.modal.isAddRelationOpen = true" v-if="canCreate">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('citizenRelations.new') }}
                    </FormButton>
                </div>

                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <!-- Cards -->
                <div v-if="state.relations?.data?.length > 0"
                    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                    <div v-for="(relation, index) in state.relations.data" :key="index"
                        class="group relative rounded-xl border border-surface-200 bg-white p-4 shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card-hover hover:border-secondary/30 cursor-pointer"
                        @click="openRelated(relation)">
                        <div class="flex items-center gap-3">
                            <div
                                class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2dbab2] to-[#1b6d8a] text-white font-bold text-sm">
                                {{ initials(otherCitizen(relation)) }}
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="truncate font-semibold text-slate-900">
                                    {{ otherCitizen(relation)?.firstname }} {{ otherCitizen(relation)?.lastname }}
                                </p>
                                <span v-if="relation?.relationship"
                                    class="mt-1 inline-flex items-center rounded-full bg-[#f0faf9] px-2 py-0.5 text-xs font-semibold text-[#1b6d8a]">
                                    {{ relation.relationship.name }}
                                </span>
                                <span v-else class="text-xs text-slate-400">{{ $t('citizenRelations.relationshipType') }}</span>
                            </div>
                            <button type="button"
                                class="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                                @click.stop="deleteRelationConfirmation(relation)"
                                v-if="canDelete" :aria-label="$t('citizenRelations.action')">
                                <Icon name="ph:trash" class="size-4" />
                            </button>
                        </div>
                        <div
                            class="mt-3 flex items-center gap-1 text-xs font-medium text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>{{ $t('citizenRelations.title') }}</span>
                            <Icon name="ph:arrow-right" class="size-3.5" />
                        </div>
                    </div>
                </div>

                <!-- Empty state -->
                <div v-else-if="!state.isTableLoading"
                    class="rounded-xl border border-dashed border-surface-200 bg-surface-50 py-14 px-6 text-center">
                    <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f0faf9] text-[#2dbab2]">
                        <Icon name="ph:users-three" class="size-6" />
                    </div>
                    <p class="mt-3 text-sm text-slate-500">{{ $t('citizenRelations.empty') }}</p>
                    <div class="mt-4 flex justify-center" v-if="canCreate">
                        <FormButton buttonStyle="action" @click="state.modal.isAddRelationOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('citizenRelations.addFirst') }}
                        </FormButton>
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
import { useCommandPalette } from '@/composables/useCommandPalette'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
const { isAtLeast, can } = usePermissions()
const { setPageCommands, clearPageCommands } = useCommandPalette()

const canCreate = computed(() => isAtLeast('Admin') || can('create_citizen') || can('create'))
const canDelete = computed(() => isAtLeast('Admin') || can('delete_citizen') || can('delete'))

const breadcrumbLinks = [
    {
        name: 'citizenRelations.title',
        translate: true,
        href: `/citizens/${citizenUuid}/relations`,
    },
]

const state = reactive({
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

function initials(citizen: any) {
    const parts = `${citizen?.firstname ?? ''} ${citizen?.lastname ?? ''}`.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return '?'
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function openRelated(relation: any) {
    const uuid = otherCitizen(relation)?.uuid
    if (uuid) navigateTo(`/citizens/${uuid}/relations`)
}

onMounted(() => {
    fetchRelations()
    fetchCitizenOptions()
    fetchRelationshipOptions()
    setPageCommands([
        {
            id: 'relation-add',
            group: t('commandPalette.actions'),
            icon: 'ph:users-three',
            label: t('citizenRelations.new'),
            run: () => { state.modal.isAddRelationOpen = true },
        },
    ])
})

onBeforeUnmount(() => clearPageCommands())

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
