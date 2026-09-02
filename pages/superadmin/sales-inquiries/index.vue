<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.salesInquiries.pageTitle') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.salesInquiries.pageTitle') }}</template>

            <div class="p-1">
                <div class="flex items-start justify-between mb-4 gap-4 flex-wrap">
                    <div>
                        <h1 class="text-[22px] font-semibold text-[#1F2533]">
                            {{ $t('superadmin.salesInquiries.pageTitle') }}
                        </h1>
                        <p class="text-sm text-[#5C6478] mt-1 max-w-2xl">
                            {{ $t('superadmin.salesInquiries.description') }}
                        </p>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="relative">
                            <Icon name="ph:magnifying-glass"
                                class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8891A4]" />
                            <input v-model="state.filters.search" type="text" class="co-input pl-9 w-64"
                                :placeholder="$t('superadmin.salesInquiries.searchPlaceholder')"
                                @keyup.enter="fetchInquiries" />
                        </div>
                        <button class="co-action-btn" @click="fetchInquiries">
                            <Icon name="ph:arrows-clockwise" class="w-3.5 h-3.5" />
                            {{ $t('superadmin.salesInquiries.refresh') }}
                        </button>
                    </div>
                </div>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error?.message?.length > 0" />

                <!-- Status tabs, with what is waiting on each -->
                <div class="flex items-center gap-1 flex-wrap mb-4">
                    <button v-for="tab in statusTabs" :key="tab.key" @click="selectStatus(tab.key)" :class="[
                        'px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-colors',
                        state.filters.status === tab.key
                            ? 'bg-[#205E77] text-white border-[#205E77]'
                            : 'bg-white text-[#5C6478] border-[#D5D9E2] hover:bg-[#F5F6F8]',
                    ]">
                        {{ $t(tab.label) }}
                        <span v-if="counts[tab.key] !== undefined" class="ml-1 opacity-70">{{ counts[tab.key] }}</span>
                    </button>

                    <span class="w-px h-6 bg-[#EAECF0] mx-2"></span>

                    <button @click="toggleAssigned('unassigned')" :class="[
                        'px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-colors',
                        state.filters.assigned === 'unassigned'
                            ? 'bg-[#42AED9] text-white border-[#42AED9]'
                            : 'bg-white text-[#5C6478] border-[#D5D9E2] hover:bg-[#F5F6F8]',
                    ]">
                        {{ $t('superadmin.salesInquiries.unassigned') }}
                        <span v-if="counts.unassigned !== undefined" class="ml-1 opacity-70">{{ counts.unassigned }}</span>
                    </button>
                    <button @click="toggleAssigned('me')" :class="[
                        'px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-colors',
                        state.filters.assigned === 'me'
                            ? 'bg-[#42AED9] text-white border-[#42AED9]'
                            : 'bg-white text-[#5C6478] border-[#D5D9E2] hover:bg-[#F5F6F8]',
                    ]">
                        {{ $t('superadmin.salesInquiries.mine') }}
                    </button>
                </div>

                <div v-if="state.isLoading" class="flex justify-center py-16">
                    <Icon name="ph:spinner" class="w-7 h-7 text-[#42AED9] animate-spin" />
                </div>

                <div v-else class="bg-white border border-[#EAECF0] rounded-xl overflow-hidden shadow-sm">
                    <div v-if="!inquiries.length" class="flex flex-col items-center gap-3 py-16 text-[#8891A4]">
                        <Icon name="ph:tray" class="w-12 h-12 opacity-30" />
                        <p class="text-sm">{{ $t('superadmin.salesInquiries.empty') }}</p>
                    </div>
                    <div v-else class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="border-b border-[#EAECF0] bg-[#F9FAFB]">
                                    <th class="co-th">{{ $t('superadmin.salesInquiries.colWho') }}</th>
                                    <th class="co-th">{{ $t('superadmin.salesInquiries.colType') }}</th>
                                    <th class="co-th">{{ $t('superadmin.salesInquiries.colStatus') }}</th>
                                    <th class="co-th">{{ $t('superadmin.salesInquiries.colOwner') }}</th>
                                    <th class="co-th">{{ $t('superadmin.salesInquiries.colReceived') }}</th>
                                    <th class="co-th"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="inquiry in inquiries" :key="inquiry.uuid"
                                    class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                                    @click="openInquiry(inquiry)">
                                    <td class="co-td">
                                        <p class="text-[13px] font-semibold text-[#1F2533]">
                                            {{ inquiry.company_name || inquiry.name || inquiry.email }}
                                        </p>
                                        <p class="text-[12px] text-[#8891A4]">
                                            {{ [inquiry.name, inquiry.email, inquiry.phone].filter(Boolean).join(' · ') }}
                                        </p>
                                    </td>
                                    <td class="co-td text-[13px] text-[#5C6478]">
                                        {{ $t('superadmin.salesInquiries.sources.' + inquiry.source) }}
                                    </td>
                                    <td class="co-td">
                                        <span class="px-2 py-0.5 rounded-full text-[12px] font-medium"
                                            :style="statusStyle(inquiry.status)">
                                            {{ $t('superadmin.salesInquiries.statuses.' + inquiry.status) }}
                                        </span>
                                    </td>
                                    <td class="co-td text-[13px] text-[#5C6478]">
                                        {{ inquiry.assigned_user?.name || $t('superadmin.salesInquiries.nobody') }}
                                    </td>
                                    <td class="co-td text-[13px] text-[#5C6478]">{{ formatDate(inquiry.created_at) }}</td>
                                    <td class="co-td">
                                        <div class="flex justify-end">
                                            <button class="co-action-btn" @click.stop="openInquiry(inquiry)">
                                                <Icon name="ph:arrow-right" class="w-3.5 h-3.5" />
                                                {{ $t('superadmin.salesInquiries.open') }}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div v-if="lastPage > 1" class="flex items-center justify-end gap-2 mt-4">
                    <button class="co-action-btn" :disabled="state.page <= 1" @click="changePage(state.page - 1)">
                        <Icon name="ph:caret-left" class="w-3.5 h-3.5" />
                        {{ $t('superadmin.salesInquiries.previous') }}
                    </button>
                    <span class="text-[13px] text-[#5C6478]">{{ state.page }} / {{ lastPage }}</span>
                    <button class="co-action-btn" :disabled="state.page >= lastPage" @click="changePage(state.page + 1)">
                        {{ $t('superadmin.salesInquiries.next') }}
                        <Icon name="ph:caret-right" class="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <!-- DETAIL -->
            <Modal size="lg" :show="state.modal.isDetailOpen" @close="closeInquiry"
                :title="selected?.company_name || selected?.name || selected?.email">
                <template #modal-body>
                    <Alert type="danger" :text="state.detailError?.message"
                        v-if="state.detailError?.message && state.detailError?.message?.length > 0" />

                    <div v-if="selected" class="space-y-5">
                        <!-- What we know -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F9FAFB] rounded-xl p-4">
                            <div v-if="selected.name">
                                <p class="co-detail-label">{{ $t('superadmin.salesInquiries.detail.name') }}</p>
                                <p class="co-detail-value">{{ selected.name }}</p>
                            </div>
                            <div v-if="selected.email">
                                <p class="co-detail-label">{{ $t('superadmin.salesInquiries.detail.email') }}</p>
                                <a class="co-detail-value text-[#205E77] underline" :href="'mailto:' + selected.email">
                                    {{ selected.email }}
                                </a>
                            </div>
                            <div v-if="selected.phone">
                                <p class="co-detail-label">{{ $t('superadmin.salesInquiries.detail.phone') }}</p>
                                <a class="co-detail-value text-[#205E77] underline" :href="'tel:' + selected.phone">
                                    {{ selected.phone }}
                                </a>
                            </div>
                            <div v-if="selected.preferred_at">
                                <p class="co-detail-label">{{ $t('superadmin.salesInquiries.detail.preferredAt') }}</p>
                                <p class="co-detail-value">{{ formatDateTime(selected.preferred_at) }}</p>
                            </div>
                            <div>
                                <p class="co-detail-label">{{ $t('superadmin.salesInquiries.detail.source') }}</p>
                                <p class="co-detail-value">
                                    {{ $t('superadmin.salesInquiries.sources.' + selected.source) }}
                                </p>
                            </div>
                            <div v-if="selected.landing_page">
                                <p class="co-detail-label">{{ $t('superadmin.salesInquiries.detail.page') }}</p>
                                <p class="co-detail-value">{{ selected.landing_page }}</p>
                            </div>
                            <div v-if="campaign(selected)" class="sm:col-span-2">
                                <p class="co-detail-label">{{ $t('superadmin.salesInquiries.detail.campaign') }}</p>
                                <p class="co-detail-value">{{ campaign(selected) }}</p>
                            </div>
                        </div>

                        <div v-if="selected.message">
                            <p class="co-detail-label mb-1">{{ $t('superadmin.salesInquiries.detail.message') }}</p>
                            <p class="text-[14px] text-[#1F2533] whitespace-pre-wrap border-l-[3px] border-[#42AED9] pl-3">
                                {{ selected.message }}
                            </p>
                        </div>

                        <!-- What happens next -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="co-detail-label">{{ $t('superadmin.salesInquiries.colStatus') }}</label>
                                <select v-model="state.form.status" class="co-input mt-1" @change="saveInquiry">
                                    <option v-for="status in allStatuses" :key="status" :value="status">
                                        {{ $t('superadmin.salesInquiries.statuses.' + status) }}
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label class="co-detail-label">{{ $t('superadmin.salesInquiries.colOwner') }}</label>
                                <select v-model="state.form.assigned_user_uuid" class="co-input mt-1"
                                    @change="saveInquiry">
                                    <option value="">{{ $t('superadmin.salesInquiries.nobody') }}</option>
                                    <option v-for="user in state.users" :key="user.uuid" :value="user.uuid">
                                        {{ user.firstname }} {{ user.lastname }}
                                    </option>
                                </select>
                            </div>
                            <div v-if="state.form.status === 'lost'" class="sm:col-span-2">
                                <label class="co-detail-label">{{ $t('superadmin.salesInquiries.detail.lostReason') }}</label>
                                <input v-model="state.form.lost_reason" type="text" class="co-input mt-1"
                                    @blur="saveInquiry" />
                            </div>
                        </div>

                        <!-- Timeline -->
                        <div>
                            <p class="co-detail-label mb-2">{{ $t('superadmin.salesInquiries.detail.timeline') }}</p>
                            <div class="flex items-start gap-2 mb-3">
                                <textarea v-model="state.form.note" rows="2" class="co-input"
                                    :placeholder="$t('superadmin.salesInquiries.detail.notePlaceholder')"></textarea>
                                <FormButton :disabled="state.isSaving || !state.form.note?.trim()" @click="saveNote">
                                    {{ $t('superadmin.salesInquiries.detail.addNote') }}
                                </FormButton>
                            </div>
                            <div v-if="!selected.notes?.length" class="text-[13px] text-[#8891A4]">
                                {{ $t('superadmin.salesInquiries.detail.noNotes') }}
                            </div>
                            <ul v-else class="space-y-2">
                                <li v-for="note in selected.notes" :key="note.uuid"
                                    class="rounded-lg px-3 py-2 text-[13px]"
                                    :class="note.is_system ? 'bg-[#F5F6F8] text-[#5C6478]' : 'bg-white border border-[#EAECF0] text-[#1F2533]'">
                                    <p class="whitespace-pre-wrap">{{ note.body }}</p>
                                    <p class="text-[12px] text-[#8891A4] mt-1">
                                        {{ [note.author, formatDateTime(note.created_at)].filter(Boolean).join(' · ') }}
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="mt-6 flex justify-end">
                        <FormButton buttonStyle="cancel" @click="closeInquiry">{{ $t('close') }}</FormButton>
                    </div>
                </template>
            </Modal>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { salesInquiryService } from '@/components/api/superadmin/SalesInquiryService'
import { userService } from '@/components/api/superadmin/UserService'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { successAlert } = useAlert()

const allStatuses = ['new', 'contacted', 'qualified', 'demo_booked', 'won', 'lost']

// 'open' first, because the inbox is a queue and not an archive: what is left
// to answer is the only reason anybody opens this page.
const statusTabs = [
    { key: 'open', label: 'superadmin.salesInquiries.tabs.open' },
    { key: 'new', label: 'superadmin.salesInquiries.statuses.new' },
    { key: 'contacted', label: 'superadmin.salesInquiries.statuses.contacted' },
    { key: 'qualified', label: 'superadmin.salesInquiries.statuses.qualified' },
    { key: 'demo_booked', label: 'superadmin.salesInquiries.statuses.demo_booked' },
    { key: 'won', label: 'superadmin.salesInquiries.statuses.won' },
    { key: 'lost', label: 'superadmin.salesInquiries.statuses.lost' },
    { key: 'all', label: 'superadmin.salesInquiries.tabs.all' },
]

const state = reactive({
    inquiries: {} as any,
    users: [] as any[],
    error: {} as Error,
    detailError: {} as Error,
    isLoading: false,
    isSaving: false,
    page: 1,
    filters: { status: 'open', assigned: '', search: '' },
    modal: { isDetailOpen: false },
    selected: null as any,
    form: {
        status: 'new',
        assigned_user_uuid: '',
        lost_reason: '',
        note: '',
    },
})

const inquiries = computed(() => state.inquiries?.data ?? [])
const counts = computed<Record<string, number>>(() => state.inquiries?.counts ?? {})
const lastPage = computed(() => state.inquiries?.meta?.last_page ?? 1)
const selected = computed(() => state.selected)

onMounted(async () => {
    await Promise.all([fetchInquiries(), fetchUsers()])

    // The notification mail links straight to one inquiry, so the mail can be
    // acted on without hunting for it in the list.
    if (route.query.inquiry) {
        await openInquiry({ uuid: route.query.inquiry as string })
    }
})

function statusStyle(status: string) {
    const colors: Record<string, string> = {
        new: '#42AED9',
        contacted: '#205E77',
        qualified: '#7C5CBF',
        demo_booked: '#2E9E33',
        won: '#2E9E33',
        lost: '#8891A4',
    }
    const color = colors[status] ?? '#8891A4'

    return `background-color: ${color}1A; color: ${color};`
}

function campaign(inquiry: any) {
    return [inquiry.utm_source, inquiry.utm_medium, inquiry.utm_campaign].filter(Boolean).join(' / ')
}

function formatDate(value: string) {
    return value ? moment(value).format('DD-MM-YYYY') : '-'
}

function formatDateTime(value: string) {
    return value ? moment(value).format('DD-MM-YYYY HH:mm') : '-'
}

function selectStatus(status: string) {
    state.filters.status = status
    state.page = 1
    fetchInquiries()
}

function toggleAssigned(value: string) {
    state.filters.assigned = state.filters.assigned === value ? '' : value
    state.page = 1
    fetchInquiries()
}

function changePage(page: number) {
    state.page = page
    fetchInquiries()
}

async function fetchInquiries() {
    state.isLoading = true
    state.error = {}
    try {
        const params: Record<string, any> = { page: state.page }

        if (state.filters.status && state.filters.status !== 'all') {
            params.status = state.filters.status
        }
        if (state.filters.assigned) {
            params.assigned = state.filters.assigned
        }
        if (state.filters.search?.trim()) {
            params.search = JSON.stringify([state.filters.search.trim()])
        }

        const response = await salesInquiryService.getInquiries(params)
        if (response) {
            state.inquiries = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function fetchUsers() {
    try {
        const response = await userService.getUsers({ per_page: 100 })
        state.users = response?.data ?? []
    } catch (error: any) {
        // A missing colleague list must not keep somebody from reading an
        // inquiry: the assign control is simply empty.
        state.users = []
    }
}

async function openInquiry(inquiry: any) {
    state.detailError = {}
    state.modal.isDetailOpen = true
    try {
        const response = await salesInquiryService.getInquiry(inquiry.uuid)
        state.selected = response?.data ?? null
        state.form = {
            status: state.selected?.status ?? 'new',
            assigned_user_uuid: state.selected?.assigned_user?.uuid ?? '',
            lost_reason: state.selected?.lost_reason ?? '',
            note: '',
        }
    } catch (error: any) {
        state.detailError = error
    }
}

function closeInquiry() {
    state.modal.isDetailOpen = false
    state.selected = null
}

async function saveInquiry() {
    if (!state.selected) return

    state.isSaving = true
    state.detailError = {}
    try {
        const response = await salesInquiryService.updateInquiry(state.selected.uuid, {
            status: state.form.status,
            assigned_user_uuid: state.form.assigned_user_uuid,
            lost_reason: state.form.lost_reason,
        })
        if (response?.data) {
            state.selected = response.data
            successAlert()
            fetchInquiries()
        }
    } catch (error: any) {
        state.detailError = error
    }
    state.isSaving = false
}

async function saveNote() {
    if (!state.selected || !state.form.note?.trim()) return

    state.isSaving = true
    state.detailError = {}
    try {
        const response = await salesInquiryService.addNote(state.selected.uuid, { body: state.form.note.trim() })
        if (response?.data) {
            state.form.note = ''
            const refreshed = await salesInquiryService.getInquiry(state.selected.uuid)
            state.selected = refreshed?.data ?? state.selected
            successAlert()
        }
    } catch (error: any) {
        state.detailError = error
    }
    state.isSaving = false
}
</script>

<style scoped>
/* `co-action-btn` is not in assets/css/superadmin.css - every superadmin page
   that uses one carries its own, and this follows that. */
.co-action-btn {
    @apply inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-[#205E77] bg-white border border-[#D5D9E2] transition-colors;
}

.co-action-btn:hover:not(:disabled) {
    @apply bg-[#F5F6F8];
}

.co-action-btn:disabled {
    @apply text-[#B4BAC7] cursor-not-allowed;
}

.co-detail-label {
    @apply block text-xs font-medium text-[#8891A4];
}

.co-detail-value {
    @apply text-[14px] text-[#1F2533];
}
</style>
