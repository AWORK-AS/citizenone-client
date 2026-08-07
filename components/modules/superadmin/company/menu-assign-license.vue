<template>
    <SuperadminTableButton :title="$t('superadmin.grantLicense.assignToggle')" @click="open">
        <Icon name="ph:user-plus" class="w-3.5 h-3.5" />
    </SuperadminTableButton>

    <Modal size="xs" :title="$t('superadmin.grantLicense.assignLicenseMenuTitle')" :show="state.isOpen"
        @close="state.isOpen = false">
        <template #modal-body>
            <div class="space-y-1 -mx-2">
                <div v-if="state.isLoading" class="flex justify-center py-6">
                    <Icon name="ph:spinner" class="w-5 h-5 text-[#42AED9] animate-spin" />
                </div>
                <p v-else-if="!state.apps.length" class="px-2 py-3 text-[13px] text-[#8891A4]">
                    {{ $t('superadmin.grantLicense.noAssignableApps') }}
                </p>
                <button v-for="app in state.apps" :key="app.application_uuid" type="button"
                    :disabled="state.assigningUuid === app.application_uuid"
                    class="group flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-[13px] text-left text-[#1F2533] hover:bg-[#F5F6F8] disabled:opacity-50 transition-colors"
                    @click="assign(app)">
                    <span>{{ app.name }}</span>
                    <span class="text-[11px] text-[#8891A4]">
                        {{ $t('superadmin.grantLicense.availableSeats', { available: app.available }) }}
                    </span>
                </button>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { licenseService } from '@/components/api/superadmin/LicenseService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    companyUuid: {
        type: String,
        required: true,
    },
    userUuid: {
        type: String,
        required: true,
    },
})

const emit = defineEmits(['assigned'])

const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    isOpen: false,
    apps: [] as any[],
    isLoading: false,
    assigningUuid: '' as string,
})

function open() {
    state.isOpen = true
    fetchAssignableApps()
}

async function fetchAssignableApps() {
    state.isLoading = true
    try {
        const response = await licenseService.getAssignableAppsForUser(props.companyUuid, props.userUuid)
        state.apps = response?.data ?? []
    } catch (_) {
        state.apps = []
    }
    state.isLoading = false
}

async function assign(app: any) {
    state.assigningUuid = app.application_uuid
    try {
        await licenseService.grantApplicationLicense(props.companyUuid, {
            application_uuid: app.application_uuid,
            quantity: 0,
            assign_to_user_uuid: props.userUuid,
        })
        successAlert(`${t('alert.success')}!`, `${t('superadmin.grantLicense.successBody')}`)
        state.apps = state.apps.filter((a) => a.application_uuid !== app.application_uuid)
        emit('assigned')
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('superadmin.grantLicense.errorGeneric'))
    }
    state.assigningUuid = ''
}
</script>
