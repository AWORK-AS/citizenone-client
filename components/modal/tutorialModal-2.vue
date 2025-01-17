<template>
    <div>
        <!-- Modal -->
        <div v-if="isModalTwoOpen"
            class="fixed bottom-20 right-32 w-96 p-6 bg-white border border-gray-300 shadow-lg z-50 rounded-md">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">Guided Tutorial-2</h3>
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
                <!-- Updated button to emit close and scroll to top -->
                <button @click="doneAndClose" class="px-4 py-2 bg-tertiary text-white rounded">
                    Done
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'LazyModalTutorialModal2',
    props: {
        isModalTwoOpen: {
            type: Boolean,
            required: true, // Parent must provide this prop
        },
    },
    emits: ['close'], // Emitting a 'close' event for the parent to handle
    setup(_, { emit }) {
        // Close the modal
        const handleClose = () => {
            emit('close'); // Notify the parent to close the modal
        };

        // Scroll to the top of the page and close the modal
        const doneAndClose = () => {
            window.scrollTo({
                top: 0, // Scroll to the top
                behavior: 'smooth', // For smooth scrolling
            });
            emit('close'); // Notify the parent to close the modal when 'Done' is clicked
        };

        return {
            handleClose,
            doneAndClose, // Expose the doneAndClose function
        };
    },
});
</script>

<style scoped>
/* Optional: Add custom modal styles here */
</style>
