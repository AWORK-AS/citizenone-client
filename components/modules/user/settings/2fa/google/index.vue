<template>
    <div>
        <div class="space-y-1 flex items-center gap-x-2">
            <FormSwitch :value="state.form2fa.google_2fa" @toggleSwitch="state.modal.isVerify2faOpen = true" />
            <p>
                {{ $t('settings.2fa.google2FactorAuthentication') }}
            </p>
        </div>
        <ModulesUserSettings2faGoogleModalVerify :isModalOpen="state.modal.isVerify2faOpen" :google2fa="state.form2fa"
            @close="state.modal.isVerify2faOpen = false" @setGoogle2faStatus="setGoogle2faStatus" />
    </div>
</template>

<script setup lang="ts">
import type { Error } from '@/types'

const state = reactive({
    error: {} as Error,
    form2fa: {
        google_2fa: false,
    },
    modal: {
        isVerify2faOpen: false,
    },
})

function setGoogle2faStatus(status: boolean) {
    state.form2fa.google_2fa = status
}
</script>