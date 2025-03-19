<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="image" :label="$t('citizens.medicineJournals.form.image')" />
                <div class="h-36 w-36">
                    <input type="file" ref="image" id="image" @change="onFileChange" class="hidden" />
                    <div class="relative cursor-pointer" @click="triggerFileInput">
                        <img :src="imageUrl" alt="Avatar" class="w-36 h-36 object-cover" v-if="imageUrl" />
                        <Icon name="material-symbols-light:add-photo-alternate-outline" class="w-36 h-36" v-else />
                        <div
                            class="absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity">
                            <div class="flex items-center w-full h-full justify-center text-xs">
                                Change Image
                            </div>
                        </div>
                    </div>
                </div>
                <FormError :error="v$?.formMedicine?.image?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.image?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="en_name" :label="$t('medicines.form.nameEnglish')" />
                <FormTextField id="en_name" name="en_name" :placeholder="$t('medicines.form.nameEnglish')"
                    v-model="state.formMedicine.en_name" />
                <FormError :error="v$?.formMedicine?.en_name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.en_name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="dk_name" :label="$t('medicines.form.nameDanish')" />
                <FormTextField id="dk_name" name="dk_name" :placeholder="$t('medicines.form.nameDanish')"
                    v-model="state.formMedicine.dk_name" />
                <FormError :error="v$?.formMedicine?.dk_name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.dk_name?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                    @click="navigateTo('/settings/medicines')">
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
    selectedMedicine: {
        type: Object,
        required: true,
    },
})

const image = ref<HTMLInputElement | null>(null)
let imageUrl = ref(props.selectedMedicine?.image ?? '')
const emit = defineEmits(['isPageLoading', 'submitForm'])
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formMedicine: {
        image: '',
        en_name: '',
        dk_name: '',
    },
})

watch(() => props.selectedMedicine, (newValue: any) => {
    if (newValue != null) {
        state.formMedicine = {
            image: '',
            en_name: newValue.en_name,
            dk_name: newValue.dk_name,
        }
        if (newValue?.image) {
            imageUrl.value = newValue?.image
        }
    }
})

const rules = computed(() => {
    return {
        formMedicine: {
            en_name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            dk_name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function onFileChange(event: any) {
    const file = event.target.files[0]
    state.formMedicine.image = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e: any) => {
            imageUrl.value = e.target.result
        }
        reader.readAsDataURL(file)
    }
    else {
        imageUrl.value = ''
    }
}

function triggerFileInput() {
    if (image.value) {
        image.value.click()
    }
}

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formMedicine)
    }
}
</script>