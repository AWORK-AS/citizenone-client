<template>
    <div>
        <Modal size="md" :title="props?.selectedProcedure?.title" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="space-y-3">
                    <div class="bg-white rounded-md p-5 ring-1 ring-inset ring-gray-100">
                        <div class="grid grid-cols-2 gap-x-2">
                            <div class="flex items-center gap-x-2">
                                <img :src="`https://ui-avatars.com/api/?background=42AED9&color=fff&name=John Doe`"
                                    class="rounded-full w-11" />
                                <span>John Doe</span>
                            </div>
                            <div>
                                <p class="text-sm">Marketing</p>
                                <div class="flex gap-x-3 whitespace-nowrap">
                                    <div class="mt-2 flex w-full h-2.5 bg-gray-200 rounded-full overflow-hidden"
                                        role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                                        <div class="flex flex-col justify-center rounded-full overflow-hidden bg-primary text-xs text-white text-center whitespace-nowrap transition duration-500"
                                            style="width: 0%"></div>
                                    </div>
                                    <div class="w-10 text-end">
                                        <span class="text-sm text-gray-800">0%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white rounded-md p-5 ring-1 ring-inset ring-gray-100">
                        <div class="grid grid-cols-2 gap-x-2">
                            <div class="flex items-center gap-x-2">
                                <img :src="`https://ui-avatars.com/api/?background=42AED9&color=fff&name=John Doe`"
                                    class="rounded-full w-11" />
                                <span>Kim Tan</span>
                            </div>
                            <div>
                                <p class="text-sm">Developer</p>
                                <div class="flex gap-x-3 whitespace-nowrap">
                                    <div class="mt-2 flex w-full h-2.5 bg-gray-200 rounded-full overflow-hidden"
                                        role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                                        <div class="flex flex-col justify-center rounded-full overflow-hidden bg-primary text-xs text-white text-center whitespace-nowrap transition duration-500"
                                            style="width: 100%"></div>
                                    </div>
                                    <div class="w-10 text-end">
                                        <span class="text-sm text-gray-800">100%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white rounded-md p-5 ring-1 ring-inset ring-gray-100">
                        <div class="grid grid-cols-2 gap-x-2">
                            <div class="flex items-center gap-x-2">
                                <img :src="`https://ui-avatars.com/api/?background=42AED9&color=fff&name=John Doe`"
                                    class="rounded-full w-11" />
                                <span>James Bond</span>
                            </div>
                            <div>
                                <p class="text-sm">UI/UX</p>
                                <div class="flex gap-x-3 whitespace-nowrap">
                                    <div class="mt-2 flex w-full h-2.5 bg-gray-200 rounded-full overflow-hidden"
                                        role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                                        <div class="flex flex-col justify-center rounded-full overflow-hidden bg-primary text-xs text-white text-center whitespace-nowrap transition duration-500"
                                            style="width: 50%"></div>
                                    </div>
                                    <div class="w-10 text-end">
                                        <span class="text-sm text-gray-800">50%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
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
    selectedProcedure: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}
</script>