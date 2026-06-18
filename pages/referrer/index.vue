<template>
    <div>
        <NuxtLayout name="referrer">

            <Head>
                <Title>{{ $t('referrer.myProfile') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <BreadcrumbReferrer>
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/referrer')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ $t('referrer.myProfile') }}
                            </button>
                        </div>
                    </template>
                </BreadcrumbReferrer>
            </template>

            <template #header>{{ $t('referrer.myProfile') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div v-if="state.isLoading" class="flex justify-center py-10">
                    <Icon name="ph:spinner" class="h-8 w-8 animate-spin text-primary" />
                </div>

                <div v-else-if="state.referrer" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl">
                    <div class="flex items-center gap-x-4 mb-6">
                        <img src="/img/avatars/user.svg" alt="User" class="h-16 w-16 rounded-full" />
                        <div>
                            <h2 class="text-xl font-semibold text-gray-900">
                                {{ state.referrer.firstname }} {{ state.referrer.lastname }}
                            </h2>
                            <p class="text-sm text-gray-500">{{ state.referrer.role }}</p>
                        </div>
                    </div>

                    <dl class="divide-y divide-gray-100">
                        <div class="py-3 grid grid-cols-3 gap-4">
                            <dt class="text-sm font-medium text-gray-500">{{ $t('employees.table.email') }}</dt>
                            <dd class="text-sm text-gray-900 col-span-2">{{ state.referrer.email }}</dd>
                        </div>
                        <div class="py-3 grid grid-cols-3 gap-4" v-if="state.referrer.phone">
                            <dt class="text-sm font-medium text-gray-500">{{ $t('employees.table.phone') }}</dt>
                            <dd class="text-sm text-gray-900 col-span-2">{{ state.referrer.phone }}</dd>
                        </div>
                        <div class="py-3 grid grid-cols-3 gap-4" v-if="state.referrer.company_name">
                            <dt class="text-sm font-medium text-gray-500">{{ $t('referrer.organization') }}</dt>
                            <dd class="text-sm text-gray-900 col-span-2">{{ state.referrer.company_name }}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { referrerService } from '@/components/api/referrer/ReferrerService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()

const state = reactive({
    error: {} as Error,
    isLoading: false,
    referrer: null as any,
})

onMounted(() => {
    fetchReferrer()
})

async function fetchReferrer() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await referrerService.getCurrentLoggedInReferrer()
        if (response?.data) {
            state.referrer = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
