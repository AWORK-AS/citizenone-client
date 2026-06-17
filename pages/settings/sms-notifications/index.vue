<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('sms.settings.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('sms.settings.title') }}</template>

            <ModulesUserSettingsTab />

            <div class="mt-6 space-y-6 max-w-2xl">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <LoadingSpinner :isActive="state.isLoading">

                    <!-- Enable SMS toggle -->
                    <div class="bg-white rounded-lg border border-[#EAECF0] p-5">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-sm font-semibold text-[#1F2533]">
                                    {{ $t('sms.settings.enableSms') }}
                                </h3>
                                <p class="text-xs text-[#8891A4] mt-0.5">
                                    {{ $t('sms.settings.enableSmsHint') }}
                                </p>
                            </div>
                            <button type="button"
                                class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
                                :class="state.form.sms_enabled ? 'bg-[#205E77]' : 'bg-[#D1D5DB]'"
                                @click="state.form.sms_enabled = !state.form.sms_enabled">
                                <span
                                    class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                                    :class="state.form.sms_enabled ? 'translate-x-4' : 'translate-x-1'" />
                            </button>
                        </div>
                    </div>

                    <!-- Gateway configuration -->
                    <div v-if="state.form.sms_enabled"
                        class="bg-white rounded-lg border border-[#EAECF0] p-5 space-y-4 mt-4">
                        <div>
                            <h3 class="text-sm font-semibold text-[#1F2533]">
                                {{ $t('sms.settings.gatewayConfig') }}
                            </h3>
                            <p class="text-xs text-[#8891A4] mt-0.5">
                                {{ $t('sms.settings.gatewayConfigHint') }}
                            </p>
                        </div>
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="sender_name" :label="$t('sms.settings.senderName')" />
                                <FormTextField id="sender_name" name="sender_name"
                                    :placeholder="$t('sms.settings.senderNamePlaceholder')"
                                    v-model="state.form.sender_name" />
                                <p class="text-xs text-[#8891A4]">{{ $t('sms.settings.senderNameHint') }}</p>
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="azure_connection_string"
                                    :label="$t('sms.settings.azureConnectionString')" />
                                <FormPasswordField id="azure_connection_string" name="azure_connection_string"
                                    :placeholder="$t('sms.settings.azureConnectionStringPlaceholder')"
                                    v-model="state.form.azure_connection_string" />
                                <p class="text-xs text-[#8891A4]">{{ $t('sms.settings.azureConnectionStringHint') }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Notification triggers -->
                    <div v-if="state.form.sms_enabled"
                        class="bg-white rounded-lg border border-[#EAECF0] p-5 space-y-4 mt-4">
                        <div>
                            <h3 class="text-sm font-semibold text-[#1F2533]">
                                {{ $t('sms.settings.notificationTriggers') }}
                            </h3>
                            <p class="text-xs text-[#8891A4] mt-0.5">{{ $t('sms.settings.notificationTriggersHint') }}
                            </p>
                        </div>
                        <div class="divide-y divide-[#EAECF0]">
                            <div class="flex items-center justify-between py-3">
                                <div>
                                    <p class="text-sm font-medium text-[#1F2533]">
                                        {{ $t('sms.settings.triggers.newAppointment') }}
                                    </p>
                                    <p class="text-xs text-[#8891A4]">
                                        {{ $t('sms.settings.triggers.newAppointmentHint') }}
                                    </p>
                                </div>
                                <button type="button"
                                    class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
                                    :class="state.form.notify_new_appointment ? 'bg-[#205E77]' : 'bg-[#D1D5DB]'"
                                    @click="state.form.notify_new_appointment = !state.form.notify_new_appointment">
                                    <span
                                        class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                                        :class="state.form.notify_new_appointment ? 'translate-x-4' : 'translate-x-1'" />
                                </button>
                            </div>
                            <div class="flex items-center justify-between py-3">
                                <div>
                                    <p class="text-sm font-medium text-[#1F2533]">
                                        {{ $t('sms.settings.triggers.reminder24h') }}
                                    </p>
                                    <p class="text-xs text-[#8891A4]">
                                        {{ $t('sms.settings.triggers.reminder24hHint') }}
                                    </p>
                                </div>
                                <button type="button"
                                    class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
                                    :class="state.form.notify_reminder_24h ? 'bg-[#205E77]' : 'bg-[#D1D5DB]'"
                                    @click="state.form.notify_reminder_24h = !state.form.notify_reminder_24h">
                                    <span
                                        class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                                        :class="state.form.notify_reminder_24h ? 'translate-x-4' : 'translate-x-1'" />
                                </button>
                            </div>
                            <div class="flex items-center justify-between py-3">
                                <div>
                                    <p class="text-sm font-medium text-[#1F2533]">
                                        {{ $t('sms.settings.triggers.reminderSameDay') }}
                                    </p>
                                    <p class="text-xs text-[#8891A4]">
                                        {{ $t('sms.settings.triggers.reminderSameDayHint') }}
                                    </p>
                                </div>
                                <button type="button"
                                    class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
                                    :class="state.form.notify_reminder_same_day ? 'bg-[#205E77]' : 'bg-[#D1D5DB]'"
                                    @click="state.form.notify_reminder_same_day = !state.form.notify_reminder_same_day">
                                    <span
                                        class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                                        :class="state.form.notify_reminder_same_day ? 'translate-x-4' : 'translate-x-1'" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Save -->
                    <div class="flex justify-end mt-4">
                        <FormButton buttonStyle="primary" @click="saveSettings" :disabled="state.isSaving">
                            <Icon name="ph:floppy-disk" class="h-4 w-4" />
                            {{ state.isSaving ? $t('saving') : $t('save') }}
                        </FormButton>
                    </div>

                </LoadingSpinner>
            </div>

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { smsService } from '@/components/api/user/SmsService'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore()

const breadcrumbLinks = [
    { name: 'sms.settings.title', translate: true, href: '/settings/sms-notifications' },
]

const state = reactive({
    error: {} as Error,
    isLoading: false,
    isSaving: false,
    form: {
        sms_enabled: false,
        sender_name: 'CitizenOne',
        azure_connection_string: '',
        notify_new_appointment: true,
        notify_reminder_24h: true,
        notify_reminder_same_day: true,
    },
})

onMounted(() => {
    if (userStore.getUser?.company?.industry?.system_name !== 'employment_services') {
        navigateTo('/settings/profile')
        return
    }
    fetchSettings()
})

async function fetchSettings() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await smsService.getSettings()
        if (response?.data) {
            state.form = {
                sms_enabled: response.data.sms_enabled ?? false,
                sender_name: response.data.sender_name ?? 'CitizenOne',
                azure_connection_string: response.data.azure_connection_string ?? '',
                notify_new_appointment: response.data.notify_new_appointment ?? true,
                notify_reminder_24h: response.data.notify_reminder_24h ?? true,
                notify_reminder_same_day: response.data.notify_reminder_same_day ?? true,
            }
        }
    } catch { /* not configured yet — use defaults */ }
    state.isLoading = false
}

async function saveSettings() {
    state.error = {}
    state.isSaving = true
    try {
        const response = await smsService.updateSettings(state.form)
        if (response?.data || response?.message) {
            successAlert(`${t('alert.success')}!`, `${t('sms.settings.alert.settingsSaved')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}
</script>
