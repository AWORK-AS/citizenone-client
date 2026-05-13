<template>
    <div>
        <NuxtLayout name="superadmin">
            <Head>
                <Title>Brugere - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>Brugere</template>

            <div class="p-1">

                <!-- Header -->
                <div class="flex items-center justify-between mb-5">
                    <div>
                        <h1 class="text-[22px] font-semibold text-[#1F2533]">Brugere</h1>
                        <p class="text-sm text-[#5C6478] mt-0.5">{{ state.users?.total ?? 0 }} brugere i alt</p>
                    </div>
                    <button @click="openCreateSlider"
                        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-colors"
                        style="background:#205E77">
                        <Icon name="ph:plus" class="w-4 h-4" />
                        Ny bruger
                    </button>
                </div>

                <!-- Search + tabs + sort -->
                <div class="flex flex-wrap items-center gap-3 mb-4">
                    <div class="relative flex-1 min-w-[220px] max-w-[380px]">
                        <Icon name="ph:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8891A4]" />
                        <input v-model="searchQuery" type="text"
                            placeholder="Søg på navn, email eller virksomhed..."
                            class="w-full pl-9 pr-3 py-2 text-sm border border-[#EAECF0] rounded-lg bg-white text-[#1F2533] placeholder-[#8891A4] outline-none focus:border-[#42AED9] focus:ring-2 focus:ring-[#42AED9]/10 transition-colors"
                            @input="debouncedSearch" />
                    </div>

                    <div class="flex items-center bg-white border border-[#EAECF0] rounded-lg p-0.5">
                        <button v-for="tab in tabs" :key="tab.key"
                            class="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors flex items-center gap-1.5"
                            :style="state.activeTab === tab.key ? 'background:#205E77;color:#fff' : 'color:#5C6478'"
                            @click="setTab(tab.key)">
                            {{ tab.label }}
                            <span class="text-[11px] font-normal opacity-70">({{ tab.count }})</span>
                        </button>
                    </div>

                    <select v-model="sortLabel"
                        class="text-sm border border-[#EAECF0] rounded-lg px-3 py-2 bg-white text-[#5C6478] outline-none focus:border-[#42AED9] transition-colors ml-auto"
                        @change="handleSortChange">
                        <option value="firstname_asc">Navn A–Z</option>
                        <option value="firstname_desc">Navn Z–A</option>
                        <option value="id_desc">Nyeste først</option>
                        <option value="id_asc">Ældste først</option>
                    </select>
                </div>

                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message?.length > 0" />

                <!-- Table -->
                <div class="bg-white border border-[#EAECF0] rounded-xl overflow-hidden shadow-sm">
                    <div v-if="state.isTableLoading" class="flex items-center justify-center py-16">
                        <Icon name="ph:spinner" class="w-7 h-7 text-[#42AED9] animate-spin" />
                    </div>

                    <div v-else-if="!state.users?.data?.length"
                        class="flex flex-col items-center gap-3 py-16 text-[#8891A4]">
                        <Icon name="ph:user" class="w-12 h-12 opacity-30" />
                        <p class="text-sm font-medium">Ingen brugere fundet</p>
                        <p class="text-xs">Opret den første bruger</p>
                        <button @click="openCreateSlider"
                            class="mt-1 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
                            style="background:#205E77">
                            Opret bruger
                        </button>
                    </div>

                    <table v-else class="w-full">
                        <thead>
                            <tr class="border-b border-[#EAECF0] bg-[#F9FAFB]">
                                <th class="co-th cursor-pointer" @click="toggleSort('firstname')">
                                    <div class="flex items-center gap-1">Navn <Icon name="ph:arrows-down-up" class="w-3 h-3 opacity-50" /></div>
                                </th>
                                <th class="co-th cursor-pointer" @click="toggleSort('email')">
                                    <div class="flex items-center gap-1">Email <Icon name="ph:arrows-down-up" class="w-3 h-3 opacity-50" /></div>
                                </th>
                                <th class="co-th">Virksomhed</th>
                                <th class="co-th">Telefon</th>
                                <th class="co-th">Rolle</th>
                                <th class="co-th">Status</th>
                                <th class="co-th"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(user, index) in state.users?.data" :key="index"
                                class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors group">
                                <td class="co-td">
                                    <div class="flex items-center gap-3">
                                        <img :src="user?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${encodeURIComponent((user?.firstname||'?')+'+' +(user?.lastname||''))}&size=32`"
                                            class="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                        <p class="text-[13px] font-semibold text-[#1F2533]">{{ user?.firstname }} {{ user?.lastname }}</p>
                                    </div>
                                </td>
                                <td class="co-td text-[13px] text-[#5C6478]">{{ user?.email }}</td>
                                <td class="co-td">
                                    <span v-if="user?.company?.name" class="text-[12px] font-medium text-[#1F2533]">{{ user.company.name }}</span>
                                    <span v-else class="text-[#8891A4] text-[13px]">—</span>
                                </td>
                                <td class="co-td text-[13px] text-[#5C6478]">{{ user?.phone || '—' }}</td>
                                <td class="co-td">
                                    <span v-if="user?.is_superadmin" class="co-badge co-badge-navy">
                                        <Icon name="ph:crown-simple" class="w-3 h-3" /> Super Admin
                                    </span>
                                    <span v-else-if="user?.roles?.length" class="co-badge co-badge-gray">{{ user.roles[0]?.name }}</span>
                                    <span v-else class="text-[#8891A4] text-[12px]">—</span>
                                </td>
                                <td class="co-td">
                                    <span v-if="user?.is_active !== false" class="co-badge co-badge-green">
                                        <span class="w-1.5 h-1.5 rounded-full bg-[#2E9E33]"></span> Aktiv
                                    </span>
                                    <span v-else class="co-badge co-badge-red">
                                        <span class="w-1.5 h-1.5 rounded-full bg-[#CC3B2D]"></span> Inaktiv
                                    </span>
                                </td>
                                <td class="co-td">
                                    <div class="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button class="co-action-btn" @click="navigateTo(`/superadmin/users/edit/${user.uuid}`)">
                                            <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" /> Rediger
                                        </button>
                                        <button class="co-action-btn !text-[#CC3B2D] hover:!bg-red-50 !border-red-200" @click="deleteConfirmation(user)">
                                            <Icon name="ph:trash" class="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="mt-4 flex items-center justify-between">
                    <p class="text-sm text-[#8891A4]">Viser {{ state.users?.from ?? 0 }}–{{ state.users?.to ?? 0 }} af {{ state.users?.total ?? 0 }}</p>
                    <Pagination :data="state.users" @previous="previous" @next="next" />
                </div>
            </div>

            <!-- ═══════════════════════════════════
                 SLIDE-OVER: NY BRUGER
            ═══════════════════════════════════ -->
            <Teleport to="body">
                <!-- Backdrop -->
                <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100"
                    leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
                    <div v-if="slider.open" class="fixed inset-0 bg-black/30 z-40" @click="closeSlider" />
                </Transition>

                <!-- Panel -->
                <Transition enter-active-class="transition-transform duration-300 ease-out" enter-from-class="translate-x-full" enter-to-class="translate-x-0"
                    leave-active-class="transition-transform duration-200 ease-in" leave-from-class="translate-x-0" leave-to-class="translate-x-full">
                    <div v-if="slider.open"
                        class="fixed inset-y-0 right-0 z-50 w-full max-w-[440px] bg-white shadow-2xl flex flex-col">

                        <!-- Header -->
                        <div class="flex items-start justify-between px-6 py-5 border-b border-[#EAECF0]">
                            <div>
                                <h2 class="text-[16px] font-semibold text-[#1F2533]">Ny bruger</h2>
                                <p class="text-[12px] text-[#8891A4] mt-0.5">Opret og tilknyt til virksomhed</p>
                            </div>
                            <button @click="closeSlider"
                                class="w-8 h-8 rounded-lg flex items-center justify-center text-[#8891A4] hover:bg-[#F5F6F8] hover:text-[#1F2533] transition-colors">
                                <Icon name="ph:x" class="w-4 h-4" />
                            </button>
                        </div>

                        <!-- Scrollable content -->
                        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                            <Alert type="danger" :text="slider.error?.message"
                                v-if="slider.error?.message?.length > 0" />

                            <!-- Tilknyt til virksomhed -->
                            <div>
                                <p class="text-[10px] font-bold text-[#8891A4] uppercase tracking-[0.08em] mb-2">Tilknyt til virksomhed</p>
                                <div class="relative">
                                    <Icon name="ph:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8891A4]" />
                                    <input v-model="slider.companySearch" type="text"
                                        placeholder="Søg virksomhed..."
                                        class="co-input pl-9"
                                        @input="searchCompanies" />
                                </div>
                                <!-- Company dropdown results -->
                                <div v-if="slider.companyResults.length"
                                    class="mt-1 border border-[#EAECF0] rounded-lg bg-white shadow-lg max-h-40 overflow-y-auto">
                                    <button v-for="c in slider.companyResults" :key="c.uuid"
                                        class="w-full text-left px-3 py-2.5 hover:bg-[#F5F6F8] transition-colors flex items-center gap-2.5"
                                        @click="selectCompany(c)">
                                        <div class="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                                            style="background:#42AED9">
                                            {{ (c.name||'?').charAt(0).toUpperCase() }}
                                        </div>
                                        <span class="text-[13px] text-[#1F2533]">{{ c.name }}</span>
                                    </button>
                                </div>
                                <!-- Selected company chip -->
                                <div v-if="slider.selectedCompany"
                                    class="mt-2 flex items-center gap-2 px-3 py-2 bg-[#E4F1F6] rounded-lg border border-[#42AED9]/20">
                                    <div class="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                                        style="background:#205E77">
                                        {{ (slider.selectedCompany.name||'?').charAt(0).toUpperCase() }}
                                    </div>
                                    <span class="text-[13px] font-medium text-[#205E77] flex-1">{{ slider.selectedCompany.name }}</span>
                                    <button @click="slider.selectedCompany = null; slider.companySearch = ''"
                                        class="text-[#205E77]/50 hover:text-[#205E77] transition-colors">
                                        <Icon name="ph:x" class="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <p v-else class="text-[11px] text-[#8891A4] mt-1.5">Søg for at tilknytte en eksisterende virksomhed</p>
                            </div>

                            <!-- Brugeroplysninger -->
                            <div>
                                <p class="text-[10px] font-bold text-[#8891A4] uppercase tracking-[0.08em] mb-3">Brugeroplysninger</p>

                                <!-- Fornavn + Efternavn -->
                                <div class="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <label class="co-label">Fornavn <span class="text-red-500">*</span></label>
                                        <input v-model="slider.form.firstname" type="text" placeholder="Jesper" class="co-input"
                                            :class="slider.errors.firstname ? 'border-red-300' : ''" />
                                        <p v-if="slider.errors.firstname" class="co-error">{{ slider.errors.firstname }}</p>
                                    </div>
                                    <div>
                                        <label class="co-label">Efternavn <span class="text-red-500">*</span></label>
                                        <input v-model="slider.form.lastname" type="text" placeholder="Enger" class="co-input"
                                            :class="slider.errors.lastname ? 'border-red-300' : ''" />
                                        <p v-if="slider.errors.lastname" class="co-error">{{ slider.errors.lastname }}</p>
                                    </div>
                                </div>

                                <!-- Email -->
                                <div class="mb-3">
                                    <label class="co-label">Email <span class="text-red-500">*</span></label>
                                    <input v-model="slider.form.email" type="email" placeholder="bruger@virksomhed.dk" class="co-input"
                                        :class="slider.errors.email ? 'border-red-300' : ''" />
                                    <p v-if="slider.errors.email" class="co-error">{{ slider.errors.email }}</p>
                                </div>

                                <!-- Telefon -->
                                <div class="mb-3">
                                    <label class="co-label">Telefon</label>
                                    <input v-model="slider.form.phone" type="text" placeholder="+45 12 34 56 78" class="co-input" />
                                </div>

                                <!-- Rolle -->
                                <div class="mb-3">
                                    <label class="co-label">Rolle</label>
                                    <select v-model="slider.form.role" class="co-input">
                                        <option value="user">Bruger</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>

                                <!-- Adgangskode -->
                                <div class="mb-1">
                                    <label class="co-label">Adgangskode</label>
                                    <div class="relative">
                                        <input v-model="slider.form.password"
                                            :type="showPassword ? 'text' : 'password'"
                                            placeholder="Min. 8 tegn" class="co-input pr-10"
                                            :class="slider.errors.password ? 'border-red-300' : ''" />
                                        <button type="button"
                                            class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A4] hover:text-[#5C6478]"
                                            @click="showPassword = !showPassword">
                                            <Icon :name="showPassword ? 'ph:eye-slash' : 'ph:eye'" class="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p class="text-[11px] text-[#8891A4] mt-1">Lad stå tom for at sende velkomst-email med link</p>
                                    <p v-if="slider.errors.password" class="co-error">{{ slider.errors.password }}</p>
                                </div>
                            </div>

                            <!-- Aktiv toggle -->
                            <div class="flex items-center justify-between py-3 border border-[#EAECF0] rounded-xl px-4">
                                <div>
                                    <p class="text-[13px] font-medium text-[#1F2533]">Aktiv</p>
                                    <p class="text-[11px] text-[#8891A4]">Brugeren kan logge ind</p>
                                </div>
                                <button type="button" @click="slider.form.is_active = !slider.form.is_active"
                                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
                                    :style="slider.form.is_active ? 'background:#42AED9' : 'background:#D5D9E2'">
                                    <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                                        :class="slider.form.is_active ? 'translate-x-6' : 'translate-x-1'"></span>
                                </button>
                            </div>

                        </div>

                        <!-- Footer buttons -->
                        <div class="flex items-center gap-3 px-6 py-4 border-t border-[#EAECF0] bg-white">
                            <button @click="closeSlider"
                                class="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#5C6478] bg-white border border-[#EAECF0] hover:bg-[#F5F6F8] transition-colors">
                                Annuller
                            </button>
                            <button @click="saveUser"
                                class="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors shadow-sm"
                                style="background:#205E77"
                                :disabled="slider.isSaving">
                                <span v-if="slider.isSaving" class="flex items-center justify-center gap-2">
                                    <Icon name="ph:spinner" class="w-4 h-4 animate-spin" /> Opretter...
                                </span>
                                <span v-else>Opret bruger</span>
                            </button>
                        </div>

                    </div>
                </Transition>
            </Teleport>

            <!-- Delete confirmation -->
            <DialogConfirmation
                :isModalOpen="state.modal.isDeleteUserOpen"
                :message="`Slet bruger ${state.selectedUser?.firstname} ${state.selectedUser?.lastname}?`"
                @close="state.modal.isDeleteUserOpen = false"
                @confirm="deleteUser" />

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { userService } from '@/components/api/superadmin/UserService'
import { companyService } from '@/components/api/superadmin/CompanyService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

let currentTablePage = 1
let searchTimeout: any = null
let companySearchTimeout: any = null
const searchQuery = ref('')
const sortLabel = ref('id_desc')
const showPassword = ref(false)

// ── Users table state ────────────────────────────────────────────────────
const state = reactive({
    users: [] as any,
    activeTab: 'all',
    allCount: 0, activeCount: 0, inactiveCount: 0, adminCount: 0,
    error: {} as Error,
    isTableLoading: false,
    modal: { isDeleteUserOpen: false },
    selectedUser: {} as any,
    sortData: { sortField: 'id', sortOrder: 'descend' },
    dataFilter: { search: '' },
})

// ── Slide-over state ─────────────────────────────────────────────────────
const slider = reactive({
    open: false,
    isSaving: false,
    error: {} as any,
    companySearch: '',
    companyResults: [] as any[],
    selectedCompany: null as any,
    form: {
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        role: 'user',
        password: '',
        is_active: true,
    },
    errors: {
        firstname: '', lastname: '', email: '', password: '',
    },
})

const tabs = computed(() => [
    { key: 'all',      label: 'Alle',    count: state.allCount },
    { key: 'active',   label: 'Aktive',  count: state.activeCount },
    { key: 'inactive', label: 'Inaktive',count: state.inactiveCount },
    { key: 'admins',   label: 'Admins',  count: state.adminCount },
])

// ── Slide-over methods ───────────────────────────────────────────────────
function openCreateSlider() {
    // Reset form
    slider.form = { firstname: '', lastname: '', email: '', phone: '', role: 'user', password: '', is_active: true }
    slider.errors = { firstname: '', lastname: '', email: '', password: '' }
    slider.error = {}
    slider.companySearch = ''
    slider.companyResults = []
    slider.selectedCompany = null
    slider.open = true
    document.body.style.overflow = 'hidden'
}

function closeSlider() {
    slider.open = false
    document.body.style.overflow = ''
}

function searchCompanies() {
    clearTimeout(companySearchTimeout)
    if (!slider.companySearch.trim()) { slider.companyResults = []; return }
    companySearchTimeout = setTimeout(async () => {
        try {
            const r = await companyService.getCompanies({ search: slider.companySearch, page: 1 })
            slider.companyResults = r?.data?.slice(0, 8) ?? []
        } catch (_) {}
    }, 300)
}

function selectCompany(company: any) {
    slider.selectedCompany = company
    slider.companySearch = company.name
    slider.companyResults = []
}

function validateSlider() {
    let valid = true
    slider.errors = { firstname: '', lastname: '', email: '', password: '' }
    if (!slider.form.firstname) { slider.errors.firstname = 'Påkrævet'; valid = false }
    if (!slider.form.lastname)  { slider.errors.lastname  = 'Påkrævet'; valid = false }
    if (!slider.form.email)     { slider.errors.email     = 'Påkrævet'; valid = false }
    if (slider.form.password && slider.form.password.length < 8) {
        slider.errors.password = 'Min. 8 tegn'; valid = false
    }
    return valid
}

async function saveUser() {
    if (!validateSlider()) return
    slider.error = {}
    slider.isSaving = true
    try {
        const params: any = {
            firstname: slider.form.firstname,
            lastname:  slider.form.lastname,
            email:     slider.form.email,
            phone:     slider.form.phone,
            role:      slider.form.role,
            is_active: slider.form.is_active,
        }
        if (slider.form.password)       params.password = slider.form.password
        if (slider.selectedCompany)     params.company_uuid = slider.selectedCompany.uuid

        const response = await userService.saveUser(params)
        if (response) {
            successAlert('Oprettet!', `${slider.form.firstname} ${slider.form.lastname} er oprettet.`)
            closeSlider()
            fetchUsers()
        }
    } catch (error: any) {
        slider.error = error
        const errs = error?.errors ?? {}
        Object.keys(errs).forEach(k => { if (k in slider.errors) (slider.errors as any)[k] = errs[k][0] })
    }
    slider.isSaving = false
}

// ── Table methods ────────────────────────────────────────────────────────
onMounted(() => { fetchUsers() })

async function fetchUsers() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params: any = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        }
        if (state.activeTab === 'active')   params.is_active = true
        if (state.activeTab === 'inactive') params.is_active = false
        if (state.activeTab === 'admins')   params.is_superadmin = true
        const response = await userService.getUsers(params)
        if (response) {
            state.users = response
            const items = response?.data ?? []
            state.allCount      = response?.total ?? items.length
            state.activeCount   = items.filter((u: any) => u.is_active !== false).length
            state.inactiveCount = items.filter((u: any) => u.is_active === false).length
            state.adminCount    = items.filter((u: any) => u.is_superadmin).length
        }
    } catch (error: any) { state.error = error }
    state.isTableLoading = false
}

function debouncedSearch() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        state.dataFilter.search = searchQuery.value
        currentTablePage = 1
        fetchUsers()
    }, 350)
}

function setTab(tab: string) { state.activeTab = tab; currentTablePage = 1; fetchUsers() }

function handleSortChange() {
    const parts = sortLabel.value.split('_')
    const order = parts.pop()
    state.sortData.sortField = parts.join('_')
    state.sortData.sortOrder = order === 'asc' ? 'ascend' : 'descend'
    currentTablePage = 1; fetchUsers()
}

function toggleSort(field: string) {
    state.sortData.sortOrder = state.sortData.sortField === field && state.sortData.sortOrder === 'ascend' ? 'descend' : 'ascend'
    state.sortData.sortField = field; currentTablePage = 1; fetchUsers()
}

function previous() { currentTablePage--; fetchUsers() }
function next()     { currentTablePage++; fetchUsers() }

function deleteConfirmation(user: any) { state.selectedUser = user; state.modal.isDeleteUserOpen = true }

async function deleteUser() {
    state.isTableLoading = true
    try {
        const response = await userService.deleteUser(state.selectedUser?.uuid)
        if (response) { fetchUsers(); successAlert(`${t('alert.success')}!`, `${t('superadmin.users.form.alert.userSuccessfullyDeleted')}.`) }
    } catch (error: any) { state.error = error }
    state.isTableLoading = false
}

// Close on Escape key
onMounted(() => {
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && slider.open) closeSlider() })
})
</script>

<style scoped>
.co-th { text-align:left; padding:10px 16px; font-size:11px; font-weight:600; color:#8891A4; text-transform:uppercase; letter-spacing:0.06em; white-space:nowrap }
.co-td { padding:12px 16px; vertical-align:middle }
.co-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 8px; border-radius:999px; font-size:11px; font-weight:600; white-space:nowrap }
.co-badge-green { background:#EDF7EE; color:#2E9E33 }
.co-badge-red   { background:#FFF0F0; color:#CC3B2D }
.co-badge-navy  { background:#E4F1F6; color:#205E77 }
.co-badge-gray  { background:#F5F6F8; color:#5C6478 }
.co-action-btn  { display:inline-flex; align-items:center; gap:4px; padding:5px 10px; border-radius:8px; font-size:12px; font-weight:500; background:#F5F6F8; color:#5C6478; border:1px solid #EAECF0; transition:all 0.15s; cursor:pointer }
.co-action-btn:hover { background:#EEF4FB; color:#205E77 }
.co-label { display:block; font-size:13px; font-weight:600; color:#1F2533; margin-bottom:5px }
.co-input { width:100%; padding:9px 13px; font-size:14px; color:#1F2533; background:white; border:1px solid #D5D9E2; border-radius:10px; outline:none; transition:border-color 0.15s, box-shadow 0.15s }
.co-input:focus { border-color:#42AED9; box-shadow:0 0 0 3px rgba(66,174,217,0.12) }
.co-input::placeholder { color:#B0B8C4 }
.co-error { font-size:11px; color:#CC3B2D; margin-top:4px }
</style>
