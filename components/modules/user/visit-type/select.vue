<template>
    <!-- Only where the company keeps visit types, or the indsats asks for one. -->
    <div class="space-y-1" v-if="state.types.length || state.restricts">
        <FormLabel for="visit_type_uuid" :label="$t('visitTypes.single')" />
        <FormSelect id="visit_type_uuid" :options="options" :modelValue="props.modelValue"
            @update:modelValue="(value: any) => emit('update:modelValue', value || null)" />
        <p v-if="state.restricts" class="text-[11px] text-slate-500">
            {{ $t('visitTypes.restrictedHint') }}
        </p>
        <FormError :error="props.error" />
    </div>
</template>

<script setup lang="ts">
import { registrationRuleService } from '@/components/api/user/RegistrationRuleService'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
    // The indsats the time is registered on. Without one, every active type.
    citizenUuid: {
        type: String,
        required: false,
        default: null,
    },
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

const state = reactive({
    types: [] as any[],
    restricts: false,
})

const options = computed(() => [
    ...(state.restricts ? [] : [{ value: null, label: t('visitTypes.none') }]),
    ...state.types.map((type: any) => ({ value: type.uuid, label: type.name })),
])

async function load() {
    try {
        if (props.citizenUuid) {
            const response = await registrationRuleService.getRules('citizen', props.citizenUuid)
            state.types = response?.data?.allowed_visit_types ?? []
            state.restricts = !!response?.data?.restricts_visit_types
        } else {
            const response = await registrationRuleService.getVisitTypes(true)
            state.types = response?.data ?? []
            state.restricts = false
        }
    } catch (_) {
        state.types = []
        state.restricts = false
    }

    // A type the indsats no longer allows is cleared rather than sent and refused.
    if (props.modelValue && !state.types.some((type: any) => type.uuid === props.modelValue)) {
        emit('update:modelValue', null)
    }
}

onMounted(load)
watch(() => props.citizenUuid, load)
</script>
