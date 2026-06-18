<template>
    <div>
        <NuxtLayout name="referrer">

            <Head>
                <Title>{{ $t('referrer.citizens') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <BreadcrumbReferrer>
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/referrer/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ $t('referrer.citizens') }}
                            </button>
                        </div>
                    </template>
                </BreadcrumbReferrer>
            </template>

            <template #header>{{ $t('referrer.citizens') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div class="table-responsive">
                    <Table :columnHeaders="state.columnHeaders" :data="state.citizens"
                        :isLoading="state.isTableLoading">
                        <template #body v-if="!(state.isTableLoading || (state.citizens?.length === 0))">
                            <tr v-for="(citizen, index) in state.citizens" :key="index">
                                <td width="35%">
                                    <div class="flex items-center gap-x-2">
                                        <img :src="`https://ui-avatars.com/api/?background=42AED9&color=fff&name=${citizen?.firstname + ' ' + citizen?.lastname}`"
                                            class="rounded-full w-11 h-11 object-cover" />
                                        <span>{{ citizen?.firstname }} {{ citizen?.lastname }}</span>
                                    </div>
                                </td>
                                <td width="25%">
                                    <span>{{ citizen?.social_security_number }}</span>
                                </td>
                                <td width="25%">
                                    <span>{{ citizen?.email }}</span>
                                </td>
                                <td width="15%">
                                    <span>{{ citizen?.phone }}</span>
                                </td>
                            </tr>
                        </template>
                    </Table>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/referrer/CitizenService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()

const state = reactive({
    columnHeaders: [
        { name: 'citizens.table.name', isTranslateName: true },
        { name: 'citizens.table.ssn', isTranslateName: true },
        { name: 'citizens.table.email', isTranslateName: true },
        { name: 'citizens.table.phone', isTranslateName: true },
    ],
    error: {} as Error,
    isTableLoading: false,
    citizens: [] as any[],
})

onMounted(() => {
    fetchCitizens()
})

async function fetchCitizens() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await citizenService.getCitizens()
        if (response?.data) {
            state.citizens = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
