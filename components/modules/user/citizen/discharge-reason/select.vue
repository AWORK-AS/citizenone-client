<template>
    <!-- Only when the company keeps a list of reasons; otherwise the free text
         below is all there is, as before. -->
    <div class="space-y-1" v-if="options.length">
        <FormLabel for="discharge_reason_uuid" :label="$t('dischargeReasons.single')" />
        <FormSelect id="discharge_reason_uuid" :options="options" :modelValue="props.modelValue ?? undefined"
            @update:modelValue="(value: any) => emit('update:modelValue', value || null)" />
        <FormError :error="props.error" />
    </div>
</template>

<script setup lang="ts">
import { dischargeReasonService } from '@/components/api/user/DischargeReasonService'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
    modelValue: {
        type: String,
        required: false,
        default: null,
    },
    error: {
        type: String,
        required: false,
        default: '',
    },
})
const emit = defineEmits(['update:modelValue'])

const reasons = ref<any[]>([])

// Active reasons, plus the one already chosen even if it has since been
// switched off, so opening an old indsats does not lose it.
const options = computed(() => {
    const shown = reasons.value.filter((reason: any) => reason.is_active || reason.uuid === props.modelValue)
    if (!shown.length) return []

    return [{ value: null, label: t('dischargeReasons.none') }, ...shown.map((reason: any) => ({ value: reason.uuid, label: reason.name }))]
})

onMounted(async () => {
    try {
        const response = await dischargeReasonService.getReasons()
        reasons.value = response?.data ?? []
    } catch (_) {
        reasons.value = []
    }
})
</script>
