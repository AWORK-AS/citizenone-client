<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('myContracts.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('myContracts.title') }}</template>

            <!-- Task #33: the contracts the employee has been sent to read and sign. -->
            <div class="mt-6 space-y-6" data-testid="my-contracts">
                <p class="text-sm text-gray-600">{{ $t('myContracts.subtitle') }}</p>

                <Alert type="danger" :text="state.error" v-if="state.error" />

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="!state.isLoading && !state.contracts.length"
                        class="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-500"
                        data-testid="my-contracts-empty">
                        <Icon name="ph:files" class="mx-auto mb-2 size-8 text-gray-300" />
                        {{ $t('myContracts.empty') }}
                    </div>

                    <section v-if="waiting.length" class="space-y-3">
                        <h2 class="text-xs font-semibold uppercase tracking-wide text-amber-700">
                            {{ $t('myContracts.waiting') }}
                        </h2>
                        <div v-for="contract in waiting" :key="contract.uuid" :data-testid="`my-contract-${contract.uuid}`"
                            class="flex flex-wrap items-center gap-4 rounded-xl border border-amber-200 border-l-4 border-l-amber-500 bg-white p-4 shadow-sm">
                            <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                                <Icon name="ph:signature" class="size-5" />
                            </span>
                            <div class="min-w-0 flex-1">
                                <p class="truncate font-semibold text-gray-900">{{ contract.name }}</p>
                                <p class="text-xs text-gray-500">
                                    {{ $t('myContracts.sentBy', { name: contract.signature?.requested_by_name || '—', date: formatDate(contract.signature?.requested_at) }) }}
                                </p>
                            </div>
                            <FormButton type="button" buttonStyle="primary" class="!w-auto"
                                :data-testid="`my-contract-open-${contract.uuid}`" @click="openSigning(contract)">
                                <Icon name="ph:pen-nib" class="size-4" />
                                {{ $t('myContracts.open') }}
                            </FormButton>
                        </div>
                    </section>

                    <section v-if="signed.length" class="mt-6 space-y-3">
                        <h2 class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {{ $t('myContracts.signedSection') }}
                        </h2>
                        <div v-for="contract in signed" :key="contract.uuid" :data-testid="`my-contract-${contract.uuid}`"
                            class="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
                            <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-[#2E9E33]">
                                <Icon name="ph:seal-check-fill" class="size-5" />
                            </span>
                            <div class="min-w-0 flex-1">
                                <p class="truncate font-semibold text-gray-900">{{ contract.name }}</p>
                                <p class="text-xs text-gray-500">
                                    {{ $t('myContracts.signedOn', { date: formatDate(contract.signature?.signed_at) }) }}
                                </p>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <FormButton type="button" buttonStyle="action" class="!w-auto" @click="viewContract(contract)">
                                    <Icon name="ph:eye" class="size-4" />
                                    {{ $t('myContracts.view') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="action" class="!w-auto" @click="downloadCertificate(contract)">
                                    <Icon name="ph:certificate" class="size-4" />
                                    {{ $t('myContracts.certificate') }}
                                </FormButton>
                            </div>
                        </div>
                    </section>
                </LoadingSpinner>
            </div>

            <ModulesUserMyContractsSignModal :isModalOpen="state.isSignOpen" :contract="state.selected"
                @close="state.isSignOpen = false" @signed="onSigned" />
            <ModulesUserDocumentDocsFileModalPreview :isModalOpen="state.isPreviewOpen" :selectedDocument="state.selected || {}"
                :loadFile="loadContract" :downloadFile="loadContract" :canDownload="true"
                @close="state.isPreviewOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { saveAs } from 'file-saver'
import { useI18n } from 'vue-i18n'
import { useAlert } from '@/composables/alert'
import { employeeDocumentService } from '@/components/api/user/EmployeeDocumentService'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { t } = useI18n()
const { successAlert } = useAlert()

const breadcrumbLinks = [
    {
        name: 'myContracts.title',
        translate: true,
        href: '/my-contracts',
    },
]

const state = reactive({
    contracts: [] as any[],
    selected: null as any,
    isSignOpen: false,
    isPreviewOpen: false,
    isLoading: true,
    error: '',
})

const waiting = computed(() => state.contracts.filter((contract: any) => contract.signature?.status === 'pending'))
const signed = computed(() => state.contracts.filter((contract: any) => contract.signature?.status === 'signed'))

function formatDate(value: string | null | undefined): string {
    return value ? moment(value).format('DD-MM-YYYY') : ''
}

function loadContract(contract: any): Promise<Blob | null> {
    return employeeDocumentService.viewMyContract(contract?.uuid)
}

function openSigning(contract: any) {
    state.selected = contract
    state.isSignOpen = true
}

function viewContract(contract: any) {
    state.selected = contract
    state.isPreviewOpen = true
}

async function downloadCertificate(contract: any) {
    state.error = ''
    try {
        const blob = await employeeDocumentService.downloadSignatureCertificate(contract.uuid)
        if (blob) saveAs(blob, `${t('myContracts.certificate')} - ${contract.name}.pdf`)
    } catch (error: any) {
        state.error = error?.message || t('myContracts.loadFailed')
    }
}

function onSigned() {
    state.isSignOpen = false
    successAlert(`${t('alert.success')}!`, `${t('myContracts.signed')}.`)
    load()
}

async function load() {
    state.isLoading = true
    state.error = ''
    try {
        const response = await employeeDocumentService.getMyContracts()
        state.contracts = response?.data ?? []
        // A link straight to one contract (from a notification) opens it for signing.
        const wanted = typeof route.query.contract === 'string' ? route.query.contract : ''
        const contract = wanted && state.contracts.find((item: any) => item.uuid === wanted && item.signature?.status === 'pending')
        if (contract) openSigning(contract)
    } catch (error: any) {
        state.error = error?.message || t('myContracts.loadFailed')
    }
    state.isLoading = false
}

onMounted(() => load())
</script>
