<template>
    <div class="space-y-2">
        <FormLabel for="template_source" :label="$t('forms.community.chooseFrom')" />
        <div>
            <div class="inline-flex rounded-lg bg-gray-100 p-0.5" id="template_source" role="radiogroup">
                <button type="button" v-for="option in sources" :key="option.value" role="radio"
                    :aria-checked="props.modelValue === option.value"
                    @click="emit('update:modelValue', option.value)" :class="[
                        'rounded-md px-4 py-1.5 text-sm font-medium transition',
                        props.modelValue === option.value
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                    ]">
                    {{ option.label }}
                </button>
            </div>
        </div>
        <p v-if="props.modelValue === 'community'" class="text-xs text-gray-500">
            {{ props.communityCount > 0 ? $t('forms.community.pickerHint') : $t('forms.community.pickerEmpty') }}
        </p>
    </div>
</template>

<script setup lang="ts">
// Where the "Create template" pickers take their forms from: the company's own,
// or templates shared with the CitizenOne community by other organisations.
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
    modelValue: {
        type: String,
        default: 'own',
    },
    communityCount: {
        type: Number,
        default: 0,
    },
})

const emit = defineEmits(['update:modelValue'])

const sources = computed(() => [
    { value: 'own', label: t('forms.community.ourTemplates') },
    { value: 'community', label: t('forms.community.optionLabel') },
])
</script>
