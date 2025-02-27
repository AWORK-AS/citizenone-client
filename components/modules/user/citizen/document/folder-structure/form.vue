<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="name" :label="$t('folderStructure.form.name')" />
                <FormTextField id="name" name="name" :placeholder="$t('folderStructure.form.name')"
                    v-model="state.formFolderStructure.name" />
                <FormError :error="v$?.formFolderStructure?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>
            <div class="space-y-4">
                <!-- Root Folders -->
                <div v-for="(root, index) in state.formFolderStructure.structure" :key="index" class="space-y-3">
                    <div class="space-y-1">
                        <FormLabel :for="`root-${index}`" :label="`${t('folderStructure.form.rootFolder')}`" />
                        <div class="flex items-center justify-between space-x-2">
                            <div class="space-y-1 w-full">
                                <!-- Root Folder Input -->
                                <FormTextField :id="`root-${index}`" :name="`root-${index}`"
                                    v-model="state.formFolderStructure.structure[index].root"
                                    :placeholder="$t('folderStructure.form.rootFolder')" />
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
                        <ModulesUserCitizenDocumentFolderStructureRecursiveSubfolders :subfolders="root.subfolder"
                            :parentIndex="index" @addSubfolder="addSubfolder" @removeSubfolder="removeSubfolder" />
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
    selectedFolderStructure: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['closeModal', 'isPageLoading', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formFolderStructure: {
        name: props.selectedFolderStructure?.name || '',
        structure: props.selectedFolderStructure?.structure ? JSON.parse(props.selectedFolderStructure?.structure) : [
            {
                root: "",
                level: 0,
                subfolder: []
            }
        ]
    },
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