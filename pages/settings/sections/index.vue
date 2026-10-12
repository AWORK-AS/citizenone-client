<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t(pageTitleKey) }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t(pageTitleKey) }}</template>

            <!-- Companies with the inquiry pipeline: one list. Each paragraph is
                 also the service type an inquiry is registered under, so it is
                 kept the way the old service types page kept them. -->
            <div v-if="isPipeline" class="mt-8 space-y-5">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <p class="max-w-2xl text-sm text-gray-500">{{ $t('sections.list.description') }}</p>

                <div class="rounded-lg border border-gray-200 bg-white">
                    <div class="flex flex-wrap items-end gap-3 border-b border-gray-100 px-4 py-3">
                        <div class="w-64">
                            <FormLabel for="new-name" :label="$t('sections.form.name')" />
                            <FormTextField id="new-name" name="new-name" v-model="state.draft.name" :maxLength="120" />
                        </div>
                        <div class="w-44">
                            <FormLabel for="new-paragraph" :label="$t('sections.form.paragraph')" />
                            <FormTextField id="new-paragraph" name="new-paragraph" v-model="state.draft.paragraph"
                                :placeholder="$t('sections.form.paragraphPlaceholder')" :maxLength="60" />
                        </div>
                        <div class="w-40">
                            <FormLabel for="new-rate" :label="$t('sections.list.hourlyRate')" />
                            <FormNumberField id="new-rate" name="new-rate" :min="0" v-model="state.draft.hourly_rate"
                                :placeholder="$t('sections.list.hourlyRatePlaceholder')" />
                        </div>
                        <FormButton type="button" buttonStyle="action"
                            :disabled="!state.draft.name.trim() || state.isSaving" @click="add">
                            <Icon name="ph:plus" class="size-4" />
                            {{ $t('sections.list.add') }}
                        </FormButton>
                        <div class="w-full sm:ml-auto sm:w-56">
                            <FormTextField id="sections-search" name="sections-search" v-model="state.search"
                                :placeholder="$t('sections.list.search')" />
                        </div>
                    </div>

                    <p v-if="!state.isLoading && !state.rows.length" class="px-4 py-5 text-sm text-gray-400">
                        {{ $t('sections.list.empty') }}
                    </p>
                    <p v-else-if="!state.isLoading && !visibleRows.length" class="px-4 py-5 text-sm text-gray-400">
                        {{ $t('sections.list.noMatch') }}
                    </p>

                    <div v-for="(row, index) in visibleRows" :key="row.uuid"
                        class="flex flex-wrap items-center gap-3 border-b border-gray-50 px-4 py-2.5 last:border-b-0">
                        <div class="min-w-0 flex-1">
                            <template v-if="state.editing === row.uuid">
                                <div class="flex flex-wrap gap-3">
                                    <div class="w-56">
                                        <FormTextField :id="`name-${row.uuid}`" :name="`name-${row.uuid}`"
                                            v-model="state.edit.name" :placeholder="row.name" :maxLength="120" />
                                    </div>
                                    <div class="w-40">
                                        <FormTextField :id="`par-${row.uuid}`" :name="`par-${row.uuid}`"
                                            v-model="state.edit.paragraph"
                                            :placeholder="$t('sections.form.paragraphPlaceholder')" :maxLength="60" />
                                    </div>
                                    <div v-if="row.service_type" class="w-36">
                                        <FormNumberField :id="`rate-${row.uuid}`" :name="`rate-${row.uuid}`" :min="0"
                                            v-model="state.edit.hourly_rate"
                                            :placeholder="$t('sections.list.hourlyRate')" />
                                    </div>
                                </div>
                            </template>
                            <template v-else>
                                <p class="text-sm font-medium text-gray-900"
                                    :class="row.service_type && !row.service_type.is_active && 'text-gray-400 line-through'">
                                    {{ row.label ?? row.name }}
                                </p>
                                <div v-if="row.service_type"
                                    class="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                                    <span>{{ rateText(row) }}</span>
                                    <!-- Read-only: the framework is the focus-area field the
                                         form asks, which is set under Inquiry fields. -->
                                    <Tooltip v-if="row.service_type.framework" :text="$t('sections.list.frameworkHint')">
                                        <NuxtLink to="/settings/inquiry-fields"
                                            class="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-600 hover:text-gray-900">
                                            {{ $t('sections.list.framework') }}:
                                            {{ $t(`sections.list.frameworks.${row.service_type.framework}`) }}
                                        </NuxtLink>
                                    </Tooltip>
                                    <span v-if="!row.service_type.is_active">{{ $t('sections.list.inactive') }}</span>
                                </div>
                            </template>
                        </div>

                        <div class="flex items-center gap-2">
                            <template v-if="state.editing === row.uuid">
                                <FormButton type="button" buttonStyle="cancel" @click="state.editing = ''">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="primary"
                                    :disabled="!state.edit.name.trim() || state.isSaving" @click="save(row)">
                                    {{ $t('save') }}
                                </FormButton>
                            </template>
                            <template v-else>
                                <!-- The order the inquiry's dropdown shows them in. -->
                                <template v-if="row.service_type && !state.search.trim()">
                                    <Tooltip :text="$t('inquiryPipelineStages.actions.moveUp')">
                                        <FormButton type="button" buttonStyle="action" :disabled="index === 0"
                                            :aria-label="$t('inquiryPipelineStages.actions.moveUp')"
                                            @click="move(index, -1)">
                                            <Icon name="ph:arrow-up" class="size-4" />
                                        </FormButton>
                                    </Tooltip>
                                    <Tooltip :text="$t('inquiryPipelineStages.actions.moveDown')">
                                        <FormButton type="button" buttonStyle="action"
                                            :disabled="index === visibleRows.length - 1"
                                            :aria-label="$t('inquiryPipelineStages.actions.moveDown')"
                                            @click="move(index, 1)">
                                            <Icon name="ph:arrow-down" class="size-4" />
                                        </FormButton>
                                    </Tooltip>
                                </template>
                                <Tooltip v-if="row.service_type" :text="row.service_type.is_active
                                    ? $t('consultantSkills.deactivate')
                                    : $t('consultantSkills.activate')">
                                    <FormButton type="button" buttonStyle="action"
                                        :aria-label="row.service_type.is_active
                                            ? $t('consultantSkills.deactivate')
                                            : $t('consultantSkills.activate')"
                                        @click="toggleActive(row)">
                                        <Icon :name="row.service_type.is_active ? 'ph:eye' : 'ph:eye-slash'"
                                            class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <FormButton type="button" buttonStyle="action"
                                    :aria-label="$t('sections.table.actions.edit')" @click="startEdit(row)">
                                    <Icon name="ph:pencil-simple" class="size-4" />
                                </FormButton>
                                <FormButton type="button" buttonStyle="danger"
                                    :aria-label="$t('sections.table.actions.delete')"
                                    @click="deleteSectionConfirmation(row)">
                                    <Icon name="ph:trash" class="size-4" />
                                </FormButton>
                            </template>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" @click="navigateTo('/settings/sections/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('sections.addNewSection') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.sections"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.sections?.data?.length === 0))">
                                <tr v-for="(section, index) in state.sections?.data" :key="index">
                                    <td width="70%">
                                        <span>{{ section?.label ?? section?.name }}</span>
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/settings/sections/${section.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('sections.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="deleteSectionConfirmation(section)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('sections.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.sections" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteSectionOpen"
                :message="$t('sections.table.confirmation.deleteSectionConfirmation') + '?'"
                @close="state.modal.isDeleteSectionOpen = false" @confirm="deleteSection" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { sectionService } from '@/components/api/user/SectionService'
import { inquiryServiceTypeService } from '@/components/api/user/InquiryServiceTypeService'
import { inquiryOfferService } from '@/components/api/user/InquiryOfferService'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any
let currentTablePage = 1

// The same gate as the rest of the inquiry settings. The backend keeps each
// paragraph's service type for these companies only.
const isPipeline = computed(() => !!userStore.getUser?.company?.inquiry_pipeline_enabled)
const pageTitleKey = computed(() => isPipeline.value ? 'sections.sectionsAndServiceTypes' : 'sections.sections')
const breadcrumbLinks = computed(() => [
    {
        name: pageTitleKey.value,
        translate: true,
        href: '/settings/sections',
    },
])

const state = reactive({
    columnHeaders: [
        { name: 'sections.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: '' }
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteSectionOpen: false,
    },
    pagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
    },
    sections: [] as any,
    selectedSection: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
    // The one-list view (pipeline companies).
    rows: [] as any[],
    search: '',
    draft: emptyDraft(),
    edit: emptyDraft(),
    editing: '',
    isLoading: false,
    isSaving: false,
})

const visibleRows = computed(() => {
    const term = state.search.trim().toLowerCase()
    if (!term) return state.rows

    return state.rows.filter((row: any) => `${row.label ?? ''} ${row.name ?? ''}`.toLowerCase().includes(term))
})

onMounted(() => {
    refresh()
})

// The user can arrive after the page mounts.
watch(isPipeline, () => refresh())

function refresh() {
    return isPipeline.value ? fetchRows() : fetchSections()
}

async function fetchSections() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await sectionService.getSections(params)
        if (response) {
            state.sections = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchSections()
}

function next() {
    currentTablePage++
    fetchSections()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchSections()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] === '' ? [] : value
    fetchSections()
}

function deleteSectionConfirmation(section: any) {
    state.selectedSection = section
    state.modal.isDeleteSectionOpen = true
}

async function deleteSection() {
    state.error = {}

    if (isPipeline.value) {
        state.modal.isDeleteSectionOpen = false
        try {
            await sectionService.deleteSection(state.selectedSection.uuid)
            successAlert(`${t('alert.success')}!`, `${t('sections.alert.sectionSuccessfullyDeleted')}.`)
        } catch (error: any) {
            // The refusal says what still uses it and to turn it off instead.
            failed(error, 'deleteFailed')
        }
        await fetchRows()

        return
    }

    state.isTableLoading = true
    try {
        const response = await sectionService.deleteSection(state.selectedSection.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchSections()
            successAlert(`${t('alert.success')}!`, `${t('sections.alert.sectionSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

// One list (pipeline companies)

function emptyDraft() {
    return { name: '', paragraph: '', hourly_rate: '' }
}

async function fetchRows() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await sectionService.getAllSections()
        const last = Number.MAX_SAFE_INTEGER
        // In the order the inquiry's dropdown shows them.
        state.rows = [...(response?.data ?? [])].sort((a: any, b: any) =>
            (a.service_type?.sort_order ?? last) - (b.service_type?.sort_order ?? last) || a.id - b.id)
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function add() {
    state.isSaving = true
    try {
        const response = await sectionService.saveSection({
            name: state.draft.name.trim(),
            paragraph: state.draft.paragraph.trim() || null,
        })
        await saveRateOrWarn(response?.data, state.draft.hourly_rate)
        state.draft = emptyDraft()
        await fetchRows()
    } catch (error: any) {
        failed(error, 'saveFailed')
    }
    state.isSaving = false
}

function startEdit(row: any) {
    const rate = row.service_type?.current_rate?.hourly_rate
    state.editing = row.uuid
    state.edit = {
        name: row.name ?? '',
        paragraph: row.paragraph ?? '',
        hourly_rate: rate === null || rate === undefined ? '' : String(Number(rate)),
    }
}

async function save(row: any) {
    state.isSaving = true
    try {
        const response = await sectionService.updateSection(row.uuid, {
            name: state.edit.name.trim(),
            paragraph: state.edit.paragraph.trim() || null,
        })
        await saveRateOrWarn(response?.data, state.edit.hourly_rate)
        state.editing = ''
        await fetchRows()
    } catch (error: any) {
        failed(error, 'saveFailed')
    }
    state.isSaving = false
}

/**
 * The standard hourly rate is a revision on the service type from today, so
 * offers already made keep the rate they were made with. A second change the
 * same day corrects today's revision, since only one may start per day. An
 * empty field leaves the rates as they are.
 */
async function saveRateOrWarn(row: any, value: any) {
    const type = row?.service_type
    if (!type || value === '' || value === null || value === undefined) return

    const hourlyRate = Number(value)
    const current = type.current_rate
    if (current && Number(current.hourly_rate) === hourlyRate) return

    try {
        if (current?.valid_from === today()) {
            await inquiryOfferService.updateRate(current.uuid, { hourly_rate: hourlyRate })
            return
        }

        await inquiryOfferService.saveRate({
            inquiry_service_type_uuid: type.uuid,
            valid_from: today(),
            hourly_rate: hourlyRate,
            // Carried over, so a new standard rate does not clear them.
            admin_hourly_rate: current?.admin_hourly_rate ?? null,
            transport_hourly_rate: current?.transport_hourly_rate ?? null,
            note: current?.note ?? null,
        })
    } catch (error: any) {
        failed(error, 'rateFailed')
    }
}

async function toggleActive(row: any) {
    try {
        await inquiryServiceTypeService.updateServiceType(row.service_type.uuid, { is_active: !row.service_type.is_active })
    } catch (error: any) {
        failed(error, 'saveFailed')
    }
    await fetchRows()
}

async function move(index: number, direction: number) {
    const target = index + direction
    if (target < 0 || target >= state.rows.length) return

    const reordered = [...state.rows]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(target, 0, moved)
    state.rows = reordered

    try {
        await inquiryServiceTypeService.reorderServiceTypes(
            reordered.map((row: any) => row.service_type?.uuid).filter(Boolean))
    } catch (error: any) {
        state.error = error
    }
    await fetchRows()
}

function rateText(row: any) {
    const rate = row.service_type?.current_rate?.hourly_rate
    if (rate === null || rate === undefined || rate === '') return t('sections.list.noRate')

    const amount = Number(rate).toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    return `${t('sections.list.hourlyRate')}: ${amount} kr. ${t('sections.list.perHour')}`
}

function today() {
    const now = new Date()

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function failed(error: any, key: string) {
    const first = error?.errors ? Object.values(error.errors)[0] as any : null

    errorAlert(t('alert.warning'), first?.[0] ?? error?.message ?? t(`sections.list.alert.${key}`))
}
</script>
