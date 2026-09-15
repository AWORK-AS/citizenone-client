<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employmentOptions.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                {{ $t('employmentOptions.title') }}
                <p class="text-sm font-normal text-gray-900">{{ $t('employmentOptions.subtitle') }}</p>
            </template>

            <!-- The catalog rail floats left and positions the page beside it with
                 `.catalog-shell + .mt-8`, so this wrapper has to be its immediate
                 sibling or the content lands on top of the rail. -->
            <div class="mt-8">
                <LoadingSpinner :isActive="state.isPageLoading">
                <div class="space-y-6 max-w-3xl">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <section v-for="type in types" :key="type"
                        class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8 space-y-4">
                        <div>
                            <h2 class="text-base font-semibold text-gray-900">{{ $t(`employmentOptions.${type}.title`) }}</h2>
                            <p class="text-xs text-gray-500 mt-1">{{ $t(`employmentOptions.${type}.description`) }}</p>
                        </div>

                        <ul class="divide-y divide-gray-100">
                            <li v-for="option in state.options[type]" :key="option.value"
                                class="flex items-center gap-3 py-2">
                                <template v-if="option.is_system">
                                    <span class="flex-1 text-sm text-gray-900">{{ systemLabel(option.value) }}</span>
                                    <span class="text-xxs rounded-full bg-gray-100 px-2 py-0.5 text-gray-500">
                                        {{ $t('employmentOptions.builtIn') }}
                                    </span>
                                </template>
                                <template v-else>
                                    <FormTextField :id="`label-${option.uuid}`" :name="`label-${option.uuid}`"
                                        class="flex-1" v-model="state.labels[option.uuid]" />
                                    <button type="button" class="text-sm text-primary underline underline-offset-2"
                                        :disabled="state.isSaving" @click="rename(option)">
                                        {{ $t('save') }}
                                    </button>
                                    <button type="button" class="text-sm text-red-700 underline underline-offset-2"
                                        :disabled="state.isSaving" @click="remove(option)">
                                        {{ $t('delete') }}
                                    </button>
                                </template>
                            </li>
                        </ul>

                        <div class="flex items-end gap-3 border-t border-gray-100 pt-4">
                            <div class="flex-1 space-y-1">
                                <FormLabel :for="`new-${type}`" :label="$t('employmentOptions.newOption')" />
                                <FormTextField :id="`new-${type}`" :name="`new-${type}`"
                                    v-model="state.newLabel[type]" />
                            </div>
                            <FormButton type="button" buttonStyle="action" :disabled="state.isSaving"
                                @click="add(type)">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('employmentOptions.add') }}
                            </FormButton>
                        </div>
                    </section>
                </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employmentOptionService } from '@/components/api/user/EmploymentOptionService'
import { useAlert } from '@/composables/alert'
import { usePermissions } from '@/composables/usePermissions'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { isAtLeast } = usePermissions()
const { t } = useI18n()

const types = ['working_hours', 'employment_status'] as const

// The built-in options carry no label from the API on purpose: they are
// translated, and storing one language server-side would pin them to it.
const SYSTEM_OPTION_LABELS: Record<string, string> = {
    full_time: 'employees.workingHours.fulltime',
    part_time: 'employees.workingHours.parttime',
    permanent: 'employees.employmentStatus.permanent',
    temporary: 'employees.employmentStatus.temporary',
    substitute: 'employees.employmentStatus.substitute',
}

const breadcrumbLinks = [
    { name: 'settings.settings', translate: true, href: '/settings/company' },
    { name: 'employmentOptions.title', translate: true, href: '/settings/employment-options' },
]

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    isSaving: false,
    options: { working_hours: [] as any[], employment_status: [] as any[] } as Record<string, any[]>,
    labels: {} as Record<string, string>,
    newLabel: { working_hours: '', employment_status: '' } as Record<string, string>,
})

function systemLabel(value: string) {
    return SYSTEM_OPTION_LABELS[value] ? t(SYSTEM_OPTION_LABELS[value]) : value
}

function applyResponse(response: any) {
    const data = response?.data
    if (!data) return

    state.options = data
    state.labels = {}
    for (const type of types) {
        for (const option of data[type] ?? []) {
            if (option.uuid) state.labels[option.uuid] = option.label
        }
    }
}

async function load() {
    state.error = {}
    state.isPageLoading = true
    try {
        applyResponse(await employmentOptionService.getOptions())
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function add(type: string) {
    const label = (state.newLabel[type] ?? '').trim()
    if (!label) return

    state.error = {}
    state.isSaving = true
    try {
        applyResponse(await employmentOptionService.createOption({ type, label }))
        state.newLabel[type] = ''
        successAlert(`${t('alert.success')}!`, `${t('employmentOptions.alert.added')}.`)
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

async function rename(option: any) {
    const label = (state.labels[option.uuid] ?? '').trim()
    if (!label) return

    state.error = {}
    state.isSaving = true
    try {
        applyResponse(await employmentOptionService.updateOption(option.uuid, { label }))
        successAlert(`${t('alert.success')}!`, `${t('employmentOptions.alert.updated')}.`)
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

async function remove(option: any) {
    state.error = {}
    state.isSaving = true
    try {
        applyResponse(await employmentOptionService.deleteOption(option.uuid))
        successAlert(`${t('alert.success')}!`, `${t('employmentOptions.alert.deleted')}.`)
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

onMounted(() => {
    if (!isAtLeast('Admin')) {
        navigateTo('/settings/company')
        return
    }

    load()
})
</script>
