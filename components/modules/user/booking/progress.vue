<template>
    <nav aria-label="Progress">
        <ol role="list" class="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0">
            <li v-for="(step, stepIdx) in steps" :key="step.name" class="relative md:flex md:flex-1">
                <a v-if="step.status === 'completed'" :href="step.href" class="group flex w-full items-center">
                    <span class="flex items-center px-6 py-4 text-sm font-medium">
                        <span
                            class="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary group-hover:bg-secondary-600">
                            <Icon name="ph:check" class="h-6 w-6 text-white" aria-hidden="true" />
                        </span>
                        <span class="ml-4 text-sm font-medium text-gray-900">{{ step.name }}</span>
                    </span>
                </a>
                <a v-else-if="step.status === 'current'" :href="step.href"
                    class="flex items-center px-6 py-4 text-sm font-medium" aria-current="step">
                    <span
                        class="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-secondary">
                        <span class="text-secondary">{{ step.id }}</span>
                    </span>
                    <span class="ml-4 text-sm font-medium text-secondary">{{ step.name }}</span>
                </a>
                <a v-else :href="step.href" class="group flex items-center">
                    <span class="flex items-center px-6 py-4 text-sm font-medium">
                        <span
                            class="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 group-hover:border-gray-400">
                            <span class="text-gray-500 group-hover:text-gray-900">{{ step.id }}</span>
                        </span>
                        <span class="ml-4 text-sm font-medium text-gray-500 group-hover:text-gray-900">{{ step.name
                        }}</span>
                    </span>
                </a>
                <template v-if="stepIdx !== steps.length - 1">
                    <!-- Arrow separator for lg screens and up -->
                    <div class="absolute right-0 top-0 hidden h-full w-5 md:block" aria-hidden="true">
                        <svg class="size-full text-gray-300" viewBox="0 0 22 80" fill="none" preserveAspectRatio="none">
                            <path d="M0 -2L20 40L0 82" vector-effect="non-scaling-stroke" stroke="currentcolor"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                </template>
            </li>
        </ol>
    </nav>
</template>

<script setup lang="ts">
const props = defineProps({
    currentStep: {
        type: Number,
        required: true,
    },
})

let steps = [
    { id: '01', name: 'Event details', href: '#', status: 'current' },
    { id: '02', name: 'Your details', href: '#', status: 'upcoming' },
    { id: '03', name: 'Confirmation', href: '#', status: 'upcoming' },
]

watch(() => props.currentStep, (currentStep: number) => {
    if (currentStep === 1) {
        steps = [
            { id: '01', name: 'Event details', href: '#', status: 'current' },
            { id: '02', name: 'Your details', href: '#', status: 'upcoming' },
            { id: '03', name: 'Confirmation', href: '#', status: 'upcoming' },
        ]
    } else if (currentStep === 2) {
        steps = [
            { id: '01', name: 'Event details', href: '#', status: 'completed' },
            { id: '02', name: 'Your details', href: '#', status: 'current' },
            { id: '03', name: 'Confirmation', href: '#', status: 'upcoming' },
        ]
    } else if (currentStep === 3) {
        steps = [
            { id: '01', name: 'Event details', href: '#', status: 'completed' },
            { id: '02', name: 'Your details', href: '#', status: 'completed' },
            { id: '03', name: 'Confirmation', href: '#', status: 'current' },
        ]
    }
})
</script>