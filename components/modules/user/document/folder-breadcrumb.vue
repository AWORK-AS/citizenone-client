<template>
    <div v-if="props.path.length" class="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2" data-testid="folder-breadcrumb">
        <button type="button" class="flex items-center gap-x-2 max-w-fit text-sm hover:text-primary"
            data-testid="folder-back" @click="emit('navigate', parentUuid)">
            <Icon name="ph:arrow-left" size="16" class="text-black" aria-hidden="true" />
            <span>{{ $t('back') }}</span>
        </button>
        <nav :aria-label="props.rootLabel" class="flex items-center flex-wrap gap-x-1 gap-y-1 text-sm">
            <button type="button" class="text-slate-500 hover:text-primary font-medium" data-testid="crumb-root"
                @click="emit('navigate', null)">
                {{ props.rootLabel }}
            </button>
            <template v-for="(folder, index) in props.path" :key="folder.uuid">
                <Icon name="ph:caret-right" class="h-3.5 w-3.5 text-slate-300 shrink-0" aria-hidden="true" />
                <span v-if="index === props.path.length - 1" class="text-slate-800 font-semibold" aria-current="page"
                    data-testid="crumb-current">
                    {{ folder.name }}
                </span>
                <button v-else type="button" class="text-slate-500 hover:text-primary" data-testid="crumb"
                    @click="emit('navigate', folder.uuid)">
                    {{ folder.name }}
                </button>
            </template>
        </nav>
    </div>
</template>

<script setup lang="ts">
// Where the user is in a document tree (root -> open folder), with a Back
// button to the parent. Shared by company and citizen documents; the page
// owns routing, this only says which folder to go to (null = the root).
const props = defineProps({
    rootLabel: {
        type: String,
        required: true,
    },
    path: {
        type: Array as PropType<{ uuid: string; name: string }[]>,
        required: true,
    },
})

const emit = defineEmits<{
    (e: 'navigate', folderUuid: string | null): void
}>()

const parentUuid = computed(() => props.path.length > 1 ? props.path[props.path.length - 2].uuid : null)
</script>
