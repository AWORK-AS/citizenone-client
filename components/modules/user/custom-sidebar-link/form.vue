<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="label" :label="$t('customSidebarLinks.form.label')" />
                <FormTextField id="label" name="label" :placeholder="$t('customSidebarLinks.form.labelPlaceholder')"
                    v-model="state.formLink.label" />
                <FormError :error="v$?.formLink?.label?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.label?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="url" :label="$t('customSidebarLinks.form.url')" />
                <FormTextField id="url" name="url" placeholder="https://" v-model="state.formLink.url" />
                <FormError :error="v$?.formLink?.url?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.url?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="visibility" :label="$t('customSidebarLinks.form.visibility')" />
                <FormSelect id="visibility" :options="visibilityOptions" v-model="state.formLink.visibility" />
                <FormError :error="props?.error?.errors?.visibility?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="icon" :label="$t('customSidebarLinks.form.icon')" />
                <div class="grid grid-cols-6 sm:grid-cols-9 gap-2">
                    <button v-for="ic in iconOptions" :key="ic" type="button"
                        :aria-label="ic" :aria-pressed="state.formLink.icon === ic"
                        @click="state.formLink.icon = ic"
                        :class="['flex items-center justify-center rounded-lg border p-2 transition-colors',
                            state.formLink.icon === ic
                                ? 'border-primary bg-primary-25 text-primary ring-1 ring-primary'
                                : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700']">
                        <Icon :name="ic" class="size-5" />
                    </button>
                </div>
                <div class="flex items-center gap-2 pt-1">
                    <FormTextField id="icon" name="icon" placeholder="ph:link" v-model="state.formLink.icon"
                        class="flex-1" />
                    <div class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500">
                        <Icon :name="state.formLink.icon || 'ph:link'" class="size-5" />
                    </div>
                </div>
                <p class="text-xxs text-gray-500">{{ $t('customSidebarLinks.form.iconHint') }}</p>
                <FormError :error="props?.error?.errors?.icon?.[0]" />
            </div>
            <div class="space-y-1 max-w-[12rem]">
                <FormLabel for="sort_order" :label="$t('customSidebarLinks.form.sortOrder')" />
                <FormTextField id="sort_order" name="sort_order" type="number" placeholder="0"
                    v-model="state.formLink.sort_order" />
                <FormError :error="props?.error?.errors?.sort_order?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="navigateTo('/settings/custom-links')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary">
                    {{ props.formType === 'create' ? $t('save') : $t('update') }}
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
    selectedLink: {
        type: Object,
        required: false,
    },
})

const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()

// Curated Iconify (Phosphor) set for the visual picker; the text field below
// still accepts any Iconify name for power users.
const iconOptions = [
    'ph:link', 'ph:globe', 'ph:house', 'ph:folder', 'ph:file-text', 'ph:calendar-blank',
    'ph:book-open', 'ph:chat-circle', 'ph:phone', 'ph:envelope', 'ph:users-three', 'ph:briefcase',
    'ph:chart-bar', 'ph:gear', 'ph:wrench', 'ph:database', 'ph:cloud', 'ph:lock',
    'ph:heart', 'ph:star', 'ph:bookmark-simple', 'ph:map-pin', 'ph:first-aid', 'ph:pill',
    'ph:graduation-cap', 'ph:megaphone', 'ph:info', 'ph:lightbulb', 'ph:shopping-cart', 'ph:credit-card',
    'ph:clipboard-text', 'ph:shield-check', 'ph:handshake', 'ph:currency-circle-dollar', 'ph:list-checks', 'ph:paperclip',
]

const visibilityOptions = computed(() => [
    { value: 'both', label: t('customSidebarLinks.visibility.both') },
    { value: 'admin', label: t('customSidebarLinks.visibility.admin') },
    { value: 'user', label: t('customSidebarLinks.visibility.user') },
])

const state = reactive({
    error: {} as Error,
    formLink: {
        label: '',
        url: '',
        visibility: 'both',
        icon: '',
        sort_order: '0',
    },
})

watch(() => props.selectedLink, (newValue: any) => {
    if (newValue != null) {
        state.formLink = {
            label: newValue.label ?? '',
            url: newValue.url ?? '',
            visibility: newValue.visibility ?? 'both',
            icon: newValue.icon ?? '',
            sort_order: (newValue.sort_order ?? 0).toString(),
        }
    }
}, { immediate: true })

const rules = computed(() => {
    return {
        formLink: {
            label: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            url: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$touch()
    if (v$.value.$invalid) return
    const url = state.formLink.url.trim()
    // Without a protocol, window.open() in the sidebar resolves the link
    // relative to the app itself instead of opening the external site.
    state.formLink.url = /^[a-z][a-z0-9+.-]*:\/\//i.test(url) ? url : `https://${url}`
    emit('submitForm', state.formLink)
}
</script>
