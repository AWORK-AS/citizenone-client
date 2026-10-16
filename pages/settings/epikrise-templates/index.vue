<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('epikrise.templates.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('epikrise.templates.title') }}</template>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <div class="mt-8">
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <p class="text-sm text-gray-600">{{ $t('epikrise.templates.intro') }}</p>

                    <div class="flex justify-end items-center mb-2">
                        <FormButton buttonStyle="action" @click="navigateTo('/settings/epikrise-templates/new')"
                            v-if="canManage">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('epikrise.templates.new') }}
                        </FormButton>
                    </div>
                    <TableSearch @search="handleSearch" />

                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.templates"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.templates?.data?.length === 0))">
                                <tr v-for="(template, index) in state.templates?.data" :key="index">
                                    <td width="55%">
                                        <span>{{ template?.name }}</span>
                                    </td>
                                    <td width="20%">
                                        <Badge :type="template?.is_active ? 'active' : 'inactive'" class="w-fit">
                                            {{ template?.is_active ? $t('reportTemplates.table.active') : $t('reportTemplates.table.inactive') }}
                                        </Badge>
                                    </td>
                                    <td width="25%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/settings/epikrise-templates/${template.uuid}/edit`)"
                                                v-if="canManage">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('reportTemplates.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="openDeleteConfirmation(template)"
                                                v-if="canManage">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('reportTemplates.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.templates" @previous="previous" @next="next" />
                </div>
            </div>

            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="$t('reportTemplates.confirmation.deleteConfirmation') + '?'"
                @close="state.modal.isDeleteOpen = false"
                @confirm="deleteTemplate" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { reportTemplateService } from '@/components/api/user/ReportTemplateService'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any
const { canManageTemplates } = useEpikrise()
const canManage = canManageTemplates
let currentTablePage = 1

const breadcrumbLinks = [
    { name: 'epikrise.templates.title', translate: true, href: '/settings/epikrise-templates' },
]

const state = reactive({
    columnHeaders: [
        { name: 'reportTemplates.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'reportTemplates.table.isActive', isTranslateName: true, sorter: false, key: 'is_active' },
        { name: '' },
    ],
    dataFilter: {
        search: [] as any,
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteOpen: false,
    },
    selectedTemplate: null as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
    templates: [] as any,
})

onMounted(() => {
    fetchTemplates()
})

// The user may still be loading when the page opens, so only leave once it is known. The store starts as an
// empty object, not null, so "known" means it has an id.
watch([() => userStore.getUser, canManage], ([user, allowed]: any[]) => {
    if (user?.id && !allowed) navigateTo('/')
}, { immediate: true })

async function fetchTemplates() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params: any = {
            type: 'epikrise',
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        }
        if (state.dataFilter.search?.length) params.search = state.dataFilter.search
        const response = await reportTemplateService.getReportTemplates(params)
        if (response) {
            state.templates = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchTemplates()
}

function previous() {
    currentTablePage--
    fetchTemplates()
}

function next() {
    currentTablePage++
    fetchTemplates()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = { sortField: sortingData.column, sortOrder: sortingData.sort }
    fetchTemplates()
}

function openDeleteConfirmation(template: any) {
    state.selectedTemplate = template
    state.modal.isDeleteOpen = true
}

async function deleteTemplate() {
    state.error = {}
    state.isTableLoading = true
    try {
        await reportTemplateService.deleteReportTemplate(state.selectedTemplate.uuid)
        successAlert(`${t('alert.success')}!`, `${t('reportTemplates.alert.templateSuccessfullyDeleted')}.`)
        state.modal.isDeleteOpen = false
        fetchTemplates()
    } catch (error: any) {
        state.error = error
        state.isTableLoading = false
    }
}
</script>
