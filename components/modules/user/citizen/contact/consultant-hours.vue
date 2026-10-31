<template>
    <!-- How the indsats' hours a week are split between its consultants. A
         consultant without a figure of her own carries an even share of what
         the others are not given. Hidden when nobody is a consultant here. -->
    <div v-if="state.loaded && state.consultants.length" class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div>
            <h3 class="text-sm font-semibold text-gray-900">{{ $t('citizens.consultantHours.title') }}</h3>
            <p class="mt-1 text-xs text-gray-500">{{ $t('citizens.consultantHours.hint') }}</p>
        </div>

        <p class="mt-3 text-sm tabular-nums text-gray-600">
            <template v-if="state.granted !== null">
                {{ $t('citizens.consultantHours.granted', { hours: hours(state.granted) }) }}
                <span v-if="state.grantedSplit" class="text-gray-500">
                    ({{ $t('citizens.consultantHours.grantedSplit', {
                        contact: hours(state.grantedSplit.contact ?? 0),
                        admin: hours(state.grantedSplit.admin ?? 0),
                        transport: hours(state.grantedSplit.transport ?? 0),
                    }) }})
                </span>
            </template>
            <template v-else>{{ $t('citizens.consultantHours.noGrant') }}</template>
        </p>

        <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" class="mt-3" />

        <div class="mt-3 overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead>
                    <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
                        <th class="py-2 pr-3 font-medium">{{ $t('citizens.consultantHours.consultant') }}</th>
                        <th class="py-2 pr-3 font-medium">{{ $t('citizens.consultantHours.given') }}</th>
                        <th class="py-2 font-medium">{{ $t('citizens.consultantHours.counts') }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="row in state.consultants" :key="row.contact_uuid">
                        <td class="py-2 pr-3 text-gray-800">{{ [row.firstname, row.lastname].filter(Boolean).join(' ') }}</td>
                        <td class="py-2 pr-3 tabular-nums">
                            <form v-if="canEdit" class="flex items-center gap-1" @submit.prevent="save(row.contact_uuid)">
                                <input v-model="state.drafts[row.contact_uuid]" inputmode="decimal"
                                    :placeholder="$t('citizens.consultantHours.placeholder')"
                                    class="w-20 rounded-md border-0 px-2 py-1 text-sm tabular-nums ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary"
                                    :aria-label="$t('citizens.consultantHours.givenFor', { name: row.firstname })"
                                    @blur="save(row.contact_uuid)" />
                                <span class="text-xs text-gray-500">{{ $t('citizens.consultantHours.perWeek') }}</span>
                            </form>
                            <span v-else>{{ row.weekly_hours !== null ? `${hours(row.weekly_hours)} ${$t('citizens.consultantHours.perWeek')}` : '-' }}</span>
                        </td>
                        <td class="py-2 tabular-nums text-gray-700">
                            <template v-if="row.allocated_weekly_hours !== null">
                                {{ hours(row.allocated_weekly_hours) }} {{ $t('citizens.consultantHours.perWeek') }}
                                <span class="text-xs text-gray-500">· {{ $t('citizens.consultantHours.basis.' + row.allocation_basis) }}</span>
                            </template>
                            <span v-else>-</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { citizenContactService } from '@/components/api/user/CitizenContactService'
import { formatWeekHours, parseWeeklyHours } from '@/composables/citizenWeeklyHours'
import { usePermissions } from '@/composables/usePermissions'
import type { Error } from '@/types'

type ConsultantRow = {
    contact_uuid: string
    user_uuid: string
    firstname: string | null
    lastname: string | null
    weekly_hours: number | null
    allocated_weekly_hours: number | null
    allocation_basis: 'explicit' | 'even_split' | 'none'
}

const props = defineProps({
    citizenUuid: {
        type: String,
        required: true,
    },
})

const { locale } = useI18n()
const { isAtLeast, can } = usePermissions()

const canEdit = computed(() => isAtLeast('Admin') || can('update_citizen_contact'))

const state = reactive({
    consultants: [] as ConsultantRow[],
    drafts: {} as Record<string, string>,
    error: {} as Error,
    granted: null as number | null,
    grantedSplit: null as { contact: number | null, admin: number | null, transport: number | null } | null,
    loaded: false,
    savingUuid: null as string | null,
})

onMounted(() => {
    fetchHours()
})

function hours(value: number) {
    return formatWeekHours(value, locale.value)
}

function apply(data: any) {
    state.granted = data?.granted_weekly_hours ?? null
    state.grantedSplit = data?.granted_split ?? null
    state.consultants = data?.consultants ?? []
    state.drafts = Object.fromEntries(state.consultants
        .map(row => [row.contact_uuid, row.weekly_hours !== null ? hours(row.weekly_hours) : '']))
}

async function fetchHours() {
    state.error = {}
    try {
        const response = await citizenContactService.getConsultantHours(props.citizenUuid)
        apply(response?.data)
    } catch (error: any) {
        state.error = error
    }
    state.loaded = true
}

async function save(contactUuid: string) {
    const row = state.consultants.find(item => item.contact_uuid === contactUuid)
    const value = parseWeeklyHours(state.drafts[contactUuid])
    if (!row || value === row.weekly_hours || state.savingUuid === contactUuid) return

    state.error = {}
    state.savingUuid = contactUuid
    try {
        const response = await citizenContactService.updateConsultantHours(props.citizenUuid, contactUuid, { weekly_hours: value })
        apply(response?.data)
    } catch (error: any) {
        state.error = error
    }
    state.savingUuid = null
}

defineExpose({ fetchHours })
</script>
