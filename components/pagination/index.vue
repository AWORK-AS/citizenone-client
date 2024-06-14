<template>
    <div class="mt-8 flex flex-col items-center gap-y-3 md:flex-row" v-if="props.data && props.data.links">
        <div class="text-sm flex items-center">
            <p v-if="props.data.meta.total > 0">
                {{ $t('pagination.showingFrom') }}
                {{ props.data.meta && props.data.meta.from ? props.data.meta.from : 0 }}
                {{ $t('pagination.to') }}
                {{ props.data.meta && props.data.meta.to ? props.data.meta.to : 0 }}
                {{ $t('pagination.of') }}
                {{ props.data.meta && props.data.meta.total ? props.data.meta.total : 0 }}
            </p>
        </div>
        <div class="grow flex flex-row justify-end gap-x-3">
            <button class="w-28 bg-tertiary text-white rounded-sm text-sm px-4 py-3 hover:bg-tertiary/90"
                v-if="props.data.links && props.data.links.prev !== null"
                @click="!(props.data.links && props.data.links.prev === null) && $emit('previous')">
                {{ $t('pagination.previous') }}
            </button>
            <button class="w-28 bg-tertiary text-white rounded-sm text-sm px-4 py-3 hover:bg-tertiary/90"
                v-if="props.data.links && props.data.links.next !== null"
                @click="!(props.data.links && props.data.links.next === null) && $emit('next')">
                {{ $t('pagination.next') }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    data: {
        type: Object,
        required: true,
    },
})
</script>