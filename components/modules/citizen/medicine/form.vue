<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error && props.error.length > 0 || props.error?.message" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="grid grid-cols-2 gap-x-3">
                <div class="space-y-1">
                    <FormLabel for="name" :label="$t('citizens.medicineJournals.form.name')" />
                    <FormTextField id="name" name="name" :placeholder="$t('citizens.medicineJournals.form.name')"
                        v-model="state.formMedicine.name" />
                    <FormError :error="v$?.formMedicine?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.name?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="date_given" :label="$t('citizens.medicineJournals.form.dateGiven')" />
                    <FormDateField id="date_given" name="date_given"
                        :placeholder="$t('citizens.medicineJournals.form.dateGiven')"
                        v-model="state.formMedicine.date_given" />
                    <FormError :error="v$?.formMedicine?.date_given?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.date_given?.[0]" />
                </div>
            </div>
            <div class="space-y-1">
                <FormLabel for="description" :label="$t('citizens.medicineJournals.form.reason')" />
                <FormTextArea id="description" name="description"
                    :placeholder="$t('citizens.medicineJournals.form.reason')"
                    v-model="state.formMedicine.description" />
                <FormError :error="v$?.formMedicine?.description?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.description?.[0]" />
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
    selectedMedicine: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    formMedicine: {
        id: '',
        uuid: '',
        name: '',
        date_given: '',
        description: '',
    },
})

onMounted(() => {
    state.formMedicine = {
        id: props.selectedMedicine.id,
        uuid: props.selectedMedicine.uuid,
        name: props.selectedMedicine.name,
        date_given: props.selectedMedicine.date_given,
        description: props.selectedMedicine.description,
    }
})

watch(() => props.selectedMedicine, (newValue: any) => {
    if (newValue != null) {
        state.formMedicine = {
            id: newValue.id,
            uuid: newValue.uuid,
            name: newValue.name,
            date_given: newValue.date_given,
            description: newValue.description,
        }
    }
})

const rules = computed(() => {
    return {
        formMedicine: {
            name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            date_given: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            description: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formMedicine)
    }
}
</script>