<template>
    <div>
        <NuxtLayout name="employer">

            <Head>
                <Title>{{ $t('employer.overview') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <BreadcrumbEmployer>
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/employer/overview')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ $t('employer.overview') }}
                            </button>
                        </div>
                    </template>
                </BreadcrumbEmployer>
            </template>

            <template #header>{{ $t('employer.overview') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div v-if="state.isLoading" class="flex justify-center py-10">
                    <Icon name="ph:spinner" class="h-8 w-8 animate-spin text-primary" />
                </div>

                <div v-else-if="state.employer" class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <!-- Contact info -->
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div class="flex items-center gap-x-4 mb-6">
                            <img src="/img/avatars/user.svg" alt="User" class="h-16 w-16 rounded-full" />
                            <div>
                                <h2 class="text-xl font-semibold text-gray-900">
                                    {{ state.employer.firstname }} {{ state.employer.lastname }}
                                </h2>
                                <p class="text-sm text-gray-500">{{ state.employer.title }}</p>
                            </div>
                        </div>
                        <dl class="divide-y divide-gray-100">
                            <div class="py-3 grid grid-cols-3 gap-4">
                                <dt class="text-sm font-medium text-gray-500">{{ $t('employees.table.email') }}</dt>
                                <dd class="text-sm text-gray-900 col-span-2">{{ state.employer.email }}</dd>
                            </div>
                            <div class="py-3 grid grid-cols-3 gap-4" v-if="state.employer.phone">
                                <dt class="text-sm font-medium text-gray-500">{{ $t('employees.table.phone') }}</dt>
                                <dd class="text-sm text-gray-900 col-span-2">{{ state.employer.phone }}</dd>
                            </div>
                        </dl>
                    </div>

                    <!-- Company info -->
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6" v-if="state.employer.company">
                        <h3 class="text-base font-semibold text-gray-900 mb-4">{{ $t('employer.company') }}</h3>
                        <dl class="divide-y divide-gray-100">
                            <div class="py-3 grid grid-cols-3 gap-4">
                                <dt class="text-sm font-medium text-gray-500">{{ $t('settings.name') }}</dt>
                                <dd class="text-sm text-gray-900 col-span-2">{{ state.employer.company.name }}</dd>
                            </div>
                            <div class="py-3 grid grid-cols-3 gap-4" v-if="state.employer.company.cvr">
                                <dt class="text-sm font-medium text-gray-500">{{ $t('employer.cvr') }}</dt>
                                <dd class="text-sm text-gray-900 col-span-2">{{ state.employer.company.cvr }}</dd>
                            </div>
                            <div class="py-3 grid grid-cols-3 gap-4" v-if="state.employer.company.website">
                                <dt class="text-sm font-medium text-gray-500">{{ $t('employer.website') }}</dt>
                                <dd class="text-sm text-gray-900 col-span-2">
                                    <a :href="state.employer.company.website" target="_blank"
                                        class="text-primary hover:underline">
                                        {{ state.employer.company.website }}
                                    </a>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employerService } from '@/components/api/employer/EmployerService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()

const state = reactive({
    error: {} as Error,
    isLoading: false,
    employer: null as any,
})

onMounted(() => {
    fetchEmployer()
})

async function fetchEmployer() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await employerService.getCurrentLoggedInEmployer()
        if (response?.data) {
            state.employer = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
