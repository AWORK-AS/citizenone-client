<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-2xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="space-y-1">
                <div class="flex flex-col items-center">
                    <input type="file" ref="image" @change="onFileChange" class="hidden" />
                    <div class="relative cursor-pointer" @click="triggerFileInput">
                        <img :src="avatarUrl" alt="Avatar"
                            class="w-44 h-44 rounded-md object-cover border-2 border-tertiary-25" />
                        <div
                            class="rounded-md absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity">
                            <div class="flex items-center w-full h-full justify-center text-xs">
                                Change Image
                            </div>
                        </div>
                    </div>
                </div>
                <FormError :error="v$?.formSalesCampaign?.image?.$errors[0]?.$message.toString()" class="text-center" />
                <FormError :error="props?.error?.errors?.image?.[0]" class="text-center" />
            </div>
            <div class="space-y-1">
                <FormLabel for="title" :label="$t('superadmin.salesCampaign.form.title')" />
                <FormTextField id="title" name="title" :placeholder="$t('superadmin.salesCampaign.form.title')"
                    v-model="state.formSalesCampaign.title" />
                <FormError :error="v$?.formSalesCampaign?.title?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.title?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="link" :label="$t('superadmin.salesCampaign.form.link')" />
                <FormTextField id="link" name="link" :placeholder="$t('superadmin.salesCampaign.form.link')"
                    v-model="state.formSalesCampaign.link" />
                <FormError :error="v$?.formSalesCampaign?.link?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.link?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="content" :label="$t('superadmin.salesCampaign.form.content')" />
                <FormTextArea id="content" name="content" :placeholder="$t('superadmin.salesCampaign.form.content')"
                    v-model="state.formSalesCampaign.content" />
                <FormError :error="v$?.formSalesCampaign?.content?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.content?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="w-fit flex items-center cursor-pointer" @click="changeIsActive">
                    <FormCheckbox :value="state.formSalesCampaign.is_active" />
                    {{ $t('superadmin.salesCampaign.form.active') }}
                </div>
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                    @click="navigateTo('/superadmin/sales-campaign')">
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
import type { SalesCampaignForm, Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedSalesCampaign: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()
const image = ref<HTMLInputElement | null>(null)
const avatarUrl = ref(`/img/icons/asset-02.svg`)

const state = reactive({
    error: {} as Error,
    formSalesCampaign: {
        image: '',
        title: '',
        link: '',
        content: '',
        is_active: true,
    } as SalesCampaignForm,
})

watch(() => props.selectedSalesCampaign, (newValue: any) => {
    if (newValue != null) {
        state.formSalesCampaign = {
            image: '',
            title: newValue.title,
            link: newValue.link,
            content: newValue.content,
            is_active: newValue.is_active,
        }
        avatarUrl.value = newValue.image
    }
})

const rules = computed(() => {
    if (props.formType === 'create') {
        return {
            formSalesCampaign: {
                image: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                title: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                content: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    } else {
        return {
            formSalesCampaign: {
                title: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                content: {
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
        emit('submitForm', state.formSalesCampaign)
    }
}

function triggerFileInput() {
    if (image.value) {
        image.value.click()
    }
}

function onFileChange(event: any) {
    const file = event.target.files[0]
    state.formSalesCampaign.image = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e: any) => {
            avatarUrl.value = e.target.result
        }
        reader.readAsDataURL(file)
    }
}

function changeIsActive() {
    state.formSalesCampaign.is_active = !state.formSalesCampaign.is_active
}
</script>