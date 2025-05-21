<template>
    <div>
        <Modal size="lg" :title="$t('folderStructure.viewFolderStructure')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div v-if="props.selectedFolderStructure">
                    <div class="flex items-center gap-x-2">
                        <Icon name="ph:folder" class="h-5 w-5" aria-hidden="true" />
                        {{ parsedStructure?.[0]?.root }}
                    </div>
                    <ModulesUserCitizenDocumentFolderStructureFolderTree :folders="parsedStructure?.[0]?.subfolder" />
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { folderStructureService } from '@/components/api/user/FolderStructureService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedFolderStructure: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}

const parsedStructure = computed(() => {
    try {
        return JSON.parse(props.selectedFolderStructure?.structure || '[]')
    } catch (e) {
        return []
    }
})
</script>