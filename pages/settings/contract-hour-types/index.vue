<template>
    <div>
        <NuxtLayout name="user">
            <Head>
                <Title>{{ $t('socialWelfare.hourTypes.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>{{ $t('socialWelfare.hourTypes.title') }}</template>

            <div class="mt-8 space-y-5">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <p class="text-sm text-slate-500 max-w-2xl">{{ $t('socialWelfare.hourTypes.intro') }}</p>
                    <Tooltip :text="$t('socialWelfare.hourTypes.newHelp')" wrap position="left">
                        <FormButton buttonStyle="action" @click="openModal(null)">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('socialWelfare.hourTypes.new') }}
                        </FormButton>
                    </Tooltip>
                </div>

                <!-- The one thing that is easy to get wrong, so it is spelled out
                     before the list rather than behind a hover. -->
                <div class="rounded-xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-900 space-y-1">
                    <p class="font-medium">{{ $t('socialWelfare.hourTypes.basisTitle') }}</p>
                    <p><strong>{{ $t('socialWelfare.hourTypes.basis.delivered') }}:</strong> {{ $t('socialWelfare.hourTypes.basisHelp.delivered') }}</p>
                    <p><strong>{{ $t('socialWelfare.hourTypes.basis.granted') }}:</strong> {{ $t('socialWelfare.hourTypes.basisHelp.granted') }}</p>
                </div>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="!state.types.length"
                        class="bg-white border border-surface-200 rounded-xl p-12 text-center shadow-sm">
                        <Icon name="ph:clock" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p class="text-slate-400 text-sm">{{ $t('socialWelfare.hourTypes.empty') }}</p>
                    </div>

                    <div v-else class="bg-white border border-surface-200 rounded-xl shadow-sm overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead class="border-b border-surface-200">
                                    <tr>
                                        <th class="co-th">{{ $t('socialWelfare.hourTypes.name') }}</th>
                                        <th class="co-th">{{ $t('socialWelfare.hourTypes.billingBasis') }}</th>
                                        <th class="co-th">{{ $t('socialWelfare.hourTypes.productNumber') }}</th>
                                        <th class="co-th">{{ $t('socialWelfare.hourTypes.sortOrder') }}</th>
                                        <th class="co-th">{{ $t('socialWelfare.hourTypes.isActive') }}</th>
                                        <th class="co-th"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="type in state.types" :key="type.uuid"
                                        class="border-b border-surface-200 last:border-0">
                                        <td class="co-td">
                                            <p class="font-medium text-slate-900">{{ type.name }}</p>
                                            <Tooltip v-if="type.system_key" :text="$t('socialWelfare.hourTypes.systemHelp')" wrap position="right">
                                                <span class="co-badge text-[11px]">{{ $t('socialWelfare.hourTypes.system') }}</span>
                                            </Tooltip>
                                        </td>
                                        <td class="co-td text-slate-600">
                                            <Tooltip :text="$t(`socialWelfare.hourTypes.basisHelp.${type.billing_basis}`)" wrap position="top">
                                                <span class="co-badge text-[11px]">{{ $t(`socialWelfare.hourTypes.basis.${type.billing_basis}`) }}</span>
                                            </Tooltip>
                                        </td>
                                        <td class="co-td text-slate-500">{{ type.economic_product_number || '-' }}</td>
                                        <td class="co-td text-slate-500 tabular-nums">{{ type.sort_order ?? '-' }}</td>
                                        <td class="co-td text-slate-500">{{ type.is_active ? $t('yes') : $t('no') }}</td>
                                        <td class="co-td">
                                            <div class="flex items-center justify-end gap-2">
                                                <Tooltip :text="$t('edit')" position="left">
                                                    <FormButton type="button" buttonStyle="action" :aria-label="$t('edit')"
                                                        @click="openModal(type)">
                                                        <Icon name="ph:pencil-simple" class="size-4" />
                                                        {{ $t('edit') }}
                                                    </FormButton>
                                                </Tooltip>
                                                <Tooltip :text="type.system_key ? $t('socialWelfare.hourTypes.systemNotDeletable') : $t('delete')"
                                                    wrap position="left">
                                                    <FormButton type="button" buttonStyle="danger" :disabled="!!type.system_key"
                                                        :aria-label="$t('delete')" @click="confirmDelete(type)">
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

            <Modal size="lg" :title="state.selected?.uuid ? $t('socialWelfare.hourTypes.edit') : $t('socialWelfare.hourTypes.new')"
                :show="state.isModalOpen" @close="state.isModalOpen = false">
                <template #modal-body>
                    <form @submit.prevent="save">
                        <Alert type="danger" :text="state.formError?.message"
                            v-if="state.formError?.message && state.formError.message.length > 0" />
                        <LoadingSpinner :isActive="state.isSaving">
                            <div class="space-y-4">
                                <div class="space-y-1">
                                    <FormLabel :label="$t('socialWelfare.hourTypes.name')" />
                                    <input type="text" class="co-cell-input w-full" v-model="state.form.name" maxlength="255" required />
                                    <FormError :error="state.formError?.errors?.name?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel :label="$t('socialWelfare.hourTypes.billingBasis')" />
                                    <select class="co-cell-input w-full" v-model="state.form.billing_basis"
                                        :aria-label="$t('socialWelfare.hourTypes.billingBasis')">
                                        <option value="delivered">{{ $t('socialWelfare.hourTypes.basis.delivered') }}</option>
                                        <option value="granted">{{ $t('socialWelfare.hourTypes.basis.granted') }}</option>
                                    </select>
                                    <p class="text-[12px] text-slate-500">
                                        {{ $t(`socialWelfare.hourTypes.basisHelp.${state.form.billing_basis}`) }}
                                    </p>
                                    <FormError :error="state.formError?.errors?.billing_basis?.[0]" />
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div class="space-y-1">
                                        <FormLabel :label="$t('socialWelfare.hourTypes.productNumber')" />
                                        <input type="text" class="co-cell-input w-full" maxlength="50"
                                            v-model="state.form.economic_product_number" />
                                        <FormError :error="state.formError?.errors?.economic_product_number?.[0]" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel :label="$t('socialWelfare.hourTypes.sortOrder')" />
                                        <input type="number" min="0" step="1" class="co-cell-input w-full" v-model="state.form.sort_order" />
                                        <FormError :error="state.formError?.errors?.sort_order?.[0]" />
                                    </div>
                                </div>
                                <Tooltip :text="$t('socialWelfare.hourTypes.isActiveHelp')" wrap position="top">
                                    <label class="flex items-center gap-2 text-sm text-slate-700">
                                        <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary"
                                            v-model="state.form.is_active" />
                                        {{ $t('socialWelfare.hourTypes.isActive') }}
                                    </label>
                                </Tooltip>
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
                :message="$t('socialWelfare.hourTypes.confirmDelete')"
                @close="state.isDeleteOpen = false" @confirm="deleteType" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { socialWelfareService } from '@/components/api/user/SocialWelfareService'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'
import type { ContractHourType } from '@/types/contract'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()

const breadcrumbLinks = [
    { name: 'socialWelfare.hourTypes.title', translate: true, href: '/settings/contract-hour-types' },
]

const blank = () => ({
    name: '',
    economic_product_number: '',
    billing_basis: 'delivered' as 'delivered' | 'granted',
    sort_order: '' as any,
    is_active: true,
})

const state = reactive({
    types: [] as ContractHourType[],
    error: {} as Error,
    formError: {} as Error,
    isLoading: false,
    isSaving: false,
    isModalOpen: false,
    isDeleteOpen: false,
    selected: null as ContractHourType | null,
    form: blank(),
})

onMounted(() => {
    if (userStore.getUser?.company?.industry?.system_name !== 'social_welfare') {
        navigateTo('/settings/expense-categories')

        return
    }

    fetchTypes()
})

async function fetchTypes() {
    state.error = {} as Error
    state.isLoading = true
    try {
        const response = await socialWelfareService.getContractHourTypes()
        state.types = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function openModal(type: ContractHourType | null) {
    state.selected = type
    state.formError = {} as Error
    state.form = type ? {
        name: type.name,
        economic_product_number: type.economic_product_number ?? '',
        billing_basis: type.billing_basis,
        sort_order: type.sort_order ?? '',
        is_active: type.is_active !== false,
    } : blank()
    state.isModalOpen = true
}

function confirmDelete(type: ContractHourType) {
    if (type.system_key) return

    state.selected = type
    state.isDeleteOpen = true
}

async function save() {
    state.formError = {} as Error
    state.isSaving = true
    try {
        const payload = {
            name: state.form.name,
            economic_product_number: state.form.economic_product_number === '' ? null : state.form.economic_product_number,
            billing_basis: state.form.billing_basis,
            sort_order: state.form.sort_order === '' ? null : Number(state.form.sort_order),
            is_active: state.form.is_active,
        }

        if (state.selected?.uuid) {
            await socialWelfareService.updateContractHourType(state.selected.uuid, payload)
        } else {
            await socialWelfareService.saveContractHourType(payload)
        }

        successAlert(`${t('alert.success')}!`, t('socialWelfare.hourTypes.saved'))
        state.isModalOpen = false
        fetchTypes()
    } catch (error: any) {
        state.formError = error
    }
    state.isSaving = false
}

async function deleteType() {
    state.isDeleteOpen = false
    state.error = {} as Error
    try {
        await socialWelfareService.deleteContractHourType(state.selected!.uuid)
        successAlert(`${t('alert.success')}!`, t('socialWelfare.hourTypes.deleted'))
        fetchTypes()
    } catch (error: any) {
        state.error = error
    }
}
</script>
