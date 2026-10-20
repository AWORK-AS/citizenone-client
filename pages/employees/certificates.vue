<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employees.certificates.certificates') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('employees.certificates.certificates') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/employees">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <TabsLocal v-model="view" :tabs="tabs" />

                <!-- Without the HR setting the overviews answer "invalid permission". -->
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <!-- Expiry: every certificate on file, soonest expiry first. -->
                <div v-if="view === 'expiry'" class="table-responsive">
                    <Table :columnHeaders="state.columnHeaders" :data="{ data: state.certificates }"
                        :isLoading="state.isLoading" :emptyMessage="$t('employees.certificates.empty')">
                        <template #body v-if="!(state.isLoading || state.certificates.length === 0)">
                            <tr v-for="certificate in state.certificates" :key="certificate.uuid">
                                <td width="30%">
                                    <NuxtLink class="text-tertiary hover:text-tertiary-700"
                                        :to="`/employees/${certificate.employee.uuid}/view-details`">
                                        {{ certificate.employee.firstname }} {{ certificate.employee.lastname }}
                                    </NuxtLink>
                                </td>
                                <td width="25%">
                                    {{ $t(`consultantProfile.documentTypes.${certificate.file_type}`) }}
                                </td>
                                <td width="20%">
                                    {{ certificate.expires_at ? formatDateToReadable(certificate.expires_at) : '-' }}
                                </td>
                                <td width="25%">
                                    <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                                        :class="statusClasses(certificate.status)">
                                        {{ $t(`employees.certificates.statuses.${certificate.status}`) }}
                                    </span>
                                </td>
                            </tr>
                        </template>
                    </Table>
                </div>

                <!-- Missing: per active employee, each required document that is missing,
                     expired or expiring within 60 days (App\Support\RequiredEmployeeDocuments). -->
                <div v-else-if="view === 'missing'" class="space-y-4">
                    <p class="text-xs text-gray-500">{{ $t('employees.certificates.missing.rule') }}</p>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div class="space-y-1">
                            <FormLabel for="missing_status" :label="$t('employees.certificates.missing.filters.status')" />
                            <FormSelect v-model="missing.status" :options="statusOptions"
                                :placeholder="$t('employees.certificates.missing.filters.allStatuses')" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="missing_role" :label="$t('employees.certificates.missing.filters.role')" />
                            <FormSelect v-model="missing.roleId" :options="roleOptions"
                                :placeholder="$t('employees.certificates.missing.filters.allRoles')" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="missing_department"
                                :label="$t('employees.certificates.missing.filters.department')" />
                            <FormSelect v-model="missing.departmentUuid" :options="departmentOptions"
                                :placeholder="$t('employees.certificates.missing.filters.allDepartments')" />
                        </div>
                    </div>
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="{ data: missing.rows }"
                            :isLoading="missing.isLoading" :emptyMessage="$t('employees.certificates.missing.empty')">
                            <template #body v-if="!(missing.isLoading || missing.rows.length === 0)">
                                <tr v-for="row in missing.rows" :key="`${row.employee.uuid}-${row.file_type}`">
                                    <td width="30%">
                                        <NuxtLink class="text-tertiary hover:text-tertiary-700"
                                            :to="`/employees/${row.employee.uuid}/view-details`">
                                            {{ row.employee.firstname }} {{ row.employee.lastname }}
                                        </NuxtLink>
                                        <span v-if="row.is_consultant"
                                            class="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xxs text-gray-600">
                                            {{ $t('employees.certificates.missing.consultant') }}
                                        </span>
                                    </td>
                                    <td width="25%">
                                        {{ $t(`consultantProfile.documentTypes.${row.file_type}`) }}
                                    </td>
                                    <td width="20%">
                                        {{ row.expires_at ? formatDateToReadable(row.expires_at) : '-' }}
                                    </td>
                                    <td width="25%">
                                        <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                                            :class="statusClasses(row.status)">
                                            {{ $t(`employees.certificates.statuses.${row.status}`) }}
                                        </span>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                </div>

                <!-- Search: every (not archived) employee document of the company. -->
                <div v-else class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div class="md:col-span-2">
                            <FormTextField id="document_search" name="document_search"
                                :placeholder="$t('employees.certificates.search.placeholder')"
                                v-model="search.query" />
                        </div>
                        <FormSelect v-model="search.fileType" :options="typeOptions"
                            :placeholder="$t('employees.certificates.search.allTypes')" />
                    </div>
                    <div class="table-responsive">
                        <Table :columnHeaders="searchHeaders" :data="search.documents" :isLoading="search.isLoading"
                            :emptyMessage="$t('employees.certificates.search.empty')">
                            <template #body v-if="!(search.isLoading || !search.documents?.data?.length)">
                                <tr v-for="document in search.documents.data" :key="document.uuid">
                                    <td width="25%">
                                        <NuxtLink class="text-tertiary hover:text-tertiary-700"
                                            :to="`/employees/${document.employee.uuid}/view-details`">
                                            {{ document.employee.firstname }} {{ document.employee.lastname }}
                                        </NuxtLink>
                                    </td>
                                    <td width="20%">
                                        {{ $t(`consultantProfile.documentTypes.${document.file_type}`) }}
                                    </td>
                                    <td width="25%">
                                        <button type="button"
                                            class="text-tertiary hover:text-tertiary-700 flex items-center gap-x-1 text-left"
                                            :title="$t('employees.certificates.search.view')"
                                            @click="viewDocument(document)">
                                            <Icon name="ph:file" class="size-5 shrink-0" />
                                            <span class="break-all">{{ document.name }}</span>
                                        </button>
                                    </td>
                                    <td width="15%">
                                        {{ document.created_at ? formatDateToReadable(document.created_at) : '-' }}
                                    </td>
                                    <td width="15%">
                                        {{ document.expires_at ? formatDateToReadable(document.expires_at) : '-' }}
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="search.documents" @previous="previousPage" @next="nextPage" />
                </div>
            </div>

            <ModulesUserDocumentDocsFileModalPreview :isModalOpen="preview.isOpen" :selectedDocument="preview.document"
                :loadFile="loadDocument" :downloadFile="downloadDocumentFile" :canDownload="canDownloadDocuments"
                @close="preview.isOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { usePermissions } from '@/composables/usePermissions'
import { employeeDocumentService } from '@/components/api/user/EmployeeDocumentService'
import { roleService } from '@/components/api/user/RoleService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { formatDateToReadable } = useDatetimeFormatter()
const { isAtLeast, can } = usePermissions()
// Without download_documents a document can still be viewed, but not saved.
const canDownloadDocuments = computed(() => isAtLeast('Admin') || can('download_documents'))

const breadcrumbLinks = [
    { name: 'employees.certificates.certificates', translate: true, href: '/employees/certificates' },
]

const VIEWS = ['expiry', 'missing', 'search']

// The tab is in the address (?view=missing), so My day can link straight to it.
const view = computed({
    get: () => (VIEWS.includes(String(route.query.view)) ? String(route.query.view) : 'expiry'),
    set: (value: string) => {
        router.replace({ query: { ...route.query, view: value === 'expiry' ? undefined : value } })
    },
})

const tabs = computed(() => VIEWS.map((key) => ({
    key,
    label: t(`employees.certificates.tabs.${key}`),
})))

const state = reactive({
    columnHeaders: [
        { name: 'employees.certificates.columns.employee', isTranslateName: true },
        { name: 'employees.certificates.columns.type', isTranslateName: true },
        { name: 'employees.certificates.columns.expiresAt', isTranslateName: true },
        { name: 'employees.certificates.columns.status', isTranslateName: true },
    ],
    isLoading: false,
    certificates: [] as any[],
    error: {} as Error,
})

const missing = reactive({
    isLoaded: false,
    isLoading: false,
    rows: [] as any[],
    status: null as string | null,
    roleId: null as number | null,
    departmentUuid: null as string | null,
    roles: [] as any[],
    departments: [] as any[],
})

const search = reactive({
    isLoaded: false,
    isLoading: false,
    query: '',
    fileType: null as string | null,
    page: 1,
    documents: {} as any,
})

const searchHeaders = [
    { name: 'employees.certificates.columns.employee', isTranslateName: true },
    { name: 'employees.certificates.columns.type', isTranslateName: true },
    { name: 'employees.certificates.search.file', isTranslateName: true },
    { name: 'employees.certificates.search.uploaded', isTranslateName: true },
    { name: 'employees.certificates.columns.expiresAt', isTranslateName: true },
]

const DOCUMENT_TYPES = [
    'employment_contract', 'criminal_record', 'child_protection_certificate', 'drivers_license',
    'passport', 'cv', 'education', 'work_permit', 'miscellaneous',
]

const statusOptions = computed(() => ['missing', 'expired', 'expiring_soon'].map((status) => ({
    value: status,
    label: t(`employees.certificates.statuses.${status}`),
})))

const typeOptions = computed(() => DOCUMENT_TYPES.map((type) => ({
    value: type,
    label: t(`consultantProfile.documentTypes.${type}`),
})))

const roleOptions = computed(() => missing.roles
    .map((role: any) => ({ value: Number(role.id), label: role.name }))
    .sort((a: any, b: any) => a.label.localeCompare(b.label)))

const departmentOptions = computed(() => missing.departments
    .map((department: any) => ({ value: department.uuid, label: department.name }))
    .sort((a: any, b: any) => a.label.localeCompare(b.label)))

function statusClasses(status: string) {
    switch (status) {
        case 'missing':
        case 'expired': return 'bg-red-100 text-red-800'
        case 'expiring_soon': return 'bg-amber-100 text-amber-800'
        case 'valid': return 'bg-green-100 text-green-800'
        default: return 'bg-gray-100 text-gray-600'
    }
}

async function fetchOverview() {
    state.isLoading = true
    try {
        const response = await employeeDocumentService.getExpiryOverview()
        state.certificates = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function fetchMissing() {
    missing.isLoading = true
    try {
        const params: Record<string, any> = {}
        if (missing.status) params.status = missing.status
        if (missing.roleId) params.role_id = missing.roleId
        if (missing.departmentUuid) params.department_uuid = missing.departmentUuid
        const response = await employeeDocumentService.getMissingOverview(params)
        missing.rows = response?.data ?? []
    } catch (error: any) {
        missing.rows = []
        state.error = error
    }
    missing.isLoading = false
}

async function fetchFilterOptions() {
    const [roles, departments] = await Promise.all([
        roleService.getAllRoles().catch(() => null),
        departmentService.getAllDepartments({}).catch(() => null),
    ])
    missing.roles = roles?.data ?? []
    missing.departments = departments?.data ?? []
}

async function fetchSearch() {
    search.isLoading = true
    try {
        const params: Record<string, any> = { page: search.page }
        if (search.query.trim()) params.search = search.query.trim()
        if (search.fileType) params.file_type = search.fileType
        search.documents = await employeeDocumentService.searchDocuments(params) ?? {}
    } catch (error: any) {
        search.documents = {}
        state.error = error
    }
    search.isLoading = false
}

function previousPage() {
    search.page--
    fetchSearch()
}

function nextPage() {
    search.page++
    fetchSearch()
}

watch(() => [missing.status, missing.roleId, missing.departmentUuid], () => {
    fetchMissing()
})

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(() => search.query, () => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        search.page = 1
        fetchSearch()
    }, 300)
})

watch(() => search.fileType, () => {
    search.page = 1
    fetchSearch()
})

// Each tab loads the first time it is opened.
function loadView(value: string) {
    if (value === 'missing' && !missing.isLoaded) {
        missing.isLoaded = true
        fetchFilterOptions()
        fetchMissing()
    }
    if (value === 'search' && !search.isLoaded) {
        search.isLoaded = true
        fetchSearch()
    }
}

watch(view, (value) => loadView(value))

// Opening a document shows it in the app's viewer, as in the employee's boxes.
const preview = reactive({
    isOpen: false,
    document: {} as any,
})

function viewDocument(document: any) {
    preview.document = document
    preview.isOpen = true
}

function loadDocument(document: any): Promise<Blob | null> {
    return employeeDocumentService.viewDocument(document?.uuid)
}

function downloadDocumentFile(document: any): Promise<Blob | null> {
    return employeeDocumentService.downloadDocument(document?.uuid)
}

onMounted(() => {
    fetchOverview()
    loadView(view.value)
})

onBeforeUnmount(() => {
    if (searchTimer) clearTimeout(searchTimer)
})
</script>
