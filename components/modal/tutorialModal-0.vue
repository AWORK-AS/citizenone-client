<template>
    <div>
        <!-- Modal -->
        <div v-if="isModalZeroOpen"
            class="fixed bottom-10 left-99 w-96 p-6 bg-white border border-gray-300 shadow-lg z-50 rounded-md">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">Guided Tutorial-0</h3>
            </div>
            <p class="text-sm text-gray-700 mb-4">
                Welcome to your guided tutorial! Follow these steps to manage your presence effectively on this
                software.
            </p>
            <ul class="list-disc list-inside text-gray-600 text-sm space-y-2">
                <li>Update your profile with accurate details.</li>
                <li>Set your availability to let others know when you're active.</li>
                <li>Explore advanced features to maximize productivity.</li>
            </ul>
            <div class="mt-4 flex justify-end">
                <button @click="handleNext" class="px-4 py-2 bg-tertiary text-white rounded">
                    Next
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'LazyModalTutorialModal0',
    props: {
        isModalZeroOpen: {
            type: Boolean,
            required: true,
        },
    },
    emits: ['close'],
    setup(_, { emit }) {
        // Emit the close event to the parent to hide the modal
        const handleClose = () => {
            emit('close');
        };

        // Scroll to the bottom of the page after the 'Next' button is clicked
        const scrollToBottom = () => {
            window.scrollTo({
                top: 0, // Scroll to the top
                behavior: 'smooth', // For smooth scrolling
            });
        };

        // Handle 'Next' button click: scroll to bottom and close the modal
        const handleNext = () => {
            scrollToBottom(); // Scroll to the bottom
            handleClose(); // Emit the close event
        };

        return {
            handleNext, // Expose the combined method for 'Next' button
        };
    },
});
</script>

<style scoped>
/* Optional: Add custom modal styles here */
</style>
