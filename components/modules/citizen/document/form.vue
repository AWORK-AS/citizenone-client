<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="space-y-1">
                <FormLabel for="name" :label="$t('citizens.documents.form.name')" />
                <FormTextField id="name" name="name" :placeholder="$t('citizens.documents.form.name')"
                    v-model="state.formDirectory.name" />
                <FormError :error="v$?.formDirectory?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>
            <div>
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formDirectory.is_admin_access = !state.formDirectory.is_admin_access">
                    <FormCheckbox :value="state.formDirectory.is_admin_access" />
                    {{ $t('citizens.documents.form.forAdministratorsOnly') }}
                </div>
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="emit('closeModal')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
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
    selectedDirectory: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    formDirectory: {
        id: '',
        uuid: '',
        name: '',
        is_admin_access: false,
    },
})

onMounted(() => {
    state.formDirectory = {
        id: props.selectedDirectory.id,
        uuid: props.selectedDirectory.uuid,
        name: props.selectedDirectory.name,
        is_admin_access: props.selectedDirectory.is_admin_access,
    }
})

watch(() => props.selectedDirectory, (newValue: any) => {
    if (newValue != null) {
        state.formDirectory = {
            id: newValue.id,
            uuid: newValue.uuid,
            name: newValue.name,
            is_admin_access: newValue.is_admin_access,
        }
    }
})

const rules = computed(() => {
    return {
        formDirectory: {
            name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formDirectory)
    }
}
</script>