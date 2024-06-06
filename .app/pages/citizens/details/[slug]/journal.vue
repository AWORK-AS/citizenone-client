<template>
    <div>

        <Head>
            <Title>Citizen Journal - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <CitizenDetails>
            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="space-y-3">
                    <BaseMessage color="danger" icon v-if="errorMessage" :message="errorMessage" />
                    <BaseCard rounded="md" class="p-10">
                        <div
                            class="border-muted-200 dark:border-muted-700 mb-8 flex w-full items-center gap-2 border-b pb-8">
                            <div
                                class="bg-muted-100 dark:bg-muted-700/60 text-muted-400 flex size-[50px] items-center justify-center rounded-full">
                                <Icon name="ph:book-open-duotone" class="size-5" />
                            </div>
                            <div>
                                <BaseHeading tag="h3" size="md" weight="medium">
                                    Journal
                                </BaseHeading>
                            </div>
                            <div class="ms-auto">
                                <BaseButtonIcon rounded="full" size="sm" data-nui-tooltip="Add new journal">
                                    <Icon name="lucide:plus" class="size-4" />
                                </BaseButtonIcon>
                            </div>
                        </div>
                        <div class="space-y-5 w-full">
                            <div class="flex w-full items-center gap-2" v-for="(journal, index) in state.journals?.data"
                                :key="index">
                                <div class="space-y-1.5">
                                    <BaseHeading tag="h3" size="md" weight="medium">
                                        {{ journal.title }}
                                    </BaseHeading>
                                    <BaseParagraph size="sm" class="text-muted-400">
                                        <span>{{ journal.content }}</span>
                                    </BaseParagraph>
                                    <BaseParagraph size="xs" class="text-muted-400">
                                        <span>{{ formatDateToReadable(journal.date) }}</span>
                                    </BaseParagraph>
                                </div>
                                <div class="ms-auto">
                                    <BaseDropdown variant="context" label="Dropdown" placement="bottom-end" size="md"
                                        class="z-20" rounded="lg">
                                        <BaseDropdownItem title="Edit" text="Edit journal">
                                            <template #start>
                                                <Icon name="ph:pencil-duotone" class="me-2 block size-5" />
                                            </template>
                                        </BaseDropdownItem>
                                        <BaseDropdownItem title="Favorite" text="Add journal to favorite">
                                            <template #start>
                                                <Icon name="ph:star" class="me-2 block size-5" />
                                            </template>
                                        </BaseDropdownItem>
                                        <BaseDropdownItem title="Lock" text="Lock journal">
                                            <template #start>
                                                <Icon name="ph:lock" class="me-2 block size-5" />
                                            </template>
                                        </BaseDropdownItem>
                                        <BaseDropdownItem title="Print" text="Print journal">
                                            <template #start>
                                                <Icon name="ph:printer" class="me-2 block size-5" />
                                            </template>
                                        </BaseDropdownItem>
                                        <BaseDropdownItem title="Delete" text="Delete journal">
                                            <template #start>
                                                <Icon name="ph:trash-duotone" class="me-2 block size-5" />
                                            </template>
                                        </BaseDropdownItem>
                                    </BaseDropdown>
                                </div>
                            </div>
                        </div>
                    </BaseCard>
                </div>
            </LoadingSpinner>
        </CitizenDetails>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { journalService } from '@/components/api/JournalService'

definePageMeta({
    layout: 'user',
    title: 'Citizen Journal',
})

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const citizenUuid = route.params.slug
let errorMessage = ''

const state = reactive({
    isPageLoading: false,
    journals: [],
})

onMounted(() => {
    fetchJournals()
})

async function fetchJournals() {
    state.isPageLoading = true
    try {
        const params = {
            uuid: citizenUuid
        }
        const response = await journalService.getJournals(params)
        if (response) {
            state.journals = response
        }
    } catch (error: any) {
        errorMessage = error.message
    }
    state.isPageLoading = false
}

function formatDateToReadable(datetime: string) {
    return moment(datetime).format('LL')
}
</script>