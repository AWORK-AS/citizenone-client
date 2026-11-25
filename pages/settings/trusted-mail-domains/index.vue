<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('trustedMailDomains.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('trustedMailDomains.title') }}</template>

            <div class="mt-8 space-y-6 max-w-3xl">
                <p class="text-sm text-gray-600">{{ $t('trustedMailDomains.intro') }}</p>

                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <form class="space-y-4 rounded-lg bg-white p-5 shadow-sm" @submit.prevent="addDomain">
                    <div class="space-y-1">
                        <FormLabel for="domain" :label="$t('trustedMailDomains.domain')" />
                        <FormTextField id="domain" name="domain" :placeholder="$t('trustedMailDomains.domainPlaceholder')"
                            v-model="state.form.domain" />
                        <FormError :error="state?.error?.errors?.domain?.[0]" />
                    </div>
                    <label class="flex items-start gap-x-2 text-sm text-gray-700 cursor-pointer">
                        <input id="forced_tls_confirmed" type="checkbox" v-model="state.form.forced_tls_confirmed"
                            class="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <span>{{ $t('trustedMailDomains.confirmForcedTls') }}</span>
                    </label>
                    <FormError :error="state?.error?.errors?.forced_tls_confirmed?.[0]" />
                    <div class="flex justify-end">
                        <FormButton type="submit" buttonStyle="primary"
                            :disabled="!state.form.domain || !state.form.forced_tls_confirmed || state.isSaving">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('trustedMailDomains.add') }}
                        </FormButton>
                    </div>
                </form>

                <div class="rounded-lg bg-white shadow-sm divide-y divide-gray-100">
                    <p v-if="state.isLoading" class="p-5 text-sm text-gray-500">{{ $t('trustedMailDomains.loading') }}</p>
                    <p v-else-if="state.domains.length === 0" class="p-5 text-sm text-gray-500">
                        {{ $t('trustedMailDomains.empty') }}
                    </p>
                    <div v-for="item in state.domains" :key="item.uuid"
                        class="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p class="font-medium">{{ item.domain }}</p>
                            <p class="text-xs text-gray-500">
                                {{ $t('trustedMailDomains.confirmedBy', {
                                    name: item.confirmed_by || '-',
                                    date: item.forced_tls_confirmed_at ? new Date(item.forced_tls_confirmed_at).toLocaleDateString() : '-',
                                }) }}
                            </p>
                        </div>
                        <FormButton type="button" buttonStyle="danger" @click="confirmDelete(item)">
                            <Icon name="ph:trash" class="size-4" />
                            {{ $t('trustedMailDomains.remove') }}
                        </FormButton>
                    </div>
                </div>
            </div>

            <DialogConfirmation :isModalOpen="state.isDeleteOpen"
                :message="$t('trustedMailDomains.confirmRemove', { domain: state.selected?.domain })"
                @close="state.isDeleteOpen = false" @confirm="deleteDomain" />

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { trustedMailDomainService } from '@/components/api/user/TrustedMailDomainService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

// Admins only; the API refuses everyone else too.
definePageMeta({ middleware: 'require-admin' })

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const { successAlert } = useAlert()

const breadcrumbLinks = [
    { name: 'settings.tabs.company', translate: true, href: '/settings/company' },
    { name: 'trustedMailDomains.title', translate: true, href: '/settings/trusted-mail-domains' },
]

const state = reactive({
    domains: [] as any[],
    error: {} as Error,
    form: {
        domain: '',
        forced_tls_confirmed: false,
    },
    isDeleteOpen: false,
    isLoading: false,
    isSaving: false,
    selected: null as any,
})

onMounted(() => {
    fetchAll()
})

async function fetchAll() {
    state.isLoading = true
    try {
        const response = await trustedMailDomainService.getAll()
        state.domains = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function addDomain() {
    state.error = {}
    state.isSaving = true
    try {
        await trustedMailDomainService.create({ ...state.form })
        state.form.domain = ''
        state.form.forced_tls_confirmed = false
        successAlert(`${t('alert.success')}!`, `${t('trustedMailDomains.added')}.`)
        await fetchAll()
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

function confirmDelete(item: any) {
    state.selected = item
    state.isDeleteOpen = true
}

async function deleteDomain() {
    state.isDeleteOpen = false
    state.error = {}
    try {
        await trustedMailDomainService.delete(state.selected.uuid)
        successAlert(`${t('alert.success')}!`, `${t('trustedMailDomains.removed')}.`)
        await fetchAll()
    } catch (error: any) {
        state.error = error
    }
}
</script>
