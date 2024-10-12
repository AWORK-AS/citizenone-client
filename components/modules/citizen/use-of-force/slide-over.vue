<template>
    <TransitionRoot as="template" :show="props.isOpen">
        <Dialog class="relative z-50" @close="closeSlide">
            <div class="fixed inset-0" />

            <div class="fixed inset-0 overflow-hidden">
                <div class="absolute inset-0 overflow-hidden">
                    <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                        <TransitionChild as="template"
                            enter="transform transition ease-in-out duration-500 sm:duration-600"
                            enter-from="translate-x-full" enter-to="translate-x-0"
                            leave="transform transition ease-in-out duration-500 sm:duration-700"
                            leave-from="translate-x-0" leave-to="translate-x-full">
                            <DialogPanel class="pointer-events-auto w-screen max-w-4xl">
                                <div class="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                                    <LoadingSpinner :isActive="state.isPageLoading">
                                        <div class="px-4 sm:px-6">
                                            <div class="flex items-start justify-between">
                                                <DialogTitle class="text-base font-semibold leading-6 text-gray-900">
                                                    {{ $t('citizens.useOfForce.useOfForce') }}
                                                </DialogTitle>
                                                <div class="ml-3 flex h-7 items-center">
                                                    <button type="button"
                                                        class="relative rounded-md bg-white text-tertiary-800 hover:text-tertiary focus:outline-none"
                                                        @click="closeSlide">
                                                        <span class="absolute -inset-2.5" />
                                                        <span class="sr-only">Close panel</span>
                                                        <Icon name="ph:x" class="h-6 w-6" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="relative mt-10 flex-1 px-4 sm:px-6">
                                            <Alert type="danger" :text="state?.error?.message"
                                                v-if="state.error?.message && state.error.message.length > 0" />
                                            <div>
                                                <div class="space-y-5">
                                                    <div class="bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-4 border-secondary"
                                                        v-for="(useOfForce, index) in state.useOfForce?.data"
                                                        :key="index">
                                                        <div class="flex gap-x-3">
                                                            <div class="grow space-y-1.5">
                                                                <div>
                                                                    <p class="mt-1 text-xs text-muted-400">
                                                                        <span>
                                                                            {{ formatDateToReadable(useOfForce.date) }}
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                                <p class="text-sm">
                                                                    {{
                                                                        $t('citizens.useOfForce.table.reportedBy')
                                                                    }}:
                                                                    {{ useOfForce?.user?.firstname }}
                                                                    {{ useOfForce?.user?.lastname }}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div v-if="state.useOfForce?.data?.length === 0">
                                                        <p class="text-center py-10">
                                                            {{ $t('theresNoDataAvailableToDisplay') }}.
                                                        </p>
                                                    </div>
                                                    <Pagination :data="state.useOfForce" @previous="previous"
                                                        @next="next" />
                                                </div>
                                            </div>
                                        </div>
                                    </LoadingSpinner>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useOfForceService } from '@/components/api/UseOfForceService'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import type { Error } from '@/types'

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])
const { formatDateToReadable } = useDatetimeFormatter()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
let currentTablePage = 1

function closeSlide() {
    emit('close')
}

const state = reactive({
    error: {} as Error,
    useOfForce: [] as any,
    isPageLoading: false,
    sortData: {
        sortField: 'date_time',
        sortOrder: 'descend',
    },
})

watch(() => props.isOpen, (isOpen: any) => {
    if (isOpen) {
        fetchUseOfForce()
    }
})

async function fetchUseOfForce() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        }
        const response = await useOfForceService.getUseOfForces(params)
        if (response) {
            state.useOfForce = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function previous() {
    currentTablePage--
    fetchUseOfForce()
}

function next() {
    currentTablePage++
    fetchUseOfForce()
}
</script>