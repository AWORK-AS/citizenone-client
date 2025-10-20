<template>
    <div>
        <Modal size="xs" :title="$t('filter')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <form @submit.prevent="submitForm()" id="journalFilterForm">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="space-y-3">
                        <fieldset>
                            <RadioGroup v-model="state.filter.selectedView"
                                class="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-1 sm:gap-x-4">
                                <RadioGroupOption as="template" v-for="viewFilter in state.options.viewFilterLists"
                                    :key="viewFilter.id" :value="viewFilter" :aria-label="viewFilter.title"
                                    v-slot="{ active, checked }">
                                    <div
                                        :class="[active ? 'border-primary ring-1 ring-primary' : 'border-gray-300', 'relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-xs focus:outline-hidden']">
                                        <span class="flex flex-1">
                                            <span class="flex flex-col">
                                                <p class="block text-sm font-medium text-gray-900">
                                                    <span v-if="viewFilter.title === 'default'">
                                                        {{ $t('calendar.view.defaultView') }}
                                                    </span>
                                                    <span v-if="viewFilter.title === 'week'">
                                                        {{ $t('calendar.view.weekView') }}
                                                    </span>
                                                    <span v-if="viewFilter.title === 'month'">
                                                        {{ $t('calendar.view.monthView') }}
                                                    </span>
                                                </p>
                                            </span>
                                        </span>
                                        <Icon name="ph:check-circle"
                                            :class="[!checked ? 'invisible' : '', 'size-5 text-primary']"
                                            aria-hidden="true" />
                                        <span
                                            :class="[active ? 'border' : 'border-1', checked ? 'border-primary' : 'border-transparent', 'pointer-events-none absolute -inset-px rounded-lg']"
                                            aria-hidden="true" />
                                    </div>
                                </RadioGroupOption>
                            </RadioGroup>
                        </fieldset>
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">
                                {{ $t('calendarTags.calendarTags') }}
                            </p>
                            <FormSelectMultiple id="tags" :options="state.options.tags" v-model="state.filter.tags" />
                        </div>
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal()">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                                {{ $t('filter') }}
                            </FormButton>
                        </div>
                    </div>
                </form>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { calendarTagService } from '@/components/api/user/CalendarTagService'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import { useCustomPagesStore } from '@/store/custom-pages'
import type { Error } from '@/types'
import { useCalendarStore } from '~/store/calendar'

const customPagesStore = useCustomPagesStore() as any
const calendarStore = useCalendarStore()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'setFilter'])

const state = reactive({
    error: {} as Error,
    filter: {
        selectedView: calendarStore.getCalendarView as any,
        tags: [],
    },
    isPageLoading: false,
    options: {
        tags: [],
        viewFilterLists: [
            { id: 1, title: 'default' },
            { id: 2, title: 'week' },
            { id: 3, title: 'month' },
        ],
        users: [],
    }
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        state.filter.selectedView = state.options.viewFilterLists.find((item: any) => item.title === calendarStore.getCalendarView)
    }
})

function closeModal() {
    emit('close')
}

onMounted(() => {
    fetchAllCalendarTags()
})

async function fetchAllCalendarTags() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await calendarTagService.getAllCalendarTags()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (tag: any) => options.push({
                    value: tag?.uuid,
                    label: tag?.tag,
                })
            )
            state.options.tags = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function submitForm() {
    emit('setFilter', state.filter)
    console.log('Filter', state.filter)
    closeModal()
}
</script>

<style>
#journalFilterForm .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>