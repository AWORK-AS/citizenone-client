<template>
    <div>
        <NuxtLayout name="superadmin">
            <Head>
                <Title>{{ $t('superadmin.announcements.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.announcements.title') }}</template>

            <div class="p-1">
                <ModulesSuperadminPageHeader :title="$t('superadmin.announcements.title')"
                    :subtitle="$t('superadmin.announcements.intro')">
                    <template #actions>
                        <FormButton v-if="canManage" buttonStyle="primary" @click="openForm()">
                            <Icon name="ph:plus" class="h-4 w-4" /> {{ $t('superadmin.announcements.new') }}
                        </FormButton>
                    </template>
                </ModulesSuperadminPageHeader>

                <div class="mb-4 flex flex-wrap gap-2">
                    <button v-for="filter in filters" :key="filter" type="button" @click="state.filter = filter"
                        class="flex items-center gap-x-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                        :class="state.filter === filter ? 'bg-tertiary/10 text-tertiary' : 'text-gray-500 hover:bg-gray-100'">
                        {{ $t(`superadmin.announcements.filter.${filter}`) }}
                        <span class="rounded-full bg-white/70 px-1.5 text-[11px]">{{ itemsFor(filter).length }}</span>
                    </button>
                </div>

                <Alert type="danger" :text="state.error" v-if="state.error" />

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="!state.isLoading && !visibleItems.length"
                        class="flex flex-col items-center gap-y-2 py-12 text-center text-sm text-ink-body">
                        <Icon name="ph:megaphone" class="h-8 w-8 text-gray-300" />
                        {{ $t('superadmin.announcements.empty') }}
                    </div>
                    <ul class="space-y-3">
                        <li v-for="item in visibleItems" :key="item.uuid"
                            class="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4">
                            <div class="min-w-0 flex-1">
                                <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <span class="co-badge co-badge-navy">{{ $t(`superadmin.announcements.kind.${item.kind}`) }}</span>
                                    <span class="font-semibold text-gray-900">{{ item.title }}</span>
                                    <span class="co-badge" :class="statusClass(item)">{{ $t(`superadmin.announcements.filter.${statusOf(item)}`) }}</span>
                                    <span v-if="item.application" class="co-badge co-badge-blue">{{ item.application.name }}</span>
                                </div>
                                <p class="mt-1 line-clamp-2 text-sm text-gray-600">{{ item.body }}</p>
                                <p class="mt-1 text-xs text-gray-400">
                                    {{ $t(`superadmin.announcements.audience.${item.audience}`) }}
                                    · {{ item.industries?.length ? item.industries.map(industryName).join(', ') : $t('superadmin.announcements.allIndustries') }}
                                    <template v-if="item.starts_at || item.ends_at"> · {{ period(item) }}</template>
                                    <template v-if="item.release_note"> · {{ $t('superadmin.announcements.waitsFor', { title: item.release_note.title }) }}</template>
                                </p>
                                <dl v-if="item.stats" class="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
                                    <div><dt class="inline">{{ $t('superadmin.announcements.stats.seen') }}</dt> <dd class="inline font-semibold text-gray-800">{{ item.stats.seen }}</dd></div>
                                    <div><dt class="inline">{{ $t('superadmin.announcements.stats.clicked') }}</dt> <dd class="inline font-semibold text-gray-800">{{ item.stats.clicked }} ({{ percent(item.stats.clicked, item.stats.seen) }})</dd></div>
                                    <div v-if="item.application"><dt class="inline">{{ $t('superadmin.announcements.stats.trialClicks') }}</dt> <dd class="inline font-semibold text-gray-800">{{ item.stats.trial_clicks }}</dd></div>
                                    <div v-if="item.application"><dt class="inline">{{ $t('superadmin.announcements.stats.askClicks') }}</dt> <dd class="inline font-semibold text-gray-800">{{ item.stats.ask_clicks }}</dd></div>
                                    <div v-if="item.application"><dt class="inline">{{ $t('superadmin.announcements.stats.trialsStarted') }}</dt> <dd class="inline font-semibold text-gray-800">{{ item.stats.trials_started ?? 0 }}</dd></div>
                                    <div v-if="item.send_push"><dt class="inline">{{ $t('superadmin.announcements.stats.pushed') }}</dt> <dd class="inline font-semibold text-gray-800">{{ item.stats.pushed ?? 0 }}</dd></div>
                                    <div v-if="item.send_push"><dt class="inline">{{ $t('superadmin.announcements.stats.pushOpened') }}</dt> <dd class="inline font-semibold text-gray-800">{{ item.stats.push_opened ?? 0 }} ({{ percent(item.stats.push_opened ?? 0, item.stats.pushed ?? 0) }})</dd></div>
                                    <div><dt class="inline">{{ $t('superadmin.announcements.stats.dismissed') }}</dt> <dd class="inline font-semibold text-gray-800">{{ item.stats.dismissed }}</dd></div>
                                </dl>
                            </div>
                            <div v-if="canManage" class="flex flex-none items-center gap-x-2">
                                <FormButton buttonStyle="cancel" buttonSize="sm" @click="togglePublished(item)">
                                    {{ item.status === 'published' ? $t('superadmin.announcements.unpublish') : $t('superadmin.announcements.publish') }}
                                </FormButton>
                                <FormButton buttonStyle="action" buttonSize="sm" @click="openForm(item)" :aria-label="$t('edit')">
                                    <Icon name="ph:pencil-simple" class="h-4 w-4" />
                                </FormButton>
                                <FormButton buttonStyle="danger" buttonSize="sm" @click="confirmDelete(item)" :aria-label="$t('delete')">
                                    <Icon name="ph:trash" class="h-4 w-4" />
                                </FormButton>
                            </div>
                        </li>
                    </ul>
                </LoadingSpinner>
            </div>

            <Modal size="xl" :title="state.selectedItem ? $t('superadmin.announcements.edit') : $t('superadmin.announcements.new')"
                :show="state.showForm" @close="closeForm">
                <template #modal-body>
                    <ModulesSuperadminAnnouncementsForm v-if="state.showForm" :selectedItem="state.selectedItem"
                        :apps="state.apps" :industries="state.industries" :releaseNotes="state.releaseNotes"
                        :error="state.formError" @close="closeForm" @submitForm="saveItem" />
                </template>
            </Modal>

            <DialogConfirmation :isModalOpen="state.deleteOpen" :message="$t('superadmin.announcements.deleteConfirm')"
                @close="state.deleteOpen = false" @confirm="doDelete" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { announcementService } from '@/components/api/superadmin/AnnouncementService'
import { appService } from '@/components/api/superadmin/AppService'
import { industryService } from '@/components/api/superadmin/IndustryService'
import { releaseNoteService } from '@/components/api/superadmin/ReleaseNoteService'
import { useAlert } from '@/composables/alert'
import { usePermissions } from '@/composables/usePermissions'
import { useI18n } from 'vue-i18n'

/**
 * "Nyt fra CitizenOne": try the new app, news and tips, as popups in the app.
 * One channel, so they queue behind each other and a customer gets at most one a day.
 */
const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { can } = usePermissions()
const { t, locale } = useI18n()

const canManage = computed(() => can('manage_content'))

const filters = ['live', 'scheduled', 'draft', 'ended'] as const
type Filter = typeof filters[number]

const state = reactive({
    isLoading: false,
    error: '',
    items: [] as any[],
    apps: [] as any[],
    industries: [] as any[],
    releaseNotes: [] as any[],
    filter: 'live' as Filter,
    showForm: false,
    selectedItem: null as any,
    formError: {} as any,
    deleteOpen: false,
    deleteTarget: null as any,
})

function statusOf(item: any): Filter {
    if (item.status !== 'published') return 'draft'
    const now = Date.now()
    if (item.ends_at && new Date(item.ends_at).getTime() <= now) return 'ended'
    if (item.starts_at && new Date(item.starts_at).getTime() > now) return 'scheduled'
    return 'live'
}

function statusClass(item: any): string {
    return { live: 'co-badge-green', scheduled: 'co-badge-blue', draft: 'co-badge-gray', ended: 'co-badge-gray' }[statusOf(item)]
}

function itemsFor(filter: Filter) {
    return state.items.filter((item: any) => statusOf(item) === filter)
}

const visibleItems = computed(() => itemsFor(state.filter))

onMounted(() => {
    fetchItems()
    fetchOptions()
})

async function fetchItems() {
    state.isLoading = true
    state.error = ''
    try {
        const response = await announcementService.getAnnouncements()
        state.items = response?.data ?? []
    } catch (error: any) {
        state.error = error?.message ?? 'Error'
    }
    state.isLoading = false
}

// The form still works without these: no app means a plain news item or tip.
async function fetchOptions() {
    const [apps, industries, notes] = await Promise.allSettled([
        appService.getApplications({ per_page: 200 }),
        industryService.getAllIndustries(),
        releaseNoteService.getReleaseNotes(),
    ])
    if (apps.status === 'fulfilled') state.apps = (apps.value?.data ?? []).filter((app: any) => app.is_active !== false)
    if (industries.status === 'fulfilled') state.industries = industries.value?.data ?? industries.value ?? []
    if (notes.status === 'fulfilled') state.releaseNotes = notes.value?.data ?? []
}

function industryName(industry: any): string {
    return (locale.value === 'dk' ? industry.dk_name : industry.en_name) || industry.en_name || industry.dk_name
}

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: 'numeric' })
}

function period(item: any): string {
    const from = item.starts_at ? formatDate(item.starts_at) : ''
    const to = item.ends_at ? formatDate(item.ends_at) : ''
    return `${from}${from || to ? ' – ' : ''}${to}`
}

function percent(part: number, whole: number): string {
    return whole > 0 ? `${Math.round((part / whole) * 100)} %` : '–'
}

function openForm(item: any = null) {
    state.selectedItem = item
    state.formError = {}
    state.showForm = true
}

function closeForm() {
    state.showForm = false
    state.selectedItem = null
}

async function saveItem(form: FormData) {
    state.formError = {}
    try {
        if (state.selectedItem) {
            form.append('_method', 'PUT')
            await announcementService.updateAnnouncement(state.selectedItem.uuid, form)
        } else {
            await announcementService.createAnnouncement(form)
            state.filter = 'draft'
        }
        closeForm()
        successAlert(`${t('alert.success')}!`, '')
        fetchItems()
    } catch (error: any) {
        state.formError = error
    }
}

async function togglePublished(item: any) {
    state.error = ''
    try {
        if (item.status === 'published') {
            await announcementService.unpublishAnnouncement(item.uuid)
        } else {
            await announcementService.publishAnnouncement(item.uuid)
        }
        fetchItems()
    } catch (error: any) {
        state.error = error?.message ?? 'Error'
    }
}

function confirmDelete(item: any) {
    state.deleteTarget = item
    state.deleteOpen = true
}

async function doDelete() {
    state.deleteOpen = false
    try {
        await announcementService.deleteAnnouncement(state.deleteTarget.uuid)
        fetchItems()
    } catch (error: any) {
        state.error = error?.message ?? 'Error'
    }
}
</script>
