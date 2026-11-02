<template>
    <div class="rounded-xl border border-gray-200 bg-white p-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Icon name="ph:video-camera" class="h-4 w-4" /> {{ $t('superadmin.salesMeetings.title') }}
            </p>
            <FormButton v-if="state.configured && canPlan && !state.isFormOpen" type="button" buttonStyle="secondary"
                @click="openForm">
                <Icon name="ph:plus" class="h-4 w-4 mr-1" /> {{ $t('superadmin.salesMeetings.plan') }}
            </FormButton>
        </div>

        <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" class="mt-3" />
        <p v-if="!state.isLoading && !state.configured" class="mt-2 text-[13px] text-gray-500">
            {{ $t('superadmin.salesMeetings.notConfigured') }}
        </p>

        <!-- Plan a meeting -->
        <form v-if="state.isFormOpen" class="mt-3 space-y-3 rounded-lg bg-gray-50 p-3" @submit.prevent="save">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="sm:col-span-2">
                    <label class="co-detail-label" for="sm-starts">{{ $t('superadmin.salesMeetings.startsAt') }}</label>
                    <input id="sm-starts" v-model="form.starts_at" type="datetime-local" required class="co-input mt-1" />
                </div>
                <div>
                    <label class="co-detail-label" for="sm-minutes">{{ $t('superadmin.salesMeetings.minutes') }}</label>
                    <select id="sm-minutes" v-model.number="form.minutes" class="co-input mt-1">
                        <option v-for="m in [15, 30, 45, 60, 90]" :key="m" :value="m">{{ m }} min</option>
                    </select>
                </div>
                <div class="sm:col-span-2">
                    <label class="co-detail-label" for="sm-host">{{ $t('superadmin.salesMeetings.host') }}</label>
                    <select id="sm-host" v-model="form.host_uuid" required class="co-input mt-1">
                        <option value="" disabled>{{ $t('superadmin.salesMeetings.chooseHost') }}</option>
                        <option v-for="host in state.hosts" :key="host.uuid" :value="host.uuid">{{ host.name }}</option>
                    </select>
                </div>
                <div>
                    <label class="co-detail-label" for="sm-title">{{ $t('superadmin.salesMeetings.titleField') }}</label>
                    <input id="sm-title" v-model="form.title" type="text" maxlength="150" class="co-input mt-1"
                        :placeholder="defaultTitle" />
                </div>
            </div>

            <!-- Who gets the invitation -->
            <div>
                <p class="co-detail-label mb-1">{{ $t('superadmin.salesMeetings.guests') }}</p>
                <p v-if="inquiryUuid" class="text-[13px] text-gray-800">{{ inquiryGuest || '—' }}</p>
                <template v-else>
                    <div v-if="state.accounts.length" class="max-h-40 overflow-y-auto space-y-1">
                        <label v-for="account in state.accounts" :key="account.uuid" class="flex items-center gap-2 text-[13px]">
                            <input v-model="form.user_uuids" type="checkbox" :value="account.uuid" class="rounded border-gray-300" />
                            {{ [account.firstname, account.lastname].filter(Boolean).join(' ') }}
                            <span class="text-gray-500">{{ account.email }}</span>
                        </label>
                    </div>
                    <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input v-model="form.extra_name" type="text" class="co-input" :placeholder="$t('superadmin.salesMeetings.otherName')"
                            :aria-label="$t('superadmin.salesMeetings.otherName')" />
                        <input v-model="form.extra_email" type="email" class="co-input" :placeholder="$t('superadmin.salesMeetings.otherEmail')"
                            :aria-label="$t('superadmin.salesMeetings.otherEmail')" />
                    </div>
                </template>
                <p class="mt-1 text-[12px] text-gray-500">{{ $t('superadmin.salesMeetings.inviteHint') }}</p>
            </div>

            <div class="flex justify-end gap-2">
                <FormButton type="button" buttonStyle="cancel" @click="state.isFormOpen = false">{{ $t('cancel') }}</FormButton>
                <FormButton type="submit" :disabled="state.isSaving || !canSave">{{ $t('superadmin.salesMeetings.send') }}</FormButton>
            </div>
        </form>

        <!-- Planned and held meetings -->
        <p v-if="!state.isLoading && state.configured && !state.meetings.length && !state.isFormOpen" class="mt-2 text-[13px] text-gray-500">
            {{ $t('superadmin.salesMeetings.none') }}
        </p>
        <ul v-if="state.meetings.length" class="mt-3 divide-y divide-gray-100">
            <li v-for="meeting in state.meetings" :key="meeting.uuid" class="py-2 flex flex-wrap items-center justify-between gap-2 text-[13px]">
                <div class="min-w-0">
                    <p class="font-medium text-gray-900 truncate">{{ meeting.title }}</p>
                    <p class="text-gray-500">
                        {{ formatDateTime(meeting.starts_at) }} · {{ meeting.host?.name }}
                        <span v-if="meeting.guests?.length"> · {{ meeting.guests.map((g: any) => g.name || g.email).join(', ') }}</span>
                    </p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="rounded-full px-2 py-0.5 text-xs" :class="statusClass(meeting.status)">
                        {{ $t(`superadmin.salesMeetings.status.${meeting.status}`) }}
                    </span>
                    <a v-if="meeting.host_url && ['scheduled', 'live'].includes(meeting.status)" :href="meeting.host_url" target="_blank"
                        rel="noopener" class="text-[#205E77] underline" :title="$t('superadmin.salesMeetings.openHint')">
                        {{ $t('superadmin.salesMeetings.open') }}
                    </a>
                </div>
            </li>
        </ul>
        <p v-if="state.saved" class="mt-2 text-[12px] text-green-700">{{ state.saved }}</p>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { salesMeetingService } from '@/components/api/superadmin/SalesMeetingService'
import { accountService } from '@/components/api/superadmin/AccountService'

/**
 * Online meetings our own team holds: a demo with a prospect (sales inquiry)
 * or a meeting with a customer (their account). The meeting lives in
 * CitizenOne's own customer account and is hosted by a colleague there; the
 * guests get the usual invitation with the link and a calendar file.
 */
const props = defineProps<{
    inquiryUuid?: string
    inquiryGuest?: string
    companyUuid?: string
    // Prefilled time, e.g. the time a prospect asked for.
    suggestedAt?: string | null
    // Who is planning it, from the page's own permission check.
    canPlan?: boolean
    // "CitizenOne demo · Løveskoven", shown as the placeholder for the title.
    defaultTitle?: string
}>()

const emit = defineEmits<{ (e: 'scheduled'): void }>()
const { t } = useI18n()

const state = reactive({
    isLoading: false,
    isSaving: false,
    isFormOpen: false,
    configured: true,
    hosts: [] as any[],
    suggestedHost: '' as string,
    accounts: [] as any[],
    meetings: [] as any[],
    error: {} as any,
    saved: '',
})

const form = reactive({
    starts_at: '',
    minutes: 30,
    host_uuid: '',
    title: '',
    user_uuids: [] as string[],
    extra_name: '',
    extra_email: '',
})

const canSave = computed(() => {
    if (!form.starts_at || !form.host_uuid) return false
    if (props.inquiryUuid) return true
    return form.user_uuids.length > 0 || !!form.extra_email.trim()
})

async function load() {
    state.isLoading = true
    state.error = {}
    try {
        const [hosts, meetings] = await Promise.all([
            salesMeetingService.hosts(),
            props.inquiryUuid
                ? salesMeetingService.inquiryMeetings(props.inquiryUuid)
                : salesMeetingService.companyMeetings(props.companyUuid as string),
        ])
        state.configured = !!hosts?.data?.configured
        state.hosts = hosts?.data?.hosts ?? []
        state.suggestedHost = hosts?.data?.suggested_uuid ?? ''
        state.meetings = meetings?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function openForm() {
    state.saved = ''
    form.starts_at = props.suggestedAt && moment(props.suggestedAt).isAfter(moment())
        ? moment(props.suggestedAt).format('YYYY-MM-DDTHH:mm')
        : moment().add(1, 'day').startOf('hour').hour(10).format('YYYY-MM-DDTHH:mm')
    form.host_uuid = state.suggestedHost || (state.hosts.length === 1 ? state.hosts[0].uuid : '')
    form.title = ''
    form.user_uuids = []
    form.extra_name = ''
    form.extra_email = ''
    state.isFormOpen = true

    if (props.companyUuid && !state.accounts.length) {
        try {
            const response = await accountService.getAccounts({ company_uuid: props.companyUuid, page: 1, sortField: 'firstname', sortOrder: 'ascend' })
            state.accounts = (response?.data ?? []).filter((a: any) => a.email && a.is_active !== false && !a.is_archived)
        } catch (error: any) {
            state.error = error
        }
    }
}

async function save() {
    state.isSaving = true
    state.error = {}
    const params: any = {
        starts_at: moment(form.starts_at).toISOString(),
        minutes: form.minutes,
        host_uuid: form.host_uuid,
    }
    if (form.title.trim()) params.title = form.title.trim()
    try {
        let response
        if (props.inquiryUuid) {
            response = await salesMeetingService.scheduleForInquiry(props.inquiryUuid, params)
        } else {
            params.guests = [
                ...form.user_uuids.map((uuid) => ({ user_uuid: uuid })),
                ...(form.extra_email.trim() ? [{ name: form.extra_name.trim() || null, email: form.extra_email.trim() }] : []),
            ]
            response = await salesMeetingService.scheduleForCompany(props.companyUuid as string, params)
        }
        state.isFormOpen = false
        const guests = (response?.data?.guests ?? []).map((g: any) => g.email).join(', ')
        state.saved = t('superadmin.salesMeetings.sent', { guests })
        await load()
        emit('scheduled')
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

function statusClass(status: string): string {
    if (status === 'live') return 'bg-green-50 text-green-700'
    if (status === 'scheduled') return 'bg-blue-50 text-blue-700'
    if (status === 'cancelled') return 'bg-red-50 text-red-700'
    return 'bg-gray-100 text-gray-600'
}

const formatDateTime = (value: string) => value ? moment(value).format('DD-MM-YYYY HH:mm') : ''

watch(() => [props.inquiryUuid, props.companyUuid], () => {
    state.isFormOpen = false
    state.saved = ''
    load()
})
onMounted(load)
</script>
