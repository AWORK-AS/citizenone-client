<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error && props.error.length > 0 || props.error?.message" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="grid grid-cols-2 gap-x-3">
                <div class="space-y-1">
                    <FormLabel for="title" :label="$t('citizens.citizenJournals.form.title')" />
                    <FormTextField id="title" name="title" :placeholder="$t('citizens.citizenJournals.form.title')"
                        v-model="state.formJournal.title" />
                    <FormError :error="v$?.formJournal?.title?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.title?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="date" :label="$t('citizens.citizenJournals.form.date')" />
                    <FormDateField id="date" name="date" placeholder="Date" v-model="state.formJournal.date" />
                    <FormError :error="v$?.formJournal?.date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.date?.[0]" />
                </div>
            </div>
            <div class="space-y-1">
                <FormLabel for="content" :label="$t('citizens.citizenJournals.form.content')" />
                <FormTextArea id="content" name="content" :placeholder="$t('citizens.citizenJournals.form.content')"
                    v-model="state.formJournal.content" />
                <FormError :error="v$?.formJournal?.content?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.content?.[0]" />
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
    selectedJournal: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    formJournal: {
        id: '',
        uuid: '',
        content: '',
        date: '',
        title: '',
    },
})

onMounted(() => {
    state.formJournal = {
        id: props.selectedJournal.id,
        uuid: props.selectedJournal.uuid,
        content: props.selectedJournal.content,
        date: props.selectedJournal.date,
        title: props.selectedJournal.title,
    }
})

watch(() => props.selectedJournal, (newValue: any) => {
    if (newValue != null) {
        state.formJournal = {
            id: newValue.id,
            uuid: newValue.uuid,
            content: newValue.content,
            date: newValue.date,
            title: newValue.title,
        }
    }
})

const rules = computed(() => {
    return {
        formJournal: {
            title: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            date: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            content: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formJournal)
    }
}
</script>