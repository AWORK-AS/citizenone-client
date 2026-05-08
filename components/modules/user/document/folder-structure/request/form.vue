<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <p class="text-sm text-gray-600">
                    {{ $t('folderStructure.folderStructure') }}
                </p>
                <FormSelect id="folder_structure" :options="state.options.folderStructures"
                    v-model="state.formFolderStructure.folder_structure" :disabled="props.formType === 'update'" />
                <FormError :error="v$?.formFolderStructure?.folder_structure?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.folder_structure_uuid?.[0]" />
            </div>
            <div class="space-y-4">
                <div v-for="(root, index) in state.formFolderStructure.structure" :key="index" class="space-y-3">
                    <!-- Subfolders -->
                    <div v-if="root.subfolder && root.subfolder.length > 0">
                        <ModulesUserCitizenDocumentFolderStructureRequestRecursiveSubfolders
                            :subfolders="root.subfolder" :parentIndex="index" @addSubfolder="addSubfolder"
                            @removeSubfolder="removeSubfolder" />
                    </div>
                </div>
            </div>

        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import { folderStructureService } from '@/components/api/user/FolderStructureService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedFolderStructureRequest: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['closeModal', 'isPageLoading', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formFolderStructure: {
        folder_structure: '',
        structure: [{
            root: "",
            level: 0,
            subfolder: [
                {
                    folder: "",
                    level: 1,
                    subfolder: []
                },
            ]
        }]
    },
    folderStructures: [] as any,
    options: {
        folderStructures: [],
    }
})

const rules = computed(() => {
    return {
        formFolderStructure: {
            folder_structure: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

onMounted(() => {
    fetchFolderStructures()
})

function closeModal() {
    emit('closeModal')
}

async function fetchFolderStructures() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await folderStructureService.getAllTemplatesForCompany()
        if (response?.data) {
            state.folderStructures = response.data
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.folderStructures = options
            if (props.selectedFolderStructureRequest) {
                state.formFolderStructure.folder_structure = props.selectedFolderStructureRequest?.folder_structure?.uuid
                state.formFolderStructure.structure = JSON.parse(props.selectedFolderStructureRequest?.structure)
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formFolderStructure)
    }
}

function removeRootFolder(index: number) {
    state.formFolderStructure.structure.splice(index, 1)
}

function addSubfolder(subfolder: any) {
    // Create a new subfolder with the next level
    const newSubfolder = {
        folder: "",
        level: subfolder?.level + 1 || 0,
        subfolder: []
    }

    // Ensure the subfolder array exists
    if (!subfolder.subfolder) {
        subfolder.subfolder = []
    }

    // Add the new subfolder as the last item
    subfolder.subfolder.push(newSubfolder)
}

function removeSubfolder(subfolder: any, index: number) {
    // Remove the subfolder at the given index
    subfolder.splice(index, 1)
}
</script>