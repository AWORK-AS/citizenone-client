<template>
    <div>
        <NuxtLayout name="user">
            <Head>
            <Title>
                    {{ customPagesStore.getCustomPagesName?.dutySchedules }}
                    {{ $t('dutySchedules.draft.draft')?.toLowerCase() }}
                    -
                    {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb>
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/schedules')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.dutySchedules }}
                            </button>
                        </div>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/schedules/draft')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.dutySchedules }}
                                <span class="lowercase">
                                    {{ $t('dutySchedules.draft.draft') }}
                                </span>
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <NuxtLink class="-mt-4 flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/schedules">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>

            <div class="space-y-5">
                <ModulesUserDutyScheduleDraftTemplatesApply/>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
import { useCustomPagesStore } from '@/store/custom-pages'

const customPagesStore = useCustomPagesStore() as any

const state = reactive({})
</script>