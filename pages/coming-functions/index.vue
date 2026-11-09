<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('comingFunctions.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('comingFunctions.title') }}</template>

            <div class="mt-6 space-y-8">
                <div class="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p class="text-sm text-gray-600">{{ $t('comingFunctions.intro') }}</p>
                    <FormButton buttonStyle="secondary" buttonSize="sm" class="flex-none"
                        @click="state.isContactUsOpen = true">
                        <Icon name="ph:shooting-star" class="h-4 w-4" /> {{ $t('comingFunctions.sendWish') }}
                    </FormButton>
                </div>

                <!-- Polls on what to build next. Users could only find them at the
                     bottom of the Statistics page, so they sent their wishes by mail. -->
                <section id="polls" class="scroll-mt-24 space-y-2 rounded-lg border border-gray-200 bg-white p-4">
                    <h2 class="flex items-center gap-x-2 text-base font-semibold text-gray-900">
                        <Icon name="ph:thumbs-up" class="h-5 w-5 text-[#205E77]" />
                        {{ $t('comingFunctions.polls.title') }}
                    </h2>
                    <p class="text-sm text-gray-600">{{ $t('comingFunctions.polls.intro') }}</p>
                    <ModulesUserDailyOverviewPoll :showTitle="false" />
                </section>

                <LoadingSpinner :isActive="state.isLoading">
                    <Alert type="danger" :text="state.error" v-if="state.error" />

                    <div v-if="!state.isLoading && !state.error && !state.items.length"
                        class="flex flex-col items-center gap-y-2 py-16 text-center text-sm text-gray-500">
                        <Icon name="ph:map-trifold" class="h-10 w-10 text-gray-300" />
                        {{ $t('comingFunctions.empty') }}
                    </div>

                    <section v-for="section in sections" :key="section.status" class="space-y-3">
                        <h2 class="flex items-center gap-x-2 text-base font-semibold text-gray-900">
                            <Icon :name="section.icon" class="h-5 w-5" :class="section.iconClass" />
                            {{ $t(`comingFunctions.sections.${section.status}`) }}
                            <span class="text-sm font-normal text-gray-400">({{ section.items.length }})</span>
                        </h2>
                        <ul class="grid grid-cols-1 gap-3 lg:grid-cols-2">
                            <li v-for="item in section.items" :key="item.uuid"
                                class="rounded-lg border border-gray-200 bg-white p-4">
                                <div class="flex flex-wrap items-start justify-between gap-2">
                                    <h3 class="font-medium text-gray-900">{{ item.title }}</h3>
                                    <span v-if="item.expected_period && item.status !== 'released'"
                                        class="inline-flex items-center gap-1 rounded-full bg-[#EEF4F7] px-2 py-0.5 text-xs font-medium text-[#205E77]">
                                        <Icon name="ph:calendar-blank" class="h-3.5 w-3.5" />
                                        {{ item.expected_period }}
                                    </span>
                                    <span v-else-if="item.released_at"
                                        class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                        <Icon name="ph:check" class="h-3.5 w-3.5" />
                                        {{ formatDate(item.released_at) }}
                                    </span>
                                </div>
                                <div v-if="item.description" class="content mt-2 max-w-none text-sm text-gray-600"
                                    v-safe-html="item.description"></div>
                                <div v-if="item.status !== 'released'" class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <button type="button" :disabled="state.busy === item.uuid" @click="toggleInterest(item)"
                                        class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-60"
                                        :class="item.interested ? 'border-tertiary bg-tertiary/10 text-tertiary' : 'border-gray-200 text-gray-600 hover:border-tertiary hover:text-tertiary'"
                                        :aria-pressed="!!item.interested">
                                        <Icon :name="item.interested ? 'ph:hand-heart-fill' : 'ph:hand-heart'" class="h-4 w-4" />
                                        {{ item.interested ? $t('comingFunctions.interested') : $t('comingFunctions.wantThisToo') }}
                                    </button>
                                    <span v-if="item.interest_count" class="text-xs text-gray-400">
                                        {{ $t('comingFunctions.interestCount', item.interest_count) }}
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </section>
                </LoadingSpinner>
            </div>

            <ModulesUserWishListModalContactUs :isModalOpen="state.isContactUsOpen"
                @close="state.isContactUsOpen = false" v-if="state.isContactUsOpen" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { roadmapItemService } from '@/components/api/user/RoadmapItemService'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const { locale } = useI18n()

const breadcrumbLinks = [
    {
        name: 'comingFunctions.title',
        translate: true,
        href: '/coming-functions',
    },
]

const state = reactive({
    isLoading: true,
    error: '',
    items: [] as any[],
    isContactUsOpen: false,
    busy: '' as string,
})

// The API already returns the items in this order; the sections only group them.
const sections = computed(() => [
    { status: 'in_progress', icon: 'ph:hammer', iconClass: 'text-amber-500' },
    { status: 'planned', icon: 'ph:map-pin', iconClass: 'text-[#205E77]' },
    { status: 'released', icon: 'ph:rocket-launch', iconClass: 'text-green-600' },
]
    .map((section) => ({ ...section, items: state.items.filter((item: any) => item.status === section.status) }))
    .filter((section) => section.items.length))

onMounted(() => fetchItems())

async function fetchItems() {
    state.isLoading = true
    state.error = ''
    try {
        const response = await roadmapItemService.getRoadmapItems()
        state.items = response?.data ?? []
    } catch (error: any) {
        state.error = error?.message ?? 'Error'
    }
    state.isLoading = false
}

// The company's "we want this too". Shown right away; put back if the call fails.
async function toggleInterest(item: any) {
    const wanted = !item.interested
    state.busy = item.uuid
    item.interested = wanted
    item.interest_count = Math.max(0, (item.interest_count ?? 0) + (wanted ? 1 : -1))
    try {
        await roadmapItemService.setInterest(item.uuid, wanted)
    } catch (error: any) {
        item.interested = !wanted
        item.interest_count = Math.max(0, item.interest_count + (wanted ? -1 : 1))
        state.error = error?.message ?? 'Error'
    }
    state.busy = ''
}

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString(locale.value === 'dk' ? 'da-DK' : 'en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}
</script>
