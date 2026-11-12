<template>
    <div class="rounded-xl border border-gray-200 bg-white p-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Icon name="ph:video-camera" class="h-4 w-4" /> {{ $t('superadmin.salesMeetings.title') }}
            </p>
            <div v-if="state.configured && canPlan && !state.isFormOpen && !state.isFollowUpOpen" class="flex flex-wrap items-center gap-2">
                <!-- On the phone with the prospect: send the link now and open the meeting. -->
                <FormButton v-if="inquiryUuid" type="button" buttonStyle="secondary" :disabled="state.isSaving" @click="startNow">
                    <Icon name="ph:video-camera" class="h-4 w-4 mr-1" /> {{ $t('superadmin.salesMeetings.startNow') }}
                </FormButton>
                <FormButton v-if="inquiryUuid && hasHeldDemo" type="button" buttonStyle="secondary" @click="openFollowUp">
                    <Icon name="ph:envelope-simple" class="h-4 w-4 mr-1" /> {{ $t('superadmin.salesMeetings.followUp.button') }}
                </FormButton>
                <FormButton type="button" buttonStyle="secondary" @click="openForm">
                    <Icon name="ph:plus" class="h-4 w-4 mr-1" /> {{ $t('superadmin.salesMeetings.plan') }}
                </FormButton>
            </div>
        </div>

        <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" class="mt-3" />
        <p v-if="!state.isLoading && !state.configured" class="mt-2 text-[13px] text-gray-500">
            {{ $t('superadmin.salesMeetings.notConfigured') }}
            <NuxtLink to="/superadmin/meetings" class="ml-1 text-tertiary underline">{{ $t('superadmin.sidebar.meetings') }}</NuxtLink>
        </p>

        <!-- Follow-up after a demo: a draft to edit, sent to the prospect -->
        <form v-if="state.isFollowUpOpen" class="mt-3 space-y-3 rounded-lg bg-gray-50 p-3" @submit.prevent="sendFollowUp">
            <p class="text-[12px] text-gray-500">{{ $t(`superadmin.salesMeetings.followUp.source.${followUp.source || 'none'}`) }}</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label class="co-detail-label" for="fu-to">{{ $t('superadmin.salesMeetings.followUp.to') }}</label>
                    <input id="fu-to" v-model="followUp.to" type="email" required class="co-input mt-1" />
                </div>
                <div>
                    <label class="co-detail-label" for="fu-subject">{{ $t('superadmin.salesMeetings.followUp.subject') }}</label>
                    <input id="fu-subject" v-model="followUp.subject" type="text" maxlength="200" required class="co-input mt-1" />
                </div>
            </div>
            <div>
                <label class="co-detail-label" for="fu-body">{{ $t('superadmin.salesMeetings.followUp.body') }}</label>
                <textarea id="fu-body" v-model="followUp.body" rows="12" maxlength="10000" required class="co-input mt-1"></textarea>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label class="co-detail-label" for="fu-btn">{{ $t('superadmin.salesMeetings.followUp.buttonText') }}</label>
                    <input id="fu-btn" v-model="followUp.button_text" type="text" maxlength="60" class="co-input mt-1" />
                </div>
                <div>
                    <label class="co-detail-label" for="fu-url">{{ $t('superadmin.salesMeetings.followUp.buttonUrl') }}</label>
                    <input id="fu-url" v-model="followUp.button_url" type="url" maxlength="500" class="co-input mt-1"
                        :placeholder="$t('superadmin.salesMeetings.followUp.noButton')" />
                </div>
            </div>
            <div class="flex justify-end gap-2">
                <FormButton type="button" buttonStyle="cancel" @click="state.isFollowUpOpen = false">{{ $t('cancel') }}</FormButton>
                <FormButton type="submit" :disabled="state.isSaving || !followUp.to || !followUp.subject.trim() || !followUp.body.trim()">
                    {{ $t('superadmin.salesMeetings.followUp.send') }}
                </FormButton>
            </div>
        </form>

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
                    <ModulesSuperadminStatusPill :variant="statusVariant(meeting.status)"
                        :label="$t(`superadmin.salesMeetings.status.${meeting.status}`)" />
                    <!-- After a demo: did the prospect come (meetings:sales-follow-up) -->
                    <ModulesSuperadminStatusPill v-if="meeting.outcome" :variant="outcomeVariant(meeting.outcome)"
                        :label="$t(`superadmin.salesMeetings.outcome.${meeting.outcome}`)" />
                    <NuxtLink v-if="meeting.staff_path && ['scheduled', 'live'].includes(meeting.status)" :to="meeting.staff_path"
                        target="_blank" class="text-tertiary underline" :title="$t('superadmin.salesMeetings.openHint')">
                        {{ $t('superadmin.salesMeetings.open') }}
                    </NuxtLink>
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
    isFollowUpOpen: false,
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

const followUp = reactive({
    to: '',
    subject: '',
    body: '',
    button_text: '',
    button_url: '',
    source: null as string | null,
})

// A demo that has happened: something to follow up on.
const hasHeldDemo = computed(() => state.meetings.some((m: any) =>
    m.status === 'finished' || (m.status !== 'cancelled' && m.starts_at && moment(m.starts_at).isBefore(moment()))))

async function openFollowUp() {
    state.saved = ''
    state.error = {}
    try {
        const response = await salesMeetingService.followUpDraft(props.inquiryUuid as string)
        const draft = response?.data ?? {}
        Object.assign(followUp, {
            to: draft.to ?? '',
            subject: draft.subject ?? '',
            body: draft.body ?? '',
            button_text: draft.button_text ?? '',
            button_url: draft.button_url ?? '',
            source: draft.source ?? null,
        })
        state.isFormOpen = false
        state.isFollowUpOpen = true
    } catch (error: any) {
        state.error = error
    }
}

async function sendFollowUp() {
    state.isSaving = true
    state.error = {}
    const params: any = { to: followUp.to.trim(), subject: followUp.subject.trim(), body: followUp.body }
    if (followUp.button_url.trim() && followUp.button_text.trim()) {
        params.button_text = followUp.button_text.trim()
        params.button_url = followUp.button_url.trim()
    }
    try {
        await salesMeetingService.sendFollowUp(props.inquiryUuid as string, params)
        state.isFollowUpOpen = false
        state.saved = t('superadmin.salesMeetings.followUp.sent', { to: params.to })
        emit('scheduled')
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

/** Starts a demo this minute: the prospect gets the link, the host's meeting opens in a new tab. */
async function startNow() {
    state.isSaving = true
    state.error = {}
    state.saved = ''
    // Opened before the request so the browser does not block it as a popup.
    const tab = window.open('', '_blank')
    try {
        const params: any = { start_now: true, minutes: 30 }
        if (state.suggestedHost) params.host_uuid = state.suggestedHost
        else if (state.hosts.length === 1) params.host_uuid = state.hosts[0].uuid
        const response = await salesMeetingService.scheduleForInquiry(props.inquiryUuid as string, params)
        if (tab && response?.data?.staff_path) tab.location.href = `${window.location.origin}${response.data.staff_path}?join=1`
        else tab?.close()
        const guests = (response?.data?.guests ?? []).map((g: any) => g.email).join(', ')
        state.saved = t('superadmin.salesMeetings.sent', { guests })
        await load()
        emit('scheduled')
    } catch (error: any) {
        tab?.close()
        state.error = error
    }
    state.isSaving = false
}

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
    state.isFollowUpOpen = false
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

function outcomeVariant(outcome: string) {
    if (outcome === 'held') return 'success'
    if (outcome === 'missed') return 'warning'
    return 'neutral'
}

function statusVariant(status: string) {
    if (status === 'live') return 'success'
    if (status === 'scheduled') return 'info'
    if (status === 'cancelled') return 'danger'
    return 'neutral'
}

const formatDateTime = (value: string) => value ? moment(value).format('DD-MM-YYYY HH:mm') : ''

watch(() => [props.inquiryUuid, props.companyUuid], () => {
    state.isFormOpen = false
    state.isFollowUpOpen = false
    state.saved = ''
    load()
})
onMounted(load)
</script>
