<template>
    <div>
        <NuxtLayout name="user">
            <Head>
                <Title>{{ $t('socialWelfare.paymentTerms.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>{{ $t('socialWelfare.paymentTerms.title') }}</template>

            <div class="mt-8 space-y-5">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <p class="text-sm text-slate-500 max-w-2xl">{{ $t('socialWelfare.paymentTerms.intro') }}</p>
                    <Tooltip :text="$t('socialWelfare.paymentTerms.newHelp')" wrap position="left">
                        <FormButton buttonStyle="action" @click="openModal(null)">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('socialWelfare.paymentTerms.new') }}
                        </FormButton>
                    </Tooltip>
                </div>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="!state.terms.length"
                        class="bg-white border border-surface-200 rounded-xl p-12 text-center shadow-sm">
                        <Icon name="ph:calendar-check" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p class="text-slate-400 text-sm">{{ $t('socialWelfare.paymentTerms.empty') }}</p>
                    </div>

                    <div v-else class="bg-white border border-surface-200 rounded-xl shadow-sm overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead class="border-b border-surface-200">
                                    <tr>
                                        <th class="co-th">{{ $t('socialWelfare.paymentTerms.days') }}</th>
                                        <th class="co-th">{{ $t('socialWelfare.paymentTerms.label') }}</th>
                                        <th class="co-th">{{ $t('socialWelfare.paymentTerms.sortOrder') }}</th>
                                        <th class="co-th">{{ $t('socialWelfare.paymentTerms.isActive') }}</th>
                                        <th class="co-th"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="term in state.terms" :key="term.uuid"
                                        class="border-b border-surface-200 last:border-0">
                                        <td class="co-td font-medium text-slate-900 tabular-nums">{{ term.days }}</td>
                                        <td class="co-td text-slate-500">{{ term.label || term.display_label }}</td>
                                        <td class="co-td text-slate-500 tabular-nums">{{ term.sort_order ?? '-' }}</td>
                                        <td class="co-td text-slate-500">{{ term.is_active ? $t('yes') : $t('no') }}</td>
                                        <td class="co-td">
                                            <div class="flex items-center justify-end gap-2">
                                                <Tooltip :text="$t('edit')" position="left">
                                                    <FormButton type="button" buttonStyle="action" :aria-label="$t('edit')"
                                                        @click="openModal(term)">
                                                        <Icon name="ph:pencil-simple" class="size-4" />
                                                        {{ $t('edit') }}
                                                    </FormButton>
                                                </Tooltip>
                                                <Tooltip :text="$t('delete')" position="left">
                                                    <FormButton type="button" buttonStyle="danger" :aria-label="$t('delete')"
                                                        @click="confirmDelete(term)">
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

            <Modal size="lg" :title="state.selected?.uuid ? $t('socialWelfare.paymentTerms.edit') : $t('socialWelfare.paymentTerms.new')"
                :show="state.isModalOpen" @close="state.isModalOpen = false">
                <template #modal-body>
                    <form @submit.prevent="save">
                        <Alert type="danger" :text="state.formError?.message"
                            v-if="state.formError?.message && state.formError.message.length > 0" />
                        <LoadingSpinner :isActive="state.isSaving">
                            <div class="space-y-4">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div class="space-y-1">
                                        <FormLabel :label="$t('socialWelfare.paymentTerms.days')" />
                                        <input type="number" min="0" max="365" step="1" class="co-cell-input w-full"
                                            v-model="state.form.days" required />
                                        <FormError :error="state.formError?.errors?.days?.[0]" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel :label="$t('socialWelfare.paymentTerms.label')" />
                                        <input type="text" maxlength="100" class="co-cell-input w-full" v-model="state.form.label"
                                            :placeholder="$t('socialWelfare.paymentTerms.labelPlaceholder')" />
                                        <FormError :error="state.formError?.errors?.label?.[0]" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel :label="$t('socialWelfare.paymentTerms.sortOrder')" />
                                        <input type="number" min="0" step="1" class="co-cell-input w-full" v-model="state.form.sort_order" />
                                        <FormError :error="state.formError?.errors?.sort_order?.[0]" />
                                    </div>
                                </div>
                                <Tooltip :text="$t('socialWelfare.paymentTerms.isActiveHelp')" wrap position="top">
                                    <label class="flex items-center gap-2 text-sm text-slate-700">
                                        <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary"
                                            v-model="state.form.is_active" />
                                        {{ $t('socialWelfare.paymentTerms.isActive') }}
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
                :message="$t('socialWelfare.paymentTerms.confirmDelete')"
                @close="state.isDeleteOpen = false" @confirm="deleteTerm" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { socialWelfareService } from '@/components/api/user/SocialWelfareService'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'
import type { PaymentTerm } from '@/types/contract'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()

const breadcrumbLinks = [
    { name: 'socialWelfare.paymentTerms.title', translate: true, href: '/settings/payment-terms' },
]

const blank = () => ({
    days: '' as any,
    label: '',
    sort_order: '' as any,
    is_active: true,
})

const state = reactive({
    terms: [] as PaymentTerm[],
    error: {} as Error,
    formError: {} as Error,
    isLoading: false,
    isSaving: false,
    isModalOpen: false,
    isDeleteOpen: false,
    selected: null as PaymentTerm | null,
    form: blank(),
})

onMounted(() => {
    if (userStore.getUser?.company?.industry?.system_name !== 'social_welfare') {
        navigateTo('/settings/expense-categories')

        return
    }

    fetchTerms()
})

async function fetchTerms() {
    state.error = {} as Error
    state.isLoading = true
    try {
        const response = await socialWelfareService.getPaymentTerms()
        state.terms = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function openModal(term: PaymentTerm | null) {
    state.selected = term
    state.formError = {} as Error
    state.form = term ? {
        days: term.days,
        label: term.label ?? '',
        sort_order: term.sort_order ?? '',
        is_active: term.is_active !== false,
    } : blank()
    state.isModalOpen = true
}

function confirmDelete(term: PaymentTerm) {
    state.selected = term
    state.isDeleteOpen = true
}

async function save() {
    state.formError = {} as Error
    state.isSaving = true
    try {
        const payload = {
            days: Number(state.form.days),
            label: state.form.label === '' ? null : state.form.label,
            sort_order: state.form.sort_order === '' ? null : Number(state.form.sort_order),
            is_active: state.form.is_active,
        }

        if (state.selected?.uuid) {
            await socialWelfareService.updatePaymentTerm(state.selected.uuid, payload)
        } else {
            await socialWelfareService.savePaymentTerm(payload)
        }

        successAlert(`${t('alert.success')}!`, t('socialWelfare.paymentTerms.saved'))
        state.isModalOpen = false
        fetchTerms()
    } catch (error: any) {
        state.formError = error
    }
    state.isSaving = false
}

async function deleteTerm() {
    state.isDeleteOpen = false
    state.error = {} as Error
    try {
        await socialWelfareService.deletePaymentTerm(state.selected!.uuid)
        successAlert(`${t('alert.success')}!`, t('socialWelfare.paymentTerms.deleted'))
        fetchTerms()
    } catch (error: any) {
        state.error = error
    }
}
</script>
