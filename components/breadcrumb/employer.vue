<template>
    <nav class="flex" aria-label="Breadcrumb">
        <ol role="list" class="flex items-center space-x-4 text-xs">
            <li>
                <div>
                    <button class="text-gray-400 hover:text-gray-500" @click="navigateTo('/employer/overview')">
                        <Icon name="heroicons:home" class="size-5 shrink-0" aria-hidden="true" />
                        <span class="sr-only">
                            {{ $t('home') }}
                        </span>
                    </button>
                </div>
            </li>
            <slot name="custom-link"></slot>
            <div v-for="(link, index) in props.links" :key="index">
                <div class="flex items-center">
                    <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400" aria-hidden="true" />
                    <button @click="navigateTo(`${link.href}`)"
                        class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                        <span v-if="link.translate">
                            {{ $t(link.name) }}
                        </span>
                        <span v-else>
                            {{ link.name }}
                        </span>
                    </button>
                </div>
            </div>
        </ol>
    </nav>
</template>

<script setup lang="ts">
const props = defineProps({
    links: {
        type: Object,
        required: false,
    },
})

defineSlots<{ 'custom-link'?: () => any }>()
</script>
