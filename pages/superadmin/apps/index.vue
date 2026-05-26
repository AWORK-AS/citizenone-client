<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>Apps - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>Apps</template>

            <div class="p-1">
                <!-- Header -->
                <div class="flex items-center justify-between mb-5">
                    <h1 class="text-[22px] font-semibold text-[#1F2533]">
                        {{ $t('superadmin.apps.pageTitle') }}
                    </h1>
                    <button @click="showNewAppSlider = true"
                        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-[#205E77] bg-white border border-[#D5D9E2] hover:bg-[#F5F6F8] shadow-sm transition-colors">
                        <Icon name="ph:plus" class="w-4 h-4" />
                        {{ $t('superadmin.apps.newApp') }}
                    </button>
                </div>

                <!-- Search -->
                <div class="flex flex-wrap items-center gap-3 mb-4">
                    <SuperadminTableSearch v-model="searchQuery"
                        :placeholder="$t('superadmin.apps.searchPlaceholder')"
                        @input="debouncedSearch" />
                </div>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error?.message?.length > 0" />

                <div v-if="state.isLoading" class="flex justify-center py-16">
                    <Icon name="ph:spinner" class="w-7 h-7 text-[#42AED9] animate-spin" />
                </div>

                <!-- List -->
                <div v-else class="bg-white border border-[#EAECF0] rounded-xl overflow-hidden shadow-sm">
                    <div v-if="!filteredApps.length"
                        class="flex flex-col items-center gap-3 py-16 text-[#8891A4]">
                        <Icon name="ph:squares-four" class="w-12 h-12 opacity-30" />
                        <p class="text-sm">{{ $t('superadmin.apps.noAppsFound') }}</p>
                    </div>
                    <table v-else class="w-full">
                        <thead>
                            <tr class="border-b border-[#EAECF0] bg-[#F9FAFB]">
                                <th class="co-th">
                                    <div class="flex items-center gap-1">
                                        {{ $t('superadmin.apps.colName') }}
                                        <Icon name="ph:arrows-down-up" class="w-3 h-3 text-[#B0B8C4]" />
                                    </div>
                                </th>
                                <th class="co-th">
                                    <div class="flex items-center gap-1">
                                        {{ $t('superadmin.apps.colPrice') }}
                                        <Icon name="ph:arrows-down-up" class="w-3 h-3 text-[#B0B8C4]" />
                                    </div>
                                </th>
                                <th class="co-th">
                                    <div class="flex items-center gap-1">
                                        {{ $t('superadmin.apps.colType') }}
                                        <Icon name="ph:arrows-down-up" class="w-3 h-3 text-[#B0B8C4]" />
                                    </div>
                                </th>
                                <th class="co-th"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="app in filteredApps" :key="app.uuid ?? app.id"
                                class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors">

                                <!-- Name -->
                                <td class="co-td">
                                    <div v-if="appBadges(app).length" class="flex flex-wrap gap-1 mb-2">
                                        <span v-for="badge in appBadges(app)" :key="badge.key"
                                            class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                            style="background:#205E77; color:white">
                                            {{ badge.label }}
                                        </span>
                                    </div>
                                    <div class="flex items-center gap-3">
                                        <div class="w-9 h-9 rounded-full border-2 border-[#42AED9] flex items-center justify-center overflow-hidden flex-shrink-0"
                                            :style="`background:${appColor(app.name)}18`">
                                            <img v-if="app.image || app.logo" :src="app.image || app.logo"
                                                class="w-7 h-7 object-contain rounded-full" />
                                            <Icon v-else :name="appIcon(app.name)" class="w-4 h-4"
                                                :style="`color:${appColor(app.name)}`" />
                                        </div>
                                        <span class="text-[13px] font-semibold text-[#1F2533]">{{ app.name }}</span>
                                    </div>
                                </td>

                                <!-- Price -->
                                <td class="co-td">
                                    <div class="space-y-0.5 text-[12px] text-[#5C6478]">
                                        <div>{{ $t('superadmin.apps.labelMonthlyPrice') }}: {{ formatPrice(app.monthly_price) }}</div>
                                        <div>{{ $t('superadmin.apps.labelYearlyPrice') }}: {{ formatPrice(app.yearly_price) }}</div>
                                    </div>
                                </td>

                                <!-- Type -->
                                <td class="co-td text-[13px] text-[#5C6478]">
                                    {{ capitalizeType(app.type) }}
                                </td>

                                <!-- Actions -->
                                <td class="co-td">
                                    <div class="flex items-center gap-2 justify-end">
                                        <button class="co-action-btn" @click="openEditAppSlider(app)">
                                            <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" />
                                            {{ $t('superadmin.apps.edit') }}
                                        </button>
                                        <button class="co-action-btn-danger" @click="confirmDelete(app)">
                                            <Icon name="ph:trash" class="w-3.5 h-3.5" />
                                            {{ $t('delete') }}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <Pagination :data="state.apps" @previous="previous" @next="next" />
            </div>

            <ModulesSuperadminAppSlideOverNewApp :isOpen="showNewAppSlider" @close="showNewAppSlider = false"
                @saved="fetchApps" />

            <ModulesSuperadminAppSlideOverEditApp :isOpen="showEditAppSlider" :appUuid="editAppUuid"
                @close="showEditAppSlider = false" @saved="fetchApps" />

            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="$t('superadmin.apps.deleteConfirm', { name: state.selectedApp?.name })"
                @close="state.modal.isDeleteOpen = false" @confirm="deleteApp" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { appService } from '@/components/api/superadmin/AppService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

let currentTablePage = 1
let searchTimeout: any = null
const searchQuery = ref('')

const showNewAppSlider = ref(false)
const showEditAppSlider = ref(false)
const editAppUuid = ref<string | null>(null)

// App icon + colour mapping
const APP_ICONS: Record<string, string> = {
    'mail': 'ph:envelope', 'booking': 'ph:calendar', 'kursus': 'ph:graduation-cap',
    'leads': 'ph:funnel', 'ai': 'ph:robot', 'chat': 'ph:chat', 'fakturering': 'ph:invoice',
}
const APP_COLORS = ['#205E77', '#2E9E33', '#368F8B', '#1A4D99', '#D4900A', '#9B4D9B', '#CC3B2D']
const appIcon = (name: string) => {
    const key = (name || '').toLowerCase()
    const match = Object.keys(APP_ICONS).find(k => key.includes(k))
    return match ? APP_ICONS[match] : 'ph:squares-four'
}
const appColor = (name: string) => APP_COLORS[(name?.charCodeAt(0) ?? 0) % APP_COLORS.length]

const state = reactive({
    apps: [] as any,
    allApps: [] as any,
    dataFilter: { search: null as any },
    error: {} as Error,
    isLoading: false,
    modal: { isDeleteOpen: false },
    selectedApp: null as any,
})

const filteredApps = computed(() => state.allApps?.data ?? [])

function appBadges(app: any) {
    const badges = []
    if (app.is_popular) badges.push({ key: 'popular', label: t('superadmin.apps.form.popular') })
    if (app.is_news) badges.push({ key: 'news', label: t('superadmin.apps.form.news') })
    if (app.is_thirdparty) badges.push({ key: 'thirdparty', label: t('superadmin.apps.form.thirdPartyApp') })
    if (app.is_recommended) badges.push({ key: 'recommended', label: t('superadmin.apps.form.recommended') })
    if (app.is_quantifiable) badges.push({ key: 'quantifiable', label: t('superadmin.apps.form.quantifiable') })
    return badges
}

function formatPrice(val: any) {
    const n = parseFloat(val ?? 0)
    return isNaN(n) ? '0.00' : n.toFixed(2)
}

function capitalizeType(type: any) {
    if (!type) return t('superadmin.apps.typeOther')
    const map: Record<string, string> = {
        citizenone: 'CitizenOne',
        fst: 'FST',
        marketing: 'Marketing',
        visual: 'Visual',
        other: 'Other',
        module: 'Module',
        course: 'Course',
        integration: 'Integration',
    }
    return map[type.toLowerCase()] ?? (type.charAt(0).toUpperCase() + type.slice(1))
}

onMounted(() => {
    fetchApps()
})

async function fetchApps() {
    state.isLoading = true
    try {
        const params: any = { page: currentTablePage, ...state.dataFilter }
        const response = await appService.getApplications(params)
        if (response) {
            state.allApps = response
            state.apps = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function debouncedSearch() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        const trimmed = searchQuery.value.trim()
        state.dataFilter.search = trimmed.length ? Array(trimmed.split(/\s+/)) : null
        currentTablePage = 1
        fetchApps()
    }, 350)
}

function openEditAppSlider(app: any) {
    editAppUuid.value = app.uuid ?? app.id
    showEditAppSlider.value = true
}

function confirmDelete(app: any) {
    state.selectedApp = app
    state.modal.isDeleteOpen = true
}

async function deleteApp() {
    try {
        await appService.deleteApp(state.selectedApp?.uuid ?? state.selectedApp?.id)
        successAlert(
            t('superadmin.apps.successDeleted'),
            t('superadmin.apps.successDeletedBody', { name: state.selectedApp?.name })
        )
        fetchApps()
    } catch (error: any) { state.error = error }
}

function previous() {
    currentTablePage--
    fetchApps()
}

function next() {
    currentTablePage++
    fetchApps()
}
</script>

<style scoped>
.co-th {
    text-align: left;
    padding: 10px 16px;
    font-size: 11px;
    font-weight: 600;
    color: #8891A4;
    text-transform: uppercase;
    letter-spacing: 0.06em
}

.co-td {
    padding: 12px 16px;
    vertical-align: middle
}

.co-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    background: white;
    color: #5C6478;
    border: 1px solid #D5D9E2;
    transition: all 0.15s;
    cursor: pointer
}

.co-action-btn:hover {
    background: #F5F6F8;
    color: #205E77;
    border-color: #205E77
}

.co-action-btn-danger {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    background: white;
    color: #CC3B2D;
    border: 1px solid #F5C6C3;
    transition: all 0.15s;
    cursor: pointer
}

.co-action-btn-danger:hover {
    background: #FEF2F2;
    border-color: #CC3B2D
}
</style>
