<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.clientRoles.pageTitle') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.clientRoles.headerTitle') }}</template>

            <div class="p-1">
                <!-- Header -->
                <div class="flex items-center justify-between mb-5">
                    <div>
                        <h1 class="text-[22px] font-semibold text-[#1F2533]">
                            {{ $t('superadmin.clientRoles.pageTitle') }}
                        </h1>
                        <p class="text-sm text-[#5C6478] mt-0.5">
                            {{ $t('superadmin.clientRoles.pageSubtitle') }}
                        </p>
                    </div>
                    <div class="flex items-center gap-2">
                        <!-- View as -->
                        <div class="flex items-center bg-white border border-[#EAECF0] rounded-lg p-0.5">
                            <button
                                class="px-2 py-1.5 rounded-md text-[11px] font-semibold text-[#8891A4] flex items-center gap-1 select-none cursor-default">
                                <Icon name="ph:eye" class="w-3.5 h-3.5" />
                                {{ $t('superadmin.clientRoles.viewAs') }}
                            </button>
                            <button v-for="role in roles" :key="role.key"
                                @click="viewAs = viewAs === role.key ? null : role.key"
                                class="px-3 py-1.5 rounded-md text-[12px] font-semibold transition-colors" :style="viewAs === role.key
                                    ? `background:${role.color};color:white`
                                    : 'color:#5C6478'">
                                {{ role.name }}
                            </button>
                        </div>
                        <!-- Edit button -->
                        <button @click="saveOrEdit"
                            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border"
                            :style="editMode
                                ? 'background:#205E77;color:white;border-color:#205E77'
                                : 'background:white;color:#5C6478;border-color:#EAECF0'">
                            <Icon :name="editMode ? 'ph:check' : 'ph:pencil-simple'" class="w-4 h-4" />
                            {{
                                editMode ?
                                    $t('superadmin.clientRoles.saveChanges') :
                                    $t('superadmin.clientRoles.edit')
                            }}
                        </button>
                    </div>
                </div>

                <!-- GDPR banner -->
                <div
                    class="flex items-start gap-3 px-4 py-3.5 bg-[#EEF4FB] border border-[#42AED9]/20 rounded-xl mb-6 text-[13px] text-[#205E77]">
                    <Icon name="ph:shield-check" class="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>
                        <span class="font-semibold">
                            {{ $t('superadmin.clientRoles.gdprNoteLabel') }}
                        </span>
                        {{ $t('superadmin.clientRoles.gdprNoteText') }}
                    </p>
                </div>

                <!-- Role cards -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
                    <div v-for="role in roles" :key="role.key"
                        class="bg-white border border-[#EAECF0] rounded-2xl overflow-hidden shadow-sm">

                        <!-- Top stripe -->
                        <div class="h-1" :style="`background:${role.color}`"></div>

                        <!-- Header -->
                        <div class="px-5 pt-5 pb-4 border-b border-[#F5F6F8]">
                            <div class="flex items-start justify-between mb-3">
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                        :style="`background:${role.color}18;color:${role.color}`">
                                        <Icon :name="role.icon" class="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div class="flex items-center gap-2">
                                            <h3 class="text-[15px] font-bold text-[#1F2533]">
                                                {{ role.name }}
                                            </h3>
                                            <span v-if="role.fixed"
                                                class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F6F8] text-[#8891A4]">
                                                {{ $t('superadmin.clientRoles.fixed') }}
                                            </span>
                                            <span v-if="role.gdpr"
                                                class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EEF4FB] text-[#205E77]">
                                                GDPR
                                            </span>
                                        </div>
                                        <p class="text-[11px] text-[#8891A4] mt-0.5">
                                            {{
                                                $t('superadmin.clientRoles.ofPermissions', {
                                                    count: role.permissions.filter(p => p.enabled).length,
                                                    total: role.permissions.length
                                                })
                                            }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <p class="text-[12px] text-[#5C6478] leading-relaxed">
                                {{ role.description }}
                            </p>
                        </div>

                        <!-- Permissions list -->
                        <div class="px-5 py-4">
                            <ul class="space-y-2">
                                <li v-for="perm in role.permissions" :key="perm.key"
                                    class="flex items-center justify-between text-[12px]">
                                    <span class="flex items-center gap-1.5 text-[#5C6478]">
                                        <Icon :name="perm.icon" class="w-3.5 h-3.5 flex-shrink-0 text-[#8891A4]" />
                                        {{ perm.label }}
                                        <span v-if="perm.gdpr"
                                            class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#EEF4FB] text-[#205E77]">
                                            GDPR
                                        </span>
                                    </span>
                                    <!-- Edit mode: toggle -->
                                    <button v-if="editMode && !role.fixed && !perm.locked"
                                        @click="togglePerm(role.key, perm.key)"
                                        class="w-5 h-5 rounded flex items-center justify-center transition-colors flex-shrink-0"
                                        :style="perm.enabled
                                            ? `background:${role.color}20;color:${role.color}`
                                            : 'background:#F5F6F8;color:#D5D9E2'">
                                        <Icon :name="perm.enabled ? 'ph:check-bold' : 'ph:minus'" class="w-3 h-3" />
                                    </button>
                                    <!-- Read mode: check/dash -->
                                    <span v-else class="flex-shrink-0"
                                        :style="perm.enabled ? `color:${role.color}` : 'color:#D5D9E2'">
                                        <Icon v-if="perm.enabled" name="ph:check-bold" class="w-3.5 h-3.5" />
                                        <Icon v-else-if="perm.locked" name="ph:lock-simple"
                                            class="w-3.5 h-3.5 text-[#D5D9E2]" />
                                        <span v-else class="inline-block w-6 h-px bg-[#D5D9E2]"></span>
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Permission matrix -->
                <div class="bg-white border border-[#EAECF0] rounded-2xl shadow-sm overflow-hidden">
                    <div class="px-6 py-4 border-b border-[#EAECF0]">
                        <h2 class="text-[15px] font-semibold text-[#1F2533]">
                            {{ $t('superadmin.clientRoles.matrixTitle') }}
                        </h2>
                        <p class="text-[12px] text-[#8891A4] mt-0.5">
                            {{ $t('superadmin.clientRoles.matrixSubtitle') }}
                        </p>
                    </div>
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-[#EAECF0]" style="background:#1A3D52">
                                <th
                                    class="text-left px-6 py-3 text-[11px] font-semibold text-white/70 uppercase tracking-[0.08em]">
                                    {{ $t('superadmin.clientRoles.colFunction') }}
                                </th>
                                <th v-for="role in roles" :key="role.key"
                                    class="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-[0.08em]"
                                    :style="`color:${role.color}`">
                                    {{ role.name.toUpperCase() }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="group in permissionGroups" :key="group.key">
                                <!-- Group header -->
                                <tr class="bg-[#F9FAFB] border-b border-[#EAECF0]">
                                    <td colspan="4" class="px-6 py-2">
                                        <span class="text-[10px] font-bold text-[#8891A4] uppercase tracking-[0.1em]">
                                            {{ group.label }}
                                        </span>
                                    </td>
                                </tr>
                                <!-- Permission rows -->
                                <tr v-for="perm in group.permissions" :key="perm.key"
                                    class="border-b border-[#F5F6F8] hover:bg-[#FAFBFC] transition-colors">
                                    <td class="px-6 py-3">
                                        <span class="flex items-center gap-2 text-[13px] text-[#5C6478]">
                                            <Icon :name="perm.icon" class="w-3.5 h-3.5 text-[#8891A4] flex-shrink-0" />
                                            {{ perm.label }}
                                            <span v-if="perm.gdpr"
                                                class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#EEF4FB] text-[#205E77]">GDPR</span>
                                        </span>
                                    </td>
                                    <td v-for="role in roles" :key="role.key" class="px-6 py-3">
                                        <span v-if="getRolePerm(role.key, perm.key)" :style="`color:${role.color}`">
                                            <Icon name="ph:check-bold" class="w-4 h-4" />
                                        </span>
                                        <span v-else-if="perm.gdpr && role.key !== 'admin'">
                                            <Icon name="ph:lock-simple" class="w-3.5 h-3.5 text-[#D5D9E2]" />
                                        </span>
                                        <span v-else class="inline-block w-6 h-px bg-[#D5D9E2]"></span>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- ══════════════════════════════════════════
                 VIEW AS — Preview overlay
            ══════════════════════════════════════════ -->
            <Teleport to="body">
                <Transition enter-active-class="transition-all duration-300" enter-from-class="opacity-0 translate-y-4"
                    enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-200"
                    leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-4">
                    <div v-if="viewAs" class="fixed inset-0 z-50 flex flex-col">

                        <!-- Top bar -->
                        <div class="flex items-center gap-3 px-6 py-3 border-b border-white/10 flex-shrink-0"
                            :style="`background:${viewAsRole?.color}`">
                            <Icon name="ph:eye" class="w-5 h-5 text-white/80" />
                            <div class="flex-1">
                                <p class="text-[13px] font-bold text-white">
                                    {{ $t('superadmin.clientRoles.previewTitle', { name: viewAsRole?.name }) }}
                                </p>
                                <p class="text-[11px] text-white/70">
                                    {{ $t('superadmin.clientRoles.previewSubtitle', { name: viewAsRole?.name }) }}
                                </p>
                            </div>
                            <div class="flex items-center gap-2">
                                <button v-for="r in roles" :key="r.key" @click="viewAs = r.key"
                                    class="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors" :style="viewAs === r.key
                                        ? 'background:rgba(255,255,255,0.25);color:white'
                                        : 'background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.7)'">
                                    {{ r.name }}
                                </button>
                                <button @click="viewAs = null"
                                    class="ml-2 w-8 h-8 rounded-lg flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors">
                                    <Icon name="ph:x" class="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </div>

                        <!-- Preview content -->
                        <div class="flex-1 overflow-y-auto bg-[#F5F6F8]">
                            <div class="max-w-[900px] mx-auto px-6 py-8">

                                <!-- What this role CAN do -->
                                <div class="mb-6">
                                    <h2 class="text-[18px] font-bold text-[#1F2533] mb-1">
                                        {{ $t('superadmin.clientRoles.whatCanDo', { name: viewAsRole?.name }) }}
                                    </h2>
                                    <p class="text-[13px] text-[#5C6478]">{{ viewAsRole?.description }}</p>
                                </div>

                                <!-- Permissions grid -->
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                                    <div v-for="group in permissionGroups" :key="group.key"
                                        class="bg-white border border-[#EAECF0] rounded-xl overflow-hidden shadow-sm">
                                        <div class="px-4 py-3 border-b border-[#F5F6F8]">
                                            <p class="text-[11px] font-bold text-[#8891A4] uppercase tracking-[0.08em]">
                                                {{
                                                    group.label
                                                }}
                                            </p>
                                        </div>
                                        <div class="px-4 py-3 space-y-2">
                                            <div v-for="perm in group.permissions" :key="perm.key"
                                                class="flex items-center justify-between text-[13px]">
                                                <span class="flex items-center gap-2"
                                                    :class="hasPermission(perm.key) ? 'text-[#1F2533]' : 'text-[#C0C6D0] line-through'">
                                                    <Icon :name="perm.icon" class="w-3.5 h-3.5 flex-shrink-0" />
                                                    {{ perm.label }}
                                                    <span v-if="perm.gdpr && !hasPermission(perm.key)"
                                                        class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-400 no-underline">
                                                        {{ $t('superadmin.clientRoles.locked') }}
                                                    </span>
                                                </span>
                                                <Icon v-if="hasPermission(perm.key)" name="ph:check-circle-fill"
                                                    class="w-4 h-4 flex-shrink-0"
                                                    :style="`color:${viewAsRole?.color}`" />
                                                <Icon v-else-if="perm.locked || perm.gdpr" name="ph:lock-simple-fill"
                                                    class="w-3.5 h-3.5 flex-shrink-0 text-[#D5D9E2]" />
                                                <span v-else class="inline-block w-4 h-px bg-[#D5D9E2]"></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Simulated menu -->
                                <div>
                                    <h3 class="text-[14px] font-semibold text-[#1F2533] mb-3">
                                        {{ $t('superadmin.clientRoles.visibleMenuItems') }}
                                    </h3>
                                    <div class="flex flex-wrap gap-2">
                                        <div v-for="item in viewAsMenuItems" :key="item.label"
                                            class="flex items-center gap-2 px-3 py-2 bg-white border border-[#EAECF0] rounded-xl text-[13px] font-medium text-[#1F2533] shadow-sm">
                                            <Icon :name="item.icon" class="w-4 h-4"
                                                :style="`color:${viewAsRole?.color}`" />
                                            {{ item.label }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>
            </Teleport>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()

const editMode = ref(false)

// ── Static permission definitions (keys only, labels via i18n) ──
const BASE_PERMISSIONS = [
    // GENERAL
    { key: 'overview', labelKey: 'superadmin.clientRoles.permOverview', icon: 'ph:squares-four', gdpr: false, group: 'generelt' },
    { key: 'use_apps', labelKey: 'superadmin.clientRoles.permUseApps', icon: 'ph:app-window', gdpr: false, group: 'generelt' },
    { key: 'app_settings', labelKey: 'superadmin.clientRoles.permAppSettings', icon: 'ph:gear', gdpr: false, group: 'generelt' },
    // USERS
    { key: 'own_profile', labelKey: 'superadmin.clientRoles.permOwnProfile', icon: 'ph:user', gdpr: false, group: 'brugere' },
    { key: 'user_list', labelKey: 'superadmin.clientRoles.permUserList', icon: 'ph:users', gdpr: false, group: 'brugere' },
    { key: 'personal_data', labelKey: 'superadmin.clientRoles.permPersonalData', icon: 'ph:lock-simple', gdpr: true, group: 'brugere' },
    { key: 'manage_users', labelKey: 'superadmin.clientRoles.permManageUsers', icon: 'ph:lock-simple', gdpr: true, group: 'brugere' },
    { key: 'invite_users', labelKey: 'superadmin.clientRoles.permInviteUsers', icon: 'ph:user-plus', gdpr: false, group: 'brugere' },
    // DATA
    { key: 'own_data', labelKey: 'superadmin.clientRoles.permOwnData', icon: 'ph:file-text', gdpr: false, group: 'data' },
    { key: 'team_data', labelKey: 'superadmin.clientRoles.permTeamData', icon: 'ph:users-three', gdpr: false, group: 'data' },
    { key: 'all_data', labelKey: 'superadmin.clientRoles.permAllData', icon: 'ph:lock-simple', gdpr: true, group: 'data' },
    { key: 'export_data', labelKey: 'superadmin.clientRoles.permExportData', icon: 'ph:lock-simple', gdpr: true, group: 'data' },
    // REPORTS
    { key: 'own_reports', labelKey: 'superadmin.clientRoles.permOwnReports', icon: 'ph:chart-bar', gdpr: false, group: 'rapporter' },
    { key: 'all_reports', labelKey: 'superadmin.clientRoles.permAllReports', icon: 'ph:chart-line', gdpr: false, group: 'rapporter' },
    // ADMINISTRATION
    { key: 'billing', labelKey: 'superadmin.clientRoles.permBilling', icon: 'ph:credit-card', gdpr: false, group: 'administration' },
    { key: 'manage_roles', labelKey: 'superadmin.clientRoles.permManageRoles', icon: 'ph:shield-check', gdpr: false, group: 'administration' },
    { key: 'access_log', labelKey: 'superadmin.clientRoles.permAccessLog', icon: 'ph:list-bullets', gdpr: true, group: 'administration' },
]

const BUSINESS_ENABLED = new Set(['overview', 'use_apps', 'app_settings', 'own_profile', 'user_list', 'invite_users', 'own_data', 'team_data', 'own_reports', 'all_reports'])
const END_USER_ENABLED = new Set(['overview', 'use_apps', 'app_settings', 'own_profile', 'own_data', 'own_reports'])

// ── Mutable permission state (enabled toggles) ──
const rolePermState = reactive<Record<string, Record<string, boolean>>>({
    admin: Object.fromEntries(BASE_PERMISSIONS.map(p => [p.key, true])),
    business: Object.fromEntries(BASE_PERMISSIONS.map(p => [p.key, !p.gdpr && BUSINESS_ENABLED.has(p.key)])),
    end_user: Object.fromEntries(BASE_PERMISSIONS.map(p => [p.key, !p.gdpr && END_USER_ENABLED.has(p.key)])),
})

function togglePerm(roleKey: string, permKey: string) {
    if (rolePermState[roleKey]) {
        rolePermState[roleKey][permKey] = !rolePermState[roleKey][permKey]
    }
}

function saveOrEdit() {
    editMode.value = !editMode.value
}

// ── Static role configs ──
const ROLE_CONFIGS = [
    {
        key: 'admin',
        nameKey: 'superadmin.clientRoles.roleAdminName',
        descKey: 'superadmin.clientRoles.roleAdminDescription',
        icon: 'ph:shield-star',
        color: '#205E77',
        fixed: true,
        gdpr: false,
    },
    {
        key: 'business',
        nameKey: 'superadmin.clientRoles.roleBusinessName',
        descKey: 'superadmin.clientRoles.roleBusinessDescription',
        icon: 'ph:briefcase',
        color: '#42AED9',
        fixed: false,
        gdpr: true,
    },
    {
        key: 'end_user',
        nameKey: 'superadmin.clientRoles.roleEndUserName',
        descKey: 'superadmin.clientRoles.roleEndUserDescription',
        icon: 'ph:user-circle',
        color: '#2E9E33',
        fixed: false,
        gdpr: true,
    },
]

// ── Computed locale-reactive roles ──
const roles = computed(() =>
    ROLE_CONFIGS.map(cfg => ({
        ...cfg,
        name: t(cfg.nameKey),
        description: t(cfg.descKey),
        permissions: BASE_PERMISSIONS.map(p => ({
            ...p,
            label: t(p.labelKey),
            enabled: rolePermState[cfg.key]?.[p.key] ?? false,
            locked: cfg.key !== 'admin' && p.gdpr,
        })),
    }))
)

// ── Computed permission groups with translated labels ──
const GROUP_CONFIGS = [
    { key: 'generelt', labelKey: 'superadmin.clientRoles.groupGeneral' },
    { key: 'brugere', labelKey: 'superadmin.clientRoles.groupUsers' },
    { key: 'data', labelKey: 'superadmin.clientRoles.groupData' },
    { key: 'rapporter', labelKey: 'superadmin.clientRoles.groupReports' },
    { key: 'administration', labelKey: 'superadmin.clientRoles.groupAdmin' },
]

const permissionGroups = computed(() =>
    GROUP_CONFIGS.map(g => ({
        key: g.key,
        label: t(g.labelKey),
        permissions: BASE_PERMISSIONS.filter(p => p.group === g.key).map(p => ({
            ...p,
            label: t(p.labelKey),
        })),
    }))
)

function getRolePerm(roleKey: string, permKey: string): boolean {
    return rolePermState[roleKey]?.[permKey] ?? false
}

// ── View As ──
const viewAs = ref<string | null>(null)

const viewAsRole = computed(() =>
    viewAs.value ? roles.value.find(r => r.key === viewAs.value) ?? null : null
)

function hasPermission(permKey: string): boolean {
    if (!viewAs.value) return false
    return rolePermState[viewAs.value]?.[permKey] ?? false
}

// ── Menu items (locale-reactive) ──
const allMenuItems = computed(() => [
    { label: t('superadmin.clientRoles.menuDashboard'), icon: 'ph:squares-four', perm: 'overview' },
    { label: t('superadmin.clientRoles.menuCitizens'), icon: 'ph:users', perm: 'user_list' },
    { label: t('superadmin.clientRoles.menuJournal'), icon: 'ph:notebook', perm: 'own_data' },
    { label: t('superadmin.clientRoles.menuCalendar'), icon: 'ph:calendar', perm: 'overview' },
    { label: t('superadmin.clientRoles.menuChat'), icon: 'ph:chat-circle', perm: 'overview' },
    { label: t('superadmin.clientRoles.menuReports'), icon: 'ph:chart-bar', perm: 'own_reports' },
    { label: t('superadmin.clientRoles.menuAllReports'), icon: 'ph:chart-line', perm: 'all_reports' },
    { label: t('superadmin.clientRoles.menuUsers'), icon: 'ph:user-list', perm: 'user_list' },
    { label: t('superadmin.clientRoles.menuSettings'), icon: 'ph:gear', perm: 'app_settings' },
    { label: t('superadmin.clientRoles.menuBilling'), icon: 'ph:credit-card', perm: 'billing' },
    { label: t('superadmin.clientRoles.menuApps'), icon: 'ph:app-window', perm: 'use_apps' },
    { label: t('superadmin.clientRoles.menuAccessRoles'), icon: 'ph:shield-check', perm: 'manage_roles' },
    { label: t('superadmin.clientRoles.menuAccessLog'), icon: 'ph:list-bullets', perm: 'access_log' },
])

const viewAsMenuItems = computed(() =>
    allMenuItems.value.filter(item => hasPermission(item.perm))
)
</script>

<style scoped></style>
