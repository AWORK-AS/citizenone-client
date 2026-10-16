<template>
    <!-- A goal's type (the company's own list) and its VUM theme. The theme is
         one pick: it is listed under its VUM category, which comes with it. -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="space-y-1">
            <FormLabel for="goal_type_uuid" :label="$t('goalTypes.single')" />
            <FormSelect id="goal_type_uuid" :options="typeOptions" :placeholder="$t('goalTypes.typeHint')"
                :modelValue="props.goalTypeUuid ?? null"
                @update:modelValue="(value: any) => emit('update:goalTypeUuid', value || null)" />
            <p v-if="state.typesLoaded && !typeOptions.length" class="text-xs text-gray-500">
                {{ $t('goalTypes.noTypes') }}
            </p>
            <FormError :error="props.error?.errors?.goal_type_uuid?.[0]" />
        </div>
        <div class="space-y-1">
            <FormLabel for="focus_area_uuid" :label="$t('goalTypes.vumTheme')" />
            <Multiselect id="focus_area_uuid" :groups="true" :searchable="true" :close-on-select="true"
                :options="themeGroups" :placeholder="$t('goalTypes.vumThemeHint')"
                :no-options-text="$t('theListIsEmpty')" :noResultsText="$t('noResultFound')"
                :modelValue="props.focusAreaUuid ?? null"
                @update:modelValue="(value: any) => emit('update:focusAreaUuid', value || null)" />
            <FormError :error="props.error?.errors?.focus_area_uuid?.[0]" />
        </div>
    </div>
</template>

<script setup lang="ts">
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import { goalTypeService } from '@/components/api/user/GoalTypeService'
import { focusAreaService } from '@/components/api/user/FocusAreaService'

const props = defineProps({
    goalTypeUuid: {
        type: String,
        required: false,
        default: null,
    },
    focusAreaUuid: {
        type: String,
        required: false,
        default: null,
    },
    error: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['update:goalTypeUuid', 'update:focusAreaUuid'])

const state = reactive({
    types: [] as any[],
    themes: [] as any[],
    typesLoaded: false,
})

// Active types, plus the one already chosen even if it has since been
// switched off, so editing an older goal does not lose it.
const typeOptions = computed(() => state.types
    .filter((type: any) => type.is_active || type.uuid === props.goalTypeUuid)
    .map((type: any) => ({ value: type.uuid, label: type.name })))

const themeGroups = computed(() => {
    const groups: { label: string, options: { value: string, label: string }[] }[] = []
    for (const theme of state.themes) {
        let group = groups.find((candidate) => candidate.label === theme.group)
        if (!group) {
            group = { label: theme.group, options: [] }
            groups.push(group)
        }
        group.options.push({ value: theme.uuid, label: theme.name ?? theme.label })
    }
    return groups
})

onMounted(async () => {
    const [types, themes] = await Promise.allSettled([goalTypeService.getTypes(), focusAreaService.getVumThemes()])
    state.types = types.status === 'fulfilled' ? (types.value?.data ?? []) : []
    state.themes = themes.status === 'fulfilled' ? (themes.value?.data ?? []) : []
    state.typesLoaded = true
})
</script>
