<template>
    <form @submit.prevent="submitForm()" class="space-y-4 text-left">
        <Alert type="danger" :text="props.error?.message" v-if="props.error?.message" />

        <div class="space-y-1">
            <SuperadminFormLabel for="title" :label="$t('superadmin.roadmap.form.title')" />
            <input id="title" v-model="state.form.title" type="text" maxlength="255"
                class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            <SuperadminFormError :error="v$.form.title.$errors[0]?.$message?.toString()" />
            <SuperadminFormError :error="props.error?.errors?.title?.[0]" />
        </div>

        <div class="space-y-1">
            <SuperadminFormLabel for="description" :label="$t('superadmin.roadmap.form.description')" />
            <p class="text-xs text-gray-500">{{ $t('superadmin.roadmap.form.descriptionHint') }}</p>
            <ckeditor :editor="editor" v-model="state.form.description" :config="editorConfig"></ckeditor>
            <SuperadminFormError :error="props.error?.errors?.description?.[0]" />
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="space-y-1">
                <SuperadminFormLabel for="status" :label="$t('superadmin.roadmap.form.status')" />
                <select id="status" v-model="state.form.status"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none">
                    <option v-for="status in statuses" :key="status" :value="status">
                        {{ $t(`comingFunctions.status.${status}`) }}
                    </option>
                </select>
                <SuperadminFormError :error="props.error?.errors?.status?.[0]" />
            </div>
            <div class="space-y-1">
                <SuperadminFormLabel for="expected_period" :label="$t('superadmin.roadmap.form.expectedPeriod')" />
                <input id="expected_period" v-model="state.form.expected_period" type="text" maxlength="50"
                    :placeholder="$t('superadmin.roadmap.form.expectedPeriodPlaceholder')"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                <SuperadminFormError :error="props.error?.errors?.expected_period?.[0]" />
            </div>
        </div>

        <div class="space-y-1">
            <SuperadminFormLabel :label="$t('superadmin.roadmap.form.industries')" />
            <p class="text-xs text-gray-500">{{ $t('superadmin.roadmap.form.industriesHint') }}</p>
            <div class="flex flex-wrap gap-2 pt-1">
                <label v-for="industry in props.industries" :key="industry.uuid"
                    class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
                    :class="state.form.industry_uuids.includes(industry.uuid) ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-600'">
                    <input type="checkbox" class="sr-only" :value="industry.uuid" v-model="state.form.industry_uuids" />
                    {{ industryName(industry) }}
                </label>
            </div>
            <SuperadminFormError :error="props.error?.errors?.industry_uuids?.[0]" />
        </div>

        <label class="flex cursor-pointer items-start gap-2 rounded-md border border-gray-200 bg-gray-50 p-3">
            <input v-model="state.form.is_published" type="checkbox" class="mt-0.5" />
            <span>
                <span class="block text-sm font-medium text-gray-800">{{ $t('superadmin.roadmap.form.published') }}</span>
                <span class="block text-xs text-gray-500">{{ $t('superadmin.roadmap.form.publishedHint') }}</span>
            </span>
        </label>

        <div class="flex justify-end gap-x-2 pb-6">
            <FormButton type="button" buttonStyle="cancel" @click="emit('close')">{{ $t('cancel') }}</FormButton>
            <FormButton type="submit" buttonStyle="primary">{{ $t('save') }}</FormButton>
        </div>
    </form>
</template>

<script setup lang="ts">
import ClassicEditor from '@/utils/editor'
import { useVuelidate } from '@vuelidate/core'
import { required, maxLength, helpers } from '@vuelidate/validators'
import { useI18n } from 'vue-i18n'
import type { PropType } from 'vue'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    selectedItem: {
        type: Object,
        required: false,
        default: null,
    },
    industries: {
        type: Array as PropType<any[]>,
        required: false,
        default: () => [],
    },
})
const emit = defineEmits(['submitForm', 'close'])
const { t, locale } = useI18n()

const statuses = ['planned', 'in_progress', 'released']

const editor = ref(ClassicEditor)
const editorConfig = ref({
    toolbar: ['undo', 'redo', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList'],
}) as any

const state = reactive({
    form: emptyForm(),
})

function emptyForm() {
    return {
        title: '',
        description: '',
        status: 'planned',
        expected_period: '',
        is_published: false,
        industry_uuids: [] as string[],
    }
}

function syncFromProps(item: any) {
    state.form = item
        ? {
            title: item.title ?? '',
            description: item.description ?? '',
            status: item.status ?? 'planned',
            expected_period: item.expected_period ?? '',
            is_published: !!item.is_published,
            industry_uuids: (item.industries ?? []).map((industry: any) => industry.uuid),
        }
        : emptyForm()
}

onMounted(() => syncFromProps(props.selectedItem))
watch(() => props.selectedItem, (item) => syncFromProps(item))

function industryName(industry: any): string {
    return (locale.value === 'dk' ? industry.dk_name : industry.en_name) || industry.en_name || industry.dk_name
}

const rules = computed(() => ({
    form: {
        title: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            maxLength: maxLength(255),
        },
    },
}))

const v$ = useVuelidate(rules, state)

async function submitForm() {
    if (!(await v$.value.$validate())) return
    emit('submitForm', { ...state.form })
}
</script>
