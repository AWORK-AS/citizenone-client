<template>
    <form @submit.prevent="submitForm()" id="formDirectory">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="space-y-3">
            <div class="w-fit flex items-center cursor-pointer"
                @click="state.formDirectory.is_use_template = !state.formDirectory.is_use_template"
                v-if="props.formType === 'create'">
                <FormCheckbox :value="state.formDirectory.is_use_template" />
                {{ $t('citizens.documents.form.useTemplate') }}
            </div>
            <div v-if="state.formDirectory.is_use_template">
                <div class="space-y-3">
                    <div class="space-y-1">
                        <FormLabel for="template" :label="$t('citizens.documents.form.template')" />
                        <FormSelect id="template" :options="state.options.templates"
                            v-model="state.formDirectory.template" />
                        <FormError :error="v$?.formDirectory?.template?.$errors[0]?.$message.toString()" />
                        <FormError :error="props?.error?.errors?.template_uuid?.[0]" />
                    </div>
                </div>
            </div>
            <div class="space-y-1" v-else>
                <FormLabel for="name" :label="$t('citizens.documents.form.name')" />
                <FormTextField id="name" name="name" :placeholder="$t('citizens.documents.form.name')"
                    v-model="state.formDirectory.name" />
                <FormError :error="v$?.formDirectory?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>
            <div v-if="props.showAdminCheckbox">
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formDirectory.is_admin_access = !state.formDirectory.is_admin_access">
                    <FormCheckbox :value="state.formDirectory.is_admin_access" />
                    {{ $t('citizens.documents.form.forAdministratorsOnly') }}
                </div>
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="emit('closeModal')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="w-full">
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
    selectedDocument: {
        type: Object,
        required: true,
    },
    showAdminCheckbox: {
        type: Boolean,
        required: false,
        default: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm', 'isPageLoading'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formDirectory: {
        id: '',
        uuid: '',
        name: '',
        is_admin_access: false,
        is_use_template: false,
        template: '',
    },
    options: {
        templates: [] as any
    },
})

onMounted(() => {
    state.formDirectory = {
        id: props.selectedDocument.id,
        uuid: props.selectedDocument.uuid,
        name: props.selectedDocument.name,
        is_admin_access: props.selectedDocument.is_admin_access,
        is_use_template: false,
        template: '',
    }
    fetchTemplates()
})

watch(() => props.selectedDocument, (newValue: any) => {
    if (newValue != null) {
        state.formDirectory = {
            id: newValue.id,
            uuid: newValue.uuid,
            name: newValue.name,
            is_admin_access: newValue.is_admin_access,
            is_use_template: false,
            template: '',
        }
    }
})

const rules = computed(() => {
    if (state.formDirectory.is_use_template) {
        return {
            formDirectory: {
                template: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    } else {
        return {
            formDirectory: {
                name: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formDirectory)
    }
}

async function fetchTemplates() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await folderStructureService.getAllTemplatesForCitizen()
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.templates = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

</script>

<style>
#formDirectory .multiselect-dropdown {
    max-height: 4.8rem !important;
}
</style>