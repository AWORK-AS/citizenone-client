<template>
    <ul class="ml-4">
        <li v-for="(folder, index) in props.folders" :key="index" class="ml-3">
            <div class="flex items-center gap-x-2">
                <Icon name="ph:folder" class="h-5 w-5" aria-hidden="true" />
                <span class="text-lg">
                    {{ folder.folder || '' }}
                </span>
            </div>
            <ModulesUserDocumentFolderStructureFolderTree v-if="folder.subfolder?.length" :folders="folder.subfolder" />
        </li>
    </ul>
</template>

<script setup lang="ts">
const props = defineProps({
    folders: {
        type: Object,
        required: true,
    },
})
</script>
