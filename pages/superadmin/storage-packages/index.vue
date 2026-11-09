<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.storagePackages.pageTitle') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.storagePackages.pageTitle') }}</template>

            <div class="p-1">
                <!-- Header -->
                <ModulesSuperadminPageHeader :title="$t('superadmin.storagePackages.pageTitle')"
                    :subtitle="$t('superadmin.storagePackages.description')">
                    <template #actions>
                        <button @click="openCreate"
                            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-tertiary bg-white border border-line-strong hover:bg-surface-canvas shadow-sm transition-colors">
                            <Icon name="ph:plus" class="w-4 h-4" />
                            {{ $t('superadmin.storagePackages.newPackage') }}
                        </button>
                    </template>
                </ModulesSuperadminPageHeader>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error?.message?.length > 0" />

                <div v-if="state.isLoading" class="flex justify-center py-16">
                    <Icon name="ph:spinner" class="w-7 h-7 text-accent animate-spin" />
                </div>

                <!-- LIST VIEW -->
                <div v-else class="bg-white border border-line rounded-xl overflow-hidden shadow-sm">
                    <div v-if="!packages.length" class="flex flex-col items-center gap-3 py-16 text-ink-muted">
                        <Icon name="ph:cloud" class="w-12 h-12 opacity-30" />
                        <p class="text-sm">{{ $t('superadmin.storagePackages.noPackagesFound') }}</p>
                    </div>
                    <table v-else class="w-full">
                        <thead>
                            <tr class="border-b border-line bg-surface-subtle">
                                <th class="co-th">{{ $t('superadmin.storagePackages.colName') }}</th>
                                <th class="co-th">{{ $t('superadmin.storagePackages.colSize') }}</th>
                                <th class="co-th">{{ $t('superadmin.storagePackages.colMonthlyPrice') }}</th>
                                <th class="co-th">{{ $t('superadmin.storagePackages.colYearlyPrice') }}</th>
                                <th class="co-th">{{ $t('superadmin.storagePackages.colPricePerGb') }}</th>
                                <th class="co-th"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="pkg in packages" :key="pkg.uuid"
                                class="border-b border-surface-canvas hover:bg-surface-subtle transition-colors">
                                <td class="co-td text-[13px] font-semibold text-ink">{{ pkg.name }}</td>
                                <td class="co-td text-[13px] text-ink-body">{{ pkg.storage_size_gb }} GB</td>
                                <td class="co-td text-[13px] text-ink-body">{{ pkg.monthly_price }} kr.</td>
                                <td class="co-td text-[13px] text-ink-body">
                                    {{ pkg.yearly_price != null ? pkg.yearly_price + ' kr.' : '-' }}
                                </td>
                                <td class="co-td text-[13px] text-ink-body">{{ pricePerGb(pkg) }}</td>
                                <td class="co-td">
                                    <div class="flex items-center gap-2 justify-end">
                                        <button class="co-action-btn" @click="openEdit(pkg)">
                                            <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" />
                                            {{ $t('superadmin.storagePackages.edit') }}
                                        </button>
                                        <button class="co-action-btn-danger" @click="confirmDelete(pkg)">
                                            <Icon name="ph:trash" class="w-3.5 h-3.5" />
                                            {{ $t('superadmin.storagePackages.delete') }}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- CREATE/EDIT MODAL -->
            <Modal size="sm" :show="state.modal.isFormOpen" @close="state.modal.isFormOpen = false">
                <template #modal-body>
                    <h3 class="text-base font-semibold text-ink mb-4">
                        {{ state.form.uuid
                            ? $t('superadmin.storagePackages.editPackage')
                            : $t('superadmin.storagePackages.newPackage') }}
                    </h3>
                    <Alert type="danger" :text="state.formError?.message"
                        v-if="state.formError?.message && state.formError?.message?.length > 0" />
                    <div class="space-y-4">
                        <div>
                            <label class="block text-xs font-medium text-ink-body mb-1">
                                {{ $t('superadmin.storagePackages.colName') }}
                            </label>
                            <input v-model="state.form.name" type="text" class="co-input"
                                :placeholder="$t('superadmin.storagePackages.namePlaceholder')" />
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-ink-body mb-1">
                                {{ $t('superadmin.storagePackages.colSize') }} (GB)
                            </label>
                            <input v-model.number="state.form.storage_size_gb" type="number" min="1" class="co-input" />
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-ink-body mb-1">
                                {{ $t('superadmin.storagePackages.colMonthlyPrice') }} (kr.)
                            </label>
                            <input v-model.number="state.form.monthly_price" type="number" min="0" class="co-input" />
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-ink-body mb-1">
                                {{ $t('superadmin.storagePackages.colYearlyPrice') }} (kr.)
                            </label>
                            <input v-model.number="state.form.yearly_price" type="number" min="0" class="co-input"
                                :placeholder="$t('superadmin.storagePackages.optional')" />
                        </div>
                    </div>
                    <div class="mt-5 flex justify-end gap-2">
                        <FormButton buttonStyle="cancel" @click="state.modal.isFormOpen = false">
                            {{ $t('close') }}
                        </FormButton>
                        <FormButton :disabled="state.isSaving" @click="savePackage">
                            {{ $t('superadmin.storagePackages.save') }}
                        </FormButton>
                    </div>
                </template>
            </Modal>

            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="$t('superadmin.storagePackages.deleteConfirm', { name: state.selectedPackage?.name })"
                @close="state.modal.isDeleteOpen = false" @confirm="deletePackage" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { storagePackageService } from '@/components/api/superadmin/StoragePackageService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    packages: [] as any,
    error: {} as Error,
    formError: {} as Error,
    isLoading: false,
    isSaving: false,
    modal: { isFormOpen: false, isDeleteOpen: false },
    selectedPackage: null as any,
    form: {
        uuid: null as string | null,
        name: '',
        storage_size_gb: null as number | null,
        monthly_price: null as number | null,
        yearly_price: null as number | null,
    },
})

const packages = computed(() => state.packages?.data ?? [])

// What a package costs per gigabyte, so the volume discount across the ladder is
// visible when pricing a new package.
function pricePerGb(pkg: any) {
    const size = Number(pkg?.storage_size_gb ?? 0)
    const monthly = Number(pkg?.monthly_price ?? 0)
    if (!size || !monthly) return '-'
    return `${(monthly / size).toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr.`
}

onMounted(() => {
    fetchPackages()
})

async function fetchPackages() {
    state.isLoading = true
    state.error = {}
    try {
        const response = await storagePackageService.getStoragePackages()
        if (response) {
            state.packages = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function openCreate() {
    state.form = { uuid: null, name: '', storage_size_gb: null, monthly_price: null, yearly_price: null }
    state.formError = {}
    state.modal.isFormOpen = true
}

function openEdit(pkg: any) {
    state.form = {
        uuid: pkg.uuid,
        name: pkg.name,
        storage_size_gb: pkg.storage_size_gb,
        monthly_price: pkg.monthly_price,
        yearly_price: pkg.yearly_price,
    }
    state.formError = {}
    state.modal.isFormOpen = true
}

async function savePackage() {
    state.isSaving = true
    state.formError = {}
    const params = {
        name: state.form.name,
        storage_size_gb: state.form.storage_size_gb,
        monthly_price: state.form.monthly_price,
        yearly_price: state.form.yearly_price ?? null,
    }
    try {
        if (state.form.uuid) {
            await storagePackageService.updateStoragePackage(state.form.uuid, params)
            successAlert(t('superadmin.storagePackages.successUpdated'), state.form.name)
        } else {
            await storagePackageService.createStoragePackage(params)
            successAlert(t('superadmin.storagePackages.successCreated'), state.form.name)
        }
        state.modal.isFormOpen = false
        fetchPackages()
    } catch (error: any) {
        state.formError = error
    }
    state.isSaving = false
}

function confirmDelete(pkg: any) {
    state.selectedPackage = pkg
    state.modal.isDeleteOpen = true
}

async function deletePackage() {
    try {
        await storagePackageService.deleteStoragePackage(state.selectedPackage?.uuid)
        successAlert(t('superadmin.storagePackages.successDeleted'), state.selectedPackage?.name)
        state.modal.isDeleteOpen = false
        fetchPackages()
    } catch (error: any) {
        state.error = error
        state.modal.isDeleteOpen = false
    }
}
</script>

<style scoped>
.co-th {
    text-align: left;
    padding: 10px 16px;
    font-size: 11px;
    font-weight: 600;
    color: theme('colors.ink.muted');
    text-transform: uppercase;
    letter-spacing: 0.06em
}

.co-td {
    padding: 12px 16px;
    vertical-align: middle
}

.co-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid theme('colors.line.strong');
    border-radius: 8px;
    font-size: 13px;
    color: theme('colors.ink.DEFAULT')
}

.co-input:focus {
    outline: none;
    border-color: theme('colors.tertiary.DEFAULT')
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
    color: theme('colors.ink.body');
    border: 1px solid theme('colors.line.strong');
    transition: all 0.15s;
    cursor: pointer
}

.co-action-btn:hover {
    background: theme('colors.surface.canvas');
    color: theme('colors.tertiary.DEFAULT');
    border-color: theme('colors.tertiary.DEFAULT')
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
    color: theme('colors.danger.DEFAULT');
    border: 1px solid theme('colors.danger.line');
    transition: all 0.15s;
    cursor: pointer
}

.co-action-btn-danger:hover {
    background: theme('colors.danger.soft');
    border-color: theme('colors.danger.DEFAULT')
}
</style>
