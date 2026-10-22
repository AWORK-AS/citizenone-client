<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('prescriptionRenewals.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('prescriptionRenewals.title') }}</template>

            <div class="mt-8 space-y-5" data-testid="prescription-renewals">
                <p class="max-w-3xl text-sm text-slate-600">{{ $t('prescriptionRenewals.intro') }}</p>

                <div class="flex flex-wrap items-center gap-2" role="group" :aria-label="$t('prescriptionRenewals.filter')">
                    <button v-for="option in statusFilters" :key="option.value" type="button"
                        :aria-pressed="state.status === option.value" @click="setStatus(option.value)"
                        :data-testid="`renewal-filter-${option.value || 'all'}`"
                        :class="['rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                            state.status === option.value ? 'border-primary bg-primary text-white' : 'border-surface-200 bg-white text-slate-600 hover:border-primary/40']">
                        {{ option.label }}
                    </button>
                </div>

                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

                <div class="table-responsive">
                    <Table :columnHeaders="columnHeaders" :data="state.requests" :isLoading="state.isLoading"
                        :emptyMessage="$t('prescriptionRenewals.empty')">
                        <template #body v-if="!(state.isLoading || state.requests?.data?.length === 0)">
                            <tr v-for="renewal in state.requests?.data" :key="renewal.uuid"
                                class="cursor-pointer hover:bg-surface-50" @click="open(renewal)">
                                <td>
                                    <p class="font-medium text-slate-900">{{ citizenName(renewal) }}</p>
                                </td>
                                <td class="text-sm text-slate-700">{{ renewal.medicine?.name ?? '-' }}</td>
                                <td>
                                    <span :class="['badge', renewalBadgeClass(renewal.status)]">
                                        {{ $t(`prescriptionRenewals.statuses.${renewal.status}`) }}
                                    </span>
                                </td>
                                <td class="text-sm text-slate-600">
                                    {{ formatDateToReadable(renewal.submitted_at ?? renewal.created_at) }}
                                </td>
                                <td class="text-right">
                                    <FormButton type="button" buttonStyle="action" @click.stop="open(renewal)">
                                        <Icon name="ph:eye" class="size-4" aria-hidden="true" />
                                        {{ $t('prescriptionRenewals.open') }}
                                    </FormButton>
                                </td>
                            </tr>
                        </template>
                    </Table>
                </div>
                <Pagination :data="state.requests" @previous="previous" @next="next" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { prescriptionRenewalService } from '@/components/api/user/PrescriptionRenewalService'
import { RENEWAL_STATUSES, renewalBadgeClass } from '@/composables/prescriptionRenewals'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
const { t } = useI18n()
const userStore = useUserStore() as any
const route = useRoute()

let currentPage = 1
const breadcrumbLinks = [{ name: 'prescriptionRenewals.title', translate: true, href: '/prescription-renewals' }]

const columnHeaders = [
    { name: 'prescriptionRenewals.columns.patient', isTranslateName: true },
    { name: 'prescriptionRenewals.columns.medicine', isTranslateName: true },
    { name: 'prescriptionRenewals.columns.status', isTranslateName: true },
    { name: 'prescriptionRenewals.columns.received', isTranslateName: true },
    { name: '' },
]

const statusFilters = computed(() => [
    ...RENEWAL_STATUSES.map((status) => ({ value: status, label: t(`prescriptionRenewals.statuses.${status}`) })),
    { value: '', label: t('prescriptionRenewals.all') },
])

const state = reactive({
    isLoading: false,
    error: {} as any,
    // What is waiting for staff is what the inbox is for.
    status: typeof route.query.status === 'string' ? route.query.status : 'pending',
    requests: {} as any,
})

// Only for staff who handle renewals, in a clinic that has them switched on.
watch(() => userStore.getUser, (user: any) => {
    if (user && user.can_review_prescription_renewals === false) navigateTo('/')
}, { immediate: true })

onMounted(fetchRequests)

async function fetchRequests() {
    state.error = {}
    state.isLoading = true
    try {
        const params: Record<string, any> = { page: currentPage }
        if (state.status) params.status = state.status
        state.requests = await prescriptionRenewalService.getRequests(params)
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function setStatus(status: string) {
    state.status = status
    currentPage = 1
    fetchRequests()
}

function previous() {
    currentPage--
    fetchRequests()
}

function next() {
    currentPage++
    fetchRequests()
}

function open(renewal: any) {
    navigateTo(`/prescription-renewals/${renewal.uuid}`)
}

function citizenName(renewal: any) {
    return [renewal.citizen?.firstname, renewal.citizen?.lastname].filter(Boolean).join(' ') || '-'
}
</script>
