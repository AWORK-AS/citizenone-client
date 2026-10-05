<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('inquiries.inquiries') }}
                    -
                    {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                {{ $t('inquiries.inquiries') }}
            </template>

            <div>
                <div class="flex justify-between items-center mb-5">
                    <div v-if="!pipelineEnabled" class="flex items-center gap-x-1">
                        <span>{{ $t('entriesPerPage') }}:</span>
                        <select class="focus:outline-none bg-transparent" @change="changePageLength"
                            id="inquiriesPageLength">
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                            <option value="40">40</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                            <option value="500">500</option>
                        </select>
                    </div>
                    <div class="flex items-center gap-x-3">
                        <!-- Lost cases per reason and what they would have been worth. -->
                        <FormButton v-if="pipelineEnabled && (isAtLeast('Manager') || can('update'))" buttonStyle="action"
                            @click="navigateTo('/inquiries/lost-report')">
                            <Icon name="ph:chart-bar" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('inquiryLost.report.open') }}
                        </FormButton>
                        <!-- One form needs no menu: the button opens it. -->
                        <Tooltip v-if="offeredForms.length === 1" :text="formLabel(offeredForms[0], builtinNames)">
                            <FormButton buttonStyle="action" @click="newInquiryOn(offeredForms[0])">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('inquiries.newInquiry') }}
                            </FormButton>
                        </Tooltip>
                        <Tooltip v-else-if="offeredForms.length === 0 && state.formsLoaded"
                            :text="$t('inquiryForms.noneActive')">
                            <FormButton buttonStyle="action" :disabled="true">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('inquiries.newInquiry') }}
                            </FormButton>
                        </Tooltip>
                        <Menu v-else as="div" class="relative inline-block text-left z-20">
                            <div>
                                <MenuButton>
                                    <FormButton buttonStyle="action">
                                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                        {{ $t('inquiries.newInquiry') }}
                                    </FormButton>
                                </MenuButton>
                            </div>

                            <transition enter-active-class="transition duration-100 ease-out"
                                enter-from-class="transform scale-95 opacity-0"
                                enter-to-class="transform scale-100 opacity-100"
                                leave-active-class="transition duration-75 ease-in"
                                leave-from-class="transform scale-100 opacity-100"
                                leave-to-class="transform scale-95 opacity-0">
                                <MenuItems
                                    class="absolute right-0 mt-2 min-w-44 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                                    <!-- The forms the company has switched on, in its own
                                         order (Indstillinger -> Henvendelsesformularer). -->
                                    <div class="px-1 py-1">
                                        <MenuItem v-for="form in offeredForms" :key="form.uuid || String(form.builtin)"
                                            v-slot="{ active }">
                                            <button :class="[
                                                active && 'bg-gray-100',
                                                'group flex w-full justify-start items-center rounded-md px-2 py-2.5 text-sm text-left',
                                            ]" @click="newInquiryOn(form)">
                                                {{ formLabel(form, builtinNames) }}
                                            </button>
                                        </MenuItem>
                                    </div>
                                </MenuItems>
                            </transition>
                        </Menu>

                        <Menu as="div" class="relative inline-block text-left z-20">
                            <div>
                                <MenuButton>
                                    <FormButton buttonStyle="action">
                                        <Icon name="ph:file-arrow-down" class="h-4 w-4" aria-hidden="true" />
                                        {{ $t('inquiries.exportInquiries') }}
                                    </FormButton>
                                </MenuButton>
                            </div>

                            <transition enter-active-class="transition duration-100 ease-out"
                                enter-from-class="transform scale-95 opacity-0"
                                enter-to-class="transform scale-100 opacity-100"
                                leave-active-class="transition duration-75 ease-in"
                                leave-from-class="transform scale-100 opacity-100"
                                leave-to-class="transform scale-95 opacity-0">
                                <MenuItems
                                    class="absolute right-0 mt-2 min-w-44 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                                    <div class="px-1 py-1">
                                        <MenuItem v-for="form in offeredForms" :key="form.uuid || String(form.builtin)"
                                            v-slot="{ active }">
                                            <button
                                                :class="[active && 'bg-gray-100', 'group flex w-full justify-start items-center rounded-md px-2 py-2.5 text-sm text-left']"
                                                @click="openExportModal(form)">
                                                {{ formLabel(form, builtinNames) }}
                                            </button>
                                        </MenuItem>
                                    </div>
                                </MenuItems>
                            </transition>
                        </Menu>
                    </div>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <!-- Inquiry pipeline (kanban) — opt-in per company -->
                    <p v-if="pipelineEnabled && boardOverflowCount > 0"
                        class="rounded-lg bg-[#fdf3df] px-3 py-2 text-xs font-medium text-[#8a6208]">
                        {{ $t('inquiryPipeline.tooManyToShow', { shown: boardShownCount, total: boardTotalCount }) }}
                    </p>
                    <p v-if="pipelineEnabled && state.unassignedConvertedCount > 0"
                        class="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#fdf3df] px-3 py-2 text-xs font-medium text-[#8a6208]">
                        <span>{{ $t('inquiryPipeline.unassignedConverted.banner', { count: state.unassignedConvertedCount }) }}</span>
                        <button type="button" class="font-semibold underline" @click="state.modal.isUnassignedConvertedOpen = true">
                            {{ $t('inquiryPipeline.unassignedConverted.claimCases') }}
                        </button>
                    </p>
                    <div v-if="pipelineEnabled" class="items-start gap-3.5 p-2"
                        :class="boardScrolls ? 'flex overflow-x-auto pr-4' : 'grid'"
                        :style="boardScrolls ? undefined : { gridTemplateColumns: `repeat(${state.pipelineStages.length}, minmax(0, 1fr))` }">
                        <div v-for="stage in state.pipelineStages" :key="stage.uuid"
                            class="min-h-[200px] rounded-[13px] bg-surface-50 p-2.5 transition-colors"
                            :class="[
                                boardScrolls ? 'w-[272px] shrink-0' : '',
                                dragOverKey === stage.slug ? 'ring-2 ring-secondary/50 bg-[#f0faf9]' : ''
                            ]"
                            @dragover.prevent="dragOverKey = stage.slug" @dragleave="dragOverKey = null"
                            @drop="onDrop(stage.slug)">
                            <div class="flex items-center gap-2 px-1.5 pb-2.5 pt-1">
                                <span class="size-[9px] rounded-[3px]" :style="{ background: stage.color }"></span>
                                <span class="truncate text-[12.5px] font-bold text-slate-700">
                                    {{ stage.name }}
                                </span>
                                <span
                                    class="ml-auto rounded-full bg-white px-2 py-px text-[11px] font-semibold text-slate-400">
                                    {{ inquiriesByStage(stage.slug).length }}
                                </span>
                            </div>
                            <div class="space-y-2.5">
                                <div v-for="inq in inquiriesByStage(stage.slug)" :key="inq.uuid" draggable="true"
                                    @dragstart="onDragStart(inq)" @dragend="dragOverKey = null"
                                    @click="openInquiry(inq)"
                                    class="group cursor-pointer rounded-[11px] bg-white border border-surface-200 p-3 shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:border-[#cfe3ea] hover:shadow-card-hover active:cursor-grabbing"
                                    :class="dragged?.uuid === inq.uuid ? 'opacity-40' : ''">
                                    <p class="text-[11px] font-bold text-secondary">
                                        {{ inq.inquirer_name || $t('inquiries.inquiries') }}
                                    </p>
                                    <p class="mt-0.5 text-[13.5px] font-bold leading-snug text-slate-900">
                                        {{ inqTitle(inq) }}
                                    </p>
                                    <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
                                        <span v-if="inq.origin"
                                            class="inline-flex items-center rounded-full px-2.5 py-[3px] text-[11.5px] font-bold"
                                            :class="inq.origin === 'authority'
                                                ? 'bg-[#eee9fb] text-[#6b54c9]'
                                                : 'bg-[#dcf1f7] text-[#1b6d8a]'">
                                            {{ $t('inquiryOrigin.' + inq.origin) }}
                                        </span>
                                        <span v-if="inqSource(inq)"
                                            class="inline-flex items-center rounded-full bg-surface-100 px-2.5 py-[3px] text-[11.5px] font-bold text-slate-500">
                                            {{ inqSource(inq) }}
                                        </span>
                                        <span v-for="(dept, di) in inq.departments" :key="'d' + di"
                                            class="inline-flex items-center rounded-full bg-[#dcf1f7] px-2.5 py-[3px] text-[11.5px] font-bold text-[#1b6d8a]">
                                            {{ dept?.name }}
                                        </span>
                                        <span v-for="(topic, ti) in inq.topics" :key="'t' + ti"
                                            class="inline-flex items-center rounded-full bg-surface-100 px-2.5 py-[3px] text-[11.5px] font-semibold text-slate-500">
                                            {{ topic?.name }}
                                        </span>
                                        <span v-if="inq.outcome"
                                            class="inline-flex items-center rounded-full bg-[#fdf3df] px-2.5 py-[3px] text-[11.5px] font-bold text-[#c98a12]">
                                            {{ inq.outcome }}
                                        </span>
                                        <span v-if="inq.citizen_id"
                                            class="inline-flex items-center gap-1 rounded-full bg-[#e6f6ee] px-2.5 py-[3px] text-[11.5px] font-bold text-[#1f9d6b]">
                                            <Icon name="ph:check" class="size-3" /> {{
                                                tt('inquiries.table.status.convertedAsCitizen') }}
                                        </span>
                                    </div>
                                    <!-- Won inquiry → create a citizen case directly from the card -->
                                    <button v-if="stage.system_role === 'won' && !inq.citizen_id" type="button"
                                        @click.stop="convertInquiryConfirmation(inq)"
                                        class="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-[#1f9d6b]/30 bg-[#e6f6ee] px-2.5 py-1 text-[11px] font-semibold text-[#177a53] transition-colors hover:bg-[#d3efe1]">
                                        <Icon name="ph:user-plus" class="size-3.5" />
                                        {{ tt('inquiries.table.actions.convertAsCitizen') }}
                                    </button>
                                    <div
                                        class="mt-3 flex items-center justify-between border-t border-surface-100 pt-2.5">
                                        <div class="flex items-center gap-2">
                                            <div
                                                class="grid size-[22px] place-items-center rounded-[7px] bg-gradient-to-br from-[#8fd6ea] to-[#3aa7c4] text-[10px] font-bold text-white">
                                                {{ inqInitials(inq) }}
                                            </div>
                                            <span class="text-[11px] text-slate-400">
                                                {{ formatDateToReadable(inq.inquiry_date) }}
                                            </span>
                                        </div>
                                        <Icon name="ph:dots-six-vertical"
                                            class="size-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                                    </div>
                                </div>
                                <p v-if="inquiriesByStage(stage.slug).length === 0"
                                    class="px-1.5 py-6 text-center text-xs text-slate-300">-</p>
                            </div>
                        </div>
                    </div>

                    <template v-if="!pipelineEnabled">
                        <TableSearch @search="handleSearch" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.inquiries"
                                :isLoading="state.isTableLoading" :sortData="inquiryStore.getSortData" @sort="sort">
                                <template #body v-if="!(state.isTableLoading || (state.inquiries?.data?.length === 0))">
                                    <tr v-for="(inquiry, index) in state.inquiries?.data" :key="index">
                                        <td width="15%">
                                            {{ formatDateToReadable(inquiry?.inquiry_date) }}
                                        </td>
                                        <td width="15%">
                                            <Badge :type="inquiry?.citizen_id ? 'active' : 'primary'" class="w-fit">
                                                <p class="text-xxs truncate">
                                                    {{ inquiry?.citizen_id ?
                                                        tt('inquiries.table.status.convertedAsCitizen') :
                                                        $t('inquiries.table.status.forConversion') }}
                                                </p>
                                            </Badge>
                                        </td>
                                        <td width="15%">
                                            <span>{{ inquiry?.inquirer_name }}</span>
                                        </td>
                                        <td width="10%">
                                            <span>{{ inquiry?.firstname }}</span>
                                        </td>
                                        <td width="10%">
                                            <span>{{ inquiry?.lastname }}</span>
                                        </td>
                                        <td width="10%">
                                            <div class="flex flex-wrap gap-1">
                                                <span v-for="(dept, di) in inquiry?.departments" :key="di"
                                                    class="bg-primary px-2 py-1 text-white text-xxs rounded-md">
                                                    {{ dept?.name }}
                                                </span>
                                            </div>
                                        </td>
                                        <td width="10%">
                                            <span>{{ inquiry?.outcome }}</span>
                                        </td>
                                        <td width="10%">
                                            <span>{{ inquiry?.purpose }}</span>
                                        </td>
                                        <td width="15%">
                                            <span>{{ inquiry?.conversation_summary }}</span>
                                        </td>
                                        <td width="10%">
                                            <div class="flex items-end justify-end gap-2">
                                                <Tooltip :text="$t('inquiries.table.actions.edit')">
                                                    <FormButton :aria-label="$t('inquiries.table.actions.edit')" type="button" buttonStyle="action"
                                                        @click="editInquiry(inquiry)">
                                                        <Icon name="ph:pencil-simple" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                                <Tooltip :text="tt('inquiries.table.actions.convertAsCitizen')"
                                                    v-if="!inquiry?.citizen_id">
                                                    <FormButton :aria-label="tt('inquiries.table.actions.convertAsCitizen')" type="button" buttonStyle="action"
                                                        @click="convertInquiryConfirmation(inquiry)">
                                                        <Icon name="ph:check" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                                <Tooltip :text="$t('inquiries.table.actions.delete')">
                                                    <FormButton :aria-label="$t('inquiries.table.actions.delete')" type="button" buttonStyle="danger"
                                                        @click="deleteConfirmation(inquiry)">
                                                        <Icon name="ph:trash" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.inquiries" @previous="previous" @next="next" />
                    </template>
                </div>
            </div>

            <ModulesUserInquiryModalNew v-if="state.newInquiryForm" :key="state.newInquiryForm.uuid || String(state.newInquiryForm.builtin)"
                :isModalOpen="state.modal.isAddInquiryOpen" :inquiry-type="state.newInquiryForm.inquiry_type"
                :form="state.newInquiryForm.uuid ? state.newInquiryForm : undefined"
                @close="state.modal.isAddInquiryOpen = false" @refreshInquiries="fetchInquiries" />
            <ModulesUserInquiryModalEdit :isModalOpen="state.modal.isEditInquiryOpen"
                :selectedInquiry="state.selectedInquiry" @close="state.modal.isEditInquiryOpen = false"
                @refreshInquiries="fetchInquiries" />

            <ModulesUserInquiryModalMarkLost :isModalOpen="pendingLost !== null" @close="pendingLost = null"
                @confirm="confirmLost" />

            <ModulesUserInquiryModalUnassignedConverted :isModalOpen="state.modal.isUnassignedConvertedOpen"
                @close="state.modal.isUnassignedConvertedOpen = false" @claimed="fetchUnassignedConvertedCount" />

            <DialogConfirmation :isModalOpen="state.modal.isConvertInquiryOpen"
                :message="$t('inquiries.table.confirmation.convertAsCitizenConfirmation') + '?'"
                @close="state.modal.isConvertInquiryOpen = false" @confirm="convertInquiry" />
            <DialogConfirmation :isModalOpen="state.modal.isDeleteInquiryOpen"
                :message="$t('inquiries.table.confirmation.deleteInquiryConfirmation') + '?'"
                @close="state.modal.isDeleteInquiryOpen = false" @confirm="deleteInquiry" />

            <ModulesUserCitizenModalExportInquiries :isModalOpen="state.modal.isExportDepartmentOpen"
                :title="exportModalTitle" :departmentOptions="exportDepartmentOptions"
                @close="state.modal.isExportDepartmentOpen = false" @confirm="confirmExport" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'require-page', requiredPage: 'Inquiries', requiredCompanyFlag: 'inquiry_pipeline_enabled' })

import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { citizenInquiryService } from '@/components/api/user/CitizenInquiryService'
import { inquiryPipelineStageService } from '@/components/api/user/InquiryPipelineStageService'
import { inquiryFormService } from '@/components/api/user/InquiryFormService'
import { activeForms, formLabel, type InquiryForm } from '@/composables/inquiryForms'
import { departmentService } from '@/components/api/user/DepartmentService'
import { useInquiryStore } from '@/store/inquiry'
import { useDepartmentStore } from '@/store/department'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'
import { saveAs } from 'file-saver'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useUserStore } from '@/store/user'
import { usePermissions } from '@/composables/usePermissions'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const inquiryStore = useInquiryStore() as any
const departmentStore = useDepartmentStore()
const { formatDateToReadable } = useDatetimeFormatter()
const customPagesStore = useCustomPagesStore() as any
const { successAlert, errorAlert } = useAlert()
const { tt } = useTerminology()
const { t } = useI18n()

// Inquiry pipeline (kanban) — opt-in per company.
const pipelineEnabled = computed(() => !!userStore.getUser?.company?.inquiry_pipeline_enabled)
const { isAtLeast, can } = usePermissions()
// The mockup's board shares the width between the columns rather than scrolling
// sideways. Stages are configurable, though, so past six columns there is not
// enough room to read a card and the row scrolls instead.
const MAX_FITTED_COLUMNS = 6
const boardScrolls = computed(() => state.pipelineStages.length > MAX_FITTED_COLUMNS)

// The board asks for far more rows than the table's page size, since a column
// with a missing card is worse than a slow first load.
const BOARD_PAGE_LENGTH = 500

const boardTotalCount = computed(() => state.inquiries?.meta?.total ?? 0)
const boardShownCount = computed(() => state.inquiries?.data?.length ?? 0)
const boardOverflowCount = computed(() => Math.max(0, boardTotalCount.value - boardShownCount.value))

// The stages are configured per company, so they come from the API. Renaming or
// adding a stage in the settings shows up here without a release.
const entryStageSlug = computed(() =>
    state.pipelineStages.find((s: any) => s.system_role === 'new')?.slug
    ?? state.pipelineStages[0]?.slug
    ?? 'new'
)

function inquiriesByStage(slug: string) {
    const known = state.pipelineStages.map((s: any) => s.slug)
    return (state.inquiries?.data ?? []).filter((i: any) => {
        const status = i.pipeline_status
        // An inquiry with no status, or one left behind by a deleted stage,
        // belongs in the entry column rather than nowhere.
        const resolved = status && known.includes(status) ? status : entryStageSlug.value
        return resolved === slug
    })
}
function inqTitle(inq: any) {
    return inq?.purpose || `${inq?.firstname ?? ''} ${inq?.lastname ?? ''}`.trim() || inq?.inquirer_name || '-'
}
function inqSource(inq: any) {
    return inq?.contacted_by || inq?.inquiry_type || ''
}
function inqInitials(inq: any) {
    const src = (inq?.inquirer_name || `${inq?.firstname ?? ''} ${inq?.lastname ?? ''}`).trim()
    // Only name-like words count: a trailing "(privat)" or "-" would otherwise
    // become the second initial.
    const parts = src.split(/\s+/).filter((word: string) => /^\p{L}/u.test(word))
    if (!parts.length) return '?'
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}
// Drag and drop between pipeline columns.
const dragged = ref<any>(null)
const dragOverKey = ref<string | null>(null)
function onDragStart(inq: any) {
    dragged.value = inq
}
function onDrop(stageSlug: string) {
    dragOverKey.value = null
    const inq = dragged.value
    dragged.value = null
    if (inq && (inq.pipeline_status || entryStageSlug.value) !== stageSlug) {
        moveStage(inq, stageSlug)
    }
}

// Dropping a card on the lost stage asks why first.
const pendingLost = ref<{ inquiry: any, status: string } | null>(null)

function confirmLost(details: Record<string, any>) {
    const pending = pendingLost.value
    pendingLost.value = null
    if (pending) {
        moveStage(pending.inquiry, pending.status, details)
    }
}

async function moveStage(inquiry: any, status: string, details: Record<string, any> | null = null) {
    const target = state.pipelineStages.find((stage: any) => stage.slug === status)
    if (target?.system_role === 'lost' && details === null) {
        pendingLost.value = { inquiry, status }
        return
    }

    try {
        const response = await citizenInquiryService.updatePipelineStatus(inquiry.uuid, { pipeline_status: status, ...(details ?? {}) })
        if (response?.data) {
            fetchInquiries()
            successAlert(`${t('alert.success')}!`, `${t('inquiryPipeline.moved')}.`)
        }
    } catch (error: any) {
        state.error = error
        // A move refused because the stage's required fields are unanswered is
        // the common case, and the card is where the answer gets filled in - so
        // say it on the spot and offer the way to fix it.
        errorAlert(t('alert.warning'), error?.message ?? t('inquiryPipeline.moveFailed'))
        if (error?.missing_fields?.length) {
            openInquiry(inquiry)
        }
    }
}

const shelterName = computed(() => customPagesStore.getCustomPagesName?.shelter || t('inquiries.form.options.inquiryType.shelter'))
const crisisCenterName = computed(() => customPagesStore.getCustomPagesName?.crisisCenter || t('inquiries.form.options.inquiryType.crisisCenter'))

const builtinNames = computed(() => ({ shelter: shelterName.value, crisisCenter: crisisCenterName.value }))
const exportModalTitle = computed(() => formLabel(state.exportForm, builtinNames.value))

// Until the company's forms have loaded, or when they could not be, the two
// built-in forms as they always were: nobody is left without a way to take
// an inquiry.
const FALLBACK_FORMS: InquiryForm[] = [
    { uuid: '', name: null, builtin: 'shelter', base: 'shelter', inquiry_type: 'shelter', core_fields: null as any, is_active: true, sort_order: 0 },
    { uuid: '', name: null, builtin: 'crisis_center', base: 'crisis_center', inquiry_type: 'crisis_center', core_fields: null as any, is_active: true, sort_order: 1 },
]
const offeredForms = computed(() => state.formsLoaded ? activeForms(state.forms) : FALLBACK_FORMS)
const exportDepartmentOptions = computed(() => [
    ...state.departments.map((d: any) => ({ value: d.uuid, label: d.name })),
])

const breadcrumbLinks = [
    {
        name: 'inquiries.inquiries',
        translate: true,
        href: `/inquiries`,
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'inquiries.table.dateOfInquiry', isTranslateName: true, sorter: true, key: 'inquiry_date' },
        { name: 'inquiries.table.status.status', isTranslateName: true, sorter: true, key: 'citizen_id' },
        { name: 'inquiries.table.inquirerName', isTranslateName: true, sorter: true, key: 'inquirer_name' },
        { name: 'inquiries.table.firstname', isTranslateName: true, sorter: true, key: 'firstname' },
        { name: 'inquiries.table.lastname', isTranslateName: true, sorter: true, key: 'lastname' },
        { name: 'department.department', isTranslateName: true, },
        { name: 'inquiries.table.outcome', isTranslateName: true, },
        { name: 'inquiries.table.purpose', isTranslateName: true, },
        { name: 'inquiries.table.conversationSummary', isTranslateName: true, },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    departments: [] as any,
    error: {} as Error,
    isTableLoading: false,
    inquiries: [] as any,
    modal: {
        isAddInquiryOpen: false,
        isConvertInquiryOpen: false,
        isEditInquiryOpen: false,
        isDeleteInquiryOpen: false,
        isExportDepartmentOpen: false,
        isUnassignedConvertedOpen: false,
    },
    selectedInquiry: {} as any,
    forms: [] as InquiryForm[],
    formsLoaded: false,
    newInquiryForm: null as InquiryForm | null,
    exportForm: null as InquiryForm | null,
    pipelineStages: [] as any[],
    unassignedConvertedCount: 0,
})

onMounted(() => {
    fetchDepartments()
    fetchInquiries()
    fetchForms()
    if (pipelineEnabled.value) {
        fetchPipelineStages()
        fetchUnassignedConvertedCount()
    }
})

async function fetchUnassignedConvertedCount() {
    try {
        const response = await citizenInquiryService.getUnassignedConverted()
        state.unassignedConvertedCount = response?.data?.length ?? 0
    } catch {
        // The daily overview swallows this same call for the same reason: a
        // company without the app should never see an error for a banner it
        // was never going to show anyway.
        state.unassignedConvertedCount = 0
    }
}

async function fetchPipelineStages() {
    try {
        const response = await inquiryPipelineStageService.getStages()
        state.pipelineStages = response?.data ?? []
    } catch (_) {
        state.pipelineStages = []
    }
}

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchInquiries()
    }
})

async function fetchInquiries() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName,
            // The board has no pages - every card has to be in its column, or a
            // count is wrong and an inquiry is invisible. The table keeps its
            // own paging.
            page: pipelineEnabled.value ? 1 : inquiryStore.getCurrentPageNumber,
            page_length: pipelineEnabled.value ? BOARD_PAGE_LENGTH : inquiryStore.getCurrentPageLength,
            sortField: inquiryStore.getSortData.sortField,
            sortOrder: inquiryStore.getSortData.sortOrder,
            ...state.dataFilter
        }
        const response = await citizenInquiryService.getInquiries(params)
        if (response) {
            state.inquiries = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    const currentTablePage = inquiryStore.getCurrentPageNumber - 1
    inquiryStore.setCurrentPageNumber(currentTablePage)
    fetchInquiries()
}

function next() {
    const currentTablePage = inquiryStore.getCurrentPageNumber + 1
    inquiryStore.setCurrentPageNumber(currentTablePage)
    fetchInquiries()
}

function sort(sortingData: any) {
    inquiryStore.setCurrentPageNumber(1)
    const sortField = sortingData.column
    const sortOrder = sortingData.sort
    inquiryStore.setSortData(sortField, sortOrder)
    fetchInquiries()
}

function handleSearch(value: any) {
    inquiryStore.setCurrentPageNumber(1)
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchInquiries()
}

function changePageLength(event: any) {
    inquiryStore.setCurrentPageNumber(1)
    inquiryStore.setCurrentPageLength(event.target.value)
    fetchInquiries()
}

// Opening a card means reading the case, which is a page of its own - the
// stepper and the side panels do not belong in a modal.
function openInquiry(inquiry: any) {
    navigateTo(`/inquiries/${inquiry.uuid}`)
}

function editInquiry(inquiry: any) {
    state.selectedInquiry = inquiry
    state.modal.isEditInquiryOpen = true
}

function convertInquiryConfirmation(inquiry: any) {
    state.selectedInquiry = inquiry
    state.modal.isConvertInquiryOpen = true
}

async function convertInquiry() {
    state.error = {}
    state.isTableLoading = true
    try {
        const inquiryUuid = state.selectedInquiry?.uuid
        const response = await citizenInquiryService.convertInquiry(inquiryUuid)
        if (response) {
            fetchInquiries()
            successAlert(`${t('alert.success')}!`, `${t('inquiries.table.alert.participantSuccessfullyConvertedAsCitizen')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function newInquiryOn(form: InquiryForm) {
    state.newInquiryForm = form
    state.modal.isAddInquiryOpen = true
}

async function fetchForms() {
    try {
        const response = await inquiryFormService.getForms()
        state.forms = response?.data ?? []
        state.formsLoaded = true
    } catch (_) {
        // Keep the built-in fallback rather than an empty menu.
        state.formsLoaded = false
    }
}

function deleteConfirmation(inquiry: any) {
    state.selectedInquiry = inquiry
    state.modal.isDeleteInquiryOpen = true
}

async function deleteInquiry() {
    state.error = {}
    state.isTableLoading = true
    try {
        const inquiryUuid = state.selectedInquiry?.uuid
        const response = await citizenInquiryService.deleteInquiry(inquiryUuid)
        if (response) {
            fetchInquiries()
            successAlert(`${t('alert.success')}!`, `${t('inquiries.table.alert.inquirySuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function fetchDepartments() {
    try {
        const response = await departmentService.getAllDepartments({})
        if (response) {
            state.departments = response.data
        }
    } catch (error: any) {
        state.error = error
    }
}

function openExportModal(form: InquiryForm) {
    state.exportForm = form
    state.modal.isExportDepartmentOpen = true
}

async function confirmExport(departmentUuid: string) {
    const dept = state.departments.find((d: any) => d.uuid === departmentUuid)
    const form = state.exportForm
    await exportInquiries({
        // A built-in form exports in its § 110/§ 109 shape; a company's own
        // form by itself, with its own fields.
        inquiry_type: form?.builtin ?? undefined,
        inquiry_form_uuid: form && !form.builtin ? form.uuid : undefined,
        label: formLabel(form, builtinNames.value),
        department: dept?.name,
        department_uuid: dept?.uuid,
    })
    state.modal.isExportDepartmentOpen = false
}

async function exportInquiries(params: { inquiry_type?: string, inquiry_form_uuid?: string, label: string, department?: string, department_uuid?: string }) {
    state.error = {}
    state.isTableLoading = true
    try {
        const queryParams = {
            ...(params.inquiry_type ? { inquiry_type: params.inquiry_type } : {}),
            ...(params.inquiry_form_uuid ? { inquiry_form_uuid: params.inquiry_form_uuid } : {}),
            department: params.department ?? departmentStore.getSelectedDepartmentName,
            department_uuid: params.department_uuid ?? departmentStore.getSelectedDepartment,
        }
        const response = await citizenInquiryService.exportInquiries(queryParams)
        if (response) {
            const fileName = params.inquiry_type === 'shelter'
                ? t('inquiries.shelterInquiry')
                : params.inquiry_type === 'crisis_center' ? t('inquiries.crisisCenterInquiry') : params.label
            saveAs(response, `${customPagesStore.getCustomPagesName?.citizens}-${fileName}`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>