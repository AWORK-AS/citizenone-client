<template>
    <!-- Single sign-on: the company's own Microsoft Entra tenant. Only logins
         from that tenant are accepted, which is what makes it safe. -->
    <div class="mt-8 card">
        <div class="card-header">
            <h3 class="text-sm font-semibold text-slate-900">{{ $t('companySso.title') }}</h3>
        </div>
        <div class="card-body">
            <p class="text-sm text-slate-500 mb-4">{{ $t('companySso.description') }}</p>
            <!-- SSO is an app in the store (free, needs Pro). Without it the save
                 is refused, so point to the app instead of offering the form. -->
            <div v-if="!state.appActive" class="flex flex-wrap items-center gap-3">
                <p class="text-sm text-slate-600">{{ $t('companySso.needsApp') }}</p>
                <Tooltip :text="$t('companySso.openAppHint')" wrap>
                    <FormButton type="button" buttonStyle="primary" :aria-label="$t('companySso.openAppHint')"
                        @click="navigateTo('/apps/microsoft-sso')">{{ $t('companySso.openApp') }}</FormButton>
                </Tooltip>
            </div>
            <template v-else>
            <p v-if="!state.available" class="mb-4 text-xs text-amber-700">{{ $t('companySso.unavailable') }}</p>
            <div class="space-y-1">
                <FormLabel for="sso_tenant_id" :label="$t('companySso.tenantId')" />
                <FormTextField id="sso_tenant_id" name="sso_tenant_id" v-model="state.tenantId"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                <p class="text-[11px] text-slate-400">{{ $t('companySso.tenantHint') }}</p>
                <FormError :error="state.errors?.tenant_id?.[0]" />
            </div>
            <div class="mt-5 flex items-center gap-2">
                <Tooltip :text="$t('companySso.saveHint')">
                    <FormButton type="button" buttonStyle="primary" @click="save">{{ $t('save') }}</FormButton>
                </Tooltip>
                <span v-if="state.saved" class="text-xs text-[#177a53]">{{ $t('companySso.saved') }}</span>
            </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { companySsoService } from '@/components/api/user/CompanySsoService'

const state = reactive({
    tenantId: '',
    available: true,
    appActive: true,
    saved: false,
    errors: {} as Record<string, string[]>,
})

async function load() {
    try {
        const response = await companySsoService.getSettings()
        state.tenantId = response?.data?.tenant_id ?? ''
        state.available = !!response?.data?.available
        state.appActive = response?.data?.app_active !== false
    } catch (_) {
        // Not shown to anyone who cannot read it.
    }
}

async function save() {
    state.errors = {}
    state.saved = false
    try {
        const response = await companySsoService.saveTenant(state.tenantId.trim() || null)
        state.tenantId = response?.data?.tenant_id ?? ''
        state.saved = true
    } catch (error: any) {
        state.errors = error?.errors ?? { tenant_id: [error?.message] }
    }
}

onMounted(load)
</script>
