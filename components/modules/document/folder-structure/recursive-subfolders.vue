<template>
    <div v-for="(subfolder, index) in props?.subfolders" :key="index" class="space-y-3">
        <!-- Subfolder -->
        <div class="space-y-1">
            <FormLabel :for="`folder-${parentIndex}-${index}`"
                :label="`${t('citizens.documents.folderStructure.form.folderName')}`" />
            <div class="flex items-center justify-between space-x-2">
                <div class="w-full space-y-1">
                    <FormTextField :id="`folder-${parentIndex}-${index}`" :name="`folder-${parentIndex}-${index}`"
                        v-model="props.subfolders[index].folder"
                        :placeholder="$t('citizens.documents.folderStructure.form.folderName')" />
                </div>
                <!-- Remove Subfolder Button -->
                <button type="button" class="text-red-500 text-sm hover:underline"
                    @click="removeSubfolder(props?.subfolders, index)">
                    <Icon name="ph:trash" class="h-5 w-5 text-red-600" aria-hidden="true" />
                </button>
            </div>
        </div>

        <!-- Nested Subfolders -->
        <!-- level: {{ subfolder }} -->
        <div v-if="subfolder.subfolder && subfolder.subfolder.length > 0" class="ml-6">
            <ModulesDocumentFolderStructureRecursiveSubfolders :subfolders="subfolder.subfolder"
                :parentIndex="`${parentIndex}-${index}`" @addSubfolder="addSubfolder"
                @removeSubfolder="removeSubfolder" />
        </div>

        <!-- Add Subfolder Button -->
        <button type="button" class="text-primary text-sm hover:underline ml-6" @click="addSubfolder(subfolder, index)">
            {{ t('citizens.documents.folderStructure.form.addSubfolder') }}
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

const emit = defineEmits(['addSubfolder', 'removeSubfolder'])
const { t } = useI18n()

function addSubfolder(subfolder: any, index: number) {
    emit('addSubfolder', subfolder, index)
}

function removeSubfolder(subfolder: any, index: number) {
    emit('removeSubfolder', subfolder, index)
}
</script>
