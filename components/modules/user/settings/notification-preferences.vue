<template>
    <section class="mt-10 max-w-3xl" id="notificationPreferences">
        <div class="mb-3">
            <h3 class="text-sm font-semibold text-gray-900">{{ $t('notificationPreferences.title') }}</h3>
            <p class="text-xs text-gray-500 mt-0.5">{{ $t('notificationPreferences.subtitle') }}</p>
        </div>

        <Alert type="danger" :text="state.error.message" v-if="state.error?.message" />

        <LoadingSpinner :isActive="state.isLoading">
            <div v-if="state.loadFailed" class="py-6 text-center">
                <p class="text-xs text-gray-500">{{ $t('notificationPreferences.loadError') }}</p>
                <FormButton buttonStyle="secondary" class="mx-auto mt-3" @click="fetchPreferences()">
                    {{ $t('notificationPreferences.retry') }}
                </FormButton>
            </div>

            <template v-else-if="state.categories.length > 0">
                <p v-if="!emailMasterOn || !systemMasterOn" class="mb-2 text-xs text-gray-500">
                    {{ $t('notificationPreferences.masterOffHint') }}
                </p>
                <div class="border border-gray-200 rounded-lg divide-y divide-gray-100 bg-white">
                    <div
                        class="hidden md:grid md:grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_11rem] gap-x-3 px-4 py-2 bg-gray-50 rounded-t-lg text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        <span />
                        <span class="text-center">{{ $t('notificationPreferences.push') }}</span>
                        <span class="text-center">{{ $t('notificationPreferences.email') }}</span>
                        <span>{{ $t('notificationPreferences.frequency') }}</span>
                    </div>
                    <div v-for="category in state.categories" :key="category.key"
                        class="grid grid-cols-2 md:grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_11rem] gap-x-3 gap-y-3 px-4 py-3 items-center">
                        <div class="col-span-2 md:col-span-1 min-w-0">
                            <div class="flex items-center gap-x-2 flex-wrap">
                                <p class="text-sm font-medium text-gray-900">{{ category.label }}</p>
                                <span v-if="category.locked || category.mandatory"
                                    class="px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px] font-semibold text-gray-600">
                                    {{ $t('notificationPreferences.required') }}
                                </span>
                            </div>
                            <p v-if="category.description" class="text-xs text-gray-500 mt-0.5">
                                {{ category.description }}
                            </p>
                        </div>

                        <div class="flex md:flex-col items-center md:justify-center gap-x-2 gap-y-1">
                            <span class="md:hidden text-xs text-gray-500">{{ $t('notificationPreferences.push') }}</span>
                            <FormSwitch v-if="category.has_push"
                                :label="`${category.label} - ${$t('notificationPreferences.push')}`"
                                :value="isLocked(category) ? true : category.push_enabled"
                                :disabled="isLocked(category) || !systemMasterOn"
                                @toggleSwitch="category.push_enabled = !category.push_enabled" />
                        </div>

                        <div class="flex md:flex-col items-center md:justify-center gap-x-2 gap-y-1">
                            <span class="md:hidden text-xs text-gray-500">{{ $t('notificationPreferences.email') }}</span>
                            <FormSwitch v-if="category.has_email"
                                :label="`${category.label} - ${$t('notificationPreferences.email')}`"
                                :value="isLocked(category) ? true : category.email_enabled"
                                :disabled="isLocked(category) || !emailMasterOn"
                                @toggleSwitch="category.email_enabled = !category.email_enabled" />
                        </div>

                        <div class="col-span-2 md:col-span-1">
                            <FormSelect v-if="category.supports_digest" :options="frequencyOptions"
                                :searchable="false" :canClear="false" :canDeselect="false" appendToBody
                                v-model="category.frequency" />
                        </div>
                    </div>
                </div>
                <div class="mt-4">
                    <FormButton buttonStyle="primary" class="w-full" :disabled="state.isSaving" @click="save()">
                        {{ $t('notificationPreferences.save') }}
                    </FormButton>
                </div>
            </template>
        </LoadingSpinner>
    </section>
</template>

<script setup lang="ts">
import { notificationPreferenceService } from '@/components/api/user/NotificationPreferenceService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

// The profile form owns the two master switches; when it passes their live
// values the per-type switches follow them before the master is even saved.
// Without them (undefined) the values returned by the API are used.
const props = defineProps({
    emailMasterEnabled: {
        type: Boolean,
        required: false,
        default: undefined,
    },
    systemMasterEnabled: {
        type: Boolean,
        required: false,
        default: undefined,
    },
})

const { t } = useI18n()
const { successAlert } = useAlert()

const state = reactive({
    error: {} as Error,
    isLoading: false,
    isSaving: false,
    loadFailed: false,
    master: {
        email_notifications_enabled: true,
        system_notifications_enabled: true,
    },
    categories: [] as any[],
})

const emailMasterOn = computed(() => props.emailMasterEnabled ?? state.master.email_notifications_enabled)
const systemMasterOn = computed(() => props.systemMasterEnabled ?? state.master.system_notifications_enabled)

const frequencyOptions = computed(() => [
    { value: 'instant', label: t('notificationPreferences.instant') },
    { value: 'hourly', label: t('notificationPreferences.hourly') },
    { value: 'daily', label: t('notificationPreferences.daily') },
])

function isLocked(category: any): boolean {
    return !!(category.locked || category.mandatory)
}

function applyResponse(data: any) {
    state.master = {
        email_notifications_enabled: data?.master?.email_notifications_enabled ?? true,
        system_notifications_enabled: data?.master?.system_notifications_enabled ?? true,
    }
    state.categories = (data?.categories ?? []).map((category: any) => ({
        ...category,
        frequency: category.frequency ?? 'instant',
    }))
}

async function fetchPreferences() {
    state.error = {} as Error
    state.loadFailed = false
    state.isLoading = true
    try {
        const response = await notificationPreferenceService.get()
        applyResponse(response?.data)
    } catch (error: any) {
        state.loadFailed = true
    }
    state.isLoading = false
}

async function save() {
    state.error = {} as Error
    state.isSaving = true
    try {
        const preferences = state.categories.map((category: any) => ({
            category: category.key,
            push_enabled: isLocked(category) ? true : !!category.push_enabled,
            email_enabled: isLocked(category) && category.has_email ? true : !!category.email_enabled,
            frequency: category.frequency ?? 'instant',
        }))
        const response = await notificationPreferenceService.update(preferences)
        if (response?.data) {
            applyResponse(response.data)
        }
        successAlert(`${t('alert.success')}!`, `${t('notificationPreferences.saved')}.`)
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

onMounted(() => {
    fetchPreferences()
})
</script>
