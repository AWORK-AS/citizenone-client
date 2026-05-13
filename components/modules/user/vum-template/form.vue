<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="name" :label="$t('plansandgoals.VUMTemplates.form.templateName')" />
                <FormTextField id="name" name="name" :placeholder="$t('plansandgoals.VUMTemplates.form.templateName')"
                    v-model="state.formTemplate.name" />
                <FormError :error="v$?.formTemplate?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>
            <div>
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formTemplate.is_active = !state.formTemplate.is_active">
                    <FormCheckbox :value="state.formTemplate.is_active" />
                    {{ $t('plansandgoals.VUMTemplates.form.active') }}
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
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedTemplate: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['closeModal', 'submitForm'])
const { t } = useI18n()

const state = reactive({
    formTemplate: {
        id: '',
        uuid: '',
        name: '',
        is_active: false,
    },
})

onMounted(() => {
    state.formTemplate = {
        id: props.selectedTemplate.id,
        uuid: props.selectedTemplate.uuid,
        name: props.selectedTemplate.name,
        is_active: props.selectedTemplate.is_active,
    }
})

watch(() => props.selectedTemplate, (newValue: any) => {
    if (newValue != null) {
        state.formTemplate = {
            id: newValue.id,
            uuid: newValue.uuid,
            name: newValue.name,
            is_active: newValue.is_active,
        }
    }
})

const rules = computed(() => {
    return {
        formTemplate: {
            name: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formTemplate)
    }
}
</script>