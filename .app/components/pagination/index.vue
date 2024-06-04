<template>
    <div class="mt-8 flex flex-col items-center gap-y-3 md:flex-row" v-if="props.data && props.data.links">
        <div class="text-sm flex items-center dark:text-white">
            Showing from
            {{ props.data.meta && props.data.meta.from ? props.data.meta.from : 0 }}
            to
            {{ props.data.meta && props.data.meta.to ? props.data.meta.to : 0 }}
            of
            {{ props.data.meta && props.data.meta.total ? props.data.meta.total : 0 }}
        </div>
        <div class="grow flex flex-row justify-end gap-x-3">
            <button class="w-32 bg-sky-500 text-white rounded-sm text-sm px-4 py-3 hover:bg-sky-400"
                v-if="props.data.links && props.data.links.prev !== null"
                @click="!(props.data.links && props.data.links.prev === null) && $emit('previous')">
                <Icon name="ic:round-arrow-back" class="h-5 w-5" />
                Previous
            </button>
            <button class="w-32 bg-sky-500 text-white rounded-sm text-sm px-4 py-3 hover:bg-sky-400"
                v-if="props.data.links && props.data.links.next !== null"
                @click="!(props.data.links && props.data.links.next === null) && $emit('next')">
                Next
                <Icon name="ic:round-arrow-forward" class="h-5 w-5" />
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