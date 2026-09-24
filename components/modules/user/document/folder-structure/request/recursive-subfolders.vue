<template>
    <div v-for="(subfolder, index) in props?.subfolders" :key="index" class="space-y-3">
        <!-- Subfolder. Renaming is allowed, but no remove button: a request can only add or rename folders, never delete them. -->
        <div class="space-y-1">
            <FormLabel :for="`folder-${parentIndex}-${index}`" :label="`${t('folderStructure.form.folderName')}`" />
            <FormTextField :id="`folder-${parentIndex}-${index}`" :name="`folder-${parentIndex}-${index}`"
                v-model="props.subfolders[index].folder" :placeholder="$t('folderStructure.form.folderName')" />
        </div>

        <!-- Nested Subfolders -->
        <div v-if="subfolder.subfolder && subfolder.subfolder.length > 0" class="ml-6">
            <ModulesUserDocumentFolderStructureRequestRecursiveSubfolders :subfolders="subfolder.subfolder"
                :parentIndex="`${parentIndex}-${index}`" @addSubfolder="addSubfolder" />
        </div>

        <!-- Add Subfolder Button -->
        <button type="button" class="text-primary text-sm hover:underline ml-6" @click="addSubfolder(subfolder, index)">
            {{ t('folderStructure.form.addSubfolder') }}
        </button>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"

const props = defineProps({
    subfolders: {
        type: Array,
        required: true,
    } as any,
    parentIndex: {
        type: [Number, String],
        required: true,
    },
})

const emit = defineEmits(['addSubfolder'])
const { t } = useI18n()

function addSubfolder(subfolder: any, index: number) {
    emit('addSubfolder', subfolder, index)
}
</script>
