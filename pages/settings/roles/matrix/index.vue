<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('roles.matrix.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('roles.matrix.title') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/roles">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>

            <div class="mt-6 space-y-4">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 space-y-1">
                    <p>{{ $t('roles.matrix.note') }}</p>
                    <p>{{ $t('roles.matrix.fullAccessNote') }}</p>
                </div>

                <div class="flex items-center justify-between flex-wrap gap-2">
                    <div class="relative max-w-xs flex-1 min-w-[12rem]">
                        <Icon name="ph:magnifying-glass"
                            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                            aria-hidden="true" />
                        <input v-model="search" type="text" :placeholder="$t('search') + '…'"
                            class="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm focus:border-primary focus:outline-none" />
                    </div>
                    <div class="flex items-center gap-2">
                        <FormButton type="button" buttonStyle="secondary" @click="downloadCsv"
                            :disabled="state.isLoading || !fullMatrix.roles.length">
                            <Icon name="ph:file-csv" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('roles.matrix.exportCsv') }}
                        </FormButton>
                        <FormButton type="button" buttonStyle="secondary"
                            @click="navigateTo('/settings/roles/matrix/print')"
                            :disabled="state.isLoading || !fullMatrix.roles.length">
                            <Icon name="ph:printer" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('roles.matrix.printPdf') }}
                        </FormButton>
                    </div>
                </div>

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="matrix.roles.length"
                        class="overflow-auto max-h-[75vh] rounded-xl border border-slate-200 bg-white">
                        <ModulesUserRolePermissionMatrixTable :matrix="matrix" :roleLabels="roleLabels" />
                    </div>
                    <p v-if="search && matrix.roles.length && !matrix.groups.length && !matrix.pages.rows.length"
                        class="mt-3 text-sm text-slate-400">
                        {{ $t('roles.form.noPermissionsMatch', { search }) }}
                    </p>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { usePermissionMatrix } from '@/composables/usePermissionMatrix'

const runtimeConfig = useRuntimeConfig()
const breadcrumbLinks = [
    {
        name: 'roles.roles',
        translate: true,
        href: '/settings/roles',
    },
    {
        name: 'roles.matrix.title',
        translate: true,
        href: '/settings/roles/matrix',
    },
]

const { state, search, load, matrix, fullMatrix, roleLabel, downloadCsv } = usePermissionMatrix()
const roleLabels = computed(() => matrix.value.roles.map(roleLabel))

// Fetched on every visit, so a role changed in its edit form shows here straight away.
onMounted(() => {
    load()
})
</script>
