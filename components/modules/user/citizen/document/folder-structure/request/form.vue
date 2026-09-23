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
            <div class="space-y-4" v-if="state.formFolderStructure.folder_structure">
                <div v-for="(root, index) in state.formFolderStructure.structure" :key="index" class="space-y-3">
                    <div class="space-y-1">
                        <FormLabel :for="`root-${index}`" :label="`${t('folderStructure.form.rootFolder')}`" />
                        <!-- Root folder name is shown but not editable here: renaming/adding go through subfolders, root stays stable so citizen folders can still be matched to this template. -->
                        <FormTextField :id="`root-${index}`" :name="`root-${index}`"
                            v-model="state.formFolderStructure.structure[index].root"
                            :placeholder="$t('folderStructure.form.rootFolder')" disabled />
                    </div>

                    <!-- Subfolders -->
                    <div v-if="root.subfolder && root.subfolder.length > 0" class="ml-6">
                        <ModulesUserCitizenDocumentFolderStructureRequestRecursiveSubfolders
                            :subfolders="root.subfolder" :parentIndex="index" @addSubfolder="addSubfolder" />
                    </div>

                    <!-- Add Subfolder Button -->
                    <button type="button" class="text-primary text-sm hover:underline ml-6"
                        @click="addSubfolder(state.formFolderStructure.structure[index])">
                        {{ t('folderStructure.form.addSubfolder') }}
                    </button>
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

// getAllTemplatesForCitizen() sets `folder_structure` from selectedFolderStructureRequest
// too, which would otherwise re-trigger the watcher below and clobber the structure
// it just loaded from the request itself.
let skipNextStructureFetch = false

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
        const response = await folderStructureService.getAllTemplatesForCitizen()
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
                skipNextStructureFetch = true
                state.formFolderStructure.folder_structure = props.selectedFolderStructureRequest?.folder_structure?.uuid
                state.formFolderStructure.structure = JSON.parse(props.selectedFolderStructureRequest?.structure)
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

// Once the admin picks a folder structure, load its current structure so they can
// see and edit what's already there instead of proposing changes blind.
watch(() => state.formFolderStructure.folder_structure, async (folderStructureUuid) => {
    if (skipNextStructureFetch) {
        skipNextStructureFetch = false
        return
    }
    if (!folderStructureUuid) {
        return
    }
    state.error = {}
    try {
        const response = await folderStructureService.getFolderStructure(folderStructureUuid)
        if (response?.data?.structure) {
            state.formFolderStructure.structure = JSON.parse(response.data.structure)
        }
    } catch (error: any) {
        state.error = error
    }
})

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formFolderStructure)
    }
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
</script>