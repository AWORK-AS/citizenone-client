<template>
    <div>
        <Modal size="lg" :title="$t('bookings.newEvent')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="grid grid-cols-2 gap-x-5">
                    <div class="flex flex-col items-center">
                        <Icon name="ph:calendar-blank" class="w-10 h-10" aria-hidden="true" />
                        <p class="text-lg font-semibold">
                            {{ $t('bookings.singleEvent.singleEvent') }}
                        </p>
                        <p class="text-sm text-center">
                            {{ $t('bookings.singleEvent.createASingleEventLabel') }}
                        </p>
                        <div class="mt-4">
                            <FormButton buttonStyle="action" class="rounded-lg"
                                @click="state.modal.isNewSingleEventOpen = true">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('bookings.singleEvent.createASingleEvent') }}
                            </FormButton>
                        </div>
                    </div>
                    <div class="flex flex-col items-center">
                        <Icon name="ph:graduation-cap" class="w-10 h-10" aria-hidden="true" />
                        <p class="text-lg font-semibold">
                            {{ $t('bookings.course.course') }}
                        </p>
                        <p class="text-sm text-center">
                            {{ $t('bookings.course.createACourseByGroupingMultipleEvents') }}
                        </p>
                        <div class="mt-4">
                            <FormButton buttonStyle="action" class="rounded-lg"
                                @click="state.modal.isNewCourseOpen = true">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('bookings.course.createACourse') }}
                            </FormButton>
                        </div>
                    </div>
                </div>
                <ModulesUserCalendarBookingSingleEventModalNew :isModalOpen="state.modal.isNewSingleEventOpen"
                    @close="state.modal.isNewSingleEventOpen = false" @closeModalSelection="closeModal()"
                    @refreshCoursesEvents="$emit('refreshCoursesEvents')" />
                <ModulesUserCalendarBookingCourseModalNew :isModalOpen="state.modal.isNewCourseOpen"
                    @close="state.modal.isNewCourseOpen = false" @closeModalSelection="closeModal()"
                    @refreshCoursesEvents="$emit('refreshCoursesEvents')" />
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
})
const emit = defineEmits(['close', 'refreshCoursesEvents'])

const state = reactive({
    modal: {
        isNewSingleEventOpen: false,
        isNewCourseOpen: false,
    },
})

function closeModal() {
    emit('close')
}
</script>