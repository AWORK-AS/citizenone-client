<template>
    <div class="border border-[#EAECF0] rounded-xl px-4 py-4 space-y-4">
        <div>
            <label class="co-label">{{ $t('superadmin.teamRoles.person.role') }}</label>
            <select v-model="teamRole" class="co-input">
                <option v-for="role in roles" :key="role.id" :value="role.name">{{ role.label }}</option>
            </select>
            <p class="text-[11px] text-[#8891A4] mt-1">{{ $t('superadmin.teamRoles.person.roleHint') }}</p>
        </div>

        <div v-if="selectable.length">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                <label v-for="permission in selectable" :key="permission.name"
                    class="flex items-start gap-2 text-sm text-[#1F2533] cursor-pointer">
                    <input type="checkbox" class="mt-0.5 size-4 rounded border-[#CBD2DD] text-[#205E77]"
                        :checked="isEffective(permission.name)" @change="toggle(permission.name)" />
                    <span>
                        {{ permission.label }}
                        <!-- Kun afvigelserne får et mærke. Er hakket det rollen siger, er der
                             ingenting at fortælle, og et mærke ved hver linje ville skjule de
                             to der betyder noget. -->
                        <span v-if="deviation(permission.name) === 'added'"
                            class="ml-1 text-[10px] font-semibold text-[#2E9E33]">
                            + {{ $t('superadmin.teamRoles.person.extra') }}
                        </span>
                        <span v-else-if="deviation(permission.name) === 'removed'"
                            class="ml-1 text-[10px] font-semibold text-[#CC3B2D]">
                            &minus; {{ $t('superadmin.teamRoles.person.revoked') }}
                        </span>
                    </span>
                </label>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { teamRoleService } from '@/components/api/superadmin/TeamRoleService'

/**
 * Én kollegas adgang: rollen, og de undtagelser der gælder netop dem.
 *
 * Ét hak pr. område, og det viser hvad kollegaen faktisk kan - ikke hvad der er tilvalgt.
 * Det er den forskel der gør skærmen læsbar: spørgsmålet er "må Mette se fakturaer",
 * ikke "har Mette et tilvalg der hedder view_financials".
 *
 * Afvigelsen udledes frem for at vælges. Sætter man hak i noget rollen ikke giver,
 * bliver det et tilvalg; fjerner man hak i noget rollen giver, bliver det et fravalg -
 * og fravalget findes, fordi alternativet er en ny rolle for hver undtagelse.
 *
 * Fravalget er ikke Spatie's. Det ligger i `user_revoked_permissions` og afvises i
 * `User::hasPermissionTo()` i backenden, fordi biblioteket kun kan lægge til.
 */
const props = defineProps<{
    teamRole: string | null
    extraPermissions: string[]
    revokedPermissions: string[]
}>()

const emit = defineEmits<{
    'update:teamRole': [string | null]
    'update:extraPermissions': [string[]]
    'update:revokedPermissions': [string[]]
}>()

type Permission = { name: string; label: string; is_required: boolean }
type TeamRole = { id: number; name: string; label: string; permissions: string[] }

const roles = ref<TeamRole[]>([])
const permissions = ref<Permission[]>([])

const teamRole = computed({
    get: () => props.teamRole,
    set: (value: string | null) => emit('update:teamRole', value),
})

const selectable = computed(() => permissions.value.filter((permission) => !permission.is_required))

const rolePermissions = computed<string[]>(() => {
    const role = roles.value.find((item) => item.name === props.teamRole)

    // Superadmin har alt implicit i backenden, også det rollen ikke har fået i basen.
    // Uden dette ville skærmen vise en superadmin som havende ingenting.
    if (role?.name === 'Superadmin') {
        return permissions.value.map((permission) => permission.name)
    }

    return role?.permissions ?? []
})

onMounted(async () => {
    try {
        const [roleResponse, permissionResponse] = await Promise.all([
            teamRoleService.getRoles(),
            teamRoleService.getPermissions(),
        ])

        roles.value = roleResponse?.data ?? []
        permissions.value = permissionResponse?.data ?? []
    } catch {
        // Uden listerne vises kun rollevælgeren, tom. Formularen kan stadig gemme navn
        // og telefon, hvilket er bedre end en skærm der ikke kan bruges til noget.
    }
})

function isEffective(name: string): boolean {
    if (props.revokedPermissions.includes(name)) return false

    return rolePermissions.value.includes(name) || props.extraPermissions.includes(name)
}

function deviation(name: string): 'added' | 'removed' | null {
    if (props.revokedPermissions.includes(name)) return 'removed'
    if (props.extraPermissions.includes(name) && !rolePermissions.value.includes(name)) return 'added'

    return null
}

function toggle(name: string) {
    const fromRole = rolePermissions.value.includes(name)

    if (isEffective(name)) {
        // Slukkes noget rollen giver, er det et fravalg. Slukkes et tilvalg, forsvinder
        // tilvalget - der er ingen grund til at skrive et fravalg af noget rollen ikke
        // giver, og gjorde vi det, ville rollen ikke kunne udvides for personen senere.
        if (fromRole) {
            emit('update:revokedPermissions', [...props.revokedPermissions, name])
        } else {
            emit('update:extraPermissions', props.extraPermissions.filter((item) => item !== name))
        }

        return
    }

    if (props.revokedPermissions.includes(name)) {
        emit('update:revokedPermissions', props.revokedPermissions.filter((item) => item !== name))

        return
    }

    emit('update:extraPermissions', [...props.extraPermissions, name])
}
</script>
