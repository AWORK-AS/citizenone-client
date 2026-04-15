<template>
    <div>
        <NuxtLayout name="user">
            <Head>
                <Title>
                    {{ $t('dutySchedules.draft.pageTitle') }}
                    -
                    {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb>
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400" aria-hidden="true" />
                            <button @click="navigateTo('/schedules')" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.dutySchedules }}
                            </button>
                        </div>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400" aria-hidden="true" />
                            <button @click="navigateTo('/schedules/draft')" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ $t('dutySchedules.draft.pageTitle') }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>
                <div class="flex items-center gap-x-3">
                    <span>{{ $t('dutySchedules.draft.pageTitle') }}</span>
                    <div class="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-lg px-2.5 py-1">
                        <svg class="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 5h2a1 1 0 001-1v-3a1 1 0 00-1-1h-2a1 1 0 00-1 1v3a1 1 0 001 1z"/></svg>
                        <span class="text-sm font-semibold text-primary">{{ departmentStore.getSelectedDepartmentName }}</span>
                    </div>
                    <NuxtLink to="/schedules"
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all">
                        <Icon name="ph:arrow-left" class="w-3.5 h-3.5" />
                        {{ $t('dutySchedules.draft.backToPublished') }}
                    </NuxtLink>
                </div>
            </template>


            <template #settings>
                <div class="flex items-center gap-3">
                <div class="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                    <NuxtLink to="/schedules/draft/published"
                        class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-white hover:text-primary hover:shadow-sm transition-all">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        {{ $t('dutySchedules.published.seePrevious') }}
                    </NuxtLink>
                    <div class="w-px h-4 bg-slate-200"></div>
                    <button class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-white hover:text-primary hover:shadow-sm transition-all"
                        @click="navigateTo('/schedules/draft/templates')">
                        <Icon name="ph:note" class="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{{ $t('dutySchedules.draftTemplates.draftTemplates') }}</span>
                    </button>
                    <div class="w-px h-4 bg-slate-200"></div>
                    <button class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-white hover:text-primary hover:shadow-sm transition-all"
                        @click="state.modal.isPresetsOpen = true">
                        <Icon name="ph:list-dashes-bold" class="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{{ $t('dutySchedules.draft.preset.viewPresets') }}</span>
                    </button>
                    <div class="w-px h-4 bg-slate-200"></div>
                    <button class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-white hover:text-primary hover:shadow-sm transition-all"
                        @click="state.modal.isSaveAsPresetOpen = true">
                        <Icon name="ph:floppy-disk" class="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{{ $t('dutySchedules.draft.preset.saveAsPreset') }}</span>
                    </button>
                </div>
                <button onclick="document.getElementById('help-guide-modal').style.display='flex'"
                    class="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-primary hover:text-primary text-slate-500 text-xs font-semibold transition-all shadow-sm flex-shrink-0">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {{ $t('helpGuide.title') }}
                </button>
                <!-- Help Modal -->
                <div id="help-guide-modal" style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(15,43,70,0.6);backdrop-filter:blur(4px);align-items:center;justify-content:center;" onclick="if(event.target===this)this.style.display='none'">
                    <div style="background:white;border-radius:20px;width:90vw;max-width:1100px;height:88vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 25px 80px rgba(0,0,0,0.35);">
                        <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 24px;border-bottom:1px solid #e2e8f0;flex-shrink:0;">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <svg style="width:20px;height:20px;color:#0f4c75" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                                <span style="font-weight:600;color:#0f2b46;font-size:15px;">{{ $t('helpGuide.scheduleTitle') }}</span>
                            </div>
                            <button onclick="document.getElementById('help-guide-modal').style.display='none'" style="padding:8px;border-radius:8px;border:none;background:#f1f5f9;cursor:pointer;display:flex;align-items:center;color:#64748b;" title="Luk">
                                <svg style="width:18px;height:18px" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                        <iframe src="/vagtplan-guide.html" style="flex:1;border:none;width:100%;" :title="$t('helpGuide.title')"></iframe>
                    </div>
                </div>
                </div>
            </template>
            <template #guided-tour>
                <div class="flex items-center gap-2 flex-1">
                    <div class="flex-1"></div>
                    <!-- Uge/månedsvisning toggle - præcis som udgivet vagtplan -->
                    <div id="schedule-date-picker-target" class="flex items-center"></div>
                    <div class="hidden lg:block h-5 w-px bg-slate-200" />
                    <div class="flex items-center bg-surface-100 rounded-lg p-0.5">
                        <button @click="state.calendarView = 'week'"
                            :class="[state.calendarView === 'week' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700', 'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all']">
                            <Icon name="ph:columns" class="h-3.5 w-3.5" aria-hidden="true" />
                            {{ $t('calendar.view.weekView') }}
                        </button>
                        <button @click="state.calendarView = 'month'"
                            :class="[state.calendarView === 'month' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700', 'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all']">
                            <Icon name="ph:calendar-dots" class="h-3.5 w-3.5" aria-hidden="true" />
                            {{ $t('calendar.view.monthView') }}
                        </button>
                    </div>

                    <div class="hidden lg:block h-5 w-px bg-slate-200" />

                    <button @click="state.modal.isShowAllShiftTypes = !state.modal.isShowAllShiftTypes"
                        class="text-primary text-xs font-medium hover:text-primary-700 hidden lg:block">
                        {{ $t('dutySchedules.showTheDistributionOfShiftTypes') }}
                    </button>

                    <div class="hidden lg:block h-5 w-px bg-slate-200" />

                    <!-- Offentliggør - grøn og unik -->
                    <button
                        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm transition-all"
                        style="background: linear-gradient(135deg, #16a34a, #15803d); box-shadow: 0 2px 8px rgba(22,163,74,0.35)"
                        @click="state.modal.isPublishDraftOpen = true">
                        <Icon name="ph:rocket-launch" class="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{{ $t('dutySchedules.draft.publish') }}</span>
                    </button>
                </div>
            </template>

            <div class="space-y-2">

                <div class="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <div class="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </div>
                    <div>
                        <p class="text-sm font-semibold text-amber-800">{{ $t('dutySchedules.draft.contextBanner.title') }}</p>
                        <p class="text-xs text-amber-600 mt-0.5">{{ $t('dutySchedules.draft.contextBanner.selectedDepartment') }} <strong>{{ departmentStore.getSelectedDepartmentName }}</strong> — {{ $t('dutySchedules.draft.contextBanner.description') }}</p>
                    </div>
                </div>

                <ModulesUserDutyScheduleDraftWeekView
                    v-if="state.calendarView === 'week' && state.hasContext"
                    @openPresets="state.modal.isPresetsOpen = true"
                    @openSavePreset="state.modal.isSaveAsPresetOpen = true"
                    @openPublish="state.modal.isPublishDraftOpen = true"
                    @bannerClosed="state.hideBanner = true" />

                <!-- Månedsvisning for kladde - bruger den udgivede vagtplans måneds-komponent men i kladde-kontekst -->
                <div v-if="state.calendarView === 'month' && state.hasContext"
                    class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <svg class="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p class="text-sm font-semibold text-amber-800">{{ $t('dutySchedules.draft.monthViewDraft.title') }}</p>
                        <p class="text-xs text-amber-700 mt-1">{{ $t('dutySchedules.draft.monthViewDraft.message') }}</p>
                        <button @click="state.calendarView = 'week'" class="mt-2 text-xs font-semibold text-amber-800 underline hover:text-amber-900">
                            {{ $t('dutySchedules.draft.monthViewDraft.switchToWeekView') }}
                        </button>
                    </div>
                </div>
            </div>

            <ModulesUserDutyScheduleDraftModalShiftTypes :isModalOpen="state.modal.isShowAllShiftTypes"
                @close="state.modal.isShowAllShiftTypes = false" />
            <ModulesUserDutyScheduleDraftModalPublish :isModalOpen="state.modal.isPublishDraftOpen"
                @close="state.modal.isPublishDraftOpen = false" />
            <ModulesUserDutyScheduleDraftModalSelectDepartment
                :isModalOpen="state.modal.isSelectDepartmentModalOpen"
                @close="state.modal.isSelectDepartmentModalOpen = false"
                @select-department="selectDepartment" />
            <ModulesUserDutySchedulePresetsModalNew :isModalOpen="state.modal.isSaveAsPresetOpen"
                @close="state.modal.isSaveAsPresetOpen = false" />
            <ModulesUserDutySchedulePresetsModalTable :isModalOpen="state.modal.isPresetsOpen"
                @close="state.modal.isPresetsOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
import { useCustomPagesStore } from '@/store/custom-pages'
import { useDepartmentStore } from '@/store/department'

const customPagesStore = useCustomPagesStore() as any
const departmentStore = useDepartmentStore() as any

const state = reactive({
    calendarView: 'week' as 'week' | 'month',
    hasContext: true,
    hideBanner: false,
    modal: {
        isPublishDraftOpen: false,
        isShowAllShiftTypes: false,
        isSelectDepartmentModalOpen: false,
        isSaveAsPresetOpen: false,
        isPresetsOpen: false,
    },
})

onMounted(() => {
    if (!localStorage.getItem('schedulesDraftContextHidden')) {
        state.hasContext = false
        state.modal.isSelectDepartmentModalOpen = true
    }
})

function selectDepartment() {
    state.hasContext = true
    state.modal.isSelectDepartmentModalOpen = false
}
</script>
