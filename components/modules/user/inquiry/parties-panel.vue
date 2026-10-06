<template>
    <section>
        <div class="flex items-start justify-between gap-3">
            <div>
                <h3 class="text-sm font-semibold text-gray-900">{{ $t('inquiryParties.title') }}</h3>
                <p class="mt-0.5 max-w-xl text-xs text-gray-500">{{ $t('inquiryParties.hint') }}</p>
            </div>
            <Tooltip v-if="canEdit && !state.adding" :text="$t('inquiryParties.add')">
                <FormButton type="button" buttonStyle="action" :aria-label="$t('inquiryParties.add')" @click="startAdding">
                    <Icon name="ph:plus" class="size-4" />
                </FormButton>
            </Tooltip>
        </div>

        <p v-if="!state.parties.length && !state.adding" class="mt-3 text-sm text-gray-400">{{ $t('inquiryParties.empty') }}</p>

        <ul class="mt-3 divide-y divide-gray-100">
            <li v-for="party in state.parties" :key="party.uuid" class="flex items-center gap-3 py-2">
                <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-gray-900">
                        {{ partyName(party) }}
                        <span v-if="party.company_name && (party.firstname || party.lastname)" class="font-normal text-gray-500">
                            · {{ party.company_name }}
                        </span>
                    </p>
                    <div class="mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span class="rounded-full bg-surface-100 px-2 py-px text-[11px] font-semibold text-slate-500">
                            {{ $t('inquiryParties.types.' + (party.title || 'external_contact')) }}
                        </span>
                        <Tooltip v-if="party.is_primary" :text="$t('inquiryParties.primaryHint')">
                            <span class="rounded-full bg-primary/10 px-2 py-px text-[11px] font-semibold text-primary">
                                {{ $t('inquiryParties.primary') }}
                            </span>
                        </Tooltip>
                        <span v-if="party.coordinator_role" class="rounded-full bg-[#e6f6ee] px-2 py-px text-[11px] font-semibold text-[#177a53]">
                            {{ party.coordinator_role === 'primary' ? $t('citizens.coordinators.badgePrimary') : $t('citizens.coordinators.badgeSecondary') }}
                        </span>
                        <span v-if="party.email || party.phone" class="text-[11px] text-gray-400">
                            {{ [party.email, party.phone].filter(Boolean).join(' · ') }}
                        </span>
                    </div>
                </div>
                <Tooltip v-if="canEdit" :text="$t('inquiryParties.remove')">
                    <FormButton type="button" buttonStyle="danger" :aria-label="$t('inquiryParties.remove')" @click="remove(party)">
                        <Icon name="ph:trash" class="size-4" />
                    </FormButton>
                </Tooltip>
            </li>
        </ul>

        <div v-if="state.adding" class="mt-3 rounded-md bg-gray-50 px-4 py-3">
            <div class="flex gap-4 text-sm">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="outside" v-model="state.kind" class="text-primary focus:ring-primary" />
                    {{ $t('inquiryParties.kinds.outside') }}
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="employee" v-model="state.kind" class="text-primary focus:ring-primary" />
                    {{ $t('inquiryParties.kinds.employee') }}
                </label>
            </div>

            <div v-if="state.kind === 'outside'" class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div class="space-y-1">
                    <FormLabel for="party_title" :label="$t('inquiryParties.form.type')" />
                    <FormSelect id="party_title" :options="typeOptions" v-model="state.draft.title" :searchable="false" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="party_company" :label="$t('inquiryParties.form.organisation')" />
                    <FormTextField id="party_company" name="party_company" v-model="state.draft.company_name"
                        :placeholder="$t('inquiryParties.form.organisationPlaceholder')" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="party_firstname" :label="$t('inquiryParties.form.firstname')" />
                    <FormTextField id="party_firstname" name="party_firstname" v-model="state.draft.firstname"
                        :placeholder="$t('inquiryParties.form.firstname')" />
                    <FormError :error="state.errors?.firstname?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="party_lastname" :label="$t('inquiryParties.form.lastname')" />
                    <FormTextField id="party_lastname" name="party_lastname" v-model="state.draft.lastname"
                        :placeholder="$t('inquiryParties.form.lastname')" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="party_email" :label="$t('inquiryParties.form.email')" />
                    <FormTextField id="party_email" name="party_email" v-model="state.draft.email"
                        :placeholder="$t('inquiryParties.form.email')" />
                    <FormError :error="state.errors?.email?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="party_phone" :label="$t('inquiryParties.form.phone')" />
                    <FormTextField id="party_phone" name="party_phone" v-model="state.draft.phone"
                        :placeholder="$t('inquiryParties.form.phone')" />
                </div>
            </div>

            <div v-else class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div class="space-y-1">
                    <FormLabel for="party_user" :label="$t('inquiryParties.form.employee')" />
                    <FormSelect id="party_user" :options="state.employeeOptions" v-model="state.draft.user_uuid" />
                    <FormError :error="state.errors?.user_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="party_role" :label="$t('inquiryParties.form.coordinatorRole')" />
                    <FormSelect id="party_role" :options="roleOptions" v-model="state.draft.coordinator_role" :searchable="false" />
                </div>
            </div>

            <label class="mt-3 flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" class="size-4 rounded border-slate-300 text-primary focus:ring-primary" v-model="state.draft.is_primary" />
                {{ $t('inquiryParties.form.isPrimary') }}
            </label>

            <div class="mt-3 flex items-center gap-2">
                <FormButton type="button" buttonStyle="cancel" @click="state.adding = false">{{ $t('cancel') }}</FormButton>
                <FormButton type="button" buttonStyle="primary" @click="save">{{ $t('save') }}</FormButton>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { inquiryPartyService } from '@/components/api/user/InquiryPartyService'
import { userService } from '@/components/api/user/UserService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { errorAlert } = useAlert()

const props = defineProps({
    inquiryUuid: {
        type: String,
        required: true,
    },
})

// Same gate as the API: Admin or the update permission.
const { isAtLeast, can } = usePermissions()
const canEdit = computed(() => isAtLeast('Admin') || can('update'))

const TYPES = ['case_manager', 'relatives', 'external_contact', 'doctor', 'dentist']

const emptyDraft = () => ({
    title: 'case_manager' as string | null,
    firstname: '',
    lastname: '',
    company_name: '',
    email: '',
    phone: '',
    user_uuid: null as string | null,
    coordinator_role: null as string | null,
    is_primary: false,
})

const state = reactive({
    parties: [] as any[],
    adding: false,
    kind: 'outside' as 'outside' | 'employee',
    draft: emptyDraft(),
    errors: {} as Record<string, string[]>,
    employeeOptions: [] as any[],
})

const typeOptions = computed(() => TYPES.map((type) => ({ value: type, label: t('inquiryParties.types.' + type) })))
const roleOptions = computed(() => [
    { value: null, label: t('inquiryParties.form.noRole') },
    { value: 'primary', label: t('citizens.coordinators.primary') },
    { value: 'secondary', label: t('citizens.coordinators.secondary') },
])

function partyName(party: any) {
    const name = `${party.firstname ?? ''} ${party.lastname ?? ''}`.trim()

    return name || party.company_name || '-'
}

async function load() {
    try {
        const response = await inquiryPartyService.getParties(props.inquiryUuid)
        state.parties = response?.data ?? []
    } catch (_) {
        state.parties = []
    }
}

async function startAdding() {
    state.draft = emptyDraft()
    state.errors = {}
    state.adding = true
    if (!state.employeeOptions.length) {
        try {
            const response = await userService.getAllUsersWithoutAllUsersOption()
            state.employeeOptions = (response?.data ?? []).map((employee: any) => ({
                value: employee.uuid,
                label: `${employee.firstname ?? ''} ${employee.lastname ?? ''}`.trim(),
            }))
        } catch (_) {
            state.employeeOptions = []
        }
    }
}

async function save() {
    state.errors = {}
    const draft = state.draft
    const params = state.kind === 'employee'
        ? { user_uuid: draft.user_uuid, coordinator_role: draft.coordinator_role, is_primary: draft.is_primary }
        : {
            title: draft.title,
            firstname: draft.firstname || null,
            lastname: draft.lastname || null,
            company_name: draft.company_name || null,
            email: draft.email || null,
            phone: draft.phone || null,
            is_primary: draft.is_primary,
        }

    try {
        await inquiryPartyService.saveParty(props.inquiryUuid, params)
        state.adding = false
        await load()
    } catch (error: any) {
        state.errors = error?.errors ?? {}
        if (!error?.errors) errorAlert(t('alert.warning'), error?.message ?? t('inquiryParties.saveFailed'))
    }
}

async function remove(party: any) {
    try {
        await inquiryPartyService.deleteParty(party.uuid)
        await load()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryParties.saveFailed'))
    }
}

onMounted(load)
watch(() => props.inquiryUuid, load)
</script>
