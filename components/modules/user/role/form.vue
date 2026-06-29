<template>
    <form @submit.prevent="submitForm()" class="mt-6 pb-16 max-w-4xl">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />

        <div class="space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                <div class="space-y-1">
                    <FormLabel for="name" :label="$t('roles.form.name')" />
                    <FormTextField id="name" name="name" :placeholder="$t('roles.form.name')"
                        :disabled="state.formRole?.is_name_editable === false" v-model="state.formRole.name"
                        :style="state.formRole?.predefined ? 'pointer-events: none; opacity: 0.6; cursor: not-allowed;' : ''" />
                    <FormError :error="v$?.formRole?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.name?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="level" :label="$t('roles.form.level')" />
                    <FormSelect id="level" name="level" :options="levelOptions" v-model="state.formRole.level"
                        :disabled="state.formRole?.predefined" />
                    <FormError :error="props?.error?.errors?.level?.[0]" />
                </div>
            </div>

            <!-- Permissions: grouped by area so a role is built area-by-area instead of from one long flat list -->
            <div class="space-y-2">
                <div class="flex items-center justify-between flex-wrap gap-2">
                    <FormLabel for="permissions" :label="$t('roles.form.permissions')" />
                    <span class="text-xs text-slate-400">{{ state.formRole.permissions.length }} / {{
                        allPermissionUuids.length }}</span>
                </div>
                <div class="flex items-center justify-between flex-wrap gap-2">
                    <div class="relative max-w-xs flex-1 min-w-[12rem]">
                        <Icon name="ph:magnifying-glass"
                            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                            aria-hidden="true" />
                        <input v-model="permSearch" type="text" :placeholder="$t('search') + '…'"
                            class="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm focus:border-primary focus:outline-none" />
                    </div>
                    <div class="flex items-center gap-2 text-xs">
                        <button type="button" @click="selectAllPermissions"
                            class="rounded-lg border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50">
                            {{ $t('roles.form.selectAll') }}
                        </button>
                        <button type="button" @click="clearAllPermissions"
                            class="rounded-lg border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50"
                            :class="state.formRole.permissions.length === 0 ? 'opacity-40 pointer-events-none' : ''">
                            {{ $t('roles.form.clearAll') }}
                        </button>
                    </div>
                </div>

                <FormError :error="v$?.formRole?.permissions?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.permission_uuid?.[0]" />

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div v-for="group in filteredPermissionGroups" :key="group.key"
                        class="rounded-xl border border-slate-200 p-4">
                        <label class="flex items-center justify-between gap-2 mb-3 cursor-pointer">
                            <span class="text-sm font-semibold text-slate-800">{{ group.label }}</span>
                            <span class="flex items-center gap-2">
                                <span class="text-[11px] text-slate-400">{{ group.selectedCount }}/{{ group.items.length
                                    }}</span>
                                <input type="checkbox"
                                    class="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                                    :checked="group.allSelected" v-indeterminate="group.someSelected"
                                    @change="toggleGroup(group, ($event.target as HTMLInputElement).checked)" />
                            </span>
                        </label>
                        <div class="space-y-1.5">
                            <label v-for="perm in group.items" :key="perm.uuid"
                                class="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer rounded-md px-1.5 py-1 hover:bg-slate-50">
                                <input type="checkbox"
                                    class="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                                    :value="perm.uuid" v-model="state.formRole.permissions" />
                                {{ perm.label }}
                            </label>
                        </div>
                    </div>
                </div>
                <p v-if="permSearch && filteredPermissionGroups.length === 0" class="text-sm text-slate-400">
                    {{ $t('roles.form.noPermissionsMatch', { search: permSearch }) }}
                </p>
            </div>

            <!-- Page access: which sidebar pages this role can open -->
            <div class="space-y-2">
                <FormLabel for="pages" :label="$t('roles.form.pages')" />
                <div class="rounded-xl border border-slate-200 p-4">
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1.5">
                        <label v-for="page in pageOptions" :key="page.value"
                            class="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer rounded-md px-1.5 py-1 hover:bg-slate-50">
                            <input type="checkbox"
                                class="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                                :value="page.value" v-model="state.formRole.page_uuid" />
                            {{ page.label }}
                        </label>
                    </div>
                </div>
                <FormError :error="props?.error?.errors?.page_uuid?.[0]" />
            </div>
        </div>

        <div class="mt-6 max-w-xl">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="navigateTo('/settings/roles')">
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
import { permissionService } from '@/components/api/user/PermissionService'
import { pageService } from '@/components/api/user/PageService'
import { getPermissionLabel } from '@/composables/usePermissions'
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
    selectedRole: {
        type: Object,
        required: false,
    },
})

const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t, locale } = useI18n()

// Native checkboxes can't express "some but not all" via a prop — set the
// DOM indeterminate flag directly.
const vIndeterminate = {
    mounted(el: HTMLInputElement, binding: any) { el.indeterminate = !!binding.value },
    updated(el: HTMLInputElement, binding: any) { el.indeterminate = !!binding.value },
}

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formRole: {
        name: '',
        predefined: false,
        permissions: [] as any[],
        page_uuid: [] as any[],
        is_name_editable: true,
        level: '20',
    },
    permissions: [] as any[],
    pages: [] as any[],
})

const permSearch = ref('')

const levelOptions = computed(() => [
    { value: '20', label: t('roles.table.regular') },
    { value: '50', label: t('roles.table.manager') },
])

const isInitializing = ref(true)

onMounted(() => {
    fetchAllPages()
    if (props.formType === 'create') {
        fetchAllPermissions()
    }
    nextTick(() => { isInitializing.value = false })
})

watch(() => props.selectedRole, (newValue: any) => {
    if (newValue != null) {
        isInitializing.value = true
        state.formRole = {
            name: newValue.name,
            predefined: newValue.predefined || false,
            permissions: newValue.permissions || [],
            page_uuid: Array.isArray(newValue.pages) ? newValue.pages.map((p: any) => p.uuid) : [],
            is_name_editable: newValue.is_name_editable || false,
            level: String(newValue.level ?? 20),
        }
        fetchAllPermissions()
        nextTick(() => { isInitializing.value = false })
    }
})

watch(() => state.formRole.level, () => {
    if (isInitializing.value) return
    fetchAllPermissions()
})

const rules = computed(() => {
    return {
        formRole: {
            name: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

async function fetchAllPermissions() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {
            level: state.formRole.level,
        }
        const response = await permissionService.getAllPermissions(params)
        if (response?.data) {
            state.permissions = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchAllPages() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await pageService.getAllPages()
        if (response?.data) {
            state.pages = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

const pageOptions = computed(() => {
    return state.pages
        .map((page: any) => ({ value: page.uuid, label: page.name }))
        .sort((a: any, b: any) => a.label.localeCompare(b.label))
})

// --- Permission grouping -------------------------------------------------
const groupOrder = ['citizen', 'journal', 'health', 'plan', 'calendar', 'economy', 'contact', 'reports', 'other']
const groupLabels: Record<string, Record<string, string>> = {
    citizen: { dk: 'Borger', en: 'Citizen', no: 'Borger', sv: 'Medborgare' },
    journal: { dk: 'Journal & dokumenter', en: 'Journals & documents', no: 'Journal & dokumenter', sv: 'Journal & dokument' },
    health: { dk: 'Helbred & medicin', en: 'Health & medicine', no: 'Helse & medisin', sv: 'Hälsa & medicin' },
    plan: { dk: 'Planer & mål', en: 'Plans & goals', no: 'Planer & mål', sv: 'Planer & mål' },
    calendar: { dk: 'Kalender & vagtplan', en: 'Calendar & scheduling', no: 'Kalender & vaktplan', sv: 'Kalender & schema' },
    economy: { dk: 'Økonomi', en: 'Economy', no: 'Økonomi', sv: 'Ekonomi' },
    contact: { dk: 'Kontakter & pårørende', en: 'Contacts & relatives', no: 'Kontakter & pårørende', sv: 'Kontakter & anhöriga' },
    reports: { dk: 'Henvisninger & rapporter', en: 'Referrals & reports', no: 'Henvisninger & rapporter', sv: 'Hänvisningar & rapporter' },
    other: { dk: 'Andet', en: 'Other', no: 'Annet', sv: 'Övrigt' },
}
const citizenLevel = new Set(['create_citizen', 'update_citizen', 'link_citizen', 'manage_citizen_period', 'manage_employer_info'])

function permGroup(name: string): string {
    if (/citizen_journal|citizen_document/.test(name)) return 'journal'
    if (/citizen_health|citizen_medicine/.test(name)) return 'health'
    if (/citizen_plan/.test(name)) return 'plan'
    if (/citizen_calendar|schedule/.test(name) || name === 'delete_calendar') return 'calendar'
    if (/citizen_economy/.test(name)) return 'economy'
    if (/citizen_contact|citizen_children/.test(name)) return 'contact'
    if (/referral|report/.test(name)) return 'reports'
    if (citizenLevel.has(name)) return 'citizen'
    return 'other'
}
function groupLabel(key: string): string {
    const byLocale = groupLabels[key] || {}
    return byLocale[locale.value] || byLocale.en || key
}

const allPermissionUuids = computed(() => state.permissions.map((p: any) => p.uuid))

const filteredPermissionGroups = computed(() => {
    const q = permSearch.value.trim().toLowerCase()
    const decorated = state.permissions.map((p: any) => ({
        uuid: p.uuid,
        label: getPermissionLabel(p, locale.value),
        group: permGroup(p.name || ''),
    }))
    return groupOrder
        .map((key) => {
            const items = decorated
                .filter((p) => p.group === key)
                .filter((p) => !q || p.label.toLowerCase().includes(q))
            const selectedCount = items.filter((p) => state.formRole.permissions.includes(p.uuid)).length
            return {
                key,
                label: groupLabel(key),
                items,
                selectedCount,
                allSelected: items.length > 0 && selectedCount === items.length,
                someSelected: selectedCount > 0 && selectedCount < items.length,
            }
        })
        .filter((group) => group.items.length > 0)
})

function selectAllPermissions() {
    state.formRole.permissions = [...allPermissionUuids.value]
}
function clearAllPermissions() {
    state.formRole.permissions = []
}

function toggleGroup(group: any, checked: boolean) {
    const ids = group.items.map((p: any) => p.uuid)
    const current = new Set(state.formRole.permissions)
    if (checked) {
        ids.forEach((id: string) => current.add(id))
    } else {
        ids.forEach((id: string) => current.delete(id))
    }
    state.formRole.permissions = [...current]
}

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', { ...state.formRole })
    }
}
</script>
