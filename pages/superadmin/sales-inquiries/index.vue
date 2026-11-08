<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.salesInquiries.pageTitle') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.salesInquiries.pageTitle') }}</template>

            <div class="p-1">
                <ModulesSuperadminPageHeader :title="$t('superadmin.salesInquiries.pageTitle')"
                    :subtitle="$t('superadmin.salesInquiries.description')">
                    <template #actions>
                        <!-- List or board. The board is the same inquiries in the
                             same statuses; what it adds is moving one by hand. -->
                        <div class="inline-flex rounded-lg border border-line-strong overflow-hidden bg-white">
                            <button v-for="view in ['list', 'board']" :key="view" @click="selectView(view)" :class="[
                                'inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium transition-colors',
                                state.view === view ? 'bg-tertiary text-white' : 'text-ink-body hover:bg-surface-canvas',
                            ]">
                                <Icon :name="view === 'list' ? 'ph:list' : 'ph:columns'" class="w-4 h-4" />
                                {{ $t('superadmin.salesInquiries.views.' + view) }}
                            </button>
                        </div>
                        <!-- `.co-input` carries `w-full` and its own horizontal
                             padding, so the width comes from this wrapper and the
                             room for the icon from an inline value: a utility
                             class on the input loses to the global stylesheet. -->
                        <div class="relative w-80 shrink-0">
                            <Icon name="ph:magnifying-glass"
                                class="w-4 h-4 absolute left-[13px] top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
                            <input v-model="list.searchInput.value" type="search" class="co-input"
                                style="padding-left: 38px"
                                :placeholder="$t('superadmin.salesInquiries.searchPlaceholder')"
                                :aria-label="$t('superadmin.salesInquiries.searchPlaceholder')"
                                @keyup.enter="list.flushSearch" @search="list.flushSearch" />
                        </div>
                        <button class="co-action-btn" @click="openColumnSettings">
                            <Icon name="ph:palette" class="w-3.5 h-3.5" />
                            {{ $t('superadmin.salesInquiries.columns.button') }}
                        </button>
                        <button class="co-action-btn" @click="list.reload">
                            <Icon name="ph:arrows-clockwise" class="w-3.5 h-3.5" />
                            {{ $t('superadmin.salesInquiries.refresh') }}
                        </button>
                    </template>
                </ModulesSuperadminPageHeader>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error?.message?.length > 0" />

                <div class="flex items-center gap-1 flex-wrap mb-4">
                    <!-- Status tabs belong to the list. On the board every status
                         is a column already, and filtering to one would leave a
                         board with a single column. -->
                    <template v-if="state.view === 'list'">
                        <button v-for="tab in statusTabs" :key="tab.key" @click="selectStatus(tab.key)" :class="[
                            'px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-colors',
                            list.state.filters.status === tab.key
                                ? 'bg-tertiary text-white border-tertiary'
                                : 'bg-white text-ink-body border-line-strong hover:bg-surface-canvas',
                        ]">
                            {{ tabLabel(tab) }}
                            <span v-if="counts[tab.key] !== undefined" class="ml-1 opacity-70">{{ counts[tab.key] }}</span>
                        </button>

                        <span class="w-px h-6 bg-line mx-2"></span>
                    </template>

                    <button @click="toggleAssigned('unassigned')" :class="[
                        'px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-colors',
                        list.state.filters.assigned === 'unassigned'
                            ? 'bg-accent text-white border-accent'
                            : 'bg-white text-ink-body border-line-strong hover:bg-surface-canvas',
                    ]">
                        {{ $t('superadmin.salesInquiries.unassigned') }}
                        <span v-if="counts.unassigned !== undefined" class="ml-1 opacity-70">{{ counts.unassigned }}</span>
                    </button>
                    <button @click="toggleAssigned('me')" :class="[
                        'px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-colors',
                        list.state.filters.assigned === 'me'
                            ? 'bg-accent text-white border-accent'
                            : 'bg-white text-ink-body border-line-strong hover:bg-surface-canvas',
                    ]">
                        {{ $t('superadmin.salesInquiries.mine') }}
                    </button>
                </div>

                <div class="flex items-center gap-1 flex-wrap mb-4">
                    <!-- Kilden står på sin egen række. Den krydser status og ejerskab frem for at
                         erstatte dem: "prisforespørgsler uden ejer" er det, salget faktisk leder
                         efter, og det kan kun lade sig gøre, når de tre rækker er uafhængige. -->
                    <span class="text-[13px] text-ink-muted mr-1">{{ $t('superadmin.salesInquiries.sourceLabel') }}</span>

                    <button v-for="tab in sourceTabs" :key="tab.key" @click="toggleSource(tab.key)" :class="[
                        'px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-colors',
                        list.state.filters.source === tab.key
                            ? 'bg-accent-soft text-tertiary border-accent'
                            : 'bg-white text-ink-body border-line-strong hover:bg-surface-canvas',
                    ]">
                        {{ tabLabel(tab) }}
                        <span v-if="sourceCounts[tab.key] !== undefined" class="ml-1 opacity-70">{{ sourceCounts[tab.key] }}</span>
                    </button>
                </div>

                <!-- BOARD -->
                <div v-if="state.view === 'board' && state.isLoading" class="flex justify-center py-16">
                    <Icon name="ph:spinner" class="w-7 h-7 text-accent animate-spin" />
                </div>
                <div v-else-if="state.view === 'board'" class="overflow-x-auto pb-3">
                    <div class="flex items-start gap-3 min-w-max">
                        <div v-for="status in orderedStatuses" :key="status"
                            class="w-[280px] shrink-0 rounded-xl border transition-colors"
                            :class="state.dragOverStatus === status
                                ? 'border-accent bg-accent-soft'
                                : 'border-line bg-surface-subtle'"
                            @dragover.prevent="state.dragOverStatus = status" @dragleave="onDragLeave(status)"
                            @drop.prevent="dropOn(status)">
                            <!-- The colour is the column's, so a board scanned
                                 from across the room still says which stage is
                                 which. -->
                            <div class="flex items-center justify-between px-3 py-2.5 border-b-2 rounded-t-xl"
                                :style="`border-bottom-color: ${colorFor(status)}; background-color: ${colorFor(status)}14;`">
                                <span class="text-[13px] font-semibold flex items-center gap-2"
                                    :style="`color: ${colorFor(status)};`">
                                    <span class="w-2 h-2 rounded-full inline-block"
                                        :style="`background-color: ${colorFor(status)};`"></span>
                                    {{ labelFor(status) }}
                                </span>
                                <span class="text-[12px] text-ink-muted">{{ (grouped[status] || []).length }}</span>
                            </div>

                            <div class="p-2 space-y-2 min-h-[120px]">
                                <p v-if="!(grouped[status] || []).length" class="text-[12px] text-ink-subtle px-1 py-3">
                                    {{ $t('superadmin.salesInquiries.dropHere') }}
                                </p>

                                <article v-for="inquiry in grouped[status]" :key="inquiry.uuid" draggable="true"
                                    @dragstart="state.draggedUuid = inquiry.uuid" @dragend="state.draggedUuid = null"
                                    @click="openInquiry(inquiry)"
                                    class="bg-white border border-line rounded-lg p-3 shadow-sm cursor-pointer hover:border-accent transition-colors"
                                    :class="state.draggedUuid === inquiry.uuid && 'opacity-50'">
                                    <p class="text-[13px] font-semibold text-ink leading-snug">
                                        {{ inquiry.company_name || inquiry.name || inquiry.email }}
                                    </p>
                                    <p v-if="inquiry.name || inquiry.email" class="text-[12px] text-ink-muted mt-0.5">
                                        {{ [inquiry.name, inquiry.email].filter(Boolean).join(' · ') }}
                                    </p>

                                    <p class="text-[12px] text-ink-body mt-2">
                                        {{ $t('superadmin.salesInquiries.sources.' + inquiry.source) }}
                                    </p>

                                    <!-- When they filled in the form, to the minute, and
                                         which page they were on when they did. -->
                                    <p class="text-[12px] text-ink-muted mt-1 flex items-center gap-1">
                                        <Icon name="ph:clock" class="w-3.5 h-3.5 shrink-0" />
                                        {{ formatDateTime(inquiry.created_at) }}
                                    </p>
                                    <p v-if="inquiry.landing_page"
                                        class="text-[12px] mt-1 flex items-center gap-1 text-tertiary">
                                        <Icon name="ph:link-simple" class="w-3.5 h-3.5 shrink-0" />
                                        <a :href="inquiry.landing_page" target="_blank" rel="noopener"
                                            :title="inquiry.landing_page" class="underline truncate"
                                            @click.stop>{{ shortPath(inquiry.landing_page) }}</a>
                                    </p>

                                    <p class="text-[12px] text-ink-muted mt-2 pt-2 border-t border-surface-canvas">
                                        {{ inquiry.assigned_user?.name || $t('superadmin.salesInquiries.nobody') }}
                                    </p>
                                </article>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- LIST. The filters above serve the board too, so the table brings only
                     its count, export, rows and pager. -->
                <ModulesSuperadminDataTable v-else :columns="columns" :rows="inquiries" rowKey="uuid"
                    :loading="state.isLoading" :error="state.loadError" :meta="meta" :searchable="false"
                    :filtered="list.isFiltered.value" clickable emptyIcon="ph:tray"
                    :emptyTitle="$t('superadmin.salesInquiries.empty')"
                    :exportName="$t('superadmin.salesInquiries.pageTitle')" :exportPage="exportPage"
                    :exportColumns="exportColumns"
                    @page="list.setPage" @reset="list.reset" @retry="list.reload" @row-click="openInquiry">
                    <template #cell-who="{ row: inquiry }">
                        <p class="text-[13px] font-semibold text-ink">
                            {{ inquiry.company_name || inquiry.name || inquiry.email }}
                        </p>
                        <p class="text-[12px] text-ink-muted">
                            {{ [inquiry.name, inquiry.email, inquiry.phone].filter(Boolean).join(' · ') }}
                        </p>
                    </template>
                    <template #cell-source="{ row: inquiry }">
                        {{ $t('superadmin.salesInquiries.sources.' + inquiry.source) }}
                    </template>
                    <template #cell-landing_page="{ row: inquiry }">
                        <a v-if="inquiry.landing_page" :href="inquiry.landing_page" target="_blank"
                            rel="noopener" :title="inquiry.landing_page" class="text-tertiary underline">
                            {{ shortPath(inquiry.landing_page) }}
                        </a>
                        <span v-else class="text-ink-subtle">-</span>
                    </template>
                    <template #cell-status="{ row: inquiry }">
                        <span class="px-2 py-0.5 rounded-full text-[12px] font-medium"
                            :style="statusStyle(inquiry.status)">
                            {{ labelFor(inquiry.status) }}
                        </span>
                    </template>
                    <template #cell-owner="{ row: inquiry }">
                        {{ inquiry.assigned_user?.name || $t('superadmin.salesInquiries.nobody') }}
                    </template>
                    <!-- The time matters as much as the day: it is what
                         says whether somebody wrote in during our hours. -->
                    <template #cell-created_at="{ row: inquiry }">
                        <span class="whitespace-nowrap">{{ formatDateTime(inquiry.created_at) }}</span>
                    </template>
                    <template #cell-actions="{ row: inquiry }">
                        <div class="flex justify-end">
                            <button class="co-action-btn" @click.stop="openInquiry(inquiry)">
                                <Icon name="ph:arrow-right" class="w-3.5 h-3.5" />
                                {{ $t('superadmin.salesInquiries.open') }}
                            </button>
                        </div>
                    </template>
                </ModulesSuperadminDataTable>
            </div>

            <!-- COLUMNS: what each stage is called and what colour it has -->
            <Modal size="md" :show="state.modal.isColumnsOpen" @close="state.modal.isColumnsOpen = false"
                :title="$t('superadmin.salesInquiries.columns.title')">
                <template #modal-body>
                    <p class="text-[13px] text-ink-body mb-4">
                        {{ $t('superadmin.salesInquiries.columns.description') }}
                    </p>

                    <Alert type="danger" :text="state.columnsError?.message"
                        v-if="state.columnsError?.message && state.columnsError?.message?.length > 0" />

                    <ul class="space-y-2">
                        <li v-for="(column, index) in state.columnsForm" :key="column.status"
                            class="flex items-center gap-2 bg-surface-subtle border border-line rounded-lg p-2">
                            <div class="flex flex-col">
                                <button class="co-order-btn" :disabled="index === 0" @click="moveColumn(index, -1)">
                                    <Icon name="ph:caret-up" class="w-3 h-3" />
                                </button>
                                <button class="co-order-btn" :disabled="index === state.columnsForm.length - 1"
                                    @click="moveColumn(index, 1)">
                                    <Icon name="ph:caret-down" class="w-3 h-3" />
                                </button>
                            </div>

                            <input type="color" v-model="column.color" class="w-9 h-9 rounded-lg border border-line-strong bg-white p-0.5 cursor-pointer shrink-0"
                                :title="$t('superadmin.salesInquiries.columns.colour')" />

                            <div class="flex-1 min-w-0">
                                <input v-model="column.label" type="text" class="co-input"
                                    :placeholder="$t('superadmin.salesInquiries.statuses.' + column.status)" />
                            </div>

                            <!-- `.co-input` carries `w-full`, so the width has to
                                 be on a wrapper: a utility class on the input
                                 itself loses to the global stylesheet. -->
                            <div class="w-28 shrink-0">
                                <input v-model="column.color" type="text" maxlength="7"
                                    class="co-input font-mono text-[12px] uppercase" placeholder="#2E9E33" />
                            </div>
                        </li>
                    </ul>

                    <div class="mt-5 flex items-center justify-between gap-2">
                        <button class="co-action-btn" @click="resetColumns">
                            <Icon name="ph:arrow-counter-clockwise" class="w-3.5 h-3.5" />
                            {{ $t('superadmin.salesInquiries.columns.reset') }}
                        </button>
                        <div class="flex gap-2">
                            <FormButton buttonStyle="cancel" @click="state.modal.isColumnsOpen = false">
                                {{ $t('close') }}
                            </FormButton>
                            <FormButton :disabled="state.isSavingColumns" @click="saveColumns">
                                {{ $t('superadmin.salesInquiries.columns.save') }}
                            </FormButton>
                        </div>
                    </div>
                </template>
            </Modal>

            <!-- DETAIL -->
            <Modal size="lg" :show="state.modal.isDetailOpen" @close="closeInquiry"
                :title="selected?.company_name || selected?.name || selected?.email">
                <template #modal-body>
                    <Alert type="danger" :text="state.detailError?.message"
                        v-if="state.detailError?.message && state.detailError?.message?.length > 0" />

                    <div v-if="selected" class="space-y-5">
                        <!-- What we know -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-subtle rounded-xl p-4">
                            <div v-if="selected.name">
                                <p class="co-detail-label">{{ $t('superadmin.salesInquiries.detail.name') }}</p>
                                <p class="co-detail-value">{{ selected.name }}</p>
                            </div>
                            <div v-if="selected.email">
                                <p class="co-detail-label">{{ $t('superadmin.salesInquiries.detail.email') }}</p>
                                <a class="co-detail-value text-tertiary underline" :href="'mailto:' + selected.email">
                                    {{ selected.email }}
                                </a>
                            </div>
                            <div v-if="selected.phone">
                                <p class="co-detail-label">{{ $t('superadmin.salesInquiries.detail.phone') }}</p>
                                <a class="co-detail-value text-tertiary underline" :href="'tel:' + selected.phone">
                                    {{ selected.phone }}
                                </a>
                            </div>
                            <div>
                                <p class="co-detail-label">{{ $t('superadmin.salesInquiries.detail.receivedAt') }}</p>
                                <p class="co-detail-value">{{ formatDateTime(selected.created_at) }}</p>
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
                            <div v-if="selected.landing_page" class="sm:col-span-2">
                                <p class="co-detail-label">{{ $t('superadmin.salesInquiries.detail.page') }}</p>
                                <a class="co-detail-value text-tertiary underline break-all"
                                    :href="selected.landing_page" target="_blank" rel="noopener">
                                    {{ selected.landing_page }}
                                </a>
                            </div>
                            <div v-if="selected.referrer" class="sm:col-span-2">
                                <p class="co-detail-label">{{ $t('superadmin.salesInquiries.detail.referrer') }}</p>
                                <p class="co-detail-value break-all">{{ selected.referrer }}</p>
                            </div>
                            <div v-if="campaign(selected)" class="sm:col-span-2">
                                <p class="co-detail-label">{{ $t('superadmin.salesInquiries.detail.campaign') }}</p>
                                <p class="co-detail-value">{{ campaign(selected) }}</p>
                            </div>
                        </div>

                        <div v-if="selected.message">
                            <p class="co-detail-label mb-1">{{ $t('superadmin.salesInquiries.detail.message') }}</p>
                            <p class="text-[14px] text-ink whitespace-pre-wrap border-l-[3px] border-accent pl-3">
                                {{ selected.message }}
                            </p>
                        </div>

                        <!-- What happens next -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="co-detail-label">{{ $t('superadmin.salesInquiries.colStatus') }}</label>
                                <select v-model="state.form.status" class="co-input mt-1" @change="saveInquiry">
                                    <option v-for="status in orderedStatuses" :key="status" :value="status">
                                        {{ labelFor(status) }}
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

                        <!-- A demo as an online meeting: the prospect gets the link. -->
                        <ModulesSuperadminSalesMeetingsPanel :inquiryUuid="selected.uuid"
                            :inquiryGuest="[selected.name, selected.email].filter(Boolean).join(' · ')"
                            :suggestedAt="selected.preferred_at" :canPlan="canPlanMeetings && !!selected.email"
                            :defaultTitle="`CitizenOne demo · ${selected.company_name || selected.name || ''}`"
                            @scheduled="refreshSelected" />

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
                            <div v-if="!selected.notes?.length" class="text-[13px] text-ink-muted">
                                {{ $t('superadmin.salesInquiries.detail.noNotes') }}
                            </div>
                            <ul v-else class="space-y-2">
                                <li v-for="note in selected.notes" :key="note.uuid"
                                    class="rounded-lg px-3 py-2 text-[13px]"
                                    :class="note.is_system ? 'bg-surface-canvas text-ink-body' : 'bg-white border border-line text-ink'">
                                    <p class="whitespace-pre-wrap">{{ note.body }}</p>
                                    <p class="text-[12px] text-ink-muted mt-1">
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
import { SA_COLORS } from '@/utils/superadminPalette'
import moment from 'moment'
import { salesInquiryService } from '@/components/api/superadmin/SalesInquiryService'
import { userService } from '@/components/api/superadmin/UserService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import { usePermissions } from '@/composables/usePermissions'
import { useListQuery } from '@/composables/useListQuery'
import { normalizePageMeta, responseRows, type DataTableColumn } from '@/composables/dataTable'
import type { CsvColumn } from '@/composables/csvExport'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { successAlert } = useAlert()
const { t } = useI18n()

const allStatuses = ['new', 'contacted', 'qualified', 'demo_booked', 'won', 'lost']

// The board holds every inquiry at once, so it asks for one big page instead of
// ten at a time. The backend caps this, and a column that is genuinely longer
// than the cap is a queue nobody is working anyway.
const BOARD_PAGE_SIZE = 200

// 'open' first, because the inbox is a queue and not an archive: what is left
// to answer is the only reason anybody opens this page.
/*
 * Kilderne, i den rækkefølge salget møder dem.
 *
 * Filteret har ligget i backenden hele tiden, se `SalesInquiryFilter::source`, og websitet har
 * sendt kilden med ved hver videresendelse. Det, der manglede, var en vej til det på skærmen.
 *
 * Etiketterne er dem, kolonnen "Type" i forvejen bruger. To ord for det samme - "Prisberegning" i
 * en kolonne og "Prisforespørgsler" i en fane lige over den - er to ting at lære for den, der
 * kigger, og de betyder ét.
 */
const sourceTabs = [
    { key: 'price_quote', label: 'superadmin.salesInquiries.sources.price_quote' },
    { key: 'book_demo', label: 'superadmin.salesInquiries.sources.book_demo' },
    { key: 'contact', label: 'superadmin.salesInquiries.sources.contact' },
    { key: 'quick_ask', label: 'superadmin.salesInquiries.sources.quick_ask' },
    { key: 'trial', label: 'superadmin.salesInquiries.sources.trial' },
    { key: 'other', label: 'superadmin.salesInquiries.sources.other' },
]

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
    loadError: null as string | null,
    detailError: {} as Error,
    isLoading: false,
    isSaving: false,
    view: 'list' as 'list' | 'board',
    modal: { isDetailOpen: false, isColumnsOpen: false },
    selected: null as any,
    // How each stage is presented. Empty until the first fetch, and the
    // fallbacks below are what the board draws in the meantime.
    statusSettings: [] as any[],
    columnsForm: [] as any[],
    columnsError: {} as Error,
    isSavingColumns: false,
    draggedUuid: null as string | null,
    dragOverStatus: null as string | null,
    form: {
        status: 'new',
        assigned_user_uuid: '',
        lost_reason: '',
        note: '',
    },
})

// Status, owner, source, search and page live in the URL; `?inquiry=` (the
// notification mail's link) sits next to them untouched. The view is a
// preference and stays in localStorage.
const list = useListQuery({
    filters: { status: 'open', assigned: '', source: '' },
    onChange: fetchInquiries,
    // The first load waits for the stored view, or the board would load as a list first.
    immediate: false,
})

const inquiries = computed(() => state.inquiries?.data ?? [])
const meta = computed(() => normalizePageMeta(state.inquiries))

const columns = computed<DataTableColumn[]>(() => [
    { key: 'who', label: t('superadmin.salesInquiries.colWho') },
    { key: 'source', label: t('superadmin.salesInquiries.colType') },
    { key: 'landing_page', label: t('superadmin.salesInquiries.colPage') },
    { key: 'status', label: t('superadmin.salesInquiries.colStatus') },
    { key: 'owner', label: t('superadmin.salesInquiries.colOwner') },
    { key: 'created_at', label: t('superadmin.salesInquiries.colReceived') },
    { key: 'actions', label: '', align: 'right' },
])

const exportColumns = computed<CsvColumn[]>(() => [
    { label: t('superadmin.salesInquiries.colWho'), value: i => i?.company_name || i?.name || i?.email },
    { label: t('superadmin.salesInquiries.detail.name'), value: i => i?.name },
    { label: t('superadmin.salesInquiries.detail.email'), value: i => i?.email },
    { label: t('superadmin.salesInquiries.detail.phone'), value: i => i?.phone },
    { label: t('superadmin.salesInquiries.colType'), value: i => (i?.source ? t('superadmin.salesInquiries.sources.' + i.source) : '') },
    { label: t('superadmin.salesInquiries.colPage'), value: i => i?.landing_page },
    { label: t('superadmin.salesInquiries.colStatus'), value: i => labelFor(i?.status) },
    { label: t('superadmin.salesInquiries.colOwner'), value: i => i?.assigned_user?.name },
    { label: t('superadmin.salesInquiries.colReceived'), value: i => i?.created_at, type: 'datetime' },
])
const counts = computed<Record<string, number>>(() => state.inquiries?.counts ?? {})

/** Tallene pr. kilde. Tomme kilder står med som 0, så en fane ikke forsvinder en stille måned. */
const sourceCounts = computed<Record<string, number>>(() => state.inquiries?.sourceCounts ?? {})
const selected = computed(() => state.selected)

/** The board's columns: the same rows, in the status they are in. */
const grouped = computed<Record<string, any[]>>(() => {
    const columns: Record<string, any[]> = {}

    for (const status of allStatuses) {
        columns[status] = []
    }

    for (const inquiry of inquiries.value) {
        (columns[inquiry.status] ??= []).push(inquiry)
    }

    return columns
})

onMounted(async () => {
    // Which view somebody works in is a preference, and asking them to pick it
    // again on every visit is the kind of small rudeness that adds up.
    try {
        const stored = localStorage.getItem('salesInquiriesView')
        if (stored === 'board' || stored === 'list') {
            state.view = stored
        }
    } catch {
        // A browser that refuses storage still gets the list.
    }

    await Promise.all([list.start(), fetchUsers(), fetchStatusSettings()])

    // The notification mail links straight to one inquiry, so the mail can be
    // acted on without hunting for it in the list.
    if (route.query.inquiry) {
        await openInquiry({ uuid: route.query.inquiry as string })
    }
})

function selectView(view: string) {
    if (state.view === view) return

    state.view = view as 'list' | 'board'

    try {
        localStorage.setItem('salesInquiriesView', state.view)
    } catch {
        // Not being able to remember it is not a reason to refuse the switch.
    }

    if (list.state.page !== 1) list.setPage(1)
    else fetchInquiries()
}

// What a stage looks like before the settings have loaded, and if they ever
// fail to: a board with no colours is worse than a board with these.
const FALLBACK_COLORS: Record<string, string> = {
    new: SA_COLORS.accent,
    contacted: SA_COLORS.primary,
    qualified: SA_COLORS.plum,
    demo_booked: SA_COLORS.success,
    won: SA_COLORS.success,
    lost: SA_COLORS.inkMuted,
}

/**
 * A toast that says which thing was saved. `successAlert` takes a title and a
 * text, and calling it with neither - as this page first did - draws an empty
 * green bar.
 */
function saved(key: 'updated' | 'noteAdded' | 'columnsSaved') {
    successAlert(`${t('alert.success')}!`, `${t('superadmin.salesInquiries.alert.' + key)}.`)
}

const settingFor = (status: string) => state.statusSettings.find((s: any) => s.status === status)

/** The columns in the order the team put them in. */
const orderedStatuses = computed<string[]>(() =>
    state.statusSettings.length
        ? state.statusSettings.map((s: any) => s.status)
        : allStatuses
)

/**
 * A stage's name: what the team called it, or the translated default. A custom
 * name is one name for everybody - somebody who renames New to "Ny" means it in
 * every language, and inventing translations for their word would be worse.
 */
function labelFor(status: string) {
    return settingFor(status)?.label || t('superadmin.salesInquiries.statuses.' + status)
}

function colorFor(status: string) {
    return settingFor(status)?.color || FALLBACK_COLORS[status] || SA_COLORS.inkMuted
}

function tabLabel(tab: { key: string; label: string }) {
    return allStatuses.includes(tab.key) ? labelFor(tab.key) : t(tab.label)
}

function statusStyle(status: string) {
    const color = colorFor(status)

    return `background-color: ${color}1A; color: ${color};`
}

function campaign(inquiry: any) {
    return [inquiry.utm_source, inquiry.utm_medium, inquiry.utm_campaign].filter(Boolean).join(' / ')
}

function formatDateTime(value: string) {
    return value ? moment(value).format('DD-MM-YYYY HH:mm') : '-'
}

/**
 * The page they were on, short enough to read in a table cell. The full URL is
 * the link target and the title, so nothing is lost by shortening it.
 */
function shortPath(url: string) {
    if (!url) return '-'

    try {
        const parsed = new URL(url, 'https://www.citizenone.dk')
        const path = parsed.pathname === '/' ? '/' : parsed.pathname.replace(/\/$/, '')

        return path + (parsed.search ? parsed.search : '')
    } catch {
        return url
    }
}

function selectStatus(status: string) {
    list.setFilter('status', status)
}

/** Et klik på den valgte fane slår den fra igen, som de to knapper for ejerskab ved siden af. */
function toggleSource(value: string) {
    list.setFilter('source', list.state.filters.source === value ? '' : value)
}

function toggleAssigned(value: string) {
    list.setFilter('assigned', list.state.filters.assigned === value ? '' : value)
}

function inquiryParams(page: number, perPage?: number) {
    const filters = list.state.filters
    const params: Record<string, any> = { page }

    if (perPage) {
        params.per_page = perPage
    }
    if (state.view !== 'board' && filters.status && filters.status !== 'all') {
        params.status = filters.status
    }
    if (filters.assigned) {
        params.assigned = filters.assigned
    }
    if (filters.source) {
        params.source = filters.source
    }
    // The whole phrase as one entry, as this page has always sent it.
    if (list.state.search?.trim()) {
        params.search = JSON.stringify([list.state.search.trim()])
    }

    return params
}

let requestSeq = 0

async function fetchInquiries() {
    const seq = ++requestSeq
    const board = state.view === 'board'
    state.isLoading = true
    state.error = {}
    state.loadError = null
    try {
        // The board is one big page and has no pager.
        const response = await salesInquiryService.getInquiries(
            board ? inquiryParams(1, BOARD_PAGE_SIZE) : inquiryParams(list.state.page))
        if (seq !== requestSeq) return
        if (response) {
            state.inquiries = response
        }
    } catch (error: any) {
        if (seq !== requestSeq) return
        if (board) state.error = error
        else state.loadError = error?.message || t('superadmin.dataTable.errorTitle')
    }
    if (seq === requestSeq) state.isLoading = false
}

// The board's own page size is the biggest the API takes, so the export asks for it too.
async function exportPage(page: number) {
    const response = await salesInquiryService.getInquiries(inquiryParams(page, BOARD_PAGE_SIZE))
    const pageMeta = normalizePageMeta(response)
    return { rows: responseRows(response), lastPage: pageMeta?.lastPage ?? 1, total: pageMeta?.total ?? 0 }
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

async function fetchStatusSettings() {
    try {
        const response = await salesInquiryService.getStatusSettings()
        state.statusSettings = response?.data ?? []
    } catch (error: any) {
        // The board still draws, in the default colours: a settings endpoint
        // that is unavailable must not take the inbox with it.
        state.statusSettings = []
    }
}

function openColumnSettings() {
    state.columnsError = {}
    state.columnsForm = orderedStatuses.value.map((status) => ({
        status,
        label: settingFor(status)?.label ?? '',
        color: colorFor(status),
    }))
    state.modal.isColumnsOpen = true
}

function moveColumn(index: number, direction: number) {
    const target = index + direction
    if (target < 0 || target >= state.columnsForm.length) return

    const columns = state.columnsForm
    ;[columns[index], columns[target]] = [columns[target], columns[index]]
}

/** Back to code's own names and colours: an empty label and the default hex. */
function resetColumns() {
    state.columnsForm = allStatuses.map((status) => ({
        status,
        label: '',
        color: FALLBACK_COLORS[status],
    }))
}

async function saveColumns() {
    state.isSavingColumns = true
    state.columnsError = {}
    try {
        const response = await salesInquiryService.saveStatusSettings({
            statuses: state.columnsForm.map((column: any, index: number) => ({
                status: column.status,
                label: column.label,
                color: (column.color || '').trim().toUpperCase(),
                sort_order: index,
            })),
        })
        if (response?.data) {
            state.statusSettings = response.data
            state.modal.isColumnsOpen = false
            saved('columnsSaved')
        }
    } catch (error: any) {
        state.columnsError = error
    }
    state.isSavingColumns = false
}

function onDragLeave(status: string) {
    if (state.dragOverStatus === status) {
        state.dragOverStatus = null
    }
}

/**
 * Dropping a card in another column is the same status change the detail panel
 * makes, so it writes the same line in the timeline. The card is moved in place
 * first and the list refetched after, so the board does not jump under the
 * hand that just moved something.
 */
async function dropOn(status: string) {
    const uuid = state.draggedUuid
    state.dragOverStatus = null
    state.draggedUuid = null

    if (!uuid) return

    const card = inquiries.value.find((inquiry: any) => inquiry.uuid === uuid)
    if (!card || card.status === status) return

    const previous = card.status
    card.status = status

    try {
        await salesInquiryService.updateInquiry(uuid, { status })
        saved('updated')
        fetchInquiries()
    } catch (error: any) {
        card.status = previous
        state.error = error
    }
}

// Planning a meeting moves the inquiry to Demo booked and writes the
// timeline, so the open inquiry is read again.
const { can } = usePermissions()
const canPlanMeetings = computed(() => can('manage_sales_inquiries'))

async function refreshSelected() {
    if (!state.selected) return
    try {
        const response = await salesInquiryService.getInquiry(state.selected.uuid)
        state.selected = response?.data ?? state.selected
        state.form.status = state.selected?.status ?? state.form.status
    } catch (error: any) {
        state.detailError = error
    }
    fetchInquiries()
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
            saved('updated')
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
            saved('noteAdded')
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
    @apply inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-tertiary bg-white border border-line-strong transition-colors;
}

.co-action-btn:hover:not(:disabled) {
    @apply bg-surface-canvas;
}

.co-action-btn:disabled {
    @apply text-ink-subtle cursor-not-allowed;
}

.co-order-btn {
    @apply flex items-center justify-center w-5 h-4 text-ink-muted rounded transition-colors;
}

.co-order-btn:hover:not(:disabled) {
    @apply text-tertiary bg-line;
}

.co-order-btn:disabled {
    @apply text-line-strong cursor-not-allowed;
}

.co-detail-label {
    @apply block text-xs font-medium text-ink-muted;
}

.co-detail-value {
    @apply text-[14px] text-ink;
}
</style>
