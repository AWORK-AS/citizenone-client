<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="name" :label="$t('citizens.documents.folderStructure.form.name')" />
                <FormTextField id="name" name="name" :placeholder="$t('citizens.documents.folderStructure.form.name')"
                    v-model="state.formFolderStructure.name" />
                <FormError :error="v$?.formFolderStructure?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>
            <div class="space-y-4">
                <!-- Root Folders -->
                <div v-for="(root, index) in state.formFolderStructure.structure" :key="index" class="space-y-3">
                    <div class="space-y-1">
                        <FormLabel :for="`root-${index}`"
                            :label="`${t('citizens.documents.folderStructure.form.rootFolder')}`" />
                        <div class="flex items-center justify-between space-x-2">
                            <div class="space-y-1 w-full">
                                <FormTextField :id="`root-${index}`" :name="`root-${index}`" v-model="root.root"
                                    :placeholder="$t('citizens.documents.folderStructure.form.rootFolder')" />
                            </div>
                            <!-- Remove Root Folder Button -->
                            <div v-if="state.formFolderStructure.structure?.length > 1">
                                <button type="button" class="text-red-500 text-sm hover:underline"
                                    @click="removeRootFolder(index)">
                                    <Icon name="ph:trash" class="h-5 w-5 text-red-600" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Subfolders -->
                    <div v-if="root.subfolder && root.subfolder.length > 0" class="ml-6">
                        <ModulesCitizenDocumentFolderStructureRecursiveSubfolders :subfolders="root.subfolder"
                            :parentIndex="index" @addSubfolder="addSubfolder" @removeSubfolder="removeSubfolder" />
                    </div>

                    <!-- Add Subfolder Button -->
                    <button type="button" class="text-primary text-sm hover:underline ml-6"
                        @click="addSubfolder(state.formFolderStructure.structure[index])">
                        Add subfolder
                    </button>
                </div>

                <!-- Add Root Folder Button -->
                <button type="button" class="text-primary text-sm hover:underline" @click="addRootFolder">
                    Add root folder
                </button>
            </div>

        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
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
    selectedAddiction: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['closeModal', 'isPageLoading', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formFolderStructure: {
        name: '',
        structure: [
            {
                root: "Root folder 1",
                level: 1,
                subfolder: [
                    {
                        folder: "Folder 1.1",
                        level: 2,
                        subfolder: [
                            {
                                folder: "Folder 1.1.1",
                                level: 3,
                                subfolder: [
                                    {
                                        folder: "Folder 1.1.1.1",
                                        level: 4,
                                        subfolder: [
                                            {
                                                folder: "Folder 1.1.1.1.1",
                                                level: 5,
                                                subfolder: []
                                            }
                                        ]
                                    },
                                    {
                                        folder: "Folder 1.1.1.2",
                                        level: 4,
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
})

watch(() => props.selectedAddiction, (newValue: any) => {
    if (newValue != null) {
        state.formFolderStructure = {
            name: newValue.name,
            structure: newValue.structure,
        }
    }
})

const rules = computed(() => {
    return {
        formFolderStructure: {
            name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('closeModal')
}

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formFolderStructure)
    }
}

function addRootFolder() {
    state.formFolderStructure.structure.push({
        root: 'Root folder',
        level: 1,
        subfolder: [],
    })
}

function removeRootFolder(index: number) {
    state.formFolderStructure.structure.splice(index, 1)
}

function addSubfolder(parentFolder: any) {
    console.log(parentFolder)
    // if (!parentFolder.subfolder) {
    //     parentFolder.subfolder = [];
    // }

    // const newLevel = parentFolder.level + 1; // Increment the level based on the parent folder
    // const subfolderName = `Subfolder ${newLevel}.${parentFolder.subfolder.length + 1}`;

    // parentFolder.subfolder.push({
    //     folder: subfolderName,
    //     level: newLevel,
    //     subfolder: [],
    // });
}

function removeSubfolder(subfolders: any[], index: number) {
    console.log('subfolders', subfolders)
    console.log('index', index)
}
</script>