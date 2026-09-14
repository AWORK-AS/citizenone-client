<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>
                    {{ $t('superadmin.teamRoles.pageTitle') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>
            <template #header>
                {{ $t('superadmin.teamRoles.header') }}
            </template>

            <div class="p-1">
                <div class="flex flex-wrap items-start justify-between gap-3 mb-5">
                    <div>
                        <h1 class="text-[22px] font-semibold text-[#1F2533]">
                            {{ $t('superadmin.teamRoles.header') }}
                        </h1>
                        <p class="text-sm text-[#5C6478] mt-0.5 max-w-2xl">
                            {{ $t('superadmin.teamRoles.subtitle') }}
                        </p>
                    </div>

                    <button v-if="canManage" type="button" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-40" style="background:#205E77" @click="startNewRole">
                        <Icon name="ph:plus" class="size-4" />
                        {{ $t('superadmin.teamRoles.newRole') }}
                    </button>
                </div>

                <Alert type="danger" :text="state.error" v-if="state.error" />

                <div v-if="state.isLoading" class="text-sm text-[#8891A4] py-8 text-center">
                    {{ $t('superadmin.teamRoles.loading') }}
                </div>

                <div v-else class="space-y-4">
                    <!-- Ny rolle. Redigeres i samme form som de andre, så der kun er ét sted
                         hvor et hak betyder noget. -->
                    <div v-if="draft" class="bg-white border border-[#0F4C75]/30 rounded-xl shadow-sm p-5">
                        <div class="flex flex-wrap items-center gap-3 mb-4">
                            <input v-model="draft.name" type="text" class="co-input max-w-xs"
                                :placeholder="$t('superadmin.teamRoles.namePlaceholder')" />
                            <div class="flex gap-2 ml-auto">
                                <button type="button" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-[#5C6478] border border-[#EAECF0] bg-white transition-colors disabled:opacity-40" @click="draft = null">
                                    {{ $t('cancel') }}
                                </button>
                                <button type="button" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-40" style="background:#205E77" :disabled="!draft.name || state.isSaving"
                                    @click="createRole">
                                    {{ $t('save') }}
                                </button>
                            </div>
                        </div>

                        <PermissionGrid v-model="draft.permissions" :permissions="state.permissions" :disabled="false" />
                    </div>

                    <div v-for="role in state.roles" :key="role.id"
                        class="bg-white border border-[#EAECF0] rounded-xl shadow-sm p-5">
                        <div class="flex flex-wrap items-center gap-3 mb-1">
                            <h2 class="text-[15px] font-semibold text-[#1F2533]">{{ role.label }}</h2>

                            <span v-if="role.is_locked" class="co-badge co-badge-navy">
                                {{ $t('superadmin.teamRoles.locked') }}
                            </span>

                            <span class="text-xs text-[#8891A4]">
                                {{ $t('superadmin.teamRoles.members', { count: role.member_count ?? 0 }) }}
                            </span>

                            <div class="flex gap-2 ml-auto" v-if="canManage && !role.is_locked">
                                <button type="button" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-[#5C6478] border border-[#EAECF0] bg-white transition-colors disabled:opacity-40"
                                    :disabled="state.isSaving || !isDirty(role)" @click="resetRole(role)">
                                    {{ $t('cancel') }}
                                </button>
                                <button type="button" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-40" style="background:#205E77"
                                    :disabled="state.isSaving || !isDirty(role)" @click="saveRole(role)">
                                    {{ $t('save') }}
                                </button>
                                <button type="button" class="co-badge co-badge-red disabled:opacity-40"
                                    :disabled="state.isSaving" @click="removeRole(role)">
                                    <Icon name="ph:trash" class="size-4" />
                                </button>
                            </div>
                        </div>

                        <p class="text-xs text-[#8891A4] mb-4" v-if="role.is_locked">
                            {{ $t('superadmin.teamRoles.lockedHint') }}
                        </p>

                        <PermissionGrid v-model="role.permissions" :permissions="state.permissions"
                            :disabled="role.is_locked || !canManage" />
                    </div>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { teamRoleService } from '@/components/api/superadmin/TeamRoleService'
import { usePermissions } from '@/composables/usePermissions'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import PermissionGrid from '@/components/modules/superadmin/team-roles/permission-grid.vue'

/**
 * Hvad hver af vores egne roller må se i panelet.
 *
 * Rollen er en pakke, og den er levende: udvides Salg her, får alle i Salg området med
 * med det samme. Undtagelsen for den enkelte kollega hører ikke her - den sættes på
 * personen under Brugere, fordi det er en beslutning om et menneske og ikke om en rolle.
 *
 * Superadmin står i listen og kan ikke redigeres. At udelade den ville være en løgn:
 * den er den rolle de fleste af os har, og den er svaret på hvad "alt" betyder. At
 * kunne redigere den ville være ét fejlklik fra at lukke holdet ude af sit eget panel.
 */
const runtimeConfig = useRuntimeConfig()
const { can } = usePermissions()
const { successAlert } = useAlert()
const { t } = useI18n()

const canManage = computed(() => can('manage_team'))

type Permission = { name: string; label: string; is_required: boolean }
type TeamRole = {
    id: number
    name: string
    label: string
    is_locked: boolean
    member_count: number | null
    permissions: string[]
}

const state = reactive({
    isLoading: true,
    isSaving: false,
    error: '',
    roles: [] as TeamRole[],
    permissions: [] as Permission[],
})

const draft = ref<{ name: string; permissions: string[] } | null>(null)

// Det gemte billede, så knapperne kan være slukkede indtil noget faktisk er ændret.
const saved = ref<Record<number, string[]>>({})

onMounted(() => load())

async function load() {
    state.isLoading = true
    state.error = ''

    try {
        const [roles, permissions] = await Promise.all([
            teamRoleService.getRoles(),
            teamRoleService.getPermissions(),
        ])

        state.roles = (roles?.data ?? []).map((role: any) => ({
            ...role,
            permissions: [...(role.permissions ?? [])],
        }))
        state.permissions = permissions?.data ?? []
        saved.value = Object.fromEntries(state.roles.map((role) => [role.id, [...role.permissions]]))
    } catch (error: any) {
        state.error = error?.message ?? error
    } finally {
        state.isLoading = false
    }
}

function isDirty(role: TeamRole): boolean {
    const before = saved.value[role.id] ?? []

    return before.length !== role.permissions.length
        || before.some((name) => !role.permissions.includes(name))
}

function resetRole(role: TeamRole) {
    role.permissions = [...(saved.value[role.id] ?? [])]
}

function startNewRole() {
    // Adgangen til panelet er med fra starten. En rolle uden den er en rolle hvis
    // medlemmer ikke kan åbne en enkelt side, og det ser ud som en ødelagt deployment.
    draft.value = { name: '', permissions: ['access_superadmin'] }
}

async function createRole() {
    if (!draft.value) return

    state.isSaving = true
    state.error = ''

    try {
        await teamRoleService.saveRole(draft.value)
        draft.value = null
        await load()
        successAlert(`${t('alert.success')}!`, t('superadmin.teamRoles.saved'))
    } catch (error: any) {
        state.error = error?.message ?? error
    } finally {
        state.isSaving = false
    }
}

async function saveRole(role: TeamRole) {
    state.isSaving = true
    state.error = ''

    try {
        await teamRoleService.updateRole(role.id, { permissions: role.permissions })
        saved.value[role.id] = [...role.permissions]
        successAlert(`${t('alert.success')}!`, t('superadmin.teamRoles.saved'))
    } catch (error: any) {
        state.error = error?.message ?? error
    } finally {
        state.isSaving = false
    }
}

async function removeRole(role: TeamRole) {
    state.isSaving = true
    state.error = ''

    try {
        await teamRoleService.deleteRole(role.id)
        await load()
        successAlert(`${t('alert.success')}!`, t('superadmin.teamRoles.saved'))
    } catch (error: any) {
        // Backenden svarer 409 med hvor mange kollegaer der står i rollen, og den
        // besked er mere brugbar end en generisk fejl.
        state.error = error?.message ?? error
    } finally {
        state.isSaving = false
    }
}
</script>
