<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('wellbeing.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('wellbeing.title') }}</template>

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

                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <p class="mt-8 max-w-3xl text-sm text-gray-500">{{ $t('wellbeing.description') }}</p>

                <!-- The citizen first, then everyone related to them - in a
                     children's case the siblings on the same intervention. -->
                <div class="space-y-4">
                    <ModulesUserCitizenWellbeingParty v-for="party in parties" :key="party.uuid"
                        :citizenUuid="party.uuid" :name="party.name" :relationship="party.relationship"
                        :isPrimary="party.isPrimary" />
                </div>

                <p v-if="!state.isLoading && parties.length === 1" class="text-xs text-gray-400">
                    {{ $t('wellbeing.noRelations') }}
                    <NuxtLink :to="`/citizens/${citizenUuid}/relations`" class="text-secondary hover:underline">
                        {{ $t('citizenRelations.title') }}
                    </NuxtLink>
                </p>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenRelationService } from '@/components/api/user/CitizenRelationService'
import { citizenService } from '@/components/api/user/CitizenService'
import { useCustomPagesStore } from '@/store/custom-pages'
import type { Error } from '@/types'

definePageMeta({ middleware: 'require-page', requiredPage: 'Wellbeing' })

const runtimeConfig = useRuntimeConfig()
const customPagesStore = useCustomPagesStore() as any
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any

const breadcrumbLinks = [
    {
        name: 'wellbeing.title',
        translate: true,
        href: `/citizens/${citizenUuid}/wellbeing`,
    },
]

const state = reactive({
    citizen: null as any,
    relations: [] as any[],
    error: {} as Error,
    isLoading: false,
})

// A relation is stored once for both sides, so the other citizen is whichever
// side is not this page's.
function otherCitizen(relation: any) {
    return relation?.citizen?.uuid === citizenUuid ? relation?.related_citizen : relation?.citizen
}

function fullName(citizen: any): string {
    return `${citizen?.firstname ?? ''} ${citizen?.lastname ?? ''}`.trim()
}

const parties = computed(() => {
    const list: any[] = [{
        uuid: citizenUuid,
        name: fullName(state.citizen) || '…',
        relationship: '',
        isPrimary: true,
    }]
    const seen = new Set([citizenUuid])

    for (const relation of state.relations) {
        const other = otherCitizen(relation)
        if (!other?.uuid || seen.has(other.uuid)) continue
        seen.add(other.uuid)
        list.push({ uuid: other.uuid, name: fullName(other), relationship: relation?.relationship?.name ?? '', isPrimary: false })
    }

    return list
})

onMounted(async () => {
    state.isLoading = true
    // Relations sit behind the Contacts page, which not everyone who writes
    // journals has. Without them the citizen's own measurements still show.
    const [citizen, relations] = await Promise.allSettled([
        citizenService.getCitizen(citizenUuid),
        citizenRelationService.getRelations({ citizen_uuid: citizenUuid }),
    ])
    if (citizen.status === 'fulfilled') {
        state.citizen = citizen.value?.data ?? null
    } else {
        state.error = citizen.reason
    }
    state.relations = relations.status === 'fulfilled' ? (relations.value?.data ?? []) : []
    state.isLoading = false
})
</script>
