<template>
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-2">
        <label v-for="permission in selectable" :key="permission.name"
            class="flex items-start gap-2 text-sm"
            :class="disabled ? 'text-[#8891A4] cursor-default' : 'text-[#1F2533] cursor-pointer'">
            <input type="checkbox" class="mt-0.5 size-4 rounded border-[#CBD2DD] text-[#205E77]"
                :checked="isChecked(permission.name)" :disabled="disabled"
                @change="toggle(permission.name)" />
            <span>{{ permission.label }}</span>
        </label>
    </div>
</template>

<script setup lang="ts">
/**
 * Hakkene der udgør en rolle.
 *
 * `access_superadmin` er ikke et hak. Den er med i hver rolle, fordi en rolle uden den
 * er en rolle hvis medlemmer ikke kan åbne en enkelt side - og det ser ud som en ødelagt
 * deployment frem for et fravalg. Backenden lægger den på uanset hvad der sendes, så et
 * hak her ville også være et hak man ikke kunne fjerne. Derfor vises den slet ikke.
 */
type Permission = { name: string; label: string; is_required: boolean }

const props = defineProps<{
    modelValue: string[]
    permissions: Permission[]
    disabled: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [string[]] }>()

const selectable = computed(() => props.permissions.filter((permission) => !permission.is_required))

function isChecked(name: string): boolean {
    return props.modelValue.includes(name)
}

function toggle(name: string) {
    if (props.disabled) return

    const next = isChecked(name)
        ? props.modelValue.filter((item) => item !== name)
        : [...props.modelValue, name]

    emit('update:modelValue', next)
}
</script>
