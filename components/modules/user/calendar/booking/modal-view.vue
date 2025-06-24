<template>
    <div>
        <Modal size="xl"
            :title="props.selectedEvent?.type === 'event' ? $t('bookings.view.viewEvent') : $t('bookings.view.viewCourse')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <ModulesUserCalendarBookingViewTabs :tabs="state.tabs" :isJustifyBetween="false"
                    @changeTab="changeTab" />
                <div class="mt-6">
                    <div v-if="state.tabs[0].isActive">
                        <ModulesUserCalendarBookingViewOverview :bookingSettings="props.bookingSettings"
                            :selectedCourseEvent="props.selectedCourseEvent" />
                    </div>

                    <div v-if="state.tabs[1].isActive">
                        <ModulesUserCalendarBookingViewParticipants :selectedCourseEvent="props.selectedCourseEvent" />
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    bookingSettings: {
        type: Object,
        required: true,
    },
    selectedCourseEvent: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close'])

const state = reactive({
    tabs: [
        {
            name: 'bookings.view.overview.overview',
            isTranslateName: true,
            isActive: true,
        },
        {
            name: 'bookings.view.participants.participants',
            isTranslateName: true,
            isActive: false,
        },
    ] as any
})

function closeModal() {
    emit('close')
}

function changeTab(selectedTab: any) {
    if (selectedTab.name === state.tabs[0].name) {
        state.tabs[0].isActive = true
        state.tabs[1].isActive = false
    } else if (selectedTab.name === state.tabs[1].name) {
        state.tabs[0].isActive = false
        state.tabs[1].isActive = true

    }
}
</script>