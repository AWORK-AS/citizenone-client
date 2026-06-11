<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.timeline') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

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

            <template #header>{{ $t('citizens.tabs.timeline') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="mt-8 space-y-5">
                        <div class="flex justify-end">
                            <FormButton buttonStyle="action" @click="state.isAddOpen = true">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('citizens.timeline.newEvent') }}
                            </FormButton>
                        </div>

                        <ol class="relative border-l border-gray-200 ml-3 space-y-6" v-if="state.timeline.length">
                            <li v-for="(item, index) in state.timeline" :key="index" class="ml-6">
                                <span
                                    :class="['absolute -left-3 flex size-6 items-center justify-center rounded-full ring-4 ring-white',
                                        item.source === 'event' ? 'bg-primary/15 text-primary' : 'bg-gray-100 text-gray-500']">
                                    <Icon :name="item.source === 'event' ? 'ph:flag' : 'ph:clock-counter-clockwise'"
                                        class="size-3.5" />
                                </span>
                                <div class="rounded-md bg-white p-4 ring-1 ring-gray-200">
                                    <div class="flex items-start justify-between gap-3">
                                        <div class="min-w-0">
                                            <div class="flex items-center gap-2 flex-wrap">
                                                <p class="text-sm font-semibold text-gray-900">{{ item.title }}</p>
                                                <Badge v-if="item.event_type" type="primary" class="w-fit">
                                                    <p class="text-xxs">{{ item.event_type.name }}</p>
                                                </Badge>
                                            </div>
                                            <p v-if="item.description" class="mt-1 text-sm text-gray-600 break-words">
                                                {{ item.description }}
                                            </p>
                                            <p class="mt-1 text-xs text-gray-400">
                                                {{ formatDateToReadable(item.date) }}
                                                <span v-if="item.user"> · {{ item.user }}</span>
                                            </p>
                                        </div>
                                        <button v-if="item.can_delete" @click="deleteEvent(item.uuid)"
                                            class="shrink-0 text-gray-300 hover:text-red-600" :title="$t('delete')">
                                            <Icon name="ph:trash" class="size-4" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        </ol>

                        <p v-else class="text-center py-10 text-gray-500">
                            {{ $t('theresNoDataAvailableToDisplay') }}.
                        </p>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>

        <ModulesUserCitizenTimelineModalNew :isModalOpen="state.isAddOpen" :citizenUuid="(citizenUuid as string)"
            @close="state.isAddOpen = false" @refresh="fetchTimeline" />
    </div>
</template>

<script setup lang="ts">
import { timelineService } from '@/components/api/user/TimelineService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useAlert } from '@/composables/alert'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid

const breadcrumbLinks = [
    {
        name: 'citizens.tabs.timeline',
        translate: true,
        href: `/citizens/${citizenUuid}/timeline`,
    },
]

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    isAddOpen: false,
    timeline: [] as any[],
})

onMounted(() => {
    fetchTimeline()
})

async function fetchTimeline() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await timelineService.getTimeline(citizenUuid)
        state.timeline = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function deleteEvent(uuid: string) {
    try {
        await timelineService.deleteEvent(uuid)
        successAlert(`${t('alert.success')}!`, `${t('citizens.timeline.alert.deletedSuccessfully')}.`)
        fetchTimeline()
    } catch (error: any) {
        state.error = error
    }
}
</script>
