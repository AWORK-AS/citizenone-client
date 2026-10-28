<template>
    <!-- Search first, then pick. Pinned and recently used citizens are on top so
         the usual ones are one click away, and typing finds anyone in a long list.
         Logic in utils/citizenPicker.ts. -->
    <div class="space-y-2">
        <ul v-if="selectedOptions.length" class="flex flex-wrap gap-2">
            <li v-for="option in selectedOptions" :key="option.value"
                class="inline-flex items-center gap-2 rounded-full bg-primary/5 py-1 pl-1 pr-2 ring-1 ring-primary/20">
                <span class="flex size-6 items-center justify-center rounded-full bg-primary text-xxs font-semibold text-white">
                    {{ initials(option.label) }}
                </span>
                <span class="text-sm font-medium text-slate-900">{{ option.label }}</span>
                <button type="button" @click="remove(option.value)" :aria-label="$t('citizenPicker.remove', { name: option.label })"
                    class="rounded-full p-0.5 text-slate-400 hover:bg-white hover:text-slate-700">
                    <Icon name="ph:x" class="size-3.5" aria-hidden="true" />
                </button>
            </li>
            <li v-if="!searching">
                <button type="button" @click="startSearch"
                    class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium text-primary hover:bg-primary/5">
                    <Icon name="ph:plus" class="size-3.5" aria-hidden="true" />
                    {{ $t('citizenPicker.addMore') }}
                </button>
            </li>
        </ul>

        <div v-if="searching" class="rounded-lg ring-1 ring-gray-200 focus-within:ring-primary-700">
            <div class="relative">
                <Icon name="ph:magnifying-glass" class="pointer-events-none absolute left-3 top-3 size-4 text-gray-400" aria-hidden="true" />
                <input ref="inputRef" v-model="query" type="search" :id="id" autocomplete="off"
                    role="combobox" :aria-expanded="true" :aria-controls="`${id}-list`"
                    :aria-activedescendant="flat[active] ? `${id}-opt-${flat[active].value}` : undefined"
                    :placeholder="$t('citizenPicker.search')"
                    @keydown.down.prevent="move(1)" @keydown.up.prevent="move(-1)"
                    @keydown.enter.prevent="flat[active] && pick(flat[active].value)"
                    @keydown.esc.stop.prevent="selectedOptions.length && (searching = false)"
                    class="block w-full rounded-t-lg border-0 py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0" />
            </div>
            <!-- Department chips only where there is more than one to choose from. -->
            <div v-if="departments.length > 1" class="flex flex-wrap items-center gap-1.5 border-t border-gray-100 px-3 py-2">
                <button v-for="chip in [{ uuid: null, name: $t('citizenPicker.allDepartments') }, ...departments]"
                    :key="chip.uuid ?? 'all'" type="button" @mousedown.prevent="department = chip.uuid"
                    :aria-pressed="department === chip.uuid"
                    class="rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors"
                    :class="department === chip.uuid ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">
                    {{ chip.name }}
                </button>
                <span v-if="department && query.trim()" class="ml-1 text-xs text-gray-400">{{ $t('citizenPicker.searchesAll') }}</span>
            </div>
            <ul :id="`${id}-list`" role="listbox" class="max-h-64 overflow-y-auto border-t border-gray-100 py-1">
                <template v-for="section in sections" :key="section.key">
                    <li v-if="section.key !== 'matches'" role="presentation"
                        class="px-3 pb-1 pt-2 text-xxs font-semibold uppercase tracking-wide text-gray-400">
                        {{ section.key === 'all' && departmentName ? departmentName : $t(`citizenPicker.sections.${section.key}`) }}
                    </li>
                    <li v-for="option in section.options" :key="option.value" :id="`${id}-opt-${option.value}`"
                        role="option" :aria-selected="flat[active]?.value === option.value"
                        @mousedown.prevent="pick(option.value)" @mousemove="active = flat.indexOf(option)"
                        class="flex cursor-pointer items-center gap-3 px-3 py-2"
                        :class="flat[active]?.value === option.value ? 'bg-primary/5' : ''">
                        <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xxs font-semibold text-slate-600">
                            {{ initials(option.label) }}
                        </span>
                        <span class="min-w-0 flex-1 truncate text-sm text-gray-900">{{ option.label }}</span>
                        <span v-if="departments.length > 1 && option.departments?.length"
                            class="shrink-0 truncate text-xs text-gray-400">
                            {{ option.departments.map(d => d.name).join(', ') }}
                        </span>
                        <Icon v-if="option.pinned" name="ph:star-fill" class="size-3.5 shrink-0 text-amber-400" aria-hidden="true" />
                    </li>
                </template>
                <li v-if="!flat.length" class="px-3 py-3 text-sm text-gray-500">{{ $t('citizenPicker.noResults') }}</li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { useDepartmentStore } from '@/store/department'
import { initials, pickerDepartments, pickerSections, rememberRecent, type PickerOption } from '@/utils/citizenPicker'

const props = defineProps<{ options: PickerOption[], modelValue: string[], id?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string[]): void }>()

const id = props.id ?? 'citizen_picker'
const userStore = useUserStore() as any
const query = ref('')
const active = ref(0)
const searching = ref(!props.modelValue?.length)
const inputRef = ref<HTMLInputElement | null>(null)

// Per user and browser: a convenience, not something that must follow them.
const recentKey = computed(() => `citizenPicker.recent.${userStore.getUser?.uuid ?? 'anon'}`)
function readRecent(): string[] {
    try { return JSON.parse(localStorage.getItem(recentKey.value) ?? '[]') } catch { return [] }
}
const recent = ref<string[]>([])

const selectedOptions = computed(() => (props.modelValue ?? [])
    .map(uuid => props.options.find(o => o.value === uuid))
    .filter((o): o is PickerOption => !!o))
const departments = computed(() => pickerDepartments(props.options))
// Starts on the department picked in the topbar; "Alle afdelinger" there is no filter.
const departmentStore = useDepartmentStore() as any
const department = ref<string | null>(null)
watch(departments, (list) => {
    // The store holds the department object (or '' for all departments).
    const chosen = departmentStore.getSelectedDepartment?.uuid
    department.value = list.some(d => d.uuid === chosen) ? chosen : null
}, { immediate: true })

const departmentName = computed(() => departments.value.find(d => d.uuid === department.value)?.name ?? '')

const sections = computed(() => pickerSections(props.options, query.value, recent.value, props.modelValue ?? [], department.value))
const flat = computed(() => sections.value.flatMap(s => s.options))

watch(query, () => { active.value = 0 })
watch(() => props.modelValue, (value) => { if (!value?.length) searching.value = true })

function move(step: number) {
    if (!flat.value.length) return
    active.value = (active.value + step + flat.value.length) % flat.value.length
}

function pick(uuid: string) {
    emit('update:modelValue', [...(props.modelValue ?? []), uuid])
    recent.value = rememberRecent(recent.value, uuid)
    try { localStorage.setItem(recentKey.value, JSON.stringify(recent.value)) } catch { /* private mode */ }
    query.value = ''
    searching.value = false
}

function remove(uuid: string) {
    emit('update:modelValue', (props.modelValue ?? []).filter(u => u !== uuid))
}

async function startSearch() {
    searching.value = true
    await nextTick()
    inputRef.value?.focus()
}

onMounted(async () => {
    recent.value = readRecent()
    if (searching.value) {
        await nextTick()
        inputRef.value?.focus()
    }
})
</script>
