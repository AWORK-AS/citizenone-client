<template>
    <div>
        <NuxtLayout name="superadmin">
            <Head><Title>App Licenser - {{ runtimeConfig?.public?.appName }}</Title></Head>
            <template #header>App Licenser</template>

            <div class="p-1">
                <!-- Header -->
                <div class="flex items-center justify-between mb-5">
                    <div>
                        <h1 class="text-[22px] font-semibold text-[#1F2533]">App Licenser</h1>
                        <p class="text-sm text-[#5C6478] mt-0.5">Definer priser og licensstrukturer per app</p>
                    </div>
                    <button @click="openSlider(null, null)"
                        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm"
                        style="background:#205E77">
                        <Icon name="ph:plus" class="w-4 h-4" />
                        Ny licens
                    </button>
                </div>

                <!-- Info banner -->
                <div class="flex items-start gap-3 px-4 py-3.5 bg-[#EEF4FB] border border-[#42AED9]/20 rounded-xl mb-6 text-[13px] text-[#205E77]">
                    <Icon name="ph:info" class="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p><span class="font-semibold">Licensmodel:</span> Virksomheder betaler per app de aktiverer, ikke en samlet plan. Prisen er per bruger/licens med fleksible faktureringsintervaller — månedlig, årlig eller specifik aftale (fx offentlig sektor med stor volumen).</p>
                </div>

                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message?.length > 0" />

                <!-- Loading -->
                <div v-if="state.isLoading" class="flex justify-center py-16">
                    <Icon name="ph:spinner" class="w-7 h-7 text-[#42AED9] animate-spin" />
                </div>

                <!-- No apps -->
                <div v-else-if="!state.apps.length" class="flex flex-col items-center gap-3 py-16 text-[#8891A4]">
                    <Icon name="ph:squares-four" class="w-12 h-12 opacity-30" />
                    <p class="text-sm">Ingen apps fundet</p>
                    <p class="text-xs">Tilføj apps fra Apps-siden først</p>
                </div>

                <!-- App sections -->
                <div v-else class="space-y-4">
                    <div v-for="app in state.apps" :key="app.uuid ?? app.id"
                        class="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden">

                        <!-- App header -->
                        <div class="flex items-center justify-between px-5 py-4 border-b border-[#F5F6F8]">
                            <div class="flex items-center gap-3">
                                <!-- App icon squares (Obiyen style) -->
                                <div class="grid grid-cols-2 gap-0.5 w-7 h-7 flex-shrink-0">
                                    <div class="rounded-sm" style="background:#42AED9"></div>
                                    <div class="rounded-sm" style="background:#205E77"></div>
                                    <div class="rounded-sm" style="background:#205E77"></div>
                                    <div class="rounded-sm" style="background:#42AED9"></div>
                                </div>
                                <div>
                                    <p class="text-[14px] font-semibold text-[#1F2533]">{{ app.name }}</p>
                                    <p class="text-[11px] text-[#8891A4]">
                                        {{ (app.licenses ?? []).length }} licenstyper
                                        <span v-if="app.active_companies"> · {{ app.active_companies }} aktive virksomheder</span>
                                    </p>
                                </div>
                            </div>
                            <button @click="openSlider(app, null)"
                                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#205E77] border border-[#42AED9]/30 bg-[#F0FAFD] hover:bg-[#E4F1F6] transition-colors">
                                <Icon name="ph:plus" class="w-3.5 h-3.5" />
                                Tilføj licens
                            </button>
                        </div>

                        <!-- License types -->
                        <div v-if="!(app.licenses ?? []).length" class="py-8 text-center text-[12px] text-[#8891A4]">
                            Ingen licenstyper endnu — tilføj den første
                        </div>
                        <div v-else>
                            <div v-for="(lic, li) in app.licenses" :key="lic.uuid ?? li"
                                class="flex items-center justify-between px-5 py-3.5 border-b border-[#F5F6F8] last:border-0 hover:bg-[#F9FAFB] transition-colors group">
                                <div class="flex items-center gap-4 flex-1 min-w-0">
                                    <!-- Status dot -->
                                    <div class="w-2 h-2 rounded-full flex-shrink-0"
                                        :style="lic.is_active !== false ? 'background:#2E9E33' : 'background:#D5D9E2'"></div>
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center gap-2">
                                            <p class="text-[13px] font-semibold text-[#1F2533]">{{ lic.name }}</p>
                                            <span v-if="lic.is_volume" class="co-badge co-badge-warn text-[10px]">
                                                <Icon name="ph:chart-bar" class="w-3 h-3" /> Volumen
                                            </span>
                                            <span v-if="lic.is_active === false" class="co-badge co-badge-gray text-[10px]">Inaktiv</span>
                                        </div>
                                        <p v-if="lic.description" class="text-[11px] text-[#8891A4] mt-0.5 truncate">{{ lic.description }}</p>
                                    </div>
                                </div>

                                <!-- Price info -->
                                <div class="flex items-center gap-6 flex-shrink-0 mr-4">
                                    <div class="text-right">
                                        <p class="text-[14px] font-bold text-[#1F2533]">
                                            {{ lic.price_per_user > 0 ? `kr. ${lic.price_per_user}` : 'Gratis' }}
                                        </p>
                                        <p class="text-[11px] text-[#8891A4]">
                                            {{ intervalLabel(lic.billing_interval) }} / bruger
                                        </p>
                                    </div>
                                    <div v-if="lic.min_seats > 0 || lic.included_seats > 0" class="text-right hidden md:block">
                                        <p class="text-[12px] text-[#5C6478]">
                                            <span v-if="lic.included_seats > 0">{{ lic.included_seats }} inkl.</span>
                                            <span v-if="lic.min_seats > 0"> · min. {{ lic.min_seats }}</span>
                                        </p>
                                        <p class="text-[11px] text-[#8891A4]">brugere</p>
                                    </div>
                                </div>

                                <!-- Actions (hover) -->
                                <div class="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button class="co-action-btn" @click="openSlider(app, lic)">
                                        <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" />
                                    </button>
                                    <button class="co-action-btn !text-[#CC3B2D] hover:!bg-red-50 !border-red-200"
                                        @click="confirmDelete(app, lic)">
                                        <Icon name="ph:trash" class="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ═══ SLIDE-OVER: NY / REDIGER LICENS ═══ -->
            <Teleport to="body">
                <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100"
                    leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
                    <div v-if="slider.open" class="fixed inset-0 bg-black/30 z-40" @click="closeSlider" />
                </Transition>
                <Transition enter-active-class="transition-transform duration-300 ease-out" enter-from-class="translate-x-full" enter-to-class="translate-x-0"
                    leave-active-class="transition-transform duration-200 ease-in" leave-from-class="translate-x-0" leave-to-class="translate-x-full">
                    <div v-if="slider.open" class="fixed inset-y-0 right-0 z-50 w-full max-w-[440px] bg-white shadow-2xl flex flex-col">

                        <!-- Header -->
                        <div class="flex items-start justify-between px-6 py-5 border-b border-[#EAECF0]">
                            <div>
                                <h2 class="text-[16px] font-semibold text-[#1F2533]">{{ slider.editMode ? 'Rediger licens' : 'Ny licens' }}</h2>
                                <p v-if="slider.selectedApp" class="text-[12px] text-[#8891A4] mt-0.5">{{ slider.selectedApp.name }}</p>
                            </div>
                            <button @click="closeSlider" class="w-8 h-8 rounded-lg flex items-center justify-center text-[#8891A4] hover:bg-[#F5F6F8] transition-colors">
                                <Icon name="ph:x" class="w-4 h-4" />
                            </button>
                        </div>

                        <!-- Body -->
                        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                            <Alert type="danger" :text="slider.error?.message" v-if="slider.error?.message?.length > 0" />

                            <!-- App selector (only when no app pre-selected) -->
                            <div v-if="!slider.selectedApp">
                                <label class="co-label">App <span class="text-red-500">*</span></label>
                                <select v-model="slider.form.app_uuid" class="co-input"
                                    :class="slider.errors.app ? 'border-red-300' : ''">
                                    <option value="" disabled>Vælg app…</option>
                                    <option v-for="a in state.apps" :key="a.uuid ?? a.id" :value="a.uuid ?? a.id">
                                        {{ a.name }}
                                    </option>
                                </select>
                                <p v-if="slider.errors.app" class="co-error">{{ slider.errors.app }}</p>
                            </div>

                            <!-- Licensnavn -->
                            <div>
                                <label class="co-label">Licensnavn <span class="text-red-500">*</span></label>
                                <input v-model="slider.form.name" type="text"
                                    placeholder="fx Standard, Enterprise, Offentlig"
                                    class="co-input" :class="slider.errors.name ? 'border-red-300' : ''" />
                                <p v-if="slider.errors.name" class="co-error">{{ slider.errors.name }}</p>
                            </div>

                            <!-- Beskrivelse -->
                            <div>
                                <label class="co-label">Beskrivelse</label>
                                <input v-model="slider.form.description" type="text"
                                    placeholder="Kort beskrivelse af licenstypen"
                                    class="co-input" />
                            </div>

                            <!-- Pris + Interval -->
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="co-label">Pris per bruger (kr) <span class="text-red-500">*</span></label>
                                    <div class="relative">
                                        <input v-model.number="slider.form.price_per_user" type="number" min="0" placeholder="0"
                                            class="co-input pr-8" :class="slider.errors.price ? 'border-red-300' : ''" />
                                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A4] text-sm">kr</span>
                                    </div>
                                    <p v-if="slider.errors.price" class="co-error">{{ slider.errors.price }}</p>
                                </div>
                                <div>
                                    <label class="co-label">Faktureringsinterval</label>
                                    <select v-model="slider.form.billing_interval" class="co-input">
                                        <option value="monthly">Månedlig</option>
                                        <option value="yearly">Årlig</option>
                                        <option value="quarterly">Kvartalsvis</option>
                                        <option value="custom">Specifik aftale</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Inkluderede brugere + Min. køb -->
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="co-label">Inkluderede brugere</label>
                                    <input v-model.number="slider.form.included_seats" type="number" min="0" placeholder="0" class="co-input" />
                                    <p class="text-[11px] text-[#8891A4] mt-1">Inkluderet i basisprisen (0 = ingen)</p>
                                </div>
                                <div>
                                    <label class="co-label">Min. køb (brugere)</label>
                                    <input v-model.number="slider.form.min_seats" type="number" min="1" placeholder="1" class="co-input" />
                                    <p class="text-[11px] text-[#8891A4] mt-1">Minimum der skal tilkøbes</p>
                                </div>
                            </div>

                            <!-- Volumenaftale -->
                            <div class="flex items-center justify-between py-3 px-4 border border-[#EAECF0] rounded-xl">
                                <div>
                                    <p class="text-[13px] font-medium text-[#1F2533]">Volumenaftale</p>
                                    <p class="text-[11px] text-[#8891A4] mt-0.5">Aktivér for fx offentlige institutioner med mange brugere (fx 6.300 brugere til 29 kr/stk.)</p>
                                </div>
                                <button type="button" @click="slider.form.is_volume = !slider.form.is_volume"
                                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ml-4"
                                    :style="slider.form.is_volume ? 'background:#42AED9' : 'background:#D5D9E2'">
                                    <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                                        :class="slider.form.is_volume ? 'translate-x-6' : 'translate-x-1'"></span>
                                </button>
                            </div>

                            <!-- Aktiv -->
                            <div class="flex items-center justify-between py-3 px-4 border border-[#EAECF0] rounded-xl">
                                <div>
                                    <p class="text-[13px] font-medium text-[#1F2533]">Aktiv</p>
                                    <p class="text-[11px] text-[#8891A4] mt-0.5">Licenstypen kan tilkøbes af virksomheder</p>
                                </div>
                                <button type="button" @click="slider.form.is_active = !slider.form.is_active"
                                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
                                    :style="slider.form.is_active ? 'background:#42AED9' : 'background:#D5D9E2'">
                                    <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                                        :class="slider.form.is_active ? 'translate-x-6' : 'translate-x-1'"></span>
                                </button>
                            </div>

                            <!-- Assign to company -->
                            <div class="border border-[#EAECF0] rounded-xl p-4">
                                <p class="text-[13px] font-semibold text-[#1F2533] mb-2">Tilknyt til virksomhed (valgfri)</p>
                                <p class="text-[11px] text-[#8891A4] mb-3">Tilknyt denne licenstype direkte til en virksomhed</p>
                                <div class="relative">
                                    <Icon name="ph:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8891A4]" />
                                    <input v-model="slider.companySearch" type="text"
                                        placeholder="Søg virksomhed..."
                                        class="co-input pl-9" @input="searchCompanies" />
                                </div>
                                <div v-if="slider.companyResults.length" class="mt-1 border border-[#EAECF0] rounded-lg bg-white shadow max-h-36 overflow-y-auto">
                                    <button v-for="c in slider.companyResults" :key="c.uuid"
                                        class="w-full text-left px-3 py-2 hover:bg-[#F5F6F8] flex items-center gap-2 transition-colors text-[13px]"
                                        @click="slider.selectedCompany = c; slider.companySearch = c.name; slider.companyResults = []">
                                        <div class="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white"
                                            :style="`background:${avatarColor(c.name)}`">{{ (c.name||'?').charAt(0).toUpperCase() }}</div>
                                        {{ c.name }}
                                    </button>
                                </div>
                                <div v-if="slider.selectedCompany" class="mt-2 flex items-center gap-2 px-3 py-2 bg-[#E4F1F6] rounded-lg">
                                    <div class="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white"
                                        :style="`background:${avatarColor(slider.selectedCompany.name)}`">
                                        {{ (slider.selectedCompany.name||'?').charAt(0).toUpperCase() }}
                                    </div>
                                    <span class="text-[12px] font-medium text-[#205E77] flex-1">{{ slider.selectedCompany.name }}</span>
                                    <button @click="slider.selectedCompany = null; slider.companySearch = ''" class="text-[#205E77]/50 hover:text-[#205E77]">
                                        <Icon name="ph:x" class="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="flex items-center gap-3 px-6 py-4 border-t border-[#EAECF0]">
                            <button @click="closeSlider"
                                class="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#5C6478] bg-white border border-[#EAECF0] hover:bg-[#F5F6F8] transition-colors">
                                Annuller
                            </button>
                            <button @click="saveLicense"
                                class="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm"
                                style="background:#205E77" :disabled="slider.isSaving">
                                <span v-if="slider.isSaving" class="flex items-center justify-center gap-2">
                                    <Icon name="ph:spinner" class="w-4 h-4 animate-spin" /> Gemmer...
                                </span>
                                <span v-else>{{ slider.editMode ? 'Gem ændringer' : 'Opret licens' }}</span>
                            </button>
                        </div>
                    </div>
                </Transition>
            </Teleport>

            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="`Slet licenstype '${state.selectedLicense?.name}'?`"
                @close="state.modal.isDeleteOpen = false"
                @confirm="deleteLicense" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { appService } from '@/components/api/superadmin/AppService'
import { licenseService } from '@/components/api/superadmin/LicenseService'
import { companyService } from '@/components/api/superadmin/CompanyService'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()

let companySearchTimeout: any = null

const COLORS = ['#205E77','#2E9E33','#368F8B','#1A4D99','#D4900A','#9B4D9B']
const avatarColor = (name: string) => COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length]

const intervalLabel = (v: string) => ({ monthly:'Månedlig', yearly:'Årlig', quarterly:'Kvartalsvis', custom:'Aftale' }[v] ?? v ?? 'Månedlig')

const state = reactive({
    apps: [] as any[],
    error: {} as Error,
    isLoading: false,
    modal: { isDeleteOpen: false },
    selectedLicense: null as any,
    selectedApp: null as any,
})

const slider = reactive({
    open: false,
    editMode: false,
    isSaving: false,
    error: {} as any,
    selectedApp: null as any,
    editingLicense: null as any,
    companySearch: '',
    companyResults: [] as any[],
    selectedCompany: null as any,
    form: {
        app_uuid: '',
        name: '',
        description: '',
        price_per_user: 0,
        billing_interval: 'monthly',
        included_seats: 0,
        min_seats: 1,
        is_volume: false,
        is_active: true,
    },
    errors: { app: '', name: '', price: '' },
})

onMounted(() => { fetchApps() })

async function fetchApps() {
    state.isLoading = true
    try {
        const response = await appService.getApplications()
        if (response) {
            const apps = Array.isArray(response) ? response : (response?.data ?? [])
            // For each app, try to fetch its license types
            state.apps = await Promise.all(apps.map(async (app: any) => {
                try {
                    const licRes = await licenseService.getLicenseTypes(app.uuid ?? app.id)
                    return { ...app, licenses: licRes?.data ?? licRes ?? [] }
                } catch (_) {
                    return { ...app, licenses: [] }
                }
            }))
        }
    } catch (error: any) { state.error = error }
    state.isLoading = false
}

function openSlider(app: any, license: any) {
    slider.selectedApp = app
    slider.editMode = !!license
    slider.editingLicense = license
    slider.error = {}
    slider.errors = { app: '', name: '', price: '' }
    slider.companySearch = ''; slider.companyResults = []; slider.selectedCompany = null

    if (license) {
        slider.form = {
            app_uuid: app?.uuid ?? app?.id ?? '',
            name: license.name ?? '',
            description: license.description ?? '',
            price_per_user: license.price_per_user ?? 0,
            billing_interval: license.billing_interval ?? 'monthly',
            included_seats: license.included_seats ?? 0,
            min_seats: license.min_seats ?? 1,
            is_volume: license.is_volume ?? false,
            is_active: license.is_active !== false,
        }
    } else {
        slider.form = {
            app_uuid: app?.uuid ?? app?.id ?? '',
            name: '', description: '',
            price_per_user: 0, billing_interval: 'monthly',
            included_seats: 0, min_seats: 1,
            is_volume: false, is_active: true,
        }
    }
    slider.open = true
    document.body.style.overflow = 'hidden'
}

function closeSlider() { slider.open = false; document.body.style.overflow = '' }

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

function validate() {
    slider.errors = { app: '', name: '', price: '' }
    let valid = true
    if (!slider.form.app_uuid && !slider.selectedApp) { slider.errors.app = 'Vælg en app'; valid = false }
    if (!slider.form.name) { slider.errors.name = 'Licensnavn er påkrævet'; valid = false }
    if (slider.form.price_per_user < 0) { slider.errors.price = 'Prisen skal være 0 eller mere'; valid = false }
    return valid
}

async function saveLicense() {
    if (!validate()) return
    slider.isSaving = true; slider.error = {}
    try {
        const appUuid = slider.form.app_uuid || slider.selectedApp?.uuid || slider.selectedApp?.id
        const params = {
            name: slider.form.name,
            description: slider.form.description,
            price_per_user: slider.form.price_per_user,
            billing_interval: slider.form.billing_interval,
            included_seats: slider.form.included_seats,
            min_seats: slider.form.min_seats,
            is_volume: slider.form.is_volume,
            is_active: slider.form.is_active,
            company_uuid: slider.selectedCompany?.uuid,
        }
        if (slider.editMode && slider.editingLicense) {
            await licenseService.updateLicenseType(appUuid, slider.editingLicense.uuid ?? slider.editingLicense.id, params)
            successAlert('Gemt!', `Licenstype '${slider.form.name}' er opdateret.`)
        } else {
            await licenseService.createLicenseType(appUuid, params)
            successAlert('Oprettet!', `Licenstype '${slider.form.name}' er oprettet.`)
        }
        closeSlider(); fetchApps()
    } catch (error: any) { slider.error = error }
    slider.isSaving = false
}

function confirmDelete(app: any, license: any) {
    state.selectedApp = app; state.selectedLicense = license; state.modal.isDeleteOpen = true
}

async function deleteLicense() {
    try {
        const appUuid = state.selectedApp?.uuid ?? state.selectedApp?.id
        await licenseService.deleteLicenseType(appUuid, state.selectedLicense?.uuid ?? state.selectedLicense?.id)
        successAlert('Slettet!', `Licenstype '${state.selectedLicense?.name}' er slettet.`)
        fetchApps()
    } catch (error: any) { state.error = error }
}

onMounted(() => { window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && slider.open) closeSlider() }) })
</script>

<style scoped>
.co-badge { display:inline-flex; align-items:center; gap:4px; padding:2px 7px; border-radius:999px; font-weight:600; white-space:nowrap }
.co-badge-warn  { background:#FFF9EC; color:#D4900A }
.co-badge-gray  { background:#F5F6F8; color:#5C6478 }
.co-action-btn  { display:inline-flex; align-items:center; gap:4px; padding:5px 8px; border-radius:8px; font-size:12px; font-weight:500; background:#F5F6F8; color:#5C6478; border:1px solid #EAECF0; transition:all 0.15s; cursor:pointer }
.co-action-btn:hover { background:#EEF4FB; color:#205E77 }
.co-label { display:block; font-size:13px; font-weight:600; color:#1F2533; margin-bottom:5px }
.co-input { width:100%; padding:9px 13px; font-size:14px; color:#1F2533; background:white; border:1px solid #D5D9E2; border-radius:10px; outline:none; transition:border-color 0.15s, box-shadow 0.15s }
.co-input:focus { border-color:#42AED9; box-shadow:0 0 0 3px rgba(66,174,217,0.12) }
.co-input::placeholder { color:#B0B8C4 }
.co-error { font-size:11px; color:#CC3B2D; margin-top:4px }
</style>
