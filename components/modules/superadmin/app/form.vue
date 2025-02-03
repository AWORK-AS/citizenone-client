<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-2xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="space-y-1">
                <p class="text-sm text-gray-600">Logo</p>
                <div class="flex flex-col items-start">
                    <input type="file" ref="logo" @change="onLogoFileChange" class="hidden" />
                    <div class="relative cursor-pointer" @click="triggerLogoFileInput">
                        <img :src="logoUrl" alt="Avatar"
                            class="w-44 h-44 rounded-md object-cover border-2 border-tertiary-25" />
                        <div
                            class="rounded-md absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity">
                            <div class="flex items-center w-full h-full justify-center text-xs">
                                Change Image
                            </div>
                        </div>
                    </div>
                </div>
                <FormError :error="v$?.formApp?.logo?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.logo?.[0]" />
            </div>
            <div class="space-y-1">
                <p class="text-sm text-gray-600">Image</p>
                <div class="flex flex-col items-start">
                    <input type="file" ref="image" @change="onImageFileChange" class="hidden" />
                    <div class="relative cursor-pointer" @click="triggerImageFileInput">
                        <img :src="imageUrl" alt="Avatar"
                            class="w-64 h-64 rounded-md object-cover border-2 border-tertiary-25" />
                        <div
                            class="rounded-md absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity">
                            <div class="flex items-center w-full h-full justify-center text-xs">
                                Change Image
                            </div>
                        </div>
                    </div>
                </div>
                <FormError :error="v$?.formApp?.image?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.image?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="name" :label="$t('superadmin.apps.form.name')" />
                <FormTextField id="name" name="name" :placeholder="$t('superadmin.apps.form.name')"
                    v-model="state.formApp.name" />
                <FormError :error="v$?.formApp?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="description" :label="$t('superadmin.apps.form.description')" />
                <FormTextArea id="description" name="description" :placeholder="$t('superadmin.apps.form.description')"
                    v-model="state.formApp.description" />
                <FormError :error="v$?.formApp?.description?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.description?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formApp.is_one_time_fee = !state.formApp.is_one_time_fee">
                    <FormCheckbox :value="state.formApp.is_one_time_fee" />
                    {{ $t('superadmin.apps.form.isOneTimeFee') }}
                </div>
            </div>
            <div class="space-y-1" v-if="state.formApp.is_one_time_fee">
                <FormLabel for="price" :label="$t('superadmin.apps.form.price')" />
                <FormTextField id="price" name="price" :placeholder="$t('superadmin.apps.form.price')"
                    v-model="state.formApp.price" />
                <FormError :error="v$?.formApp?.price?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.price?.[0]" />
            </div>
            <div class="space-y-1" v-if="!state.formApp.is_one_time_fee">
                <FormLabel for="monthly_price" :label="$t('superadmin.apps.form.monthlyPrice')" />
                <FormTextField id="monthly_price" name="monthly_price"
                    :placeholder="$t('superadmin.apps.form.monthlyPrice')" v-model="state.formApp.monthly_price" />
                <FormError :error="v$?.formApp?.monthly_price?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.monthly_price?.[0]" />
            </div>
            <div class="space-y-1" v-if="!state.formApp.is_one_time_fee">
                <FormLabel for="yearly_price" :label="$t('superadmin.apps.form.yearlyPrice')" />
                <FormTextField id="yearly_price" name="yearly_price"
                    :placeholder="$t('superadmin.apps.form.yearlyPrice')" v-model="state.formApp.yearly_price" />
                <FormError :error="v$?.formApp?.yearly_price?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.yearly_price?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="type" :label="$t('superadmin.apps.form.type')" />
                <FormSelect id="type" :options="state.options.type" v-model="state.formApp.type" />
                <FormError :error="v$?.formApp?.type?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.type?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formApp.is_thirdparty = !state.formApp.is_thirdparty">
                    <FormCheckbox :value="state.formApp.is_thirdparty" />
                    {{ $t('superadmin.apps.form.thirdPartyApp') }}
                </div>
            </div>
            <div class="space-y-1">
                <FormLabel for="link" :label="$t('superadmin.apps.form.link')" />
                <FormTextField id="link" name="link" :placeholder="$t('superadmin.apps.form.link')"
                    v-model="state.formApp.url_field" />
                <FormError :error="v$?.formApp?.url_field?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.url_field?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                    @click="navigateTo('/superadmin/apps')">
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
import type { AppForm, Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedApp: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()
const logo = ref<HTMLInputElement | null>(null)
const logoUrl = ref(`https://via.placeholder.com/1024x1024.png?text=Upload+Image`)
const image = ref<HTMLInputElement | null>(null)
const imageUrl = ref(`https://via.placeholder.com/1024x1024.png?text=Upload+Image`)
const language = useI18n()

const state = reactive({
    error: {} as Error,
    formApp: {
        name: '',
        description: '',
        is_one_time_fee: false,
        price: '',
        monthly_price: '',
        yearly_price: '',
        type: '',
        logo: '',
        image: '',
        is_thirdparty: false,
        url_field: '',
    } as AppForm,
    options: {
        type: [
            { value: 'marketing', label: `${t('superadmin.apps.form.types.marketing')}` },
            { value: 'visual', label: `${t('superadmin.apps.form.types.visual')}` },
            { value: 'other', label: `${t('superadmin.apps.form.types.other')}` },
        ]
    }
})

watch(() => props.selectedApp, (newValue: any) => {
    if (newValue != null) {
        state.formApp = {
            name: newValue.name,
            description: newValue.description,
            is_one_time_fee: newValue.is_one_time_fee,
            price: newValue.price,
            monthly_price: newValue.monthly_price,
            yearly_price: newValue.yearly_price,
            type: newValue.type,
            logo: '',
            image: '',
            is_thirdparty: newValue.is_thirdparty,
            url_field: newValue.url_field,
        }
        if (newValue.logo) {
            logoUrl.value = newValue.logo
        }
        if (newValue.image) {
            imageUrl.value = newValue.image
        }
    }
})

watch(() => language.locale.value, (newValue: any) => {
    if (newValue != null) {
        state.options.type = [
            { value: 'marketing', label: `${t('superadmin.apps.form.types.marketing')}` },
            { value: 'visual', label: `${t('superadmin.apps.form.types.visual')}` },
            { value: 'other', label: `${t('superadmin.apps.form.types.other')}` },
        ]
    }
})

const rules = computed(() => {
    if (state.formApp.is_one_time_fee) {
        return {
            formApp: {
                name: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                description: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                price: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                type: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    } else {
        return {
            formApp: {
                name: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                description: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                monthly_price: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                yearly_price: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                type: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    }
})

const v$ = useVuelidate(rules, state)


function triggerLogoFileInput() {
    if (logo.value) {
        logo.value.click()
    }
}

function onLogoFileChange(event: any) {
    const file = event.target.files[0]
    if (file) {
        state.formApp.logo = event.target.files[0]
        const reader = new FileReader()
        reader.onload = (e: any) => {
            logoUrl.value = e.target.result
        }
        reader.readAsDataURL(file)
    }
}

function triggerImageFileInput() {
    if (image.value) {
        image.value.click()
    }
}

function onImageFileChange(event: any) {
    const file = event.target.files[0]
    if (file) {
        state.formApp.image = event.target.files[0]
        const reader = new FileReader()
        reader.onload = (e: any) => {
            imageUrl.value = e.target.result
        }
        reader.readAsDataURL(file)
    }
}

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formApp)
    }
}
</script>