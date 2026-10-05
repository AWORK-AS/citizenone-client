<template>
    <div>
        <NuxtLayout name="user">
            <Head>
                <Title>{{ $t('socialWelfare.contractFields.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>{{ $t('socialWelfare.contractFields.title') }}</template>

            <div class="mt-8 space-y-5">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <p class="text-sm text-slate-500 max-w-2xl">{{ $t('socialWelfare.contractFields.intro') }}</p>
                    <Tooltip :text="$t('socialWelfare.contractFields.newHelp')" wrap position="left">
                        <FormButton buttonStyle="action" @click="openModal(null)">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('socialWelfare.contractFields.new') }}
                        </FormButton>
                    </Tooltip>
                </div>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="!state.fields.length"
                        class="bg-white border border-surface-200 rounded-xl p-12 text-center shadow-sm">
                        <Icon name="ph:text-aa" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p class="text-slate-400 text-sm">{{ $t('socialWelfare.contractFields.empty') }}</p>
                    </div>

                    <div v-else class="bg-white border border-surface-200 rounded-xl shadow-sm overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead class="border-b border-surface-200">
                                    <tr>
                                        <th class="co-th">{{ $t('socialWelfare.contractFields.label') }}</th>
                                        <th class="co-th">{{ $t('socialWelfare.contractFields.fieldType') }}</th>
                                        <th class="co-th">{{ $t('socialWelfare.contractFields.showOnContract') }}</th>
                                        <th class="co-th">{{ $t('socialWelfare.contractFields.showOnInvoice') }}</th>
                                        <th class="co-th">{{ $t('socialWelfare.contractFields.isActive') }}</th>
                                        <th class="co-th"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="field in state.fields" :key="field.uuid"
                                        class="border-b border-surface-200 last:border-0">
                                        <td class="co-td font-medium text-slate-900">{{ field.label }}</td>
                                        <td class="co-td text-slate-500">{{ $t(`socialWelfare.contractFields.types.${field.field_type}`) }}</td>
                                        <td class="co-td text-slate-500">{{ field.show_on_contract ? $t('yes') : $t('no') }}</td>
                                        <td class="co-td text-slate-500">{{ field.show_on_invoice ? $t('yes') : $t('no') }}</td>
                                        <td class="co-td text-slate-500">{{ field.is_active ? $t('yes') : $t('no') }}</td>
                                        <td class="co-td">
                                            <div class="flex items-center justify-end gap-2">
                                                <Tooltip :text="$t('edit')" position="left">
                                                    <FormButton type="button" buttonStyle="action" :aria-label="$t('edit')"
                                                        @click="openModal(field)">
                                                        <Icon name="ph:pencil-simple" class="size-4" />
                                                        {{ $t('edit') }}
                                                    </FormButton>
                                                </Tooltip>
                                                <Tooltip :text="$t('delete')" position="left">
                                                    <FormButton type="button" buttonStyle="danger" :aria-label="$t('delete')"
                                                        @click="confirmDelete(field)">
                                                        <Icon name="ph:trash" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>

            <Modal size="lg" :title="state.selected?.uuid ? $t('socialWelfare.contractFields.edit') : $t('socialWelfare.contractFields.new')"
                :show="state.isModalOpen" @close="state.isModalOpen = false">
                <template #modal-body>
                    <form @submit.prevent="save">
                        <Alert type="danger" :text="state.formError?.message"
                            v-if="state.formError?.message && state.formError.message.length > 0" />
                        <LoadingSpinner :isActive="state.isSaving">
                            <div class="space-y-4">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div class="space-y-1 md:col-span-2">
                                        <FormLabel :label="$t('socialWelfare.contractFields.label')" />
                                        <input type="text" maxlength="255" class="co-cell-input w-full" v-model="state.form.label" required />
                                        <FormError :error="state.formError?.errors?.label?.[0]" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel :label="$t('socialWelfare.contractFields.fieldType')" />
                                        <select class="co-cell-input w-full" v-model="state.form.field_type"
                                            :aria-label="$t('socialWelfare.contractFields.fieldType')">
                                            <option value="text">{{ $t('socialWelfare.contractFields.types.text') }}</option>
                                            <option value="number">{{ $t('socialWelfare.contractFields.types.number') }}</option>
                                        </select>
                                        <FormError :error="state.formError?.errors?.field_type?.[0]" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel :label="$t('socialWelfare.contractFields.sortOrder')" />
                                        <input type="number" min="0" step="1" class="co-cell-input w-full" v-model="state.form.sort_order" />
                                        <FormError :error="state.formError?.errors?.sort_order?.[0]" />
                                    </div>
                                </div>
                                <div class="space-y-2">
                                    <Tooltip :text="$t('socialWelfare.contractFields.showOnContractHelp')" wrap position="top">
                                        <label class="flex items-center gap-2 text-sm text-slate-700">
                                            <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary"
                                                v-model="state.form.show_on_contract" />
                                            {{ $t('socialWelfare.contractFields.showOnContract') }}
                                        </label>
                                    </Tooltip>
                                    <Tooltip :text="$t('socialWelfare.contractFields.showOnInvoiceHelp')" wrap position="top">
                                        <label class="flex items-center gap-2 text-sm text-slate-700">
                                            <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary"
                                                v-model="state.form.show_on_invoice" />
                                            {{ $t('socialWelfare.contractFields.showOnInvoice') }}
                                        </label>
                                    </Tooltip>
                                    <Tooltip :text="$t('socialWelfare.contractFields.isActiveHelp')" wrap position="top">
                                        <label class="flex items-center gap-2 text-sm text-slate-700">
                                            <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary"
                                                v-model="state.form.is_active" />
                                            {{ $t('socialWelfare.contractFields.isActive') }}
                                        </label>
                                    </Tooltip>
                                </div>
                            </div>
                            <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" @click="state.isModalOpen = false">{{ $t('cancel') }}</FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="w-full">
                                    {{ state.selected?.uuid ? $t('update') : $t('save') }}
                                </FormButton>
                            </div>
                        </LoadingSpinner>
                    </form>
                </template>
            </Modal>

            <DialogConfirmation :isModalOpen="state.isDeleteOpen"
                :message="$t('socialWelfare.contractFields.confirmDelete')"
                @close="state.isDeleteOpen = false" @confirm="deleteField" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { socialWelfareService } from '@/components/api/user/SocialWelfareService'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'
import type { ContractFieldDefinition } from '@/types/contract'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()

const breadcrumbLinks = [
    { name: 'socialWelfare.contractFields.title', translate: true, href: '/settings/contract-fields' },
]

const blank = () => ({
    label: '',
    field_type: 'text' as 'text' | 'number',
    show_on_contract: true,
    show_on_invoice: false,
    sort_order: '' as any,
    is_active: true,
})

const state = reactive({
    fields: [] as ContractFieldDefinition[],
    error: {} as Error,
    formError: {} as Error,
    isLoading: false,
    isSaving: false,
    isModalOpen: false,
    isDeleteOpen: false,
    selected: null as ContractFieldDefinition | null,
    form: blank(),
})

onMounted(() => {
    if (userStore.getUser?.company?.industry?.system_name !== 'social_welfare') {
        navigateTo('/settings/expense-categories')

        return
    }

    fetchFields()
})

async function fetchFields() {
    state.error = {} as Error
    state.isLoading = true
    try {
        const response = await socialWelfareService.getContractFieldDefinitions()
        state.fields = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function openModal(field: ContractFieldDefinition | null) {
    state.selected = field
    state.formError = {} as Error
    state.form = field ? {
        label: field.label,
        field_type: field.field_type,
        show_on_contract: field.show_on_contract,
        show_on_invoice: field.show_on_invoice,
        sort_order: field.sort_order ?? '',
        is_active: field.is_active !== false,
    } : blank()
    state.isModalOpen = true
}

function confirmDelete(field: ContractFieldDefinition) {
    state.selected = field
    state.isDeleteOpen = true
}

async function save() {
    state.formError = {} as Error
    state.isSaving = true
    try {
        const payload = {
            label: state.form.label,
            field_type: state.form.field_type,
            show_on_contract: state.form.show_on_contract,
            show_on_invoice: state.form.show_on_invoice,
            sort_order: state.form.sort_order === '' ? null : Number(state.form.sort_order),
            is_active: state.form.is_active,
        }

        if (state.selected?.uuid) {
            await socialWelfareService.updateContractFieldDefinition(state.selected.uuid, payload)
        } else {
            await socialWelfareService.saveContractFieldDefinition(payload)
        }

        successAlert(`${t('alert.success')}!`, t('socialWelfare.contractFields.saved'))
        state.isModalOpen = false
        fetchFields()
    } catch (error: any) {
        state.formError = error
    }
    state.isSaving = false
}

async function deleteField() {
    state.isDeleteOpen = false
    state.error = {} as Error
    try {
        await socialWelfareService.deleteContractFieldDefinition(state.selected!.uuid)
        successAlert(`${t('alert.success')}!`, t('socialWelfare.contractFields.deleted'))
        fetchFields()
    } catch (error: any) {
        state.error = error
    }
}
</script>
