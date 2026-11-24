<template>
    <div>
        <Modal size="xs" :title="$t('filter')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <form @submit.prevent="submitForm()" id="calendarFilterForm">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="space-y-3">
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">
                                {{ $t('calendarTags.calendarTags') }}
                            </p>
                            <FormSelectMultiple id="tags" :options="state.options.tags"
                                v-model="state.formFilter.tags" />
                        </div>
                        <!-- Roadmap #499: only events that booked one of these units. -->
                        <div v-if="state.options.units.length" class="space-y-1" data-testid="calendar-filter-units">
                            <p class="text-sm text-gray-600">
                                {{ $t('calendar.filter.units') }}
                            </p>
                            <FormSelectMultiple id="units" :options="state.options.units"
                                v-model="state.formFilter.units" />
                        </div>
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" @click="closeModal()">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary">
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
import { unitService } from '@/components/api/user/UnitService'
import { useCalendarStore } from '@/store/calendar'
import { useDepartmentStore } from '@/store/department'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close', 'setFilter'])
const calendarStore = useCalendarStore()
const departmentStore = useDepartmentStore() as any

const state = reactive({
    error: {} as Error,
    formFilter: {
        selectedView: calendarStore.getCalendarView as any,
        tags: [],
        units: [...(calendarStore.getUnitUuids ?? [])] as string[],
    },
    isPageLoading: false,
    options: {
        tags: [],
        units: [] as { value: string, label: string }[],
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
        state.formFilter.selectedView = state.options.viewFilterLists.find((item: any) => item.title === calendarStore.getCalendarView)
        state.formFilter.units = [...(calendarStore.getUnitUuids ?? [])]
    }
})

function closeModal() {
    emit('close')
}

onMounted(() => {
    fetchAllCalendarTags()
    fetchAllUnits()
})

async function fetchAllUnits() {
    try {
        const response = await unitService.getAllUnits()
        state.options.units = (response?.data ?? []).map((unit: any) => ({ value: unit.uuid, label: unit.name }))
    } catch {
        state.options.units = []
    }
}

async function fetchAllCalendarTags() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName,
        }
        const response = await calendarTagService.getAllCalendarTags(params)
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
    emit('setFilter', state.formFilter)
    closeModal()
}
</script>

<style>
#calendarFilterForm .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>