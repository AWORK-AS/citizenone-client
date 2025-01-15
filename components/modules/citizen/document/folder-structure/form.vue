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
                <div v-for="(root, rootIndex) in state.formFolderStructure.structure" :key="rootIndex"
                    class="p-4 border rounded">
                    <div class="flex items-center justify-between">
                        <div>
                            <FormLabel :for="`root_folder_${rootIndex}`"
                                :label="`${t('citizens.documents.folderStructure.form.root')} ${rootIndex + 1}`" />
                            <FormTextField :id="`root_folder_${rootIndex}`" :name="`root_folder_${rootIndex}`"
                                v-model="root.root" :placeholder="t('citizens.documents.folderStructure.form.root')" />
                        </div>
                        <!-- Add/Remove Root Folder Buttons -->
                        <div v-if="rootIndex !== 0" class="flex space-x-2">
                            <button type="button" @click="removeRootFolder(rootIndex)" class="btn btn-danger">
                                Remove
                            </button>
                        </div>
                    </div>

                    <!-- Subfolders Section -->
                    <div class="ml-6 space-y-2">
                        <div v-for="(sub, subIndex) in root.subfolder" :key="`${rootIndex}-${subIndex}`"
                            class="p-2 border rounded">
                            <div class="flex items-center justify-between">
                                <div>
                                    <FormLabel :for="`subfolder_${rootIndex}_${subIndex}`"
                                        :label="t('citizens.documents.folderStructure.form.subfolder')" />
                                    <FormTextField :id="`subfolder_${rootIndex}_${subIndex}`"
                                        :name="`subfolder_${rootIndex}_${subIndex}`" v-model="sub.folder"
                                        :placeholder="t('citizens.documents.folderStructure.form.subfolder')" />
                                </div>
                                <button type="button" @click="removeSubfolder(rootIndex, subIndex)"
                                    class="btn btn-danger">
                                    Remove subfolder
                                </button>
                            </div>

                            <!-- Nested Subfolders -->
                            <!-- <div class="ml-6">
                                <button type="button" @click="addSubfolder(rootIndex, subIndex)"
                                    class="btn btn-secondary">
                                    Add subfolder
                                </button>
                            </div> -->
                        </div>

                        <!-- Add Subfolder Button -->
                        <button type="button" @click="addSubfolder(rootIndex)" class="btn btn-secondary">
                            Add subfolder
                        </button>
                    </div>
                </div>

                <!-- Add Root Folder Button -->
                <button type="button" @click="addRootFolder" class="btn btn-primary">
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
                subfolder: [
                    {
                        folder: "Folder 1.1",
                        subfolder: [
                            {
                                folder: "Folder 1.1.1",
                                subfolder: [
                                    {
                                        folder: "Folder 1.2",
                                        subfolder: [
                                            {
                                                folder: "Folder 1.1.3",
                                                subfolder: [
                                                    {
                                                        folder: "Folder 1.4",
                                                        subfolder: [
                                                            {
                                                                folder: "Folder 1.1.5",
                                                                subfolder: [
                                                                    {
                                                                        folder: "Folder 1.6",
                                                                        subfolder: [
                                                                            {
                                                                                folder: "Folder 1.1.7",
                                                                                subfolder: [
                                                                                    {
                                                                                        folder: "Folder 1.8",
                                                                                        subfolder: [
                                                                                            {
                                                                                                folder: "Folder 1.1.9",
                                                                                                subfolder: [
                                                                                                    {
                                                                                                        folder: "Folder 1.1.10",
                                                                                                    }
                                                                                                ]
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                ]
                                                                            }
                                                                        ]
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                root: "Root folder 2",
            },
            {
                root: "Root folder 3",
            },
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

interface Subfolder {
    folder: string;
    subfolder: Subfolder[];
}

interface RootFolder {
    root: string;
    subfolder: Subfolder[];
}

const structure = reactive<RootFolder[]>([
    {
        root: "Root folder 1",
        subfolder: [],
    },
]);

function addRootFolder() {
    structure.push({
        root: `Root folder ${structure.length + 1}`,
        subfolder: [],
    });
}

function removeRootFolder(index: number) {
    structure.splice(index, 1);
}

function addSubfolder(rootIndex: number, parentSubIndex: number | null = null) {
    const newSubfolder: Subfolder = {
        folder: "",
        subfolder: [],
    }

    if (parentSubIndex === null) {
        structure[rootIndex].subfolder.push(newSubfolder);
    } else {
        structure[rootIndex].subfolder[parentSubIndex].subfolder.push(newSubfolder);
    }
}

function removeSubfolder(rootIndex: number, subIndex: number) {
    structure[rootIndex].subfolder.splice(subIndex, 1);
}
</script>