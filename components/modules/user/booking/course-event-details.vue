<template>
    <div>
        <div class="relative">
            <div class="absolute inset-px rounded-lg bg-white"></div>
            <div class="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)]">
                <img class="h-80 object-cover"
                    src="https://tailwindcss.com/plus-assets/img/component-images/bento-01-integrations.png" alt="" />
                <div class="px-5 pb-6 pt-10 space-y-2">
                    <div class="flex gap-x-5">
                        <div class="flex gap-x-3">
                            <div>
                                <h3 class="text-lg font-semibold text-primary">20</h3>
                                <h3 class="text-xs font-semibold text-primary">Jun</h3>
                            </div>
                            <div>
                                -
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-primary">19</h3>
                                <h3 class="text-xs font-semibold text-primary">Jun</h3>
                            </div>
                        </div>
                        <div class="mt-1 text-sm">
                            <p>Friday 9:00AM</p>
                            <p>Sunday 5:00PM</p>
                        </div>
                    </div>
                    <div>
                        <p class="text-lg font-medium tracking-tight">
                            Event Title
                        </p>
                        <p class="max-w-lg text-xs text-gray-600">
                            Course - 10 sessions
                        </p>
                    </div>
                    <p class="max-w-lg text-sm text-gray-600">
                        Description goes here.
                    </p>
                    <div class="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                        <div
                            class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                            Tag 1
                        </div>
                        <div
                            class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                            Tag 2
                        </div>
                        <div
                            class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                            Tag 3
                        </div>
                        <div
                            class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                            Tag 4
                        </div>
                        <div
                            class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                            Tag 5
                        </div>
                        <div
                            class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                            Tag 6
                        </div>
                        <div
                            class="bg-primary text-white px-2 py-1 text-xxs rounded-full flex items-center justify-center">
                            Tag 7
                        </div>
                    </div>
                    <div class="text-sm flex justify-between">
                        <div>
                            DKK 100,00
                        </div>
                        <div>
                            5 spots left
                        </div>
                    </div>
                    <div class="text-sm">
                        Somewhere over the rainbow
                    </div>
                </div>
            </div>
            <div class="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5">
            </div>
        </div>
        <div class="mt-6">
            <FormButton buttonStyle="primary" class="w-full rounded-md" @click="$emit('continue')">
                {{ $t('bookings.booking.continue') }}
            </FormButton>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    courseEventDetails: {
        type: Object,
        required: true,
    },
})
</script>