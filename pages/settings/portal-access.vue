<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('portalAccess.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('portalAccess.title') }}</template>

            <ModulesUserSettingsTab />

            <div class="space-y-5 mt-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div class="flex flex-wrap items-center justify-between gap-3">
                    <p class="text-sm text-gray-500">
                        {{ $t('portalAccess.intro') }}.
                    </p>
                    <FormButton type="button" buttonStyle="action" @click="navigateTo('/settings/company')">
                        <Icon name="ph:eye" class="size-4" />
                        {{ $t('portalAccess.chooseWhatTheySee') }}
                    </FormButton>
                </div>

                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-6">
                        <div v-for="group in state.groups" :key="group.audience"
                            class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div class="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-100">
                                <span
                                    class="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                                    <Icon :name="groupIcon(group.audience)" class="w-5 h-5" />
                                </span>
                                <div>
                                    <p class="font-semibold text-gray-800 text-sm">
                                        {{ $t(`portalAccess.audience.${group.audience}`) }}
                                    </p>
                                    <!-- The patient portal is sold per clinic, so it has no seat
                                         count - the useful number is how many can get in. -->
                                    <p class="text-xs text-gray-500" v-if="group.seats_total === null">
                                        {{ $t('portalAccess.peopleWithAccess', { count: group.seats_used }) }}
                                    </p>
                                    <p class="text-xs text-gray-500" v-else>
                                        {{ $t('portalAccess.seatsInUse', {
                                            used: group.seats_used, total: group.seats_total
                                        }) }}
                                    </p>
                                </div>
                                <div class="ml-auto flex items-center gap-3">
                                    <span v-if="group.seats_total === null"
                                        class="text-xs font-medium rounded-full bg-green-100 text-green-800 px-3 py-1">
                                        {{ $t('portalAccess.includedForTheClinic') }}
                                    </span>
                                    <span v-else-if="group.seats_total === 0"
                                        class="text-xs font-medium rounded-full bg-gray-100 text-gray-600 px-3 py-1">
                                        {{ $t('portalAccess.appNotBought') }}
                                    </span>
                                    <span v-else-if="group.seats_available === 0"
                                        class="text-xs font-medium rounded-full bg-amber-100 text-amber-900 px-3 py-1">
                                        {{ $t('portalAccess.noSeatsLeft') }}
                                    </span>
                                    <span v-else
                                        class="text-xs font-medium rounded-full bg-green-100 text-green-800 px-3 py-1">
                                        {{ $t('portalAccess.seatsAvailable', { count: group.seats_available }) }}
                                    </span>
                                    <FormButton v-if="group.seats_total !== null" type="button" buttonStyle="action"
                                        @click="navigateTo('/apps')">
                                        {{ group.seats_total === 0 ? $t('portalAccess.getApp') :
                                            $t('portalAccess.buyMoreSeats') }}
                                    </FormButton>
                                </div>
                            </div>

                            <div v-if="group.people.length === 0" class="px-5 py-8 text-center text-sm text-gray-500">
                                {{ $t('portalAccess.nobodyHasAccess') }}.
                            </div>
                            <div v-else class="table-responsive">
                                <table class="min-w-full divide-y divide-gray-100 text-sm">
                                    <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                        <tr>
                                            <th class="px-5 py-3 text-left">{{ $t('portalAccess.table.name') }}</th>
                                            <th class="px-5 py-3 text-left">{{ $t('portalAccess.table.email') }}</th>
                                            <th class="px-5 py-3 text-left">{{ $t('portalAccess.table.citizen') }}</th>
                                            <th class="px-5 py-3 text-left">{{ $t('portalAccess.table.status') }}</th>
                                            <th class="px-5 py-3 text-left">{{ $t('portalAccess.table.grantedAt') }}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-100">
                                        <tr v-for="person in group.people" :key="person.uuid">
                                            <td class="px-5 py-3 font-medium">{{ person.name }}</td>
                                            <td class="px-5 py-3 text-gray-600">{{ person.email || '-' }}</td>
                                            <td class="px-5 py-3">
                                                <button v-if="person.citizen_uuid"
                                                    class="text-primary hover:underline"
                                                    @click="navigateTo(`/citizens/${person.citizen_uuid}/contacts`)">
                                                    {{ person.citizen_name }}
                                                </button>
                                                <span v-else class="text-gray-400">-</span>
                                            </td>
                                            <td class="px-5 py-3">
                                                <span v-if="person.has_signed_in"
                                                    class="text-xs font-medium rounded-full bg-green-100 text-green-800 px-2 py-0.5">
                                                    {{ $t('portalAccess.status.active') }}
                                                </span>
                                                <span v-else
                                                    class="text-xs font-medium rounded-full bg-amber-100 text-amber-900 px-2 py-0.5">
                                                    {{ $t('portalAccess.status.invited') }}
                                                </span>
                                            </td>
                                            <td class="px-5 py-3 text-gray-600">
                                                {{ person.granted_at ? formatDateToReadable(person.granted_at) : '-' }}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
function groupIcon(audience: string): string {
    if (audience === 'relative') return 'ph:users-three'
    if (audience === 'patient') return 'ph:tooth'

    return 'ph:handshake'
}

import { portalAccessService } from '@/components/api/user/PortalAccessService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()

const breadcrumbLinks = [
    {
        name: 'portalAccess.title',
        translate: true,
        href: '/settings/portal-access',
    },
]

const state = reactive({
    error: {} as Error,
    groups: [] as any[],
    isPageLoading: false,
})

onMounted(() => {
    fetchOverview()
})

async function fetchOverview() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await portalAccessService.getOverview()
        if (response?.data) {
            state.groups = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
