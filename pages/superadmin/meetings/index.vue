<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.teamMeetings.pageTitle') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.teamMeetings.pageTitle') }}</template>

            <div class="p-1 space-y-4">
                <ModulesSuperadminPageHeader :title="$t('superadmin.teamMeetings.pageTitle')"
                    :subtitle="$t('superadmin.teamMeetings.description')">
                    <template #actions>
                        <button v-if="state.configured" class="co-action-btn" :disabled="state.isFormOpen" @click="openForm(true)">
                            <Icon name="ph:video-camera" class="w-3.5 h-3.5" />
                            {{ $t('superadmin.teamMeetings.startNow') }}
                        </button>
                        <button v-if="state.configured" class="co-action-btn" :disabled="state.isFormOpen" @click="openForm(false)">
                            <Icon name="ph:calendar-plus" class="w-3.5 h-3.5" />
                            {{ $t('superadmin.salesMeetings.plan') }}
                        </button>
                        <button class="co-action-btn" @click="load">
                            <Icon name="ph:arrows-clockwise" class="w-3.5 h-3.5" />
                            {{ $t('superadmin.salesInquiries.refresh') }}
                        </button>
                    </template>
                </ModulesSuperadminPageHeader>

                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />
                <p v-if="!state.isLoading && !state.configured" class="text-[13px] text-ink-muted">
                    {{ $t('superadmin.salesMeetings.notConfigured') }}
                </p>
                <p v-if="state.saved" class="text-[13px] text-green-700">{{ state.saved }}</p>

                <!-- New meeting: now or later, with anyone -->
                <form v-if="state.isFormOpen" class="space-y-3 rounded-xl border border-line bg-white p-4" @submit.prevent="save">
                    <p class="text-sm font-semibold text-ink">
                        {{ form.start_now ? $t('superadmin.teamMeetings.startNow') : $t('superadmin.salesMeetings.plan') }}
                    </p>
                    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div class="sm:col-span-2">
                            <label class="co-detail-label" for="tm-title">{{ $t('superadmin.salesMeetings.titleField') }}</label>
                            <input id="tm-title" v-model="form.title" type="text" maxlength="150" required class="co-input mt-1"
                                :placeholder="$t('superadmin.teamMeetings.titlePlaceholder')" />
                        </div>
                        <div class="sm:col-span-2">
                            <label class="co-detail-label" for="tm-host">{{ $t('superadmin.salesMeetings.host') }}</label>
                            <select id="tm-host" v-model="form.host_uuid" required class="co-input mt-1">
                                <option value="" disabled>{{ $t('superadmin.salesMeetings.chooseHost') }}</option>
                                <option v-for="host in state.hosts" :key="host.uuid" :value="host.uuid">{{ host.name }}</option>
                            </select>
                        </div>
                        <div v-if="!form.start_now" class="sm:col-span-2">
                            <label class="co-detail-label" for="tm-starts">{{ $t('superadmin.salesMeetings.startsAt') }}</label>
                            <input id="tm-starts" v-model="form.starts_at" type="datetime-local" required class="co-input mt-1" />
                        </div>
                        <div>
                            <label class="co-detail-label" for="tm-minutes">{{ $t('superadmin.salesMeetings.minutes') }}</label>
                            <select id="tm-minutes" v-model.number="form.minutes" class="co-input mt-1">
                                <option v-for="m in [15, 30, 45, 60, 90, 120]" :key="m" :value="m">{{ m }} min</option>
                            </select>
                        </div>
                    </div>

                    <!-- Who gets the invitation -->
                    <div>
                        <p class="co-detail-label mb-1">{{ $t('superadmin.salesMeetings.guests') }}</p>
                        <div v-for="(guest, index) in form.guests" :key="index" class="mb-2 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
                            <input v-model="guest.name" type="text" class="co-input" :placeholder="$t('superadmin.teamMeetings.guestName')"
                                :aria-label="$t('superadmin.teamMeetings.guestName')" />
                            <input v-model="guest.email" type="email" class="co-input" :placeholder="$t('superadmin.teamMeetings.guestEmail')"
                                :aria-label="$t('superadmin.teamMeetings.guestEmail')" />
                            <button type="button" class="co-action-btn" :disabled="form.guests.length === 1"
                                :aria-label="$t('superadmin.teamMeetings.removeGuest')" @click="form.guests.splice(index, 1)">
                                <Icon name="ph:x" class="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <button v-if="form.guests.length < 20" type="button" class="text-[13px] text-tertiary underline"
                            @click="form.guests.push({ name: '', email: '' })">
                            {{ $t('superadmin.teamMeetings.addGuest') }}
                        </button>
                        <p class="mt-1 text-[12px] text-ink-muted">
                            {{ form.start_now ? $t('superadmin.teamMeetings.startNowHint') : $t('superadmin.salesMeetings.inviteHint') }}
                        </p>
                    </div>

                    <div class="flex justify-end gap-2">
                        <FormButton type="button" buttonStyle="cancel" @click="state.isFormOpen = false">{{ $t('cancel') }}</FormButton>
                        <FormButton type="submit" :disabled="state.isSaving || !canSave">
                            {{ form.start_now ? $t('superadmin.teamMeetings.startAndInvite') : $t('superadmin.salesMeetings.send') }}
                        </FormButton>
                    </div>
                </form>

                <!-- Upcoming / past -->
                <div class="flex items-center gap-1">
                    <button v-for="tab in ['upcoming', 'past']" :key="tab" @click="selectScope(tab)" :class="[
                        'px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-colors',
                        state.scope === tab ? 'bg-tertiary text-white border-tertiary' : 'bg-white text-ink-body border-line-strong hover:bg-surface-canvas',
                    ]">
                        {{ $t(`superadmin.teamMeetings.scope.${tab}`) }}
                    </button>
                </div>

                <LoadingSpinner :isActive="state.isLoading">
                    <div class="bg-white border border-line rounded-xl overflow-hidden">
                        <p v-if="!state.meetings.length" class="p-8 text-center text-sm text-ink-muted">
                            {{ $t('superadmin.salesMeetings.none') }}
                        </p>
                        <ul v-else class="divide-y divide-line">
                            <li v-for="meeting in state.meetings" :key="meeting.uuid"
                                class="px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-[13px]">
                                <div class="min-w-0">
                                    <p class="font-medium text-ink truncate">{{ meeting.title }}</p>
                                    <p class="text-ink-muted">
                                        {{ formatDateTime(meeting.starts_at) }}–{{ formatTime(meeting.ends_at) }} · {{ meeting.host?.name }}
                                        <span v-if="meeting.guests?.length"> · {{ meeting.guests.map((g: any) => g.name || g.email).join(', ') }}</span>
                                    </p>
                                    <p v-if="meeting.sales_inquiry || meeting.customer" class="mt-0.5">
                                        <NuxtLink v-if="meeting.sales_inquiry" class="text-tertiary underline"
                                            :to="`/superadmin/sales-inquiries?inquiry=${encodeURIComponent(meeting.sales_inquiry.uuid)}`">
                                            {{ $t('superadmin.teamMeetings.inquiry') }}: {{ meeting.sales_inquiry.name }}
                                        </NuxtLink>
                                        <NuxtLink v-else-if="meeting.customer" class="text-tertiary underline"
                                            :to="`/superadmin/companies/${meeting.customer.uuid}/overview`">
                                            {{ $t('superadmin.teamMeetings.customer') }}: {{ meeting.customer.name }}
                                        </NuxtLink>
                                    </p>
                                </div>
                                <div class="flex items-center gap-2">
                                    <ModulesSuperadminStatusPill :variant="statusVariant(meeting.status)"
                                        :label="$t(`superadmin.salesMeetings.status.${meeting.status}`)" />
                                    <a v-if="meeting.host_url && ['scheduled', 'live'].includes(meeting.status)" :href="meeting.host_url"
                                        target="_blank" rel="noopener" class="text-tertiary underline"
                                        :title="$t('superadmin.salesMeetings.openHint')">
                                        {{ $t('superadmin.salesMeetings.open') }}
                                    </a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
/**
 * Superadmin: the team's own online meetings, on CitizenOne's Meetings app
 * instead of an outside tool. Every meeting in our own customer account
 * (demos and customer meetings too), and a new meeting with anyone, planned
 * or started now. The host opens it from their user in our account.
 */
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { salesMeetingService } from '@/components/api/superadmin/SalesMeetingService'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()

const state = reactive({
    isLoading: false,
    isSaving: false,
    isFormOpen: false,
    configured: true,
    scope: 'upcoming' as 'upcoming' | 'past',
    hosts: [] as any[],
    suggestedHost: '' as string,
    meetings: [] as any[],
    error: {} as any,
    saved: '',
})

const form = reactive({
    start_now: false,
    title: '',
    starts_at: '',
    minutes: 30,
    host_uuid: '',
    guests: [{ name: '', email: '' }] as { name: string, email: string }[],
})

const filledGuests = computed(() => form.guests.filter((g) => g.email.trim()))
const canSave = computed(() => !!form.title.trim() && !!form.host_uuid
    && (form.start_now || !!form.starts_at) && filledGuests.value.length > 0)

async function load() {
    state.isLoading = true
    state.error = {}
    try {
        const [hosts, meetings] = await Promise.all([
            salesMeetingService.hosts(),
            salesMeetingService.teamMeetings(state.scope),
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

function selectScope(scope: string) {
    state.scope = scope as 'upcoming' | 'past'
    load()
}

function openForm(startNow: boolean) {
    state.saved = ''
    form.start_now = startNow
    form.title = ''
    form.starts_at = moment().add(1, 'day').startOf('hour').hour(10).format('YYYY-MM-DDTHH:mm')
    form.minutes = startNow ? 60 : 30
    form.host_uuid = state.suggestedHost || (state.hosts.length === 1 ? state.hosts[0].uuid : '')
    form.guests = [{ name: '', email: '' }]
    state.isFormOpen = true
}

async function save() {
    state.isSaving = true
    state.error = {}
    // Opened before the request so the browser does not block it as a popup.
    const tab = form.start_now ? window.open('', '_blank') : null
    const params: any = {
        title: form.title.trim(),
        minutes: form.minutes,
        host_uuid: form.host_uuid,
        guests: filledGuests.value.map((g) => ({ name: g.name.trim() || null, email: g.email.trim() })),
    }
    if (form.start_now) params.start_now = true
    else params.starts_at = moment(form.starts_at).toISOString()

    try {
        const response = await salesMeetingService.scheduleForTeam(params)
        state.isFormOpen = false
        const guests = (response?.data?.guests ?? []).map((g: any) => g.email).join(', ')
        state.saved = t('superadmin.salesMeetings.sent', { guests })
        if (tab && response?.data?.host_url) tab.location.href = response.data.host_url
        else tab?.close()
        state.scope = 'upcoming'
        await load()
    } catch (error: any) {
        tab?.close()
        state.error = error
    }
    state.isSaving = false
}

function statusVariant(status: string) {
    if (status === 'live') return 'success'
    if (status === 'scheduled') return 'info'
    if (status === 'cancelled') return 'danger'
    return 'neutral'
}

const formatDateTime = (value: string) => value ? moment(value).format('DD-MM-YYYY HH:mm') : ''
const formatTime = (value: string) => value ? moment(value).format('HH:mm') : ''

onMounted(load)
</script>
